# QueensLuxea

## Supabase authentication

The application includes email/password sign-up, email confirmation, password reset, Google/Apple OAuth entry points, session restoration, and protected customer, vendor, and admin routes.

1. Create a Supabase project and copy `.env.example` to `.env.local`, filling in the project URL and **publishable/anon** key.
2. Run [20260911_secure_auth.sql](supabase/migrations/20260911_secure_auth.sql) in the Supabase SQL editor (or apply it with the Supabase CLI).
3. In Supabase Authentication settings, enable email confirmations and configure a password-strength policy of at least 12 characters. Add your local and production URLs to the Redirect URLs list, including `/auth/callback` and `/reset-password`.
4. Enable Google and/or Apple only after completing their provider configuration in Supabase. The buttons safely surface provider configuration errors until then.

New accounts are always created as `customer`. Promote a user to `vendor` or `admin` only through a trusted server/admin workflow that uses Supabase's service-role key; do not expose that key to this browser app. The migration intentionally gives browsers no direct permission to change roles.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
