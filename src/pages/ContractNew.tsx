
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Save, Send, Eye } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const ContractNew = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    scope_of_work: '',
    payment_terms: '',
    project_timeline: '',
    contract_amount: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (status: 'draft' | 'sent') => {
    if (!user) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          title: formData.title,
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_phone: formData.client_phone,
          scope_of_work: formData.scope_of_work,
          payment_terms: formData.payment_terms,
          project_timeline: formData.project_timeline,
          contract_amount: formData.contract_amount ? parseFloat(formData.contract_amount) : null,
          status
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: status === 'draft' ? "Contract saved as draft" : "Contract sent to client"
      });

      navigate('/contracts');
    } catch (error) {
      console.error('Error saving contract:', error);
      toast({
        title: "Error",
        description: "Failed to save contract",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Contract</h1>
            <p className="text-muted-foreground">Fill in the details to create a professional service contract.</p>
          </div>
          <FileText className="h-8 w-8 text-muted-foreground" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-8 lg:grid-cols-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
              <CardDescription>Basic information about the contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Contract Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Website Development Agreement"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contract_amount">Contract Amount (₹)</Label>
                <Input
                  id="contract_amount"
                  type="number"
                  placeholder="50000"
                  value={formData.contract_amount}
                  onChange={(e) => handleInputChange('contract_amount', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="project_timeline">Project Timeline</Label>
                <Input
                  id="project_timeline"
                  placeholder="e.g., 6-8 weeks"
                  value={formData.project_timeline}
                  onChange={(e) => handleInputChange('project_timeline', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Details about your client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  placeholder="John Doe"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="client_email">Client Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.client_email}
                  onChange={(e) => handleInputChange('client_email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="client_phone">Client Phone</Label>
                <Input
                  id="client_phone"
                  placeholder="+91 98765 43210"
                  value={formData.client_phone}
                  onChange={(e) => handleInputChange('client_phone', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-8 lg:grid-cols-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Scope of Work</CardTitle>
              <CardDescription>Detailed description of what you'll deliver</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe the work you'll be performing, deliverables, milestones, etc."
                value={formData.scope_of_work}
                onChange={(e) => handleInputChange('scope_of_work', e.target.value)}
                rows={8}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Terms</CardTitle>
              <CardDescription>How and when you'll be paid</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., 50% upfront, 50% on completion. Payment due within 30 days of invoice."
                value={formData.payment_terms}
                onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                rows={8}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end space-x-4"
        >
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={saving || !formData.title}
          >
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSave('sent')}
            disabled={saving || !formData.title || !formData.client_email}
            className="bg-accent hover:bg-accent/90"
          >
            <Send className="mr-2 h-4 w-4" />
            Send to Client
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ContractNew;
