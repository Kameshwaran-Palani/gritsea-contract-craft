
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Share, Edit, Calendar, User, DollarSign, Clock } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  client_name: string;
  client_email: string;
  contract_amount: number;
  payment_type: string;
  project_timeline: string;
  scope_of_work: string;
  payment_terms: string;
  created_at: string;
  updated_at: string;
}

const ContractView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loadingContract, setLoadingContract] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchContract();
    }
  }, [user, id]);

  const fetchContract = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setContract(data);
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoadingContract(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      sent: "secondary", 
      signed: "default",
      cancelled: "destructive"
    };
    const colors: Record<string, string> = {
      draft: "text-muted-foreground",
      sent: "text-secondary",
      signed: "text-success",
      cancelled: "text-destructive"
    };
    return (
      <Badge variant={variants[status] || "outline"} className={`capitalize ${colors[status]}`}>
        {status}
      </Badge>
    );
  };

  if (loading || loadingContract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Contract Not Found</h2>
          <p className="text-muted-foreground mb-6">The contract you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/contracts')}>Back to Contracts</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/contracts')}
                className="rounded-2xl"
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold font-heading">{contract.title}</h1>
                <p className="text-muted-foreground">Contract ID: {contract.id.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(contract.status)}
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="sm" className="bg-accent hover:bg-accent/90">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Contract Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-semibold">{contract.client_name || 'Not specified'}</p>
                    <p className="text-xs text-muted-foreground">{contract.client_email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success/10 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">
                      {contract.contract_amount ? `₹${contract.contract_amount.toLocaleString()}` : 'Not specified'}
                    </p>
                    <p className="text-xs text-muted-foreground">{contract.payment_type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-semibold">{contract.project_timeline || 'Not specified'}</p>
                    <p className="text-xs text-muted-foreground">Project duration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contract Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scope of Work */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Scope of Work</h3>
                <div className="bg-muted/20 rounded-xl p-4">
                  <p className="whitespace-pre-wrap">{contract.scope_of_work || 'No scope of work specified'}</p>
                </div>
              </div>

              <Separator />

              {/* Payment Terms */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-secondary">Payment Terms</h3>
                <div className="bg-muted/20 rounded-xl p-4">
                  <p className="whitespace-pre-wrap">{contract.payment_terms || 'No payment terms specified'}</p>
                </div>
              </div>

              <Separator />

              {/* Contract Metadata */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Created</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(contract.created_at).toLocaleDateString()} at {new Date(contract.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Last Updated</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(contract.updated_at).toLocaleDateString()} at {new Date(contract.updated_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contract Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-primary hover:bg-primary/90">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Contract
                </Button>
                <Button variant="outline">
                  <Share className="w-4 h-4 mr-2" />
                  Send to Client
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                {contract.status === 'draft' && (
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    Cancel Contract
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractView;
