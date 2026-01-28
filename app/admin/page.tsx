"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import Link from "next/link"
import { Sparkles, FileText, BarChart, Loader2, Users, Save, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [activeTab, setActiveTab] = useState("overview") // overview, users, blogs, categories

  useEffect(() => {
    async function checkAdmin() {
      console.log("🔐 AdminDashboard: Checking if user is logged in", { user: user?.email, loading })

      if (!loading && !user) {
        console.log("❌ AdminDashboard: No user, redirecting to login")
        router.push("/login")
        return
      }

      if (user) {
        console.log("👤 AdminDashboard: User logged in, checking admin status")

        try {
          const { data: profile, error } = await supabaseAuth
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single()

          console.log("📊 AdminDashboard: Profile query result", { profile, error })

          if (error) {
            console.error("❌ AdminDashboard: Error fetching profile:", error)
            setIsAdmin(false)
            setChecking(false)
            router.push("/login")
            return
          }

          if (profile?.is_admin) {
            console.log("✅ AdminDashboard: User is admin!")
            setIsAdmin(true)
          } else {
            console.log("❌ AdminDashboard: User is NOT admin, redirecting")
            router.push("/login")
          }
        } catch (err) {
          console.error("❌ AdminDashboard: Catch error:", err)
          router.push("/login")
        }

        setChecking(false)
      }
    }

    checkAdmin()
  }, [user, loading, router])

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>

        {/* Tabs */}
        <div className="border-b mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === "users"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("blogs")}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === "blogs"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Blogs
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === "categories"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Categories
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "blogs" && <BlogsTab />}
        {activeTab === "categories" && <CategoriesTab />}
      </div>
    </div>
  )
}

// ========================================
// OVERVIEW TAB
// ========================================
function OverviewTab() {
  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">User Management</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Manage user accounts, credits, and permissions
          </p>
        </div>

        <Link
          href="/admin/blogs"
          className="group block rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:scale-[1.02]"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Blog Posts</h3>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage blog posts with full SEO control
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="group block rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:scale-[1.02]"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Categories & Tags</h3>
          <p className="text-sm text-muted-foreground">
            Organize your content with categories and tags
          </p>
        </Link>

        <div className="rounded-lg border bg-card p-6 opacity-60">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <BarChart className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Analytics</h3>
          <p className="text-sm text-muted-foreground">
            View blog performance and traffic stats (Coming Soon)
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-serif">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <FileText className="h-4 w-4" />
            Create New Blog Post
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 transition-colors hover:bg-accent"
          >
            View Live Blog
          </Link>
        </div>
      </div>
    </div>
  )
}

// ========================================
// USERS TAB WITH PAGINATION
// ========================================
function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingId, setSavingId] = useState(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch users
  async function fetchUsers() {
    console.log("🔍 Fetching all users...")
    setRefreshing(true)

    const { data: allUsers, error } = await supabaseAuth
      .from("profiles")
      .select("id, email, credits, is_admin, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching users:", error)
      alert("Error fetching users: " + error.message)
    } else {
      console.log("✅ Fetched users:", allUsers?.length)
      setUsers(allUsers || [])
    }

    setRefreshing(false)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Update credits
  async function updateCredits(userId, credits) {
    console.log("💾 Updating credits for user:", userId, "to:", credits)
    setSavingId(userId)

    const { error } = await supabaseAuth.rpc("admin_update_credits", {
      target_user_id: userId,
      new_credits: Number(credits),
    })

    if (error) {
      console.error("❌ Error updating credits:", error)
      alert("Error: " + error.message)
    } else {
      console.log("✅ Credits updated successfully!")
      alert("✅ Credits updated!")
      await fetchUsers()
    }

    setSavingId(null)
  }

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.includes(searchQuery)
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header with search and refresh */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by email or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="w-full max-w-md px-4 py-2 rounded-lg border bg-background"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Total: {filteredUsers.length} users
          </p>
          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Users table */}
      {currentUsers.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? "No users found matching your search" : "No users found"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Credits</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onUpdate={updateCredits}
                    isSaving={savingId === u.id}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// User Row Component
function UserRow({ user, onUpdate, isSaving }) {
  const [credits, setCredits] = useState(user.credits)

  return (
    <tr className="border-t hover:bg-muted/50">
      <td className="p-3">
        <div className="font-medium">{user.email || "No email"}</div>
      </td>
      <td className="p-3">
        <div className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</div>
      </td>
      <td className="p-3">
        <input
          type="number"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          className="w-24 rounded border px-2 py-1 bg-background"
          disabled={isSaving}
        />
      </td>
      <td className="p-3">
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
          user.is_admin 
            ? 'bg-primary/10 text-primary' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {user.is_admin ? "Admin" : "User"}
        </span>
      </td>
      <td className="p-3 text-right">
        <button
          onClick={() => onUpdate(user.id, credits)}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </button>
      </td>
    </tr>
  )
}

// ========================================
// BLOGS TAB (Placeholder)
// ========================================
function BlogsTab() {
  return (
    <div className="border rounded-lg p-12 text-center">
      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-xl font-semibold mb-2">Blog Management</h3>
      <p className="text-muted-foreground mb-6">Manage your blog posts here</p>
      <Link
        href="/admin/blogs"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
      >
        Go to Blog Management
      </Link>
    </div>
  )
}

// ========================================
// CATEGORIES TAB (Placeholder)
// ========================================
function CategoriesTab() {
  return (
    <div className="border rounded-lg p-12 text-center">
      <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-xl font-semibold mb-2">Categories & Tags</h3>
      <p className="text-muted-foreground mb-6">Organize your content</p>
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
      >
        Go to Categories
      </Link>
    </div>
  )
}
