# PropertyHub — Use-Case Specification

**Version:** 1.0  
**Related document:** PropertyHub PRD v1.0

## UC-01 — Register Account

**Primary actor:** Guest

**Preconditions:** The visitor has access to PropertyHub.

**Main flow:**
1. Visitor opens the registration page.
2. Visitor enters required registration details.
3. System validates the submitted information.
4. System checks whether the email already exists.
5. System creates the user account.
6. System confirms successful registration.

**Alternative flows:**
- Invalid information: system displays validation errors.
- Existing email: system rejects duplicate registration.

**Postcondition:** A registered user account exists.

## UC-02 — Apply for Seller Access

**Primary actor:** Registered User

**Preconditions:** User is authenticated and has no approved seller profile.

**Main flow:**
1. User opens the seller application page.
2. User enters the required seller information.
3. User submits the application.
4. System creates an application with pending status.
5. Administrator reviews the application.
6. Administrator approves or rejects it.
7. System updates the application status.
8. User can view the decision.

**Alternative flows:**
- Missing required information: system displays validation errors.
- Rejected application: user can view the rejection reason and resubmit, subject to the final business rule.

**Postcondition:** Seller application has a recorded status.

## UC-03 — Browse and Search Properties

**Primary actor:** Guest / Registered User

**Preconditions:** Public listings are available.

**Main flow:**
1. User opens the property listing page.
2. System displays approved and available listings from active sellers.
3. User enters search criteria.
4. User selects filters such as area, price, category, type, and sale/rent.
5. System returns matching properties.
6. User opens a property detail page.

**Alternative flows:**
- No matching properties: system displays an empty state.
- Invalid filter values: system validates or ignores invalid values safely.

**Postcondition:** User can view matching public properties.

## UC-04 — Submit Property Listing

**Primary actor:** Approved Seller

**Preconditions:**
- User is authenticated.
- Seller profile is approved and active.

**Main flow:**
1. Seller opens the create-listing page.
2. Seller enters property information.
3. Seller selects category, property type, purpose, location, and price.
4. Seller uploads property images.
5. Seller reviews the information.
6. Seller submits the listing.
7. System validates the information and saves the listing.
8. System sets moderation status to pending.
9. Administrator reviews the listing.
10. Administrator approves or rejects it.

**Alternative flows:**
- Invalid fields: system displays validation errors.
- Invalid images: system rejects unsupported files.
- Seller not approved or suspended: system rejects listing creation.

**Postcondition:** A property listing exists awaiting moderation.

## UC-05 — Edit Property Listing

**Primary actor:** Approved Seller

**Preconditions:** Seller owns the listing and is authorized to manage it.

**Main flow:**
1. Seller opens their property dashboard.
2. Seller selects a listing.
3. Seller edits the required information.
4. Seller submits the changes.
5. System validates and saves the changes.
6. System sets moderation status to pending.
7. Listing remains hidden from public search until reapproved.

**Alternative flows:**
- Seller does not own the listing: system rejects the operation.
- Invalid information: system returns validation errors.
- Administrator rejects changes: seller can view the rejection reason.

**Postcondition:** Updated listing awaits administrator review.

## UC-06 — Update Property Availability

**Primary actor:** Approved Seller

**Preconditions:** Seller owns an approved and available listing.

**Main flow:**
1. Seller opens their listing.
2. Seller selects Sold or Rented, according to listing purpose, or chooses Inactive.
3. System validates ownership and current status.
4. System updates availability.
5. Listing disappears from public search when no longer available.
6. Listing remains in the seller dashboard.

**Alternative flows:**
- Seller does not own the listing: system rejects the operation.
- Invalid status for listing purpose: system rejects the update.

**Postcondition:** Property availability reflects the seller's update.

## UC-07 — Submit Guest Inquiry

**Primary actor:** Guest

**Preconditions:** Property is approved, available, and publicly visible.

**Main flow:**
1. Guest opens the property detail page.
2. Guest selects the inquiry option.
3. Guest enters name, email, and message, plus any other required contact details.
4. System validates the inquiry.
5. System saves an unverified inquiry.
6. System sends an email verification link.
7. Guest opens the link.
8. System validates the token and marks the inquiry verified.
9. The inquiry becomes visible to the property seller.

**Alternative flows:**
- Invalid form: system displays validation errors.
- Expired or already-used token: system rejects verification.
- Property unavailable: system prevents inquiry submission.

**Postcondition:** A verified inquiry is available to the seller.

## UC-08 — Manage Favorites

**Primary actor:** Registered User

**Preconditions:** User is authenticated.

**Main flow:**
1. User opens a property detail or listing card.
2. User selects Add to Favorites.
3. System records the favorite.
4. User can open the favorites page.
5. User can remove a saved property.

**Alternative flows:**
- Guest attempts to save a favorite: system requests authentication.
- Favorite already exists: system prevents duplication.

**Postcondition:** Favorite collection reflects the user's selection.

## UC-09 — Manage Inquiries

**Primary actor:** Approved Seller

**Preconditions:** Seller is authenticated and owns the associated property.

**Main flow:**
1. Seller opens the inquiry dashboard.
2. System displays verified inquiries for the seller's properties.
3. Seller selects an inquiry.
4. System displays permitted seeker details and message.
5. Seller updates the follow-up status to Contacted or Closed.
6. System saves the status.

**Alternative flows:**
- Inquiry belongs to another seller: system denies access.
- Inquiry is unverified: system does not display it as a genuine inquiry.

**Postcondition:** Inquiry follow-up status is updated.

## UC-10 — Moderate Property Listing

**Primary actor:** Administrator

**Preconditions:** Administrator is authenticated and a listing is pending.

**Main flow:**
1. Administrator opens the pending listings queue.
2. Administrator selects a property.
3. System displays its submitted information and images.
4. Administrator reviews the listing.
5. Administrator approves or rejects it.
6. If rejected, administrator enters a reason.
7. System updates moderation status.
8. Approved listing becomes publicly visible if all other visibility conditions are met.

**Alternative flows:**
- Non-admin attempts moderation: system denies access.
- Listing is no longer pending: system prevents an invalid repeated decision.

**Postcondition:** Listing has an administrator moderation decision.

## UC-11 — Moderate Seller Application

**Primary actor:** Administrator

**Preconditions:** A seller application is pending.

**Main flow:**
1. Administrator opens pending applications.
2. Administrator reviews seller information.
3. Administrator approves or rejects the application.
4. Administrator provides a rejection reason when applicable.
5. System updates the seller application status.
6. User can view the decision.

**Postcondition:** Seller application has a recorded decision.

---

**End of Use-Case Specification v1.0**