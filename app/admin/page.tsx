"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import Link from "next/link"
import { 
  Sparkles, 
  FileText, 
  BarChart, 
  Loader2, 
  Users, 
  Save, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  Shield,
  User,
  Calendar,
  X
} from "lucide-react"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart },
    { id: "users", label: "Users", icon: Users },
    { id: "blogs", label: "Blogs", icon: FileText },
    { id: "categories", label: "Categories", icon: Sparkles },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-serif text-4xl">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground ml-14">Welcome back, {user?.email}</p>
        </div>

        {/* Tabs */}
        <div className="bg-card border rounded-xl mb-8 p-2 shadow-sm">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "blogs" && <BlogsTab />}
          {activeTab === "categories" && <CategoriesTab />}
        </div>
      </div>
    </div>
  )
}

// ========================================
// OVERVIEW TAB
// ========================================
function OverviewTab() {
  const [stats, setStats] = useState({ totalUsers: 0, adminUsers: 0, regularUsers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const { data: users } = await supabaseAuth
        .from("profiles")
        .select("is_admin")

      if (users) {
        setStats({
          totalUsers: users.length,
          adminUsers: users.filter(u => u.is_admin).length,
          regularUsers: users.filter(u => !u.is_admin).length,
        })
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-3xl font-bold">{stats.totalUsers}</span>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-1">Total Users</h3>
          <p className="text-sm text-muted-foreground">All registered users</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Shield className="h-6 w-6 text-purple-500" />
            </div>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-3xl font-bold">{stats.adminUsers}</span>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-1">Admins</h3>
          <p className="text-sm text-muted-foreground">Administrator accounts</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <User className="h-6 w-6 text-green-500" />
            </div>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-3xl font-bold">{stats.regularUsers}</span>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-1">Regular Users</h3>
          <p className="text-sm text-muted-foreground">Standard accounts</p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div>
        <h2 className="text-2xl font-serif mb-4">Quick Access</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/blogs"
            className="group bg-card border rounded-xl p-6 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/50"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Blog Posts</h3>
            <p className="text-sm text-muted-foreground">
              Create, edit, and manage blog posts with full SEO control
            </p>
          </Link>

          <Link
            href="/admin/categories"
            className="group bg-card border rounded-xl p-6 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/50"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Categories & Tags</h3>
            <p className="text-sm text-muted-foreground">
              Organize your content with categories and tags
            </p>
          </Link>

          <div className="bg-card border rounded-xl p-6 shadow-sm opacity-60">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <BarChart className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              View blog performance and traffic stats (Coming Soon)
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-serif mb-4">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
          >
            <FileText className="h-4 w-4" />
            Create New Blog Post
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-6 py-3 shadow-sm transition-all hover:bg-accent hover:shadow-md"
          >
            View Live Blog
          </Link>
        </div>
      </div>
    </div>
  )
}

// ========================================
// USERS TAB WITH FILTERS & SORTING
// ========================================
function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingId, setSavingId] = useState(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all") // all, admin, user
  const [sortBy, setSortBy] = useState("date-desc") // date-desc, date-asc, email-asc, email-desc
  const [showFilters, setShowFilters] = useState(false)

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

  // Apply filters
  let filteredUsers = users.filter(u => {
    // Search filter
    const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Role filter
    const matchesRole = roleFilter === "all" || 
                       (roleFilter === "admin" && u.is_admin) ||
                       (roleFilter === "user" && !u.is_admin)
    
    return matchesSearch && matchesRole
  })

  // Apply sorting
  filteredUsers.sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.created_at) - new Date(a.created_at)
      case "date-asc":
        return new Date(a.created_at) - new Date(b.created_at)
      case "email-asc":
        return (a.email || "").localeCompare(b.email || "")
      case "email-desc":
        return (b.email || "").localeCompare(a.email || "")
      default:
        return 0
    }
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter, sortBy])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.is_admin).length}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <User className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => !u.is_admin).length}</p>
              <p className="text-xs text-muted-foreground">Regular Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Filter className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{filteredUsers.length}</p>
              <p className="text-xs text-muted-foreground">Filtered Results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by email or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              showFilters ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          {/* Refresh */}
          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-accent transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showFilters && (
          <div className="pt-4 border-t grid gap-4 md:grid-cols-3 animate-in slide-in-from-top duration-300">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All Users</option>
                <option value="admin">Admins Only</option>
                <option value="user">Regular Users Only</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div>
              <label className="block text-sm font-medium mb-2">Show</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      {currentUsers.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center shadow-sm">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">
            {searchQuery || roleFilter !== "all" 
              ? "Try adjusting your filters or search query" 
              : "No users in the database yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold">User</th>
                    <th className="p-4 text-left text-sm font-semibold">ID</th>
                    <th className="p-4 text-left text-sm font-semibold">Credits</th>
                    <th className="p-4 text-left text-sm font-semibold">Role</th>
                    <th className="p-4 text-left text-sm font-semibold">Joined</th>
                    <th className="p-4 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-card border rounded-xl p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                <span className="font-semibold text-foreground">{Math.min(endIndex, filteredUsers.length)}</span> of{" "}
                <span className="font-semibold text-foreground">{filteredUsers.length}</span> users
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 transition-all hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-all min-w-[40px] ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-accent'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 transition-all hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next</span>
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
  const [isEditing, setIsEditing] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user.email?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <div className="font-medium">{user.email || "No email"}</div>
            <div className="text-xs text-muted-foreground">User account</div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
          {user.id.slice(0, 8)}...
        </code>
      </td>
      <td className="p-4">
        {isEditing ? (
          <input
            type="number"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="w-24 px-3 py-1.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={isSaving}
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 rounded-lg hover:bg-muted transition-colors font-medium"
          >
            {credits}
          </button>
        )}
      </td>
      <td className="p-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          user.is_admin 
            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300' 
            : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
        }`}>
          {user.is_admin ? (
            <>
              <Shield className="h-3 w-3" />
              Admin
            </>
          ) : (
            <>
              <User className="h-3 w-3" />
              User
            </>
          )}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatDate(user.created_at)}
        </div>
      </td>
      <td className="p-4 text-right">
        <button
          onClick={() => {
            onUpdate(user.id, credits)
            setIsEditing(false)
          }}
          disabled={isSaving || credits === user.credits}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="bg-card border rounded-xl p-12 text-center shadow-sm">
      <div className="max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-serif mb-3">Blog Management</h3>
        <p className="text-muted-foreground mb-8">
          Create, edit, and manage your blog posts with full SEO control
        </p>
        <Link
          href="/admin/blogs"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
        >
          Go to Blog Management
        </Link>
      </div>
    </div>
  )
}

// ========================================
// CATEGORIES TAB (Placeholder)
// ========================================
function CategoriesTab() {
  return (
    <div className="bg-card border rounded-xl p-12 text-center shadow-sm">
      <div className="max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-serif mb-3">Categories & Tags</h3>
        <p className="text-muted-foreground mb-8">
          Organize your content with categories and tags
        </p>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
        >
          Go to Categories
        </Link>
      </div>
    </div>
  )
}