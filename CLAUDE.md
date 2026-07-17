# CLAUDE.md

## Build
- Always run `npm run build` after changing any view/frontend files (resources/js, resources/views, .tsx, .blade.php, etc.) so the compiled assets in `public/build` reflect the changes. Laravel serves the built assets via the Vite manifest, not the raw source, so changes won't appear until a build runs.
