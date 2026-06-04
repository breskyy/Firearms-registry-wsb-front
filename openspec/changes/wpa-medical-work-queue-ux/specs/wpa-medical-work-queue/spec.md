## ADDED Requirements

### Requirement: WPA dashboard SHALL expose a third peer tab for medical work

System SHALL present exactly three primary work-queue tabs on the WPA officer dashboard: permit applications, promise applications, and medical matters (`Badania`). System SHALL NOT expose separate top-level tabs named only for renewals or only for medical alerts.

#### Scenario: Three peer tabs visible

- **WHEN** officer opens the WPA dashboard
- **THEN** system SHALL show tabs for Pozwolenia, Promesy, and Badania with equal tab treatment
- **AND** system SHALL NOT show separate Odnowienia and Alerty tabs at the dashboard level

#### Scenario: Medical tab count

- **WHEN** officer views the Badania tab label
- **THEN** system SHALL show a count badge equal to the number of distinct medical work items requiring officer attention
- **AND** the count SHALL include each pending renewal (`Submitted` or `UnderReview`) once
- **AND** the count SHALL include each unresolved medical alert whose permit has no pending renewal (avoid double-counting the same permit)

### Requirement: Medical tab SHALL separate verification queue from monitoring

The Badania tab SHALL contain two list sections with distinct purposes: officer verification of citizen-submitted renewals (with attachments), and monitoring of registry alerts when no renewal is pending.

#### Scenario: Verification section lists pending renewals

- **WHEN** officer opens the Badania tab and one or more renewals exist in `Submitted` or `UnderReview`
- **THEN** system SHALL render section **Do weryfikacji** above monitoring
- **AND** each row SHALL show citizen name, permit number, renewal status, and submission date
- **AND** tapping the row SHALL navigate to `/officer/medical-exam-renewals/{renewalId}`

#### Scenario: Verification rows use application list tile pattern

- **WHEN** officer views a row in **Do weryfikacji**
- **THEN** system SHALL use the same `ApplicationListTile` list card pattern as pending permit applications on the dashboard
- **AND** system SHALL NOT require a separate footer button to open renewal detail when the tile itself is navigable

#### Scenario: Monitoring section lists alerts without pending renewal

- **WHEN** officer opens the Badania tab and unresolved medical alerts exist for permits without a `Submitted` or `UnderReview` renewal
- **THEN** system SHALL render section **Monitorowanie** with those alerts
- **AND** rows SHALL indicate alert type (expired / expiring) and permit context
- **AND** system SHALL NOT present attachment download or approve/reject actions on these rows

#### Scenario: Alert with pending renewal appears only in verification

- **WHEN** an unresolved medical alert exists for a permit that also has a pending renewal
- **THEN** system SHALL show that permit only under **Do weryfikacji** (via the renewal row)
- **AND** system SHALL NOT duplicate the same permit under **Monitorowanie**

#### Scenario: Empty medical tab

- **WHEN** no pending renewals and no monitoring alerts remain
- **THEN** system SHALL show an empty state indicating no medical work requires attention

### Requirement: Monitoring section SHALL offer appropriate officer actions

For alerts without a pending citizen renewal, system SHALL offer monitoring actions only; verification actions SHALL appear only when a renewal exists.

#### Scenario: Monitoring primary actions

- **WHEN** officer views a monitoring row for an alert without pending renewal
- **THEN** system SHALL offer navigation to the citizen profile
- **AND** for expired alert types system SHALL offer suspend permit when `permitId` is present
- **AND** system SHALL NOT show **Weryfikuj odnowienie** or attachment verification affordances

#### Scenario: Registry override is secondary

- **WHEN** officer needs to correct exam dates without a citizen renewal
- **THEN** system SHALL direct them via citizen profile to **Korekta dat w rejestrze** (existing PATCH flow)
- **AND** system SHALL NOT present registry override as the primary action on monitoring list rows

### Requirement: Medical work queue SHALL reuse existing APIs

Front-end implementation SHALL merge existing WPA medical alerts and medical exam renewal list endpoints without requiring a new aggregated API in this change.

#### Scenario: Data load on tab open

- **WHEN** officer loads the WPA dashboard
- **THEN** system SHALL fetch pending renewals and unresolved medical alerts using existing `wpaService` methods
- **AND** SHALL partition results client-side into verification and monitoring sections per this spec
