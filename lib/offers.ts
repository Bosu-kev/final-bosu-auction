/**
 * Server-side helper to fetch the top active item offer for each auction NFT
 * from OpenSea. Used by the homepage so each card can show its current bid.
 */

const KEY = process.env.OPENSEA_API_KEY || '96456751ab3740689b21821343d645d2';
const CONTRACT = '0xfbaa0e362212e909fe3ff011a7d65077c1971942';

export interface TopOffer {
  eth: number;
  symbol: string;
  startSec: number;
  maker: string;
  orderHash: string;
}

interface OfferEvent {
  order_hash: string;
  order_type: string;
  start_date: number;
  expiration_date: number;
  maker: string;
  payment: { quantity: string; decimals: number; symbol: string };
}

async function fetchOffers(tokenId: string): Promise<OfferEvent[]> {
  const url = `https://api.opensea.io/api/v2/events/chain/ethereum/contract/${CONTRACT}/nfts/${tokenId}?event_type=offer&limit=50`;
  try {
    const res = await fetch(url, {
      headers: { 'x-api-key': KEY, accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { asset_events?: OfferEvent[] };
    return data.asset_events ?? [];
  } catch {
    return [];
  }
}

export async function fetchTopOffer(tokenId: string): Promise<TopOffer | null> {
  const events = await fetchOffers(tokenId);
  const nowSec = Math.floor(Date.now() / 1000);
  const active = events
    .filter(e => e.payment && e.start_date <= nowSec && nowSec < e.expiration_date)
    .map(e => ({
      eth: Number(BigInt(e.payment.quantity)) / Math.pow(10, e.payment.decimals),
      symbol: e.payment.symbol,
      startSec: e.start_date,
      maker: e.maker,
      orderHash: e.order_hash,
    }))
    .sort((a, b) => b.eth - a.eth);
  return active[0] ?? null;
}

export async function fetchTopOffersByToken(tokenIds: string[]): Promise<Record<string, TopOffer | null>> {
  const results = await Promise.all(tokenIds.map(id => fetchTopOffer(id)));
  const out: Record<string, TopOffer | null> = {};
  tokenIds.forEach((id, i) => {
    out[id] = results[i];
  });
  return out;
}
