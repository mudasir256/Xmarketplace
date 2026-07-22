import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PostAdForm } from "@/components/post-ad-form";
import { createClient } from "@/lib/supabase/server";

export default async function PostAdPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("marketplace_categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[820px] max-[760px]:w-[calc(100%-24px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">Marketplace / Post an Ad</div>
          <section className="rounded-2xl border border-line bg-white p-7">
            <h1 className="mb-1.5 mt-0 text-navy">Post your ad</h1>
            <p className="text-sm text-muted">
              Add clear details to reach the right buyers. Your listing goes live on the marketplace after you submit.
            </p>
            <PostAdForm categories={categories ?? []} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
