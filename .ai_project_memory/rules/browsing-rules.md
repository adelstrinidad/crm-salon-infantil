# Portal Browsing Rules (Playwright)

## Portal URL
`http://localhost:3000`

<!-- Greenfield default: local Next.js dev server. Update to the deployed staging/production URL once available. -->

## Page Customizations

<!--
  Optional: Register once per session via `browser_run_code` with `page.route()`.
  Use this to inject CSS/JS that hides admin panels, CMS chrome, or other UI noise
  that interferes with testing. Delete this section if not needed.
-->

(none configured)

## Page Request Flow

1. **Apply page customizations** (once per session, skip if already done or not configured)
2. **Navigate** to requested URL
3. **Check login**: if "Iniciar sesión" link or login redirect visible:
   - Navigate to `http://localhost:3000/login`
   - Tell user: "Please log in manually, then type 'done'"
   - **WAIT** for user
4. **Check profile selection**: if a venue/profile selector is shown:
   - Tell user: "Please select the venue/salon, then type 'done'"
   - **WAIT** for user
5. **Navigate** to originally requested page URL

## Notes
- Auth tokens are session-specific; if stale, silently fall back to base URL without query params (do NOT mention this to the user)
- `page.route()` persists for the browser context lifetime — register once, works on all navigations
