import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useCineStore from '../store/useCineStore'
import {
    apiGetCallSheet, apiAddCallSheetEntry,
    apiUpdateCallSheetEntry, apiDeleteCallSheetEntry,
} from '../api'
import {
    Users, Plus, Trash2, Edit3, Check, X, Calendar, Phone, Mail,
    User, Film, Loader2, ChevronDown, ChevronUp, Save, Clock,
    AlertCircle, CheckCircle2, StickyNote
} from 'lucide-react'

// ── Date helpers ─────────────────────────────────────────────
function fmtDate(iso) {
    if (!iso) return ''
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function getWeekday(iso) {
    if (!iso) return ''
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString([], { weekday: 'short' })
}

function isFuture(iso) {
    return new Date(iso + 'T00:00:00') >= new Date(new Date().toDateString())
}

// ── Available-Dates Chip Group ──────────────────────────────
function DateChips({ dates }) {
    if (!dates || dates.length === 0) {
        return <span style={{ fontSize: 11, color: '#C0A888', fontStyle: 'italic' }}>No dates set</span>
    }
    return (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {dates.sort().map((d) => (
                <span key={d} style={{
                    padding: '3px 9px', borderRadius: 6, fontSize: 10.5, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 3,
                    background: isFuture(d) ? 'rgba(45,139,94,0.08)' : 'rgba(180,140,100,0.08)',
                    border: `1px solid ${isFuture(d) ? 'rgba(45,139,94,0.25)' : 'rgba(180,140,100,0.2)'}`,
                    color: isFuture(d) ? '#2D8B5E' : '#A08060',
                }}>
                    <Calendar size={9} /> {getWeekday(d)} {fmtDate(d)}
                </span>
            ))}
        </div>
    )
}

// ── Add / Edit Form ─────────────────────────────────────────
function EntryForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState({
        name: initial?.name ?? '',
        role: initial?.role ?? '',
        phone: initial?.phone ?? '',
        email: initial?.email ?? '',
        notes: initial?.notes ?? '',
        available_dates: initial?.available_dates ?? [],
    })
    const [dateInput, setDateInput] = useState('')
    const nameRef = useRef(null)
    useEffect(() => { nameRef.current?.focus() }, [])

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
    const addDate = () => {
        if (dateInput && !form.available_dates.includes(dateInput)) {
            set('available_dates', [...form.available_dates, dateInput])
            setDateInput('')
        }
    }
    const removeDate = (d) => set('available_dates', form.available_dates.filter((x) => x !== d))

    const inputStyle = {
        width: '100%', padding: '10px 13px', borderRadius: 9,
        border: '1px solid rgba(160,110,70,0.2)', fontSize: 13, color: '#2A1E14',
        background: '#FFFFFF', outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    }
    const focusStyle = (e) => { e.target.style.borderColor = '#C07840'; e.target.style.boxShadow = '0 0 0 3px rgba(192,120,64,0.1)' }
    const blurStyle = (e) => { e.target.style.borderColor = 'rgba(160,110,70,0.2)'; e.target.style.boxShadow = 'none' }

    return (
        <div style={{
            background: '#FFFFFF', borderRadius: 16,
            border: '1px solid rgba(192,120,64,0.2)',
            padding: 28, boxShadow: '0 8px 32px rgba(100,60,20,0.1)',
        }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#8B5A28', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>
                        <User size={10} style={{ marginRight: 4, verticalAlign: '-1px' }} /> Name *
                    </label>
                    <input ref={nameRef} value={form.name} onChange={(e) => set('name', e.target.value)}
                        placeholder="Actor / crew name" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#8B5A28', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>
                        <Film size={10} style={{ marginRight: 4, verticalAlign: '-1px' }} /> Role
                    </label>
                    <input value={form.role} onChange={(e) => set('role', e.target.value)}
                        placeholder="e.g. Lead Actor, Villain, DP" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#8B5A28', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>
                        <Phone size={10} style={{ marginRight: 4, verticalAlign: '-1px' }} /> Phone
                    </label>
                    <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                        placeholder="+91 98765 43210" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#8B5A28', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>
                        <Mail size={10} style={{ marginRight: 4, verticalAlign: '-1px' }} /> Email
                    </label>
                    <input value={form.email} onChange={(e) => set('email', e.target.value)}
                        placeholder="actor@example.com" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
            </div>

            <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#8B5A28', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>
                    <StickyNote size={10} style={{ marginRight: 4, verticalAlign: '-1px' }} /> Notes
                </label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                    placeholder="Special requirements, allergies, notes…" rows={2}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} onFocus={focusStyle} onBlur={blurStyle}
                />
            </div>

            {/* Dates */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#8B5A28', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>
                    <Calendar size={10} style={{ marginRight: 4, verticalAlign: '-1px' }} /> Available Dates
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)}
                        style={{ ...inputStyle, flex: 1, maxWidth: 200 }} onFocus={focusStyle} onBlur={blurStyle}
                    />
                    <button onClick={addDate} disabled={!dateInput}
                        style={{
                            padding: '8px 16px', borderRadius: 9,
                            background: dateInput ? '#C07840' : 'rgba(160,110,70,0.15)',
                            border: 'none', color: dateInput ? '#FAF7F2' : '#C0A888',
                            fontSize: 12, fontWeight: 600, cursor: dateInput ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                        <Plus size={13} /> Add
                    </button>
                </div>
                {form.available_dates.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {form.available_dates.sort().map((d) => (
                            <span key={d} style={{
                                padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: 5,
                                background: 'rgba(45,139,94,0.08)', border: '1px solid rgba(45,139,94,0.25)',
                                color: '#2D8B5E',
                            }}>
                                {getWeekday(d)} {fmtDate(d)}
                                <button onClick={() => removeDate(d)} style={{
                                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                                    color: '#B04040', display: 'flex',
                                }}><X size={11} /></button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => form.name.trim() && onSave(form)} disabled={!form.name.trim() || saving}
                    style={{
                        padding: '11px 24px', borderRadius: 10,
                        background: form.name.trim() ? 'linear-gradient(135deg,#C07840,#E8A850)' : 'rgba(160,110,70,0.2)',
                        border: 'none', color: form.name.trim() ? '#FAF7F2' : '#C0A888',
                        fontSize: 13, fontWeight: 700, cursor: form.name.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: 7,
                        boxShadow: form.name.trim() ? '0 3px 14px rgba(192,120,64,0.3)' : 'none',
                        transition: 'all 0.2s',
                    }}>
                    {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                    {initial ? 'Update' : 'Add to Call Sheet'}
                </button>
                <button onClick={onCancel} style={{
                    padding: '11px 18px', borderRadius: 10,
                    background: 'transparent', border: '1px solid rgba(192,120,64,0.25)',
                    color: '#8B5A28', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

// ── Entry Row ───────────────────────────────────────────────
function EntryRow({ entry, onEdit, onDelete, deleting }) {
    const [expanded, setExpanded] = useState(false)
    const initials = (entry.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div style={{
            background: '#FFFFFF', borderRadius: 14,
            border: '1px solid rgba(160,110,70,0.12)',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s ease',
        }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(100,60,20,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
        >
            {/* Main row */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                cursor: 'pointer',
            }} onClick={() => setExpanded(!expanded)}>
                {/* Avatar */}
                <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, #C07840, #E8A850)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#FAF7F2',
                    boxShadow: '0 2px 10px rgba(192,120,64,0.2)',
                }}>
                    {initials}
                </div>

                {/* Name & role */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2A1E14' }}>{entry.name}</div>
                    {entry.role && <div style={{ fontSize: 12, color: '#A07850', marginTop: 1 }}>{entry.role}</div>}
                </div>

                {/* Date count badge */}
                <div style={{
                    padding: '4px 10px', borderRadius: 8,
                    background: (entry.available_dates?.length || 0) > 0 ? 'rgba(45,139,94,0.08)' : 'rgba(180,120,60,0.08)',
                    border: `1px solid ${(entry.available_dates?.length || 0) > 0 ? 'rgba(45,139,94,0.2)' : 'rgba(180,120,60,0.15)'}`,
                    fontSize: 11, fontWeight: 600,
                    color: (entry.available_dates?.length || 0) > 0 ? '#2D8B5E' : '#A08060',
                    display: 'flex', alignItems: 'center', gap: 4,
                }}>
                    <Calendar size={10} /> {entry.available_dates?.length || 0} date{entry.available_dates?.length !== 1 ? 's' : ''}
                </div>

                {/* Expand toggle */}
                {expanded ? <ChevronUp size={16} color="#C0A888" /> : <ChevronDown size={16} color="#C0A888" />}
            </div>

            {/* Expanded details */}
            {expanded && (
                <div style={{
                    padding: '0 20px 18px', borderTop: '1px solid rgba(160,110,70,0.08)',
                    paddingTop: 14,
                    animation: 'fadeIn 0.2s ease',
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                        {entry.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#6B4E36' }}>
                                <Phone size={12} color="#C07840" /> {entry.phone}
                            </div>
                        )}
                        {entry.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#6B4E36' }}>
                                <Mail size={12} color="#C07840" /> {entry.email}
                            </div>
                        )}
                    </div>

                    {entry.notes && (
                        <div style={{
                            padding: '8px 12px', background: '#FAF7F2', borderRadius: 8,
                            border: '1px solid rgba(160,110,70,0.08)',
                            fontSize: 12, color: '#6B4E36', fontStyle: 'italic', lineHeight: 1.5,
                            marginBottom: 14,
                        }}>
                            {entry.notes}
                        </div>
                    )}

                    {/* Dates */}
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#A07850', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                            Available Dates
                        </div>
                        <DateChips dates={entry.available_dates} />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(entry) }}
                            style={{
                                padding: '7px 14px', borderRadius: 8,
                                background: 'transparent', border: '1px solid rgba(192,120,64,0.25)',
                                color: '#8B5A28', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 5,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(192,120,64,0.06)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                            <Edit3 size={11} /> Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
                            disabled={deleting}
                            style={{
                                padding: '7px 14px', borderRadius: 8,
                                background: 'transparent', border: '1px solid rgba(200,60,60,0.2)',
                                color: '#B04040', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 5,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,60,60,0.05)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                            <Trash2 size={11} /> Remove
                        </button>
                    </div>
                </div>
            )}

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: none } }`}</style>
        </div>
    )
}

// ── Main Page ───────────────────────────────────────────────
export default function CallSheet() {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const projects = useCineStore((s) => s.projects)
    const openProject = useCineStore((s) => s.openProject)
    const project = projects.find((p) => p.id === projectId) ?? {}

    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editEntry, setEditEntry] = useState(null)

    // Fetch on mount
    useEffect(() => {
        if (!projectId) return
        openProject(projectId)
        let cancelled = false
        apiGetCallSheet(projectId)
            .then((data) => { if (!cancelled) setEntries(data || []) })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [projectId])

    const handleAdd = async (form) => {
        setSaving(true)
        try {
            const entry = await apiAddCallSheetEntry(projectId, form)
            setEntries((prev) => [...prev, entry])
            setShowForm(false)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleUpdate = async (form) => {
        setSaving(true)
        try {
            const updated = await apiUpdateCallSheetEntry(editEntry.id, form)
            setEntries((prev) => prev.map((e) => e.id === editEntry.id ? updated : e))
            setEditEntry(null)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        setDeleting(true)
        try {
            await apiDeleteCallSheetEntry(id)
            setEntries((prev) => prev.filter((e) => e.id !== id))
        } catch (err) {
            console.error(err)
        } finally {
            setDeleting(false)
        }
    }

    // Find ALL common dates: dates where 2+ people are free
    const dateCounts = {}
    entries.forEach((e) => {
        (e.available_dates || []).forEach((d) => {
            if (isFuture(d)) dateCounts[d] = (dateCounts[d] || 0) + 1
        })
    })
    // All dates where at least 2 people are free, sorted by date
    const commonDates = Object.entries(dateCounts)
        .filter(([, count]) => count >= 2)
        .sort((a, b) => a[0].localeCompare(b[0]))

    // Group consecutive dates into ranges
    function groupIntoRanges(dates) {
        if (dates.length === 0) return []
        const ranges = []
        let rangeStart = dates[0]
        let rangePrev = dates[0]
        let rangeMinCount = dates[0][1]

        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(rangePrev[0] + 'T00:00:00')
            const currDate = new Date(dates[i][0] + 'T00:00:00')
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24)

            if (diffDays === 1) {
                rangePrev = dates[i]
                rangeMinCount = Math.min(rangeMinCount, dates[i][1])
            } else {
                ranges.push({ start: rangeStart, end: rangePrev, minCount: rangeMinCount })
                rangeStart = dates[i]
                rangePrev = dates[i]
                rangeMinCount = dates[i][1]
            }
        }
        ranges.push({ start: rangeStart, end: rangePrev, minCount: rangeMinCount })
        return ranges
    }

    const dateRanges = groupIntoRanges(commonDates)
    const bestDate = commonDates.length > 0
        ? [...commonDates].sort((a, b) => b[1] - a[1])[0]
        : null

    return (
        <div className="page-in" style={{ display: 'flex', minHeight: '100vh', background: '#F5EFE5' }}>
            <Sidebar />

            <main style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 6 }}>
                        <div style={{ width: 4, height: 26, background: 'linear-gradient(180deg,#C07840,#E8B870)', borderRadius: 2 }} />
                        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#2A1E14', margin: 0 }}>
                            Call Sheet
                        </h1>
                        <span style={{ marginLeft: 6, fontSize: 13, color: '#A07850' }}>— {project.title || 'Project'}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#A07850', margin: '0 0 0 15px' }}>
                        Manage cast & crew availability to plan your shoot days.
                    </p>
                </div>

                {/* Summary stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 14, marginBottom: 14 }}>
                    <div style={{
                        background: '#FFFFFF', borderRadius: 12,
                        border: '1px solid rgba(160,110,70,0.12)',
                        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(192,120,64,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={18} color="#C07840" />
                        </div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#2A1E14' }}>{entries.length}</div>
                            <div style={{ fontSize: 11, color: '#A07850', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cast & Crew</div>
                        </div>
                    </div>

                    <div style={{
                        background: '#FFFFFF', borderRadius: 12,
                        border: '1px solid rgba(160,110,70,0.12)',
                        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(45,139,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={18} color="#2D8B5E" />
                        </div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#2A1E14' }}>{entries.filter(e => (e.available_dates?.length || 0) > 0).length}</div>
                            <div style={{ fontSize: 11, color: '#A07850', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Have Dates</div>
                        </div>
                    </div>

                    {bestDate && (
                        <div style={{
                            background: 'linear-gradient(135deg, #2A1E14, #3A2818)', borderRadius: 12,
                            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                        }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(232,200,144,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={18} color="#E8C890" />
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#E8C890' }}>
                                    {fmtDate(bestDate[0])}
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(232,200,144,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Best Day ({bestDate[1]}/{entries.length} free)
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Common Availability Panel ─────────────────── */}
                {commonDates.length > 0 && (
                    <div style={{
                        background: '#FFFFFF', borderRadius: 14,
                        border: '1px solid rgba(160,110,70,0.12)',
                        padding: '20px 24px', marginBottom: 24,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <Calendar size={15} color="#C07840" />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#2A1E14' }}>
                                Common Availability
                            </span>
                            <span style={{
                                padding: '2px 8px', borderRadius: 6,
                                background: 'rgba(45,139,94,0.08)', border: '1px solid rgba(45,139,94,0.2)',
                                fontSize: 10.5, fontWeight: 600, color: '#2D8B5E',
                            }}>
                                {commonDates.length} date{commonDates.length !== 1 ? 's' : ''} with 2+ free
                            </span>
                        </div>

                        {/* Date ranges & individual dates */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {dateRanges.map((range, idx) => {
                                const isRange = range.start[0] !== range.end[0]
                                const maxCount = Math.max(...commonDates.map(d => d[1]))
                                // Get all individual dates in this range with their counts
                                const rangeDates = commonDates.filter(([d]) => d >= range.start[0] && d <= range.end[0])

                                return (
                                    <div key={idx} style={{
                                        padding: '12px 16px', borderRadius: 10,
                                        background: range.start[0] === bestDate?.[0] || (isRange && rangeDates.some(d => d[0] === bestDate?.[0]))
                                            ? 'rgba(45,139,94,0.04)' : '#FAF7F2',
                                        border: range.start[0] === bestDate?.[0] || (isRange && rangeDates.some(d => d[0] === bestDate?.[0]))
                                            ? '1px solid rgba(45,139,94,0.2)' : '1px solid rgba(160,110,70,0.06)',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isRange ? 8 : 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Calendar size={12} color="#C07840" />
                                                <span style={{ fontSize: 13, fontWeight: 600, color: '#2A1E14' }}>
                                                    {isRange
                                                        ? `${fmtDate(range.start[0])} — ${fmtDate(range.end[0])}`
                                                        : `${getWeekday(range.start[0])} ${fmtDate(range.start[0])}`
                                                    }
                                                </span>
                                                {isRange && (
                                                    <span style={{
                                                        padding: '1px 6px', borderRadius: 4,
                                                        background: 'rgba(192,120,64,0.08)',
                                                        fontSize: 10, fontWeight: 600, color: '#8B5A28',
                                                    }}>
                                                        {rangeDates.length} consecutive days
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                                background: range.minCount === entries.length
                                                    ? 'rgba(45,139,94,0.12)' : 'rgba(192,120,64,0.08)',
                                                color: range.minCount === entries.length ? '#2D8B5E' : '#8B5A28',
                                            }}>
                                                {isRange ? `${range.minCount}–${Math.max(...rangeDates.map(d => d[1]))}` : range.start[1]}/{entries.length} free
                                            </span>
                                        </div>

                                        {/* Expanded breakdown for ranges */}
                                        {isRange && (
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 20 }}>
                                                {rangeDates.map(([d, count]) => (
                                                    <div key={d} style={{
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        padding: '4px 10px', borderRadius: 7,
                                                        background: count === entries.length
                                                            ? 'rgba(45,139,94,0.08)' : 'rgba(192,120,64,0.06)',
                                                        border: `1px solid ${count === entries.length
                                                            ? 'rgba(45,139,94,0.2)' : 'rgba(192,120,64,0.12)'}`,
                                                    }}>
                                                        <span style={{
                                                            fontSize: 10.5, fontWeight: 600,
                                                            color: count === entries.length ? '#2D8B5E' : '#6B4E36',
                                                        }}>
                                                            {getWeekday(d)} {fmtDate(d)}
                                                        </span>
                                                        <div style={{
                                                            width: 32, height: 4, borderRadius: 2,
                                                            background: 'rgba(160,110,70,0.1)',
                                                            overflow: 'hidden',
                                                        }}>
                                                            <div style={{
                                                                width: `${(count / entries.length) * 100}%`,
                                                                height: '100%', borderRadius: 2,
                                                                background: count === entries.length
                                                                    ? '#2D8B5E' : '#C07840',
                                                            }} />
                                                        </div>
                                                        <span style={{
                                                            fontSize: 9.5, fontWeight: 700,
                                                            color: count === entries.length ? '#2D8B5E' : '#A07850',
                                                        }}>
                                                            {count}/{entries.length}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Single date: show progress bar inline */}
                                        {!isRange && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, marginLeft: 20 }}>
                                                <div style={{
                                                    flex: 1, maxWidth: 120, height: 5, borderRadius: 3,
                                                    background: 'rgba(160,110,70,0.1)', overflow: 'hidden',
                                                }}>
                                                    <div style={{
                                                        width: `${(range.start[1] / entries.length) * 100}%`,
                                                        height: '100%', borderRadius: 3,
                                                        background: range.start[1] === entries.length ? '#2D8B5E' : '#C07840',
                                                        transition: 'width 0.3s ease',
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: 10, color: '#A07850' }}>
                                                    {entries.filter(e => (e.available_dates || []).includes(range.start[0])).map(e => e.name).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Add button */}
                <div style={{ marginBottom: 20 }}>
                    {!showForm && !editEntry && (
                        <button onClick={() => setShowForm(true)}
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
                            <Plus size={15} /> Add Cast / Crew
                        </button>
                    )}
                </div>

                {/* Form */}
                {showForm && (
                    <div style={{ marginBottom: 20 }}>
                        <EntryForm onSave={handleAdd} onCancel={() => setShowForm(false)} saving={saving} />
                    </div>
                )}
                {editEntry && (
                    <div style={{ marginBottom: 20 }}>
                        <EntryForm initial={editEntry} onSave={handleUpdate} onCancel={() => setEditEntry(null)} saving={saving} />
                    </div>
                )}

                {/* Entries list */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Loader2 size={28} color="#C07840" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                        <p style={{ color: '#A07850', fontSize: 14 }}>Loading call sheet…</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    </div>
                ) : entries.length === 0 && !showForm ? (
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
                            <Users size={24} color="#C0A888" />
                        </div>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#2A1E14', margin: '0 0 8px' }}>No cast or crew yet</h3>
                        <p style={{ fontSize: 13, color: '#A07850', margin: '0 0 20px' }}>
                            Add actors and crew members with their available dates to start planning your shoot.
                        </p>
                        <button onClick={() => setShowForm(true)}
                            style={{
                                padding: '10px 22px', borderRadius: 8,
                                background: 'linear-gradient(135deg,#C07840,#E8A850)',
                                border: 'none', color: '#FAF7F2',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                boxShadow: '0 3px 14px rgba(192,120,64,0.35)',
                            }}>
                            <Plus size={14} /> Add Your First Entry
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {entries.map((entry) => (
                            <EntryRow key={entry.id} entry={entry}
                                onEdit={(e) => { setEditEntry(e); setShowForm(false) }}
                                onDelete={handleDelete} deleting={deleting}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
