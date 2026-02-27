import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useCineStore from '../store/useCineStore'
import useAuthStore from '../store/useAuthStore'
import {
    Sparkles, Film, Camera, Music, TrendingUp, FileText, ChevronRight,
    Zap, Clock, ArrowUpRight, Layers, Wand2, Plus, Star
} from 'lucide-react'

// ── Animated Counter ───────────────────────────────────────────
function AnimatedNumber({ value, duration = 800 }) {
    const [display, setDisplay] = useState(0)
    useEffect(() => {
        const num = parseInt(value) || 0
        if (num === 0) { setDisplay(0); return }
        let start = 0
        const step = Math.ceil(num / (duration / 16))
        const timer = setInterval(() => {
            start += step
            if (start >= num) { setDisplay(num); clearInterval(timer) }
            else setDisplay(start)
        }, 16)
        return () => clearInterval(timer)
    }, [value])
    return <>{display}</>
}

// ── Greeting based on time ─────────────────────────────────────
function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return { text: 'Good morning', emoji: '☀️' }
    if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' }
    if (h < 21) return { text: 'Good evening', emoji: '🌅' }
    return { text: 'Night owl mode', emoji: '🌙' }
}

export default function Dashboard() {
    const projects = useCineStore((s) => s.projects)
    const activeProjectId = useCineStore((s) => s.activeProjectId)
    const project = projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? {}
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const userName = user?.name || user?.email?.split('@')[0] || 'Creator'
    const greeting = getGreeting()

    const [hoveredCard, setHoveredCard] = useState(null)
    const [time, setTime] = useState(new Date())

    // Live clock
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(t)
    }, [])

    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dateStr = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

    // Dynamic stats
    const totalProjects = projects.length
    const activeScripts = projects.filter(p => p.script).length

    const quickActions = [
        {
            id: 'studio', label: 'Story Studio', sub: 'AI-powered script, shots & sound',
            icon: Zap, gradient: 'linear-gradient(135deg, #C07840, #E8A850)',
            path: '/studio',
        },
        {
            id: 'projects', label: 'All Projects', sub: `${totalProjects} project${totalProjects !== 1 ? 's' : ''} in workspace`,
            icon: Layers, gradient: 'linear-gradient(135deg, #8B5A28, #C07840)',
            path: '/projects',
        },
        {
            id: 'new', label: 'New Project', sub: 'Start a fresh production',
            icon: Plus, gradient: 'linear-gradient(135deg, #A06830, #D4A060)',
            path: '/projects',
        },
    ]

    return (
        <div className="page-in" style={{ display: 'flex', minHeight: '100vh', background: '#F5EFE5' }}>
            <Sidebar />

            <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px 48px' }}>

                {/* ── Hero Section ────────────────────────────────────── */}
                <div style={{
                    background: 'linear-gradient(135deg, #2A1E14 0%, #4A3020 50%, #3A2518 100%)',
                    borderRadius: 20,
                    padding: '36px 40px 32px',
                    marginBottom: 28,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Animated background orbs */}
                    <div style={{
                        position: 'absolute', top: -60, right: -40, width: 200, height: 200,
                        background: 'radial-gradient(circle, rgba(192,120,64,0.25) 0%, transparent 70%)',
                        borderRadius: '50%', animation: 'float 6s ease-in-out infinite',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -30, left: '30%', width: 150, height: 150,
                        background: 'radial-gradient(circle, rgba(232,168,80,0.15) 0%, transparent 70%)',
                        borderRadius: '50%', animation: 'float 8s ease-in-out infinite reverse',
                    }} />
                    <div style={{
                        position: 'absolute', top: 20, right: 40,
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2,
                    }}>
                        <span style={{ fontSize: 28, fontWeight: 700, color: '#E8C890', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>
                            {timeStr}
                        </span>
                        <span style={{ fontSize: 12, color: 'rgba(232,200,144,0.6)' }}>{dateStr}</span>
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 22 }}>{greeting.emoji}</span>
                            <span style={{ fontSize: 13, color: 'rgba(232,200,144,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                {greeting.text}
                            </span>
                        </div>
                        <h1 style={{
                            fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 800,
                            color: '#FAF0E0', margin: '0 0 8px', letterSpacing: '-0.01em',
                        }}>
                            {userName}
                        </h1>
                        <p style={{ fontSize: 15, color: 'rgba(232,200,144,0.6)', margin: 0, maxWidth: 450 }}>
                            Your next scene awaits. Create, edit, and perfect your cinematic vision.
                        </p>

                        {/* Mini stat pills */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                            {[
                                { label: 'Projects', value: totalProjects, icon: Film },
                                { label: 'With Scripts', value: activeScripts, icon: FileText },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} style={{
                                    padding: '7px 14px', borderRadius: 10,
                                    background: 'rgba(192,120,64,0.15)',
                                    border: '1px solid rgba(192,120,64,0.25)',
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    backdropFilter: 'blur(8px)',
                                }}>
                                    <Icon size={13} color="#E8C890" />
                                    <span style={{ fontSize: 18, fontWeight: 700, color: '#E8C890' }}>
                                        <AnimatedNumber value={value} />
                                    </span>
                                    <span style={{ fontSize: 11, color: 'rgba(232,200,144,0.5)' }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Quick Actions ───────────────────────────────────── */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Zap size={15} color="#C07840" />
                        <h2 style={{ fontSize: 13, fontWeight: 700, color: '#8B5A28', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Quick Actions</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                        {quickActions.map(({ id, label, sub, icon: Icon, gradient, path }) => (
                            <button
                                key={id}
                                onClick={() => navigate(path)}
                                onMouseEnter={() => setHoveredCard(id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{
                                    padding: '24px 22px', borderRadius: 16, cursor: 'pointer',
                                    background: '#FFFFFF',
                                    border: hoveredCard === id ? '1px solid rgba(192,120,64,0.4)' : '1px solid rgba(160,110,70,0.12)',
                                    textAlign: 'left', width: '100%',
                                    boxShadow: hoveredCard === id ? '0 8px 32px rgba(100,60,20,0.12)' : '0 2px 8px rgba(100,60,20,0.04)',
                                    transform: hoveredCard === id ? 'translateY(-3px)' : 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                    position: 'relative', overflow: 'hidden',
                                }}
                            >
                                {/* Hover gradient overlay */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                    background: gradient,
                                    opacity: hoveredCard === id ? 1 : 0,
                                    transition: 'opacity 0.3s ease',
                                }} />

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                        background: gradient,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 16px rgba(192,120,64,0.25)',
                                        transform: hoveredCard === id ? 'scale(1.08)' : 'scale(1)',
                                        transition: 'transform 0.3s ease',
                                    }}>
                                        <Icon size={20} color="#FAF7F2" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#2A1E14', marginBottom: 4 }}>{label}</div>
                                        <div style={{ fontSize: 12, color: '#A07850', lineHeight: 1.4 }}>{sub}</div>
                                    </div>
                                    <ArrowUpRight size={16} color={hoveredCard === id ? '#C07840' : '#D4C0A8'}
                                        style={{ marginTop: 2, transition: 'all 0.3s ease', transform: hoveredCard === id ? 'translate(2px, -2px)' : 'none' }} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Active Project + AI Tools ───────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18, marginBottom: 28 }}>

                    {/* Active project card */}
                    <div style={{
                        background: '#FFFFFF', borderRadius: 16,
                        border: '1px solid rgba(160,110,70,0.12)',
                        padding: 28, position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                            background: 'linear-gradient(90deg, #C07840, #E8B870, #D4A060)',
                        }} />

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
                            <div>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '3px 10px', background: 'rgba(192,120,64,0.08)',
                                    border: '1px solid rgba(192,120,64,0.18)', borderRadius: 20,
                                    fontSize: 10, color: '#8B5A28', letterSpacing: '0.1em', textTransform: 'uppercase',
                                    marginBottom: 10,
                                }}>
                                    <Star size={9} /> Active Project
                                </div>
                                <h2 style={{
                                    fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: '#2A1E14',
                                    margin: '0 0 8px',
                                }}>
                                    {project.title || 'No project selected'}
                                </h2>
                                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                                    {project.genre && (
                                        <span style={{
                                            padding: '4px 12px', background: 'rgba(192,120,64,0.1)',
                                            border: '1px solid rgba(192,120,64,0.22)', borderRadius: 20,
                                            fontSize: 11.5, color: '#8B5A28', fontWeight: 500,
                                        }}>{project.genre}</span>
                                    )}
                                    <span style={{
                                        padding: '4px 12px', background: 'rgba(40,160,100,0.08)',
                                        border: '1px solid rgba(40,160,100,0.2)', borderRadius: 20,
                                        fontSize: 11.5, color: '#2D8B5E', fontWeight: 500,
                                    }}>● Active</span>
                                </div>
                            </div>
                            <div style={{
                                width: 52, height: 52, borderRadius: 14,
                                background: 'linear-gradient(135deg, rgba(192,120,64,0.1), rgba(192,120,64,0.05))',
                                border: '1px solid rgba(192,120,64,0.18)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Film size={24} color="#C07840" />
                            </div>
                        </div>

                        {/* Script preview snippet */}
                        {project.script ? (
                            <div style={{
                                padding: '14px 16px', background: '#FAF7F2', borderRadius: 10,
                                border: '1px solid rgba(160,110,70,0.08)', marginBottom: 20,
                                fontFamily: 'Georgia, serif', fontSize: 12.5, color: '#6B4E36',
                                lineHeight: 1.7, fontStyle: 'italic',
                                maxHeight: 72, overflow: 'hidden',
                                position: 'relative',
                            }}>
                                {project.script.slice(0, 180)}…
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 28,
                                    background: 'linear-gradient(transparent, #FAF7F2)',
                                }} />
                            </div>
                        ) : (
                            <div style={{
                                padding: '20px 16px', background: '#FAF7F2', borderRadius: 10,
                                border: '1px dashed rgba(160,110,70,0.2)', marginBottom: 20,
                                textAlign: 'center', color: '#B09070', fontSize: 13,
                            }}>
                                No screenplay yet. Generate one in Story Studio!
                            </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => project.id ? navigate(`/project/${project.id}`) : navigate('/projects')}
                                style={{
                                    flex: 1, padding: '12px 18px',
                                    background: 'linear-gradient(135deg, #C07840, #E8A850)', border: 'none',
                                    borderRadius: 10, color: '#FAF7F2',
                                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                    boxShadow: '0 3px 14px rgba(192,120,64,0.3)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(192,120,64,0.4)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 14px rgba(192,120,64,0.3)' }}
                            >
                                <FileText size={14} /> {project.id ? 'Open Project' : 'Browse Projects'}
                            </button>
                            <button
                                onClick={() => navigate('/studio')}
                                style={{
                                    flex: 1, padding: '12px 18px',
                                    background: 'transparent',
                                    border: '1px solid rgba(192,120,64,0.3)',
                                    borderRadius: 10, color: '#8B5A28',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(192,120,64,0.06)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                            >
                                <Sparkles size={14} /> Story Studio
                            </button>
                        </div>
                    </div>

                    {/* AI Tools panel */}
                    <div style={{
                        background: '#FFFFFF', borderRadius: 16,
                        border: '1px solid rgba(160,110,70,0.12)',
                        padding: 24, display: 'flex', flexDirection: 'column',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: 'linear-gradient(135deg, #C07840, #E8A850)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Wand2 size={14} color="#FAF7F2" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#2A1E14' }}>AI Tools</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                            {[
                                { icon: FileText, label: 'Screenplay', desc: 'AI-generated scripts', color: '#C07840' },
                                { icon: Camera, label: 'Shot Design', desc: 'Camera & lighting plans', color: '#8B5A28' },
                                { icon: Music, label: 'Sound Design', desc: 'Music, ambient & foley', color: '#A06830' },
                                { icon: Wand2, label: 'Script Editing', desc: 'Expand, compress, rewrite', color: '#D4A060' },
                            ].map(({ icon: Icon, label, desc, color }) => (
                                <button
                                    key={label}
                                    onClick={() => navigate('/studio')}
                                    style={{
                                        padding: '12px 14px', borderRadius: 10,
                                        background: 'transparent',
                                        border: '1px solid rgba(160,110,70,0.1)',
                                        cursor: 'pointer', textAlign: 'left',
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FAF7F2'; e.currentTarget.style.borderColor = 'rgba(192,120,64,0.25)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(160,110,70,0.1)' }}
                                >
                                    <div style={{
                                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                        background: `${color}15`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icon size={15} color={color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#2A1E14' }}>{label}</div>
                                        <div style={{ fontSize: 10.5, color: '#B09070' }}>{desc}</div>
                                    </div>
                                    <ChevronRight size={13} color="#D4C0A8" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Recent Projects ─────────────────────────────────── */}
                {projects.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Clock size={15} color="#C07840" />
                                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#8B5A28', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Recent Projects</h2>
                            </div>
                            <button
                                onClick={() => navigate('/projects')}
                                style={{
                                    background: 'none', border: 'none', color: '#C07840',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                }}
                            >
                                View all <ChevronRight size={13} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                            {projects.slice(0, 4).map((proj, i) => (
                                <button
                                    key={proj.id}
                                    onClick={() => navigate(`/project/${proj.id}`)}
                                    onMouseEnter={() => setHoveredCard(`proj-${i}`)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{
                                        padding: '18px 20px', borderRadius: 14, cursor: 'pointer',
                                        background: '#FFFFFF', textAlign: 'left', width: '100%',
                                        border: hoveredCard === `proj-${i}` ? '1px solid rgba(192,120,64,0.35)' : '1px solid rgba(160,110,70,0.12)',
                                        boxShadow: hoveredCard === `proj-${i}` ? '0 6px 24px rgba(100,60,20,0.1)' : 'none',
                                        transform: hoveredCard === `proj-${i}` ? 'translateY(-2px)' : 'none',
                                        transition: 'all 0.25s ease',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                            background: `linear-gradient(135deg, ${['#C07840','#8B5A28','#A06830','#D4A060'][i % 4]}, ${['#E8A850','#C07840','#D4A060','#E8C880'][i % 4]})`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 3px 10px rgba(192,120,64,0.2)',
                                        }}>
                                            <Film size={16} color="#FAF7F2" />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{
                                                fontSize: 14, fontWeight: 600, color: '#2A1E14',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>{proj.title}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                                                {proj.genre && <span style={{ fontSize: 11, color: '#A07850' }}>{proj.genre}</span>}
                                                {proj.script && (
                                                    <span style={{
                                                        fontSize: 10, color: '#2D8B5E', fontWeight: 600,
                                                        display: 'flex', alignItems: 'center', gap: 3,
                                                    }}>
                                                        <FileText size={9} /> Has Script
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight size={15} color={hoveredCard === `proj-${i}` ? '#C07840' : '#D4C0A8'}
                                            style={{ transition: 'color 0.2s' }} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Float animation keyframe */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) }
                    50% { transform: translateY(-12px) }
                }
            `}</style>
        </div>
    )
}
