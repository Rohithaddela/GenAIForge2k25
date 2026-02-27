/**
 * Auth store — manages user session, tokens, and auth state.
 * Persists tokens to localStorage, validates on app mount.
 */
import { create } from 'zustand'
import { apiLogin, apiSignup, apiLogout, apiGetMe } from '../api'

const useAuthStore = create((set, get) => ({
    user: null,        // { id, email, name }
    loading: true,     // true while restoring session on mount
    error: null,

    get isAuthenticated() {
        return !!get().user
    },

    // ── Actions ──────────────────────────────────────────────

    signup: async (email, password, name) => {
        set({ error: null })
        try {
            const data = await apiSignup(email, password, name)
            set({
                user: { id: data.user_id, email: data.email, name: data.name || email.split('@')[0] },
            })
            return data
        } catch (err) {
            set({ error: err.message })
            throw err
        }
    },

    login: async (email, password) => {
        set({ error: null })
        try {
            const data = await apiLogin(email, password)
            set({
                user: { id: data.user_id, email: data.email, name: data.name || email.split('@')[0] },
            })
            return data
        } catch (err) {
            set({ error: err.message })
            throw err
        }
    },

    logout: async () => {
        await apiLogout()
        set({ user: null, error: null })
    },

    /**
     * Called once on app mount — restores session from localStorage token.
     * If the token is invalid/expired, clears everything silently.
     */
    loadFromStorage: async () => {
        const token = localStorage.getItem('cf_access_token')
        if (!token) {
            set({ loading: false })
            return
        }
        try {
            const user = await apiGetMe()
            set({ user: { id: user.id, email: user.email, name: user.name }, loading: false })
        } catch {
            // Token is invalid — clear it
            localStorage.removeItem('cf_access_token')
            localStorage.removeItem('cf_refresh_token')
            set({ user: null, loading: false })
        }
    },

    clearError: () => set({ error: null }),
}))

export default useAuthStore
