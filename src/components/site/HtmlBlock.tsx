"use client";

import { useEffect, useRef } from "react";

export default function HtmlBlock({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // HTML sin <script> para el SSR (evita error de hidratación);
  // los scripts se inyectan y ejecutan en el cliente.
  const safeHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.innerHTML = html;

    const scripts = Array.from(el.querySelectorAll("script"));
    scripts.forEach((old) => {
      const s = document.createElement("script");
      Array.from(old.attributes).forEach((attr) => s.setAttribute(attr.name, attr.value));
      s.textContent = old.textContent;
      old.parentNode?.replaceChild(s, old);
    });
  }, [html]);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
