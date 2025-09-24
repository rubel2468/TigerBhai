'use client'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { signInWithCustomToken, onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'

export default function FirebaseSessionBridge() {
  const appUser = useSelector(store => store.authStore.auth)

  useEffect(() => {
    let unsubscribe = () => {}
    if (typeof window !== 'undefined') {
      window.firebaseAuth = firebaseAuth
    }
    if (!appUser?._id) {
      // Fallback: mint token from server using cookie session
      (async () => {
        try {
          const res = await fetch('/api/firebase/session', { method: 'POST' })
          const json = await res.json()
          if (json.success) {
            await signInWithCustomToken(firebaseAuth, json.token)
          }
        } catch {}
      })()
      return
    }

    const ensure = async () => {
      try {
        // check if already the same uid
        unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
          if (typeof window !== 'undefined') {
            window.firebaseAuth = firebaseAuth
            window.__firebaseSignInWithToken = async (token) => {
              try { await signInWithCustomToken(firebaseAuth, token) } catch (e) { console.error(e) }
            }
          }
          if (fbUser?.uid === String(appUser._id)) return
          const res = await fetch('/api/firebase/custom-token', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: { _id: appUser._id, role: appUser.role } })
          })
          const json = await res.json()
          if (json.success) await signInWithCustomToken(firebaseAuth, json.token)
        })
      } catch (e) {
        // no-op
      }
    }
    ensure()
    return () => unsubscribe()
  }, [appUser?._id, appUser?.role])

  return null
}


