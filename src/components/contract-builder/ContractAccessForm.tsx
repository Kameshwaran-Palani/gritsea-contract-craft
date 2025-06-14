
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, KeyRound } from 'lucide-react';

interface ContractAccessFormProps {
  contractId: string;
  onAccessGranted: (contractData: any) => void;
}

const ContractAccessForm: React.FC<ContractAccessFormProps> = ({
  contractId,
  onAccessGranted
}) => {
  const { toast } = useToast();
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccess = async () => {
    if (!secretKey) {
      toast({
        title: "Secret Key Required",
        description: "Please enter the secret key provided to you",
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
        .single();

      if (error || !data) {
        toast({
          title: "Access Denied",
          description: "Invalid secret key or contract not found",
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
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value.toUpperCase())}
              placeholder="Enter the secret key provided to you"
              className="font-mono"
            />
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
