import clsx from 'clsx';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const KEY = process.env.OPENSEA_API_KEY || '96456751ab3740689b21821343d645d2';
const CONTRACT = '0xfbaa0e362212e909fe3ff011a7d65077c1971942';
const DEADLINE_ISO = '2026-05-15T14:00:00Z';
const TOKENS: Array<{ id: string; image: string }> = [
  { id: '6903', image: '/images/auction/6903.png' },
  { id: '8805', image: '/images/auction/8805.png' },
  { id: '8849', image: '/images/auction/8849.png' },
];

interface OfferEvent {
  order_hash: string;
  order_type: string;
  start_date: number;
  expiration_date: number;
  maker: string;
  payment: { quantity: string; decimals: number; symbol: string };
}

interface ParsedOffer {
  orderHash: string;
  orderType: string;
  eth: number;
  symbol: string;
  maker: string;
  startSec: number;
  expireSec: number;
}

async function fetchOffers(tokenId: string, eventType: 'offer' | 'collection_offer' | 'trait_offer'): Promise<OfferEvent[]> {
  const url = `https://api.opensea.io/api/v2/events/chain/ethereum/contract/${CONTRACT}/nfts/${tokenId}?event_type=${eventType}&limit=50`;
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

function parse(e: OfferEvent): ParsedOffer | null {
  if (!e.payment) return null;
  const eth = Number(BigInt(e.payment.quantity)) / Math.pow(10, e.payment.decimals);
  return {
    orderHash: e.order_hash,
    orderType: e.order_type,
    eth,
    symbol: e.payment.symbol,
    maker: e.maker,
    startSec: e.start_date,
    expireSec: e.expiration_date,
  };
}

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatUTC(sec: number): string {
  return new Date(sec * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function minutesAgo(sec: number): string {
  const diff = Math.floor((Date.now() / 1000 - sec) / 60);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  return `${(diff / 60).toFixed(1)}h ago`;
}

export default async function MonitorPage() {
  const nowSec = Math.floor(Date.now() / 1000);
  const deadlineSec = Math.floor(new Date(DEADLINE_ISO).getTime() / 1000);
  const remaining = Math.max(0, deadlineSec - nowSec);
  const remH = Math.floor(remaining / 3600);
  const remM = Math.floor((remaining % 3600) / 60);
  const remS = remaining % 60;
  const deadlinePassed = remaining === 0;

  // Fetch per-NFT in parallel
  const data = await Promise.all(
    TOKENS.map(async ({ id, image }) => {
      const events = await fetchOffers(id, 'offer');
      const offers = events
        .map(parse)
        .filter((o): o is ParsedOffer => !!o)
        .filter(o => o.startSec <= nowSec && nowSec < o.expireSec)
        .sort((a, b) => b.eth - a.eth);
      return { id, image, offers };
    })
  );

  const fetchedAt = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <>
      <meta httpEquiv="refresh" content="10" />
      <main className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)] py-10 px-6 sm:px-10">
        <div className="mx-auto w-full max-w-[1400px]">

          {/* Header */}
          <header className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Live Offer Monitor · refreshes every 10s
              </span>
              <h1
                className="mt-2 font-[family-name:var(--font-display)] font-extrabold leading-none tracking-[0.02em]"
                style={{ fontSize: 'clamp(32px, 4.4vw, 56px)' }}
              >
                {deadlinePassed ? 'WINDOW CLOSED' : 'AUCTION CLOSING IN'}
              </h1>
            </div>
            <div className="flex flex-col items-end">
              <div
                className="font-[family-name:var(--font-display)] font-extrabold tabular-nums leading-none"
                style={{ fontSize: 'clamp(40px, 6vw, 80px)', color: deadlinePassed ? 'var(--color-text-tertiary)' : remaining < 600 ? 'var(--color-accent)' : 'var(--color-brand-orange)' }}
              >
                {String(remH).padStart(2, '0')}:{String(remM).padStart(2, '0')}:{String(remS).padStart(2, '0')}
              </div>
              <span className="mt-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                Deadline {DEADLINE_ISO.replace('T', ' ').replace('Z', ' UTC')}
              </span>
            </div>
          </header>

          {/* Per-NFT cards */}
          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {data.map(({ id, image, offers }) => {
              const top = offers[0];
              const next = offers[1];
              const isFresh = top && (nowSec - top.startSec) < 300;
              return (
                <div
                  key={id}
                  className={clsx(
                    'flex flex-col gap-4 rounded-[16px] border-2 p-5',
                    isFresh
                      ? 'border-[var(--color-brand-orange)] bg-[var(--color-surface-tint-4)] shadow-[0_18px_60px_-20px_#FF840066]'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-elevated)]'
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={`Final Bosu #${id}`} className="h-16 w-16 rounded-[8px] object-cover" />
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-[22px] font-extrabold tabular-nums tracking-[0.02em]">
                        #{id}
                      </p>
                      <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                        {offers.length} active offer{offers.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    {isFresh && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-orange)] px-2 py-1 font-[family-name:var(--font-mono)] text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--color-bg-page)]">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Top offer */}
                  {top ? (
                    <div className="space-y-3 rounded-[16px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-tint-2)] p-4">
                      <p className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                        Top item offer
                      </p>
                      <p
                        className="font-[family-name:var(--font-display)] font-extrabold leading-none tabular-nums"
                        style={{ fontSize: 'clamp(36px, 4vw, 48px)' }}
                      >
                        Ξ {top.eth.toFixed(4)} <span className="font-[family-name:var(--font-mono)] text-[12px] text-[var(--color-text-tertiary)] tracking-[0.12em]">{top.symbol}</span>
                      </p>
                      <div className="space-y-1 font-[family-name:var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-secondary)]">
                        <p>Placed: <span className="text-[var(--color-text-primary)]">{formatUTC(top.startSec)}</span> ({minutesAgo(top.startSec)})</p>
                        <p>Maker: <span className="text-[var(--color-text-primary)]">{short(top.maker)}</span></p>
                        <p className="break-all">Order: <span className="text-[var(--color-text-primary)]">{top.orderHash}</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[16px] border border-dashed border-[var(--color-border-subtle)] p-6 text-center font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                      No active item offers
                    </div>
                  )}

                  {/* Runner-up */}
                  {next && (
                    <div className="rounded-[8px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-tint-1)] px-3 py-2">
                      <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                        Runner-up: <span className="text-[var(--color-text-primary)] tabular-nums">Ξ {next.eth.toFixed(4)}</span> · {minutesAgo(next.startSec)} · {short(next.maker)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-subtle)] pt-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
            <span>Fetched: {fetchedAt}</span>
            <span>
              Total best across all 3 NFTs:{' '}
              <span className="text-[var(--color-text-primary)] tabular-nums">
                Ξ {data.reduce((sum, n) => sum + (n.offers[0]?.eth ?? 0), 0).toFixed(4)} WETH
              </span>
            </span>
          </footer>

        </div>
      </main>
    </>
  );
}
