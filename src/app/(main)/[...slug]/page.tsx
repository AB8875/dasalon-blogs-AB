// src/app/(main)/[...slug]/page.tsx
import { notFound } from "next/navigation";
import { getMenusWithSubmenus } from "@/service/Menu";
import { ISubmenu } from "@/types/transformerTypes";

interface MenuPageProps {
  params: any;
}

export default async function MenuPage({ params }: MenuPageProps) {
  // IMPORTANT: await params.slug directly (no optional chaining) so Next's
  // segment promises are resolved correctly in all runtimes.
  const rawSlug = await params.slug;

  // Normalize possible shapes:
  // - undefined/null -> []
  // - string -> [string]
  // - string[] -> as-is
  const slugArr: string[] = Array.isArray(rawSlug)
    ? rawSlug
    : typeof rawSlug === "string"
    ? [rawSlug]
    : [];

  if (
    !Array.isArray(slugArr) ||
    (slugArr.length !== 2 && slugArr.length !== 3)
  ) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Invalid URL Structure</h1>
        <p className="text-gray-600 mb-6">
          Expected URL format: /[menu-slug]/[menu-id] or
          /[menu-slug]/[menu-id]/[submenu-id]
        </p>
        <div className="prose max-w-none">
          <p>Received: /{slugArr.join("/")}</p>
          <p>Number of segments: {slugArr.length}</p>
        </div>
      </div>
    );
  }

  const menuSlug = slugArr[0];
  const menuId = slugArr[1];
  const submenuId = slugArr.length === 3 ? slugArr[2] : null;

  try {
    const menusData = await getMenusWithSubmenus();

    if (!menusData || !Array.isArray(menusData)) {
      return (
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-semibold mb-6">
            No Menu Data Available
          </h1>
          <p className="text-gray-600 mb-6">
            Menu data could not be loaded from the backend.
          </p>
        </div>
      );
    }

    // Find menu by id (fall back to matching slug if id not found)
    const menu = menusData.find((m: any) => {
      return m._id === menuId || String(m._id) === String(menuId);
    });

    if (!menu) {
      return (
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-semibold mb-6">Menu Not Found</h1>
          <p className="text-gray-600 mb-6">The menu could not be found.</p>
          <div className="prose max-w-none">
            <p>
              Available menus: {menusData.map((m: any) => m.name).join(", ")}
            </p>
          </div>
        </div>
      );
    }

    // If only two segments: render menu overview (list its submenus)
    if (!submenuId) {
      const submenus: ISubmenu[] = Array.isArray(menu.submenus)
        ? menu.submenus
        : [];
      return (
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-semibold mb-6">{menu.name}</h1>
          {menu.description && (
            <p className="text-gray-600 mb-6">{menu.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {submenus.length ? (
              submenus.map((s: any) => (
                <div key={s._id} className="rounded border p-4">
                  <h2 className="text-lg font-semibold">{s.name}</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    {s.description || ""}
                  </p>
                  <div className="mt-3">
                    <a
                      href={`/${menuSlug}/${menuId}/${s._id}`}
                      className="text-primary underline"
                    >
                      View {s.name}
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p>No submenus found for this menu.</p>
            )}
          </div>
        </div>
      );
    }

    // If 3 segments: find the submenu and render submenu page
    const submenu = (menu.submenus || []).find(
      (sub: any) =>
        sub._id === submenuId || String(sub._id) === String(submenuId)
    );

    if (!submenu) {
      // Submenu id not found under menu -> return not found / helpful message
      return (
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-semibold mb-6">Submenu Not Found</h1>
          <p className="text-gray-600 mb-6">
            The submenu with ID "{submenuId}" could not be found under menu "
            {menu.name}".
          </p>
          <div className="prose max-w-none">
            <p>
              Available submenus:{" "}
              {(menu.submenus || []).map((s: any) => s.name).join(", ") ||
                "None"}
            </p>
          </div>
        </div>
      );
    }

    // Render submenu content (replace with actual blog list, hero, etc.)
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6 capitalize">
          {menu.name} - {submenu.name}
        </h1>

        {submenu.description && (
          <p className="text-gray-600 mb-6">{submenu.description}</p>
        )}

        {/* TODO: Replace this with your blog listing component that fetches by submenu id */}
        <div className="prose max-w-none">
          <p>
            Content for <strong>{submenu.name}</strong> under{" "}
            <strong>{menu.name}</strong>.
          </p>
          <p>Menu ID: {menuId}</p>
          <p>Submenu ID: {submenuId}</p>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error fetching menu data:", err);
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Menu Not Found</h1>
        <p className="text-gray-600 mb-6">
          The requested menu or submenu could not be found.
        </p>
      </div>
    );
  }
}
