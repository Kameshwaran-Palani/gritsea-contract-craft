
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit, Trash, Eye, Calendar, DollarSign, User } from 'lucide-react';
import { generateContractCardImage } from '@/utils/contractCardImageGenerator';
import SEOHead from '@/components/SEOHead';
import { useToast } from '@/hooks/use-toast';

interface Contract {
  id: string;
  title: string;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  client_name: string;
  client_email: string;
  contract_amount: number;
  created_at: string;
  updated_at: string;
}

const Contracts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load contracts",
        variant: "destructive"
      });
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleCreateContract = () => {
    navigate('/contract/new');
  };

  const handleViewContract = (id: string) => {
    navigate(`/contract/view/${id}`);
  };

  const handleEditContract = (id: string) => {
    navigate(`/contract/edit/${id}`);
  };

  const handleDeleteContract = async (id: string) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      setDeletingId(id);
      try {
        const { error } = await supabase
          .from('contracts')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        setContracts(contracts.filter(contract => contract.id !== id));
        toast({
          title: "Contract Deleted",
          description: "The contract has been successfully deleted."
        });
      } catch (error) {
        console.error('Error deleting contract:', error);
        toast({
          title: "Error",
          description: "Failed to delete contract",
          variant: "destructive"
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      sent: "secondary", 
      signed: "default",
      cancelled: "destructive"
    };
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
        description="Manage your service contracts and agreements"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Agrezy
                </span>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">3 free contracts left</span>
                <Button variant="ghost" size="sm">
                  {user.user_metadata?.full_name || user.email}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Contracts</h1>
                <p className="text-gray-500 mt-1">Manage your service contracts and agreements</p>
              </div>
              <Button onClick={handleCreateContract} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Contract</span>
              </Button>
            </div>

            {/* Contracts List */}
            {loadingContracts ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : contracts.length === 0 ? (
              <Card className="bg-white shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
                  <p className="text-gray-500 text-center max-w-md mb-6">
                    Create your first contract to get started. You can create professional service agreements in minutes.
                  </p>
                  <Button onClick={handleCreateContract} className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Create Contract</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contracts.map((contract) => (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                      <div 
                        className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative"
                        style={{
                          backgroundImage: `url(${generateContractCardImage(contract)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(contract.status)}
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {contract.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Created {new Date(contract.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">{contract.client_name || 'No client'}</span>
                        </div>
                        
                        {contract.contract_amount > 0 && (
                          <div className="flex items-center text-sm">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">₹{contract.contract_amount.toLocaleString()}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewContract(contract.id)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </Button>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditContract(contract.id)}
                              className="flex items-center space-x-1 text-blue-600"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteContract(contract.id)}
                              disabled={deletingId === contract.id}
                              className="flex items-center space-x-1 text-red-600"
                            >
                              <Trash className="w-3 h-3" />
                              <span>{deletingId === contract.id ? 'Deleting...' : 'Delete'}</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Contracts;
