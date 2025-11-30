import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle authentication errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('currentProjectId')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: async (email: string, password: string, fullName?: string) => {
    const { data } = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    })
    return data
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.access_token)
    return data
  },

  logout: () => {
    localStorage.removeItem('token')
  },
}

// Projects API
export const projectsAPI = {
  list: async () => {
    const { data } = await api.get('/projects')
    return data
  },

  create: async (name: string, description?: string) => {
    const { data } = await api.post('/projects', { name, description })
    return data
  },
}

// Traces API
export const tracesAPI = {
  list: async (projectId: string, skip = 0, limit = 50) => {
    const { data } = await api.get(`/traces/${projectId}`, {
      params: { skip, limit },
    })
    return data
  },

  getDetail: async (traceId: string) => {
    const { data } = await api.get(`/traces/detail/${traceId}`)
    return data
  },
}

// Analytics API
export const analyticsAPI = {
  getSummary: async (
    timeRange: string = 'last_24h',
    startDate?: Date,
    endDate?: Date,
    projectIds?: string[]
  ) => {
    const params: any = { time_range: timeRange }
    
    if (startDate) params.start_date = startDate.toISOString()
    if (endDate) params.end_date = endDate.toISOString()
    if (projectIds && projectIds.length > 0) {
      params.project_ids = projectIds.join(',')
    }
    
    const { data } = await api.get('/analytics/summary', { params })
    return data
  },

  getTrends: async (
    timeRange: string = 'last_24h',
    startDate?: Date,
    endDate?: Date,
    projectIds?: string[]
  ) => {
    const params: any = { time_range: timeRange }
    
    if (startDate) params.start_date = startDate.toISOString()
    if (endDate) params.end_date = endDate.toISOString()
    if (projectIds && projectIds.length > 0) {
      params.project_ids = projectIds.join(',')
    }
    
    const { data } = await api.get('/analytics/trends', { params })
    return data
  },

  getModels: async (
    timeRange: string = 'last_24h',
    startDate?: Date,
    endDate?: Date,
    projectIds?: string[]
  ) => {
    const params: any = { time_range: timeRange }
    
    if (startDate) params.start_date = startDate.toISOString()
    if (endDate) params.end_date = endDate.toISOString()
    if (projectIds && projectIds.length > 0) {
      params.project_ids = projectIds.join(',')
    }
    
    const { data } = await api.get('/analytics/models', { params })
    return data
  },

  getTopTraces: async (
    timeRange: string = 'last_24h',
    startDate?: Date,
    endDate?: Date,
    projectIds?: string[],
    limit: number = 10,
    sortBy: string = 'tokens'
  ) => {
    const params: any = {
      time_range: timeRange,
      limit,
      sort_by: sortBy,
    }
    
    if (startDate) params.start_date = startDate.toISOString()
    if (endDate) params.end_date = endDate.toISOString()
    if (projectIds && projectIds.length > 0) {
      params.project_ids = projectIds.join(',')
    }
    
    const { data } = await api.get('/analytics/top-traces', { params })
    return data
  },

  exportData: async (
    format: 'csv' | 'json',
    timeRange: string = 'last_24h',
    startDate?: Date,
    endDate?: Date,
    projectIds?: string[]
  ) => {
    const params: any = {
      format,
      time_range: timeRange,
    }
    
    if (startDate) params.start_date = startDate.toISOString()
    if (endDate) params.end_date = endDate.toISOString()
    if (projectIds && projectIds.length > 0) {
      params.project_ids = projectIds.join(',')
    }
    
    const response = await api.get('/analytics/export', {
      params,
      responseType: 'blob',
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    const timestamp = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `analytics-${timestamp}.${format}`)
    
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
