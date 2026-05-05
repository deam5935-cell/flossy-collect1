# Security Specification - Flossy Kollect

## Data Invariants
- Products can only be created/edited/deleted by Admins.
- Users can only read their own private profiles, but admins can read all.
- Orders can only be created by signed-in users.
- Users can only read their own orders.
- Admins can read and update status of all orders.
- Categories can only be managed by Admins.
- Site content (banner text, etc) can only be managed by Admins.

## The Dirty Dozen (Malicious Payloads)

1. **Identity Spoofing**: Attempt to create a user profile with `isAdmin: true` as a regular user.
2. **Resource Poisoning**: Create a product with a 2MB image URL string or name.
3. **Price Manipulation**: Create a product with price `-100`.
4. **Unauthorized Deletion**: A regular user tries to delete a product.
5. **Privilege Escalation**: A user tries to update their own `isAdmin` field to `true`.
6. **Orphaned Order**: Create an order referencing a non-existent user UID in the items but without being logged in.
7. **Shadow Data**: Creating a product with extra fields like `debug: true` or `verified: true` that aren't in the schema.
8. **Invalid Status**: A user tries to update an order status from `pending` to `delivered` (only admin should do this).
9. **Fake ID**: Accessing a document using a path traversal `../admin/secret`.
10. **Resource Exhaustion**: Sending a search/list query meant to return 1 million records (rules must enforce query filters).
11. **Timestamp Spoofing**: Sending a `createdAt` date from the future.
12. **Content Hijacking**: Overwriting the `/content/config` doc as a non-admin.

## Test Runner Plan
I will create a test suite using `@firebase/rules-unit-testing` (once I install it) to verify these constraints.
