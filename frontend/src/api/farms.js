import client from './client'

export const getFarms = (page = 1, size = 20) =>
  client.get('/api/farms', { params: { page, size } }).then(r => r.data)

export const getFarm = (id) =>
  client.get(`/api/farms/${id}`).then(r => r.data.data)

export const createFarm = (payload) =>
  client.post('/api/farms', payload).then(r => r.data.data)

export const updateFarm = (id, payload) =>
  client.put(`/api/farms/${id}`, payload).then(r => r.data.data)

export const getFarmTasks = (id, page = 1, size = 20) =>
  client.get(`/api/farms/${id}/tasks`, { params: { page, size } }).then(r => r.data)

export const getFarmReports = (id, page = 1, size = 20) =>
  client.get(`/api/farms/${id}/reports`, { params: { page, size } }).then(r => r.data)
