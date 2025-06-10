
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Scale, MapPin, Users } from 'lucide-react';

const BuiltForIndiaSection = () => {
  const features = [
    {
      icon: Scale,
      title: "Indian Contract Act 1872",
      description: "All contracts comply with Indian legal framework and are enforceable in Indian courts."
    },
    {
      icon: MapPin,
      title: "Local Jurisdiction",
      description: "Pre-configured for Indian states and territories with appropriate legal clauses."
    },
    {
      icon: Users,
      title: "Freelancer-Friendly",
      description: "Designed specifically for the Indian freelancing ecosystem and payment methods."
    },
    {
      icon: Shield,
      title: "Legal Protection",
      description: "Built-in clauses protect both freelancers and clients according to Indian consumer law."
    }
  ];

  const badges = [
    "Indian Contract Act Compliant",
    "RBI Payment Guidelines",
    "GST Ready Templates",
    "Regional Language Support"
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text font-heading">
            Built for India
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every contract is crafted to comply with Indian laws and designed for the local freelancing ecosystem.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Compliance Badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {badges.map((badge, index) => (
              <motion.div
                key={badge}
                className="bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium border border-success/20"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                ✓ {badge}
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 font-heading">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* India Map Visualization */}
          <motion.div 
            className="bg-card rounded-2xl p-8 shadow-lg text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-semibold mb-6 font-heading">Trusted Across India</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { city: "Mumbai", count: "2,500+" },
                { city: "Delhi", count: "1,800+" },
                { city: "Bangalore", count: "3,200+" },
                { city: "Pune", count: "1,400+" },
                { city: "Hyderabad", count: "1,100+" },
                { city: "Chennai", count: "900+" },
                { city: "Kolkata", count: "700+" },
                { city: "Ahmedabad", count: "600+" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.city}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-2xl font-bold text-primary mb-1">{stat.count}</div>
                  <div className="text-sm text-muted-foreground">{stat.city}</div>
                </motion.div>
              ))}
            </div>
            <motion.p 
              className="text-muted-foreground mt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Freelancers using Agrezy contracts
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BuiltForIndiaSection;
