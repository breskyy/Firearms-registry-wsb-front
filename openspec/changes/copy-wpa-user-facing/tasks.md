## 1. Status labels

- [x] 1.1 `WpaApplicationReviewBar` uses `getApplicationStatusMeta`
- [x] 1.2 `DecisionPage` shows permit status via `getPermitStatusMeta`

## 2. Polish terminology

- [x] 2.1 Replace „sloty” with „miejsca w pozwoleniu” on WPA surfaces
- [x] 2.2 Replace English alert count in `WPASearchPage`
- [x] 2.3 Remove raw `UnderReview` from user-facing promise hint on `DecisionPage`

## 3. Error messages

- [x] 3.1 `DecisionPage`, `OfficerDashboard`, `CitizenDetailsWPA` use `getApiErrorMessage`
- [x] 3.2 Attachment preview/download errors use `getApiErrorMessage`

## 4. Verification

- [x] 4.1 `npm run build` passes
