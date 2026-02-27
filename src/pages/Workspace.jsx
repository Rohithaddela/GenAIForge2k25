import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import useCineStore from '../store/useCineStore'
import { RefreshCw, Sliders, Maximize2, Minimize2, Save, Download, ChevronDown, List, Wand2 } from 'lucide-react'

const TONES = ['Dramatic', 'Melancholic', 'Tense', 'Hopeful', 'Dark', 'Comedic']

export default function Workspace() {
    const projects = useCineStore((s) => s.projects)
    const activeProjectId = useCineStore((s) => s.activeProjectId)
    const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? {}
    const script = activeProject.script ?? ''
    const scenes = activeProject.scenes ?? []
    const title = activeProject.title ?? ''
    const updateScript = useCineStore((s) => s.updateScript)
    const rewriteSection = useCineStore((s) => s.rewriteSection)
    const changeTone = useCineStore((s) => s.changeTone)
    const expandScene = useCineStore((s) => s.expandScene)
    const compressScene = useCineStore((s) => s.compressScene)

    const [showToneMenu, setShowToneMenu] = useState(false)
    const [showSceneList, setShowSceneList] = useState(true)
    const [notification, setNotification] = useState(null)
    const [wordCount, setWordCount] = useState(script.split(/\s+/).filter(Boolean).length)

    const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 2500) }

    const handleScriptChange = (e) => {
        updateScript(e.target.value)
        setWordCount(e.target.value.split(/\s+/).filter(Boolean).length)
    }

    return (
        <div className="page-in" style={{ display: 'flex', minHeight: '100vh', background: '#F5EFE5' }}>
            <Sidebar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{
                    height: 52, background: '#FFFFFF',
                    borderBottom: '1px solid rgba(160,110,70,0.12)',
                    display: 'flex', alignItems: 'center', padding: '0 20px', gap: 6, flexShrink: 0,
                }}>
                    <div style={{ marginRight: 14 }}>
                        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: '#2A1E14', fontWeight: 600 }}>{title}</span>
                        <span style={{ color: '#D4C0A8', margin: '0 6px' }}>/</span>
                        <span style={{ color: '#A07850', fontSize: 12 }}>Script Draft v1.0</span>
                    </div>

                    <div style={{ width: 1, height: 22, background: '#EDE0C8', margin: '0 6px' }} />

                    {[
                        { label: 'Rewrite', icon: Wand2, onClick: () => { rewriteSection(); notify('Section rewritten ✨') } },
                        { label: 'Expand', icon: Maximize2, onClick: () => { expandScene(); notify('Scene expanded') } },
                        { label: 'Compress', icon: Minimize2, onClick: () => { compressScene(); notify('Scene compressed') } },
                    ].map(({ label, icon: Icon, onClick }) => (
                        <button
                            key={label}
                            className="toolbar-btn"
                            onClick={onClick}
                            style={{ padding: '6px 13px', borderRadius: 6, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                            <Icon size={13} />{label}
                        </button>
                    ))}

                    {/* Tone dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="toolbar-btn"
                            onClick={() => setShowToneMenu(!showToneMenu)}
                            style={{ padding: '6px 13px', borderRadius: 6, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                            <Sliders size={13} />Change Tone<ChevronDown size={11} style={{ opacity: 0.5 }} />
                        </button>
                        {showToneMenu && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, marginTop: 4,
                                background: '#FFFFFF', border: '1px solid rgba(160,110,70,0.2)',
                                borderRadius: 8, overflow: 'hidden', zIndex: 100, minWidth: 140,
                                boxShadow: '0 6px 24px rgba(100,60,20,0.12)',
                            }}>
                                {TONES.map((tone) => (
                                    <button
                                        key={tone}
                                        onClick={() => { changeTone(tone); setShowToneMenu(false); notify(`Tone: ${tone}`) }}
                                        style={{
                                            display: 'block', width: '100%', padding: '9px 15px',
                                            background: 'transparent', border: 'none', color: '#5A3E2A',
                                            fontSize: 12.5, textAlign: 'left', cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#FAF7F2'; e.currentTarget.style.color = '#8B5A28' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5A3E2A' }}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 11.5, color: '#C0A888', marginRight: 10 }}>{wordCount.toLocaleString()} words</span>

                    <button className="toolbar-btn" onClick={() => setShowSceneList(!showSceneList)} style={{ padding: '6px 9px', borderRadius: 6 }}>
                        <List size={14} />
                    </button>
                    <div style={{ width: 1, height: 22, background: '#EDE0C8', margin: '0 4px' }} />
                    <button className="toolbar-btn" style={{ padding: '6px 13px', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#C07840', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Save size={13} />Save
                    </button>
                    <button className="toolbar-btn" style={{ padding: '6px 9px', borderRadius: 6 }}>
                        <Download size={13} />
                    </button>
                </div>

                {/* Toast */}
                {notification && (
                    <div style={{
                        position: 'fixed', top: 72, right: 24,
                        background: '#FFFFFF', border: '1px solid rgba(192,120,64,0.35)',
                        borderRadius: 8, padding: '9px 16px',
                        color: '#8B5A28', fontSize: 13, zIndex: 1000,
                        boxShadow: '0 4px 18px rgba(100,60,20,0.12)',
                    }}>
                        {notification}
                    </div>
                )}

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Scene panel */}
                    {showSceneList && (
                        <div style={{
                            width: 210, background: '#FFFFFF',
                            borderRight: '1px solid rgba(160,110,70,0.1)',
                            overflowY: 'auto', flexShrink: 0, padding: '14px 0',
                        }}>
                            <div style={{ padding: '0 14px 10px', fontSize: 10, color: '#C0A888', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Scenes</div>
                            {scenes.map((scene) => (
                                <div
                                    key={scene.id}
                                    style={{
                                        padding: '9px 14px', cursor: 'pointer',
                                        borderLeft: '2px solid transparent',
                                        borderBottom: '1px solid rgba(160,110,70,0.06)',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FAF7F2'; e.currentTarget.style.borderLeftColor = '#C07840' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent' }}
                                >
                                    <div style={{ fontSize: 9.5, color: '#C0A888', marginBottom: 3 }}>SC. {String(scene.number).padStart(2, '0')} — {scene.timeOfDay}</div>
                                    <div style={{ fontSize: 12, color: '#3A2818', lineHeight: 1.4 }}>{scene.title}</div>
                                    <div style={{ marginTop: 4 }}>
                                        <span style={{
                                            fontSize: 9, padding: '2px 6px', borderRadius: 3,
                                            background: scene.status === 'Locked' ? 'rgba(192,120,64,0.1)' : 'rgba(160,110,70,0.07)',
                                            color: scene.status === 'Locked' ? '#C07840' : '#907050',
                                            textTransform: 'uppercase', letterSpacing: '0.08em',
                                        }}>{scene.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Editor */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{
                            padding: '10px 36px', background: '#FAF7F2',
                            borderBottom: '1px solid rgba(160,110,70,0.08)',
                            fontSize: 10.5, color: '#C0A888', textTransform: 'uppercase', letterSpacing: '0.1em',
                            display: 'flex', gap: 22, flexShrink: 0,
                        }}>
                            <span>Format: Screenplay</span><span>Draft: v1.0</span><span>Last saved: Just now</span>
                        </div>

                        <div style={{ flex: 1, overflow: 'auto', background: '#FFFFFF' }}>
                            <div style={{ maxWidth: 700, margin: '0 auto', padding: '36px 36px 80px' }}>
                                <textarea
                                    className="script-editor"
                                    value={script}
                                    onChange={handleScriptChange}
                                    spellCheck={false}
                                    style={{ width: '100%', minHeight: 'calc(100vh - 200px)', padding: 0 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
