"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "₦0",
    description: "Perfect for getting started",
    features: ["Up to 50 products", "Basic analytics", "Email support", "1 store", "CSV export"],
  },
  {
    name: "Pro",
    price: "₦4,999",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Unlimited products",
      "Advanced analytics",
      "Priority support",
      "Unlimited stores",
      "All export formats",
      "Scheduled reports",
      "Profit calculator",
      "Low stock alerts",
    ],
    highlighted: true,
  },
]

export function Pricing() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground">Choose the plan that fits your business</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`p-8 rounded-lg border ${
                plan.highlighted ? "border-accent bg-accent/5 ring-2 ring-accent/20" : "border-border bg-card"
              }`}
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              <Link href="/auth/sign-up" className="w-full block mb-6">
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                  Get Started
                </Button>
              </Link>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
