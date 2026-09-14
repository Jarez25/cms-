"use client";

import { useEffect, useState } from "react";

export default function PreviewPanel({ path = "/" }: { path?: string }) {
  const [open, setOpen] = useState(false);
  const [frameKey, setFrameKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    const handler = () => setFrameKey((k) => k + 1);
    window.addEventListener("cms:reload-preview", handler);
    return () => window.removeEventListener("cms:reload-preview", handler);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        {open ? "Cerrar vista previa" : "Ver vista previa"}
      </button>
      {open && (
        <div className="fixed inset-y-0 right-0 z-40 w-[58vw] min-w-[420px] bg-white border-l border-gray-200 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="font-medium text-gray-900">
              Vista previa <span className="text-gray-400 font-normal">· {path}</span>
            </span>
            <div className="flex items-center gap-2">
              <a
                href={path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-900 px-2"
              >
                Abrir en pestaña ↗
              </a>
              <button
                onClick={() => setFrameKey((k) => k + 1)}
                className="text-sm bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-700"
              >
                Recargar
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-900 px-2"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>
          <iframe
            key={frameKey}
            src={path}
            title="Vista previa del sitio"
            className="flex-1 w-full border-0"
          />
        </div>
      )}
    </>
  );
}
