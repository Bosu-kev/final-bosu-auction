export interface AuctionItem {
  id: 'B' | 'C' | 'D';
  tokenId: number;
  title: string;
  description: string;
  image: string;
  opensea: string;
}

/**
 * UTC end time for the 24-hour offer window.
 * Edit here to shift or extend.
 */
export const AUCTION_OFFER_END_ISO = '2026-05-15T14:00:00Z';

export const OFFER_ITEMS: AuctionItem[] = [
  {
    id: 'B',
    tokenId: 6903,
    title: 'Final Bosu #6903',
    description: '24h offer window. Place your best offer on OpenSea.',
    image: '/images/auction/6903.png',
    opensea: 'https://opensea.io/assets/abstract/0x5fedb9a131f798e986109dd89942c17c25c81de3/6903',
  },
  {
    id: 'C',
    tokenId: 8805,
    title: 'Final Bosu #8805',
    description: '24h offer window. Place your best offer on OpenSea.',
    image: '/images/auction/8805.png',
    opensea: 'https://opensea.io/assets/abstract/0x5fedb9a131f798e986109dd89942c17c25c81de3/8805',
  },
  {
    id: 'D',
    tokenId: 8849,
    title: 'Final Bosu #8849',
    description: '24h offer window. Place your best offer on OpenSea.',
    image: '/images/auction/8849.png',
    opensea: 'https://opensea.io/assets/abstract/0x5fedb9a131f798e986109dd89942c17c25c81de3/8849',
  },
];
