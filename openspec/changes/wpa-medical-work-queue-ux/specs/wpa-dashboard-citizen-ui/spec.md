## MODIFIED Requirements

### Requirement: WPA officer dashboard sections SHALL use citizen-style section headers

System SHALL present list sections on the WPA officer dashboard without wrapping the entire list in a CardHeader/CardTitle/CardDescription document shell.

#### Scenario: Permit applications tab section header

- **WHEN** officer views the permit applications tab on the WPA dashboard
- **THEN** system SHALL show a section title and optional description outside of any CardHeader component
- **AND** system SHALL render pending applications as a vertical list of application tiles below that header

#### Scenario: Promise and medical tabs use section headers

- **WHEN** officer views the promise applications tab or the Badania tab on the WPA dashboard
- **THEN** system SHALL use the same section header pattern as the permit applications tab
- **AND** system SHALL NOT use CardHeader solely to label the whole list block
- **AND** on the Badania tab system SHALL use separate section headers for **Do weryfikacji** and **Monitorowanie**

### Requirement: WPA list section behavior SHALL preserve core medical actions

UI refactor SHALL NOT remove suspend-permit or citizen-profile navigation; renewal verification SHALL use the renewal detail route, not a misleading primary action on monitoring rows.

#### Scenario: Monitoring alert actions

- **WHEN** officer uses footer actions on a monitoring-section alert row (no pending renewal)
- **THEN** system SHALL preserve profile navigation and suspend-permit behavior for expired alerts
- **AND** system SHALL NOT show **Aktualizuj badania** or **Profil i korekta dat** as primary list actions on the dashboard monitoring row

#### Scenario: Pending renewal verification entry

- **WHEN** officer needs to verify citizen-uploaded certificates
- **THEN** system SHALL enter verification from **Do weryfikacji** on the Badania tab or the renewal detail page
- **AND** system SHALL NOT require opening monitoring rows for attachment access
