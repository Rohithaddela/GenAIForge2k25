"""
LLM Service — Google Gemini (primary) with template fallback.
Generates screenplay, shot design, and sound design from a story premise.
"""
import json
import logging
import re
from typing import Tuple, Dict, Any

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

SYSTEM_PROMPT = """You are CineForge AI, an expert cinematic pre-production assistant.
Given a story premise, generate a complete production package in valid JSON with this exact structure:

{
  "screenplay": "<Full screenplay in standard format: INT/EXT., action lines, dialogue>",
  "shot_design": [
    {
      "id": "scene-01",
      "scene_title": "Scene title",
      "shots": [
        {
          "number": 1,
          "description": "Shot description",
          "camera_angle": "e.g. Low Angle / Eye Level / Bird's Eye",
          "movement": "e.g. Static / Dolly In / Pan Right",
          "lighting": "e.g. Natural Golden Hour / High Key / Chiaroscuro",
          "lens": "e.g. 24mm Wide / 85mm Portrait / 400mm Telephoto",
          "emotional_tone": "e.g. Tense / Hopeful / Melancholic",
          "duration": "e.g. 4 seconds",
          "notes": "Optional director note"
        }
      ]
    }
  ],
  "sound_design": [
    {
      "scene_id": "scene-01",
      "scene_title": "Scene title",
      "time_of_day": "Dawn / Morning / Afternoon / Dusk / Night",
      "music": {
        "track": "Track title",
        "description": "Emotional purpose of the music",
        "tempo": "e.g. Andante 72bpm",
        "key": "e.g. D Minor",
        "mood": "e.g. Ominous",
        "instrumentation": "e.g. String quartet, sparse piano"
      },
      "ambient": ["ambient sound 1", "ambient sound 2"],
      "foley": ["foley element 1", "foley element 2"],
      "mixing_notes": "Mixing direction for this scene",
      "dialogue": {
        "treatment": "e.g. Close-mic, intimate",
        "notes": "Any additional dialogue audio notes"
      }
    }
  ]
}

Return ONLY the JSON. No markdown code fences. No explanation."""


def build_user_prompt(story: str) -> str:
    return f"Story premise:\n\n{story}\n\nGenerate the full production package:"


async def _call_gemini(story: str) -> Dict[str, Any]:
    """Call Gemini API using google-generativeai SDK."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model)
        prompt = f"{SYSTEM_PROMPT}\n\n{build_user_prompt(story)}"
        import asyncio
        response = await asyncio.get_event_loop().run_in_executor(
            None, lambda: model.generate_content(prompt)
        )
        return _parse_json(response.text)
    except Exception as exc:
        logger.warning("Gemini genai SDK failed: %s. Trying REST API.", exc)
        # Fallback: use REST API directly
        return await _call_gemini_rest(story)


async def _call_gemini_rest(story: str) -> Dict[str, Any]:
    """Fallback: Call Gemini via REST API directly (no SDK issues)."""
    import aiohttp

    url = f"https://generativelanguage.googleapis.com/v1beta/{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
    payload = {
        "contents": [{
            "parts": [{
                "text": f"{SYSTEM_PROMPT}\n\n{build_user_prompt(story)}"
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 8192,
        }
    }

    timeout = aiohttp.ClientTimeout(total=120)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.post(url, json=payload) as resp:
            if resp.status != 200:
                text = await resp.text()
                raise RuntimeError(f"Gemini REST returned {resp.status}: {text[:300]}")
            data = await resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return _parse_json(text)


async def _call_huggingface(story: str) -> Dict[str, Any]:
    """Call HuggingFace Inference API."""
    import aiohttp

    url = f"https://api-inference.huggingface.co/models/{settings.hf_model}"
    headers = {
        "Authorization": f"Bearer {settings.hf_api_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": f"<s>[INST]\n{SYSTEM_PROMPT}\n\n{build_user_prompt(story)}\n[/INST]",
        "parameters": {
            "max_new_tokens": 4096,
            "temperature": 0.7,
            "return_full_text": False,
        },
    }
    timeout = aiohttp.ClientTimeout(total=settings.hf_timeout)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.post(url, headers=headers, json=payload) as resp:
            if resp.status != 200:
                text = await resp.text()
                raise RuntimeError(f"HuggingFace returned {resp.status}: {text[:200]}")
            data = await resp.json()
            raw = data[0]["generated_text"] if isinstance(data, list) else data.get("generated_text", "")
            return _parse_json(raw)


def _generate_template(story: str) -> Dict[str, Any]:
    """Generate a template production package from the story premise (no LLM needed)."""
    # Extract a few sentences for the screenplay
    sentences = [s.strip() for s in story.split('.') if s.strip()]
    title = sentences[0][:60] if sentences else "Untitled"

    screenplay = f"""FADE IN:

INT. UNKNOWN LOCATION — NIGHT

{story}

The camera slowly pans across the room, revealing the world described above.

CHARACTER
(with determination)
This is where it all begins.

The tension builds as the story unfolds...

SMASH CUT TO:

EXT. OPEN LANDSCAPE — DAY

The world opens up before us. Every detail matters.
Every moment counts.

CHARACTER (CONT'D)
We have to see this through.

FADE TO BLACK.

THE END"""

    return {
        "screenplay": screenplay,
        "shot_design": [
            {
                "id": "scene-01",
                "scene_title": "Opening — Establishing the World",
                "shots": [
                    {
                        "number": 1,
                        "description": "Wide establishing shot revealing the primary setting",
                        "camera_angle": "Bird's Eye",
                        "movement": "Slow Crane Down",
                        "lighting": "Low Key, Chiaroscuro",
                        "lens": "24mm Wide",
                        "emotional_tone": "Mysterious",
                        "duration": "6 seconds",
                        "notes": "Begin with darkness, slowly reveal the scene"
                    },
                    {
                        "number": 2,
                        "description": "Medium close-up of the protagonist's face, eyes searching",
                        "camera_angle": "Eye Level",
                        "movement": "Slow Push In",
                        "lighting": "Practical Lighting, warm tones",
                        "lens": "85mm Portrait",
                        "emotional_tone": "Contemplative",
                        "duration": "4 seconds",
                        "notes": "Capture the internal conflict"
                    },
                    {
                        "number": 3,
                        "description": "Over-the-shoulder shot revealing what the character sees",
                        "camera_angle": "Over the Shoulder",
                        "movement": "Static",
                        "lighting": "Natural, high contrast",
                        "lens": "50mm Standard",
                        "emotional_tone": "Tense",
                        "duration": "3 seconds",
                        "notes": "Moment of revelation"
                    },
                ]
            },
            {
                "id": "scene-02",
                "scene_title": "Rising Action — The Conflict Deepens",
                "shots": [
                    {
                        "number": 1,
                        "description": "Tracking shot following the character through the environment",
                        "camera_angle": "Low Angle",
                        "movement": "Steadicam Follow",
                        "lighting": "Harsh Overhead",
                        "lens": "35mm Standard",
                        "emotional_tone": "Urgent",
                        "duration": "8 seconds",
                        "notes": "Convey urgency and purpose"
                    },
                    {
                        "number": 2,
                        "description": "Close-up of hands interacting with a key object",
                        "camera_angle": "High Angle",
                        "movement": "Static",
                        "lighting": "Focused Pool of Light",
                        "lens": "100mm Macro",
                        "emotional_tone": "Intimate",
                        "duration": "3 seconds",
                        "notes": "Detail shot — the tactile moment"
                    },
                ]
            },
        ],
        "sound_design": [
            {
                "scene_id": "scene-01",
                "scene_title": "Opening — Establishing the World",
                "time_of_day": "Night",
                "music": {
                    "track": "Into the Unknown",
                    "description": "A haunting, minimalist score that builds slowly with anticipation",
                    "tempo": "Adagio 60bpm",
                    "key": "D Minor",
                    "mood": "Ominous, Mysterious",
                    "instrumentation": "Solo cello, sparse piano, distant synth pads"
                },
                "ambient": [
                    "Distant wind howl, low frequency",
                    "Subtle room tone with faint mechanical hum",
                    "Occasional distant thunder"
                ],
                "foley": [
                    "Soft footsteps on concrete",
                    "Fabric rustling — character movement",
                    "Paper shuffling, close-mic"
                ],
                "mixing_notes": "Keep music at -18dB, ambient bed at -24dB. Let silence carry tension. Foley should feel hyper-real.",
                "dialogue": {
                    "treatment": "Close-mic, intimate with slight room reverb",
                    "notes": "Whispered delivery, maintain natural breath sounds"
                }
            },
            {
                "scene_id": "scene-02",
                "scene_title": "Rising Action — The Conflict Deepens",
                "time_of_day": "Day",
                "music": {
                    "track": "Breaking Through",
                    "description": "Driving percussion builds beneath soaring strings",
                    "tempo": "Allegro 132bpm",
                    "key": "E Minor",
                    "mood": "Determined, Urgent",
                    "instrumentation": "Full orchestra, taiko drums, electric bass"
                },
                "ambient": [
                    "Urban street noise — distant traffic, voices",
                    "Wind gusts between buildings"
                ],
                "foley": [
                    "Running footsteps — asphalt",
                    "Door slam — metallic reverb",
                    "Object impact — heavy, resonant"
                ],
                "mixing_notes": "Music swells to -12dB at peak. Ambient fades under action. Foley punchy and front-center.",
                "dialogue": {
                    "treatment": "Boom mic, slightly off-axis for movement scenes",
                    "notes": "ADR may be needed for running dialogue"
                }
            },
        ],
    }


def _parse_json(raw: str) -> Dict[str, Any]:
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
    raw = re.sub(r"\s*```$", "", raw.strip(), flags=re.MULTILINE)
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in LLM response.")
    return json.loads(match.group(0))


async def generate_production(story: str) -> Tuple[Dict[str, Any], str]:
    """
    Returns (result_dict, provider_name).
    Tries Gemini first; falls back to HuggingFace; ultimate fallback to template.
    """
    # Try Gemini first (more reliable)
    if settings.gemini_api_key:
        try:
            logger.info("Generating with Gemini (%s)…", settings.gemini_model)
            result = await _call_gemini(story)
            logger.info("Gemini generation succeeded.")
            return result, "gemini"
        except Exception as exc:
            logger.warning("Gemini failed: %s. Trying HuggingFace.", exc)

    # Try HuggingFace
    if settings.hf_api_token:
        try:
            logger.info("Generating with HuggingFace (%s)…", settings.hf_model)
            result = await _call_huggingface(story)
            logger.info("HuggingFace generation succeeded.")
            return result, "huggingface"
        except Exception as exc:
            logger.warning("HuggingFace also failed: %s", exc)

    # Ultimate fallback: template generation (always works)
    logger.warning("All LLM providers failed or not configured. Using template fallback.")
    result = _generate_template(story)
    return result, "template"


# ─── Script Editing ───────────────────────────────────────────────────────────

EDIT_PROMPTS = {
    "expand": "You are a screenwriting assistant. Take the following screenplay and EXPAND it — add more descriptive action lines, additional dialogue beats, sensory details, and character reactions. Make it at least 50% longer. Keep the same story and characters.\n\nReturn ONLY the expanded screenplay text, no JSON, no markdown fences.",
    "compress": "You are a screenwriting assistant. Take the following screenplay and COMPRESS it — keep only the essential dialogue and key action lines. Remove redundant descriptions, trim long passages, and tighten pacing. Make it about 50% shorter.\n\nReturn ONLY the compressed screenplay text, no JSON, no markdown fences.",
    "rewrite": "You are a screenwriting assistant. Take the following screenplay and REWRITE it — improve the dialogue to sound more natural, strengthen the action lines, vary the sentence structure, and enhance the dramatic impact. Keep the same story and characters.\n\nReturn ONLY the rewritten screenplay text, no JSON, no markdown fences.",
}

TONE_PROMPT = "You are a screenwriting assistant. Take the following screenplay and REWRITE it to match a {tone} tone — adjust the dialogue style, action descriptions, pacing, and atmosphere to strongly reflect the {tone} feeling throughout.\n\nReturn ONLY the modified screenplay text, no JSON, no markdown fences."


def _edit_script_locally(script: str, action: str, tone: str = "") -> str:
    """Local (no LLM) fallback for script editing."""
    lines = script.split('\n')

    if action == "expand":
        expanded = []
        for line in lines:
            expanded.append(line)
            stripped = line.strip()
            # Add beats after dialogue lines
            if stripped and not stripped.startswith(('INT.', 'EXT.', 'FADE', 'CUT', 'SMASH')):
                if stripped.isupper() and len(stripped) < 40:
                    # Character name — add a beat
                    expanded.append("(beat)")
                elif not stripped.startswith('(') and len(stripped) > 20:
                    # Action line — add detail
                    expanded.append("")
                    expanded.append(f"    The moment hangs in the air. Every detail becomes vivid—")
                    expanded.append(f"    the texture of the light, the subtle sounds, the weight of the silence.")
                    expanded.append("")
        return '\n'.join(expanded)

    elif action == "compress":
        compressed = []
        skip_next_empty = False
        for line in lines:
            stripped = line.strip()
            # Keep dialogue (uppercase character names + next line) and scene headings
            if stripped.startswith(('INT.', 'EXT.', 'FADE', 'CUT', 'SMASH')):
                compressed.append(line)
                skip_next_empty = False
            elif stripped.isupper() and len(stripped) < 40 and stripped:
                compressed.append(line)
                skip_next_empty = False
            elif stripped.startswith('(') and stripped.endswith(')'):
                # Keep parentheticals
                compressed.append(line)
                skip_next_empty = False
            elif not stripped:
                if not skip_next_empty:
                    compressed.append(line)
                    skip_next_empty = True
            else:
                # Keep short action lines, skip long descriptions
                if len(stripped) < 60:
                    compressed.append(line)
                skip_next_empty = False
        return '\n'.join(compressed)

    elif action == "rewrite":
        # Enhance existing lines with stronger language
        rewritten = []
        replacements = {
            'walks': 'strides', 'says': 'declares', 'looks': 'gazes',
            'goes': 'moves', 'sees': 'notices', 'gets': 'seizes',
            'runs': 'dashes', 'sits': 'settles', 'stands': 'rises',
            'slowly': 'deliberately', 'quickly': 'swiftly', 'very': 'profoundly',
            'big': 'immense', 'small': 'minute', 'old': 'weathered',
            'dark': 'shadowed', 'light': 'luminous', 'cold': 'frigid',
        }
        for line in lines:
            new_line = line
            for old, new in replacements.items():
                # Case-insensitive replacement preserving case
                import re as _re
                pattern = _re.compile(_re.escape(old), _re.IGNORECASE)
                new_line = pattern.sub(lambda m: new.capitalize() if m.group()[0].isupper() else new, new_line)
            rewritten.append(new_line)
        return '\n'.join(rewritten)

    elif action == "tone":
        # Add tone-specific stage directions
        tone_additions = {
            "Dramatic": ["The tension is palpable.", "A heavy silence falls.", "The stakes couldn't be higher."],
            "Melancholic": ["A sense of loss permeates the air.", "The light fades, like a dying memory.", "There's an ache that words can't capture."],
            "Tense": ["Every shadow feels like a threat.", "The silence is deafening.", "Time seems to slow to a crawl."],
            "Hopeful": ["A glimmer of light breaks through.", "There's a warmth that wasn't there before.", "Something shifts — possibility emerges."],
            "Dark": ["The darkness is almost tangible.", "Something unsettling lurks beneath the surface.", "The world feels hostile, unforgiving."],
            "Comedic": ["The timing is perfect — almost too perfect.", "A beat. Then the absurdity of it hits.", "There's an awkward pause that says everything."],
        }
        additions = tone_additions.get(tone, tone_additions["Dramatic"])
        result = []
        add_idx = 0
        for i, line in enumerate(lines):
            result.append(line)
            # Insert tone additions after scene headings
            stripped = line.strip()
            if stripped.startswith(('INT.', 'EXT.')):
                result.append("")
                result.append(f"    {additions[add_idx % len(additions)]}")
                result.append("")
                add_idx += 1
        return '\n'.join(result)

    return script


async def _call_llm_for_edit(prompt: str, script: str) -> str:
    """Call Gemini to edit the script. Returns the edited text."""
    full_prompt = f"{prompt}\n\n---\n\n{script}"

    # Try Gemini REST API
    if settings.gemini_api_key:
        import aiohttp
        url = f"https://generativelanguage.googleapis.com/v1beta/{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 8192},
        }
        timeout = aiohttp.ClientTimeout(total=60)
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as exc:
            logger.warning("Gemini edit call failed: %s", exc)

    return ""  # empty = use local fallback


async def edit_script(script: str, action: str, tone: str = "") -> str:
    """
    Edit a screenplay using AI or local fallback.
    action: 'expand' | 'compress' | 'rewrite' | 'tone'
    """
    if not script.strip():
        return script

    # Build the prompt
    if action == "tone" and tone:
        prompt = TONE_PROMPT.format(tone=tone)
    elif action in EDIT_PROMPTS:
        prompt = EDIT_PROMPTS[action]
    else:
        return script

    # Try LLM first
    try:
        result = await _call_llm_for_edit(prompt, script)
        if result and len(result) > 20:
            logger.info("Script %s via LLM succeeded.", action)
            # Clean markdown fences if present
            result = re.sub(r"^```(?:\w+)?\s*", "", result.strip(), flags=re.MULTILINE)
            result = re.sub(r"\s*```$", "", result.strip(), flags=re.MULTILINE)
            return result
    except Exception as exc:
        logger.warning("LLM script edit failed: %s", exc)

    # Fallback to local
    logger.info("Using local fallback for script %s.", action)
    return _edit_script_locally(script, action, tone)


# ── Storyboard Prompt Generation ──────────────────────────────

def _build_storyboard_prompt_local(shot: dict, scene_title: str = "") -> str:
    """Build an image generation prompt from shot metadata (no LLM)."""
    parts = ["cinematic storyboard panel, film production, detailed illustration"]
    if scene_title:
        parts.append(scene_title)
    if shot.get("description"):
        parts.append(shot["description"])
    if shot.get("type"):
        parts.append(f"{shot['type']} shot")
    if shot.get("camera_angle"):
        parts.append(f"{shot['camera_angle']} angle")
    if shot.get("lens"):
        parts.append(f"{shot['lens']} lens feel")
    if shot.get("emotional_tone"):
        parts.append(f"{shot['emotional_tone']} mood")
    if shot.get("movement"):
        parts.append(f"camera {shot['movement']}")
    parts.append("dramatic lighting, 16:9 aspect ratio, movie production art")
    return ", ".join(parts)


async def generate_storyboard_prompts(shot_design: list) -> list:
    """
    Take a shot_design list (scenes with shots) and return
    a flat list of { scene_title, shot_number, prompt, shot } objects.
    Uses Gemini to generate optimized prompts, falls back to local.
    """
    panels = []
    for scene in shot_design:
        scene_title = scene.get("scene_title", "")
        for shot in scene.get("shots", []):
            prompt = _build_storyboard_prompt_local(shot, scene_title)
            panels.append({
                "scene_id": scene.get("id", ""),
                "scene_title": scene_title,
                "shot_number": shot.get("number", 0),
                "shot": shot,
                "prompt": prompt,
            })
    return panels
