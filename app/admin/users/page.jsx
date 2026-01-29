"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { Loader2, Save, RefreshCw } from "lucide-react"

export default function AdminUsersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [checking, setChecking] = useState(true)
  const [users, setUsers] = useState([])
  const [savingId, setSavingId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // -------------------------
  // FETCH USERS FUNCTION
  // -------------------------
  async function fetchUsers() {
    console.log("🔍 Fetching all users...")
    setRefreshing(true)

    const { data: allUsers, error: usersError } = await supabaseAuth
      .from("profiles")
      .select("id, email, credits, is_admin, created_at")
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("❌ Error fetching users:", usersError)
      alert("Error fetching users: " + usersError.message)
      setRefreshing(false)
      return
    }

    console.log("✅ Fetched users:", allUsers.length)
    console.log("📧 User emails:", allUsers.map(u => u.email))
    
    setUsers(allUsers || [])
    setRefreshing(false)
  }

  // -------------------------
  // CHECK ADMIN + LOAD USERS
  // -------------------------
  useEffect(() => {
    async function init() {
      console.log("🔐 Admin check starting...")

      if (!loading && !user) {
        console.log("❌ No user, redirecting to login")
        router.push("/login")
        return
      }

      if (!user) return

      try {
        // 1️⃣ Check admin status
        console.log("👤 Checking if user is admin...")
        const { data: profile, error } = await supabaseAuth
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single()

        console.log("📊 Profile check result:", { profile, error })

        if (error || !profile?.is_admin) {
          console.log("❌ Not admin, redirecting to login")
          router.push("/login")
          return
        }

        console.log("✅ User is admin!")

        // 2️⃣ Fetch all users
        await fetchUsers()
      } catch (err) {
        console.error("❌ Error in init:", err)
        router.push("/login")
      } finally {
        setChecking(false)
      }
    }

    init()
  }, [user, loading, router])

  // -------------------------
  // UPDATE CREDITS (RPC)
  // -------------------------
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
      alert("✅ Credits updated successfully!")
      
      // Refresh users list
      await fetchUsers()
    }

    setSavingId(null)
  }

  // -------------------------
  // LOADING STATE
  // -------------------------
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="min-h-screen bg-background mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif mb-2">Manage Users</h1>
            <p className="text-sm text-muted-foreground">
              Total users: {users.length}
            </p>
          </div>
          
          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {users.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Credits</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
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
        )}
      </div>
    </div>
  )
}

// -------------------------
// USER ROW COMPONENT
// -------------------------
function UserRow({ user, onUpdate, isSaving }) {
  const [credits, setCredits] = useState(user.credits)

  return (
    <tr className="border-t hover:bg-muted/50">
      <td className="p-3">
        <div className="font-medium">{user.email || "No email"}</div>
        <div className="text-xs text-muted-foreground">{user.id}</div>
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