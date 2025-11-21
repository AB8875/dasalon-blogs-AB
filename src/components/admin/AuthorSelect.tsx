"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type UserItem = { _id: string; name: string; email?: string };

interface AuthorSelectProps {
  value?: UserItem | null;
  onChange: (user: UserItem | null) => void;
  apiUrl: string;
  placeholder?: string;
  // optional: parent can provide a create function (name -> UserItem)
  createAuthorByName?: (name: string) => Promise<UserItem | null>;
}

/**
 * AuthorSelect
 * - Single field typeahead
 * - Server-backed suggestions
 * - "Create 'X'" action when no exact match
 */
export default function AuthorSelect({
  value,
  onChange,
  apiUrl,
  placeholder = "Type author name (select or create)",
  createAuthorByName,
}: AuthorSelectProps) {
  const [query, setQuery] = useState<string>(value?.name || "");
  const [authors, setAuthors] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounce helper
  function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
    let t: any;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  // Load authors once on mount (used for local filtering)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      try {
        const res = await fetch(`${apiUrl}/api/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        if (!mounted) return;
        setAuthors(
          items.map((u: any) => ({
            _id: u._id || u.id,
            name: u.name,
            email: u.email,
          }))
        );
      } catch (err) {
        if (!mounted) return;
        console.error("Author list load failed", err);
        setAuthors([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  // Local filtered suggestions
  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return authors;
    return authors.filter(
      (a) =>
        (a.name || "").toLowerCase().includes(q) ||
        (a.email || "").toLowerCase().includes(q)
    );
  }, [authors, query]);

  // Server search to refresh authors list (debounced)
  const doServerSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        if (!q.trim()) return;
        setLoading(true);
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        try {
          const res = await fetch(`${apiUrl}/api/users`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();
          const items = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
            ? data
            : [];
          const mapped: UserItem[] = items.map((u: any) => ({
            _id: u._id || u.id,
            name: u.name,
            email: u.email,
          }));
          // merge (dedupe)
          setAuthors((prev) => {
            const map = new Map(prev.map((p) => [p._id, p]));
            for (const m of mapped) map.set(m._id, m);
            return Array.from(map.values());
          });
        } catch (err) {
          console.error("author server search failed", err);
        } finally {
          setLoading(false);
        }
      }, 350),
    [apiUrl]
  );

  useEffect(() => {
    if (query.trim()) doServerSearch(query);
  }, [query, doServerSearch]);

  // reflect external changes to value
  useEffect(() => {
    setQuery(value?.name || "");
  }, [value]);

  // Create author helper (uses parent fn if provided)
  async function createNewAuthor(name: string): Promise<UserItem | null> {
    if (!name.trim()) return null;
    if (createAuthorByName) {
      try {
        const created = await createAuthorByName(name.trim());
        if (created) {
          // ensure list updated
          setAuthors((p) => [
            created,
            ...p.filter((x) => x._id !== created._id),
          ]);
          return created;
        }
        return null;
      } catch (err) {
        console.error("createAuthorByName failed", err);
        return null;
      }
    }

    // fallback: POST /api/users
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const safeName = name.trim().toLowerCase().replace(/\s+/g, ".");
      const genEmail = `${safeName}.${Date.now() % 10000}@local.internal`;
      const genPassword = Math.random().toString(36).slice(2, 10);
      const res = await fetch(`${apiUrl}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          email: genEmail,
          password: genPassword,
          role: "author",
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Create author failed (${res.status})`);
      }
      const created = await res.json();
      const u: UserItem = {
        _id: created._id || created.id,
        name: created.name,
        email: created.email,
      };
      setAuthors((p) => [u, ...p.filter((x) => x._id !== u._id)]);
      return u;
    } catch (err) {
      console.error("create author failed", err);
      alert("Failed to create author — check console.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  // UI: whether exact match exists
  const exactMatch = authors.find(
    (a) => a.name.trim().toLowerCase() === (query || "").trim().toLowerCase()
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        className="w-full p-2 border rounded"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(null); // unset selection on manual typing
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)} // allow clicks
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            // if there is an exact match, select it
            if (exactMatch) {
              onChange(exactMatch);
              setQuery(exactMatch.name);
              setOpen(false);
              return;
            }
            // otherwise create new
            const created = await createNewAuthor(query.trim());
            if (created) {
              onChange(created);
              setQuery(created.name);
              setOpen(false);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-50 max-h-56 overflow-auto">
          {loading ? (
            <div className="p-2 text-sm text-gray-500">Searching…</div>
          ) : filtered.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No matching authors</div>
          ) : (
            filtered.map((a: UserItem) => (
              <div
                key={a._id}
                className="p-2 cursor-pointer hover:bg-gray-100 flex items-start gap-3"
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  onChange(a);
                  setQuery(a.name);
                  setOpen(false);
                }}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{a.name}</div>
                  {a.email && (
                    <div className="text-xs text-gray-500">{a.email}</div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Create action — only show if query non-empty and exact match not present */}
          {!loading && query.trim() !== "" && !exactMatch && (
            <div
              className="p-2 cursor-pointer hover:bg-gray-100 border-t"
              onMouseDown={async (ev) => {
                ev.preventDefault();
                const created = await createNewAuthor(query.trim());
                if (created) {
                  onChange(created);
                  setQuery(created.name);
                  setOpen(false);
                }
              }}
            >
              <div className="text-sm font-medium">Create “{query.trim()}”</div>
              <div className="text-xs text-gray-500">Create new author</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
