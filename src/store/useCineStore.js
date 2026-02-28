import { create } from 'zustand'

const useCineStore = create((set, get) => ({
    // All projects list (populated from API)
    projects: [],
    activeProjectId: null,

    // Derived active project (null if none selected)
    get activeProject() {
        const id = get().activeProjectId
        return get().projects.find((p) => p.id === id) ?? null
    },

    ui: {
        activeScene: null,
        loading: false,
        sidebarCollapsed: false,
    },

    // Flag to prevent StoryStudio from auto-loading the latest generation
    skipAutoLoad: false,

    // ── Project actions ──────────────────────────────────────
    setProjects: (projects) => set({ projects }),

    openProject: (projectId) => set({ activeProjectId: projectId }),

    createProject: ({ title, genre, startDate, endDate }) => {
        const id = `proj-${Date.now()}`
        const proj = {
            id, title, genre,
            start_date: startDate, end_date: endDate,
            role: 'Owner',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        set((s) => ({ projects: [...s.projects, proj], activeProjectId: id }))
        return id
    },

    deleteProject: (projectId) =>
        set((s) => ({
            projects: s.projects.filter((p) => p.id !== projectId),
            activeProjectId: s.activeProjectId === projectId ? null : s.activeProjectId,
        })),

    // ── Script actions (operate on active project) ───────────
    updateScript: (newScript) =>
        set((s) => ({
            projects: s.projects.map((p) =>
                p.id === s.activeProjectId ? { ...p, script: newScript } : p
            ),
        })),

    rewriteSection: () =>
        set((s) => ({
            projects: s.projects.map((p) =>
                p.id === s.activeProjectId
                    ? { ...p, script: (p.script || '') + '\n\n/* [AI Rewrite Applied] */' }
                    : p
            ),
        })),

    changeTone: (tone) =>
        set((s) => ({
            projects: s.projects.map((p) =>
                p.id === s.activeProjectId
                    ? { ...p, script: (p.script || '') + `\n\n/* TONE SHIFT: ${tone.toUpperCase()} */\n` }
                    : p
            ),
        })),

    expandScene: () =>
        set((s) => ({
            projects: s.projects.map((p) =>
                p.id === s.activeProjectId
                    ? { ...p, script: (p.script || '') + '\n\n\t\t[Scene expanded with additional beats.]\n' }
                    : p
            ),
        })),

    compressScene: () =>
        set((s) => ({
            projects: s.projects.map((p) => {
                if (p.id !== s.activeProjectId) return p
                const compressed = (p.script || '').split('\n').filter((_, i) => i % 3 !== 2).join('\n')
                return { ...p, script: compressed }
            }),
        })),

    generateScript: () => {
        set((s) => ({ ui: { ...s.ui, loading: true } }))
        setTimeout(() => {
            set((s) => ({
                ui: { ...s.ui, loading: false },
            }))
        }, 1800)
    },

    // Store generation result from API onto the active project
    setGeneration: (gen) =>
        set((s) => ({
            projects: s.projects.map((p) => {
                if (p.id !== s.activeProjectId) return p
                // Map API field names to the frontend field names used by StoryStudio
                const scenes = (gen.shot_design || []).map((g, i) => ({
                    id: g.id || `scene-${i}`,
                    number: i + 1,
                    title: g.scene_title,
                }))
                return {
                    ...p,
                    generationId: gen.id || null,
                    script: gen.screenplay || '',
                    scenes,
                    shotBreakdown: (gen.shot_design || []).map((g) => ({
                        ...g,
                        sceneTitle: g.scene_title,
                        shots: (g.shots || []).map((shot) => ({
                            ...shot,
                            cameraAngle: shot.camera_angle,
                            emotionalTone: shot.emotional_tone,
                        })),
                    })),
                    soundPlan: (gen.sound_design || []).map((sc) => ({
                        ...sc,
                        sceneId: sc.scene_id,
                        sceneTitle: sc.scene_title,
                        timeOfDay: sc.time_of_day,
                        mixingNotes: sc.mixing_notes,
                    })),
                }
            }),
        })),

    // Clear the current generation from the active project (to start fresh input)
    clearGeneration: () =>
        set((s) => ({
            projects: s.projects.map((p) => {
                if (p.id !== s.activeProjectId) return p
                const { script, scenes, shotBreakdown, soundPlan, ...rest } = p
                return rest
            }),
        })),

    // ── UI actions ───────────────────────────────────────────
    setLoading: (loading) => set((s) => ({ ui: { ...s.ui, loading } })),
    toggleSidebar: () => set((s) => ({ ui: { ...s.ui, sidebarCollapsed: !s.ui.sidebarCollapsed } })),
    setActiveScene: (sceneId) => set((s) => ({ ui: { ...s.ui, activeScene: sceneId } })),
    setSkipAutoLoad: (val) => set({ skipAutoLoad: val }),
}))

export default useCineStore
