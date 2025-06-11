
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Search, 
  Star, 
  Eye, 
  Code,
  Palette,
  PenTool,
  Megaphone,
  Smartphone,
  Video,
  Globe,
  Users,
  Calculator,
  Camera
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const templateCategories = [
  {
    id: 'web-developer',
    name: 'Web Developer',
    icon: Code,
    description: 'Full-stack development contracts',
    price: '₹25,000 - ₹150,000',
    popular: true,
    preview: '/lovable-uploads/f0f24f10-3a69-457a-9030-f7d3b296c61f.png'
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    icon: Palette,
    description: 'Design and user experience services',
    price: '₹15,000 - ₹80,000',
    popular: true,
    preview: '/lovable-uploads/ece41733-256f-4385-8389-e60688b636b0.png'
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    icon: PenTool,
    description: 'Blog posts, articles, and copywriting',
    price: '₹5,000 - ₹30,000',
    popular: false,
    preview: '/lovable-uploads/752d5555-b5d5-4820-84cd-a4206196b8e0.png'
  },
  {
    id: 'digital-marketer',
    name: 'Digital Marketer',
    icon: Megaphone,
    description: 'SEO, social media, and online campaigns',
    price: '₹10,000 - ₹50,000',
    popular: true,
    preview: '/lovable-uploads/f0f24f10-3a69-457a-9030-f7d3b296c61f.png'
  },
  {
    id: 'app-developer',
    name: 'App Developer',
    icon: Smartphone,
    description: 'Mobile app development services',
    price: '₹50,000 - ₹300,000',
    popular: false,
    preview: '/lovable-uploads/ece41733-256f-4385-8389-e60688b636b0.png'
  },
  {
    id: 'video-editor',
    name: 'Video Editor',
    icon: Video,
    description: 'Video production and editing',
    price: '₹8,000 - ₹40,000',
    popular: false,
    preview: '/lovable-uploads/752d5555-b5d5-4820-84cd-a4206196b8e0.png'
  },
  {
    id: 'translator',
    name: 'Translator',
    icon: Globe,
    description: 'Language translation services',
    price: '₹3,000 - ₹20,000',
    popular: false,
    preview: '/lovable-uploads/f0f24f10-3a69-457a-9030-f7d3b296c61f.png'
  },
  {
    id: 'virtual-assistant',
    name: 'Virtual Assistant',
    icon: Users,
    description: 'Administrative and support services',
    price: '₹5,000 - ₹25,000',
    popular: false,
    preview: '/lovable-uploads/ece41733-256f-4385-8389-e60688b636b0.png'
  },
  {
    id: 'consultant',
    name: 'Business Consultant',
    icon: Calculator,
    description: 'Strategic business advisory',
    price: '₹20,000 - ₹100,000',
    popular: false,
    preview: '/lovable-uploads/752d5555-b5d5-4820-84cd-a4206196b8e0.png'
  },
  {
    id: 'photographer',
    name: 'Photographer',
    icon: Camera,
    description: 'Photography and visual content',
    price: '₹8,000 - ₹50,000',
    popular: false,
    preview: '/lovable-uploads/f0f24f10-3a69-457a-9030-f7d3b296c61f.png'
  }
];

const Templates = () => {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const filteredTemplates = templateCategories.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-foreground font-heading">Contract Templates</h1>
            <p className="text-muted-foreground">Choose from professionally crafted templates for your industry</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 rounded-2xl">
            <Link to="/contract/new">
              <FileText className="mr-2 h-4 w-4" />
              Create Custom
            </Link>
          </Button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-2xl"
            />
          </div>
        </motion.div>

        {/* Template Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl">
            <TabsTrigger value="all" className="rounded-xl">All Templates</TabsTrigger>
            <TabsTrigger value="popular" className="rounded-xl">Popular</TabsTrigger>
            <TabsTrigger value="saved" className="rounded-xl">Your Saved</TabsTrigger>
            <TabsTrigger value="community" className="rounded-xl">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredTemplates.map((template, index) => {
                const Icon = template.icon;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 rounded-2xl border-2 hover:border-primary/20 overflow-hidden">
                      {/* Template Preview Image */}
                      <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                        <img 
                          src={template.preview} 
                          alt={template.name}
                          className="w-full h-full object-cover opacity-80"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-heading">{template.name}</CardTitle>
                            {template.popular && (
                              <Badge variant="secondary" className="mt-1">
                                <Star className="w-3 h-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardDescription className="mt-3">{template.description}</CardDescription>
                        <div className="text-sm font-medium text-primary mt-2">{template.price}</div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                            asChild
                          >
                            <Link to={`/contract/new?template=${template.id}`}>
                              Use Template
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl"
                            onClick={() => setPreviewTemplate(template.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>

          <TabsContent value="popular" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredTemplates.filter(t => t.popular).map((template, index) => {
                const Icon = template.icon;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 rounded-2xl border-2 hover:border-primary/20 overflow-hidden">
                      {/* Template Preview Image */}
                      <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                        <img 
                          src={template.preview} 
                          alt={template.name}
                          className="w-full h-full object-cover opacity-80"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-heading">{template.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="mt-3">{template.description}</CardDescription>
                        <div className="text-sm font-medium text-primary mt-2">{template.price}</div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                            asChild
                          >
                            <Link to={`/contract/new?template=${template.id}`}>
                              Use Template
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl"
                            onClick={() => setPreviewTemplate(template.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Saved Templates</h3>
              <p className="text-muted-foreground mb-6">Templates you save will appear here for quick access.</p>
              <Button variant="outline" className="rounded-2xl">Browse All Templates</Button>
            </div>
          </TabsContent>

          <TabsContent value="community" className="mt-6">
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Community Templates</h3>
              <p className="text-muted-foreground mb-6">Discover templates shared by other users in the community.</p>
              <Button variant="outline" className="rounded-2xl">Coming Soon</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Templates;
