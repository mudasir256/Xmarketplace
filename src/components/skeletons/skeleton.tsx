import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-[#e8eef5] ${className}`}
    />
  );
}

export function HeaderSkeleton({ store = false }: { store?: boolean }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-[68px] w-[min(1180px,calc(100%_-_32px))] items-center justify-between gap-4 max-[760px]:w-[min(100%_-_24px,1180px)]">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-[120px]" />
          {!store ? <Skeleton className="hidden h-9 w-[160px] sm:block" /> : null}
        </div>
        <Skeleton className="hidden h-10 max-w-[420px] flex-1 md:block" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="hidden h-10 w-[96px] sm:block" />
        </div>
      </div>
    </header>
  );
}

export function CatalogCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-[14px] border border-line bg-white">
      <Skeleton className="h-[190px] rounded-none max-[760px]:h-[145px]" />
      <div className="space-y-2.5 p-[15px] max-[760px]:p-3">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-[88%]" />
        <Skeleton className="h-4 w-[62%]" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-2 h-3 w-36" />
      </div>
    </article>
  );
}

export function CatalogGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-[18px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-2.5">
      {Array.from({ length: count }, (_, index) => (
        <CatalogCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PageShellSkeleton({
  children,
  store = false,
  surface = true,
}: {
  children: ReactNode;
  store?: boolean;
  surface?: boolean;
}) {
  return (
    <>
      <HeaderSkeleton store={store} />
      <main className={surface ? "min-h-[70vh] bg-surface" : "min-h-[70vh]"}>{children}</main>
    </>
  );
}

export function MarketplaceHomeSkeleton() {
  return (
    <PageShellSkeleton surface={false}>
      <section className="bg-[linear-gradient(135deg,#003049,#004f68)]">
        <div className="mx-auto flex min-h-[420px] w-[min(1180px,calc(100%_-_32px))] items-center max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="w-full max-w-[640px] space-y-4 py-16">
            <Skeleton className="h-12 w-[85%] bg-[#ffffff22]" />
            <Skeleton className="h-12 w-[70%] bg-[#ffffff22]" />
            <Skeleton className="h-4 w-[90%] bg-[#ffffff22]" />
            <Skeleton className="h-4 w-[60%] bg-[#ffffff22]" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-12 w-40 bg-[#ffffff28]" />
              <Skeleton className="h-12 w-40 bg-[#ffffff28]" />
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-5 mx-auto mt-[-48px] mb-6 w-[min(1400px,calc(100%_-_32px))]">
        <div className="grid grid-cols-[repeat(10,minmax(80px,1fr))] gap-2 overflow-hidden rounded-[15px] border border-white bg-white px-5 py-5 shadow-[0_14px_35px_#04182f1c] max-[760px]:grid-cols-[repeat(10,82px)]">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="grid justify-items-center gap-2">
              <Skeleton className="size-[72px] rounded-[13px] max-[760px]:size-[55px]" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>

      <section className="bg-[#fbfcfd] px-10 pb-11 max-[760px]:px-2">
        <div className="mx-auto w-full max-w-[1380px] space-y-10 py-8">
          <div>
            <Skeleton className="mb-4 h-7 w-48" />
            <div className="grid grid-cols-4 gap-3.5 max-[760px]:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-[50px] rounded-xl" />
              ))}
            </div>
          </div>
          {Array.from({ length: 2 }, (_, section) => (
            <div key={section}>
              <div className="mb-5 flex items-end justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <CatalogGridSkeleton count={4} />
            </div>
          ))}
        </div>
      </section>
    </PageShellSkeleton>
  );
}

export function CategoryPageSkeleton() {
  return (
    <PageShellSkeleton>
      <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] py-[42px] max-[760px]:w-[min(100%_-_24px,1180px)]">
        <Skeleton className="mb-4 h-3 w-40" />
        <Skeleton className="mb-2 h-8 w-56" />
        <Skeleton className="mb-6 h-4 w-72" />
        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <CatalogGridSkeleton count={8} />
      </div>
    </PageShellSkeleton>
  );
}

export function SearchPageSkeleton() {
  return (
    <PageShellSkeleton>
      <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] py-[42px] max-[760px]:w-[min(100%_-_24px,1180px)]">
        <Skeleton className="mb-4 h-3 w-32" />
        <Skeleton className="mb-2 h-8 w-52" />
        <Skeleton className="mb-4 h-4 w-80 max-w-full" />
        <Skeleton className="mb-8 h-12 w-full max-w-[640px] rounded-xl" />
        <CatalogGridSkeleton count={8} />
      </div>
    </PageShellSkeleton>
  );
}

export function ProductPageSkeleton() {
  return (
    <PageShellSkeleton>
      <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] py-5 max-[760px]:w-[min(100%_-_24px,1180px)]">
        <Skeleton className="mb-5 h-3 w-64" />
        <div className="grid grid-cols-[1.35fr_0.75fr] items-start gap-5 max-[960px]:grid-cols-1">
          <div className="space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="rounded-2xl border border-line bg-white p-5 space-y-3">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-7 w-[80%]" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
      </div>
    </PageShellSkeleton>
  );
}

export function StoreHomeSkeleton() {
  return (
    <PageShellSkeleton store surface={false}>
      <section className="bg-[#fff5f0]">
        <div className="mx-auto grid min-h-[320px] w-[min(1180px,calc(100%_-_32px))] grid-cols-2 items-center gap-8 max-[760px]:w-[min(100%_-_24px,1180px)] max-[760px]:grid-cols-1">
          <div className="space-y-4 py-12">
            <Skeleton className="h-7 w-56 rounded-full" />
            <Skeleton className="h-12 w-[90%]" />
            <Skeleton className="h-12 w-[70%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-12 w-40" />
          </div>
          <Skeleton className="hidden h-[260px] rounded-2xl md:block" />
        </div>
      </section>
      <section className="bg-surface px-4 py-10">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] space-y-8">
          <div className="grid grid-cols-4 gap-4 max-[760px]:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
          <CatalogGridSkeleton count={8} />
        </div>
      </section>
    </PageShellSkeleton>
  );
}

export function AccountPageSkeleton() {
  return (
    <PageShellSkeleton>
      <div className="mx-auto grid w-[calc(100%-32px)] max-w-[1180px] grid-cols-[240px_1fr] gap-[22px] py-[42px] max-[760px]:w-[calc(100%-24px)] max-[760px]:grid-cols-1">
        <aside className="rounded-2xl border border-line bg-white p-3 space-y-2">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </aside>
        <section className="rounded-2xl border border-line bg-white p-7 space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
          <div className="grid grid-cols-4 gap-3.5 max-[760px]:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
        </section>
      </div>
    </PageShellSkeleton>
  );
}

export function MessagesPageSkeleton() {
  return (
    <PageShellSkeleton>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col px-3 py-3 sm:px-4 sm:py-4">
        <div className="grid min-h-[70vh] grid-cols-[300px_1fr] overflow-hidden rounded-2xl border border-line bg-white max-[760px]:grid-cols-1">
          <div className="space-y-3 border-r border-line p-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-[70%]" />
                  <Skeleton className="h-3 w-[45%]" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col p-4">
            <Skeleton className="mb-4 h-14 w-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="ml-auto h-12 w-[55%] rounded-2xl" />
              <Skeleton className="h-12 w-[48%] rounded-2xl" />
              <Skeleton className="ml-auto h-16 w-[62%] rounded-2xl" />
            </div>
            <Skeleton className="mt-4 h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </PageShellSkeleton>
  );
}

export function AuthPageSkeleton() {
  return (
    <main className="auth-shell grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-[440px] rounded-2xl border border-white/20 bg-white p-7 shadow-[0_20px_50px_#00182344]">
        <Skeleton className="mx-auto mb-6 h-10 w-40" />
        <Skeleton className="mb-2 h-7 w-48" />
        <Skeleton className="mb-6 h-4 w-64 max-w-full" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="mt-2 h-12 w-full" />
        </div>
      </div>
    </main>
  );
}

export function FormPageSkeleton({ titleWidth = "w-48" }: { titleWidth?: string }) {
  return (
    <PageShellSkeleton>
      <div className="mx-auto w-[min(760px,calc(100%_-_32px))] py-[42px] max-[760px]:w-[min(100%_-_24px,760px)]">
        <Skeleton className={`mb-2 h-8 ${titleWidth}`} />
        <Skeleton className="mb-6 h-4 w-72 max-w-full" />
        <div className="space-y-4 rounded-2xl border border-line bg-white p-6">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
          <Skeleton className="mt-2 h-12 w-40" />
        </div>
      </div>
    </PageShellSkeleton>
  );
}

export function InfoPageSkeleton() {
  return (
    <PageShellSkeleton>
      <div className="mx-auto w-[min(800px,calc(100%_-_32px))] py-[48px] max-[760px]:w-[min(100%_-_24px,800px)]">
        <Skeleton className="mb-4 h-9 w-56" />
        <div className="space-y-3">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </PageShellSkeleton>
  );
}

export function CartCheckoutSkeleton() {
  return (
    <PageShellSkeleton store>
      <div className="mx-auto grid w-[min(1180px,calc(100%_-_32px))] grid-cols-[1.2fr_0.8fr] gap-5 py-[42px] max-[960px]:grid-cols-1 max-[760px]:w-[min(100%_-_24px,1180px)]">
        <div className="space-y-3 rounded-2xl border border-line bg-white p-5">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex gap-3 border-b border-line pb-3 last:border-0">
              <Skeleton className="size-20 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-2xl border border-line bg-white p-5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </PageShellSkeleton>
  );
}
