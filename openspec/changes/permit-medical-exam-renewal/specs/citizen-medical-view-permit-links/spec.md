## MODIFIED Requirements

### Requirement: Citizen SHALL see clear exam status per permit

System SHALL calculate and present a deterministic status for each exam entry per permit based on expiry date and available alert signals. Status `missing` SHALL mean missing validity date in the registry for an active permit, not missing medical attachments on a permit application.

#### Scenario: Status is active when exam date is valid

- **WHEN** exam expiry date is after current date and no matching expired condition exists
- **THEN** system SHALL mark the exam entry as active/current

#### Scenario: Status is expiring or expired

- **WHEN** exam expiry date is within warning horizon or in the past
- **THEN** system SHALL mark the exam entry as expiring or expired respectively
- **AND** system SHALL surface due date in a user-readable date format

#### Scenario: Missing exam date in registry

- **WHEN** permit exam expiry date is missing on an active permit
- **THEN** system SHALL mark status as missing data with label semantics indicating registry data gap (e.g. "Brak danych")
- **AND** system SHALL display guidance that exam confirmation requires WPA verification
- **AND** system SHALL NOT present this state as equivalent to failing to attach certificates when submitting a new permit application

#### Scenario: Renewal action when attention required

- **WHEN** a permit group requires attention (`expired`, `expiring`, or `missing`)
- **AND** no pending medical exam renewal exists for that permit
- **THEN** system SHALL show a primary action to submit exam renewal (upload + dates)
- **AND** guidance SHALL state that this is renewal on the existing permit, not a new permit application

#### Scenario: Pending renewal replaces offline-only guidance

- **WHEN** citizen has a pending exam renewal for a permit on the medical view
- **THEN** system SHALL show renewal status (e.g. awaiting WPA review) instead of only "contact the office" offline guidance
- **AND** system SHALL hide the submit-renewal action until the pending renewal is decided

### Requirement: Citizen medical view SHALL use renewal APIs

System SHALL load renewal status for permits from citizen renewal endpoints in addition to permits and medical alerts.

#### Scenario: Load permits alerts and renewals

- **WHEN** medical view data is loaded
- **THEN** system SHALL fetch citizen permits, medical alerts, and medical exam renewals relevant to those permits
- **AND** system SHALL derive UI state (CTA vs pending vs current) from the combined data

## REMOVED Requirements

### Requirement: Citizen medical view SHALL remain backend-compatible

**Reason**: Renewal flow requires new citizen (and WPA) API endpoints and persistence; the prior "no new endpoints" constraint is obsolete.

**Migration**: Implement `permit-medical-exam-renewal` backend contract before enabling renewal UI; until then feature flag or graceful empty renewal list.
