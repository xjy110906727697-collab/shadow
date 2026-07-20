'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-gray-600 hover:text-gray-900"
    >
      退出
    </button>
  )
}
