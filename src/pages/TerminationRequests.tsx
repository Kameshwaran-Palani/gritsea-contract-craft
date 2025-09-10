import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Search, FileText, Calendar, Check, X, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SEOHead from '@/components/SEOHead';
import DashboardLayout from '@/components/DashboardLayout';
import { Navigate } from 'react-router-dom';

interface TerminationRequest {
  id: string;
  contract_id?: string;
  document_id?: string;
  request_type: 'contract' | 'document';
  requested_by: 'client' | 'freelancer';
  client_name: string;
  client_email?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  item_title?: string;
}

interface SignedItem {
  id: string;
  title: string;
  type: 'contract' | 'document';
  client_name?: string;
  client_email?: string;
}

const TerminationRequests = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<TerminationRequest[]>([]);
  const [signedItems, setSignedItems] = useState<SignedItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SignedItem | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;

  useEffect(() => {
    if (user) {
      Promise.all([fetchTerminationRequests(), fetchSignedItems()]);
    }
  }, [user]);

  const fetchTerminationRequests = async () => {
    try {
      // Fetch termination requests and get related item titles separately
      const { data: requests, error } = await supabase
        .from('termination_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get titles for contracts and documents
      const formattedRequests = await Promise.all(
        requests.map(async (req) => {
          let item_title = 'Unknown Item';
          
          if (req.contract_id) {
            const { data: contract } = await supabase
              .from('contracts')
              .select('title')
              .eq('id', req.contract_id)
              .single();
            if (contract) item_title = contract.title;
          } else if (req.document_id) {
            const { data: document } = await supabase
              .from('uploaded_documents')
              .select('title')
              .eq('id', req.document_id)
              .single();
            if (document) item_title = document.title;
          }

          return {
            ...req,
            item_title
          };
        })
      );

      setRequests(formattedRequests as TerminationRequest[]);
    } catch (error: any) {
      console.error('Error fetching termination requests:', error);
      toast({
        title: "Error",
        description: "Failed to load termination requests",
        variant: "destructive"
      });
    }
  };

  const fetchSignedItems = async () => {
    try {
      // Fetch signed contracts
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('id, title, client_name, client_email')
        .eq('user_id', user?.id)
        .eq('status', 'signed');

      if (contractsError) throw contractsError;

      // Fetch signed documents
      const { data: documents, error: documentsError } = await supabase
        .from('uploaded_documents')
        .select('id, title, client_name, client_email')
        .eq('user_id', user?.id)
        .eq('status', 'signed');

      if (documentsError) throw documentsError;

      const combinedItems: SignedItem[] = [
        ...contracts.map(contract => ({
          id: contract.id,
          title: contract.title,
          type: 'contract' as const,
          client_name: contract.client_name,
          client_email: contract.client_email
        })),
        ...documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          type: 'document' as const,
          client_name: doc.client_name,
          client_email: doc.client_email
        }))
      ];

      setSignedItems(combinedItems);
    } catch (error: any) {
      console.error('Error fetching signed items:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleRequestTermination = async () => {
    if (!selectedItem || !reason.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('termination_requests')
        .insert({
          [selectedItem.type === 'contract' ? 'contract_id' : 'document_id']: selectedItem.id,
          request_type: selectedItem.type,
          requested_by: 'freelancer',
          client_name: selectedItem.client_name || 'Client',
          client_email: selectedItem.client_email,
          reason: reason.trim()
        });

      if (error) throw error;

      toast({
        title: "Termination Requested",
        description: "Your termination request has been submitted."
      });

      setShowRequestDialog(false);
      setSelectedItem(null);
      setReason('');
      await fetchTerminationRequests();
    } catch (error: any) {
      console.error('Error requesting termination:', error);
      toast({
        title: "Error",
        description: "Failed to submit termination request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('termination_requests')
        .update({ 
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Termination request has been ${status}.`
      });

      await fetchTerminationRequests();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive"
      });
    }
  };

  const filteredRequests = requests.filter(req =>
    req.item_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRequestedByBadge = (requestedBy: string) => {
    return requestedBy === 'client' ? (
      <Badge variant="secondary">Client Request</Badge>
    ) : (
      <Badge variant="outline">Freelancer Request</Badge>
    );
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <SEOHead 
        title="Termination Requests - Agrezy"
        description="Manage contract and document termination requests"
      />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Termination Requests</h1>
            <p className="text-muted-foreground">
              Manage contract and document termination requests
            </p>
          </div>

          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Request Termination
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Termination</DialogTitle>
                <DialogDescription>
                  Select a signed contract or document to request termination.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Item</label>
                  <Select onValueChange={(value) => {
                    const [type, id] = value.split(':');
                    const item = signedItems.find(item => item.id === id && item.type === type);
                    setSelectedItem(item || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a signed contract or document" />
                    </SelectTrigger>
                    <SelectContent>
                      {signedItems.map(item => (
                        <SelectItem key={`${item.type}:${item.id}`} value={`${item.type}:${item.id}`}>
                          {item.title} ({item.type === 'contract' ? 'Contract' : 'Document'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Reason for Termination</label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please explain why you want to terminate this contract/document..."
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRequestTermination}
                  disabled={!selectedItem || !reason.trim() || submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title, client, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No termination requests</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? 'No requests match your search criteria.' : 'No termination requests have been made yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">{request.item_title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {request.request_type === 'contract' ? 'Contract' : 'Document'}
                        </Badge>
                        {getRequestedByBadge(request.requested_by)}
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Client:</strong> {request.client_name}</p>
                        {request.client_email && (
                          <p><strong>Email:</strong> {request.client_email}</p>
                        )}
                        <p><strong>Reason:</strong> {request.reason}</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>

                    {request.status === 'pending' && request.requested_by === 'client' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'approved')}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TerminationRequests;