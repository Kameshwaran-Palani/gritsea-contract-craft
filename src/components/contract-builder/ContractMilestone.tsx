
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Clock, 
  Send, 
  FileText, 
  Eye, 
  EyeOff, 
  Copy, 
  Mail, 
  Phone 
} from 'lucide-react';

interface ContractMilestoneProps {
  contractId: string;
  status: string;
  shareInfo?: {
    link: string;
    secretKey: string;
    clientContact: string;
    authMethod: string;
  };
}

const ContractMilestone: React.FC<ContractMilestoneProps> = ({
  contractId,
  status,
  shareInfo
}) => {
  const { toast } = useToast();
  const [keyViewCount, setKeyViewCount] = useState(0);
  const [showKey, setShowKey] = useState(false);
  const [blurredKey, setBlurredKey] = useState('');
  const [eSignDetails, setESignDetails] = useState<{
    link: string;
    secretKey: string;
    clientContact: string;
    authMethod: string;
  } | null>(null);

  useEffect(() => {
    if (contractId && (status === 'sent_for_signature' || status === 'signed')) {
      loadESignDetails();
    }
  }, [contractId, status]);

  useEffect(() => {
    const currentShareInfo = shareInfo || eSignDetails;
    if (currentShareInfo?.secretKey) {
      // Create blurred version
      const key = currentShareInfo.secretKey;
      const blurred = key.slice(0, 3) + '●'.repeat(key.length - 6) + key.slice(-3);
      setBlurredKey(blurred);
      
      // Load view count from localStorage
      const storageKey = `key_views_${contractId}`;
      const viewCount = parseInt(localStorage.getItem(storageKey) || '0');
      setKeyViewCount(viewCount);
    }
  }, [shareInfo, eSignDetails, contractId]);

  const loadESignDetails = async () => {
    try {
      // Create mock eSign details for demonstration
      const mockDetails = {
        link: `${window.location.origin}/esign/${contractId}/email`,
        secretKey: 'ABC123XYZ',
        clientContact: 'client@example.com',
        authMethod: 'email'
      };
      setESignDetails(mockDetails);
    } catch (error) {
      console.error('Error loading eSign details:', error);
    }
  };

  const handleViewKey = () => {
    if (keyViewCount >= 3) {
      toast({
        title: "View Limit Reached",
        description: "You have reached the maximum number of views for this key.",
        variant: "destructive"
      });
      return;
    }

    const newCount = keyViewCount + 1;
    setKeyViewCount(newCount);
    setShowKey(true);
    
    // Save to localStorage
    const storageKey = `key_views_${contractId}`;
    localStorage.setItem(storageKey, newCount.toString());

    // Hide after 10 seconds
    setTimeout(() => {
      setShowKey(false);
    }, 10000);

    toast({
      title: "Key Revealed",
      description: `View ${newCount}/3 - Key will be hidden after 10 seconds`,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`
    });
  };

  const getMilestones = () => {
    const milestones = [
      {
        id: 'created',
        title: 'Contract Created',
        description: '',
        status: 'completed',
        icon: FileText
      },
      {
        id: 'shared',
        title: 'Contract Shared',
        description: '',
        status: status === 'draft' ? 'pending' : 'completed',
        icon: Send
      },
      {
        id: 'client_esign',
        title: 'Client eSign',
        description: 'Client has received the signing link',
        status: ['sent_for_signature', 'signed', 'revision_requested'].includes(status) ? 'completed' : 'pending',
        icon: Mail
      },
      {
        id: 'approved_rejected',
        title: 'Client Decision',
        description: status === 'signed' ? 'Contract approved and signed' : 
                    status === 'revision_requested' ? 'Changes requested' : 'Awaiting client decision',
        status: status === 'signed' ? 'completed' : 
                status === 'revision_requested' ? 'rejected' : 
                ['sent_for_signature'].includes(status) ? 'in_progress' : 'pending',
        icon: status === 'signed' ? CheckCircle : status === 'revision_requested' ? Clock : Eye
      }
    ];

    return milestones;
  };

  const getStatusColor = (milestoneStatus: string) => {
    switch (milestoneStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const milestones = getMilestones();
  const currentShareInfo = shareInfo || eSignDetails;
  
  const statuses = milestones.map(m => m.status);
  let activeMilestoneIndex = -1;
  for (let i = statuses.length - 1; i >= 0; i--) {
    if (statuses[i] !== 'pending') {
      activeMilestoneIndex = i;
      break;
    }
  }
  const progress = activeMilestoneIndex >= 0 ? (activeMilestoneIndex / (milestones.length - 1)) * 100 : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Contract Milestones */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Contract Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="relative">
            {/* Progress bar */}
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4 relative">
              {milestones.map((milestone) => {
                const Icon = milestone.icon;
                const isCompleted = milestone.status === 'completed';
                const isInProgress = milestone.status === 'in_progress';
                const isRejected = milestone.status === 'rejected';
                const isPending = milestone.status === 'pending';
                const isActive = !isPending;

                return (
                  <div key={milestone.id} className="flex flex-col items-center text-center">
                    {/* Icon on timeline */}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted ? 'bg-green-500 border-green-600' :
                      isInProgress ? 'bg-blue-500 border-blue-600 animate-pulse' :
                      isRejected ? 'bg-red-500 border-red-600' :
                      'bg-white border-gray-300'
                    }`}>
                      <Icon className={`h-5 w-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    </div>

                    {/* Milestone details */}
                    <div className="mt-4">
                      <h4 className="font-medium text-sm">{milestone.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 min-h-[40px]">{milestone.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* eSign Details */}
      {currentShareInfo && (
        <Card className="lg:w-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              eSign Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Signing Link */}
            <div>
              <Label className="text-sm font-medium">Client Signing Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={currentShareInfo.link}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(currentShareInfo.link, 'Signing link')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Client Contact */}
            <div>
              <Label className="text-sm font-medium">Client Contact</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={currentShareInfo.clientContact}
                  readOnly
                  className="text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(currentShareInfo.clientContact, 'Client contact')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Authentication Method */}
            <div>
              <Label className="text-sm font-medium">Authentication Method</Label>
              <div className="flex items-center gap-2 mt-1">
                {currentShareInfo.authMethod === 'email' && <Mail className="h-4 w-4" />}
                {currentShareInfo.authMethod === 'phone' && <Phone className="h-4 w-4" />}
                <span className="text-sm capitalize">{currentShareInfo.authMethod}</span>
              </div>
            </div>

            {/* Secret Key */}
            <div>
              <Label className="text-sm font-medium">
                Access Key 
                <span className="text-xs text-muted-foreground ml-2">
                  (Views: {keyViewCount}/3)
                </span>
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={showKey ? currentShareInfo.secretKey : blurredKey}
                  readOnly
                  className="font-mono text-xs"
                  type={showKey ? "text" : "password"}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleViewKey}
                  disabled={keyViewCount >= 3}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {showKey && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(currentShareInfo.secretKey, 'Access key')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {keyViewCount >= 3 && (
                <p className="text-xs text-red-600 mt-1">
                  Maximum views reached. Key is permanently hidden for security.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContractMilestone;
