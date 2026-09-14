import { getCustomCode } from "@/lib/data";
import CustomScripts from "./CustomScripts";

export async function SiteHeadAssets({ providerId }: { providerId: number | null }) {
  const code = await getCustomCode(providerId);
  if (!code) return null;

  const cdnCss = code.cdn_items.filter((i) => i.type === "css");
  const cdnJs = code.cdn_items.filter((i) => i.type === "js").map((i) => i.url);
  const hasScripts = cdnJs.length > 0 || !!code.js_head || !!code.js_body;

  return (
    <>
      {cdnCss.map((item, i) => (
        <link key={i} rel="stylesheet" href={item.url} />
      ))}
      {code.css ? <style dangerouslySetInnerHTML={{ __html: code.css }} /> : null}
      {hasScripts ? (
        <CustomScripts cdnJs={cdnJs} jsHead={code.js_head} jsBody={code.js_body} />
      ) : null}
    </>
  );
}

export function SiteBodyScripts(_props: { providerId: number | null }) {
  void _props;
  return null;
}
