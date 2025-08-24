import React from 'react';
import { motion } from 'framer-motion';
import { PenTool } from 'lucide-react';

interface AnimatedPenProps {
  text: string;
  className?: string;
}

const AnimatedPen = ({ text, className = "" }: AnimatedPenProps) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div
        className="absolute -left-12 top-0 text-primary z-10"
        initial={{ opacity: 0, x: -50, rotate: -45 }}
        whileInView={{ 
          opacity: 1, 
          x: 0, 
          rotate: 0,
          transition: { duration: 0.8, ease: "easeOut" }
        }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div
          animate={{ 
            y: [0, -2, 0],
            rotate: [0, 5, 0] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <PenTool size={24} />
        </motion.div>
      </motion.div>
      
      <motion.h2
        className="text-3xl md:text-4xl font-bold font-heading"
        initial={{ opacity: 0 }}
        whileInView={{ 
          opacity: 1,
          transition: { duration: 0.8, delay: 0.3 }
        }}
        viewport={{ once: true, margin: "-100px" }}
      >
        {text.split('').map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ 
              opacity: 1,
              transition: { 
                duration: 0.1, 
                delay: 0.5 + (index * 0.05) 
              }
            }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {char}
          </motion.span>
        ))}
      </motion.h2>
    </div>
  );
};

export default AnimatedPen;