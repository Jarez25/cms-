"use client";

import { useEffect, useState } from "react";
import { notify, confirmAction } from "./feedback";

interface MediaItem {
  name: string;
  url: string;
  size: number;
  updated: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaManager() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const res = await fetch("/api/media");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/media")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    let ok = 0;
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) ok++;
      else {
        const data = await res.json().catch(() => ({}));
        notify(data.error || `Error al subir ${file.name}`, "error");
      }
    }
    setUploading(false);
    e.target.value = "";
    if (ok) notify(`${ok} imagen(es) subida(s)`, "success");
    load();
  }

  async function copyUrl(url: string) {
    const full = `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(full);
      notify("URL copiada", "success");
    } catch {
      notify("No se pudo copiar", "error");
    }
  }

  async function remove(item: MediaItem) {
    if (!(await confirmAction(`¿Eliminar ${item.name}?`, { confirmText: "Eliminar" }))) return;
    const res = await fetch("/api/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: item.name }),
    });
    if (res.ok) {
      notify("Imagen eliminada", "success");
      load();
    } else {
      notify("No se pudo eliminar", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Subir imágenes</h2>
            <p className="text-sm text-gray-500 mt-1">
              Formatos: JPG, PNG, WebP, GIF, SVG · hasta 5 MB por archivo.
            </p>
          </div>
          <label className="shrink-0 cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700">
            {uploading ? "Subiendo..." : "Subir imágenes"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
          <p className="text-gray-500">Aún no hay imágenes. Sube la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-700 truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{formatSize(item.size)}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="flex-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium py-1.5 hover:bg-blue-100"
                  >
                    Copiar URL
                  </button>
                  <button
                    onClick={() => remove(item)}
                    className="rounded-lg bg-gray-50 text-red-600 text-xs font-medium px-3 py-1.5 hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
