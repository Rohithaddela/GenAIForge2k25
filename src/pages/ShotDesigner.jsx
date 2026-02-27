import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import useCineStore from '../store/useCineStore'
import { Clock, Heart } from 'lucide-react'

function ShotCard({ shot }) {
    return (
        <div className="shot-card" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            {/* Top accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C07840, transparent)' }} />

            {/* Number badge */}
            <div style={{
                position: 'absolute', top: 14, right: 14,
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(192,120,64,0.1)', border: '1px solid rgba(192,120,64,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#C07840',
            }}>
                {String(shot.number).padStart(2, '0')}
            </div>

            <p style={{ fontSize: 13.5, color: '#2A1E14', lineHeight: 1.55, margin: '0 0 14px', paddingRight: 38, fontWeight: 500 }}>
                {shot.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 14px', marginBottom: 12 }}>
                {[
                    ['Camera Angle', shot.cameraAngle, true],
                    ['Movement', shot.movement, false],
                    ['Lighting', shot.lighting, false],
                    ['Lens', shot.lens, false],
                ].map(([lbl, val, highlight]) => (
                    <div key={lbl}>
                        <div style={{ fontSize: 9, color: '#C0A888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{lbl}</div>
                        <div style={{ fontSize: 12, color: highlight ? '#8B5A28' : '#4A3828', fontWeight: highlight ? 600 : 400 }}>{val}</div>
                    </div>
                ))}
            </div>

            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 10, borderTop: '1px solid rgba(160,110,70,0.1)', flexWrap: 'wrap', gap: 6,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Heart size={10} color="#C07840" />
                    <span style={{ fontSize: 11, color: '#907050', fontStyle: 'italic' }}>{shot.emotionalTone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={10} color="#C0A888" />
                    <span style={{ fontSize: 11, color: '#C0A888' }}>{shot.duration}</span>
                </div>
            </div>

            {shot.notes && (
                <div style={{
                    marginTop: 8, padding: '7px 10px',
                    background: 'rgba(192,120,64,0.05)',
                    borderRadius: 6, fontSize: 11, color: '#907050', fontStyle: 'italic',
                    border: '1px solid rgba(192,120,64,0.1)',
                }}>
                    📝 {shot.notes}
                </div>
            )}
        </div>
    )
}

export default function ShotDesigner() {
    const projects = useCineStore((s) => s.projects)
    const activeProjectId = useCineStore((s) => s.activeProjectId)
    const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? {}
    const shotBreakdown = activeProject.shotBreakdown ?? []
    const title = activeProject.title ?? ''
    const [activeGroup, setActiveGroup] = useState(null)

    const filtered = activeGroup ? shotBreakdown.filter((g) => g.id === activeGroup) : shotBreakdown
    const totalShots = shotBreakdown.reduce((a, g) => a + g.shots.length, 0)

    return (
        <div className="page-in" style={{ display: 'flex', minHeight: '100vh', background: '#F5EFE5' }}>
            <Sidebar />

            <main style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 14 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 5 }}>
                            <div style={{ width: 4, height: 26, background: 'linear-gradient(180deg,#C07840,#E8B870)', borderRadius: 2 }} />
                            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: '#2A1E14', margin: 0 }}>Shot Designer</h1>
                        </div>
                        <p style={{ color: '#A07850', margin: 0, paddingLeft: 15, fontSize: 13.5 }}>
                            {title} — {totalShots} shots across {shotBreakdown.length} scenes
                        </p>
                    </div>

                    {/* Scene filters */}
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                        {[{ id: null, label: 'All Scenes' }, ...shotBreakdown.map((g) => ({ id: g.id, label: `SC. ${g.id.split('-')[2]}` }))].map(({ id, label }) => {
                            const sel = activeGroup === id
                            return (
                                <button
                                    key={label}
                                    onClick={() => setActiveGroup(id)}
                                    style={{
                                        padding: '6px 13px', borderRadius: 20,
                                        border: `1px solid ${sel ? '#C07840' : 'rgba(160,110,70,0.2)'}`,
                                        background: sel ? 'rgba(192,120,64,0.1)' : '#FFFFFF',
                                        color: sel ? '#8B5A28' : '#A07850',
                                        fontSize: 12, cursor: 'pointer', transition: 'all 0.18s ease',
                                        fontWeight: sel ? 600 : 400,
                                    }}
                                >
                                    {label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Groups */}
                {filtered.map((group) => (
                    <div key={group.id} style={{ marginBottom: 44 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            marginBottom: 18, paddingBottom: 14,
                            borderBottom: '1px solid rgba(160,110,70,0.15)',
                        }}>
                            <span style={{
                                padding: '3px 11px', background: 'rgba(192,120,64,0.1)',
                                border: '1px solid rgba(192,120,64,0.25)', borderRadius: 4,
                                fontSize: 11, fontWeight: 700, color: '#8B5A28',
                                textTransform: 'uppercase', letterSpacing: '0.09em',
                            }}>{group.shots.length} Shots</span>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, color: '#2A1E14', margin: 0, fontWeight: 600 }}>
                                {group.sceneTitle}
                            </h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
                            {group.shots.map((shot) => <ShotCard key={shot.number} shot={shot} />)}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    )
}
