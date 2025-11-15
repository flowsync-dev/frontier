"use client"

import { motion } from "framer-motion"
import { BarChart3, Package, TrendingUp, FileText, Globe, Zap } from "lucide-react"

const features = [
  {
    icon: Package,
    title: "Inventory Management",
    description: "Track stock levels, set low-stock alerts, and manage products effortlessly.",
  },
  {
    icon: TrendingUp,
    title: "Sales Analytics",
    description: "Real-time insights into your sales, revenue, and customer behavior.",
  },
  {
    icon: FileText,
    title: "Smart Reports",
    description: "Generate automated weekly or monthly performance reports in multiple formats.",
  },
  {
    icon: Globe,
    title: "Public Storefront",
    description: "Beautiful, customizable online store accessible to customers worldwide.",
  },
  {
    icon: BarChart3,
    title: "Profit Calculator",
    description: "Automatically calculate profit margins and track profitability per product.",
  },
  {
    icon: Zap,
    title: "Export Hub",
    description: "Export data to PDF, DOCX, XLSX, or CSV with a single click.",
  },
]

export function Features() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Everything you need to succeed</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Frontier gives you all the tools to manage your business and delight your customers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
