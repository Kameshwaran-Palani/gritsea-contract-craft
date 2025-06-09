
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ContractData } from '@/pages/ContractBuilder';
import { RefreshCw, Calendar } from 'lucide-react';

interface OngoingWorkProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const OngoingWork: React.FC<OngoingWorkProps> = ({
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
              <RefreshCw className="h-5 w-5" />
              Retainer & Ongoing Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>This is a retainer/ongoing project</Label>
                <p className="text-sm text-muted-foreground">
                  Monthly or recurring work arrangement
                </p>
              </div>
              <Switch
                checked={data.isRetainer}
                onCheckedChange={(checked) => updateData({ isRetainer: checked })}
              />
            </div>

            {data.isRetainer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="retainerAmount">Monthly Retainer Amount (₹)</Label>
                  <Input
                    id="retainerAmount"
                    type="number"
                    value={data.retainerAmount || ''}
                    onChange={(e) => updateData({ retainerAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="25000"
                  />
                </div>

                <div>
                  <Label>Renewal Cycle</Label>
                  <Select 
                    value={data.renewalCycle} 
                    onValueChange={(value) => updateData({ renewalCycle: value as 'monthly' | 'quarterly' | 'yearly' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select renewal cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-renewal</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically renew contract unless cancelled
                    </p>
                  </div>
                  <Switch
                    checked={data.autoRenew}
                    onCheckedChange={(checked) => updateData({ autoRenew: checked })}
                  />
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {!data.isRetainer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-dashed">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">One-time Project</h3>
              <p className="text-muted-foreground">
                This appears to be a one-time project. If you need ongoing work arrangements, 
                enable the retainer option above.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default OngoingWork;
