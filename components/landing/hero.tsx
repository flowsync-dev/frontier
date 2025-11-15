"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-foreground">
            Your Store,
            <br />
            <span className="text-accent">Simplified</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create your online store in minutes. Manage inventory, track sales, and reach customers worldwide—all from
            one beautiful dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2">
              Start free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/auth/sign-in">
            <Button size="lg" variant="outline">
              Login
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-12"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <p className="text-sm text-foreground">Join 500+ Nigerian businesses already selling online</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
