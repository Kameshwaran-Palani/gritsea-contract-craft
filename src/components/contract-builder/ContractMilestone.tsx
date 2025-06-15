
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

  useEffect(() => {
    if (shareInfo?.secretKey) {
      // Create blurred version
      const key = shareInfo.secretKey;
      const blurred = key.slice(0, 3) + '●'.repeat(key.length - 6) + key.slice(-3);
      setBlurredKey(blurred);
      
      // Load view count from localStorage
      const storageKey = `key_views_${contractId}`;
      const viewCount = parseInt(localStorage.getItem(storageKey) || '0');
      setKeyViewCount(viewCount);
    }
  }, [shareInfo, contractId]);

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
        description: 'Contract has been drafted and saved',
        status: 'completed',
        icon: FileText
      },
      {
        id: 'shared',
        title: 'Contract Shared',
        description: 'eSign link generated and shared with client',
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

  return (
    <div className="space-y-6">
      {/* Contract Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Contract Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <div key={milestone.id} className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.status === 'completed' ? 'bg-green-100' :
                    milestone.status === 'in_progress' ? 'bg-blue-100' :
                    milestone.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      milestone.status === 'completed' ? 'text-green-600' :
                      milestone.status === 'in_progress' ? 'text-blue-600' :
                      milestone.status === 'rejected' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <Badge className={`text-xs ${getStatusColor(milestone.status)}`}>
                        {milestone.status === 'completed' ? 'Completed' :
                         milestone.status === 'in_progress' ? 'In Progress' :
                         milestone.status === 'rejected' ? 'Revision Requested' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="absolute left-4 mt-8 w-px h-6 bg-gray-200" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* eSign Details */}
      {shareInfo && (
        <Card>
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
                  value={shareInfo.link}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(shareInfo.link, 'Signing link')}
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
                  value={shareInfo.clientContact}
                  readOnly
                  className="text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(shareInfo.clientContact, 'Client contact')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Authentication Method */}
            <div>
              <Label className="text-sm font-medium">Authentication Method</Label>
              <div className="flex items-center gap-2 mt-1">
                {shareInfo.authMethod === 'email' && <Mail className="h-4 w-4" />}
                {shareInfo.authMethod === 'phone' && <Phone className="h-4 w-4" />}
                <span className="text-sm capitalize">{shareInfo.authMethod}</span>
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
                  value={showKey ? shareInfo.secretKey : blurredKey}
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
                    onClick={() => copyToClipboard(shareInfo.secretKey, 'Access key')}
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
