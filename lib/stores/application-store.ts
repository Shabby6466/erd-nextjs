import { create } from "zustand"

export interface Application {
  id: string
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED"
  citizen_id: string
  first_name: string
  last_name: string
  father_name: string
  mother_name: string
  date_of_birth: string
  nationality: string
  profession: string
  pakistan_city: string
  pakistan_address: string
  height: string
  color_of_eyes: string
  color_of_hair: string
  departure_date: string
  transport_mode: string
  createdAt: string
  updatedAt: string
}

export interface ApplicationFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
  state?:string
  submittedBy?:string
}

interface ApplicationState {
  applications: Application[]
  currentApplication: Application | null
  filters: ApplicationFilters
  isLoading: boolean
  setApplications: (applications: Application[]) => void
  setCurrentApplication: (application: Application | null) => void
  updateApplication: (id: string, data: Partial<Application>) => void
  setFilters: (filters: ApplicationFilters) => void
  setLoading: (loading: boolean) => void
  addApplication: (application: Application) => void
  removeApplication: (id: string) => void
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  currentApplication: null,
  filters: {
    page: 1,
    limit: 10,
  },
  isLoading: false,
  setApplications: (applications) => set({ applications }),
  setCurrentApplication: (application) => set({ currentApplication: application }),
  updateApplication: (id, data) =>
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...data } : app
      ),
      currentApplication:
        state.currentApplication?.id === id
          ? { ...state.currentApplication, ...data }
          : state.currentApplication,
    })),
  setFilters: (filters) => set({ filters }),
  setLoading: (loading) => set({ isLoading: loading }),
  addApplication: (application) =>
    set((state) => ({
      applications: [application, ...state.applications],
    })),
  removeApplication: (id) =>
    set((state) => ({
      applications: state.applications.filter((app) => app.id !== id),
    })),
}))