'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { AUCTION_OFFER_END_ISO, OFFER_ITEMS, type AuctionItem } from './auction-data';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function breakdown(secondsRemaining: number) {
  if (secondsRemaining < 0) secondsRemaining = 0;
  const h = Math.floor(secondsRemaining / 3600);
  const m = Math.floor((secondsRemaining % 3600) / 60);
  const s = Math.floor(secondsRemaining % 60);
  return { h, m, s };
}

export function AuctionView() {
  const endMs = new Date(AUCTION_OFFER_END_ISO).getTime();

  const [now, setNow] = useState(Date.now());
  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    tickRef.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
    };
  }, []);

  const remainingSec = Math.max(0, Math.floor((endMs - now) / 1000));
  const ended = remainingSec === 0;
  const isLow = !ended && remainingSec <= 3600;
  const t = breakdown(remainingSec);

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-12 px-6 py-12 sm:gap-16 sm:px-10 sm:py-16">
        {/* Header */}
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-orange)] sm:text-[11px]">
            Final Bosu · Treasury Auction
          </span>
        </header>

        {/* Countdown */}
        <section className="flex w-full flex-col items-center gap-6">
          <span
            className={clsx(
              'font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.22em] sm:text-[11px]',
              ended
                ? 'text-[var(--color-text-tertiary)]'
                : isLow
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-accent)]'
            )}
          >
            {ended ? 'Window closed' : isLow ? 'Final hour' : 'Time remaining'}
          </span>

          <div className="grid w-full grid-cols-3 gap-3 sm:gap-4">
            <TimeTile value={pad(t.h)} label="Hours" tone={ended ? 'ended' : isLow ? 'low' : 'normal'} />
            <TimeTile value={pad(t.m)} label="Minutes" tone={ended ? 'ended' : isLow ? 'low' : 'normal'} />
            <TimeTile value={pad(t.s)} label="Seconds" tone={ended ? 'ended' : isLow ? 'low' : 'normal'} />
          </div>

          <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
            Ends {new Date(AUCTION_OFFER_END_ISO).toUTCString()}
          </p>
        </section>

        {/* NFT cards */}
        <section className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
          {OFFER_ITEMS.map(item => (
            <NftCard key={item.id} item={item} ended={ended} />
          ))}
        </section>

        {/* Single-line how-it-works */}
        <p className="max-w-2xl text-center font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] sm:text-[12px]">
          Tap any piece → place your offer on OpenSea → highest offer wins
        </p>
      </div>
    </div>
  );
}

function TimeTile({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: 'normal' | 'low' | 'ended';
}) {
  const ring =
    tone === 'ended'
      ? 'border-[var(--color-border-subtle)] bg-[var(--color-surface-tint-1)]'
      : tone === 'low'
        ? 'border-[var(--color-accent)] bg-[var(--color-surface-tint-4)] shadow-[0_18px_60px_-20px_#E51A4B66]'
        : 'border-[var(--color-border-default)] bg-[var(--color-bg-elevated)]';
  const numberColor =
    tone === 'ended'
      ? 'text-[var(--color-text-secondary)]'
      : 'text-[var(--color-text-primary)]';

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-3 rounded-[16px] border-2 px-2 py-8 sm:py-10',
        ring
      )}
    >
      <span
        className={clsx(
          'font-[family-name:var(--font-display)] font-extrabold leading-none tracking-[0.02em] tabular-nums',
          numberColor
        )}
        style={{ fontSize: 'clamp(56px, 11vw, 128px)' }}
      >
        {value}
      </span>
      <span className="font-[family-name:var(--font-mono)] text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-tertiary)] sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

function NftCard({ item, ended }: { item: AuctionItem; ended: boolean }) {
  const inner = (
    <>
      <div className="absolute left-3 top-3 z-10">
        <span
          className={clsx(
            'inline-flex h-8 w-8 items-center justify-center rounded-full font-[family-name:var(--font-display)] text-[16px] font-extrabold tracking-wider',
            ended
              ? 'bg-[var(--color-surface-tint-3)] text-[var(--color-text-tertiary)]'
              : 'bg-[var(--color-brand-orange)] text-[var(--color-on-brand-orange)]'
          )}
        >
          {item.id}
        </span>
      </div>

      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-bg-elevated)]">
        <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <p className="font-[family-name:var(--font-display)] text-[18px] font-extrabold uppercase tracking-[0.04em] text-[var(--color-text-primary)] tabular-nums">
          #{item.tokenId}
        </p>
        {!ended ? (
          <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--color-brand-orange)] px-3 py-2 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-on-brand-orange)] transition-colors group-hover:bg-[var(--color-brand-yellow)]">
            Offer
            <span aria-hidden>↗</span>
          </span>
        ) : (
          <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
            Closed
          </span>
        )}
      </div>
    </>
  );

  const className = clsx(
    'group relative block overflow-hidden rounded-[16px] border-2 bg-[var(--color-surface-tint-2)] transition-transform',
    ended
      ? 'opacity-70 border-[var(--color-border-subtle)]'
      : 'border-[var(--color-brand-orange)] hover:-translate-y-0.5'
  );

  if (!ended) {
    return (
      <a href={item.opensea} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return <div className={className}>{inner}</div>;
}
