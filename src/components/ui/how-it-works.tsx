'use client';

import { motion } from 'framer-motion';
import { FileText, PenLine, Upload } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: 'Select Template',
      icon: <FileText size={32} className="text-blue-700" />,
      number: 1,
      description: 'Choose from 10+ professional templates or start from scratch',
      color: 'bg-blue-100',
      circleColor: 'bg-blue-700',
    },
    {
      title: 'Edit Easily',
      icon: <PenLine size={32} className="text-emerald-700" />,
      number: 2,
      description: 'Customize your contract with our intuitive editor and AI assistance',
      color: 'bg-emerald-100',
      circleColor: 'bg-emerald-700',
    },
    {
      title: 'Share & Sign',
      icon: <Upload size={32} className="text-red-700" />,
      number: 3,
      description: 'Send to clients for digital signatures and track status in real-time',
      color: 'bg-red-100',
      circleColor: 'bg-red-700',
    },
  ];

  return (
    <section className="w-full bg-[#f9fbfd] py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-slate-700 mb-4">How It Works</h2>
        <p className="text-gray-500 text-lg mb-16">
          Create professional contracts in three simple steps. No legal expertise required.
        </p>

        {/* Horizontal Line */}
        <div className="relative h-[100px] mb-4">
          <div className="absolute top-1/2 left-0 w-full border-t-2 border-gradient-to-r from-blue-500 via-emerald-500 to-red-500"></div>

          {/* Steps */}
          <div className="flex justify-between items-start max-w-5xl mx-auto px-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center w-1/3"
              >
                <div className="relative z-10 -mt-16">
                  <div className={`p-4 rounded-xl shadow-md ${step.color}`}>
                    {step.icon}
                  </div>
                  <span
                    className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-white font-bold ${step.circleColor} w-10 h-10 flex items-center justify-center rounded-full border-4 border-white shadow-md`}
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mt-6">{step.title}</h3>
                <p className="text-gray-600 text-sm mt-2 max-w-[240px]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
