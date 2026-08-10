import { NextResponse } from "next/server";
import { getBrowseListings } from "@/lib/browse-listings";

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

    const browse = await getBrowseListings({
      latitude,
      longitude,
      radiusKm,
      categorySlug,
      area,
      page,
      pageSize: 48,
    });

    return NextResponse.json({
      location: {
        area: area || null,
        latitude,
        longitude,
        radiusKm,
      },
      total: browse.total,
      page,
      fallback: browse.showingAll,
      listings: browse.listings.map((item) => ({
        id: item.listingId,
        slug: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        location: item.location,
        distanceKm: item.distanceKm,
        condition: item.condition,
        createdAt: item.createdAt,
        badge: item.badge,
        listingId: item.listingId,
      })),
      source: browse.showingAll ? "all" : "nearby",
    });
  } catch (error) {
    console.error("Listings API failed", error);
    return NextResponse.json(
      { message: "Could not load listings", listings: [], total: 0 },
      { status: 500 },
    );
  }
}
