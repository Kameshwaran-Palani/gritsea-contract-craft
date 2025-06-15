import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractData } from '@/pages/ContractBuilder';
import { User, Building } from 'lucide-react';

interface PartiesInformationProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const PartiesInformation: React.FC<PartiesInformationProps> = ({
  data,
  updateData
}) => {
  const handleInputChange = (field: keyof ContractData, value: string) => {
    updateData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Freelancer Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Information (Freelancer)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="freelancerName">Full Name *</Label>
                <Input
                  id="freelancerName"
                  value={data.freelancerName}
                  onChange={(e) => handleInputChange('freelancerName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <Label htmlFor="freelancerBusinessName">Business Name (Optional)</Label>
                <Input
                  id="freelancerBusinessName"
                  value={data.freelancerBusinessName || ''}
                  onChange={(e) => handleInputChange('freelancerBusinessName', e.target.value)}
                  placeholder="Doe Creative Solutions"
                />
              </div>
              
              <div>
                <Label htmlFor="freelancerEmail">Email Address *</Label>
                <Input
                  id="freelancerEmail"
                  type="email"
                  value={data.freelancerEmail}
                  onChange={(e) => handleInputChange('freelancerEmail', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="freelancerPhone">Phone Number</Label>
                <Input
                  id="freelancerPhone"
                  value={data.freelancerPhone || ''}
                  onChange={(e) => handleInputChange('freelancerPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              
              <div>
                <Label htmlFor="freelancerAddress">Address *</Label>
                <Textarea
                  id="freelancerAddress"
                  value={data.freelancerAddress}
                  onChange={(e) => handleInputChange('freelancerAddress', e.target.value)}
                  placeholder="123 Main Street, City, State, PIN - 123456"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Client Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={data.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
              
              <div>
                <Label htmlFor="clientCompany">Company/Organization</Label>
                <Input
                  id="clientCompany"
                  value={data.clientCompany || ''}
                  onChange={(e) => handleInputChange('clientCompany', e.target.value)}
                  placeholder="ABC Technologies Pvt Ltd"
                />
              </div>
              
              <div>
                <Label htmlFor="clientEmail">Email Address *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={data.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  placeholder="jane@abctech.com"
                />
              </div>
              
              <div>
                <Label htmlFor="clientPhone">Phone Number</Label>
                <Input
                  id="clientPhone"
                  value={data.clientPhone || ''}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Contract Dates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Contract Duration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={data.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={data.endDate || ''}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank for ongoing/retainer work
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PartiesInformation;
