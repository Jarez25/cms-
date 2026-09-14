import Link from "next/link";
import { getProductsPaginated } from "@/lib/data";
import type { ComponentData, ProductData } from "@/lib/data";
import ProductCarousel from "./ProductCarousel";
import ComponentForm from "./ComponentForm";

interface Props {
  components: ComponentData[];
  currency: string;
  productBase: string;
  storeHref: string;
  providerId: number | null;
}

export default async function ComponentBlocks({
  components,
  currency,
  productBase,
  storeHref,
  providerId,
}: Props) {
  if (!components.length) return null;

  const rendered = await Promise.all(
    components.map(async (c) => {
      let products: ProductData[] = [];
      if (c.type === "products") {
        const category = String(c.props.category ?? "");
        const limit = Math.min(Math.max(Number(c.props.limit ?? 10) || 10, 1), 24);
        const res = await getProductsPaginated(providerId, { limit, category });
        products = res.items;
      }
      return { c, products };
    })
  );

  return (
    <>
      {rendered.map(({ c, products }) => {
        const p = c.props as Record<string, unknown>;
        switch (c.type) {
          case "html":
            return (
              <section key={c.id} className="py-10">
                <div
                  className="max-w-6xl mx-auto px-4"
                  dangerouslySetInnerHTML={{ __html: String(p.html ?? "") }}
                />
              </section>
            );
          case "cta":
            return (
              <section key={c.id} className="py-14 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary to-primary px-8 py-12 md:px-14 md:py-16">
                    <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div>
                        {p.title ? (
                          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            {String(p.title)}
                          </h2>
                        ) : null}
                        {p.subtitle ? (
                          <p className="text-primary-soft mt-2 max-w-xl">{String(p.subtitle)}</p>
                        ) : null}
                      </div>
                      {p.button_text ? (
                        <Link
                          href={String(p.button_link || "#")}
                          className="shrink-0 inline-flex items-center gap-2 bg-white text-gray-900 font-semibold rounded-full px-7 py-3.5 hover:bg-primary-soft transition-colors"
                        >
                          {String(p.button_text)}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>
            );
          case "form":
            return <ComponentForm key={c.id} componentId={c.id} config={c.props} />;
          case "products":
            return products.length ? (
              <ProductCarousel
                key={c.id}
                title={String(p.title ?? "Productos")}
                products={products}
                currency={currency}
                productBase={productBase}
                seeAllHref={storeHref}
              />
            ) : null;
          default:
            return null;
        }
      })}
    </>
  );
}
