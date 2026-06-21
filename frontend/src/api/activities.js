import client from './client'

export const getActivities = (farmId, page = 1, size = 20) =>
  client.get(`/api/farms/${farmId}/activities`, { params: { page, size } }).then(r => r.data)

export const createActivity = (farmId, payload) =>
  client.post(`/api/farms/${farmId}/activities`, payload).then(r => r.data.data)

export const deleteActivity = (farmId, activityId) =>
  client.delete(`/api/farms/${farmId}/activities/${activityId}`).then(r => r.data)
