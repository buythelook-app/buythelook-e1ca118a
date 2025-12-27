import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/check-admin"
import Link from "next/link"

export default async function AdminCategoriesPage() {
  const { isAdmin } = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="font-serif text-4xl mb-2">Categories & Tags</h1>
        <p className="text-muted-foreground mb-8">Manage blog categories and tags (Coming Soon)</p>

        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">Category and tag management will be available in the next update</p>
        </div>

        <div className="mt-8">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
