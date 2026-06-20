import client from './client'

export const getCameras = (farmId) =>
  client.get(`/api/farms/${farmId}/cameras`).then(r => r.data.data ?? [])

export const createCamera = (farmId, payload) =>
  client.post(`/api/farms/${farmId}/cameras`, payload).then(r => r.data.data)

export const updateCamera = (farmId, cameraId, payload) =>
  client.put(`/api/farms/${farmId}/cameras/${cameraId}`, payload).then(r => r.data.data)

export const deleteCamera = (farmId, cameraId) =>
  client.delete(`/api/farms/${farmId}/cameras/${cameraId}`).then(r => r.data)
