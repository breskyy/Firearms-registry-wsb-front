## ADDED Requirements

### Requirement: Citizen SHALL submit medical exam renewal for an active permit

System SHALL allow a citizen to submit a renewal request for a specific active permit they own, including both medical and psychological certificate files and proposed validity dates, without filing a new permit application.

#### Scenario: Submit renewal when exams need attention

- **WHEN** citizen has an active permit with at least one exam status of `expired`, `expiring`, or `missing` (registry date gap)
- **THEN** system SHALL offer a renewal submission action for that permit
- **AND** submission SHALL require both certificate files and both proposed expiry dates

#### Scenario: Block duplicate pending renewal

- **WHEN** citizen already has a renewal for the same permit in status `Submitted` or `UnderReview`
- **THEN** system SHALL reject a new submission with a user-facing conflict message
- **AND** system SHALL show the existing pending renewal status instead

#### Scenario: Attachment rules match permit application

- **WHEN** citizen uploads renewal certificates
- **THEN** system SHALL accept only PDF, JPG, or PNG files up to 10 MB each
- **AND** both certificate files SHALL be provided in the same submission (single-shot; correction after submit is via rejection + new submission)

### Requirement: WPA SHALL review and decide renewal submissions

System SHALL expose renewal submissions to WPA officers for verification, download of attachments, and approval or rejection.

#### Scenario: Officer views renewal queue

- **WHEN** WPA officer opens the renewal work queue
- **THEN** system SHALL list renewals in `Submitted` or `UnderReview` with citizen name, permit number, and submission date

#### Scenario: Officer downloads certificates

- **WHEN** officer opens a renewal detail
- **THEN** system SHALL allow download of both attached certificates for that renewal submission

#### Scenario: Approve renewal updates permit validity

- **WHEN** officer approves a renewal
- **THEN** system SHALL set the permit's `medicalExamExpiryDate` and `psychologicalExamExpiryDate` to the approved dates (from the renewal proposal unless officer adjusts at approve time)
- **AND** system SHALL mark the renewal as `Approved`
- **AND** system SHALL resolve related medical alerts for that permit where applicable

#### Scenario: Reject renewal preserves permit dates

- **WHEN** officer rejects a renewal with a reason
- **THEN** system SHALL mark the renewal as `Rejected` and store the reason
- **AND** system SHALL NOT change the permit's current exam expiry dates
- **AND** citizen SHALL be able to submit a new renewal afterward

### Requirement: System SHALL retain renewal history

System SHALL keep submitted renewal records and their attachments after a decision; approved renewals SHALL NOT delete prior renewal records or their files.

#### Scenario: History after approval

- **WHEN** a renewal is approved and a later renewal is submitted and approved
- **THEN** system SHALL retain both renewal records with their attachments and statuses
- **AND** the permit SHALL reflect only the latest approved validity dates for operational checks

#### Scenario: Citizen views renewal status

- **WHEN** citizen views permit medical context after submitting a renewal
- **THEN** system SHALL show pending, approved, or rejected status of their renewal(s) for that permit
- **AND** SHALL NOT imply that a full new permit application is required for exam refresh

### Requirement: WPA manual date override remains available

System SHALL keep `PATCH /wpa/permits/{id}/medical-exams` as an officer-only path to correct registry dates without a citizen renewal record (e.g. paper intake).

#### Scenario: Override without renewal

- **WHEN** officer updates exam dates via the existing permit medical-exams patch without an linked approved renewal
- **THEN** system SHALL update permit dates as today
- **AND** SHALL NOT require citizen-uploaded attachments for that action
