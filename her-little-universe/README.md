# Commit to Together

Create a personal, shareable invitation for proposals, anniversaries, weddings, pre-wedding celebrations, birthdays, or any moment worth celebrating. Each page has its own unlisted link, editable private owner link, story and memory sections, optional photos and music, and a guest reply form.

## Run locally

Use Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

The Vite development server serves the creator at the local URL it prints and proxies `/api` requests to the backend. In a second terminal, start the backend:

```bash
npm run server
```

The SQLite database is created at `data/events.sqlite`. Set `DATABASE_PATH` to use a different persistent database location, and `PORT` to change the backend port (default `3000`).

## Create and share an invitation

1. Choose an occasion and personalize the names, headline, story, moments, invitation, and optional plans.
2. Create the page and share the guest invitation link.
3. Save the private management link. Its access key is shown only once and is required to edit the page or read replies.
4. Guests can reply yes, ask for time, or decline, with an optional note. Only the owner link can view submitted replies.

Pages are unlisted rather than password-protected: anyone with a guest link can see that page. Treat the owner link like a password. The server stores only a hash of the owner access key.

Photos and songs are entered as HTTPS URLs; this app does not upload media. Use links you are allowed to share and that can be accessed by guests.

## Production

Build the React app and run the Node server from this directory:

```bash
npm run build
npm start
```

The server serves the production build and API from the same origin. Set a persistent `DATABASE_PATH` volume in production; the SQLite file contains event and guest-reply data. Back it up and restrict access to the hosting environment.

## Tech stack

- React 19, Vite, Framer Motion, Lucide React, and Canvas Confetti
- Node.js HTTP API with SQLite (`better-sqlite3`)
