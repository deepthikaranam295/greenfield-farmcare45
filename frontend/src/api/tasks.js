import client from './client'

export const getMyTasks = (page = 1, size = 20) =>
  client.get('/api/tasks/my-tasks', { params: { page, size } }).then(r => r.data)

export const getTask = (id) =>
  client.get(`/api/tasks/${id}`).then(r => r.data.data)

export const createTask = (payload) =>
  client.post('/api/tasks', payload).then(r => r.data.data)

export const updateTaskStatus = (id, payload) =>
  client.put(`/api/tasks/${id}/status`, payload).then(r => r.data.data)
