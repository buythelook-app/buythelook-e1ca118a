// app/admin/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { supabaseAuth } from '@/lib/supabase-auth-client'

// Allowed admin emails
const ADMIN_EMAILS = [
  'huzaifa084567@gmail.com',
  'hilafunis@gmail.com'
]

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabaseAuth.auth.getUser()
    
    // Only allow admin emails
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      window.location.href = '/'
      return
    }
    
    setCurrentUser(user)
    loadUsers()
  }

  async function loadUsers() {
    setLoading(true)
    const { data } = await supabaseAuth
      .from('profiles')
      .select('id, email, full_name, credits, created_at')
      .order('created_at', { ascending: false })
    
    setUsers(data || [])
    setLoading(false)
  }

  async function updateCredits(userId, newCredits) {
    const credits = parseInt(newCredits)
    if (isNaN(credits)) {
      alert('Please enter a valid number')
      return
    }

    const { error } = await supabaseAuth
      .from('profiles')
      .update({ credits: credits })
      .eq('id', userId)
    
    if (error) {
      alert('Error updating credits: ' + error.message)
    } else {
      alert('Credits updated successfully!')
      loadUsers()
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Checking access...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage user credits - Logged in as: {currentUser.email}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading users...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email || 'No email'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.full_name || 'No name'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gray-900">
                        {user.credits}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="New credits"
                          className="border border-gray-300 rounded px-3 py-1 w-24"
                          id={`credits-${user.id}`}
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(`credits-${user.id}`)
                            updateCredits(user.id, input.value)
                            input.value = ''
                          }}
                          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No users found
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Total Users: {users.length}
        </div>
      </div>
    </div>
  )
}