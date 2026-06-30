import client from './client'

export const submitLead = (formData) =>
  client.post('/api/public/leads', {
    name:             formData.name,
    email:            formData.email,
    phone:            formData.phone,
    whatsapp:         formData.phone,
    services:         formData.services,
    state:            formData.state,
    district:         formData.district,
    mandal:           formData.mandal,
    village:          formData.village,
    size_acres:       formData.sizeAcres,
    budget_range:     formData.budgetRange,
    farm_coordinates: formData.farmCoordinates,
    other_details:    formData.otherDetails,
  }).then(r => r.data)

export const getLeads = (page = 1, size = 20, status = '', assigned_to = '') =>
  client.get('/api/leads', {
    params: { page, size, status: status || undefined, assigned_to: assigned_to || undefined },
  }).then(r => r.data)

export const getMyLeads = (page = 1, size = 20) =>
  client.get('/api/leads/mine', { params: { page, size } }).then(r => r.data)

export const updateLead = (id, payload) =>
  client.patch(`/api/leads/${id}`, payload).then(r => r.data)
