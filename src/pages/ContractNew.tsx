
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, ChevronLeft, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TemplateSelection from '@/components/contract-builder/TemplateSelection';
import ContractBuilder, { ContractData } from './ContractBuilder';

const ContractNew = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTemplateDialog, setShowTemplateDialog] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleTemplateSelect = async (templateData: Partial<ContractData>) => {
    if (!user) return;

    try {
      // Create a new contract with template data
      const contractPayload = {
        user_id: user.id,
        title: templateData.templateName || 'New Contract',
        status: 'draft' as const,
        client_name: '',
        client_email: '',
        scope_of_work: templateData.services || '',
        payment_terms: JSON.stringify(templateData.paymentSchedule || []),
        clauses_json: {
          ...templateData,
          documentTitle: 'SERVICE AGREEMENT',
          documentSubtitle: 'PROFESSIONAL SERVICE CONTRACT',
          logoStyle: 'round',
          primaryColor: '#3B82F6',
          fontFamily: 'inter',
          fontSize: 'medium',
          lineSpacing: 1.5,
          freelancerName: user.user_metadata?.full_name || '',
          freelancerEmail: user.email || '',
          freelancerAddress: '',
          clientName: '',
          clientEmail: '',
          startDate: '',
          services: templateData.services || '',
          deliverables: '',
          milestones: [],
          paymentType: 'fixed',
          rate: 0,
          paymentSchedule: templateData.paymentSchedule || [{ description: 'Full payment', percentage: 100 }],
          lateFeeEnabled: false,
          isRetainer: false,
          autoRenew: false,
          responseTime: '24 hours',
          revisionLimit: 3,
          includeNDA: true,
          ipOwnership: 'client',
          usageRights: 'full',
          terminationConditions: 'Either party may terminate this agreement with written notice.',
          noticePeriod: '30 days',
          jurisdiction: 'India',
          arbitrationClause: true
        } as any
      };

      const { data, error } = await supabase
        .from('contracts')
        .insert(contractPayload)
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Contract Created",
        description: "Your new contract has been created successfully."
      });

      // Navigate to the edit page for the new contract
      navigate(`/contract/edit/${data.id}`);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: "Error",
        description: "Failed to create contract",
        variant: "destructive"
      });
    }
  };

  const handleStartFromScratch = () => {
    handleTemplateSelect({
      templateId: undefined,
      templateName: 'Custom Contract'
    });
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
    <div className="min-h-screen bg-background">
      {/* Clean Header with Agrezy Branding */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => navigate('/contracts')}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Contracts
            </Button>
            <div className="h-6 w-px bg-border" />
            {/* Agrezy Branding */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="text-lg font-bold gradient-text">Agrezy</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-semibold">Create New Contract</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Choose Your Starting Point
            </DialogTitle>
            <DialogDescription>
              Select a template to get started quickly, or create a custom contract from scratch.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <TemplateSelection
              data={{} as ContractData}
              updateData={handleTemplateSelect}
              onNext={() => setShowTemplateDialog(false)}
              onPrev={() => {}}
              isFirst={true}
              isLast={false}
            />
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={handleStartFromScratch}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Start from Scratch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Placeholder content when dialog is open */}
      {showTemplateDialog && (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Create Your Contract</h2>
            <p className="text-muted-foreground">Choose a template or start from scratch to begin.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractNew;
