
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Send, AlertCircle, X } from 'lucide-react';

interface ContractStatusBadgeProps {
  status: 'draft' | 'sent' | 'signed' | 'cancelled' | 'sent_for_signature' | 'revision_requested';
  className?: string;
}

const ContractStatusBadge: React.FC<ContractStatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          variant: 'secondary' as const,
          icon: Clock
        };
      case 'sent':
        return {
          label: 'Sent',
          variant: 'default' as const,
          icon: Send
        };
      case 'sent_for_signature':
        return {
          label: 'Awaiting Signature',
          variant: 'default' as const,
          icon: Send
        };
      case 'revision_requested':
        return {
          label: 'Revision Requested',
          variant: 'destructive' as const,
          icon: AlertCircle
        };
      case 'signed':
        return {
          label: 'Signed',
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          variant: 'destructive' as const,
          icon: X
        };
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          icon: Clock
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`flex items-center gap-1 ${config.className || ''} ${className || ''}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default ContractStatusBadge;
