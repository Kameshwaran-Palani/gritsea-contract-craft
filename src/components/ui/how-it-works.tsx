"use client";

import { motion } from "framer-motion";
import { FileText, Edit3, Upload } from "lucide-react";

const steps = [
  {
    title: "Select Template",
    description: "Choose from 10+ professional templates or start from scratch",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Edit Easily",
    description: "Customize your contract with our intuitive editor and AI assistance",
    icon: Edit3,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Share & Sign",
    description: "Send to clients for digital signatures and track status in real-time",
    icon: Upload,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="bg-muted py-24">
      <div className="container mx-auto px-4 text-center">
        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-primary mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          How It Works
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className="text-muted-foreground text-lg md:text-xl mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Create professional contracts in three simple steps. No legal expertise required.
        </motion.p>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-10">
          {/* Horizontal line */}
          <div className="absolute top-[60px] left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-green-600 to-red-600 z-0 hidden md:block" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative text-center z-10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Icon and Step Number */}
              <div className="relative flex flex-col items-center justify-center min-h-[120px] mb-6">
                {/* Icon Container */}
                <motion.div
                  className={`w-20 h-20 ${step.bgColor} rounded-2xl flex items-center justify-center shadow-xl transition-transform transform hover:scale-105`}
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <step.icon className={`w-10 h-10 ${step.color}`} />
                </motion.div>

                {/* Step Number */}
                <motion.div
                  className="absolute bottom-[-22px] w-10 h-10 bg-background border-4 border-primary rounded-full flex items-center justify-center text-primary font-bold text-lg z-10 shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  {index + 1}
                </motion.div>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-semibold mb-3 font-heading">{step.title}</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
