import client from './client'

export const submitLead = (formData) =>
  client.post('/api/public/leads', {
    name:          formData.name,
    whatsapp:      formData.whatsapp,
    city:          formData.city,
    farm_location: formData.farmLocation,
    farm_size:     formData.farmSize,
    services:      formData.services,
  }).then(r => r.data)

export const getLeads = (page = 1, size = 20, status = '', assigned_to = '') =>
  client.get('/api/leads', {
    params: { page, size, status: status || undefined, assigned_to: assigned_to || undefined },
  }).then(r => r.data)

export const getMyLeads = (page = 1, size = 20) =>
  client.get('/api/leads/mine', { params: { page, size } }).then(r => r.data)

export const updateLead = (id, payload) =>
  client.patch(`/api/leads/${id}`, payload).then(r => r.data)
