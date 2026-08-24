# KAMSpace Frontend Prototype

This is the structured frontend prototype for KAMSpace.

It intentionally has no backend and no build step yet. The app runs as static files through a local HTTP server.

## Structure

- `index.html` - app entry point.
- `src/main.js` - app bootstrap and page switching.
- `src/data/` - mock data for the prototype.
- `src/components/` - reusable layout pieces.
- `src/pages/` - screen modules.
- `src/styles/` - split CSS by purpose and page.

## Local Preview

From this folder:

```powershell
python -m http.server 5174 --bind 0.0.0.0
```

Then open:

```text
http://localhost:5174
```

On a phone in the same Wi-Fi network, use the computer's local IP instead of `localhost`.
