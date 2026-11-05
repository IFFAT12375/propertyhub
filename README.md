# PropertyHub --- Project Documentation

**Document version:** 1.0\
**Status:** MVP requirements baseline\
**Product:** PropertyHub\
**Product type:** Real estate marketplace\
**Initial market:** Lahore, Pakistan\
**Technology direction:** MERN stack (MongoDB, Express.js, React,
Node.js)

------------------------------------------------------------------------

## 1. Project Overview

PropertyHub is a web-based real estate marketplace that connects people
looking to buy or rent properties with property owners and real estate
agents.

The initial release focuses on residential and commercial properties
located in Lahore. Visitors can browse and search listings, view
property details, and contact sellers through publicly enabled phone
numbers or inquiry forms.

Registered users can save favorite properties. Users who want to publish
listings must apply for seller access and receive administrator
approval. Each property listing must separately receive administrator
approval before becoming publicly visible.

## 2. Problem Statement

People looking to buy or rent properties often struggle to find
relevant, up-to-date listings with sufficient information and reliable
contact options.

Property owners and agents may manage multiple listings and inquiries
through scattered channels, making it difficult to maintain accurate
property information and respond to interested seekers.

PropertyHub addresses these problems through a centralized marketplace
with structured property information, search and filtering, seller
dashboards, inquiry management, and administrative moderation.

## 3. Product Goals

1.  Enable visitors to discover residential and commercial properties in
    Lahore.
2.  Allow approved sellers to publish and manage property listings.
3.  Ensure only administrator-approved listings from active sellers are
    publicly visible.
4.  Allow property seekers to contact sellers through phone or verified
    inquiries.
5.  Allow registered users to save and revisit favorite properties.
6.  Provide sellers and administrators with organized listing and
    inquiry management.

## 4. Target Users and Actors

  -----------------------------------------------------------------------
  Actor                   Description             Main goals
  ----------------------- ----------------------- -----------------------
  Guest / Visitor         Person browsing without Browse, search, view
                          an account              details, submit
                                                  verified inquiries

  Registered User         Account holder without  Save favorites, submit
                          seller privileges       inquiries, apply for
                                                  seller access

  Approved Seller         Approved registered     Create/manage listings,
                          user with publishing    view inquiries, update
                          privileges              availability

  Administrator           Platform administrator  Approve sellers,
                                                  moderate listings,
                                                  manage users
  -----------------------------------------------------------------------

A seller may be an individual property owner or a real estate agent.
Both use the same seller capabilities in the MVP.

## 5. MVP Scope

### 5.1 Included

-   User registration and login.
-   User profile management.
-   Seller application and administrator approval.
-   Seller dashboard.
-   Property listing creation, editing, and deactivation/deletion
    request.
-   Residential and commercial categories.
-   Sale and rent listing purposes.
-   Predefined Lahore locations.
-   Property image uploads.
-   Administrator approval and rejection of property listings.
-   Public property listing and detail pages.
-   Search, filters, and pagination.
-   Favorites.
-   Guest inquiries with email verification.
-   Registered-user inquiries.
-   Seller inquiry dashboard.
-   Availability management: available, sold, rented, inactive.
-   Owner-controlled public phone visibility.
-   Basic administrator dashboard and user management.

### 5.2 Excluded from MVP

-   Online payments and booking deposits.
-   Real-time messaging or chat.
-   Mortgage and loan calculators.
-   AI-powered recommendations.
-   Automated property price prediction.
-   Native Android or iOS applications.
-   Multi-city or nationwide marketplace.
-   Map-based property discovery.
-   Advanced identity verification.
-   Paid advertisements and featured listings.

## 6. Product Concepts and Terminology

These concepts must remain separate in requirements and eventual data
models.

  -----------------------------------------------------------------------
  Concept                 Example values          Meaning
  ----------------------- ----------------------- -----------------------
  Property category       Residential, Commercial Broad classification

  Property type           House, Apartment, Plot, Specific kind of
                          Office, Shop, Warehouse property

  Listing purpose         Sale, Rent              What the seller is
                                                  offering

  Moderation status       Pending, Approved,      Administrator's review
                          Rejected                decision

  Availability status     Available, Sold,        Current availability
                          Rented, Inactive        

  Record status           Active, Soft-deleted    Whether the record is
                                                  retained as an active
                                                  listing
  -----------------------------------------------------------------------

Example: a residential apartment can have purpose `rent`, moderation
status `approved`, and availability status `rented`.

## 7. Business Rules

  -----------------------------------------------------------------------
  ID                                  Rule
  ----------------------------------- -----------------------------------
  BR-01                               The MVP supports properties located
                                      in Lahore only.

  BR-02                               Visitors can browse publicly
                                      available listings without
                                      registering.

  BR-03                               Only registered users can save
                                      favorites.

  BR-04                               Users must receive seller approval
                                      before publishing properties.

  BR-05                               Only administrators can approve,
                                      reject, or suspend seller profiles.

  BR-06                               Only approved and active sellers
                                      can create property listings.

  BR-07                               Every new property listing requires
                                      administrator approval.

  BR-08                               Only approved listings from active
                                      sellers with available properties
                                      appear in public search.

  BR-09                               Sellers can manage only their own
                                      properties.

  BR-10                               Editing an approved property
                                      requires reapproval; the listing is
                                      hidden while pending.

  BR-11                               Only the property's owner can mark
                                      it sold or rented, as appropriate
                                      to its listing purpose.

  BR-12                               Sold, rented, inactive, and deleted
                                      properties are excluded from public
                                      search.

  BR-13                               Guest inquiries require email
                                      verification.

  BR-14                               Only verified guest inquiries are
                                      displayed as genuine inquiries to
                                      sellers.

  BR-15                               Sellers can view inquiries
                                      associated with their own
                                      properties only.

  BR-16                               Sellers can update inquiry
                                      follow-up status.

  BR-17                               A seller's phone number is publicly
                                      visible only when the seller
                                      enables visibility.

  BR-18                               Property deletion should retain
                                      historical records and inquiry
                                      history.

  BR-19                               Only administrators can approve or
                                      reject property listings.

  BR-20                               Property category and listing
                                      purpose are independent dimensions.
  -----------------------------------------------------------------------

## 8. Functional Requirements

### 8.1 Authentication and User Management

-   **FR-01:** The system shall allow users to register.
-   **FR-02:** The system shall prevent duplicate email registration.
-   **FR-03:** The system shall allow users to log in and log out.
-   **FR-04:** The system shall authenticate requests to protected
    resources.
-   **FR-05:** The system shall allow users to manage their profiles.

### 8.2 Seller Management

-   **FR-06:** Registered users shall be able to submit seller
    applications.
-   **FR-07:** Administrators shall be able to view pending seller
    applications.
-   **FR-08:** Administrators shall be able to approve or reject seller
    applications.
-   **FR-09:** Applicants shall be able to view their application status
    and rejection reason.
-   **FR-10:** Administrators shall be able to suspend approved sellers.
-   **FR-11:** Only approved and active sellers shall be able to publish
    property listings.

### 8.3 Property Management

-   **FR-12:** Approved sellers shall be able to create property
    listings.
-   **FR-13:** Sellers shall be able to view their own listings.
-   **FR-14:** Sellers shall be able to edit their own listings.
-   **FR-15:** Editing an approved listing shall trigger reapproval.
-   **FR-16:** Sellers shall be able to deactivate or request deletion
    of their listings.
-   **FR-17:** Sellers shall be able to update property availability.
-   **FR-18:** The system shall support residential and commercial
    categories.
-   **FR-19:** The system shall support sale and rent listing purposes.
-   **FR-20:** Sellers shall be able to upload property images.
-   **FR-21:** Sellers shall control whether their phone number is
    publicly visible.

### 8.4 Property Discovery

-   **FR-22:** Visitors shall be able to browse public property
    listings.
-   **FR-23:** Visitors shall be able to search by predefined Lahore
    areas.
-   **FR-24:** Visitors shall be able to filter by minimum and maximum
    price.
-   **FR-25:** Visitors shall be able to filter by category, property
    type, and listing purpose.
-   **FR-26:** Visitors shall be able to view property details and
    available contact options.
-   **FR-27:** Search results shall support pagination.

### 8.5 Favorites

-   **FR-28:** Registered users shall be able to add properties to
    favorites.
-   **FR-29:** Registered users shall be able to view their favorites.
-   **FR-30:** Registered users shall be able to remove properties from
    favorites.
-   **FR-31:** The system shall prevent duplicate favorite records for
    the same user and property.

### 8.6 Inquiries

-   **FR-32:** Guests shall be able to submit inquiries without creating
    accounts.
-   **FR-33:** The system shall send email verification links for guest
    inquiries.
-   **FR-34:** The system shall verify inquiries using valid, unexpired
    links.
-   **FR-35:** Registered users shall be able to submit inquiries.
-   **FR-36:** Sellers shall be able to view inquiries associated with
    their properties.
-   **FR-37:** Sellers shall be able to update inquiry follow-up
    statuses.
-   **FR-38:** The system shall prevent new inquiries for unavailable
    properties.

### 8.7 Administration

-   **FR-39:** Administrators shall be able to view all property
    listings.
-   **FR-40:** Administrators shall be able to approve or reject pending
    listings.
-   **FR-41:** Administrators shall be able to provide rejection
    reasons.
-   **FR-42:** Administrators shall be able to manage users and seller
    applications.
-   **FR-43:** Administrators shall be able to suspend sellers.
-   **FR-44:** Administrators shall be able to review deletion requests
    if the deletion-approval workflow is retained.

## 9. Non-Functional Requirements

-   **NFR-01:** Passwords must be securely hashed.
-   **NFR-02:** Protected backend endpoints must enforce authentication
    and authorization.
-   **NFR-03:** Users must not access or modify another user's private
    records.
-   **NFR-04:** Property search must support pagination.
-   **NFR-05:** The application must provide meaningful validation and
    error messages.
-   **NFR-06:** The interface must be responsive on desktop and mobile.
-   **NFR-07:** Image uploads must validate file type and size.
-   **NFR-08:** Inquiry submission must include basic abuse protection
    and rate limiting.
-   **NFR-09:** Email verification links must be time-limited and
    single-use.
-   **NFR-10:** The codebase must be organized into maintainable
    frontend and backend modules.

## 10. User Stories and Acceptance Criteria

### US-01 --- Edit a Property

**Story:** As a property owner, I want to edit my own property listing
so that I can keep its information accurate and up to date.

**Acceptance criteria:** - The seller can view their own listings. - The
seller can submit valid changes to a listing they own. - Editing an
approved listing changes its moderation status to pending. - A pending
edited listing is hidden from public search. - A seller cannot edit
another user's listing. - If changes are rejected, the owner can see the
rejection reason.

### US-02 --- Mark a Property Sold or Rented

**Story:** As a property owner, I want to update my property's
availability so that seekers do not contact me about an unavailable
property.

**Acceptance criteria:** - The owner can update availability for their
own eligible listing. - A sold or rented property disappears from public
search. - The property remains in the owner's dashboard. - New inquiries
are blocked for unavailable properties. - An owner cannot update another
seller's property. - Reactivation requires administrator approval before
public visibility.

### US-03 --- Submit a Guest Inquiry

**Story:** As a guest, I want to submit an inquiry and verify my email
address so that I can contact an owner without creating an account.

**Acceptance criteria:** - A guest can open the inquiry form for an
available property. - Valid submission creates an unverified inquiry. -
The system sends a verification link to the supplied email address. - A
valid link verifies the inquiry. - Only verified guest inquiries are
shown as genuine inquiries to the seller. - Expired or previously used
links are rejected. - Unavailable properties do not accept new
inquiries.

### US-04 --- Add a Favorite

**Story:** As a registered user, I want to save a property to my
favorites so that I can find it later.

**Acceptance criteria:** - An authenticated user can add a property to
favorites. - Saved properties appear in the user's favorites list. -
Duplicate favorites are prevented. - A user can remove a favorite. -
Guests must log in or register to save favorites. - Unavailable
properties may remain in favorites with an unavailable label.

### US-05 --- View Inquiries

**Story:** As a property owner, I want to view inquiries submitted for
my listings so that I can follow up with interested seekers.

**Acceptance criteria:** - A seller can view inquiries for their own
properties. - Unverified guest inquiries are not presented as genuine
inquiries. - Verified inquiries display permitted seeker contact details
and message. - Each inquiry identifies its associated property. -
Sellers cannot view another seller's inquiries. - Sellers can update an
inquiry's follow-up status.

## 11. Main Use Cases

### UC-01 --- Register Account

**Actor:** Guest\
**Precondition:** Visitor can access PropertyHub.

**Main flow:** 1. Visitor opens registration. 2. Visitor enters required
details. 3. System validates the information. 4. System checks for an
existing email. 5. System creates the account. 6. System confirms
registration.

**Alternatives:** Invalid fields or duplicate email produce appropriate
errors.

**Postcondition:** A registered account exists.

### UC-02 --- Apply for Seller Access

**Actor:** Registered User\
**Precondition:** User is authenticated and does not already have
approved seller access.

**Main flow:** 1. User opens seller application. 2. User enters required
seller information. 3. User submits the application. 4. System saves it
with pending status. 5. Administrator reviews it. 6. Administrator
approves or rejects it. 7. System records the decision and any rejection
reason. 8. User can view the application status.

**Postcondition:** Seller application has a recorded status.

### UC-03 --- Browse and Search Properties

**Actor:** Guest / Registered User

**Main flow:** 1. User opens the properties page. 2. System displays
approved, available properties from active sellers. 3. User selects
search criteria and filters. 4. System returns matching listings. 5.
User opens a property detail page.

**Alternative:** If no properties match, the system displays an empty
state.

**Postcondition:** User can view matching public properties.

### UC-04 --- Submit Property Listing

**Actor:** Approved Seller\
**Preconditions:** User is authenticated; seller profile is approved and
active.

**Main flow:** 1. Seller opens create-listing form. 2. Seller enters
property details. 3. Seller selects category, type, purpose, location,
and price. 4. Seller uploads images. 5. Seller reviews and submits. 6.
System validates and saves the listing. 7. System sets moderation status
to pending. 8. Administrator reviews the listing.

**Alternatives:** Invalid fields, invalid images, or unauthorized seller
status prevent submission.

**Postcondition:** Listing awaits moderation.

### UC-05 --- Edit Property Listing

**Actor:** Approved Seller\
**Precondition:** Seller owns the listing.

**Main flow:** 1. Seller opens their dashboard. 2. Seller selects a
listing. 3. Seller edits information. 4. Seller submits changes. 5.
System validates and saves changes. 6. System sets moderation status to
pending. 7. Listing is hidden from public search until reapproved.

**Alternatives:** Non-owner requests are rejected; invalid information
produces validation errors; rejected changes show the rejection reason.

**Postcondition:** Updated listing awaits review.

### UC-06 --- Update Property Availability

**Actor:** Approved Seller\
**Precondition:** Seller owns an approved, available listing.

**Main flow:** 1. Seller opens the listing. 2. Seller selects Sold,
Rented, or Inactive as appropriate. 3. System validates ownership and
status. 4. System updates availability. 5. Unavailable listing is
removed from public search. 6. Listing remains in the seller dashboard.

**Postcondition:** Availability is updated.

### UC-07 --- Submit Guest Inquiry

**Actor:** Guest\
**Precondition:** Property is approved, available, and publicly visible.

**Main flow:** 1. Guest opens property details. 2. Guest opens inquiry
form. 3. Guest enters name, email, and message. 4. System validates the
input. 5. System creates an unverified inquiry. 6. System sends an email
verification link. 7. Guest opens the link. 8. System validates the
token and verifies the inquiry. 9. Inquiry becomes visible to the
seller.

**Alternatives:** Invalid form, expired/used token, or unavailable
property prevents completion.

**Postcondition:** A verified inquiry is available to the seller.

### UC-08 --- Manage Favorites

**Actor:** Registered User\
**Precondition:** User is authenticated.

**Main flow:** 1. User selects Add to Favorites on a property. 2. System
records the favorite. 3. User can view saved properties. 4. User can
remove a favorite.

**Alternatives:** Guests are asked to authenticate; duplicate favorites
are prevented.

**Postcondition:** Favorite collection is updated.

### UC-09 --- Manage Inquiries

**Actor:** Approved Seller\
**Precondition:** Seller owns the associated property.

**Main flow:** 1. Seller opens inquiry dashboard. 2. System displays
verified inquiries for the seller's properties. 3. Seller opens an
inquiry. 4. System displays permitted seeker details and message. 5.
Seller updates follow-up status. 6. System saves the change.

**Alternative:** Access to another seller's inquiry is denied.

**Postcondition:** Inquiry follow-up status is updated.

### UC-10 --- Moderate Property Listing

**Actor:** Administrator\
**Precondition:** A listing is pending.

**Main flow:** 1. Administrator opens pending listings. 2. Administrator
selects a property. 3. System displays listing information and images.
4. Administrator reviews the submission. 5. Administrator approves or
rejects it. 6. Administrator supplies a rejection reason when rejecting.
7. System records the decision. 8. Approved listing becomes public if
all visibility conditions are met.

**Postcondition:** Listing has a moderation decision.

### UC-11 --- Moderate Seller Application

**Actor:** Administrator\
**Precondition:** A seller application is pending.

**Main flow:** 1. Administrator opens pending applications. 2.
Administrator reviews seller information. 3. Administrator approves or
rejects the application. 4. Administrator supplies a rejection reason
when applicable. 5. System records the decision. 6. User can view the
result.

**Postcondition:** Seller application has a recorded decision.

## 12. Initial Screen Inventory

### Public

-   Home
-   Properties / Search Results
-   Property Details
-   Login
-   Register

### Registered User

-   User Profile
-   Favorites
-   My Inquiries
-   Become a Seller
-   Seller Application Status

### Seller Dashboard

-   Dashboard Overview
-   My Properties
-   Create Property
-   Edit Property
-   Property Inquiries
-   Seller Profile

### Admin Dashboard

-   Admin Overview
-   Seller Applications
-   Property Approvals
-   All Properties
-   User Management

## 13. Initial UI Direction

Suggested visual identity: - Primary: Deep green (`#174A3A`) -
Background: Warm off-white (`#F5F4EF`) - Accent: Muted gold
(`#D8AD65`) - Text: Charcoal (`#252A29`) - Typography: Inter or a
similar readable sans-serif - Cards: Rounded corners, subtle borders,
restrained shadows - Layout: Spacious, clean, responsive

Initial frontend milestone: 1. Navbar and Footer. 2. Reusable
PropertyCard. 3. SearchBar. 4. Home page hero and featured properties.
5. Properties page with listing grid. 6. React Router navigation. 7.
Responsive desktop and mobile layouts.

Use mock property data initially. Backend integration will be added
later.

## 14. Assumptions and Open Decisions

The following are proposed defaults and must be confirmed during
detailed design:

1.  Seller applications require administrator approval;
    identity-document verification is not initially required.
2.  Predefined Lahore areas are controlled data; block, street, and
    detailed address are optional.
3.  Sellers can immediately hide their own listings through
    deactivation.
4.  Permanent removal uses soft deletion; whether administrators must
    approve deletion requests remains unresolved.
5.  Inquiry follow-up statuses are New, Contacted, and Closed.
6.  Suggested image limits: 1--10 images, JPG/JPEG/PNG/WebP, maximum 5
    MB each.
7.  Initial currency is PKR.
8.  Sale price is a one-time asking price; rental price includes a
    billing period, initially monthly.
9.  Property fields depend on category and type. Bedrooms are relevant
    to houses/apartments, not offices.
10. Exact seller application fields, required property fields, and email
    verification expiry duration will be finalized during detailed
    design.
11. Seller rejection/resubmission and suspension behavior must be
    finalized before implementing seller management.
12. Reactivation of sold/rented listings requires administrator review
    before public visibility.

## 15. Success Criteria

The MVP is functionally successful when:

-   A visitor can browse and search available Lahore listings.
-   A registered user can apply for seller access.
-   An administrator can approve a seller.
-   An approved seller can submit a property.
-   An administrator can approve the listing.
-   The approved listing appears in public search.
-   A registered user can save it to favorites.
-   A guest can submit and verify an inquiry.
-   The seller can view the verified inquiry and update its status.
-   The seller can edit or deactivate their listing.
-   Unauthorized users cannot manage another user's properties or
    inquiries.

------------------------------------------------------------------------

## 16. Planned Technical Documents

The following documents will be added as design progresses:

  -----------------------------------------------------------------------
  Document                Purpose                 Status
  ----------------------- ----------------------- -----------------------
  `HLD.md`                High-level application  Pending
                          architecture and        
                          component interactions  

  `USER_FLOWS.md`         Step-by-step user       Pending
                          journeys and edge cases 

  `ERD.md`                Database entities,      Pending
                          relationships, and      
                          cardinalities           

  `DATA_DICTIONARY.md`    Field definitions,      Pending
                          types, constraints, and 
                          examples                

  `API_CONTRACT.md`       Endpoints,              Pending
                          request/response        
                          formats, validation,    
                          and errors              

  `TEST_PLAN.md`          Functional,             Pending
                          integration,            
                          authorization, and UI   
                          test scenarios          

  `DEPLOYMENT.md`         Environment variables,  Pending
                          hosting, build, and     
                          release instructions    
  -----------------------------------------------------------------------

## 17. Technology Direction

Initial proposed stack:

**Frontend** - React - Vite - JavaScript - React Router - Tailwind CSS -
Redux Toolkit when shared state requires it - Axios for API
communication

**Backend** - Node.js - Express.js - MongoDB - Mongoose - JWT
authentication - bcrypt password hashing

**Supporting services** - Cloudinary for property images - Email
provider for inquiry verification - Git and GitHub for version control

**Deployment** - Frontend: Vercel or equivalent - Backend: Render or
equivalent - Database: MongoDB Atlas

The final architecture, authentication strategy, deployment provider,
and API design will be documented in the technical design phase.

------------------------------------------------------------------------

**Document owner:** PropertyHub project\
**Last updated:** 5 November 2026\
**Document status:** Initial requirements baseline; open decisions are
explicitly listed above.
