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
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-4 py-3 text-right font-medium text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.map((record) => (
            <tr
              key={record.id}
              className="border-t hover:bg-gray-50 transition-colors"
            >
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
                  <div className="inline-flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(record.id)}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(record.id)}
                        className="p-1 rounded hover:bg-gray-100 text-red-600"
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

      <div className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm text-gray-500">
        <span>Showing {data.length} posts</span>
        <div className="flex gap-2">
          <button className="border rounded px-3 py-1 hover:bg-gray-100">
            Prev
          </button>
          <button className="border rounded px-3 py-1 hover:bg-gray-100">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
