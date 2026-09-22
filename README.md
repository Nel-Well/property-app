# Property Portal Web App

The web app is the responsive marketplace experience for Thiri Properties. Visitors can browse sale and rental listings in Yangon and Mandalay, open listing details, and try role-aware dashboard flows with the seeded API.

## Requirements

- Node.js 20 or newer
- npm
- The API project is recommended for live data, but the app can fall back to a local demo dataset

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`. Set `VITE_API_URL` in `.env` if the API is hosted somewhere other than `http://localhost:4000/api/v1`.

## Useful commands

```bash
npm run dev      # start Vite development server
npm run build    # type-check and create a production build
npm run preview  # preview the production build
npm run lint     # type-check
```

## Demo access

Use the sign-in dialog to choose a seeded buyer/renter, owner, agent, staff, or admin account. All local demo accounts use the password `demo-password`.

The UI is configured for shadcn/ui preset `b7ClNFsdU`; reusable primitives live in `components/ui`.

See the workspace [AGENTS.md](../AGENTS.md) for stable web boundaries and [SPEC.md](../SPEC.md) for the product behavior being implemented.
