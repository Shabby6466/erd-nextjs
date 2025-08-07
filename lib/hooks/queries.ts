import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationAPI } from '../api/applications'
import { dashboardAPI } from '../api/dashboard'
import { showNotification } from '../utils/notifications'

// Application Queries
export const useApplications = (filters?: any) => {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => applicationAPI.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

export const useApplication = (id: string) => {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationAPI.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

export const useCreateApplication = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: applicationAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      showNotification.success('Application created successfully')
    },
    onError: () => {
      showNotification.error('Failed to create application')
    }
  })
}

export const useApproveApplication = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      applicationAPI.approve(id, remarks),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      showNotification.success('Application approved successfully')
    },
    onError: () => {
      showNotification.error('Failed to approve application')
    }
  })
}

export const useRejectApplication = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
      applicationAPI.reject(id, remarks),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      showNotification.success('Application rejected successfully')
    },
    onError: () => {
      showNotification.error('Failed to reject application')
    }
  })
}

// Dashboard Queries
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'admin-stats'],
    queryFn: () => dashboardAPI.getAdminStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  })
}

export const useAgencyApplications = (filters?: any) => {
  return useQuery({
    queryKey: ['dashboard', 'agency-applications', filters],
    queryFn: () => dashboardAPI.getAgencyApplications(filters),
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}
