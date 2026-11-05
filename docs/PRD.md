# PropertyHub — Product Requirements Document

**Document Version:** 1.0  
**Status:** Initial MVP baseline  
**Product:** PropertyHub  
**Product Type:** Real Estate Marketplace  
**Initial Market:** Lahore, Pakistan  
**Technology Direction:** MERN Stack

---

## 1. Product Overview

PropertyHub is a web-based real estate marketplace designed to connect people looking to buy or rent properties with property owners and real estate agents.

The platform will initially focus on residential and commercial properties located in Lahore, Pakistan. Visitors will be able to discover properties, search using filters, view property details, and contact sellers through phone numbers or inquiry forms.

Registered users can save favorite properties. Users who want to publish listings must apply for seller access and receive administrator approval. Each property listing must also be approved by an administrator before becoming publicly visible.

PropertyHub aims to provide a structured, accessible, and trustworthy experience for property discovery and listing management.

## 2. Problem Statement

People looking to buy or rent properties often struggle to find relevant, up-to-date listings with sufficient information and reliable contact options.

Property owners and agents may manage multiple listings and inquiries through scattered channels, making it difficult to maintain accurate property information and respond to interested seekers.

PropertyHub addresses these problems by providing a centralized marketplace with structured property information, search and filtering, seller dashboards, inquiry management, and administrative moderation.

## 3. Target Users

| User | Description | Main goals |
|---|---|---|
| Visitor / Guest | Person browsing without an account | Discover properties and submit inquiries |
| Registered User | Account holder without seller privileges | Save favorites and submit inquiries |
| Seller | Approved registered user with publishing privileges | Create and manage property listings and inquiries |
| Administrator | Platform administrator | Manage users, approve sellers, and moderate listings |

A seller may be an individual property owner or a real estate agent. Both use the seller functionality in the MVP.

## 4. Product Goals

1. Enable visitors to discover residential and commercial properties in Lahore.
2. Allow approved sellers to publish and manage property listings.
3. Ensure only administrator-approved listings from active sellers are publicly visible.
4. Allow property seekers to contact sellers through phone or verified inquiries.
5. Provide registered users with a way to save and revisit favorite properties.
6. Provide sellers and administrators with organized listing and inquiry management.

## 5. MVP Scope

### Included in MVP

- User registration and login.
- User profile management.
- Seller application and administrator approval.
- Seller dashboard.
- Property listing creation, editing, and deletion/deactivation.
- Residential and commercial categories.
- Sale and rent listing purposes.
- Lahore-based location selection.
- Property image uploads.
- Administrator listing approval and rejection.
- Public property listing and detail pages.
- Search, filters, and pagination.
- Favorites.
- Guest inquiries with email verification.
- Registered-user inquiries.
- Seller inquiry dashboard.
- Availability management: available, sold, rented, inactive.
- Owner-controlled public phone visibility.
- Basic administrator dashboard and user management.

### Excluded from MVP

- Online payments and booking deposits.
- Real-time messaging or chat.
- Mortgage and loan calculators.
- AI-powered recommendations.
- Automated property price prediction.
- Native Android or iOS applications.
- Multi-city or nationwide marketplace.
- Map-based property discovery.
- Advanced identity verification.
- Paid advertisements and featured listings.

## 6. Functional Requirements

### 6.1 Authentication and User Management

- FR-01: The system shall allow users to register.
- FR-02: The system shall prevent duplicate email registration.
- FR-03: The system shall allow users to log in and log out.
- FR-04: The system shall authenticate protected requests.
- FR-05: The system shall allow users to manage their profiles.

### 6.2 Seller Management

- FR-06: Registered users shall be able to submit seller applications.
- FR-07: Administrators shall be able to view pending applications.
- FR-08: Administrators shall be able to approve or reject seller applications.
- FR-09: Applicants shall be able to view their application status and rejection reason.
- FR-10: Administrators shall be able to suspend approved sellers.
- FR-11: Only approved and active sellers shall be able to publish property listings.

### 6.3 Property Management

- FR-12: Approved sellers shall be able to create property listings.
- FR-13: Sellers shall be able to view their own listings.
- FR-14: Sellers shall be able to edit their own listings.
- FR-15: Editing an approved listing shall trigger reapproval.
- FR-16: Sellers shall be able to deactivate or request deletion of their listings.
- FR-17: Sellers shall be able to update their property's availability.
- FR-18: The system shall support residential and commercial property categories.
- FR-19: The system shall support sale and rent listing purposes.
- FR-20: Sellers shall be able to upload property images.
- FR-21: Sellers shall control whether their phone number is publicly visible.

### 6.4 Property Discovery

- FR-22: Visitors shall be able to browse public property listings.
- FR-23: Visitors shall be able to search by predefined Lahore areas.
- FR-24: Visitors shall be able to filter by minimum and maximum price.
- FR-25: Visitors shall be able to filter by category, type, and listing purpose.
- FR-26: Visitors shall be able to view property details and available contact options.
- FR-27: Search results shall support pagination.

### 6.5 Favorites

- FR-28: Registered users shall be able to add properties to favorites.
- FR-29: Registered users shall be able to view their favorites.
- FR-30: Registered users shall be able to remove favorites.
- FR-31: The system shall prevent duplicate favorites for the same user and property.

### 6.6 Inquiries

- FR-32: Guests shall be able to submit inquiries without creating accounts.
- FR-33: The system shall send email verification links for guest inquiries.
- FR-34: The system shall verify inquiries using valid, unexpired links.
- FR-35: Registered users shall be able to submit inquiries.
- FR-36: Sellers shall be able to view inquiries associated with their properties.
- FR-37: Sellers shall be able to update inquiry follow-up statuses.
- FR-38: The system shall prevent new inquiries for unavailable properties.

### 6.7 Administration

- FR-39: Administrators shall be able to view all property listings.
- FR-40: Administrators shall be able to approve or reject pending listings.
- FR-41: Administrators shall be able to provide rejection reasons.
- FR-42: Administrators shall be able to manage users and seller applications.
- FR-43: Administrators shall be able to suspend sellers.
- FR-44: Administrators shall be able to review deletion requests if the deletion-approval workflow is retained.

## 7. Business Rules

- BR-01: The MVP supports properties located in Lahore only.
- BR-02: Visitors can browse publicly available listings without registering.
- BR-03: Only registered users can save favorites.
- BR-04: Users must receive seller approval before publishing properties.
- BR-05: Only administrators can approve, reject, or suspend seller profiles.
- BR-06: Only approved sellers can create property listings.
- BR-07: Every new listing requires administrator approval.
- BR-08: Only approved listings from active sellers with available properties appear in public search.
- BR-09: Sellers can manage only their own properties.
- BR-10: Editing an approved property requires reapproval.
- BR-11: Only the property's owner can mark it sold or rented.
- BR-12: Sold, rented, inactive, and deleted properties are excluded from public search.
- BR-13: Guest inquiries require email verification.
- BR-14: Only verified guest inquiries are displayed as genuine inquiries to sellers.
- BR-15: Sellers can view inquiries associated with their own properties only.
- BR-16: Sellers can update inquiry follow-up status.
- BR-17: Phone numbers are publicly visible only when the seller enables visibility.
- BR-18: Property deletion should retain historical records and inquiry history.
- BR-19: Only administrators can approve or reject property listings.
- BR-20: Categories and listing purposes are independent: residential/commercial and sale/rent.

## 8. Property Concepts

The system must distinguish between these independent property attributes:

| Attribute | Values |
|---|---|
| Category | Residential, Commercial |
| Property type | House, Apartment, Plot, Office, Shop, Warehouse, etc. |
| Listing purpose | Sale, Rent |
| Moderation status | Pending, Approved, Rejected |
| Availability status | Available, Sold, Rented, Inactive |
| Record status | Active, Soft-deleted |

A property advertised for sale may become sold; a property advertised for rent may become rented.

## 9. Inquiry Lifecycle

Guest inquiry verification and inquiry follow-up are separate processes.

**Verification:** Pending → Verified (or Expired)

**Follow-up:** New → Contacted → Closed

Unverified inquiries must not be presented as genuine inquiries in the seller dashboard. Verified inquiries should identify the property to which they relate.

## 10. Non-Functional Requirements

- NFR-01: Passwords must be securely hashed.
- NFR-02: Protected backend endpoints must enforce authentication and authorization.
- NFR-03: Users must not access or modify another user's private records.
- NFR-04: Property search must support pagination.
- NFR-05: The application must provide meaningful validation and error messages.
- NFR-06: The interface must be responsive on desktop and mobile.
- NFR-07: Image uploads must validate file type and size.
- NFR-08: Inquiry submission must include basic abuse protection and rate limiting.
- NFR-09: Email verification links must be time-limited and single-use.
- NFR-10: The codebase must be organized into maintainable frontend and backend modules.

## 11. Assumptions and Open Decisions

The following are proposed MVP defaults, to be confirmed during detailed design:

1. Seller applications are approved by an administrator; seller identity-document verification is not initially required.
2. Predefined Lahore areas are maintained as controlled data. Block, street, and detailed address are optional.
3. A seller can immediately hide their own listing through deactivation.
4. Permanent removal is soft deletion; administrator review of deletion requests remains a decision to finalize.
5. Initial inquiry statuses are New, Contacted, and Closed.
6. Suggested image limits are 1–10 images, JPG/JPEG/PNG/WebP, maximum 5 MB each.
7. The initial currency is PKR.
8. Sale prices are one-time asking prices; rental prices should include a billing period such as monthly.
9. Property-specific fields will depend on category and type. For example, bedrooms apply to residential houses/apartments, not offices.
10. The exact seller application fields, property required fields, and email expiry duration will be finalized in detailed design.

## 12. Success Criteria

The MVP will be considered functionally successful when:

- A visitor can browse and search available Lahore listings.
- A registered user can apply for seller access.
- An administrator can approve a seller.
- An approved seller can submit a property.
- An administrator can approve the listing.
- The approved listing appears in public search.
- A registered user can save it to favorites.
- A guest can submit and verify an inquiry.
- The seller can view the verified inquiry and update its status.
- The seller can edit or deactivate their listing.
- Unauthorized users cannot manage another user's properties or inquiries.

---

**End of PRD v1.0**