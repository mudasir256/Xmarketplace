import { NextResponse } from "next/server";
import { getMarketplaceListings } from "@/lib/listings";
import { findNearbyListings } from "@/lib/nearby-listings";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = Number(searchParams.get("lat"));
    const longitude = Number(searchParams.get("lng"));
    const radiusKm = Number(searchParams.get("radiusKm") ?? searchParams.get("radius") ?? 10);
    const page = Number(searchParams.get("page") ?? 1);
    const categorySlug = searchParams.get("category") || searchParams.get("categorySlug") || undefined;
    const area = searchParams.get("area") || undefined;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(radiusKm) ||
      radiusKm <= 0 ||
      radiusKm > 100
    ) {
      return NextResponse.json({ message: "Invalid location parameters" }, { status: 400 });
    }

    const nearby = await findNearbyListings({
      latitude,
      longitude,
      radiusKm,
      categorySlug,
      page,
      pageSize: 48,
    });

    let listings = nearby.listings;
    let total = nearby.total;
    let fallback = false;
    let source: "rpc" | "fallback" | "all" = nearby.source;

    if (listings.length === 0) {
      const all = await getMarketplaceListings({
        categorySlug,
        limit: 48,
      });

      listings = all.map((item) => ({
        ...item,
        distanceKm: Number.NaN,
        area: item.location ?? null,
      }));
      total = all.length;
      fallback = true;
      source = "all";
    }

    return NextResponse.json({
      location: {
        area: area || null,
        latitude,
        longitude,
        radiusKm,
      },
      total,
      page,
      fallback,
      listings: listings.map((item) => ({
        id: item.listingId,
        slug: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        location: item.location,
        distanceKm:
          typeof item.distanceKm === "number" && Number.isFinite(item.distanceKm)
            ? item.distanceKm
            : undefined,
        condition: item.condition,
        createdAt: item.createdAt,
        badge: item.badge,
        listingId: item.listingId,
      })),
      source,
    });
  } catch (error) {
    console.error("Listings API failed", error);
    return NextResponse.json(
      { message: "Could not load listings", listings: [], total: 0 },
      { status: 500 },
    );
  }
}
