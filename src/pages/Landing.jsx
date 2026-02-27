import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Sparkles, X, Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

// ─── Input field helper ──────────────────────────────────────
function AuthInput({ label, type = 'text', icon: Icon, value, onChange, placeholder, rightEl }) {
    const [focused, setFocused] = useState(false)
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11.5, color: 'rgba(212,180,140,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>
                {label}
            </label>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px',
                background: 'rgba(255,245,225,0.06)',
                border: `1px solid ${focused ? 'rgba(212,160,90,0.6)' : 'rgba(212,160,90,0.22)'}`,
                borderRadius: 10,
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: focused ? '0 0 0 3px rgba(192,120,64,0.12)' : 'none',
            }}>
                <Icon size={15} color={focused ? 'rgba(212,160,90,0.9)' : 'rgba(212,160,90,0.45)'} style={{ flexShrink: 0 }} />
                <input
                    type={type} value={value} onChange={onChange} placeholder={placeholder}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{
                        flex: 1, background: 'transparent', border: 'none', outline: 'none',
                        fontSize: 14, color: 'rgba(255,245,225,0.92)',
                        fontFamily: 'Inter, sans-serif',
                    }}
                />
                {rightEl}
            </div>
        </div>
    )
}

// ─── Auth modal ──────────────────────────────────────────────
function AuthModal({ mode, onClose, onSwitch, onSuccess }) {
    const isLogin = mode === 'login'
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const authLogin = useAuthStore((s) => s.login)
    const authSignup = useAuthStore((s) => s.signup)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!email || !password || (!isLogin && !name)) {
            setError('Please fill in all fields.')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        setLoading(true)
        try {
            if (isLogin) {
                await authLogin(email, password)
            } else {
                await authSignup(email, password, name)
            }
            setLoading(false)
            onSuccess({ name: name || email.split('@')[0], email })
        } catch (err) {
            setLoading(false)
            setError(err.message || 'Authentication failed. Please try again.')
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,6,2,0.65)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.25s ease',
        }}>
            <div style={{
                width: '100%', maxWidth: 440,
                margin: '16px',
                background: 'rgba(28,18,8,0.88)',
                border: '1px solid rgba(212,160,90,0.25)',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,160,90,0.07)',
                backdropFilter: 'blur(20px)',
                animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '28px 32px 0',
                    background: 'linear-gradient(180deg, rgba(192,120,64,0.12) 0%, transparent 100%)',
                    borderBottom: '1px solid rgba(212,160,90,0.1)',
                    paddingBottom: 22,
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <Sparkles size={14} color="rgba(212,160,90,0.8)" />
                                <span style={{ fontSize: 10.5, color: 'rgba(212,160,90,0.7)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                                    Inception Labs
                                </span>
                            </div>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 800, color: 'rgba(255,245,225,0.97)', margin: 0, letterSpacing: '-0.01em' }}>
                                {isLogin ? 'Welcome back' : 'Create account'}
                            </h2>
                            <p style={{ fontSize: 13, color: 'rgba(220,185,140,0.55)', margin: '6px 0 0' }}>
                                {isLogin ? 'Sign in to your studio' : 'Start your cinematic journey'}
                            </p>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,240,210,0.07)', border: '1px solid rgba(212,160,90,0.15)', borderRadius: 8, padding: '6px', cursor: 'pointer', color: 'rgba(220,185,140,0.6)', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,240,210,0.13)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,240,210,0.07)' }}>
                            <X size={15} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '26px 32px 32px' }}>
                    {!isLogin && (
                        <AuthInput label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Mercer" />
                    )}
                    <AuthInput label="Email" type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" />
                    <AuthInput
                        label="Password" type={showPw ? 'text' : 'password'} icon={Lock}
                        value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                        rightEl={
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(212,160,90,0.45)', padding: 0, display: 'flex' }}>
                                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        }
                    />

                    {/* Error */}
                    {error && (
                        <div style={{ marginBottom: 14, padding: '9px 14px', background: 'rgba(180,60,40,0.15)', border: '1px solid rgba(220,80,60,0.3)', borderRadius: 8, fontSize: 12.5, color: 'rgba(255,160,130,0.9)' }}>
                            {error}
                        </div>
                    )}

                    {/* Forgot password */}
                    {isLogin && (
                        <div style={{ textAlign: 'right', marginBottom: 18, marginTop: -8 }}>
                            <span style={{ fontSize: 12, color: 'rgba(212,160,90,0.6)', cursor: 'pointer' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(212,160,90,0.95)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(212,160,90,0.6)' }}>
                                Forgot password?
                            </span>
                        </div>
                    )}

                    {/* Submit */}
                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '13px 0', borderRadius: 10,
                        background: loading ? 'rgba(192,120,64,0.5)' : 'linear-gradient(135deg,#C07840,#E8A850)',
                        border: 'none', color: '#FAF7F2',
                        fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                        boxShadow: loading ? 'none' : '0 4px 20px rgba(192,120,64,0.4)',
                        transition: 'all 0.25s ease', letterSpacing: '0.03em',
                        marginBottom: 20,
                    }}>
                        {loading ? (
                            <>
                                <div style={{ width: 15, height: 15, border: '2px solid rgba(255,245,225,0.4)', borderTopColor: '#FAF7F2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                {isLogin ? 'Signing in…' : 'Creating account…'}
                            </>
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={15} />
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,90,0.15)' }} />
                        <span style={{ fontSize: 11.5, color: 'rgba(212,160,90,0.4)' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,90,0.15)' }} />
                    </div>

                    {/* Google */}
                    <button type="button" style={{
                        width: '100%', padding: '11px 0',
                        background: 'rgba(255,245,225,0.05)', border: '1px solid rgba(212,160,90,0.2)',
                        borderRadius: 10, color: 'rgba(255,240,210,0.8)', fontSize: 13.5, fontWeight: 500,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        transition: 'all 0.2s ease', marginBottom: 22,
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,245,225,0.1)'; e.currentTarget.style.borderColor = 'rgba(212,160,90,0.4)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,245,225,0.05)'; e.currentTarget.style.borderColor = 'rgba(212,160,90,0.2)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" /><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" /><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" /><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" /></svg>
                        Continue with Google
                    </button>

                    {/* Switch mode */}
                    <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(220,185,140,0.5)' }}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <span onClick={onSwitch} style={{ color: 'rgba(212,160,90,0.85)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(228,176,100,1)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(212,160,90,0.85)' }}>
                            {isLogin ? 'Sign up free' : 'Sign in'}
                        </span>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main Landing ────────────────────────────────────────────
export default function Landing() {
    const navigate = useNavigate()
    const [fading, setFading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [modal, setModal] = useState(null) // 'login' | 'signup' | null
    const user = useAuthStore((s) => s.user)
    const authLoading = useAuthStore((s) => s.loading)

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 100)
        return () => clearTimeout(t)
    }, [])

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/projects', { replace: true })
        }
    }, [authLoading, user, navigate])

    const handleEnter = () => {
        setFading(true)
        setTimeout(() => navigate('/projects'), 900)
    }

    const handleAuthSuccess = ({ name }) => {
        setModal(null)
        setFading(true)
        setTimeout(() => navigate('/projects'), 900)
    }

    return (
        <div className="hero-bg film-grain" style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Gradient overlays */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,12,6,0.55) 0%, rgba(20,12,6,0.1) 35%, rgba(20,12,6,0.2) 65%, rgba(20,12,6,0.72) 100%)', pointerEvents: 'none', zIndex: 1 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(180,100,40,0.08)', pointerEvents: 'none', zIndex: 1 }} />

            {/* Top bar */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 48px', opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease' }}>

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 6, height: 32, background: 'linear-gradient(180deg, rgba(212,160,90,0.9), rgba(192,120,64,0.5))', borderRadius: 3 }} />
                    <div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'rgba(255,245,230,0.95)', letterSpacing: '0.04em', lineHeight: 1.2 }}>
                            Inception Labs
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(212,160,90,0.8)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                            AI Studio
                        </div>
                    </div>
                </div>

                {/* Nav + Auth */}
                <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                    {['Features', 'About'].map((label) => (
                        <span key={label} style={{ fontSize: 13, color: 'rgba(255,240,210,0.65)', letterSpacing: '0.08em', cursor: 'pointer', transition: 'color 0.2s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,240,210,1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,240,210,0.65)')}>
                            {label}
                        </span>
                    ))}

                    {/* Divider */}
                    <div style={{ width: 1, height: 18, background: 'rgba(212,160,90,0.25)' }} />

                    {/* Log in */}
                    <button onClick={() => setModal('login')} style={{
                        background: 'transparent', border: '1px solid rgba(212,160,90,0.35)',
                        borderRadius: 8, padding: '8px 20px',
                        color: 'rgba(255,240,210,0.85)', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', letterSpacing: '0.04em',
                        transition: 'all 0.2s ease',
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,160,90,0.12)'; e.currentTarget.style.borderColor = 'rgba(212,160,90,0.65)'; e.currentTarget.style.color = 'rgba(255,245,210,1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(212,160,90,0.35)'; e.currentTarget.style.color = 'rgba(255,240,210,0.85)' }}>
                        Log in
                    </button>

                    {/* Sign up */}
                    <button onClick={() => setModal('signup')} style={{
                        background: 'linear-gradient(135deg,#C07840,#E8A850)',
                        border: 'none', borderRadius: 8, padding: '8px 22px',
                        color: '#FAF7F2', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', letterSpacing: '0.04em',
                        boxShadow: '0 2px 14px rgba(192,120,64,0.4)',
                        transition: 'all 0.2s ease',
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(192,120,64,0.55)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 14px rgba(192,120,64,0.4)' }}>
                        Sign up free
                    </button>
                </div>
            </div>

            {/* Hero content — lower third */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '0 48px 72px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 1s ease 0.3s, transform 1s ease 0.3s' }}>

                {/* Tag */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(255,240,210,0.10)', border: '1px solid rgba(212,160,90,0.35)', borderRadius: 20, backdropFilter: 'blur(10px)', marginBottom: 22 }}>
                    <Sparkles size={11} color="rgba(212,160,90,0.9)" />
                    <span style={{ fontSize: 11, color: 'rgba(212,160,90,0.9)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                        AI-Powered Pre-Production
                    </span>
                </div>

                {/* Title */}
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(52px,7vw,88px)', fontWeight: 900, margin: '0 0 6px', lineHeight: 1.02, color: 'rgba(255,248,235,0.97)', letterSpacing: '-0.02em', textShadow: '0 2px 24px rgba(0,0,0,0.45)' }}>
                    Inception
                </h1>
                <h1 className="shimmer-text" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(52px,7vw,88px)', fontWeight: 900, margin: '0 0 24px', lineHeight: 1.02, letterSpacing: '-0.02em' }}>
                    Labs
                </h1>

                {/* Subtitle + CTA row */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
                    <div>
                        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(16px,2vw,21px)', fontStyle: 'italic', color: 'rgba(240,220,185,0.75)', margin: '0 0 28px', letterSpacing: '0.02em' }}>
                            "Where Stories Become Cinema."
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <button onClick={() => setModal('signup')} className="cta-button" style={{ padding: '15px 40px', fontSize: 13, fontWeight: 700, color: 'rgba(255,240,210,0.95)', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                                <span>Enter the Studio</span>
                                <ChevronRight size={16} />
                            </button>
                            <button onClick={() => setModal('login')} style={{ background: 'none', border: 'none', color: 'rgba(255,240,210,0.5)', fontSize: 13, cursor: 'pointer', letterSpacing: '0.06em', padding: '6px 0', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,240,210,0.85)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,240,210,0.5)' }}>
                                Already have an account →
                            </button>
                        </div>
                    </div>

                    {/* Feature tags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 4 }}>
                        {[
                            { label: 'Story Studio', sub: 'AI-assisted screenplay' },
                            { label: 'Shot Designer', sub: 'Camera & lighting plans' },
                            { label: 'Sound Design', sub: 'Music, foley & mix notes' },
                        ].map(({ label, sub }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(212,160,90,0.7)' }} />
                                <span style={{ fontSize: 12, color: 'rgba(255,240,210,0.55)', letterSpacing: '0.06em' }}>
                                    <span style={{ color: 'rgba(255,240,210,0.85)', fontWeight: 500 }}>{label}</span> — {sub}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Auth modal */}
            {modal && (
                <AuthModal
                    mode={modal}
                    onClose={() => setModal(null)}
                    onSwitch={() => setModal(modal === 'login' ? 'signup' : 'login')}
                    onSuccess={handleAuthSuccess}
                />
            )}

            {/* Fade out overlay */}
            {fading && (
                <div className="fade-to-black" style={{ position: 'fixed', inset: 0, background: '#FAF7F2', zIndex: 9998 }} />
            )}

            <style>{`
        @keyframes fadeIn  { from { opacity: 0 }               to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(28px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
        </div>
    )
}
