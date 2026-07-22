import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ChatWorkspace, type ChatProductContext } from "@/components/chat/chat-workspace";
import { getMarketplaceListingBySlug } from "@/lib/listings";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    listing?: string;
    title?: string;
    image?: string;
    seller?: string;
  }>;
}) {
  const params = await searchParams;
  let initialProduct: ChatProductContext | null = null;

  if (params.listing) {
    const listing = await getMarketplaceListingBySlug(params.listing);
    if (listing) {
      initialProduct = {
        productId: listing.id,
        productTitle: listing.title,
        productImage: listing.images[0] || listing.image,
        sellerName: listing.seller.name,
      };
    } else {
      initialProduct = {
        productId: params.listing,
        productTitle: params.title || "Marketplace listing",
        productImage: params.image || "/placeholder-listing.svg",
        sellerName: params.seller || "Seller",
      };
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface py-6">
        <div className="mx-auto w-[min(1180px,calc(100%_-_24px))]">
          <div className="mb-4">
            <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.6px] text-navy">Messages</h1>
            <p className="mt-1 mb-0 text-sm text-muted">Chat with buyers and sellers about marketplace ads.</p>
          </div>
          <ChatWorkspace initialProduct={initialProduct} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
