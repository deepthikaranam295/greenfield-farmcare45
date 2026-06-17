import client from './client'

export const getReport = (id) =>
  client.get(`/api/reports/${id}`).then(r => r.data.data)

export const createReport = (payload) =>
  client.post('/api/reports', payload).then(r => r.data.data)

export const getFarmReports = (farmId, page = 1, size = 20) =>
  client.get(`/api/reports/farm/${farmId}`, { params: { page, size } }).then(r => r.data)

export const uploadPhoto = (reportId, file, caption = '') => {
  const form = new FormData()
  form.append('file', file)
  form.append('caption', caption)
  return client.post(`/api/reports/${reportId}/photos`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data.data)
}
