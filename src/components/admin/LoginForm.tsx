"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginType = "admin" | "provider";

export default function LoginForm({ logo }: { logo?: string }) {
  const router = useRouter();

  const [tab, setTab] = useState<LoginType>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function changeTab(type: LoginType) {
    setTab(type);
    setEmail("");
    setPassword("");
    setError("");
    setShowPassword(false);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Ingresa tu correo electrónico y contraseña.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint =
        tab === "admin"
          ? "/api/auth/login"
          : "/api/auth/login/provider";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          data.error ||
            "El correo electrónico o la contraseña son incorrectos."
        );
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Error de login:", err);
      setError(
        "No fue posible conectar con el servidor. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-white">
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 lg:grid-cols-2 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/20">

            {/* =========================================================
                FORMULARIO
            ========================================================= */}
            <section className="flex items-center">
              <div className="w-full px-6 py-10 sm:px-10 md:px-12 lg:px-14 lg:py-14">

                {/* LOGO */}
                <div className="mb-10">
                  <div className="inline-flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20 overflow-hidden">
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                      ) : (
                        "C"
                      )}
                    </div>

                    <div>
                      <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                        Panel CMS
                      </p>

                      <p className="text-xs text-slate-500 dark:text-neutral-400">
                        Gestión de contenido
                      </p>
                    </div>
                  </div>
                </div>

                {/* TITULO */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                    Bienvenido
                  </h1>

                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base dark:text-neutral-400">
                    Ingresa a tu cuenta para administrar el contenido,
                    productos y configuración de tu sitio.
                  </p>
                </div>

                {/* SELECTOR ADMIN / PROVIDER */}
                <div className="mb-7 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-neutral-800">
                  <button
                    type="button"
                    onClick={() => changeTab("admin")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                      tab === "admin"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
                    }`}
                  >
                    <AdminIcon />

                    Administrador
                  </button>

                  <button
                    type="button"
                    onClick={() => changeTab("provider")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                      tab === "provider"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
                    }`}
                  >
                    <ProviderIcon />

                    Proveedor
                  </button>
                </div>

                {/* INFORMACION DEL TIPO DE LOGIN */}
                <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 dark:border-blue-900/50 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                      {tab === "admin" ? (
                        <AdminIcon />
                      ) : (
                        <ProviderIcon />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tab === "admin"
                          ? "Acceso de administrador"
                          : "Acceso de proveedor"}
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-neutral-400">
                        {tab === "admin"
                          ? "Accede al panel principal y administra todo el contenido."
                          : "Accede al contenido y productos asociados a tu cuenta."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* FORM */}
                <form onSubmit={submit} className="space-y-5">

                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-neutral-200"
                    >
                      Correo electrónico
                    </label>

                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <EmailIcon />
                      </div>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          tab === "admin"
                            ? "admin@empresa.com"
                            : "proveedor@empresa.com"
                        }
                        autoComplete="email"
                        disabled={loading}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-neutral-200"
                    >
                      Contraseña
                    </label>

                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <LockIcon />
                      </div>

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={loading}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-500"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 transition hover:text-slate-700 focus:outline-none dark:hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOffIcon />
                        ) : (
                          <EyeIcon />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ERROR */}
                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                    >
                      <div className="mt-0.5 shrink-0">
                        <ErrorIcon />
                      </div>

                      <p>{error}</p>
                    </div>
                  )}

                  {/* BOTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <LoadingIcon />
                        Verificando...
                      </>
                    ) : (
                      <>
                        {tab === "admin"
                          ? "Entrar como administrador"
                          : "Entrar como proveedor"}

                        <ArrowIcon />
                      </>
                    )}
                  </button>
                </form>

                {/* FOOTER LOGIN */}
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-neutral-500">
                  <ShieldIcon />

                  <span>
                    Acceso protegido y restringido a usuarios autorizados
                  </span>
                </div>
              </div>
            </section>

            {/* =========================================================
                PANEL DERECHO
            ========================================================= */}
            <section className="relative hidden min-h-[680px] overflow-hidden bg-slate-950 lg:flex">
              {/* DECORACIONES */}
              <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />

              <div className="relative z-10 flex w-full flex-col justify-between p-12">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Sistema operativo
                  </div>

                  <h2 className="mt-8 max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
                    Gestiona tu sitio desde un solo lugar.
                  </h2>

                  <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
                    Administra contenido, productos, páginas y proveedores
                    desde una plataforma centralizada.
                  </p>
                </div>

                {/* MOCK DASHBOARD */}
                <div className="relative">
                  <div className="absolute -inset-8 rounded-full bg-blue-600/10 blur-3xl" />

                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-xl">
                    {/* MINI HEADER */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                          C
                        </div>

                        <div>
                          <div className="h-2.5 w-24 rounded-full bg-white/70" />
                          <div className="mt-2 h-2 w-16 rounded-full bg-white/20" />
                        </div>
                      </div>

                      <div className="h-8 w-8 rounded-full bg-white/10" />
                    </div>

                    {/* CARDS */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <DashboardStat
                        title="Productos"
                        value="128"
                      />

                      <DashboardStat
                        title="Páginas"
                        value="12"
                      />

                      <DashboardStat
                        title="Proveedores"
                        value="6"
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="mt-4 grid grid-cols-[1fr_120px] gap-3">
                      <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <div className="mb-5 flex items-center justify-between">
                          <div className="h-2.5 w-24 rounded-full bg-white/40" />
                          <div className="h-6 w-16 rounded-md bg-blue-600/80" />
                        </div>

                        <div className="space-y-3">
                          <DashboardRow />
                          <DashboardRow />
                          <DashboardRow />
                          <DashboardRow />
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[10px] border-blue-500/30">
                          <span className="text-sm font-bold text-white">
                            84%
                          </span>
                        </div>

                        <div className="mx-auto mt-4 h-2 w-16 rounded-full bg-white/20" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-white/10 pt-6 text-xs text-slate-500">
                  <ShieldIcon />

                  <span>
                    CMS · Administración segura
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ================================================================
   COMPONENTES VISUALES
================================================================ */

function DashboardStat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
      <p className="text-[10px] text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function DashboardRow() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 shrink-0 rounded-lg bg-white/10" />

      <div className="min-w-0 flex-1">
        <div className="h-2 w-3/4 rounded-full bg-white/30" />
        <div className="mt-2 h-1.5 w-1/2 rounded-full bg-white/10" />
      </div>

      <div className="h-5 w-10 rounded-md bg-emerald-500/15" />
    </div>
  );
}

/* ================================================================
   ICONOS
================================================================ */

function AdminIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
      <path d="M9.5 12l1.7 1.7L15 10" />
    </svg>
  );
}

function ProviderIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V8l7-4 7 4v13" />
      <path d="M9 21v-5h6v5" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.2" />
      <path d="M6.6 6.6C3.8 8.4 2 12 2 12s3.5 8 10 8a9.8 9.8 0 0 0 4.1-.9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="transition-transform group-hover:translate-x-0.5"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />

      <path
        className="opacity-90"
        fill="currentColor"
        d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3z"
      />
    </svg>
  );
}