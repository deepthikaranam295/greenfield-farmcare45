import client from './client'

export const getMyTasks = (page = 1, size = 20, sortBy = 'planned_end_date', statusFilter = null, filters = {}) => {
  const params = { page, size, sort_by: sortBy }
  if (statusFilter) params.status_filter = statusFilter
  if (filters.search)     params.search      = filters.search
  if (filters.customerId) params.customer_id = filters.customerId
  if (filters.farmId)     params.farm_id     = filters.farmId
  if (filters.assignedTo) params.assigned_to = filters.assignedTo
  if (filters.priority)   params.priority    = filters.priority
  return client.get('/api/tasks/my-tasks', { params }).then(r => r.data)
}

export const getCustomerTasks = (page = 1, size = 50, statusFilter = null) => {
  const params = { page, size }
  if (statusFilter) params.status_filter = statusFilter
  return client.get('/api/tasks/customer-tasks', { params }).then(r => r.data)
}

export const getServiceRequests = (page = 1, size = 20) =>
  client.get('/api/tasks/service-requests', { params: { page, size } }).then(r => r.data)

export const getTask = (id) =>
  client.get(`/api/tasks/${id}`).then(r => r.data.data)

export const createTask = (payload) =>
  client.post('/api/tasks', payload).then(r => r.data.data)

export const createServiceRequest = (payload) =>
  client.post('/api/tasks/service-requests', payload).then(r => r.data.data)

export const updateTask = (id, payload) =>
  client.put(`/api/tasks/${id}`, payload).then(r => r.data.data)

export const updateTaskStatus = (id, payload) =>
  client.put(`/api/tasks/${id}/status`, payload).then(r => r.data.data)

export const deleteTask = (id) =>
  client.delete(`/api/tasks/${id}`).then(r => r.data)
