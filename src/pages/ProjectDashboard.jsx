import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useCineStore from '../store/useCineStore'
import { apiGetGenerationHistory } from '../api'
import {
    Film, FileText, Camera, Music, Clock, Sparkles, ChevronRight,
    Loader2, History, Play, Calendar, Cpu, Hash
} from 'lucide-react'

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub }) {
    return (
        <div style={{
            background: '#FFFFFF', borderRadius: 12,
            border: '1px solid rgba(160,110,70,0.12)',
            padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 15,
        }}>
            <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'rgba(192,120,64,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={19} color="#C07840" />
            </div>
            <div>
                <div style={{ fontSize: 11, color: '#A07850', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#2A1E14', lineHeight: 1 }}>{value}</div>
                {sub && <div style={{ fontSize: 11, color: '#B09070', marginTop: 3 }}>{sub}</div>}
            </div>
        </div>
    )
}

// ─── Generation Card ──────────────────────────────────────────
function GenerationCard({ gen, index, onLoad }) {
    const scriptPreview = (gen.screenplay || '').slice(0, 150).replace(/\n/g, ' ')
    const scenesCount = gen.shot_design?.length || 0
    const shotsCount = gen.shot_design?.reduce((a, s) => a + (s.shots?.length || 0), 0) || 0
    const soundCount = gen.sound_design?.length || 0
    const date = gen.created_at ? new Date(gen.created_at).toLocaleString() : 'Unknown'
    const provider = gen.provider || 'unknown'

    return (
        <div style={{
            background: '#FFFFFF', borderRadius: 14,
            border: '1px solid rgba(160,110,70,0.12)',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
        }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(100,60,20,0.1)'; e.currentTarget.style.borderColor = 'rgba(192,120,64,0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(160,110,70,0.12)' }}
        >
            {/* Top accent bar */}
            <div style={{ height: 3, background: index === 0 ? 'linear-gradient(90deg,#C07840,#E8B870)' : 'rgba(192,120,64,0.15)' }} />

            <div style={{ padding: '18px 22px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: index === 0 ? 'linear-gradient(135deg,#C07840,#E8B870)' : 'rgba(192,120,64,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Hash size={14} color={index === 0 ? '#FAF7F2' : '#C07840'} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2A1E14', fontFamily: 'Playfair Display, serif' }}>
                            Generation #{gen._displayIndex}
                            {index === 0 && <span style={{ marginLeft: 8, padding: '2px 8px', background: 'rgba(192,120,64,0.1)', border: '1px solid rgba(192,120,64,0.25)', borderRadius: 12, fontSize: 10, color: '#8B5A28', fontWeight: 600 }}>LATEST</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#B09070' }}>
                                <Calendar size={10} /> {date}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#B09070' }}>
                                <Cpu size={10} /> {provider}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats chips */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                    <div style={{ padding: '4px 10px', background: 'rgba(192,120,64,0.06)', borderRadius: 6, fontSize: 11, color: '#8B5A28', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FileText size={10} /> Screenplay
                    </div>
                    <div style={{ padding: '4px 10px', background: 'rgba(192,120,64,0.06)', borderRadius: 6, fontSize: 11, color: '#8B5A28', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Camera size={10} /> {scenesCount} scenes · {shotsCount} shots
                    </div>
                    <div style={{ padding: '4px 10px', background: 'rgba(192,120,64,0.06)', borderRadius: 6, fontSize: 11, color: '#8B5A28', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Music size={10} /> {soundCount} sound cues
                    </div>
                </div>

                {/* Script preview */}
                {scriptPreview && (
                    <div style={{
                        padding: '10px 14px', background: '#FAF7F2', borderRadius: 8,
                        border: '1px solid rgba(160,110,70,0.08)',
                        fontSize: 12, color: '#6B4E36', lineHeight: 1.6,
                        fontFamily: 'Georgia, serif', fontStyle: 'italic',
                        marginBottom: 14,
                    }}>
                        {scriptPreview}{scriptPreview.length >= 150 ? '…' : ''}
                    </div>
                )}

                {/* Story premise */}
                {gen.story_input && (
                    <div style={{ fontSize: 11, color: '#A07850', marginBottom: 14 }}>
                        <span style={{ fontWeight: 600 }}>Premise:</span> {gen.story_input.slice(0, 100)}{gen.story_input.length > 100 ? '…' : ''}
                    </div>
                )}

                {/* Load button */}
                <button
                    onClick={() => onLoad(gen)}
                    style={{
                        width: '100%', padding: '10px 16px', borderRadius: 8,
                        background: index === 0 ? 'linear-gradient(135deg,#C07840,#E8A850)' : 'transparent',
                        border: index === 0 ? 'none' : '1px solid rgba(192,120,64,0.3)',
                        color: index === 0 ? '#FAF7F2' : '#8B5A28',
                        fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        transition: 'all 0.2s ease',
                        boxShadow: index === 0 ? '0 3px 14px rgba(192,120,64,0.3)' : 'none',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
                >
                    <Play size={13} /> {index === 0 ? 'Open in Story Studio' : 'Load this version'}
                </button>
            </div>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────
export default function ProjectDashboard() {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const projects = useCineStore((s) => s.projects)
    const openProject = useCineStore((s) => s.openProject)
    const setGeneration = useCineStore((s) => s.setGeneration)
    const clearGeneration = useCineStore((s) => s.clearGeneration)
    const setSkipAutoLoad = useCineStore((s) => s.setSkipAutoLoad)

    const project = projects.find((p) => p.id === projectId) ?? {}

    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!projectId) return
        openProject(projectId)

        let cancelled = false
        setLoading(true)
        apiGetGenerationHistory(projectId)
            .then((data) => {
                if (!cancelled) {
                    // Add display index (total - idx so newest = highest number)
                    const withIndex = (data || []).map((g, i, arr) => ({ ...g, _displayIndex: arr.length - i }))
                    setHistory(withIndex)
                }
            })
            .catch((err) => { if (!cancelled) setError(err.message) })
            .finally(() => { if (!cancelled) setLoading(false) })

        return () => { cancelled = true }
    }, [projectId])

    const handleLoad = (gen) => {
        openProject(projectId)
        setGeneration(gen)
        navigate('/studio')
    }

    // Stats
    const totalGenerations = history.length
    const latestGen = history[0]
    const totalScenes = latestGen?.shot_design?.length || 0
    const totalShots = latestGen?.shot_design?.reduce((a, s) => a + (s.shots?.length || 0), 0) || 0
    const totalSoundCues = latestGen?.sound_design?.length || 0

    return (
        <div className="page-in" style={{ display: 'flex', minHeight: '100vh', background: '#F5EFE5' }}>
            <Sidebar />

            <main style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 6 }}>
                        <div style={{ width: 4, height: 26, background: 'linear-gradient(180deg,#C07840,#E8B870)', borderRadius: 2 }} />
                        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#2A1E14', margin: 0 }}>
                            {project.title || 'Project'}
                        </h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 15 }}>
                        {project.genre && (
                            <span style={{ padding: '3px 10px', background: 'rgba(192,120,64,0.1)', border: '1px solid rgba(192,120,64,0.25)', borderRadius: 20, fontSize: 11, color: '#8B5A28' }}>
                                {project.genre}
                            </span>
                        )}
                        <span style={{ fontSize: 13, color: '#A07850' }}>
                            {project.created_at ? `Created ${new Date(project.created_at).toLocaleDateString()}` : ''}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px,1fr))', gap: 14, marginBottom: 32 }}>
                    <StatCard icon={History} label="Generations" value={totalGenerations} sub="Total AI generations" />
                    <StatCard icon={Camera} label="Scenes" value={totalScenes} sub="In latest generation" />
                    <StatCard icon={Film} label="Shots" value={totalShots} sub="Total shot breakdowns" />
                    <StatCard icon={Music} label="Sound Cues" value={totalSoundCues} sub="Scene sound designs" />
                </div>

                {/* Quick actions */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                    <button
                        onClick={() => { openProject(projectId); clearGeneration(); setSkipAutoLoad(true); navigate('/studio', { state: { fresh: true } }) }}
                        style={{
                            padding: '12px 24px', borderRadius: 10,
                            background: 'linear-gradient(135deg,#C07840,#E8A850)',
                            border: 'none', color: '#FAF7F2',
                            fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8,
                            boxShadow: '0 3px 16px rgba(192,120,64,0.35)',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
                    >
                        <Sparkles size={15} /> New Generation
                    </button>
                    {latestGen && (
                        <button
                            onClick={() => handleLoad(latestGen)}
                            style={{
                                padding: '12px 24px', borderRadius: 10,
                                background: 'transparent',
                                border: '1px solid rgba(192,120,64,0.35)',
                                color: '#8B5A28',
                                fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(192,120,64,0.07)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                            <Play size={14} /> View Latest
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/project/${projectId}/callsheet`)}
                        style={{
                            padding: '12px 24px', borderRadius: 10,
                            background: 'transparent',
                            border: '1px solid rgba(192,120,64,0.35)',
                            color: '#8B5A28',
                            fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8,
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(192,120,64,0.07)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                        <Hash size={14} /> Call Sheet
                    </button>
                </div>

                {/* Generation History */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                        <History size={16} color="#C07840" />
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#2A1E14', margin: 0 }}>
                            Generation History
                        </h2>
                        <span style={{ padding: '2px 8px', background: 'rgba(192,120,64,0.1)', borderRadius: 10, fontSize: 11, color: '#8B5A28', fontWeight: 600, marginLeft: 4 }}>
                            {totalGenerations}
                        </span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <Loader2 size={28} color="#C07840" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                            <p style={{ color: '#A07850', fontSize: 14 }}>Loading generation history…</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#A07850' }}>
                            <p>Failed to load history: {error}</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '60px 40px',
                            background: '#FFFFFF', borderRadius: 14,
                            border: '1px solid rgba(160,110,70,0.12)',
                        }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: 'rgba(192,120,64,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <Sparkles size={24} color="#C0A888" />
                            </div>
                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#2A1E14', margin: '0 0 8px' }}>No generations yet</h3>
                            <p style={{ fontSize: 13, color: '#A07850', margin: '0 0 20px' }}>
                                Head to Story Studio to create your first AI-powered screenplay, shot design, and sound design.
                            </p>
                            <button
                                onClick={() => { openProject(projectId); clearGeneration(); setSkipAutoLoad(true); navigate('/studio', { state: { fresh: true } }) }}
                                style={{
                                    padding: '10px 22px', borderRadius: 8,
                                    background: 'linear-gradient(135deg,#C07840,#E8A850)',
                                    border: 'none', color: '#FAF7F2',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: 7,
                                    boxShadow: '0 3px 14px rgba(192,120,64,0.35)',
                                }}
                            >
                                <Sparkles size={14} /> Generate Now
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
                            {history.map((gen, i) => (
                                <GenerationCard key={gen.id || i} gen={gen} index={i} onLoad={handleLoad} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
