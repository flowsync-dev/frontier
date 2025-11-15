import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      userId,
      email,
      name,
      description,
      whatsappNumber,
      themePreset,
    } = body;

    const admin = await getSupabaseAdmin();
    const supabase = await getSupabaseServer();


    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "create") {

      // Verify user exists in public.users table
      const { data: existingUser } = await admin
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingUser) {
        console.error("[v0] User not found in database!");
        return NextResponse.json(
          { error: "User profile not found. Please contact support." },
          { status: 500 }
        );
      }

      // Check if store already exists
      const { data: existingUser } = await admin
        .from("users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!existingUser) {
        const { error: userError } = await admin.from("users").insert({
          id: user.id,
          email: user.email || email,
          full_name:
            user.user_metadata?.full_name ||
            name ||
            user.email?.split("@")[0] ||
            "User",
        });

        if (userError) {
          console.error("[v0] Error creating user:", userError);
          return NextResponse.json(
            { error: "Failed to create user profile: " + userError.message },
            { status: 500 }
          );
        }
      }
      const { data: existingStore } = await admin
        .from("stores")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (existingStore) {
        return NextResponse.json({
          user: { id: user.id, email: user.email },
          store: existingStore,
        });
      }


      // Generate store slug


      const storeSlug =
        (user.email || email)
          ?.split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "") || `store-${Date.now()}`;


      // Create new store


      const { data: newStore, error: storeError } = await admin
        .from("stores")
        .insert({
          owner_id: user.id,
          name: name || `${user.user_metadata?.full_name || "My"} Store`,
          slug: storeSlug,
          description: description || "Welcome to my store!",
          whatsapp_number: whatsappNumber,
          is_published: false,
          theme_preset: themePreset || "minimal",
        })
        .select()
        .maybeSingle();

      if (storeError) {
        console.error("[v0] Error creating store:", storeError);
        return NextResponse.json(
          { error: "Failed to create store: " + storeError.message },
          { status: 500 }
        );
      }

      if (!newStore) {
        return NextResponse.json(
          { error: "Failed to create store: no data returned" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        user: { id: user.id, email: user.email },
        store: newStore,
      });
    }

    if (action === "update") {
      const { storeId, updates } = body;

      if (!storeId) {
        return NextResponse.json(
          { error: "Store ID is required" },
          { status: 400 }
        );
      }


      // Verify store ownership


      const { data: store } = await admin
        .from("stores")
        .select("owner_id")
        .eq("id", storeId)
        .maybeSingle();

      if (!store || store.owner_id !== user.id) {
        return NextResponse.json(
          { error: "Store not found or unauthorized" },
          { status: 403 }
        );
      }


      // Update store


      const { data: updatedStore, error: updateError } = await admin
        .from("stores")
        .update(updates)
        .eq("id", storeId)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error("[v0] Error updating store:", updateError);
        return NextResponse.json(
          { error: "Failed to update store: " + updateError.message },
          { status: 500 }
        );
      }

      if (!updatedStore) {
        return NextResponse.json(
          { error: "Failed to update store: no data returned" },
          { status: 500 }
        );
      }

      return NextResponse.json({ store: updatedStore });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[v0] API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }

}

}
