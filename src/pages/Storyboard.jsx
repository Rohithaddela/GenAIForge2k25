import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useCineStore from '../store/useCineStore'
import { apiGenerateStoryboard } from '../api'
import {
    Film, Camera, Loader2, Eye, Maximize2,
    X, Layers, RefreshCw, Clapperboard, Move
} from 'lucide-react'

// ── Cinematic color palette per tone ─────────────────────────
const toneGradients = {
    'tense': ['#1a0a0a', '#3d1515', '#5a1a1a'],
    'hopeful': ['#0a1a2a', '#1a3a5a', '#2a5a8a'],
    'melancholic': ['#0d0d1a', '#1a1a3d', '#2a2a5a'],
    'desperate': ['#1a0a00', '#3d1a0a', '#5a2a0a'],
    'mysterious': ['#0a0a1a', '#1a1a2d', '#2d2d4a'],
    'romantic': ['#1a0a1a', '#3d1a3d', '#5a2a4a'],
    'dark': ['#0a0a0a', '#1a1a1a', '#2d2d2d'],
    'bright': ['#1a2a1a', '#2a4a2a', '#3a6a3a'],
    'suspenseful': ['#0d0a1a', '#1a153d', '#2a1f5a'],
    'joyful': ['#1a1a0a', '#3d3d1a', '#5a5a2a'],
    'default': ['#1a150e', '#2a1e14', '#3a2818'],
}

function getToneGradient(tone) {
    if (!tone) return toneGradients.default
    const key = tone.toLowerCase()
    for (const [k, v] of Object.entries(toneGradients)) {
        if (key.includes(k)) return v
    }
    return toneGradients.default
}

// ── Cinematic Visual Panel (CSS-only, no external images) ────
function CinematicPanel({ shot, shotNumber, sceneTitle }) {
    const colors = getToneGradient(shot.emotional_tone)
    const desc = shot.description || ''

    // Determine scene visual elements from description
    const isInterior = desc.toLowerCase().includes('int') || desc.toLowerCase().includes('inside') || desc.toLowerCase().includes('room')
    const isNight = desc.toLowerCase().includes('night') || desc.toLowerCase().includes('dark') || desc.toLowerCase().includes('dim')
    const hasCharacter = desc.toLowerCase().includes('character') || desc.toLowerCase().includes('face') || desc.toLowerCase().includes('person') || desc.toLowerCase().includes('close')

    return (
        <div style={{
            width: '100%', aspectRatio: '16/9', position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
        }}>
            {/* Cinematic bars (letterbox effect) */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8%', background: 'rgba(0,0,0,0.7)', zIndex: 2 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8%', background: 'rgba(0,0,0,0.7)', zIndex: 2 }} />

            {/* Composition guide lines (rule of thirds) */}
            <div style={{ position: 'absolute', left: '33%', top: '8%', bottom: '8%', width: 1, background: 'rgba(255,255,255,0.06)', zIndex: 1 }} />
            <div style={{ position: 'absolute', left: '66%', top: '8%', bottom: '8%', width: 1, background: 'rgba(255,255,255,0.06)', zIndex: 1 }} />
            <div style={{ position: 'absolute', top: '36%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.06)', zIndex: 1 }} />
            <div style={{ position: 'absolute', top: '64%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.06)', zIndex: 1 }} />

            {/* Depth layers — background shapes */}
            {isInterior ? (
                <>
                    {/* Interior: walls/ceiling feel */}
                    <div style={{
                        position: 'absolute', top: '8%', left: '5%', right: '5%', bottom: '35%',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)',
                        borderRadius: '0 0 4px 4px',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '12%', left: '10%', right: '10%', height: '20%',
                        background: `rgba(255,255,255,0.02)`,
                        borderRadius: 3,
                    }} />
                </>
            ) : (
                <>
                    {/* Exterior: horizon, sky */}
                    <div style={{
                        position: 'absolute', top: '8%', left: 0, right: 0, height: '45%',
                        background: `linear-gradient(180deg, ${isNight ? 'rgba(20,20,50,0.5)' : 'rgba(80,100,140,0.15)'}, transparent)`,
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '8%', left: 0, right: 0, height: '35%',
                        background: `linear-gradient(0deg, rgba(0,0,0,0.3), transparent)`,
                    }} />
                </>
            )}

            {/* Character silhouette placeholder */}
            {hasCharacter && (
                <div style={{
                    position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)',
                    width: '18%', height: '55%',
                    background: 'radial-gradient(ellipse at center bottom, rgba(0,0,0,0.4), transparent 70%)',
                    borderRadius: '40% 40% 0 0',
                }} />
            )}

            {/* Camera movement indicator */}
            {shot.movement && shot.movement.toLowerCase() !== 'static' && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 40, height: 40, borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Move size={14} color="rgba(255,255,255,0.15)" />
                </div>
            )}

            {/* Light source glow */}
            <div style={{
                position: 'absolute',
                top: isNight ? '15%' : '10%',
                right: '20%',
                width: isNight ? 60 : 100,
                height: isNight ? 60 : 100,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${isNight ? 'rgba(200,180,120,0.1)' : 'rgba(255,240,200,0.12)'}, transparent 70%)`,
            }} />

            {/* Central description text overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                zIndex: 3, padding: '20% 12%', textAlign: 'center',
            }}>
                <div style={{
                    fontSize: 11.5, color: 'rgba(232,200,144,0.7)', fontWeight: 500,
                    lineHeight: 1.6, maxWidth: '90%',
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {desc}
                </div>
            </div>

            {/* Lens info at bottom */}
            {shot.lens && (
                <div style={{
                    position: 'absolute', bottom: '10%', right: 10,
                    fontSize: 8, color: 'rgba(255,255,255,0.25)', fontWeight: 600,
                    letterSpacing: '0.1em', zIndex: 3,
                }}>
                    {shot.lens}
                </div>
            )}

            {/* Shot number badge */}
            <div style={{
                position: 'absolute', top: '10%', left: 8,
                padding: '3px 9px', borderRadius: 5,
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                fontSize: 9.5, fontWeight: 700, color: '#E8C890',
                letterSpacing: '0.06em', zIndex: 4,
            }}>
                SHOT {shotNumber}
            </div>

            {/* Shot type badge */}
            {shot.type && (
                <div style={{
                    position: 'absolute', top: '10%', right: 8,
                    padding: '3px 9px', borderRadius: 5,
                    background: 'rgba(192,120,64,0.8)',
                    fontSize: 9.5, fontWeight: 700, color: '#FAF7F2', zIndex: 4,
                }}>
                    {shot.type}
                </div>
            )}

            {/* Emotional tone pill at bottom */}
            {shot.emotional_tone && (
                <div style={{
                    position: 'absolute', bottom: '10%', left: 8,
                    padding: '2px 8px', borderRadius: 4,
                    background: 'rgba(0,0,0,0.4)',
                    fontSize: 8.5, fontWeight: 600, color: 'rgba(232,200,144,0.6)',
                    textTransform: 'uppercase', letterSpacing: '0.08em', zIndex: 4,
                }}>
                    {shot.emotional_tone}
                </div>
            )}
        </div>
    )
}

// ── Single Panel Card ────────────────────────────────────────
function PanelCard({ panel, index, onExpand }) {
    const [hovered, setHovered] = useState(false)
    const shot = panel.shot || {}

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: '#FFFFFF', borderRadius: 14, overflow: 'hidden',
                border: hovered ? '1px solid rgba(192,120,64,0.35)' : '1px solid rgba(160,110,70,0.12)',
                boxShadow: hovered ? '0 8px 32px rgba(100,60,20,0.12)' : '0 2px 8px rgba(100,60,20,0.04)',
                transform: hovered ? 'translateY(-3px)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                cursor: 'pointer',
            }}
            onClick={() => onExpand(panel)}
        >
            {/* Cinematic visual panel */}
            <div style={{ position: 'relative' }}>
                <CinematicPanel shot={shot} shotNumber={panel.shot_number} sceneTitle={panel.scene_title} />
                {hovered && (
                    <div style={{
                        position: 'absolute', bottom: 12, right: 12,
                        width: 28, height: 28, borderRadius: 7,
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'fadeIn 0.2s ease', zIndex: 5,
                    }}>
                        <Maximize2 size={13} color="#E8C890" />
                    </div>
                )}
            </div>

            {/* Info area */}
            <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#C07840', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {panel.scene_title}
                </div>
                <div style={{
                    fontSize: 12.5, color: '#2A1E14', fontWeight: 500,
                    lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {shot.description || 'Shot panel'}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {shot.camera_angle && (
                        <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 9.5, fontWeight: 600, background: 'rgba(192,120,64,0.08)', color: '#8B5A28', border: '1px solid rgba(192,120,64,0.15)' }}>
                            {shot.camera_angle}
                        </span>
                    )}
                    {shot.lens && (
                        <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 9.5, fontWeight: 600, background: 'rgba(100,60,20,0.06)', color: '#A07850', border: '1px solid rgba(100,60,20,0.1)' }}>
                            {shot.lens}
                        </span>
                    )}
                    {shot.emotional_tone && (
                        <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 9.5, fontWeight: 600, background: 'rgba(45,139,94,0.06)', color: '#2D8B5E', border: '1px solid rgba(45,139,94,0.15)' }}>
                            {shot.emotional_tone}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Lightbox Modal ───────────────────────────────────────────
function Lightbox({ panel, onClose }) {
    const shot = panel.shot || {}
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(10,5,2,0.92)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 24, animation: 'fadeIn 0.25s ease',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: 920, width: '100%', background: '#1E150E',
                    borderRadius: 18, overflow: 'hidden',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                    animation: 'scaleIn 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}
            >
                {/* Large cinematic panel */}
                <div style={{ position: 'relative' }}>
                    <CinematicPanel shot={shot} shotNumber={panel.shot_number} sceneTitle={panel.scene_title} />
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '10%', right: 12,
                            width: 32, height: 32, borderRadius: 8, zIndex: 10,
                            background: 'rgba(0,0,0,0.6)', border: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <X size={16} color="#E8C890" />
                    </button>
                </div>

                {/* Details panel */}
                <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#E8C890', margin: '0 0 10px' }}>Shot Details</h3>
                        <div style={{ fontSize: 13, color: 'rgba(232,200,144,0.7)', lineHeight: 1.7 }}>
                            {shot.description || 'No description'}
                        </div>
                        {shot.notes && (
                            <div style={{
                                marginTop: 12, padding: '8px 12px', borderRadius: 8,
                                background: 'rgba(192,120,64,0.1)',
                                fontSize: 12, color: '#C0A888', fontStyle: 'italic',
                            }}>
                                📝 {shot.notes}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#E8C890', margin: '0 0 10px' }}>Technical</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { label: 'Shot Type', value: shot.type, icon: Camera },
                                { label: 'Camera Angle', value: shot.camera_angle, icon: Eye },
                                { label: 'Movement', value: shot.movement, icon: Move },
                                { label: 'Lens', value: shot.lens, icon: Maximize2 },
                                { label: 'Tone', value: shot.emotional_tone, icon: Film },
                                { label: 'Duration', value: shot.duration, icon: Clapperboard },
                            ].filter(d => d.value).map(({ label, value, icon: Icon }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Icon size={12} color="#8B5A28" style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: '#8B5A28', minWidth: 80 }}>{label}</span>
                                    <span style={{ fontSize: 12, color: 'rgba(232,200,144,0.8)', fontWeight: 500 }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Main Page ───────────────────────────────────────────────
export default function Storyboard() {
    const navigate = useNavigate()
    const projects = useCineStore((s) => s.projects)
    const activeProjectId = useCineStore((s) => s.activeProjectId)
    const project = projects.find((p) => p.id === activeProjectId) ?? {}
    const shotBreakdown = project.shotBreakdown ?? []

    const [panels, setPanels] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [lightbox, setLightbox] = useState(null)
    const [viewMode, setViewMode] = useState('grid')

    const generatePanels = async () => {
        if (!shotBreakdown.length) return
        setLoading(true)
        setError(null)
        try {
            const result = await apiGenerateStoryboard(shotBreakdown)
            setPanels(result || [])
        } catch (err) {
            console.error(err)
            setError('Failed to generate storyboard. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (shotBreakdown.length > 0 && panels.length === 0) {
            generatePanels()
        }
    }, [shotBreakdown])

    const sceneMap = {}
    panels.forEach((p) => {
        const key = p.scene_id || p.scene_title || 'unknown'
        if (!sceneMap[key]) sceneMap[key] = { title: p.scene_title, panels: [] }
        sceneMap[key].panels.push(p)
    })
    const scenes = Object.values(sceneMap)

    return (
        <div className="page-in" style={{ display: 'flex', minHeight: '100vh', background: '#F5EFE5' }}>
            <Sidebar />

            <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px 48px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 6 }}>
                            <div style={{ width: 4, height: 26, background: 'linear-gradient(180deg,#C07840,#E8B870)', borderRadius: 2 }} />
                            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#2A1E14', margin: 0 }}>
                                Storyboard
                            </h1>
                            <span style={{ marginLeft: 6, fontSize: 13, color: '#A07850' }}>— {project.title || 'Project'}</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#A07850', margin: '0 0 0 15px' }}>
                            Visual shot panels from your production breakdown. Click any panel to expand.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{
                            display: 'flex', borderRadius: 8, overflow: 'hidden',
                            border: '1px solid rgba(160,110,70,0.2)',
                        }}>
                            {['grid', 'filmstrip'].map((mode) => (
                                <button key={mode} onClick={() => setViewMode(mode)}
                                    style={{
                                        padding: '6px 12px', border: 'none', cursor: 'pointer',
                                        background: viewMode === mode ? '#C07840' : '#FFFFFF',
                                        color: viewMode === mode ? '#FAF7F2' : '#8B5A28',
                                        fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                                    }}
                                >{mode}</button>
                            ))}
                        </div>
                        {panels.length > 0 && (
                            <button onClick={generatePanels} disabled={loading}
                                style={{
                                    padding: '8px 16px', borderRadius: 8,
                                    background: 'transparent', border: '1px solid rgba(192,120,64,0.3)',
                                    color: '#8B5A28', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                }}
                            >
                                <RefreshCw size={12} /> Regenerate
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                {panels.length > 0 && (
                    <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
                        {[
                            { label: 'Scenes', value: scenes.length, icon: Layers },
                            { label: 'Total Shots', value: panels.length, icon: Camera },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} style={{
                                padding: '10px 16px', borderRadius: 10,
                                background: '#FFFFFF', border: '1px solid rgba(160,110,70,0.12)',
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <Icon size={14} color="#C07840" />
                                <span style={{ fontSize: 18, fontWeight: 700, color: '#2A1E14' }}>{value}</span>
                                <span style={{ fontSize: 11, color: '#A07850' }}>{label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(192,120,64,0.15), rgba(192,120,64,0.05))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <Loader2 size={28} color="#C07840" style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#2A1E14', margin: '0 0 8px' }}>
                            Generating Storyboard…
                        </h3>
                        <p style={{ fontSize: 13, color: '#A07850' }}>Creating visual panels from your shot design.</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        textAlign: 'center', padding: '60px 40px',
                        background: '#FFFFFF', borderRadius: 14,
                        border: '1px solid rgba(200,60,60,0.15)',
                    }}>
                        <p style={{ color: '#B04040', fontSize: 14 }}>{error}</p>
                        <button onClick={generatePanels} style={{
                            marginTop: 12, padding: '10px 22px', borderRadius: 8,
                            background: 'linear-gradient(135deg,#C07840,#E8A850)',
                            border: 'none', color: '#FAF7F2', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}>Try Again</button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && shotBreakdown.length === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '80px 40px',
                        background: '#FFFFFF', borderRadius: 16,
                        border: '1px solid rgba(160,110,70,0.12)',
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(192,120,64,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 18px',
                        }}>
                            <Camera size={28} color="#C0A888" />
                        </div>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#2A1E14', margin: '0 0 8px' }}>
                            No Shot Data Yet
                        </h3>
                        <p style={{ fontSize: 13, color: '#A07850', margin: '0 0 22px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                            Generate a production in Story Studio first. Your shot breakdowns will be used to create visual storyboard panels.
                        </p>
                        <button onClick={() => navigate('/studio')}
                            style={{
                                padding: '12px 24px', borderRadius: 10,
                                background: 'linear-gradient(135deg,#C07840,#E8A850)',
                                border: 'none', color: '#FAF7F2',
                                fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                boxShadow: '0 3px 16px rgba(192,120,64,0.35)',
                            }}
                        >
                            <Clapperboard size={15} /> Go to Story Studio
                        </button>
                    </div>
                )}

                {/* Panels by scene */}
                {!loading && !error && scenes.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {scenes.map((scene, si) => (
                            <div key={si}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: 8,
                                        background: 'linear-gradient(135deg, #C07840, #E8A850)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 700, color: '#FAF7F2',
                                    }}>
                                        {si + 1}
                                    </div>
                                    <h2 style={{
                                        fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700,
                                        color: '#2A1E14', margin: 0,
                                    }}>
                                        {scene.title}
                                    </h2>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: 6,
                                        background: 'rgba(192,120,64,0.08)',
                                        fontSize: 10.5, fontWeight: 600, color: '#8B5A28',
                                    }}>
                                        {scene.panels.length} shot{scene.panels.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {viewMode === 'grid' ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                        gap: 16,
                                    }}>
                                        {scene.panels.map((panel, pi) => (
                                            <PanelCard key={pi} panel={panel} index={si * 100 + pi}
                                                onExpand={(p) => setLightbox(p)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'flex', gap: 14, overflowX: 'auto',
                                        paddingBottom: 12,
                                    }}>
                                        {scene.panels.map((panel, pi) => (
                                            <div key={pi} style={{ minWidth: 320, maxWidth: 320, flexShrink: 0 }}>
                                                <PanelCard panel={panel} index={si * 100 + pi}
                                                    onExpand={(p) => setLightbox(p)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {lightbox && <Lightbox panel={lightbox} onClose={() => setLightbox(null)} />}
            </main>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0 } to { transform: scale(1); opacity: 1 } }
            `}</style>
        </div>
    )
}
