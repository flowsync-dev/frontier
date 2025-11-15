"use server"

import { getSupabaseServer } from "./supabase-server"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "./supabase-admin"

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${"http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    try {
      // Create user in public.users table
      const admin = await getSupabaseAdmin()
      
      const { error: userError } = await admin.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
      })

      if (userError) {
        console.error("[v0] Error creating user profile:", userError)
        // Don't fail signup - user can try to create profile later
      } else {
        console.log("[v0] User profile created successfully!")
      }

      // Now call the store API to create initial store
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          userId: data.user.id,
          email: data.user.email,
          name: fullName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("[v0] Failed to create store:", result.error)
        // Don't fail signup if store creation fails - user can create later
      }

      // Sign in the user automatically
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.log("[v0] Sign in after signup failed:", signInError.message)
        return { success: true, needsSignIn: true }
      }
    } catch (err) {
      console.error("[v0] Error in signup process:", err)
      // Continue anyway - user can create store later
    }
  }

  return { success: true }
}

export async function signIn(email: string, password: string) {
  const supabase = await getSupabaseServer()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes("email_not_confirmed")) {
      // Try to verify the user's email by updating their email_confirmed_at
      const admin = await getSupabaseAdmin()
      const { error: updateError } = await admin.auth.admin.updateUserById(
        (await supabase.auth.getUser()).data.user?.id || "",
        { email_confirm: true },
      )

      if (!updateError) {
        // Retry sign in after confirming email
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (!retryError) {
          redirect("/dashboard")
        }
      }
    }
    return { error: error.message }
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await getSupabaseServer()
  await supabase.auth.signOut()
  redirect("/auth/sign-in")
}

export async function getCurrentUser() {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}