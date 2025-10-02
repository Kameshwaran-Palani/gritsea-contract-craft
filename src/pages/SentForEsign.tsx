import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, FileText, Search, Download, ExternalLink, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SEOHead from '@/components/SEOHead';
import { Link, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

interface ESignItem {
  id: string;
  title: string;
  type: 'contract' | 'document';
  status: string;
  client_name?: string;
  client_email?: string;
  created_at: string;
  updated_at: string;
  signed_at?: string;
  public_link_id?: string;
}

const SentForEsign = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ESignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchESignItems = async () => {
    try {
      // Fetch contracts sent for signature (only pending signature, not signed)
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'sent_for_signature')
        .order('updated_at', { ascending: false });

      if (contractsError) throw contractsError;

      // Fetch uploaded documents sent for signature (only pending signature, not signed)
      const { data: documents, error: documentsError } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'sent_for_signature')
        .order('updated_at', { ascending: false });

      if (documentsError) throw documentsError;

      // Combine and format data
      const combinedItems: ESignItem[] = [
        ...contracts.map(contract => ({
          id: contract.id,
          title: contract.title,
          type: 'contract' as const,
          status: contract.status,
          client_name: contract.client_name,
          client_email: contract.client_email,
          created_at: contract.created_at,
          updated_at: contract.updated_at,
          signed_at: contract.signed_at,
          public_link_id: contract.public_link_id
        })),
        ...documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          type: 'document' as const,
          status: doc.status,
          client_name: doc.client_name,
          client_email: doc.client_email,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          signed_at: doc.signed_at,
          public_link_id: doc.public_link_id
        }))
      ];

      // Sort by updated_at
      combinedItems.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      setItems(combinedItems);
    } catch (error: any) {
      console.error('Error fetching e-sign items:', error);
      toast({
        title: "Error",
        description: "Failed to load e-sign items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchESignItems();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" />;

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.client_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent_for_signature':
        return <Badge variant="outline" className="text-blue-600">Pending Signature</Badge>;
      case 'signed':
        return <Badge variant="default" className="bg-green-600">Signed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewPublicLink = (item: ESignItem) => {
    if (item.public_link_id) {
      const url = item.type === 'contract' 
        ? `/contract-secure-view/${item.public_link_id}`
        : `/document-sign/${item.public_link_id}`;
      window.open(url, '_blank');
    }
  };

  return (
    <DashboardLayout>
      <SEOHead 
        title="Sent for E-sign - Agrezy"
        description="Track contracts and documents sent for electronic signature"
      />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sent for E-sign</h1>
            <p className="text-muted-foreground">
              Track contracts and documents sent for electronic signature
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title, client name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? 'No items match your search criteria.' : 'No contracts or documents have been sent for signature yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card key={`${item.type}-${item.id}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {item.type === 'contract' ? 'Contract' : 'Document'}
                        </Badge>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {item.client_name && (
                          <p><strong>Client:</strong> {item.client_name}</p>
                        )}
                        {item.client_email && (
                          <p><strong>Email:</strong> {item.client_email}</p>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Sent {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                          </div>
                          {item.signed_at && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Calendar className="h-4 w-4" />
                              <span>Signed {formatDistanceToNow(new Date(item.signed_at), { addSuffix: true })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={item.type === 'contract' ? `/contract-edit/${item.id}` : `/document-edit/${item.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      
                      {item.public_link_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPublicLink(item)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Public Link
                        </Button>
                      )}
                    </div>
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

export default SentForEsign;