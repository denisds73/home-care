import { api } from './api'
import type {
  CreateTechnicianPayload,
  Technician,
  TechnicianStatus,
  UpdateTechnicianPayload,
} from '../types/domain'

interface Envelope<T> {
  success?: boolean
  data: T
  message?: string
}

export const technicianService = {
  listMine: async (): Promise<Technician[]> => {
    const res = await api.get<Envelope<Technician[]>>('/vendor/technicians')
    return res.data ?? []
  },

  get: async (id: string): Promise<Technician> => {
    const res = await api.get<Envelope<Technician>>(`/vendor/technicians/${id}`)
    return res.data
  },

  create: async (dto: CreateTechnicianPayload): Promise<Technician> => {
    const res = await api.post<Envelope<Technician>>('/vendor/technicians', dto)
    return res.data
  },

  update: async (
    id: string,
    dto: UpdateTechnicianPayload,
  ): Promise<Technician> => {
    const res = await api.patch<Envelope<Technician>>(
      `/vendor/technicians/${id}`,
      dto,
    )
    return res.data
  },

  updateStatus: async (
    id: string,
    status: TechnicianStatus,
  ): Promise<Technician> => {
    const res = await api.patch<Envelope<Technician>>(
      `/vendor/technicians/${id}/status`,
      { status },
    )
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete<Envelope<null>>(`/vendor/technicians/${id}`)
  },

  getMe: async (): Promise<Technician> => {
    const res = await api.get<Envelope<Technician>>('/technician/me')
    return res.data
  },
}
