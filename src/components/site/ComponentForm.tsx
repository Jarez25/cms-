"use client";

import { useState } from "react";

interface Field {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}

interface Props {
  componentId: number;
  config: Record<string, unknown>;
}

export default function ComponentForm({ componentId, config }: Props) {
  const fields: Field[] = Array.isArray(config.fields) ? (config.fields as Field[]) : [];
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`/api/components/${componentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setStatus("done");
        setValues({});
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10">
          {(config.title || config.subtitle) ? (
            <div className="text-center mb-8">
              {config.title ? (
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {String(config.title)}
                </h2>
              ) : null}
              {config.subtitle ? (
                <p className="text-gray-500 mt-2">{String(config.subtitle)}</p>
              ) : null}
            </div>
          ) : null}

          {status === "done" ? (
            <p className="text-center text-green-600 font-medium py-6">
              {String(config.success_message ?? "¡Gracias! Hemos recibido tu mensaje.")}
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {f.label}
                    {f.required ? <span className="text-rose-500"> *</span> : null}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-light transition"
                      rows={4}
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      required={f.required}
                    />
                  ) : (
                    <input
                      type={f.type || "text"}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-light transition"
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      required={f.required}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-gray-900 text-white rounded-xl px-5 py-3 font-semibold hover:bg-primary transition-colors disabled:opacity-50"
              >
                {status === "sending" ? "Enviando..." : String(config.submit_label ?? "Enviar")}
              </button>
              {status === "error" && (
                <p className="text-sm text-rose-600 text-center">Error al enviar. Intenta de nuevo.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
