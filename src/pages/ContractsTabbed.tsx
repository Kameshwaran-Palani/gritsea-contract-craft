
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Eye
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import SEOHead from '@/components/SEOHead';

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

const ContractsTabbed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('draft');

  useEffect(() => {
    loadContracts();
  }, []);

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
    return contracts.filter(contract => {
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
  };

  const ContractCard = ({ contract, showActions = true }: { contract: Contract; showActions?: boolean }) => (
    <Card 
      key={contract.id} 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/contract/view/${contract.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{contract.title}</CardTitle>
          <Badge className={getStatusColor(contract.status)}>
            {contract.status === 'sent_for_signature' ? 'Pending' : 
             contract.status === 'revision_requested' ? 'Revision' : 
             contract.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/contract/view/${contract.id}`)}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              View
            </Button>
            
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

  const draftContracts = filterContractsByStatus('draft');
  const signedContracts = filterContractsByStatus('signed');
  const expiredContracts = filterContractsByStatus('expired');

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
            <Button onClick={() => navigate('/contract/new')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Contract
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="draft" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Draft ({draftContracts.length})
              </TabsTrigger>
              <TabsTrigger value="signed" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Signed ({signedContracts.length})
              </TabsTrigger>
              <TabsTrigger value="expired" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Expired ({expiredContracts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draft" className="space-y-4">
              {draftContracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No draft contracts</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first contract to get started
                  </p>
                  <Button onClick={() => navigate('/contract/new')}>
                    Create Contract
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {draftContracts.map(contract => (
                    <ContractCard key={contract.id} contract={contract} showActions={true} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="signed" className="space-y-4">
              {signedContracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No signed contracts</h3>
                  <p className="text-muted-foreground">
                    Contracts that have been signed will appear here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {signedContracts.map(contract => (
                    <ContractCard key={contract.id} contract={contract} showActions={false} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="expired" className="space-y-4">
              {expiredContracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No expired contracts</h3>
                  <p className="text-muted-foreground">
                    Contracts that have passed their deadline will appear here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {expiredContracts.map(contract => (
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
