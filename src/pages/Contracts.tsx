import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Edit, Trash2, Eye } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import SEOHead from '@/components/SEOHead';

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

  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [user]);

  const loadContracts = async () => {
    try {
      setContractsLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Map the database status to our Contract interface status
        const mappedContracts = data.map(contract => ({
          ...contract,
          status: contract.status === 'sent' ? 'shared' : contract.status as 'draft' | 'signed' | 'shared'
        }));
        setContracts(mappedContracts);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load contracts",
        variant: "destructive"
      });
    } finally {
      setContractsLoading(false);
    }
  };

  const deleteContract = async (contractId: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'shared': return 'bg-blue-100 text-blue-800';
      case 'signed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate actual contract first page preview
  const generateContractCover = (contract: Contract) => {
    const getFontFamily = () => {
      switch (contract.font_family) {
        case 'serif': return 'Times, serif';
        case 'sans': return 'Arial, sans-serif';
        case 'mono': return 'Courier, monospace';
        default: return 'Inter, sans-serif';
      }
    };

    return (
      <div 
        className="w-full h-48 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm relative"
        style={{ 
          fontFamily: getFontFamily(),
          fontSize: '6px',
          lineHeight: '1.2',
          color: contract.primary_color || '#000000'
        }}
      >
        <div className="p-2 h-full flex flex-col">
          {/* Header with Logos */}
          <div className="flex items-center justify-between mb-2">
            {/* Left Logo */}
            <div className="w-4 h-4 flex items-center justify-start">
              {contract.left_logo && (
                <img 
                  src={contract.left_logo} 
                  alt="Left logo" 
                  className={`w-4 h-4 object-cover ${
                    contract.logo_style === 'round' ? 'rounded-full' : 'rounded-sm'
                  }`}
                />
              )}
            </div>

            {/* Center - Document Header */}
            <div className="text-center flex-1">
              <h1 className="text-xs font-bold uppercase tracking-wider mb-0.5">
                {contract.document_title || 'SERVICE AGREEMENT'}
              </h1>
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                {contract.document_subtitle || contract.title}
              </p>
              {contract.start_date && (
                <p className="text-xs text-gray-500 mt-1">
                  Effective: {new Date(contract.start_date).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Right Logo */}
            <div className="w-4 h-4 flex items-center justify-end">
              {contract.right_logo && (
                <img 
                  src={contract.right_logo} 
                  alt="Right logo" 
                  className={`w-4 h-4 object-cover ${
                    contract.logo_style === 'round' ? 'rounded-full' : 'rounded-sm'
                  }`}
                />
              )}
            </div>
          </div>

          <div className="border-b border-gray-800 mb-2"></div>

          {/* Agreement Introduction */}
          <div className="mb-2">
            <p className="text-justify text-xs leading-tight">
              This Service Agreement ("Agreement") is entered into on{' '}
              <span className="font-semibold underline">
                {contract.start_date ? new Date(contract.start_date).toLocaleDateString() : '____________'}
              </span>{' '}
              between the parties identified below.
            </p>
          </div>

          {/* Parties Section */}
          <div className="mb-3">
            <h2 className="text-xs font-bold uppercase mb-1 border-b border-gray-400 pb-0.5">
              1. PARTIES
            </h2>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <h3 className="font-bold text-xs uppercase mb-0.5 text-gray-700">Service Provider:</h3>
                <div className="space-y-0.5 text-xs">
                  {contract.freelancer_name && <p className="font-semibold">{contract.freelancer_name}</p>}
                  {contract.freelancer_business_name && <p className="italic">{contract.freelancer_business_name}</p>}
                  {contract.freelancer_address && <p className="truncate">{contract.freelancer_address}</p>}
                  {contract.freelancer_email && <p className="truncate">Email: {contract.freelancer_email}</p>}
                  {contract.freelancer_phone && <p>Phone: {contract.freelancer_phone}</p>}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-xs uppercase mb-0.5 text-gray-700">Client:</h3>
                <div className="space-y-0.5 text-xs">
                  {contract.client_name && <p className="font-semibold">{contract.client_name}</p>}
                  {contract.client_company && <p className="italic">{contract.client_company}</p>}
                  {contract.client_email && <p className="truncate">Email: {contract.client_email}</p>}
                  {contract.client_phone && <p>Phone: {contract.client_phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Scope of Work Preview */}
          <div className="mb-2 flex-1">
            <h2 className="text-xs font-bold uppercase mb-1 border-b border-gray-400 pb-0.5">
              2. SCOPE OF WORK
            </h2>
            
            <h3 className="font-semibold mb-1 text-xs">2.1 Services Description</h3>
            <p className="text-justify text-xs leading-tight">
              {contract.services ? contract.services.substring(0, 200) + (contract.services.length > 200 ? '...' : '') : 'Services to be defined...'}
            </p>
          </div>

          {/* Payment Terms Preview */}
          {(contract.rate > 0 || contract.total_amount || contract.contract_amount) && (
            <div className="mt-auto">
              <div className="bg-gray-50 p-1 rounded text-xs">
                <p className="font-semibold">Payment:</p>
                <p className="font-bold text-gray-800">
                  ₹{(contract.total_amount || contract.contract_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-1 border-t border-gray-300 mt-1">
            <p>Generated by Agrezy</p>
          </div>
        </div>
      </div>
    );
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
                    <div className="h-48 bg-muted rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded flex-1"></div>
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
                  <Card className="hover:shadow-lg transition-all duration-200 group">
                    <CardContent className="p-4">
                      {/* Actual Contract Cover Preview */}
                      <div className="mb-4 cursor-pointer" onClick={() => navigate(`/contract/${contract.id}`)}>
                        {generateContractCover(contract)}
                      </div>
                      
                      {/* Contract Info */}
                      <div className="space-y-3">
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
                            onClick={() => navigate(`/contract/${contract.id}`)}
                            className="flex items-center gap-1 flex-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/contract/edit/${contract.id}`)}
                            className="flex items-center gap-1 flex-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteContract(contract.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
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
