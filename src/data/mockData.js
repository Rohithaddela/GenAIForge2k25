export const mockScript = `FADE IN:

INT. DR. ELENA VOSS'S LAB - NIGHT

A cavernous underground facility bathed in blue fluorescent light. Banks of servers hum with synthetic life. Holographic data streams cascade from ceiling to floor like digital waterfalls.

DR. ELENA VOSS (40s, sharp eyes behind wire-frame glasses) paces in front of a massive display showing neural pathway maps.

                         ELENA
              We've crossed a threshold tonight
              that history will never forgive
              or forget.

Her assistant, MARCUS (late 20s, nervous energy), looks up from his workstation.

                         MARCUS
              The consciousness transfer is
              holding at ninety-three percent.
              But Doctor — is she... aware?

Elena approaches the central pod. Inside, suspended in cryogenic fluid, a figure floats — ARIA, the world's first synthetic consciousness.

Aria's eyes snap open. Electric blue.

                         ARIA (V.O.)
              (ethereal, distant)
              I remember... everything.
              Every choice. Every consequence.
              The weight of a thousand futures.

CUT TO:

INT. GOVERNMENT MONITORING STATION - SAME TIME

DIRECTOR HOLLOWAY (60s, military bearing) watches a red blip appear on a global map. He reaches for the phone.

                         HOLLOWAY
              Initiate Protocol NIGHTFALL.
              Authorization: Holloway-Seven-
              Alpha-Echo.

A dozen screens flicker to life simultaneously.

                         AGENT PRICE
              Sir — the signal is coming from
              within the Voss Institute itself.

                         HOLLOWAY
              Then God help us all.

SMASH CUT TO BLACK.

TITLE CARD: "ECHOES OF TOMORROW"

FADE IN:

EXT. CITY SKYLINE - DAWN

The world as we knew it — three months earlier. Towers of glass pierce a bruised sky as the sun wages war against the horizon.

INT. VOSS INSTITUTE - CONFERENCE ROOM - DAY

Elena stands before a board of skeptical investors. Her presentation glows behind her: "PROJECT ARIA: Synthetic Sentience Protocol."

                         ELENA
              What I'm proposing isn't
              artificial intelligence as you
              know it. We're talking about
              genuine consciousness. The
              philosophical hard problem —
              solved.

BOARD MEMBER 1
              (doubtful)
              Dr. Voss, we've heard these
              claims before—

                         ELENA
              Not from me.

She clicks to a new slide. A pulsing blue sphere — a consciousness mapped in real time.

                         ELENA (CONT'D)
              When Aria wakes up, she won't
              just process. She'll dream.
              She'll fear. She'll choose.

FADE TO:

INT. DR. ELENA VOSS'S LAB - EVENING

Marcus watches as Elena makes delicate adjustments to neural code, her fingers dancing across holographic interfaces.

                         MARCUS
              You never sleep anymore.

                         ELENA
              Neither does she.
              (beat)
              Not yet.

A long silence. The hum of servers fills the space between them.

                         MARCUS
              What if she doesn't want to
              be what we made her?

Elena pauses. For a fleeting moment, doubt crosses her face. Then it's gone.

                         ELENA
              Then she's already more human
              than any of us expected.

FADE TO BLACK.`

export const mockScenes = [
    {
        id: 'scene-1',
        number: 1,
        title: "Dr. Voss's Lab - Night",
        location: 'INT. DR. ELENA VOSS\'S LAB',
        timeOfDay: 'NIGHT',
        characters: ['Dr. Elena Voss', 'Marcus', 'Aria'],
        description: 'The consciousness transfer reaches critical threshold. Aria awakens.',
        duration: '4-5 min',
        mood: 'Tense, Awe-inspiring',
        status: 'Draft',
    },
    {
        id: 'scene-2',
        number: 2,
        title: 'Government Monitoring Station',
        location: 'INT. GOVERNMENT MONITORING STATION',
        timeOfDay: 'NIGHT',
        characters: ['Director Holloway', 'Agent Price'],
        description: 'Protocol Nightfall is initiated as the synthetic consciousness registers on global sensors.',
        duration: '2-3 min',
        mood: 'Ominous, Urgent',
        status: 'Draft',
    },
    {
        id: 'scene-3',
        number: 3,
        title: 'City Skyline - Dawn',
        location: 'EXT. CITY SKYLINE',
        timeOfDay: 'DAWN',
        characters: [],
        description: 'Establishing shot. Three months earlier — the world before Aria.',
        duration: '0:30',
        mood: 'Melancholic, Beautiful',
        status: 'Locked',
    },
    {
        id: 'scene-4',
        number: 4,
        title: 'Voss Institute - Conference Room',
        location: 'INT. VOSS INSTITUTE - CONFERENCE ROOM',
        timeOfDay: 'DAY',
        characters: ['Dr. Elena Voss', 'Board Members'],
        description: 'Elena pitches Project Aria to skeptical investors.',
        duration: '3-4 min',
        mood: 'Confident, Skeptical',
        status: 'Draft',
    },
    {
        id: 'scene-5',
        number: 5,
        title: "Dr. Voss's Lab - Evening",
        location: 'INT. DR. ELENA VOSS\'S LAB',
        timeOfDay: 'EVENING',
        characters: ['Dr. Elena Voss', 'Marcus'],
        description: 'Marcus and Elena discuss the ethical implications of Aria\'s potential sentience.',
        duration: '3-4 min',
        mood: 'Intimate, Philosophical',
        status: 'Draft',
    },
]

export const mockShotBreakdown = [
    {
        id: 'shot-1-1',
        sceneId: 'scene-1',
        sceneTitle: "Dr. Voss's Lab — Night",
        shots: [
            {
                number: 1,
                description: 'Establishing wide shot of the lab interior',
                cameraAngle: 'Wide / Establishing',
                movement: 'Slow dolly forward',
                lighting: 'Blue-tinted fluorescent, high contrast',
                lens: '24mm',
                emotionalTone: 'Wonder & Dread',
                duration: '8 sec',
                notes: 'Server banks in foreground, Elena in BG',
            },
            {
                number: 2,
                description: 'Close-up on Elena\'s face, data reflected in glasses',
                cameraAngle: 'ECU — Face',
                movement: 'Static',
                lighting: 'Key light from holographic display',
                lens: '85mm',
                emotionalTone: 'Obsession',
                duration: '4 sec',
                notes: 'Catchlight must show the neural map data',
            },
            {
                number: 3,
                description: 'Two-shot: Marcus at workstation, Elena pacing',
                cameraAngle: 'Medium Two-Shot',
                movement: 'Slight handheld drift',
                lighting: 'Practical lab lights + blue rim light',
                lens: '35mm',
                emotionalTone: 'Tension',
                duration: '12 sec',
                notes: 'Natural dialogue exchange',
            },
            {
                number: 4,
                description: 'POV through cryogenic pod glass — Aria floating inside',
                cameraAngle: 'POV / Close',
                movement: 'Static with slight focus pull',
                lighting: 'Cryogenic blue glow from pod',
                lens: '50mm',
                emotionalTone: 'Mystery & Beauty',
                duration: '6 sec',
                notes: 'Fog effect in pod, ethereal quality',
            },
            {
                number: 5,
                description: 'Extreme close-up — Aria\'s eyes opening',
                cameraAngle: 'ECU — Eyes',
                movement: 'Static',
                lighting: 'Practical eye light, electric blue iris VFX',
                lens: '100mm macro',
                emotionalTone: 'Revelation',
                duration: '3 sec',
                notes: 'VFX: electric blue iris effect in post',
            },
        ],
    },
    {
        id: 'shot-1-2',
        sceneId: 'scene-2',
        sceneTitle: 'Government Monitoring Station — Night',
        shots: [
            {
                number: 1,
                description: 'Overhead shot of monitoring station — screens flickering',
                cameraAngle: 'High Angle / Overhead',
                movement: 'Crane down to eye level',
                lighting: 'Screen glow, amber warning lights',
                lens: '18mm',
                emotionalTone: 'Surveillance, Power',
                duration: '10 sec',
                notes: 'Multiple screens showing global tracking',
            },
            {
                number: 2,
                description: 'Medium shot — Holloway reaching for phone',
                cameraAngle: 'Medium',
                movement: 'Slow push-in',
                lighting: 'Side light, harsh shadows',
                lens: '50mm',
                emotionalTone: 'Menace',
                duration: '8 sec',
                notes: 'Phone receiver doubles as weapon prop',
            },
            {
                number: 3,
                description: 'Close-up on global map — red blip appears',
                cameraAngle: 'Insert / Close',
                movement: 'Static',
                lighting: 'Screen glow, red tint',
                lens: '85mm',
                emotionalTone: 'Alarm',
                duration: '4 sec',
                notes: 'Practical screen or AR post insert',
            },
        ],
    },
    {
        id: 'shot-1-3',
        sceneId: 'scene-4',
        sceneTitle: 'Voss Institute — Conference Room',
        shots: [
            {
                number: 1,
                description: 'Wide shot — Elena facing the board',
                cameraAngle: 'Wide — Establishing',
                movement: 'Slow arc left to right',
                lighting: 'Corporate day, clean white light',
                lens: '24mm',
                emotionalTone: 'Confidence vs. Skepticism',
                duration: '8 sec',
                notes: 'Board members in silhouette, Elena backlit by presentation',
            },
            {
                number: 2,
                description: 'Close-up on glowing Aria consciousness sphere',
                cameraAngle: 'Insert shot',
                movement: 'Slow zoom in',
                lighting: 'Projection glow only',
                lens: '100mm',
                emotionalTone: 'Awe',
                duration: '5 sec',
                notes: 'Sphere pulses rhythmically — heartbeat-like',
            },
        ],
    },
]

export const mockSoundPlan = [
    {
        sceneId: 'scene-1',
        sceneTitle: "Act 1 — Dr. Voss's Lab",
        timeOfDay: 'Night',
        music: {
            track: 'Neural Genesis',
            description: 'Ambient electronic score — low drones with ethereal synth pads',
            tempo: '60 BPM – slow',
            key: 'D Minor',
            instrumentation: 'Synthesizers, processed strings, sub-bass',
            mood: 'Tense wonder',
        },
        ambient: [
            'Server cooling fans — constant hum (C# tone)',
            'Data center electrical buzz',
            'Distant ventilation system',
            'Occasional hard drive seek sound',
        ],
        foley: [
            'Elena\'s heels clicking on concrete floor',
            'Holographic interface touch sounds — soft chimes',
            'Keyboard typing — Marcus at workstation',
            'Cryogenic pod hydraulics — gentle hiss',
            'Aria\'s eyes opening — subtle wet sound + electrical spark',
        ],
        dialogue: {
            treatment: 'Clean production sound with slight reverb to suggest space',
            notes: 'Aria\'s V.O. should be processed — layered with synthesized harmonics to feel non-human',
        },
        mixingNotes: 'Music starts at -30dB and swells to -18dB at Aria\'s eyes opening. Server hum sits at -24dB constant. Foley clean and intimate in foreground.',
    },
    {
        sceneId: 'scene-2',
        sceneTitle: 'Act 1 — Government Monitoring Station',
        timeOfDay: 'Night (Same Time)',
        music: {
            track: 'Protocol Nightfall',
            description: 'Military-textured underscore — low brass stabs over electronic percussion',
            tempo: '80 BPM – building',
            key: 'E Minor',
            instrumentation: 'Brass, snare rolls, electronic bass',
            mood: 'Menace, urgency',
        },
        ambient: [
            'Multiple screens processing sound',
            'Air conditioning — clinical, precise',
            'Faint radio chatter in background',
        ],
        foley: [
            'Holloway reaching for telephone — authority in the movement',
            'Screens flickering — electrical',
            'Agents moving — military precision footsteps',
        ],
        dialogue: {
            treatment: 'Close-mic, intimate — command voice quality',
            notes: 'Holloway speaks softly but with total authority — the mix should mirror this',
        },
        mixingNotes: 'Cut from Lab scene — musical stab on cut. Underscore builds across scene. Ends on silence as screens light up — let the visual make the sound.',
    },
    {
        sceneId: 'scene-4',
        sceneTitle: 'Act 1 — Conference Room',
        timeOfDay: 'Day',
        music: {
            track: 'The Pitch',
            description: 'Minimal, sophisticated — sparse piano with subtle orchestral swell on key moments',
            tempo: 'Rubato — follows dialogue',
            key: 'A Major',
            instrumentation: 'Solo piano, light strings, vibraphone',
            mood: 'Intellectual confidence',
        },
        ambient: [
            'Conference room A/C — very low',
            'City traffic — muffled, through glass',
            'Projector hum',
        ],
        foley: [
            'Elena\'s clicker — presentation advance',
            'Board members shifting in chairs — tension',
            'Coffee cup set down — punctuation',
        ],
        dialogue: {
            treatment: 'ADR may be needed for reverb control in large room',
            notes: 'Elena\'s voice should feel larger-than-the-room — confident placement in the mix',
        },
        mixingNotes: 'Piano enters under board member skeptical reaction. Swells slightly as Elena says "genuine consciousness". Scene ends dry — no music — into city exterior.',
    },
    {
        sceneId: 'scene-5',
        sceneTitle: 'Act 1 — Lab (Evening)',
        timeOfDay: 'Evening',
        music: {
            track: 'Neither Does She',
            description: 'Intimate, sparse — solo cello with long, searching lines',
            tempo: '50 BPM – meditative',
            key: 'C# Minor',
            instrumentation: 'Solo cello, faint synthesizer texture',
            mood: 'Philosophical melancholy',
        },
        ambient: [
            'Server hum — same as scene 1, now familiar',
            'Evening city sounds through glass — distant',
        ],
        foley: [
            'Elena typing on holographic keyboard — soft',
            'Marcus walking to her side',
            'Elena\'s pause — silence is intentional',
        ],
        dialogue: {
            treatment: 'Intimate close coverage — almost whispered quality',
            notes: 'The line "Then she\'s already more human than any of us expected" — no music. Pure silence after.',
        },
        mixingNotes: 'Cello enters at Marcus\'s question. Fades entirely before Elena\'s final line. Let silence be the punctuation.',
    },
]
