
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  User,
  Download,
  Share
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import SEOHead from '@/components/SEOHead';

interface Contract {
  id: string;
  title: string;
  status: 'draft' | 'shared' | 'signed';
  client_name: string;
  client_email: string;
  contract_amount: number;
  created_at: string;
  updated_at: string;
}

const Contracts = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingContracts, setLoadingContracts] = useState(true);

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
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'shared':
        return <Badge variant="secondary">Shared</Badge>;
      case 'signed':
        return <Badge variant="default" className="bg-success">Signed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.client_name.toLowerCase().includes(searchTerm.toLowerCase())
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
        description="Manage all your service contracts in one place"
      />
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Contracts</h1>
              <p className="text-muted-foreground">Manage and track all your service agreements</p>
            </div>
            <Link to="/contract/new">
              <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Create Contract
              </Button>
            </Link>
          </motion.div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contracts by name or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Contracts ({filteredContracts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingContracts ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No contracts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first contract'}
                  </p>
                  <Link to="/contract/new">
                    <Button>Create Your First Contract</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contract</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{contract.title}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {contract.id.slice(0, 8)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{contract.client_name}</div>
                              <div className="text-sm text-muted-foreground">{contract.client_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">₹{contract.contract_amount?.toLocaleString() || '0'}</span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(contract.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(contract.updated_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/contract/view/${contract.id}`} className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/contract/edit/${contract.id}`} className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Download className="h-4 w-4" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Share className="h-4 w-4" />
                                  Share Link
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 text-destructive"
                                  onClick={() => deleteContract(contract.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Contracts;
