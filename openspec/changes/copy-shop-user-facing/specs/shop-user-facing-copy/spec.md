## ADDED Requirements

### Requirement: Shop UI SHALL use plain Polish operational language
Shop-facing screens MUST NOT display developer or implementation terminology such as token, backend, API, fallback, or flow.

#### Scenario: Shop dashboard procedure text
- **WHEN** a shop user reads the sale procedure on the shop dashboard
- **THEN** instructions SHALL describe scanning QR codes and entering codes manually in Polish
- **AND** SHALL NOT mention backend validation or atomic transactions

#### Scenario: Shop sale verification tabs
- **WHEN** a shop user verifies a promesa on the sale page
- **THEN** manual entry SHALL be labeled as code from QR (not token)
- **AND** permit type in verification summary SHALL display Polish labels

### Requirement: Shop error messages SHALL be user-actionable
Errors shown during shop verification, camera use, or sale registration MUST guide the user to retry or use manual code entry without developer setup instructions.

#### Scenario: Camera unavailable
- **WHEN** the scanner cannot start the camera
- **THEN** the message SHALL suggest entering the promesa code manually
- **AND** SHALL NOT mention tunnels, LAN addresses, or package manager commands

#### Scenario: Unmapped verification failure
- **WHEN** verification fails with an unknown API message
- **THEN** the UI SHALL show a generic Polish failure message
- **AND** SHALL NOT display raw English API text
