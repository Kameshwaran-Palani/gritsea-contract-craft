import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ContractData } from '@/pages/ContractBuilder';
import { Clock, RotateCcw, Activity } from 'lucide-react';

interface ServiceLevelAgreementProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const ServiceLevelAgreement: React.FC<ServiceLevelAgreementProps> = ({
  data,
  updateData
}) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Response Time & Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Maximum Response Time</Label>
              <Select 
                value={data.responseTime} 
                onValueChange={(value) => updateData({ responseTime: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2 hours">2 hours (Premium)</SelectItem>
                  <SelectItem value="4 hours">4 hours</SelectItem>
                  <SelectItem value="24 hours">24 hours (Standard)</SelectItem>
                  <SelectItem value="48 hours">48 hours</SelectItem>
                  <SelectItem value="72 hours">72 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="uptimeRequirement">Uptime Requirement (For SaaS/Web Services)</Label>
              <Input
                id="uptimeRequirement"
                value={data.uptimeRequirement || ''}
                onChange={(e) => updateData({ uptimeRequirement: e.target.value })}
                placeholder="99.9% uptime (optional)"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Revisions & Changes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="revisionLimit">Number of Included Revisions</Label>
              <Select 
                value={data.revisionLimit.toString()} 
                onValueChange={(value) => updateData({ revisionLimit: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 revision</SelectItem>
                  <SelectItem value="2">2 revisions</SelectItem>
                  <SelectItem value="3">3 revisions (Recommended)</SelectItem>
                  <SelectItem value="5">5 revisions</SelectItem>
                  <SelectItem value="0">Unlimited revisions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Standards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Quality Standards</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Work meets industry standards</li>
                  <li>• Deliverables as per specifications</li>
                  <li>• Professional communication</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Timeline Commitment</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Meet agreed milestones</li>
                  <li>• Advance notice for delays</li>
                  <li>• Regular progress updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ServiceLevelAgreement;
