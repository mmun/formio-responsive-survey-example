# Form.io responsive survey demo

This repo contains a minimal Form.io demo that does two things:

1. Preloads a PHQ-style survey matching the screenshot content.
2. Registers a custom `responsiveSurvey` component that uses the stock Form.io survey table on desktop and shows one question at a time on mobile.

## Run locally

Serve the repo with any static file server and open `index.html`.

Examples:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Files

- `index.html`: Loads Form.io and mounts the live preview.
- `app.js`: Defines the survey schema and the custom responsive survey component.
- `styles.css`: Adds the mobile card layout and page styling.
