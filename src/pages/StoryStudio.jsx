import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useCineStore from '../store/useCineStore'
import { apiGenerate, apiEditScript, apiGetLatestGeneration } from '../api'
import {
    Sparkles, FileText, Camera, Music, Wand2, Maximize2, Minimize2,
    Sliders, ChevronDown, Save, Download, Clock, Heart, Wind, Volume2, Loader2, PenLine
} from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────
const TONES = ['Dramatic', 'Melancholic', 'Tense', 'Hopeful', 'Dark', 'Comedic']
const TABS = [
    { id: 'script', label: 'Screenplay', icon: FileText },
    { id: 'shots', label: 'Shot Design', icon: Camera },
    { id: 'sound', label: 'Sound Design', icon: Music },
]

// ─── Generation overlay ──────────────────────────────────────────────────────
function GeneratingOverlay({ stage }) {
    const steps = [
        { icon: PenLine, label: 'Crafting screenplay…' },
        { icon: Camera, label: 'Designing shot breakdown…' },
        { icon: Music, label: 'Composing sound design…' },
    ]
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(250,247,242,0.94)',
            backdropFilter: 'blur(14px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#C07840,#E8B870)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 22px',
                    boxShadow: '0 0 48px rgba(192,120,64,0.45)',
                    animation: 'float 2s ease-in-out infinite',
                }}>
                    <Sparkles size={30} color="#FAF7F2" />
                </div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#2A1E14', margin: '0 0 8px', fontWeight: 700 }}>
                    Generating your Production
                </h2>
                <p style={{ color: '#A07850', fontSize: 14, margin: 0 }}>
                    Inception Labs AI is crafting your cinematic world…
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 340 }}>
                {steps.map(({ icon: Icon, label }, i) => {
                    const done = stage > i + 1
                    const active = stage === i + 1
                    return (
                        <div key={label} style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '14px 20px', borderRadius: 12,
                            background: done ? 'rgba(192,120,64,0.07)' : active ? '#FFFFFF' : 'rgba(240,236,226,0.5)',
                            border: `1px solid ${done ? 'rgba(192,120,64,0.28)' : active ? 'rgba(192,120,64,0.22)' : 'rgba(160,110,70,0.1)'}`,
                            boxShadow: active ? '0 4px 22px rgba(192,120,64,0.1)' : 'none',
                            transition: 'all 0.4s ease',
                        }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: done ? 'rgba(192,120,64,0.12)' : 'rgba(192,120,64,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {active
                                    ? <Loader2 size={18} color="#C07840" style={{ animation: 'spin 1s linear infinite' }} />
                                    : <Icon size={18} color={done ? '#C07840' : '#C0A888'} />
                                }
                            </div>
                            <span style={{ fontSize: 13.5, color: done ? '#8B5A28' : active ? '#3A2818' : '#B09070', fontWeight: (done || active) ? 600 : 400 }}>
                                {label}
                            </span>
                            {done && <span style={{ marginLeft: 'auto', color: '#C07840', fontSize: 18 }}>✓</span>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Shot card ───────────────────────────────────────────────────────────────
function ShotCard({ shot }) {
    return (
        <div className="shot-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#C07840,transparent)' }} />
            <div style={{ position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: '50%', background: 'rgba(192,120,64,0.1)', border: '1px solid rgba(192,120,64,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#C07840' }}>
                {String(shot.number).padStart(2, '0')}
            </div>
            <p style={{ fontSize: 13, color: '#2A1E14', lineHeight: 1.55, margin: '0 0 12px', paddingRight: 34 }}>{shot.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 10 }}>
                {[['Angle', shot.cameraAngle], ['Movement', shot.movement], ['Lighting', shot.lighting], ['Lens', shot.lens]].map(([l, v]) => (
                    <div key={l}>
                        <div style={{ fontSize: 9, color: '#C0A888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 1 }}>{l}</div>
                        <div style={{ fontSize: 12, color: '#4A3828' }}>{v}</div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 9, borderTop: '1px solid rgba(160,110,70,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={9} color="#C07840" /><span style={{ fontSize: 11, color: '#907050', fontStyle: 'italic' }}>{shot.emotionalTone}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={9} color="#C0A888" /><span style={{ fontSize: 11, color: '#C0A888' }}>{shot.duration}</span></div>
            </div>
            {shot.notes && <div style={{ marginTop: 8, padding: '7px 10px', background: 'rgba(192,120,64,0.05)', borderRadius: 6, fontSize: 11, color: '#907050', fontStyle: 'italic', border: '1px solid rgba(192,120,64,0.1)' }}>📝 {shot.notes}</div>}
        </div>
    )
}

// ─── Sound section ────────────────────────────────────────────────────────────
function SoundSection({ title, icon: Icon, children }) {
    const [open, setOpen] = useState(true)
    return (
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(160,110,70,0.12)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
            <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 15px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: open ? '1px solid rgba(160,110,70,0.08)' : 'none' }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(192,120,64,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={13} color="#C07840" /></div>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#4A3828', flex: 1 }}>{title}</span>
                <ChevronDown size={12} color="#C0A888" style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
            </button>
            {open && <div style={{ padding: '12px 15px' }}>{children}</div>}
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StoryStudio() {
    const navigate = useNavigate()
    const location = useLocation()
    const projects = useCineStore((s) => s.projects)
    const activeProjectId = useCineStore((s) => s.activeProjectId)
    const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? {}

    const script = activeProject.script ?? ''
    const scenes = activeProject.scenes ?? []
    const shotBreakdown = activeProject.shotBreakdown ?? []
    const soundPlan = activeProject.soundPlan ?? []
    const projectTitle = activeProject.title ?? 'Untitled Project'

    const updateScript = useCineStore((s) => s.updateScript)
    const setGeneration = useCineStore((s) => s.setGeneration)
    const clearGeneration = useCineStore((s) => s.clearGeneration)
    const skipAutoLoad = useCineStore((s) => s.skipAutoLoad)
    const setSkipAutoLoad = useCineStore((s) => s.setSkipAutoLoad)

    // Check if we arrived via location state OR store flag
    const shouldStartFresh = location.state?.fresh === true || skipAutoLoad

    // resetKey forces full internal state reset when incremented (Regenerate)
    const [resetKey, setResetKey] = useState(0)

    // PHASE: 'input' | 'generating' | 'studio'
    const [phase, setPhase] = useState((!shouldStartFresh && script) ? 'studio' : 'input')
    const [story, setStory] = useState('')
    const [genStage, setGenStage] = useState(0)
    const [activeTab, setActiveTab] = useState('script')
    const [showTone, setShowTone] = useState(false)
    const [toast, setToast] = useState(null)
    const [wordCount, setWordCount] = useState(script.split(/\s+/).filter(Boolean).length)
    const storyRef = useRef(null)
    const [genError, setGenError] = useState(null)
    const [editing, setEditing] = useState(false)

    const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    // ── Auto-load latest generation on mount ────────────────────
    useEffect(() => {
        // Clear the store flag so future normal navigation auto-loads
        if (skipAutoLoad) {
            setSkipAutoLoad(false)
            return
        }
        if (shouldStartFresh) return  // location.state says fresh
        if (!activeProject.id || script) return  // already loaded or no project
        let cancelled = false
        apiGetLatestGeneration(activeProject.id)
            .then((gen) => {
                if (!cancelled && gen && gen.screenplay) {
                    setGeneration(gen)
                    setPhase('studio')
                    setStory(gen.story_input || '')
                    setWordCount(gen.screenplay.split(/\s+/).filter(Boolean).length)
                }
            })
            .catch(() => {})  // no generation yet, stay on input phase
        return () => { cancelled = true }
    }, [activeProject.id, resetKey])

    // ── Handle "Regenerate" / "New Generation" from within Studio ───
    const handleNewGeneration = () => {
        clearGeneration()
        setPhase('input')
        setStory('')
        setWordCount(0)
        setGenStage(0)
        setGenError(null)
        setSkipAutoLoad(true)
        setResetKey((k) => k + 1)  // triggers useEffect with skipAutoLoad=true
    }

    // ── Script editing via API ─────────────────────────────────
    const handleEdit = async (action, tone = null) => {
        if (!script.trim() || editing) return
        setEditing(true)
        notify(`⏳ ${action === 'tone' ? `Changing tone to ${tone}` : action.charAt(0).toUpperCase() + action.slice(1) + 'ing'}…`)
        try {
            const result = await apiEditScript(script, action, tone)
            updateScript(result.script)
            setWordCount(result.script.split(/\s+/).filter(Boolean).length)
            notify(`✅ Script ${action === 'tone' ? `tone changed to ${tone}` : action + 'ed'} successfully!`)
        } catch (err) {
            console.error(`Script ${action} failed:`, err)
            notify(`❌ ${err.message || `${action} failed`}`)
        } finally {
            setEditing(false)
        }
    }

    const handleGenerate = async () => {
        if (!story.trim()) { storyRef.current?.focus(); return }
        if (!activeProject.id) { notify('⚠ No project selected'); return }

        setPhase('generating')
        setGenStage(1)
        setGenError(null)

        try {
            // Show progress animation while API call runs
            const stageTimer1 = setTimeout(() => setGenStage(2), 3000)
            const stageTimer2 = setTimeout(() => setGenStage(3), 6000)

            const result = await apiGenerate(activeProject.id, story)

            clearTimeout(stageTimer1)
            clearTimeout(stageTimer2)

            // Store the result in the Zustand store
            setGeneration(result)
            setGenStage(0)
            setPhase('studio')
            setActiveTab('script')
            notify('✨ Production generated! Explore the tabs.')
        } catch (err) {
            console.error('Generation failed:', err)
            setGenStage(0)
            setPhase('input')
            setGenError(err.message || 'Generation failed. Please try again.')
            notify(`❌ ${err.message || 'Generation failed'}`)
        }
    }

    // ── PHASE: input ──────────────────────────────────────────────────────────
    if (phase === 'input') {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', background: '#F5EFE5' }}>
                <Sidebar />
                <main style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '40px 32px', minHeight: '100vh',
                }}>
                    <div style={{ width: '100%', maxWidth: 700 }}>
                        {/* Icon + heading */}
                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'linear-gradient(135deg,#C07840,#E8B870)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                                boxShadow: '0 4px 28px rgba(192,120,64,0.35)',
                                animation: 'float 3s ease-in-out infinite',
                            }}>
                                <PenLine size={26} color="#FAF7F2" />
                            </div>

                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', background: 'rgba(192,120,64,0.08)', border: '1px solid rgba(192,120,64,0.2)', borderRadius: 20, marginBottom: 16 }}>
                                <Sparkles size={11} color="#C07840" />
                                <span style={{ fontSize: 11, color: '#8B5A28', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI-Powered Generation</span>
                            </div>

                            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 34, fontWeight: 800, color: '#2A1E14', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                                Tell your story.
                            </h1>
                            <p style={{ fontSize: 15, color: '#A07850', margin: '0 0 6px', lineHeight: 1.6 }}>
                                Describe your concept — Inception Labs AI will generate a complete
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
                                {[{ icon: FileText, label: 'Screenplay' }, { icon: Camera, label: 'Shot Design' }, { icon: Music, label: 'Sound Design' }].map(({ icon: Icon, label }) => (
                                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#C07840', fontWeight: 500 }}>
                                        <Icon size={14} />{label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Project badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14, padding: '4px 12px', background: '#FFFFFF', border: '1px solid rgba(160,110,70,0.18)', borderRadius: 8 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C07840' }} />
                            <span style={{ fontSize: 12, color: '#6B4E36', fontWeight: 500 }}>{projectTitle}</span>
                        </div>

                        {/* Textarea card */}
                        <div style={{
                            background: '#FFFFFF', borderRadius: 16,
                            border: '1px solid rgba(160,110,70,0.18)',
                            boxShadow: '0 4px 32px rgba(100,60,20,0.08)',
                            overflow: 'hidden',
                        }}>
                            <textarea
                                ref={storyRef}
                                value={story}
                                onChange={(e) => setStory(e.target.value)}
                                placeholder={`e.g.\n\nA lone astronomer discovers an anomalous signal from deep space. When decoded it reveals a map — not to another world, but to a buried structure beneath the Sahara. As intelligence agencies converge, she must decide: is this humanity's greatest discovery, or its final warning?`}
                                rows={9}
                                style={{
                                    width: '100%', padding: '22px 24px',
                                    border: 'none', outline: 'none', resize: 'none',
                                    fontSize: 15, color: '#2A1E14', lineHeight: 1.75,
                                    fontFamily: 'Inter, sans-serif',
                                    background: 'transparent',
                                    boxSizing: 'border-box',
                                }}
                            />
                            <div style={{
                                padding: '14px 20px',
                                borderTop: '1px solid rgba(160,110,70,0.1)',
                                background: '#FAF7F2',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <span style={{ fontSize: 12, color: '#C0A888' }}>
                                    {story.trim().split(/\s+/).filter(Boolean).length} words
                                </span>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!story.trim()}
                                    style={{
                                        padding: '11px 30px', borderRadius: 10,
                                        background: story.trim() ? 'linear-gradient(135deg,#C07840,#E8A850)' : 'rgba(160,110,70,0.18)',
                                        border: 'none',
                                        color: story.trim() ? '#FAF7F2' : '#C0A888',
                                        fontSize: 14, fontWeight: 700, cursor: story.trim() ? 'pointer' : 'not-allowed',
                                        display: 'flex', alignItems: 'center', gap: 9,
                                        boxShadow: story.trim() ? '0 4px 20px rgba(192,120,64,0.45)' : 'none',
                                        transition: 'all 0.25s ease',
                                        letterSpacing: '0.02em',
                                    }}
                                    onMouseEnter={(e) => { if (story.trim()) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(192,120,64,0.55)' } }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = story.trim() ? '0 4px 20px rgba(192,120,64,0.45)' : 'none' }}
                                >
                                    <Sparkles size={16} />
                                    Generate Production
                                </button>
                            </div>
                        </div>

                        {/* Tip */}
                        <p style={{ textAlign: 'center', fontSize: 12, color: '#C0A888', marginTop: 18, fontStyle: 'italic' }}>
                            Tip: the more descriptive you are, the richer the output. Genre, tone, setting — all help.
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    // ── PHASE: generating ─────────────────────────────────────────────────────
    if (phase === 'generating') {
        return <GeneratingOverlay stage={genStage} />
    }

    // ── PHASE: studio (tabs visible) ─────────────────────────────────────────
    return (
        <div className="page-in" style={{ display: 'flex', minHeight: '100vh', background: '#F5EFE5' }}>
            <Sidebar />

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: 18, right: 24, zIndex: 600, background: '#FFFFFF', border: '1px solid rgba(192,120,64,0.3)', borderRadius: 10, padding: '11px 18px', color: '#8B5A28', fontSize: 13, fontWeight: 500, boxShadow: '0 6px 24px rgba(100,60,20,0.14)' }}>
                    {toast}
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Story summary bar */}
                <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(160,110,70,0.12)', padding: '12px 28px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 4, height: 20, background: 'linear-gradient(180deg,#C07840,#E8B870)', borderRadius: 2 }} />
                        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#2A1E14' }}>Story Studio</span>
                        <span style={{ color: '#D4C0A8' }}>—</span>
                        <span style={{ fontSize: 13, color: '#A07850' }}>{projectTitle}</span>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 11, color: '#C0A888', maxWidth: 380, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: 'italic' }}>
                            {story.slice(0, 80)}{story.length > 80 ? '…' : ''}
                        </div>
                        <button
                            onClick={handleNewGeneration}
                            style={{ padding: '5px 12px', borderRadius: 7, background: 'transparent', border: '1px solid rgba(192,120,64,0.25)', color: '#8B5A28', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(192,120,64,0.07)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                            <Sparkles size={11} />Regenerate
                        </button>
                    </div>
                </div>

                {/* Tab bar */}
                <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(160,110,70,0.12)', padding: '0 28px', display: 'flex', alignItems: 'center', flexShrink: 0, position: 'sticky', top: 0, zIndex: 30 }}>
                    {TABS.map(({ id, label, icon: Icon }) => {
                        const active = activeTab === id
                        return (
                            <button key={id} onClick={() => setActiveTab(id)} style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '13px 22px', background: 'none', border: 'none',
                                borderBottom: active ? '2px solid #C07840' : '2px solid transparent',
                                cursor: 'pointer', fontSize: 13.5,
                                color: active ? '#8B5A28' : '#A07850', fontWeight: active ? 700 : 400,
                                transition: 'all 0.18s ease', marginBottom: '-1px',
                            }}>
                                <Icon size={15} />{label}
                            </button>
                        )
                    })}

                    {/* Script toolbar */}
                    {activeTab === 'script' && (
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '8px 0' }}>
                            {[
                                { label: 'Rewrite', icon: Wand2, action: 'rewrite' },
                                { label: 'Expand', icon: Maximize2, action: 'expand' },
                                { label: 'Compress', icon: Minimize2, action: 'compress' },
                            ].map(({ label, icon: Icon, action }) => (
                                <button key={label} className="toolbar-btn" disabled={editing}
                                    onClick={() => handleEdit(action)}
                                    style={{ padding: '5px 11px', borderRadius: 6, fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 5, opacity: editing ? 0.5 : 1, cursor: editing ? 'wait' : 'pointer' }}>
                                    {editing ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Icon size={12} />}{label}
                                </button>
                            ))}
                            <div style={{ position: 'relative' }}>
                                <button className="toolbar-btn" onClick={() => setShowTone(!showTone)} disabled={editing} style={{ padding: '5px 11px', borderRadius: 6, fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 5, opacity: editing ? 0.5 : 1 }}>
                                    <Sliders size={12} />Tone <ChevronDown size={10} />
                                </button>
                                {showTone && (
                                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#FFFFFF', border: '1px solid rgba(160,110,70,0.2)', borderRadius: 8, overflow: 'hidden', zIndex: 100, minWidth: 130, boxShadow: '0 8px 28px rgba(100,60,20,0.12)' }}>
                                        {TONES.map((t) => (
                                            <button key={t} onClick={() => { handleEdit('tone', t); setShowTone(false) }}
                                                style={{ display: 'block', width: '100%', padding: '8px 14px', background: 'transparent', border: 'none', color: '#5A3E2A', fontSize: 12.5, textAlign: 'left', cursor: 'pointer' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#FAF7F2' }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ width: 1, height: 20, background: '#EDE0C8', margin: '0 4px' }} />
                            <span style={{ fontSize: 11, color: '#C0A888' }}>{wordCount.toLocaleString()} words</span>
                            <button className="toolbar-btn" style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11.5, color: '#C07840', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Save size={12} />Save</button>
                            <button className="toolbar-btn" style={{ padding: '5px 8px', borderRadius: 6 }}><Download size={12} /></button>
                        </div>
                    )}
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflow: 'auto' }}>

                    {/* SCREENPLAY */}
                    {activeTab === 'script' && (
                        <div style={{ display: 'flex', height: '100%' }}>
                            <div style={{ width: 196, background: '#FFFFFF', borderRight: '1px solid rgba(160,110,70,0.1)', overflowY: 'auto', flexShrink: 0, padding: '14px 0' }}>
                                <div style={{ padding: '0 14px 10px', fontSize: 9.5, color: '#C0A888', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Scenes</div>
                                {scenes.map((scene) => (
                                    <div key={scene.id} style={{ padding: '8px 14px', cursor: 'pointer', borderLeft: '2px solid transparent', borderBottom: '1px solid rgba(160,110,70,0.06)', transition: 'all 0.15s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#FAF7F2'; e.currentTarget.style.borderLeftColor = '#C07840' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent' }}>
                                        <div style={{ fontSize: 9, color: '#C0A888', marginBottom: 2 }}>SC. {String(scene.number).padStart(2, '0')}</div>
                                        <div style={{ fontSize: 12, color: '#3A2818', lineHeight: 1.35 }}>{scene.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ flex: 1, background: '#FFFFFF', overflowY: 'auto' }}>
                                <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 36px 80px' }}>
                                    <textarea className="script-editor" value={script}
                                        onChange={(e) => { updateScript(e.target.value); setWordCount(e.target.value.split(/\s+/).filter(Boolean).length) }}
                                        spellCheck={false} style={{ width: '100%', minHeight: 'calc(100vh - 260px)', padding: 0 }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SHOT DESIGN */}
                    {activeTab === 'shots' && (
                        <div style={{ padding: '28px 32px' }}>
                            {shotBreakdown.map((group) => (
                                <div key={group.id} style={{ marginBottom: 40 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(160,110,70,0.15)' }}>
                                        <span style={{ padding: '2px 10px', background: 'rgba(192,120,64,0.1)', border: '1px solid rgba(192,120,64,0.25)', borderRadius: 4, fontSize: 10.5, fontWeight: 700, color: '#8B5A28', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            {group.shots.length} Shots
                                        </span>
                                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#2A1E14', margin: 0 }}>{group.sceneTitle}</h2>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 12 }}>
                                        {group.shots.map((shot) => <ShotCard key={shot.number} shot={shot} />)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SOUND DESIGN */}
                    {activeTab === 'sound' && (
                        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {soundPlan.map((scene) => (
                                <div key={scene.sceneId} style={{ background: '#FFFFFF', border: '1px solid rgba(160,110,70,0.14)', borderRadius: 14, overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(160,110,70,0.1)', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                        <div>
                                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: '#2A1E14', margin: '0 0 5px' }}>{scene.sceneTitle}</h2>
                                            <span style={{ padding: '2px 8px', background: 'rgba(192,120,64,0.1)', border: '1px solid rgba(192,120,64,0.22)', borderRadius: 10, fontSize: 11, color: '#8B5A28' }}>{scene.timeOfDay}</span>
                                        </div>
                                        <span style={{ fontSize: 12, color: '#C0A888', fontStyle: 'italic' }}>🎵 {scene.music.track}</span>
                                    </div>
                                    <div style={{ padding: '18px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div>
                                            <SoundSection title="Score / Music" icon={Music}>
                                                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#8B5A28', marginBottom: 4 }}>"{scene.music.track}"</div>
                                                <div style={{ fontSize: 12.5, color: '#7A5844', lineHeight: 1.65, marginBottom: 9 }}>{scene.music.description}</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                    {[scene.music.tempo, scene.music.key, scene.music.mood].map((t) => (
                                                        <span key={t} style={{ padding: '2px 8px', background: 'rgba(192,120,64,0.08)', border: '1px solid rgba(192,120,64,0.2)', borderRadius: 4, fontSize: 11, color: '#8B5A28' }}>{t}</span>
                                                    ))}
                                                </div>
                                            </SoundSection>
                                            <SoundSection title="Ambient Sound" icon={Wind}>
                                                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                                    {scene.ambient.map((item, i) => (
                                                        <li key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: i < scene.ambient.length - 1 ? '1px solid rgba(160,110,70,0.07)' : 'none' }}>
                                                            <span style={{ color: '#C07840', flexShrink: 0 }}>—</span>
                                                            <span style={{ fontSize: 12.5, color: '#5A3E2A' }}>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </SoundSection>
                                        </div>
                                        <div>
                                            <SoundSection title="Foley Effects" icon={Volume2}>
                                                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                                    {scene.foley.map((item, i) => (
                                                        <li key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: i < scene.foley.length - 1 ? '1px solid rgba(160,110,70,0.07)' : 'none' }}>
                                                            <span style={{ color: '#C07840', flexShrink: 0 }}>•</span>
                                                            <span style={{ fontSize: 12.5, color: '#5A3E2A' }}>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </SoundSection>
                                            <SoundSection title="Mixing Notes" icon={Sliders}>
                                                <div style={{ fontSize: 12.5, color: '#7A5844', lineHeight: 1.7, fontStyle: 'italic', borderLeft: '2px solid rgba(192,120,64,0.35)', paddingLeft: 10, marginBottom: 10 }}>{scene.mixingNotes}</div>
                                                <div style={{ fontSize: 11, color: '#C0A888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Dialogue Treatment</div>
                                                <div style={{ fontSize: 12.5, color: '#4A3828' }}>{scene.dialogue.treatment}</div>
                                            </SoundSection>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
