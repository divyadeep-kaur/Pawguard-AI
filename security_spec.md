# Security Specification: PawGuard AI

This document establishes the security invariants, threat validation payloads, and automated test setup rules to ensure zero-trust security and prevent Update-Gaps, spoofing, or resource exhaustion across PawGuard AI's Firebase collections.

## 1. Data Invariants

* **Rescue Reports:**
  * Only signed-in users or public forms (guest submits) can create rescue tickets (we support anonymous/authenticated/guest creation for stray reporting).
  * The status of a ticket cannot jump directly to "Recovered" without going through intermediated states, but status fields can only be modified by authorized NGO/Government/Admin roles.
  * Document IDs (`ticketNumber`) must conform to length and format rules (`^[a-zA-Z0-9_\-]+$`) to prevent path traversal, SQL injection, or large-string Denial of Wallet.
  * All timestamp fields must lock to `request.time`.

* **Adoption Requests:**
  * Anyone can submit a well-formed request to adopt.
  * Only actual system owners can read or list private contact details (PII protection - `applicantEmail`, `applicantPhone`).

---

## 2. The "Dirty Dozen" Threat Payloads (Test Suite Cases)

Here we specify 12 payloads designed to breach integrity and verified rules:

1. **Self-Appointed NGO Privilege escalation:** Client attempts to claim NGO status by spoofing auth document path.
2. **Path Traversal / Resource Poisoning ID:** Create a report with a 2MB ticket ID.
3. **Invalid Severity Injection:** Submit a report with `severity: "apocalyptic"`.
4. **Time Manipulation Attack:** Settle `timestamp` to year 2090.
5. **Unauthorized NGO Update:** A general user attempts to alter the status of a ticket.
6. **Immortal Field Override:** Alter a persistent `createdAt` post creation.
7. **Adoption PII Leaks:** Read third-party adoption applications containing emails and phone numbers.
8. **Malicious Empty Fields:** Submit reports without mandatory `animalType` or `location`.
9. **Spam List Harvest:** Querying the entire `adoptionRequests` collection without credential mapping.
10. **State Shortcutting:** Change report status directly from `Reported` to `Recovered` from guest API client.
11. **Spoofed Reporter details:** Create a report using someone else's UID without auth matches.
12. **Double Status terminal lock bypass:** Attempt to move a `Recovered` report back into `Reported`.

---

## 3. Test Runner: firestore.rules.test.ts Dummy Template

In the real build, these constraints are enforced via the `firestore.rules` compiler and evaluated inside validation rules.
