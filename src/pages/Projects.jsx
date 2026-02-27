import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useCineStore from '../store/useCineStore'
import useAuthStore from '../store/useAuthStore'
import { apiListProjects, apiCreateProject, apiDeleteProject } from '../api'
import { Search, Plus, ChevronRight, X, Film, Calendar, Users, Clapperboard, LogOut } from 'lucide-react'

// ── Create Project Modal ──────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
    const [form, setForm] = useState({
        title: '',
        genre: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    })
    const [error, setError] = useState('')

    const GENRES = [
        'Action / Thriller', 'Drama', 'Sci-Fi Thriller', 'Psychological Drama',
        'Horror', 'Comedy', 'Documentary', 'Animation', 'Romance', 'Mystery',
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.title.trim()) { setError('Project title is required.'); return }
        if (!form.genre) { setError('Please select a genre.'); return }
        onCreate(form)
        onClose()
    }

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(42, 30, 20, 0.45)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 24,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    width: '100%', maxWidth: 520,
                    boxShadow: '0 20px 60px rgba(42,20,10,0.25)',
                    overflow: 'hidden',
                    animation: 'pageFadeIn 0.25s ease',
                }}
            >
                {/* Modal header */}
                <div style={{
                    padding: '22px 28px',
                    borderBottom: '1px solid rgba(160,110,70,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#FAF7F2',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg,#C07840,#8B5A28)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 3px 12px rgba(192,120,64,0.35)',
                        }}>
                            <Clapperboard size={17} color="#FAF7F2" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 17, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#2A1E14' }}>
                                New Project
                            </h2>
                            <p style={{ margin: 0, fontSize: 11.5, color: '#A07850' }}>Set up your cinematic workspace</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0A888', padding: 4, borderRadius: 6 }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
                    {/* Title */}
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B4E36', marginBottom: 7, letterSpacing: '0.04em' }}>
                            Project Title <span style={{ color: '#C07840' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Echoes of Tomorrow"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            style={{
                                width: '100%', padding: '10px 14px',
                                border: '1px solid rgba(160,110,70,0.25)',
                                borderRadius: 8, fontSize: 14, color: '#2A1E14',
                                background: '#FAF7F2', outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#C07840')}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(160,110,70,0.25)')}
                        />
                    </div>

                    {/* Genre */}
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B4E36', marginBottom: 7, letterSpacing: '0.04em' }}>
                            Genre <span style={{ color: '#C07840' }}>*</span>
                        </label>
                        <select
                            value={form.genre}
                            onChange={(e) => setForm({ ...form, genre: e.target.value })}
                            style={{
                                width: '100%', padding: '10px 14px',
                                border: '1px solid rgba(160,110,70,0.25)',
                                borderRadius: 8, fontSize: 14, color: form.genre ? '#2A1E14' : '#A07850',
                                background: '#FAF7F2', outline: 'none', cursor: 'pointer',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#C07840')}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(160,110,70,0.25)')}
                        >
                            <option value="" disabled>Select a genre…</option>
                            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    {/* Dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
                        {[
                            { label: 'Start Date', key: 'startDate' },
                            { label: 'End Date', key: 'endDate' },
                        ].map(({ label, key }) => (
                            <div key={key}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B4E36', marginBottom: 7, letterSpacing: '0.04em' }}>
                                    {label}
                                </label>
                                <input
                                    type="date"
                                    value={form[key]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        border: '1px solid rgba(160,110,70,0.25)',
                                        borderRadius: 8, fontSize: 13, color: '#2A1E14',
                                        background: '#FAF7F2', outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = '#C07840')}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(160,110,70,0.25)')}
                                />
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div style={{
                            padding: '9px 13px', marginBottom: 16,
                            background: 'rgba(192,64,40,0.07)', border: '1px solid rgba(192,64,40,0.2)',
                            borderRadius: 7, fontSize: 12.5, color: '#9B3E2A',
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 22px', borderRadius: 8,
                                background: 'transparent', border: '1px solid rgba(160,110,70,0.25)',
                                color: '#7A5844', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#FAF7F2')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 26px', borderRadius: 8,
                                background: '#C07840', border: 'none',
                                color: '#FAF7F2', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 7,
                                boxShadow: '0 2px 12px rgba(192,120,64,0.35)',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#8B5A28')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#C07840')}
                        >
                            <Plus size={15} /> Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Projects Page ─────────────────────────────────────────────────────────────
export default function Projects() {
    const navigate = useNavigate()
    const openProject = useCineStore((s) => s.openProject)
    const setProjects = useCineStore((s) => s.setProjects)
    const projects = useCineStore((s) => s.projects)
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout)

    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [hoveredId, setHoveredId] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [loading, setLoading] = useState(true)

    // Fetch projects on mount
    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const data = await apiListProjects()
                if (!cancelled) {
                    setProjects(data)
                    setLoading(false)
                }
            } catch {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const filtered = projects.filter(
        (p) =>
            (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.genre || '').toLowerCase().includes(search.toLowerCase())
    )

    const handleOpen = (project) => {
        openProject(project.id)
        navigate(`/project/${project.id}`)
    }

    const handleCreate = async (form) => {
        try {
            const created = await apiCreateProject(form)
            setProjects([created, ...projects])
            openProject(created.id)
            navigate(`/project/${created.id}`)
        } catch (err) {
            console.error('Create project failed:', err)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const userName = user?.name || user?.email?.split('@')[0] || 'User'
    const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div
            className="page-in"
            style={{
                minHeight: '100vh',
                background: '#F5EFE5',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}
        >
            {/* Top bar */}
            <div style={{
                background: '#FFFFFF',
                borderBottom: '1px solid rgba(160,110,70,0.12)',
                padding: '0 40px',
                height: 60,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 20,
                boxShadow: '0 1px 8px rgba(100,60,20,0.06)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg,#C07840,#8B5A28)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(192,120,64,0.3)',
                    }}>
                        <Clapperboard size={16} color="#FAF7F2" />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, fontWeight: 700, color: '#2A1E14', lineHeight: 1.1 }}>Inception</div>
                        <div style={{ fontSize: 9, color: '#C07840', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Labs</div>
                    </div>
                </div>

                {/* User avatar + logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: '#7A5844' }}>{userName}</span>
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#C07840,#E8A870)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>{initials}</div>
                    <button onClick={handleLogout} title="Log out" style={{
                        background: 'none', border: '1px solid rgba(160,110,70,0.2)',
                        borderRadius: 6, padding: '6px 8px', cursor: 'pointer',
                        color: '#A07850', display: 'flex', alignItems: 'center',
                        transition: 'all 0.2s',
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#8B5A28'; e.currentTarget.style.borderColor = '#C07840' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#A07850'; e.currentTarget.style.borderColor = 'rgba(160,110,70,0.2)' }}
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>

            {/* Main */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>
                {/* Page title row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, fontWeight: 800, color: '#2A1E14', margin: 0 }}>
                        Projects
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#C0A888' }} />
                            <input
                                type="text"
                                placeholder="Search projects…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                                    border: '1px solid rgba(160,110,70,0.22)',
                                    borderRadius: 8, fontSize: 13, color: '#3A2818',
                                    background: '#FFFFFF', outline: 'none', width: 220,
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#C07840'; e.target.style.boxShadow = '0 0 0 3px rgba(192,120,64,0.1)' }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(160,110,70,0.22)'; e.target.style.boxShadow = 'none' }}
                            />
                        </div>

                        {/* Join with code */}
                        <button style={{
                            padding: '9px 16px', borderRadius: 8,
                            border: '1px solid rgba(160,110,70,0.28)',
                            background: '#FFFFFF', color: '#6B4E36',
                            fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 7,
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C07840'; e.currentTarget.style.background = '#FAF7F2' }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(160,110,70,0.28)'; e.currentTarget.style.background = '#FFFFFF' }}
                        >
                            <Users size={14} color="#C07840" />
                            Join with code
                        </button>

                        {/* Add new */}
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                padding: '9px 18px', borderRadius: 8,
                                background: '#C07840', border: 'none',
                                color: '#FAF7F2', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 7,
                                boxShadow: '0 2px 12px rgba(192,120,64,0.35)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#8B5A28'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#C07840'; e.currentTarget.style.transform = 'none' }}
                        >
                            <Plus size={15} />
                            Add new project
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1px solid rgba(160,110,70,0.14)',
                    overflow: 'hidden',
                    boxShadow: '0 2px 16px rgba(100,60,20,0.06)',
                }}>
                    {/* Table header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 240px 160px 48px',
                        padding: '0 24px',
                        height: 44,
                        background: '#FAF7F2',
                        borderBottom: '1px solid rgba(160,110,70,0.12)',
                        alignItems: 'center',
                    }}>
                        {['Name', 'Duration', 'Role', ''].map((col) => (
                            <div key={col} style={{ fontSize: 11.5, fontWeight: 700, color: '#A07850', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                {col}
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    {filtered.length === 0 ? (
                        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                            <Film size={32} color="#D4C0A8" style={{ marginBottom: 14 }} />
                            <p style={{ color: '#A07850', fontSize: 14, margin: 0 }}>
                                {search ? `No projects match "${search}"` : 'No projects yet. Create your first one!'}
                            </p>
                        </div>
                    ) : (
                        filtered.map((project, idx) => (
                            <div
                                key={project.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 240px 160px 48px',
                                    padding: '0 24px',
                                    height: 62,
                                    alignItems: 'center',
                                    borderBottom: idx < filtered.length - 1 ? '1px solid rgba(160,110,70,0.08)' : 'none',
                                    background: hoveredId === project.id ? '#FBF8F3' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={() => setHoveredId(project.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                onClick={() => handleOpen(project)}
                            >
                                {/* Name */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                                        background: 'linear-gradient(135deg, rgba(192,120,64,0.15), rgba(192,120,64,0.05))',
                                        border: '1px solid rgba(192,120,64,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Film size={15} color="#C07840" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#2A1E14' }}>{project.title}</div>
                                        <div style={{ fontSize: 11.5, color: '#A07850', marginTop: 1 }}>{project.genre}</div>
                                    </div>
                                </div>

                                {/* Duration */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Calendar size={12} color="#C0A888" />
                                    <span style={{ fontSize: 13, color: '#6B4E36' }}>
                                        {fmtDate(project.startDate)} – {fmtDate(project.endDate)}
                                    </span>
                                </div>

                                {/* Role */}
                                <div>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: 12,
                                        background: 'rgba(192,120,64,0.1)',
                                        border: '1px solid rgba(192,120,64,0.22)',
                                        fontSize: 12, color: '#8B5A28', fontWeight: 500,
                                    }}>
                                        {project.role}
                                    </span>
                                </div>

                                {/* Arrow */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ChevronRight size={16} color={hoveredId === project.id ? '#C07840' : '#D4C0A8'} style={{ transition: 'color 0.15s' }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Count */}
                <div style={{ marginTop: 14, fontSize: 12, color: '#C0A888', textAlign: 'right' }}>
                    {filtered.length} project{filtered.length !== 1 ? 's' : ''}
                    {search && ` matching "${search}"`}
                </div>
            </div>

            {/* Create modal */}
            {showModal && (
                <CreateModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
            )}

            {/* Delete confirm (right-click placeholder – not wired fully yet) */}
        </div>
    )
}
