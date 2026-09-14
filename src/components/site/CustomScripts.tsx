"use client";

import { useEffect } from "react";

interface Props {
  cdnJs: string[];
  jsHead: string;
  jsBody: string;
}

export default function CustomScripts({ cdnJs, jsHead, jsBody }: Props) {
  useEffect(() => {
    let cancelled = false;
    const nodes: HTMLScriptElement[] = [];

    const injectInline = (code: string, target: HTMLElement) => {
      const s = document.createElement("script");
      s.textContent = code;
      target.appendChild(s);
      nodes.push(s);
    };

    const loadScript = (src: string) =>
      new Promise<void>((resolve) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = false;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.body.appendChild(s);
        nodes.push(s);
      });

    (async () => {
      if (jsHead) injectInline(jsHead, document.head);
      for (const src of cdnJs) {
        await loadScript(src);
      }
      if (cancelled) return;
      if (jsBody) injectInline(jsBody, document.body);
    })();

    return () => {
      cancelled = true;
      nodes.forEach((n) => n.remove());
    };
  }, [cdnJs, jsHead, jsBody]);

  return null;
}
