"use client";
import React, { useEffect, useRef, useState } from "react";

type UserItem = { _id: string; name: string; email?: string };

type AuthorSelectProps = {
  value?: UserItem | null; // currently selected author
  onChange?: (user: UserItem | null) => void;
  apiUrl?: string;
  placeholder?: string;
};

const DEFAULT_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * AuthorSelect
 * - Google-style typeahead
 * - Debounced search
 * - Keyboard nav (↑↓) + Enter to select / create
 * - Click outside to close
 */
export default function AuthorSelect({
  value = null,
  onChange,
  apiUrl = DEFAULT_API,
  placeholder = "Type author name (select or create)",
}: AuthorSelectProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // show selected name in input when prop value provided
  useEffect(() => {
    if (value) {
      setQuery(value.name);
    }
  }, [value]);

  // click outside closes dropdown
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlight(-1);
        // if there is a selected value show name
        if (value) setQuery(value.name);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [value]);

  // debounce helper
  function debounce<T extends (...a: any[]) => void>(fn: T, ms = 300) {
    let t: any;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  // fetch users
  const fetchUsers = async (q: string) => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${apiUrl}/api/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const list: any[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      const normalized = list
        .map((u) => ({ _id: u._id || u.id, name: u.name, email: u.email }))
        .filter(
          (u) =>
            !q ||
            (u.name || "").toLowerCase().includes(q.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(q.toLowerCase())
        )
        .slice(0, 30);
      setItems(normalized);
      setOpen(true);
    } catch (err) {
      console.error("Author search failed", err);
      setItems([]);
      setOpen(true); // allow create action even on failure
    } finally {
      setLoading(false);
    }
  };

  // debounced version
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = React.useCallback(debounce(fetchUsers, 220), [apiUrl]);

  // When user types
  useEffect(() => {
    if (!query) {
      // show full list if input cleared (or close)
      setItems([]);
      setOpen(false);
      setHighlight(-1);
      return;
    }
    debouncedFetch(query);
  }, [query, debouncedFetch]);

  // keyboard handling
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, items.length)); // allow last index = create action
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && highlight < items.length) {
        // select highlighted
        selectItem(items[highlight]);
      } else {
        // create new author from current query
        createAuthorFromQuery(query.trim());
      }
    }
  };

  function selectItem(u: UserItem) {
    setQuery(u.name);
    setOpen(false);
    setHighlight(-1);
    onChange?.(u);
  }

  async function createAuthorFromQuery(name: string) {
    if (!name) return;
    // create minimal user via backend
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      // fallback email/password
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
      setItems((p) => [u, ...p]);
      selectItem(u);
    } catch (err) {
      console.error("create author failed", err);
      alert("Failed to create author — check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange?.(null); // clear parent selection until user picks
        }}
        onFocus={() => {
          if (query) {
            debouncedFetch(query);
          }
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-400"
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {/* suggestion box (absolute) */}
      {open && (
        <div
          className="absolute left-0 right-0 z-50 mt-1 bg-white border rounded shadow max-h-60 overflow-auto"
          role="listbox"
        >
          <div className="p-2 text-xs text-gray-500 border-b">
            {loading ? "Searching…" : `Suggestions (${items.length})`}
          </div>

          {items.length > 0 ? (
            items.map((u, idx) => {
              const isHighlighted = highlight === idx;
              return (
                <div
                  key={u._id}
                  role="option"
                  aria-selected={isHighlighted}
                  className={`flex items-center justify-between gap-2 px-3 py-2 cursor-pointer ${
                    isHighlighted ? "bg-sky-50" : "hover:bg-gray-50"
                  }`}
                  onMouseEnter={() => setHighlight(idx)}
                  onMouseLeave={() => setHighlight(-1)}
                  onClick={() => selectItem(u)}
                >
                  <div>
                    <div className="font-medium text-sm">{u.name}</div>
                    {u.email && (
                      <div className="text-xs text-gray-400">{u.email}</div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-3 text-sm text-gray-600">No matches.</div>
          )}

          {/* create new call-to-action: always present at the bottom */}
          <div
            className={`px-3 py-2 border-t cursor-pointer flex items-center justify-between ${
              highlight === items.length ? "bg-sky-50" : "hover:bg-gray-50"
            }`}
            onMouseEnter={() => setHighlight(items.length)}
            onClick={() => createAuthorFromQuery(query.trim())}
            role="button"
          >
            <div className="text-sm">
              Create new author:{" "}
              <span className="font-medium">{query || "Unnamed"}</span>
            </div>
            <div className="text-xs text-gray-500">Enter</div>
          </div>
        </div>
      )}
    </div>
  );
}
