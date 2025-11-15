// src/app/(main)/[...slug]/page.tsx
import { notFound } from "next/navigation";
import { getMenusWithSubmenus } from "@/service/Menu";
import { ISubmenu } from "@/types/transformerTypes";

interface MenuPageProps {
  params: { slug: string[] }; // keep simple typed params
}

interface Menu {
  _id: string;
  name: string;
  slug?: string;
  submenus?: ISubmenu[];
}

/**
 * Catch-all route for menu/submenu pages: /[...slug]
 */
export default async function MenuPage({ params }: MenuPageProps) {
  const resolved = await params;
  const { slug } = resolved;

  // Expected URL structure: /[menu-slug]/[menu-id]/[submenu-id]
  if (!Array.isArray(slug) || slug.length !== 3) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Invalid URL Structure</h1>
        <p className="text-gray-600 mb-6">
          Expected URL format: /[menu-slug]/[menu-id]/[submenu-id]
        </p>
        <div className="prose max-w-none">
          <p>
            Received: /{Array.isArray(slug) ? slug.join("/") : String(slug)}
          </p>
          <p>Number of segments: {Array.isArray(slug) ? slug.length : 0}</p>
        </div>
      </div>
    );
  }

  const [menuSlug, menuId, submenuId] = slug;

  try {
    // Fetch all menus with submenus
    const menusData = (await getMenusWithSubmenus()) as Menu[] | null;

    if (!menusData || !Array.isArray(menusData)) {
      return (
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-semibold mb-6">
            No Menu Data Available
          </h1>
          <p className="text-gray-600 mb-6">
            Menu data could not be loaded from the backend.
          </p>
          <div className="prose max-w-none">
            <p>
              This might be because the backend menu endpoints are not available
              yet.
            </p>
          </div>
        </div>
      );
    }

    // Find the menu by ID (explicitly type the callback param)
    const menu = menusData.find((m: Menu) => String(m._id) === String(menuId));

    if (!menu) {
      return (
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-semibold mb-6">Menu Not Found</h1>
          <p className="text-gray-600 mb-6">
            The menu with ID "{menuId}" could not be found.
          </p>
          <div className="prose max-w-none">
            <p>
              Available menus:{" "}
              {menusData.length
                ? menusData.map((m) => m.name).join(", ")
                : "None"}
            </p>
          </div>
        </div>
      );
    }

    // Find the specific submenu (typed callback)
    const submenu = menu.submenus?.find(
      (sub: ISubmenu) => String(sub._id) === String(submenuId)
    );

    if (!submenu) {
      return (
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-semibold mb-6">Submenu Not Found</h1>
          <p className="text-gray-600 mb-6">
            The submenu with ID "{submenuId}" could not be found in menu "
            {menu.name}".
          </p>
          <div className="prose max-w-none">
            <p>
              Available submenus:{" "}
              {menu.submenus && menu.submenus.length
                ? menu.submenus.map((s: ISubmenu) => s.name).join(", ")
                : "None"}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6 capitalize">
          {menu.name} - {submenu.name}
        </h1>

        {submenu.description && (
          <p className="text-gray-600 mb-6">{submenu.description}</p>
        )}

        {/* Add your content here based on the submenu */}
        <div className="prose max-w-none">
          <p>
            Content for {submenu.name} under {menu.name}
          </p>
          <p>Menu ID: {menuId}</p>
          <p>Submenu ID: {submenuId}</p>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error fetching menu data:", err);
    // Return a graceful fallback instead of throwing
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Menu Not Found</h1>
        <p className="text-gray-600 mb-6">
          The requested menu or submenu could not be found.
        </p>
        <div className="prose max-w-none">
          <p>Menu ID: {menuId}</p>
          <p>Submenu ID: {submenuId}</p>
          <p>
            This might be because the backend menu endpoints are not available
            yet.
          </p>
        </div>
      </div>
    );
  }
}
