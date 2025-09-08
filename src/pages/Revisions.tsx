import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  FileText, 
  Clock, 
  MessageSquare, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import SEOHead from '@/components/SEOHead';

interface RevisionRequest {
  id: string;
  contract_id: string;
  message: string;
  client_name: string;
  client_email: string;
  created_at: string;
  resolved: boolean;
  contracts: {
    title: string;
    status: string;
  };
}

const Revisions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [revisionRequests, setRevisionRequests] = useState<RevisionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRevisionRequests();
    }
  }, [user]);

  const fetchRevisionRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('revision_requests')
        .select(`
          *,
          contracts!inner(title, status, user_id)
        `)
        .eq('contracts.user_id', user?.id)
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRevisionRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching revision requests:', error);
      toast({
        title: "Error",
        description: "Failed to load revision requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('revision_requests')
        .update({ resolved: true })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Resolved",
        description: "Revision request marked as resolved"
      });

      fetchRevisionRequests();
    } catch (error: any) {
      console.error('Error resolving request:', error);
      toast({
        title: "Error",
        description: "Failed to resolve request",
        variant: "destructive"
      });
    }
  };

  const handleEditContract = (contractId: string) => {
    navigate(`/contract-edit/${contractId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEOHead 
        title="Revision Requests - Agrezy Dashboard"
        description="Manage and respond to contract revision requests from clients."
      />
      
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Revision Requests</h1>
          <p className="text-muted-foreground mt-2">
            Review and address client feedback on your contracts
          </p>
        </div>

        {revisionRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Revision Requests</h3>
              <p className="text-muted-foreground text-center max-w-md">
                When clients request changes to your contracts, they'll appear here for you to review and address.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {revisionRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {request.contracts.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(request.created_at)}
                        </div>
                        <div>
                          From: {request.client_name} ({request.client_email})
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-orange-300 text-orange-600">
                      Needs Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Client Feedback:</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm">{request.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => handleEditContract(request.contract_id)}
                      className="flex items-center gap-2"
                    >
                      Edit Contract
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleResolveRequest(request.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Resolved
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Revisions;