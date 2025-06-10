
import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Trophy, Users, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CommunitySection = () => {
  const topTemplates = [
    {
      title: "Modern Web Development Contract",
      author: "Priya S.",
      downloads: 1247,
      rating: 4.9,
      category: "Development"
    },
    {
      title: "UI/UX Design Agreement",
      author: "Rajesh K.",
      downloads: 1089,
      rating: 4.8,
      category: "Design"
    },
    {
      title: "Content Writing Contract",
      author: "Anita D.",
      downloads: 892,
      rating: 4.9,
      category: "Writing"
    },
    {
      title: "Digital Marketing Retainer",
      author: "Vikram S.",
      downloads: 756,
      rating: 4.7,
      category: "Marketing"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "15,000+" },
    { icon: Upload, label: "Templates Shared", value: "2,500+" },
    { icon: Download, label: "Downloads", value: "50,000+" },
    { icon: Star, label: "Average Rating", value: "4.8/5" }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text font-heading">
            Community & Sharing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our vibrant community of freelancers sharing templates and helping each other succeed.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Community Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center bg-card rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Upload Template Section */}
            <motion.div 
              className="bg-card rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold mb-2 font-heading">Share Your Template</h3>
                <p className="text-muted-foreground">Help the community by sharing your successful contract templates</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Earn community recognition</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Get featured in top templates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Help fellow freelancers succeed</span>
                </div>
              </div>

              <Button className="w-full bg-accent hover:bg-accent/90" size="lg">
                <Upload className="w-4 h-4 mr-2" />
                Upload Template
              </Button>
            </motion.div>

            {/* Top Templates Leaderboard */}
            <motion.div 
              className="bg-card rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mr-4">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold font-heading">Top Shared Templates</h3>
                  <p className="text-sm text-muted-foreground">Most downloaded this month</p>
                </div>
              </div>

              <div className="space-y-4">
                {topTemplates.map((template, index) => (
                  <motion.div
                    key={template.title}
                    className="flex items-center justify-between p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        {index === 0 && <span className="text-yellow-500 text-lg">🥇</span>}
                        {index === 1 && <span className="text-gray-400 text-lg">🥈</span>}
                        {index === 2 && <span className="text-orange-500 text-lg">🥉</span>}
                        {index === 3 && <span className="text-primary font-bold">#{index + 1}</span>}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{template.title}</div>
                        <div className="text-xs text-muted-foreground">by {template.author}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-1">
                        <Download className="w-3 h-3" />
                        <span>{template.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{template.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                View All Templates
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
