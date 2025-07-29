import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Edit, Trash2, Upload } from 'lucide-react';
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

interface UploadedDocument {
  id: string;
  title: string;
  original_filename: string;
  file_url: string;
  status: 'draft' | 'sent_for_signature' | 'signed';
  client_name?: string;
  client_email?: string;
  signature_positions: any[];
  created_at: string;
  updated_at: string;
}

const Contracts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [contractImages, setContractImages] = useState<{[key: string]: string}>({});
  const [imagesLoading, setImagesLoading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (user) {
      loadContracts();
      loadUploadedDocuments();
    }
  }, [user]);

  const loadUploadedDocuments = async () => {
    try {
      setDocumentsLoading(true);
      console.log('📡 Loading uploaded documents for user:', user?.id);
      
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        console.log('📋 Loaded', data.length, 'uploaded documents from database');
        const mappedDocuments = data.map(doc => ({
          id: doc.id,
          title: doc.title,
          original_filename: doc.original_filename,
          file_url: doc.file_url,
          status: doc.status as 'draft' | 'sent_for_signature' | 'signed',
          client_name: doc.client_name || undefined,
          client_email: doc.client_email || undefined,
          signature_positions: Array.isArray(doc.signature_positions) ? doc.signature_positions : [],
          created_at: doc.created_at,
          updated_at: doc.updated_at
        }));
        setUploadedDocuments(mappedDocuments);
      }
    } catch (error) {
      console.error('❌ Error loading uploaded documents:', error);
      toast({
        title: "Error",
        description: "Failed to load uploaded documents",
        variant: "destructive"
      });
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Generate images for contracts when they're loaded
  useEffect(() => {
    if (contracts.length > 0) {
      console.log('📋 Contracts loaded, generating images for', contracts.length, 'contracts');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'shared': return 'bg-blue-100 text-blue-800';
      case 'signed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContractCard = (contract: Contract) => (
    <motion.div
      key={contract.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer overflow-hidden">
        <CardContent className="p-0">
          {/* Contract Card Image */}
          <div 
            className="cursor-pointer aspect-[400/565] bg-gray-50 overflow-hidden border-b" 
            onClick={() => navigate(`/contract/${contract.id}`)}
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
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
                <FileText className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium">{contract.title}</span>
                <span className="text-xs">Click to view contract</span>
              </div>
            )}
          </div>
          
          {/* Contract Info */}
          <div className="p-4 space-y-3">
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

            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium">Amount:</span> ₹{contract.contract_amount?.toLocaleString() || 0}
              </div>
              <div className="text-muted-foreground">
                Created: {new Date(contract.created_at).toLocaleDateString()}
              </div>
            </div>
            
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
                className="px-3 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
    <>
      <SEOHead 
        title="My Contracts - Agrezy"
        description="Manage all your contracts in one place"
      />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Documents</h1>
              <p className="text-muted-foreground mt-1">Manage all your contracts and documents in one place</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/document/upload')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
              <Button
                onClick={() => navigate('/contract/new')}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Create Contract
              </Button>
            </div>
          </div>

          <Tabs defaultValue="draft" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="draft">
                Draft ({contracts.filter(c => c.status === 'draft').length})
              </TabsTrigger>
              <TabsTrigger value="signed">
                Signed ({contracts.filter(c => c.status === 'signed').length})
              </TabsTrigger>
              <TabsTrigger value="expired">
                Expired (0)
              </TabsTrigger>
              <TabsTrigger value="uploaded">
                Uploaded ({uploadedDocuments.length})
              </TabsTrigger>
            </TabsList>

            {/* Draft Contracts Tab */}
            <TabsContent value="draft" className="space-y-4">
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
              ) : contracts.filter(c => c.status === 'draft').length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No draft contracts</h3>
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
                  {contracts.filter(c => c.status === 'draft').map(renderContractCard)}
                </div>
              )}
            </TabsContent>

            {/* Signed Contracts Tab */}
            <TabsContent value="signed" className="space-y-4">
              {contracts.filter(c => c.status === 'signed').length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No signed contracts</h3>
                    <p className="text-muted-foreground">
                      Signed contracts will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {contracts.filter(c => c.status === 'signed').map(renderContractCard)}
                </div>
              )}
            </TabsContent>

            {/* Expired Contracts Tab */}
            <TabsContent value="expired" className="space-y-4">
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No expired contracts</h3>
                  <p className="text-muted-foreground">
                    Expired contracts will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Uploaded Documents Tab */}
            <TabsContent value="uploaded" className="space-y-4">
              {documentsLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="aspect-[3/4] bg-muted rounded mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="flex gap-2">
                            <div className="h-8 bg-muted rounded flex-1"></div>
                            <div className="h-8 bg-muted rounded w-8"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : uploadedDocuments.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No uploaded documents</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload your first document to get started with eSignatures
                    </p>
                    <Button
                      onClick={() => navigate('/document/upload')}
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Your First Document
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {uploadedDocuments.map((document) => (
                    <motion.div
                      key={document.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer overflow-hidden">
                        <CardContent className="p-0">
                          {/* Document Preview */}
                          <div 
                            className="cursor-pointer aspect-[3/4] bg-gray-50 overflow-hidden border-b flex items-center justify-center"
                            onClick={() => navigate(`/document/edit/${document.id}`)}
                          >
                            <div className="text-center p-4">
                              <FileText className="h-16 w-16 text-primary mx-auto mb-2" />
                              <p className="text-sm font-medium text-foreground truncate">
                                {document.original_filename}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {document.signature_positions?.length || 0} signature{(document.signature_positions?.length || 0) !== 1 ? 's' : ''} marked
                              </p>
                            </div>
                          </div>
                          
                          {/* Document Info */}
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                                  {document.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Client: {document.client_name || 'Not specified'}
                                </p>
                              </div>
                              <Badge className={getStatusColor(document.status === 'sent_for_signature' ? 'shared' : document.status)}>
                                {document.status === 'sent_for_signature' ? 'shared' : document.status}
                              </Badge>
                            </div>

                            <div className="text-sm space-y-1">
                              <div className="text-muted-foreground">
                                Created: {new Date(document.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/document/edit/${document.id}`);
                                }}
                                className="flex items-center gap-2 flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                                Configure
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const { error } = await supabase
                                      .from('uploaded_documents')
                                      .delete()
                                      .eq('id', document.id);
                                    
                                    if (error) throw error;
                                    
                                    setUploadedDocuments(prev => prev.filter(d => d.id !== document.id));
                                    toast({
                                      title: "Document Deleted",
                                      description: "Document has been deleted successfully."
                                    });
                                  } catch (error) {
                                    console.error('Error deleting document:', error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to delete document",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                                className="px-3 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Contracts;