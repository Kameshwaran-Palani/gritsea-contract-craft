
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContractData } from './ContractBuilder';
import ContractPreview from '@/components/contract-builder/ContractPreview';
import { Shield, Phone, Key, FileText } from 'lucide-react';
import { toast } from 'sonner';

const ContractSecureView = () => {
  const { id } = useParams();
  const [step, setStep] = useState<'phone' | 'otp' | 'accessKey' | 'contract'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      
      // In a real implementation, you would send SMS here
      // For demo purposes, we'll show the OTP in a toast
      toast.success(`OTP sent to ${phoneNumber}: ${otp}`);
      setStep('otp');
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp !== generatedOtp) {
      toast.error('Invalid OTP. Please try again.');
      return;
    }

    toast.success('OTP verified successfully');
    setStep('accessKey');
  };

  const verifyAccessKey = async () => {
    if (!accessKey) {
      toast.error('Please enter the access key');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data && data.clauses_json) {
        const contractInfo = data.clauses_json as unknown as ContractData;
        
        // In a real implementation, you would verify the access key
        // For demo purposes, we'll accept any key that's not empty
        if (accessKey.length >= 6) {
          setContractData(contractInfo);
          setStep('contract');
          toast.success('Access granted successfully');
        } else {
          toast.error('Invalid access key');
        }
      }
    } catch (error) {
      console.error('Error loading contract:', error);
      toast.error('Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return <Navigate to="/" replace />;
  }

  if (step === 'contract' && contractData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">A</span>
                </div>
                <span className="text-lg font-bold gradient-text">Agrezy</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-lg font-semibold">Contract Viewer</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Secure Access</span>
            </div>
          </div>
        </header>
        <ContractPreview data={contractData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Secure Contract Access</CardTitle>
          <p className="text-muted-foreground">
            This contract requires verification to access
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 'phone' && (
            <>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button 
                onClick={sendOTP} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-2"
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  OTP sent to {phoneNumber}
                </p>
              </div>
              <Button onClick={verifyOTP} className="w-full">
                Verify OTP
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep('phone')}
                className="w-full"
              >
                Change Phone Number
              </Button>
            </>
          )}

          {step === 'accessKey' && (
            <>
              <div>
                <Label htmlFor="accessKey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Access Key
                </Label>
                <Input
                  id="accessKey"
                  type="password"
                  placeholder="Enter contract access key"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the secret key provided by the contract sender
                </p>
              </div>
              <Button 
                onClick={verifyAccessKey} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Access Contract'}
              </Button>
            </>
          )}

          <div className="text-center pt-4 border-t">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Powered by Agrezy
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractSecureView;
