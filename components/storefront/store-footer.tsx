import { Mail, Phone } from "lucide-react"

interface StoreFooterProps {
  storeName: string
  email?: string
  phone?: string
  description?: string
}

export function StoreFooter({ storeName, email, phone, description }: StoreFooterProps) {
  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg text-foreground mb-2">{storeName}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Contact</h4>
            {email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${email}`} className="hover:text-foreground transition-colors">
                  {email}
                </a>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href={`tel:${phone}`} className="hover:text-foreground transition-colors">
                  {phone}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">About</h4>
            <p className="text-sm text-muted-foreground">
              Powered by <span className="font-semibold">Frontier</span> - The Nigerian e-commerce platform for
              creators.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
