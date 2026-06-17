import client from './client'

export async function submitContact(formData) {
  const res = await client.post('/api/v1/public/contact', {
    name:         formData.name,
    whatsapp:     formData.whatsapp,
    city:         formData.city,
    farmLocation: formData.farmLocation,
    farmSize:     formData.farmSize,
    services:     formData.services,
  })
  return res.data
}
