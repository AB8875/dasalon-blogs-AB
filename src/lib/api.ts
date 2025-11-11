// src/lib/api.ts
export async function apiFetch<T = any>(path: string, opts: RequestInit = {}) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const url = `${base.replace(/\/$/, "")}${
    path.startsWith("/") ? path : "/" + path
  }`;

  // read token at call-time (prevents race / SSR issues)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers ? (opts.headers as Record<string, string>) : {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    // optional: console debug
    // console.log("apiFetch: adding Authorization header");
  }

  const init: RequestInit = {
    headers,
    ...opts,
  };

  const res = await fetch(url, init);

  // handle unauthorized specially so UI can react (e.g. logout)
  if (res.status === 401) {
    // remove stale token so subsequent calls won't keep failing
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("token");
      } catch (e) {
        // ignore
      }
    }
    const text = await res.text().catch(() => "");
    const errMsg = text || "Unauthorized";
    // keep the original response text in the thrown error
    throw new Error(JSON.stringify({ message: errMsg, status: 401 }));
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = text || res.statusText || `HTTP ${res.status}`;
    throw new Error(err);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as any;
}
