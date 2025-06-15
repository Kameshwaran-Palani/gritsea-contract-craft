import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import SEOHead from '@/components/SEOHead';
import { generateContractCoverImage } from '@/utils/contractImageGenerator';
import { generateContractCardImage } from '@/utils/contractCardImageGenerator';

interface Contract {
  id: string;
  title: string;
  status: 'draft' | 'signed' | 'shared';
  client_name: string;
  client_email: string;
  contract_amount: number;
  created_at: string;
  updated_at: string;
  // Contract data fields for preview
  freelancer_name?: string;
  freelancer_business_name?: string;
  freelancer_address?: string;
  freelancer_email?: string;
  freelancer_phone?: string;
  client_company?: string;
  client_phone?: string;
  services?: string;
  deliverables?: string;
  rate?: number;
  total_amount?: number;
  payment_type?: string;
  start_date?: string;
  document_title?: string;
  document_subtitle?: string;
  primary_color?: string;
  font_family?: string;
  font_size?: string;
  left_logo?: string;
  right_logo?: string;
  logo_style?: string;
}

const Contracts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [contractImages, setContractImages] = useState<{[key: string]: string}>({});
  const [imagesLoading, setImagesLoading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [user]);

  // Generate images for contracts when they're loaded
  useEffect(() => {
    if (contracts.length > 0) {
      console.log('📋 Contracts loaded, generating images for', contracts.length, 'contracts');
      generateImagesForContracts();
    }
  }, [contracts]);

  const generateImagesForContracts = async () => {
    console.log('🎨 Starting batch image generation for all contracts');
    
    // Generate images one by one to avoid overwhelming the browser
    for (const contract of contracts) {
      if (contractImages[contract.id]) {
        console.log('⏭️ Image already exists for contract:', contract.id);
        continue;
      }
      
      console.log('🔄 Generating image for contract:', contract.id, '- Title:', contract.title);
      setImagesLoading(prev => ({ ...prev, [contract.id]: true }));
      
      try {
        // Add a small delay between generations to prevent browser lock-up
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const imageDataUrl = await generateContractCoverImage(contract);
        if (imageDataUrl && imageDataUrl.length > 100) {
          console.log('✅ Image generated successfully for contract:', contract.id, 'Size:', imageDataUrl.length);
          setContractImages(prev => ({ ...prev, [contract.id]: imageDataUrl }));
        } else {
          console.error('❌ Empty or invalid image data URL for contract:', contract.id);
        }
      } catch (error) {
        console.error(`❌ Error generating image for contract ${contract.id}:`, error);
      } finally {
        setImagesLoading(prev => ({ ...prev, [contract.id]: false }));
      }
    }
    
    console.log('🏁 Batch image generation completed');
  };

  // Generate optimized card images when contracts are loaded
  useEffect(() => {
    if (contracts.length > 0) {
      console.log('📋 Contracts loaded, generating FAST card images for', contracts.length, 'contracts');
      generateCardImagesForContracts();
    }
  }, [contracts]);

  const generateCardImagesForContracts = async () => {
    console.log('🎨 Starting FAST batch card image generation');
    
    // Generate card images in parallel for speed (they're smaller now)
    const imagePromises = contracts.map(async (contract) => {
      if (contractImages[contract.id]) {
        console.log('⏭️ Card image already exists for contract:', contract.id);
        return;
      }
      
      console.log('🔄 Generating FAST card image for:', contract.id, '- Title:', contract.title);
      setImagesLoading(prev => ({ ...prev, [contract.id]: true }));
      
      try {
        const imageDataUrl = await generateContractCardImage(contract);
        if (imageDataUrl && imageDataUrl.length > 100) {
          console.log('✅ FAST card image generated for:', contract.id, 'Size:', imageDataUrl.length);
          setContractImages(prev => ({ ...prev, [contract.id]: imageDataUrl }));
        } else {
          console.error('❌ Empty card image data for contract:', contract.id);
        }
      } catch (error) {
        console.error(`❌ Error generating card image for ${contract.id}:`, error);
      } finally {
        setImagesLoading(prev => ({ ...prev, [contract.id]: false }));
      }
    });

    // Wait for all card images to complete
    await Promise.all(imagePromises);
    console.log('🏁 FAST batch card image generation completed');
  };

  const loadContracts = async () => {
    try {
      setContractsLoading(true);
      console.log('📡 Loading contracts for user:', user?.id);
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        console.log('📋 Loaded', data.length, 'contracts from database');
        // Map the database status to our Contract interface status
        const mappedContracts = data.map(contract => ({
          ...contract,
          status: contract.status === 'sent' ? 'shared' : contract.status as 'draft' | 'signed' | 'shared'
        }));
        setContracts(mappedContracts);
      }
    } catch (error) {
      console.error('❌ Error loading contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load contracts",
        variant: "destructive"
      });
    } finally {
      setContractsLoading(false);
    }
  };

  const deleteContract = async (contractId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setContracts(prev => prev.filter(contract => contract.id !== contractId));
      toast({
        title: "Contract Deleted",
        description: "Contract has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast({
        title: "Error",
        description: "Failed to delete contract",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (contractId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/contract/edit/${contractId}`);
  };

  const handleCardClick = (contractId: string) => {
    navigate(`/contract/view/${contractId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'shared': return 'bg-blue-100 text-blue-800';
      case 'signed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    <>
      <SEOHead 
        title="My Contracts - Agrezy"
        description="Manage all your contracts in one place"
      />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Contracts</h1>
              <p className="text-muted-foreground mt-1">Manage all your contracts in one place</p>
            </div>
            <Button
              onClick={() => navigate('/contract/new')}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create New Contract
            </Button>
          </div>

          {contractsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="aspect-[794/1123] bg-muted rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded flex-1"></div>
                        <div className="h-8 bg-muted rounded flex-1"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contracts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first professional contract to get started
                </p>
                <Button
                  onClick={() => navigate('/contract/new')}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Contract
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer overflow-hidden">
                    <CardContent className="p-0">
                      {/* Optimized Contract Card Image */}
                      <div 
                        className="cursor-pointer aspect-[400/565] bg-gray-50 overflow-hidden border-b" 
                        onClick={() => handleCardClick(contract.id)}
                      >
                        {imagesLoading[contract.id] ? (
                          <div className="w-full h-full flex items-center justify-center bg-muted animate-pulse">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                              <span className="text-xs text-muted-foreground">Loading preview...</span>
                            </div>
                          </div>
                        ) : contractImages[contract.id] ? (
                          <img 
                            src={contractImages[contract.id]} 
                            alt={`${contract.title} preview`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              console.error('❌ Error loading contract card image:', contract.id);
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-content');
                              if (fallback) {
                                (fallback as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        
                        {/* Fallback content */}
                        {!imagesLoading[contract.id] && !contractImages[contract.id] && (
                          <div className="fallback-content w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
                            <FileText className="h-12 w-12 mb-2" />
                            <span className="text-sm font-medium">{contract.title}</span>
                            <span className="text-xs">Click to view contract</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Contract Info */}
                      <div className="p-4 space-y-3">
                        {/* Title and Status */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                              {contract.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Client: {contract.client_name || 'Not specified'}
                            </p>
                          </div>
                          <Badge className={getStatusColor(contract.status)}>
                            {contract.status}
                          </Badge>
                        </div>

                        {/* Amount and Date */}
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Amount:</span> ₹{contract.contract_amount?.toLocaleString() || 0}
                          </div>
                          <div className="text-muted-foreground">
                            Created: {new Date(contract.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleEdit(contract.id, e)}
                            className="flex items-center gap-2 flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => deleteContract(contract.id, e)}
                            className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Contracts;
