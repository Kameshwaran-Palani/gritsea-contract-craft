
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Mail, Phone, KeyRound } from 'lucide-react';

interface ContractAccessFormProps {
  contractId: string;
  onAccessGranted: (contractData: any) => void;
}

const ContractAccessForm: React.FC<ContractAccessFormProps> = ({
  contractId,
  onAccessGranted
}) => {
  const { toast } = useToast();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [credentials, setCredentials] = useState({
    email: '',
    phone: '',
    secretKey: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAccess = async () => {
    if (!credentials.secretKey) {
      toast({
        title: "Secret Key Required",
        description: "Please enter the secret key provided to you",
        variant: "destructive"
      });
      return;
    }

    const contactInfo = authMethod === 'email' ? credentials.email : credentials.phone;
    if (!contactInfo) {
      toast({
        title: `${authMethod === 'email' ? 'Email' : 'Phone'} Required`,
        description: `Please enter your ${authMethod} address`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .eq('accessKey', credentials.secretKey)
        .single();

      if (error || !data) {
        toast({
          title: "Access Denied",
          description: "Invalid secret key or contract not found",
          variant: "destructive"
        });
        return;
      }

      // Verify contact information matches
      const expectedContact = authMethod === 'email' ? data.client_email : data.client_phone;
      if (expectedContact && expectedContact !== contactInfo) {
        toast({
          title: "Authentication Failed",
          description: `The ${authMethod} address doesn't match our records`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Access Granted",
        description: "Welcome! You can now review and sign the contract."
      });

      onAccessGranted(data);
    } catch (error) {
      console.error('Access error:', error);
      toast({
        title: "Error",
        description: "Failed to access contract",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Contract Access</CardTitle>
          <p className="text-muted-foreground">
            Enter your details to securely access and sign the contract
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="secretKey" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Secret Key
            </Label>
            <Input
              id="secretKey"
              value={credentials.secretKey}
              onChange={(e) => setCredentials(prev => ({ ...prev, secretKey: e.target.value.toUpperCase() }))}
              placeholder="Enter the secret key provided to you"
              className="font-mono"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Authentication Method</Label>
            <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as 'email' | 'phone')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="mt-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </TabsContent>

              <TabsContent value="phone" className="mt-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={credentials.phone}
                    onChange={(e) => setCredentials(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Button 
            onClick={handleAccess}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Verifying...' : 'Access Contract'}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>
              This is a secure contract signing portal. Your information is protected and used only for authentication purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractAccessForm;
