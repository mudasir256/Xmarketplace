import { z } from "zod";
import { requireApiUser, ensureProfile, jsonOk, jsonError } from "@/lib/account/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { SHIPPING_FEE_PKR } from "@/lib/store/types";

const itemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

const bodySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(20),
  province: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  streetAddress: z.string().trim().min(5).max(240),
  area: z.string().trim().max(120).optional(),
  paymentMethod: z.literal("COD"),
  items: z.array(itemSchema).min(1).max(50),
  customerNotes: z.string().trim().max(500).optional(),
});

function orderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomUUID().slice(0, 4).toUpperCase();
  return `XM-${stamp}-${rand}`;
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid checkout payload");
    }

    const admin = createAdminClient() as any;
    const lines: Array<{
      product_id: string;
      variant_id: string;
      product_name: string;
      variant_name: string;
      sku: string;
      image_path: string | null;
      quantity: number;
      unit_price: number;
      discount_amount: number;
      line_total: number;
    }> = [];

    for (const item of parsed.data.items) {
      const { data: product, error } = await admin
        .from("store_products")
        .select(
          "id, name, slug, base_price, product_status, store_product_images(storage_path, is_primary), store_product_variants(id, title, sku, price, is_active)",
        )
        .eq("id", item.productId)
        .maybeSingle();

      if (error) return jsonError(error.message, 500);
      if (!product || product.product_status !== "ACTIVE") {
        return jsonError("One or more products are unavailable");
      }

      const variants = Array.isArray(product.store_product_variants)
        ? product.store_product_variants
        : [];
      const variant = variants.find(
        (v: { id: string; is_active: boolean }) =>
          v.id === item.variantId && v.is_active,
      );
      if (!variant) return jsonError("Product variant is unavailable");

      const images = Array.isArray(product.store_product_images)
        ? product.store_product_images
        : [];
      const image =
        images.find((img: { is_primary: boolean }) => img.is_primary)?.storage_path ||
        images[0]?.storage_path ||
        null;

      const unitPrice = Number(variant.price ?? product.base_price ?? 0);
      lines.push({
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        variant_name: variant.title || "Default",
        sku: variant.sku,
        image_path: image,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount_amount: 0,
        line_total: unitPrice * item.quantity,
      });
    }

    const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
    const shipping = lines.length ? SHIPPING_FEE_PKR : 0;
    const grandTotal = subtotal + shipping;
    const now = new Date().toISOString();
    const number = orderNumber();

    const addressSnapshot = {
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      province: parsed.data.province,
      city: parsed.data.city,
      area: parsed.data.area || null,
      street_address: parsed.data.streetAddress,
      payment_method: parsed.data.paymentMethod,
    };

    const { data: order, error: orderError } = await admin
      .from("store_orders")
      .insert({
        order_number: number,
        user_id: auth.user.id,
        status: "PENDING",
        payment_status: "UNPAID",
        fulfillment_status: "UNFULFILLED",
        currency: "PKR",
        subtotal,
        discount_total: 0,
        shipping_total: shipping,
        tax_total: 0,
        grand_total: grandTotal,
        shipping_address_snapshot: addressSnapshot,
        billing_address_snapshot: addressSnapshot,
        customer_notes: parsed.data.customerNotes || null,
        admin_notes: "Payment: Cash on delivery",
        placed_at: now,
        created_at: now,
        updated_at: now,
      })
      .select("id, order_number, grand_total, status, payment_status, placed_at")
      .single();

    if (orderError) return jsonError(orderError.message, 500);

    const { error: itemsError } = await admin.from("store_order_items").insert(
      lines.map((line) => ({ ...line, order_id: order.id })),
    );
    if (itemsError) {
      await admin.from("store_orders").delete().eq("id", order.id);
      return jsonError(itemsError.message, 500);
    }

    return jsonOk({ order }, 201);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Checkout failed", 500);
  }
}
