
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  Send, 
  FileText, 
  Eye, 
  Mail
} from 'lucide-react';

interface ContractMilestoneProps {
  contractId: string;
  status: string;
}

const ContractMilestone: React.FC<ContractMilestoneProps> = ({
  status,
}) => {
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
        description: '',
        status: ['sent_for_signature', 'signed', 'revision_requested'].includes(status) ? 'completed' : 'pending',
        icon: Mail
      },
      {
        id: 'approved_rejected',
        title: 'Client Decision',
        description: status === 'signed' ? 'Contract approved and signed' : 
                    status === 'revision_requested' ? 'Changes requested' : '',
        status: status === 'signed' ? 'completed' : 
                status === 'revision_requested' ? 'rejected' : 
                ['sent_for_signature'].includes(status) ? 'in_progress' : 'pending',
        icon: status === 'signed' ? CheckCircle : status === 'revision_requested' ? Clock : Eye
      }
    ];

    return milestones;
  };

  const milestones = getMilestones();
  
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Contract Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-3.5 left-0 w-full h-1 bg-gray-200 rounded-full">
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
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted ? 'bg-green-500 border-green-600' :
                    isInProgress ? 'bg-blue-500 border-blue-600 animate-pulse' :
                    isRejected ? 'bg-red-500 border-red-600' :
                    'bg-white border-gray-300'
                  }`}>
                    <Icon className={`h-4 w-4 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </div>

                  {/* Milestone details */}
                  <div className="mt-2">
                    <h4 className="font-medium text-sm">{milestone.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 min-h-[30px]">{milestone.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractMilestone;
