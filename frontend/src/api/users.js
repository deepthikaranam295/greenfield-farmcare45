import client from './client'

export const getUsers = (page = 1, size = 20, role = null) => {
  const params = { page, size }
  if (role) params.role = role
  return client.get('/api/users', { params }).then(r => r.data)
}

export const createUser = (payload) =>
  client.post('/api/users', payload).then(r => r.data.data)

export const getTaskPerformance = (filters = {}) => {
  const params = {}
  if (filters.farmId)     params.farm_id     = filters.farmId
  if (filters.customerId) params.customer_id  = filters.customerId
  if (filters.assignedTo) params.assigned_to  = filters.assignedTo
  if (filters.dateFrom)   params.date_from    = filters.dateFrom
  if (filters.dateTo)     params.date_to      = filters.dateTo
  return client.get('/api/reports/task-performance', { params }).then(r => r.data.data)
}

export const deactivateUser = (id) =>
  client.patch(`/api/users/${id}/deactivate`).then(r => r.data.data)

export const activateUser = (id) =>
  client.patch(`/api/users/${id}/activate`).then(r => r.data.data)
