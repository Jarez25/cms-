"use client";

import { useEffect, useState } from "react";

export type FeedbackType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  message: string;
  type: FeedbackType;
}

interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmItem extends ConfirmOptions {
  message: string;
  resolve: (value: boolean) => void;
}

const toastSubs = new Set<(t: ToastItem) => void>();
const confirmSubs = new Set<(c: ConfirmItem | null) => void>();

let counter = 0;

export function notify(message: string, type: FeedbackType = "info") {
  toastSubs.forEach((fn) => fn({ id: ++counter, message, type }));
}

export function confirmAction(
  message: string,
  options: ConfirmOptions = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    confirmSubs.forEach((fn) => fn({ message, ...options, resolve }));
  });
}

const toastStyles: Record<FeedbackType, string> = {
  success: "bg-emerald-600",
  error: "bg-rose-600",
  info: "bg-gray-900",
  warning: "bg-amber-500",
};

const toastIcons: Record<FeedbackType, string> = {
  success: "✓",
  error: "✕",
  info: "i",
  warning: "!",
};

export default function FeedbackHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirm, setConfirm] = useState<ConfirmItem | null>(null);

  useEffect(() => {
    const onToast = (t: ToastItem) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3200);
    };
    const onConfirm = (c: ConfirmItem | null) => setConfirm(c);
    toastSubs.add(onToast);
    confirmSubs.add(onConfirm);
    return () => {
      toastSubs.delete(onToast);
      confirmSubs.delete(onConfirm);
    };
  }, []);

  function answer(value: boolean) {
    if (confirm) {
      confirm.resolve(value);
      setConfirm(null);
    }
  }

  return (
    <>
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-xs flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-enter pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${toastStyles[t.type]}`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {toastIcons[t.type]}
            </span>
            {t.message}
          </div>
        ))}
      </div>

      {confirm && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
          onClick={() => answer(false)}
        >
          <div
            className="modal-enter w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900">
              {confirm.title || "Confirmar acción"}
            </h3>
            <p className="mt-2 text-sm text-gray-600">{confirm.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => answer(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                {confirm.cancelText || "Cancelar"}
              </button>
              <button
                onClick={() => answer(true)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md transition ${
                  confirm.danger === false
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                {confirm.confirmText || "Aceptar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
