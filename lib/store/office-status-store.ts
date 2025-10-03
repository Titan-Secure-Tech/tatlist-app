import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type OfficeStatus = 'in-office' | 'out-of-office'

export interface OfficeStatusInfo {
  status: OfficeStatus
  lastUpdated: string
  updatedBy?: string
  note?: string
}

interface OfficeStatusStore {
  status: OfficeStatus
  lastUpdated: string
  updatedBy?: string
  note?: string
  isInOffice: boolean
  isOutOfOffice: boolean
  setStatus: (status: OfficeStatus, updatedBy?: string, note?: string) => void
  toggleStatus: (updatedBy?: string, note?: string) => void
  getStatusInfo: () => OfficeStatusInfo
}

export const useOfficeStatusStore = create<OfficeStatusStore>()(
  persist(
    (set, get) => ({
      status: 'in-office',
      lastUpdated: new Date().toISOString(),
      updatedBy: undefined,
      note: undefined,
      isInOffice: true,
      isOutOfOffice: false,

      setStatus: (status: OfficeStatus, updatedBy?: string, note?: string) => {
        set({
          status,
          lastUpdated: new Date().toISOString(),
          updatedBy,
          note,
          isInOffice: status === 'in-office',
          isOutOfOffice: status === 'out-of-office',
        })
      },

      toggleStatus: (updatedBy?: string, note?: string) => {
        const currentStatus = get().status
        const newStatus: OfficeStatus = currentStatus === 'in-office' ? 'out-of-office' : 'in-office'
        
        set({
          status: newStatus,
          lastUpdated: new Date().toISOString(),
          updatedBy,
          note,
          isInOffice: newStatus === 'in-office',
          isOutOfOffice: newStatus === 'out-of-office',
        })
      },

      getStatusInfo: () => {
        const state = get()
        return {
          status: state.status,
          lastUpdated: state.lastUpdated,
          updatedBy: state.updatedBy,
          note: state.note,
        }
      },
    }),
    {
      name: 'tatlist-office-status',
    }
  )
)

// Convenience hook with simplified interface
export const useOfficeStatus = () => {
  const store = useOfficeStatusStore()
  return {
    status: store.status,
    isInOffice: store.isInOffice,
    isOutOfOffice: store.isOutOfOffice,
    lastUpdated: store.lastUpdated,
    updatedBy: store.updatedBy,
    note: store.note,
    setStatus: store.setStatus,
    toggleStatus: store.toggleStatus,
    getStatusInfo: store.getStatusInfo,
  }
}