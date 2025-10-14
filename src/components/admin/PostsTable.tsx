"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";

export type Post = {
  id: string;
  title: string;
  slug?: string;
  author: string;
  categories?: string[];
  status: "draft" | "published";
  createdAt: string;
};

export type Column<T> = {
  header: string;
  accessor: keyof T | string;
  cell?: (value: any, record: T) => React.ReactNode;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function PostsTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="min-w-full divide-y">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="px-4 py-2 text-left text-sm font-medium"
              >
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-4 py-2 text-right text-sm font-medium">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y">
          {data.map((record) => (
            <tr key={record.id}>
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`px-4 py-3 ${
                    col.accessor === "categories" ? "hidden md:table-cell" : ""
                  }`}
                >
                  {col.cell
                    ? col.cell((record as any)[col.accessor], record)
                    : (record as any)[col.accessor]}
                </td>
              ))}

              {(onEdit || onDelete) && (
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(record.id)}
                        aria-label="Edit"
                        className="rounded p-1 hover:bg-slate-100"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(record.id)}
                        aria-label="Delete"
                        className="rounded p-1 hover:bg-slate-100 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between gap-2 p-3">
        <div className="text-sm text-slate-500">
          Showing {data.length} posts
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded px-3 py-1 border">Prev</button>
          <button className="rounded px-3 py-1 border">Next</button>
        </div>
      </div>
    </div>
  );
}
