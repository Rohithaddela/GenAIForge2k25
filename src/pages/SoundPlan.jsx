import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import useCineStore from '../store/useCineStore'
import { Music, Wind, Volume2, Sliders, ChevronDown, ChevronRight } from 'lucide-react'

function Tag({ children, muted }) {
    return (
        <span style={{
            display: 'inline-block',
            padding: '3px 9px', marginRight: 6, marginBottom: 6,
            background: muted ? 'rgba(160,110,70,0.07)' : 'rgba(192,120,64,0.1)',
            border: `1px solid ${muted ? 'rgba(160,110,70,0.16)' : 'rgba(192,120,64,0.25)'}`,
            borderRadius: 4, fontSize: 11,
            color: muted ? '#907050' : '#8B5A28',
        }}>
            {children}
        </span>
    )
}

function Section({ title, icon: Icon, children }) {
    const [open, setOpen] = useState(true)
    return (
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(160,110,70,0.12)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    borderBottom: open ? '1px solid rgba(160,110,70,0.08)' : 'none',
                }}
            >
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(192,120,64,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} color="#C07840" />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#4A3828', flex: 1 }}>{title}</span>
                {open ? <ChevronDown size={13} color="#C0A888" /> : <ChevronRight size={13} color="#C0A888" />}
            </button>
            {open && <div style={{ padding: '13px 16px' }}>{children}</div>}
        </div>
    )
}

export default function SoundPlan() {
    const projects = useCineStore((s) => s.projects)
    const activeProjectId = useCineStore((s) => s.activeProjectId)
    const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? {}
    const soundPlan = activeProject.soundPlan ?? []
    const title = activeProject.title ?? ''

    return (
        <div className="page-in" style={{ display: 'flex', minHeight: '100vh', background: '#F5EFE5' }}>
            <Sidebar />

            <main style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
                <div style={{ marginBottom: 36 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 5 }}>
                        <div style={{ width: 4, height: 26, background: 'linear-gradient(180deg,#C07840,#E8B870)', borderRadius: 2 }} />
                        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: '#2A1E14', margin: 0 }}>Sound Design</h1>
                    </div>
                    <p style={{ color: '#A07850', margin: 0, paddingLeft: 15, fontSize: 13.5 }}>
                        {title} — Comprehensive audio production plan
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                    {soundPlan.map((scene) => (
                        <div key={scene.sceneId} style={{
                            background: '#FFFFFF', border: '1px solid rgba(160,110,70,0.14)',
                            borderRadius: 14, overflow: 'hidden',
                        }}>
                            {/* Scene header */}
                            <div style={{
                                padding: '18px 26px', borderBottom: '1px solid rgba(160,110,70,0.1)',
                                background: '#FAF7F2',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                            }}>
                                <div>
                                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 600, color: '#2A1E14', margin: '0 0 6px' }}>
                                        {scene.sceneTitle}
                                    </h2>
                                    <span style={{
                                        padding: '3px 9px', background: 'rgba(192,120,64,0.1)',
                                        border: '1px solid rgba(192,120,64,0.25)', borderRadius: 12,
                                        fontSize: 11, color: '#8B5A28',
                                    }}>{scene.timeOfDay}</span>
                                </div>
                                <div style={{ fontSize: 12, color: '#C0A888', fontStyle: 'italic' }}>
                                    🎵 {scene.music.track}
                                </div>
                            </div>

                            <div style={{ padding: '22px 26px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    {/* Left */}
                                    <div>
                                        <Section title="Score / Music" icon={Music}>
                                            <div style={{ marginBottom: 10 }}>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: '#8B5A28', marginBottom: 4 }}>"{scene.music.track}"</div>
                                                <div style={{ fontSize: 12.5, color: '#7A5844', lineHeight: 1.65, marginBottom: 10 }}>{scene.music.description}</div>
                                                <div>
                                                    <Tag>{scene.music.tempo}</Tag>
                                                    <Tag>{scene.music.key}</Tag>
                                                    <Tag muted>{scene.music.mood}</Tag>
                                                </div>
                                            </div>
                                            <div style={{ padding: '8px 12px', background: '#FAF7F2', borderRadius: 7, fontSize: 11.5, color: '#907050' }}>
                                                <span style={{ color: '#C0A888', marginRight: 6 }}>Instrumentation:</span>{scene.music.instrumentation}
                                            </div>
                                        </Section>

                                        <Section title="Ambient Sound" icon={Wind}>
                                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                                {scene.ambient.map((item, i) => (
                                                    <li key={i} style={{
                                                        display: 'flex', alignItems: 'flex-start', gap: 9,
                                                        padding: '6px 0', borderBottom: i < scene.ambient.length - 1 ? '1px solid rgba(160,110,70,0.07)' : 'none',
                                                    }}>
                                                        <span style={{ color: '#C07840', lineHeight: 1.5, flexShrink: 0 }}>—</span>
                                                        <span style={{ fontSize: 12.5, color: '#5A3E2A', lineHeight: 1.55 }}>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </Section>
                                    </div>

                                    {/* Right */}
                                    <div>
                                        <Section title="Foley Effects" icon={Volume2}>
                                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                                {scene.foley.map((item, i) => (
                                                    <li key={i} style={{
                                                        display: 'flex', alignItems: 'flex-start', gap: 9,
                                                        padding: '6px 0', borderBottom: i < scene.foley.length - 1 ? '1px solid rgba(160,110,70,0.07)' : 'none',
                                                    }}>
                                                        <span style={{ color: '#C07840', lineHeight: 1.5, flexShrink: 0 }}>•</span>
                                                        <span style={{ fontSize: 12.5, color: '#5A3E2A', lineHeight: 1.55 }}>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </Section>

                                        <Section title="Mixing Notes" icon={Sliders}>
                                            <div style={{
                                                fontSize: 12.5, color: '#7A5844', lineHeight: 1.7, fontStyle: 'italic',
                                                borderLeft: '2px solid rgba(192,120,64,0.35)', paddingLeft: 11, marginBottom: 12,
                                            }}>
                                                {scene.mixingNotes}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 10, color: '#C0A888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>
                                                    Dialogue Treatment
                                                </div>
                                                <div style={{ fontSize: 12.5, color: '#4A3828', marginBottom: 4 }}>{scene.dialogue.treatment}</div>
                                                <div style={{ fontSize: 12, color: '#907050', fontStyle: 'italic' }}>{scene.dialogue.notes}</div>
                                            </div>
                                        </Section>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
