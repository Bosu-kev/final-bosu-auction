# Final Bosu — Auction

Standalone Next.js page for the 24-hour treasury offer window. Public-facing.

## Customize

- **End time** — `components/auction/auction-data.ts` → `AUCTION_OFFER_END_ISO`
- **NFTs** — `components/auction/auction-data.ts` → `OFFER_ITEMS`
- **NFT images** — `public/images/auction/*.png`

## Develop

```bash
npm install
npm run dev
```

Opens at http://localhost:3000

## Deploy

Deploys cleanly to Vercel — no env vars required. Import the GitHub repo at vercel.com/new.
