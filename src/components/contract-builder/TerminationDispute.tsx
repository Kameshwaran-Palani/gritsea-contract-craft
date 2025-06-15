import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ContractData } from '@/pages/ContractBuilder';
import { AlertTriangle, Scale, MapPin } from 'lucide-react';

interface TerminationDisputeProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const TerminationDispute: React.FC<TerminationDisputeProps> = ({
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
              <AlertTriangle className="h-5 w-5" />
              Termination Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="terminationConditions">Termination Conditions</Label>
              <Textarea
                id="terminationConditions"
                value={data.terminationConditions}
                onChange={(e) => updateData({ terminationConditions: e.target.value })}
                placeholder="Either party may terminate this agreement with written notice for convenience, or immediately for breach of contract, non-payment, or violation of terms."
                rows={4}
              />
            </div>

            <div>
              <Label>Notice Period</Label>
              <Select 
                value={data.noticePeriod} 
                onValueChange={(value) => updateData({ noticePeriod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate (For breach)</SelectItem>
                  <SelectItem value="7 days">7 days</SelectItem>
                  <SelectItem value="15 days">15 days</SelectItem>
                  <SelectItem value="30 days">30 days (Recommended)</SelectItem>
                  <SelectItem value="60 days">60 days</SelectItem>
                </SelectContent>
              </Select>
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
              <Scale className="h-5 w-5" />
              Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Include Arbitration Clause</Label>
              <Switch
                checked={data.arbitrationClause}
                onCheckedChange={(checked) => updateData({ arbitrationClause: checked })}
              />
            </div>

            <div>
              <Label>Governing Jurisdiction</Label>
              <Select 
                value={data.jurisdiction} 
                onValueChange={(value) => updateData({ jurisdiction: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India (All States)</SelectItem>
                  <SelectItem value="Mumbai">Mumbai, Maharashtra</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Bangalore">Bangalore, Karnataka</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad, Telangana</SelectItem>
                  <SelectItem value="Chennai">Chennai, Tamil Nadu</SelectItem>
                  <SelectItem value="Pune">Pune, Maharashtra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ With Arbitration</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Faster resolution (6-12 months)</li>
                  <li>• Lower costs</li>
                  <li>• Private proceedings</li>
                  <li>• Expert arbitrators</li>
                  <li>• Binding decisions</li>
                </ul>
              </div>
              
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">⚠️ Court Litigation</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Longer process (2-5 years)</li>
                  <li>• Higher legal costs</li>
                  <li>• Public proceedings</li>
                  <li>• Appeal options available</li>
                  <li>• Formal court procedures</li>
                </ul>
              </div>
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
              <MapPin className="h-5 w-5" />
              Legal Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Indian Contract Law</h4>
              <p className="text-sm text-blue-800 mb-3">
                This contract is governed by:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• The Indian Contract Act, 1872</li>
                <li>• The Arbitration and Conciliation Act, 2015 (if applicable)</li>
                <li>• Information Technology Act, 2000 (for digital services)</li>
                <li>• Consumer Protection Act, 2019 (if applicable)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TerminationDispute;
