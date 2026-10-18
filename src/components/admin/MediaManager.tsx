"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

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
    if (ok) notify(`${ok} imagen(es) subida(s) correctamente`, "success");
    load();
  }

  async function copyUrl(url: string) {
    const full = `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(full);
      notify("URL copiada al portapapeles", "success");
    } catch {
      notify("No se pudo copiar", "error");
    }
  }

  async function remove(item: MediaItem) {
    if (!(await confirmAction(`¿Eliminar definitivamente ${item.name}?`, { confirmText: "Eliminar" }))) return;
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

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, search]);

  const totalSize = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.size || 0), 0);
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Cabecera y Zona de Subida */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Biblioteca Multimedia</h2>
            <p className="text-sm text-gray-500 mt-1">
              Imágenes disponibles para banners, productos y páginas · {items.length} archivo(s) ({formatSize(totalSize)} en total)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition active:scale-95 shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{uploading ? "Subiendo..." : "Subir archivos"}</span>
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

        {/* Buscador de Archivos */}
        {items.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar imagen por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid de Archivos */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
          Cargando biblioteca multimedia...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm">Aún no hay imágenes. Sube la primera para comenzar.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500 text-sm">
          No se encontraron imágenes que coincidan con &quot;{search}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden group hover:shadow-md transition-all flex flex-col"
            >
              <div
                onClick={() => setPreviewItem(item)}
                className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer relative"
                title="Click para ver en grande"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white rounded-full p-2 text-xs transition-opacity shadow-sm">
                    🔍
                  </span>
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-800 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{formatSize(item.size)}</p>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyUrl(item.url)}
                    className="flex-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold py-1.5 hover:bg-blue-100 transition cursor-pointer"
                  >
                    Copiar URL
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    className="rounded-lg bg-gray-50 text-rose-600 text-xs font-bold px-3 py-1.5 hover:bg-rose-50 transition cursor-pointer"
                    title="Eliminar archivo"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Modal de Previsualización */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-800 truncate max-w-md">
                {previewItem.name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-950 flex items-center justify-center max-h-[70vh] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewItem.url}
                alt={previewItem.name}
                className="max-h-[65vh] max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="px-5 py-3 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
              <span>Tamaño: {formatSize(previewItem.size)}</span>
              <button
                type="button"
                onClick={() => {
                  copyUrl(previewItem.url);
                  setPreviewItem(null);
                }}
                className="bg-blue-600 text-white rounded-lg px-3 py-1.5 font-medium hover:bg-blue-700 transition"
              >
                Copiar URL y cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
