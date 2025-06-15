import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ContractData } from '@/pages/ContractBuilder';
import { Shield, AlertTriangle } from 'lucide-react';

interface ConfidentialityProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const Confidentiality: React.FC<ConfidentialityProps> = ({
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
              <Shield className="h-5 w-5" />
              Non-Disclosure Agreement (NDA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Include Confidentiality Clause</Label>
              <Switch
                checked={data.includeNDA}
                onCheckedChange={(checked) => updateData({ includeNDA: checked })}
              />
            </div>

            {data.includeNDA && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="confidentialityScope">Scope of Confidential Information</Label>
                  <Textarea
                    id="confidentialityScope"
                    value={data.confidentialityScope || ''}
                    onChange={(e) => updateData({ confidentialityScope: e.target.value })}
                    placeholder="Business plans, customer data, proprietary processes, financial information, trade secrets..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Confidentiality Duration</Label>
                  <Select 
                    value={data.confidentialityDuration} 
                    onValueChange={(value) => updateData({ confidentialityDuration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2 years">2 years</SelectItem>
                      <SelectItem value="3 years">3 years</SelectItem>
                      <SelectItem value="5 years">5 years (Recommended)</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="breachPenalty">Penalty for Breach (₹) - Optional</Label>
                  <Input
                    id="breachPenalty"
                    type="number"
                    value={data.breachPenalty || ''}
                    onChange={(e) => updateData({ breachPenalty: parseFloat(e.target.value) || 0 })}
                    placeholder="50000"
                  />
                </div>
              </motion.div>
            )}
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
              <AlertTriangle className="h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">✅ When to Include NDA</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Access to business strategies or plans</li>
                  <li>• Customer databases or contact lists</li>
                  <li>• Proprietary processes or methods</li>
                  <li>• Financial information</li>
                  <li>• Unreleased products or features</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">🛡️ Standard Protections</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Mutual confidentiality (both parties)</li>
                  <li>• Exceptions for public information</li>
                  <li>• Legal compliance exceptions</li>
                  <li>• Return of materials clause</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Confidentiality;
