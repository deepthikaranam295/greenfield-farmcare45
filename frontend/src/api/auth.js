import client from './client'

export const login = (email, password) =>
  client.post('/api/auth/login', { email, password }).then(r => r.data.data)

export const register = (payload) =>
  client.post('/api/auth/register', payload).then(r => r.data.data)

export const logout = () =>
  client.post('/api/auth/logout').then(r => r.data)

export const forgotPassword = (email) =>
  client.post('/api/auth/forgot-password', { email }).then(r => r.data)

export const resetPassword = (token, new_password) =>
  client.post('/api/auth/reset-password', { token, new_password }).then(r => r.data)

export const getMe = () =>
  client.get('/api/auth/me').then(r => r.data.data)
