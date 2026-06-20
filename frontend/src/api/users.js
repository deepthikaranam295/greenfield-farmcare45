import client from './client'

export const getUsers = (page = 1, size = 20) =>
  client.get('/api/users', { params: { page, size } }).then(r => r.data)

export const createUser = (payload) =>
  client.post('/api/users', payload).then(r => r.data.data)

export const deactivateUser = (id) =>
  client.patch(`/api/users/${id}/deactivate`).then(r => r.data.data)

export const activateUser = (id) =>
  client.patch(`/api/users/${id}/activate`).then(r => r.data.data)
