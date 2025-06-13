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
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-4 text-center">
        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-blue-900 mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          HOW IT WORKS
        </motion.h2>
        
        {/* Subtext */}
        <motion.p
          className="text-gray-600 text-lg md:text-xl mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Create professional contracts in three simple steps. No legal expertise required.
        </motion.p>
        
        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          {/* Horizontal connecting line for desktop */}
          <div className="absolute top-[50px] left-1/6 right-1/6 h-1 bg-gradient-to-r from-blue-600 via-green-600 to-red-600 z-0 hidden md:block" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative text-center z-10 pb-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Step Number Circle */}
              <motion.div
                className="absolute top-[40px] left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white border-4 border-blue-800 rounded-full flex items-center justify-center text-blue-800 font-bold text-xl z-20 shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                {index + 1}
              </motion.div>
              
              {/* Icon Container */}
              <div className="flex flex-col items-center justify-center mb-8">
                <motion.div
                  className={`w-24 h-24 ${step.bgColor} rounded-2xl flex items-center justify-center shadow-lg transition-transform transform hover:scale-105 mb-6`}
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <step.icon className={`w-12 h-12 ${step.color}`} />
                </motion.div>
              </div>
              
              {/* Title & Description */}
              <div className="mt-4">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
