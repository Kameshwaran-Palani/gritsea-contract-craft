
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, TrendingUp, Users, Clock, CheckCircle, Upload } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import SEOHead from '@/components/SEOHead';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalContracts: 0,
    draftContracts: 0,
    signedContracts: 0,
    pendingContracts: 0
  });
  const [recentContracts, setRecentContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load contracts for stats and recent activity
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Calculate stats
      const total = contracts?.length || 0;
      const draft = contracts?.filter(c => ['draft', 'revision_requested'].includes(c.status)).length || 0;
      const signed = contracts?.filter(c => c.status === 'signed').length || 0;
      const pending = contracts?.filter(c => c.status === 'sent_for_signature').length || 0;

      setStats({
        totalContracts: total,
        draftContracts: draft,
        signedContracts: signed,
        pendingContracts: pending
      });

      // Set recent contracts (first 5)
      setRecentContracts(contracts?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <SEOHead 
        title="Dashboard - Agrezy"
        description="Your contract management dashboard"
      />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening with your contracts.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/document-upload')} 
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Get eSign
              </Button>
              <Button onClick={() => navigate('/contract/new')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Contract
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContracts}</div>
                <p className="text-xs text-muted-foreground">
                  All time contracts created
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft Contracts</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.draftContracts}</div>
                <p className="text-xs text-muted-foreground">
                  Contracts in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Signature</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingContracts}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting client signatures
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Signed Contracts</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.signedContracts}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Contracts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Contracts</CardTitle>
              <Button variant="outline" onClick={() => navigate('/contracts')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentContracts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No contracts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first contract to get started
                  </p>
                  <Button onClick={() => navigate('/contract/new')}>
                    Create Contract
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/contract/view/${contract.id}`)}
                    >
                      <div className="space-y-1">
                        <h4 className="font-medium">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {contract.client_name || 'No client specified'} • 
                          Created {new Date(contract.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status === 'sent_for_signature' ? 'Pending' : 
                         contract.status === 'revision_requested' ? 'Revision' : 
                         contract.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
