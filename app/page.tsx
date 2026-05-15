import { AuctionView } from '@/components/auction/auction-view';
import { fetchTopOffersByToken, type TopOffer } from '@/lib/offers';
import { OFFER_ITEMS } from '@/components/auction/auction-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const tokenIds = OFFER_ITEMS.map(i => String(i.tokenId));
  let topOffers: Record<string, TopOffer | null> = {};
  try {
    topOffers = await fetchTopOffersByToken(tokenIds);
  } catch {
    // OpenSea fetch failed — render page without offers
  }
  return <AuctionView topOffers={topOffers} />;
}
