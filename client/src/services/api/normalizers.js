export function normalizeProperty(property) {
  if (!property) return property
  const images = (property.images || []).map((image) => ({
    ...image,
    url: image.url || image.filename,
  }))
  const rawSeller = property.seller || property.owner
  const seller = rawSeller && typeof rawSeller === 'object' && rawSeller.name
    ? rawSeller
    : undefined
  return {
    ...property,
    id: property.id || String(property._id),
    image: images[0]?.url || property.image,
    images,
    location: property.location || {
      area: property.locationArea || '',
      city: 'Lahore',
    },
    seller: seller
      ? {
          ...seller,
          phoneVisible: property.phoneVisible,
        }
      : undefined,
    sellerStatus: seller?.accountStatus || property.sellerStatus,
  }
}

export function normalizeApplication(application) {
  if (!application) return application
  const applicant = application.applicant
  const applicantDetails = applicant && typeof applicant === 'object' && applicant.name
  return {
    ...application,
    id: application.id || String(application._id),
    applicantName: application.applicantName || applicant?.name,
    email: application.email || applicant?.email,
    phone: application.phone || applicant?.phone,
    applicant: applicantDetails
      ? { ...applicant, id: applicant.id || String(applicant._id) }
      : applicant ? String(applicant) : applicant,
  }
}
