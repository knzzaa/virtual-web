# Mobile UI Port Notes (Web → Expo)

This folder contains the Expo (React Native) implementation of the web frontend.

## Styling system

We use a small shared theme in:
- `src/styles/theme.ts`

If you’re styling a screen, prefer using:
- `theme.spacing.*`
- `theme.colors.*`
- `theme.radius.*`
- `theme.card` presets

This keeps the UI consistent and similar to the web design.

## Images / assets (important)

All copied web images live in:
- `assets/img/*`

**Rule of thumb for screen files** (located at `src/screens/.../*.tsx`):
- Use `require("../../../assets/img/<name>.png")`

Examples:
- `require("../../../assets/img/books.png")`
- `require("../../../assets/img/mission.png")`

`HtmlContent` also maps known filenames to local assets so HTML like `../../assets/img/books.png` can render in mobile.

## Common troubleshooting

### “Unable to resolve module ...png”
- Check the relative depth: screen files are usually 3 levels deep from `assets/`.
- Confirm the file exists in `mobile/assets/img`.

### Backend not reachable from device
- Ensure `API_BASE_URL` resolves to your machine IP (packager host) or set `EXPO_PUBLIC_API_BASE_URL`.
