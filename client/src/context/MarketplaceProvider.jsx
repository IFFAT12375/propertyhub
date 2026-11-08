import { useCallback, useMemo, useState } from 'react'
import { mockApplications } from '../data/mockApplications.js'
import { mockInquiries } from '../data/mockInquiries.js'
import { mockProperties } from '../data/mockProperties.js'
import { MarketplaceContext } from './marketplaceContext.js'

export default function MarketplaceProvider({ children }) {
  const [properties, setProperties] = useState(mockProperties)
  const [inquiries, setInquiries] = useState(mockInquiries)
  const [applications, setApplications] = useState(mockApplications)

  const createProperty = useCallback((details, seller) => {
    const property = {
      ...details,
      id: `property-${Date.now()}`,
      ownerId: seller.id,
      seller: {
        name: seller.name,
        phone: seller.phone,
        phoneVisible: details.phoneVisible,
      },
      rejectionReason: '',
      sellerStatus: 'active',
      moderationStatus: 'pending',
      availabilityStatus: 'available',
      recordStatus: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setProperties((current) => [property, ...current])
    return property
  }, [])

  const updateProperty = useCallback((propertyId, updates, ownerId) => {
    const existing = properties.find(
      (property) => property.id === propertyId && property.ownerId === ownerId,
    )
    if (!existing) return false
    setProperties((current) =>
      current.map((property) => {
        if (property.id !== propertyId || property.ownerId !== ownerId) return property
        return {
          ...property,
          ...updates,
          seller: {
            ...property.seller,
            phoneVisible: updates.phoneVisible ?? property.seller.phoneVisible,
          },
          rejectionReason: '',
          moderationStatus: 'pending',
        }
      }),
    )
    return true
  }, [properties])

  const updateAvailability = useCallback((propertyId, status, ownerId) => {
    const existing = properties.find(
      (property) => property.id === propertyId && property.ownerId === ownerId,
    )
    if (!existing) return false
    const validStatuses =
      existing.purpose === 'sale'
        ? ['available', 'sold', 'inactive']
        : ['available', 'rented', 'inactive']
    if (!validStatuses.includes(status)) return false
    setProperties((current) =>
      current.map((property) => {
        if (property.id !== propertyId || property.ownerId !== ownerId) return property
        return { ...property, availabilityStatus: status }
      }),
    )
    return true
  }, [properties])

  const softDeleteProperty = useCallback((propertyId, ownerId) => {
    const existing = properties.find(
      (property) => property.id === propertyId && property.ownerId === ownerId,
    )
    if (!existing) return false
    setProperties((current) =>
      current.map((property) => {
        if (property.id !== propertyId || property.ownerId !== ownerId) return property
        return { ...property, recordStatus: 'deleted', availabilityStatus: 'inactive' }
      }),
    )
    return true
  }, [properties])

  const submitApplication = useCallback(
    (application) => {
      const previous = applications.find((item) => item.userId === application.userId)
      if (previous && ['pending', 'approved'].includes(previous.status)) {
        return {
          success: false,
          message: 'An active seller application already exists for this account.',
        }
      }

      const next = {
        ...application,
        id: previous?.id || `application-${Date.now()}`,
        status: 'pending',
        rejectionReason: '',
        submittedAt: new Date().toISOString().slice(0, 10),
      }
      setApplications((current) =>
        previous
          ? current.map((item) => (item.id === previous.id ? next : item))
          : [next, ...current],
      )
      return { success: true, application: next }
    },
    [applications],
  )

  const createInquiry = useCallback(
    (details) => {
      const property = properties.find((item) => item.id === details.propertyId)
      if (
        !property ||
        property.moderationStatus !== 'approved' ||
        property.availabilityStatus !== 'available' ||
        property.recordStatus !== 'active' ||
        property.sellerStatus !== 'active'
      ) {
        return { success: false, message: 'This property is not accepting inquiries.' }
      }

      const inquiry = {
        ...details,
        id: `inquiry-${Date.now()}`,
        verificationStatus: details.seekerId ? 'verified' : 'pending',
        followUpStatus: 'new',
        createdAt: new Date().toISOString().slice(0, 10),
      }
      setInquiries((current) => [inquiry, ...current])
      return { success: true, inquiry }
    },
    [properties],
  )

  const updateInquiryFollowUp = useCallback(
    (inquiryId, status, ownerId) => {
      const inquiry = inquiries.find((item) => item.id === inquiryId)
      const property = properties.find((item) => item.id === inquiry?.propertyId)
      if (
        !inquiry ||
        !property ||
        property.ownerId !== ownerId ||
        inquiry.verificationStatus !== 'verified' ||
        !['new', 'contacted', 'closed'].includes(status)
      ) {
        return false
      }
      setInquiries((current) =>
        current.map((item) =>
          item.id === inquiryId ? { ...item, followUpStatus: status } : item,
        ),
      )
      return true
    },
    [inquiries, properties],
  )

  const updateSellerContact = useCallback((ownerId, contact) => {
    setProperties((current) =>
      current.map((property) =>
        property.ownerId === ownerId
          ? {
              ...property,
              seller: {
                ...property.seller,
                name: contact.name,
                phone: contact.phone,
              },
            }
          : property,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      properties,
      inquiries,
      applications,
      createProperty,
      updateProperty,
      updateAvailability,
      softDeleteProperty,
      submitApplication,
      createInquiry,
      updateInquiryFollowUp,
      updateSellerContact,
    }),
    [
      properties,
      inquiries,
      applications,
      createProperty,
      updateProperty,
      updateAvailability,
      softDeleteProperty,
      submitApplication,
      createInquiry,
      updateInquiryFollowUp,
      updateSellerContact,
    ],
  )

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  )
}
