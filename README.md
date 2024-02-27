# 🏎️💨 Endurance Results
A Nuxt-powered website focused on gathering endurance racing results from multiple series and presenting them in a unified platform

## Built With
- [Nuxt 3](https://github.com/nuxt/framework)
- [Drizzle](https://github.com/drizzle-team/drizzle-orm)
- [NuxtLabs UI](https://github.com/nuxtlabs/ui)
- [Tailwindcss](https://github.com/tailwindlabs/tailwindcss)

## Setup

Make sure to install the dependencies:

```bash
# pnpm
pnpm i
```

Update .env values

```bash
DATABASE_URL = ''
DATABASE_AUTH_TOKEN = ''

NUXT_PUBLIC_SITE_URL=https://localhost:3000

```

## Development Server

Start the development server on http://localhost:3000

```bash
pnpm run dev
```

## Production

Build the application for production:

```bash
pnpm run build
```

Locally preview production build:

```bash
pnpm run preview
```