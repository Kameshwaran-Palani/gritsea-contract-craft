
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Eye, 
  EyeOff, 
  Copy, 
  Mail, 
  Phone 
} from 'lucide-react';

interface ESignDetailsProps {
  shareInfo: {
    link: string;
    secretKey: string;
    clientContact: string;
    authMethod: string;
  };
  contractId: string;
}

const ESignDetails: React.FC<ESignDetailsProps> = ({ shareInfo, contractId }) => {
  const { toast } = useToast();
  const [keyViewCount, setKeyViewCount] = useState(0);
  const [showKey, setShowKey] = useState(false);
  const [blurredKey, setBlurredKey] = useState('');

  useEffect(() => {
    if (shareInfo?.secretKey) {
      const key = shareInfo.secretKey;
      const blurred = key.slice(0, 3) + '●'.repeat(key.length - 6) + key.slice(-3);
      setBlurredKey(blurred);
      
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
    
    const storageKey = `key_views_${contractId}`;
    localStorage.setItem(storageKey, newCount.toString());

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

  return (
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
  );
};

export default ESignDetails;
