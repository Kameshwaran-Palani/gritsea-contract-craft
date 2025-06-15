import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Star, 
  ThumbsUp, 
  Download, 
  Search, 
  Trophy,
  Heart,
  Eye,
  TrendingUp,
  Upload
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { UploadTemplateDialog } from '@/components/UploadTemplateDialog';

const communityTemplates = [
  {
    id: 1,
    title: "Modern Web Development Contract",
    description: "Comprehensive contract for full-stack development projects with milestone payments",
    author: "Priya Sharma",
    avatar: "",
    category: "Development",
    downloads: 1247,
    likes: 89,
    rating: 4.8,
    tags: ["React", "Node.js", "Full-stack"],
    uploadedAt: "2 days ago"
  },
  {
    id: 2,
    title: "Creative Design Services Agreement",
    description: "Perfect for UI/UX designers working with startups and agencies",
    author: "Arjun Patel",
    avatar: "",
    category: "Design",
    downloads: 892,
    likes: 67,
    rating: 4.6,
    tags: ["UI/UX", "Branding", "Creative"],
    uploadedAt: "1 week ago"
  },
  {
    id: 3,
    title: "Digital Marketing Retainer",
    description: "Monthly retainer contract for social media and SEO services",
    author: "Sneha Gupta",
    avatar: "",
    category: "Marketing",
    downloads: 634,
    likes: 45,
    rating: 4.7,
    tags: ["SEO", "Social Media", "Marketing"],
    uploadedAt: "3 days ago"
  }
];

const topContributors = [
  { name: "Priya Sharma", uploads: 12, downloads: 3421, avatar: "" },
  { name: "Arjun Patel", uploads: 8, downloads: 2156, avatar: "" },
  { name: "Sneha Gupta", uploads: 6, downloads: 1987, avatar: "" },
  { name: "Rahul Kumar", uploads: 5, downloads: 1543, avatar: "" },
  { name: "Anita Singh", uploads: 4, downloads: 1234, avatar: "" }
];

const Community = () => {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">Community Templates</h1>
            <p className="text-muted-foreground">Discover and share contract templates with the community</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 rounded-2xl" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Template
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search community templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-2xl"
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-5 rounded-2xl">
                <TabsTrigger value="all" className="rounded-xl">All</TabsTrigger>
                <TabsTrigger value="trending" className="rounded-xl">Trending</TabsTrigger>
                <TabsTrigger value="recent" className="rounded-xl">Recent</TabsTrigger>
                <TabsTrigger value="popular" className="rounded-xl">Popular</TabsTrigger>
                <TabsTrigger value="contributors" className="rounded-xl">
                  <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
                  Contributors
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-6">
                  {communityTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 rounded-2xl">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-lg font-heading">{template.title}</CardTitle>
                              <Badge variant="secondary">{template.category}</Badge>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{template.rating}</span>
                            </div>
                          </div>
                          <CardDescription className="mt-2 mb-3">{template.description}</CardDescription>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">{template.author.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{template.author}</span>
                            </div>
                            <span>•</span>
                            <span>{template.uploadedAt}</span>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Download className="h-4 w-4" />
                                <span>{template.downloads}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="h-4 w-4" />
                                <span>{template.likes}</span>
                              </div>
                              <div className="flex gap-1">
                                {template.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="rounded-xl">
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl">
                                <Download className="h-4 w-4 mr-1" />
                                Use
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="trending" className="mt-6">
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Trending Templates</h3>
                  <p className="text-muted-foreground">Templates gaining popularity this week</p>
                </div>
              </TabsContent>

              <TabsContent value="recent" className="mt-6">
                <div className="text-center py-12">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Recently Added</h3>
                  <p className="text-muted-foreground">Latest templates from the community</p>
                </div>
              </TabsContent>

              <TabsContent value="popular" className="mt-6">
                <div className="text-center py-12">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Most Popular</h3>
                  <p className="text-muted-foreground">All-time favorites from the community</p>
                </div>
              </TabsContent>

              <TabsContent value="contributors" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topContributors.map((contributor, index) => (
                    <motion.div
                      key={contributor.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="rounded-2xl h-full">
                        <CardContent className="p-4 flex items-center space-x-4">
                           <span className="text-lg font-bold text-muted-foreground w-6 text-center">
                            #{index + 1}
                          </span>
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-lg">{contributor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-md font-semibold truncate">{contributor.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {contributor.uploads} uploads • {contributor.downloads} downloads
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upload Your Template */}
            <Card className="rounded-2xl border-2 border-dashed border-primary/20">
              <CardContent className="p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Share Your Template</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Help the community by sharing your contract templates
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90 rounded-xl" onClick={() => setIsUploadDialogOpen(true)}>
                  Upload Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <UploadTemplateDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} />
    </DashboardLayout>
  );
};

export default Community;
