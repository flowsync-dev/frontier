"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    quote: "Frontier made it so easy to launch my online store. I went from zero to selling in just 2 hours!",
    author: "Chioma Okafor",
    role: "Fashion Entrepreneur",
    initials: "CO",
  },
  {
    quote: "The analytics dashboard gives me exactly what I need to make smart business decisions. Highly recommended!",
    author: "Tunde Adeyemi",
    role: "Electronics Seller",
    initials: "TA",
  },
  {
    quote: "Customer support is incredible. They helped me set up everything and answered all my questions.",
    author: "Amara Nwosu",
    role: "Beauty Products",
    initials: "AN",
  },
]

export function Testimonials() {
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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Loved by Nigerian entrepreneurs</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-lg border border-border bg-card"
            >
              <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{testimonial.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
