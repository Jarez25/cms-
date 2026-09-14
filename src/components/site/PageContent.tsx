import type { ComponentData } from "@/lib/data";
import ComponentBlocks from "./ComponentBlocks";

interface Props {
  content: string;
  components: ComponentData[];
  currency: string;
  productBase: string;
  storeHref: string;
  providerId: number | null;
}

export default function PageContent({
  content,
  components,
  currency,
  productBase,
  storeHref,
  providerId,
}: Props) {
  const byId = new Map(components.map((c) => [c.id, c]));
  const regex = /\[component[^\]]*id\s*=\s*["']?(\d+)["']?[^\]]*\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = regex.exec(content))) {
    const before = content.slice(lastIndex, m.index);
    if (before) {
      parts.push(
        <div key={key++} className="container-site max-w-3xl py-4">
          <div className="page-content" dangerouslySetInnerHTML={{ __html: before }} />
        </div>
      );
    }
    const comp = byId.get(Number(m[1]));
    if (comp) {
      parts.push(
        <ComponentBlocks
          key={key++}
          components={[comp]}
          currency={currency}
          productBase={productBase}
          storeHref={storeHref}
          providerId={providerId}
        />
      );
    }
    lastIndex = regex.lastIndex;
  }

  const tail = content.slice(lastIndex);
  if (tail) {
    parts.push(
      <div key={key++} className="container-site max-w-3xl py-4">
        <div className="page-content" dangerouslySetInnerHTML={{ __html: tail }} />
      </div>
    );
  }

  if (!parts.length) {
    parts.push(
      <div key={key++} className="container-site max-w-3xl py-4">
        <div className="page-content" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  return <>{parts}</>;
}
