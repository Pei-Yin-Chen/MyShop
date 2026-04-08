<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project UI conventions

- **Admin panel primary buttons** (search, submit, import, save on page-level forms): use `Button` with `size="lg"` and `className="rounded-full"`. See `.cursor/rules/admin-ui-buttons.mdc` when editing `src/app/admin/**` or `src/components/admin/**`.
- **Admin form field labels** (spacing and typography above inputs): see `.cursor/rules/admin-ui-form-fields.mdc`.
- **Admin back-to-list navigation** (icon button top-left): see `.cursor/rules/admin-ui-back-navigation.mdc` and use `AdminBackToListLink`.
