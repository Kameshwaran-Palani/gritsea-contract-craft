import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import SEOHead from '@/components/SEOHead';
import { generateContractCardImage } from '@/utils/contractCardImageGenerator';

interface Contract {
  id: string;
  title: string;
  status: string;
  client_name: string;
  contract_amount: number;
  created_at: string;
  signed_at: string;
  clauses_json: any;
}

interface UploadedDocument {
  id: string;
  title: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  status: string;
  client_name?: string;
  client_email?: string;
  created_at: string;
  signature_positions: any;
}

const ContractsTabbed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('draft');
  const [contractImages, setContractImages] = useState<{ [key: string]: string }>({});
  const [imagesLoading, setImagesLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadContracts();
    loadUploadedDocuments();

    const channel = supabase
      .channel('contracts-tabbed-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contracts' },
        (payload) => {
          console.log('Realtime change received!', payload);
          handleRealtimeChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (contracts.length > 0) {
      generateImagesForContracts();
    }
  }, [contracts]);

  const handleRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'INSERT') {
      const newContract = newRecord as Contract;
      setContracts((prevContracts) => [newContract, ...prevContracts]);
    } else if (eventType === 'UPDATE') {
      const updatedContract = newRecord as Contract;
      setContracts((prevContracts) =>
        prevContracts.map((contract) =>
          contract.id === updatedContract.id ? updatedContract : contract
        )
      );
      // Force image regeneration by removing the old one and setting loading state
      setContractImages(prev => {
        const newImages = { ...prev };
        delete newImages[updatedContract.id];
        return newImages;
      });
      setImagesLoading(prev => ({ ...prev, [updatedContract.id]: true }));
    } else if (eventType === 'DELETE') {
      const deletedContractId = oldRecord.id;
      setContracts((prevContracts) =>
        prevContracts.filter((contract) => contract.id !== deletedContractId)
      );
      setContractImages(prev => {
        const newImages = { ...prev };
        delete newImages[deletedContractId];
        return newImages;
      });
    }
  };

  const generateImagesForContracts = async () => {
    const imagePromises = contracts.map(async (contract) => {
      if (contractImages[contract.id] || !contract.clauses_json) {
        return;
      }
      
      setImagesLoading(prev => ({ ...prev, [contract.id]: true }));
      
      try {
        // Merge contract data with clauses_json to provide all details for image generation
        const contractDataForImage = { ...contract.clauses_json, ...contract };
        const imageDataUrl = await generateContractCardImage(contractDataForImage as any);
        if (imageDataUrl && imageDataUrl.length > 100) {
          setContractImages(prev => ({ ...prev, [contract.id]: imageDataUrl }));
        } else {
          console.error('Empty card image data for contract:', contract.id);
        }
      } catch (error) {
        console.error(`Error generating card image for ${contract.id}:`, error);
      } finally {
        setImagesLoading(prev => ({ ...prev, [contract.id]: false }));
      }
    });

    await Promise.all(imagePromises);
  };

  const loadContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load contracts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUploadedDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUploadedDocuments(data || []);
    } catch (error) {
      console.error('Error loading uploaded documents:', error);
      toast({
        title: "Error",
        description: "Failed to load uploaded documents",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId);
      
      if (error) throw error;
      
      setContracts(contracts.filter(c => c.id !== contractId));
      toast({
        title: "Contract Deleted",
        description: "Contract has been successfully deleted."
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent_for_signature':
        return 'bg-blue-100 text-blue-800';
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isContractExpired = (contract: Contract) => {
    if (!contract.clauses_json?.projectDeadline) return false;
    const deadline = new Date(contract.clauses_json.projectDeadline);
    return deadline < new Date();
  };

  const filterContractsByStatus = (status: string) => {
    const filteredContracts = contracts.filter(contract => {
      if (status === 'draft') {
        return ['draft', 'revision_requested', 'sent_for_signature'].includes(contract.status);
      }
      if (status === 'signed') {
        return contract.status === 'signed' && !isContractExpired(contract);
      }
      if (status === 'expired') {
        return contract.status === 'signed' && isContractExpired(contract);
      }
      return false;
    });

    const filteredDocuments = uploadedDocuments.filter(doc => {
      if (status === 'draft') {
        return ['draft', 'sent_for_signature'].includes(doc.status);
      }
      if (status === 'signed') {
        return doc.status === 'signed';
      }
      return false;
    });

    return { contracts: filteredContracts, documents: filteredDocuments };
  };

  const DocumentCard = ({ document }: { document: UploadedDocument }) => (
    <Card 
      key={document.id} 
      className="hover:shadow-lg transition-all duration-200 group cursor-pointer"
      onClick={() => navigate(`/document-edit/${document.id}`)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
              {document.title}
            </CardTitle>
          </div>
          <Badge className={getStatusColor(document.status)}>
            {document.status === 'sent_for_signature' ? 'Pending' : document.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{document.original_filename}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{document.client_name || 'No client specified'}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Uploaded {new Date(document.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          {document.status === 'draft' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/document-edit/${document.id}`)}
              className="flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              Configure & Send
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const ContractCard = ({ contract, showActions = true }: { contract: Contract; showActions?: boolean }) => (
    <Card 
      key={contract.id} 
      className="hover:shadow-lg transition-all duration-200 group cursor-pointer overflow-hidden"
      onClick={() => navigate(`/contract/view/${contract.id}`)}
    >
      <CardContent className="p-0">
        <div className="aspect-[400/565] bg-gray-50 overflow-hidden border-b">
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
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 text-center">
              <FileText className="h-12 w-12 mb-2" />
              <span className="text-sm font-medium">{contract.title}</span>
              <span className="text-xs mt-1">Preview not available</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                {contract.title}
              </CardTitle>
            </div>
            <Badge className={getStatusColor(contract.status)}>
              {contract.status === 'sent_for_signature' ? 'Pending' : 
               contract.status === 'revision_requested' ? 'Revision' : 
               contract.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{contract.client_name || 'No client specified'}</span>
          </div>
          
          {contract.contract_amount && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>${contract.contract_amount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Created {new Date(contract.created_at).toLocaleDateString()}</span>
          </div>

          {contract.signed_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Signed {new Date(contract.signed_at).toLocaleDateString()}</span>
            </div>
          )}

          {showActions && (
            <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
              {['draft', 'revision_requested'].includes(contract.status) && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/contract/edit/${contract.id}`)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteContract(contract.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const draftData = filterContractsByStatus('draft');
  const signedData = filterContractsByStatus('signed');
  const expiredData = filterContractsByStatus('expired');
  
  const totalDrafts = draftData.contracts.length + draftData.documents.length;
  const totalSigned = signedData.contracts.length + signedData.documents.length;
  const totalExpired = expiredData.contracts.length;

  return (
    <>
      <SEOHead 
        title="Contracts - Agrezy"
        description="Manage your contracts - drafts, signed agreements, and expired contracts"
      />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Contracts</h1>
              <p className="text-muted-foreground">
                Manage your contracts across different stages
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/contract/new')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Contract
              </Button>
              <Button 
                onClick={() => navigate('/document-upload')} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Upload Document
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="draft" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Draft ({totalDrafts})
              </TabsTrigger>
              <TabsTrigger value="signed" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Signed ({totalSigned})
              </TabsTrigger>
              <TabsTrigger value="expired" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Expired ({totalExpired})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draft" className="space-y-4">
              {totalDrafts === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No draft contracts or documents</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a contract or upload a document to get started
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => navigate('/contract/new')}>
                      Create Contract
                    </Button>
                    <Button onClick={() => navigate('/document-upload')} variant="outline">
                      Upload Document
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {draftData.contracts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Built Contracts ({draftData.contracts.length})</h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {draftData.contracts.map(contract => (
                          <ContractCard key={contract.id} contract={contract} showActions={true} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {draftData.documents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Uploaded Documents ({draftData.documents.length})</h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {draftData.documents.map(document => (
                          <DocumentCard key={document.id} document={document} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="signed" className="space-y-4">
              {totalSigned === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No signed contracts or documents</h3>
                  <p className="text-muted-foreground">
                    Contracts and documents that have been signed will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {signedData.contracts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Signed Contracts ({signedData.contracts.length})</h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {signedData.contracts.map(contract => (
                          <ContractCard key={contract.id} contract={contract} showActions={false} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {signedData.documents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Signed Documents ({signedData.documents.length})</h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {signedData.documents.map(document => (
                          <DocumentCard key={document.id} document={document} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="expired" className="space-y-4">
              {totalExpired === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No expired contracts</h3>
                  <p className="text-muted-foreground">
                    Contracts that have passed their deadline will appear here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {expiredData.contracts.map(contract => (
                    <ContractCard key={contract.id} contract={contract} showActions={false} />
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

export default ContractsTabbed;
