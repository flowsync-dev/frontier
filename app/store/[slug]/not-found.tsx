import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Store, Home } from "lucide-react"

export default function StoreNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <Store className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Store Not Found</h1>
          <p className="text-muted-foreground text-lg">
            The store you're looking for doesn't exist or hasn't been published yet.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button variant="default" className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Are you the store owner?{" "}
            <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
              Sign in to your dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
