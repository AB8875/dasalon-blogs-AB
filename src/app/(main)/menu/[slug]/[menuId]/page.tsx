"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

type MenuType = {
  _id: string
  name: string
  slug: string
  description: string
  submenus?: Array<{
    _id: string
    name: string
    slug: string
    description?: string
  }>
}

export default function MenuDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [menu, setMenu] = useState<MenuType | null>(null)
  const [loading, setLoading] = useState(true)

  const menuId = params.menuId as string
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

  useEffect(() => {
    if (!menuId) return

    const fetchMenu = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(`${base}/api/menu/${menuId}`)
        setMenu(data)
      } catch (error) {
        console.error("Error fetching menu:", error)
        toast.error("Failed to load menu")
        router.push("/menu")
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [menuId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!menu) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">Menu not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      {/* Back Button */}
      <Link href="/menu" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Menus
      </Link>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{menu.name}</h1>
      </div>

      {/* Submenus */}
      {menu.submenus && menu.submenus.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menu.submenus.map((submenu) => (
            <Link
              key={submenu._id}
              href={`/menu/${menu.slug}/${menuId}/${submenu.slug}/${submenu._id}`}
              className="group"
            >
              <div className="h-full bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-primary transition-all">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {submenu.name}
                </h2>
                <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                  View <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No submenus available in this menu.</p>
        </div>
      )}
    </div>
  )
}
