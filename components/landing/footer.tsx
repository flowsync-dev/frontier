"use client"

import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Frontier</h3>
            <p className="text-background/80">Empowering Nigerian entrepreneurs to build thriving online businesses.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-background/80">
              <li>
                <Link href="#" className="hover:text-background transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-background transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-background transition">
                  Security
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-background/80">
              <li>
                <Link href="#" className="hover:text-background transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-background transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-background transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-background/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@frontier.ng" className="hover:text-background transition">
                  hello@frontier.ng
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+2341234567890" className="hover:text-background transition">
                  +234 (0) 123 456 7890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center text-background/60 text-sm">
          <p>&copy; 2025 Frontier. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-background transition">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-background transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
