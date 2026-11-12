# Implementation notes

This prototype is intentionally honest about missing evidence. It is a usable interactive front-end, not a production AVM.

- All displayed rates are hard-coded illustrative constants.
- Case records are stored in browser localStorage.
- No authentication, server-side RBAC, Postgres, geospatial source, transaction feed or audit service is connected.
- The backend folder is a separate FastAPI starter and is not connected to the static UI.
- The dashboard uses sample/demo records. No data should be represented as actual Jaipur sales.
- Replace demo heuristic only after licensed labelled data, temporal/geographic validation and calibration are available.
