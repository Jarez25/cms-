"use client";

import { useEffect, useState } from "react";

interface TestResult {
  total: number;
  sampleKeys: string[];
}

interface Result {
  type: "ok" | "error";
  message: string;
}

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900";

export default function EndpointManager() {
  const [url, setUrl] = useState("");
  const [section, setSection] = useState<"products" | "banners">("products");
  const [lastSync, setLastSync] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [onlyWithStock, setOnlyWithStock] = useState(true);
  const [deactivateMissing, setDeactivateMissing] = useState(false);
  const [test, setTest] = useState<TestResult | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/endpoint")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setUrl(data.endpoint_url);
        setSection(data.endpoint_section === "banners" ? "banners" : "products");
        setLastSync(data.endpoint_last_sync);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function call(action: "test" | "import" | "sync") {
    setBusy(true);
    setResult(null);
    setTest(null);
    try {
      const res = await fetch("/api/endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          url,
          section,
          onlyWithStock,
          deactivateMissing,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ type: "error", message: data.error || "Error" });
        return;
      }
      if (action === "test") {
        setTest(data);
      } else if (action === "sync") {
        const parts: string[] = [];
        if (data.updated != null) parts.push(`${data.updated} actualizado(s)`);
        if (data.added != null) parts.push(`${data.added} nuevo(s)`);
        if (data.skipped != null && data.skipped > 0) parts.push(`${data.skipped} omitido(s) sin stock`);
        if (data.removed != null && data.removed > 0) parts.push(`${data.removed} desactivado(s)`);
        const cats = data.categories != null ? ` · ${data.categories} categoría(s)` : "";
        setResult({
          type: "ok",
          message: `Sincronizado: ${parts.join(", ") || "sin cambios"}${cats}`,
        });
        setLastSync(new Date().toLocaleString());
        window.dispatchEvent(new Event("cms:reload-preview"));
      } else {
        const skipped = data.skipped != null ? ` (${data.skipped} sin stock omitidos)` : "";
        const cats = data.categories != null ? ` · ${data.categories} categoría(s) sincronizada(s)` : "";
        setResult({
          type: "ok",
          message: `Importados ${data.imported} registro(s) en "${section === "banners" ? "banners" : "tienda"}"${skipped}${cats}`,
        });
        setLastSync(new Date().toLocaleString());
        window.dispatchEvent(new Event("cms:reload-preview"));
      }
    } catch {
      setResult({ type: "error", message: "Error de conexión" });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Cargar datos desde un endpoint</h2>
        <p className="text-sm text-gray-500">
          Pega la URL de una API que devuelva JSON (array de objetos o {"{ data: [...] }"}).
          Puedes probar la conexión y luego importar los registros a la base de datos.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL del endpoint</label>
          <input
            className={inputCls}
            placeholder="https://api.ejemplo.com/productos"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Importar hacia
          </label>
          <select
            className={inputCls}
            value={section}
            onChange={(e) => setSection(e.target.value as "products" | "banners")}
          >
            <option value="products">Tienda (productos)</option>
            <option value="banners">Banners</option>
          </select>
        </div>
        {section === "products" && (
          <div className="space-y-2.5 bg-gray-50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyWithStock}
                onChange={(e) => setOnlyWithStock(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm text-gray-700">
                Solo agregar productos con stock (nuevos)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deactivateMissing}
                onChange={(e) => setDeactivateMissing(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm text-gray-700">
                Desactivar productos que ya no estén en el endpoint (sincronización)
              </span>
            </label>
          </div>
        )}
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => call("test")}
            disabled={busy || !url}
            className="bg-white border border-gray-300 text-gray-800 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {busy ? "Trabajando..." : "Probar conexión"}
          </button>
          {section === "products" && (
            <button
              onClick={() => call("sync")}
              disabled={busy || !url}
              className="bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              Sincronizar (actualizar)
            </button>
          )}
          <button
            onClick={() => call("import")}
            disabled={busy || !url}
            className="bg-gray-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {section === "banners" ? "Importar banners" : "Importar (reemplazar)"}
          </button>
        </div>
        {lastSync && (
          <p className="text-xs text-gray-400">Última importación: {lastSync}</p>
        )}
      </div>

      {test && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Resultado de la prueba</h3>
          <p className="text-sm text-gray-600">
            El endpoint responde con <span className="font-semibold">{test.total}</span>{" "}
            registro(s).
          </p>
          {test.sampleKeys.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Campos detectados:</p>
              <div className="flex flex-wrap gap-2">
                {test.sampleKeys.map((k) => (
                  <span
                    key={k}
                    className="bg-gray-100 text-gray-700 text-xs rounded-lg px-2.5 py-1 font-mono"
                  >
                    {k}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Campos reconocidos para productos: nombre, partNumber, sku, detalle,
                PrecioNacional, Total, subcategoria, marca, imageUrls, stock. También acepta
                el formato simple (name, price, image, category, stock).
              </p>
            </div>
          )}
        </div>
      )}

      {result && (
        <div
          className={`rounded-xl px-5 py-4 text-sm font-medium ${
            result.type === "ok"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
