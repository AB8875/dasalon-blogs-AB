export async function apiFetch<T = any>(path: string, opts: RequestInit = {}) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const url = `${base.replace(/\/$/, "")}${
    path.startsWith("/") ? path : "/" + path
  }`;

  const init: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  };

  const res = await fetch(url, init);

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
