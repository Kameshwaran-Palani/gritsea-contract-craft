
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ContractData } from '@/pages/ContractBuilder';
import { DollarSign, Plus, Trash2, Clock } from 'lucide-react';

interface PaymentTermsProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const PaymentTerms: React.FC<PaymentTermsProps> = ({
  data,
  updateData
}) => {
  const handlePaymentTypeChange = (type: 'fixed' | 'hourly') => {
    updateData({ paymentType: type });
  };

  const handleRateChange = (value: string) => {
    updateData({ rate: parseFloat(value) || 0 });
  };

  const handleTotalAmountChange = (value: string) => {
    updateData({ totalAmount: parseFloat(value) || 0 });
  };

  const addPaymentSchedule = () => {
    const newSchedule = {
      description: '',
      percentage: 0,
      dueDate: ''
    };
    updateData({
      paymentSchedule: [...data.paymentSchedule, newSchedule]
    });
  };

  const updatePaymentSchedule = (index: number, field: string, value: string | number) => {
    const updatedSchedule = data.paymentSchedule.map((schedule, i) => 
      i === index ? { ...schedule, [field]: value } : schedule
    );
    updateData({ paymentSchedule: updatedSchedule });
  };

  const removePaymentSchedule = (index: number) => {
    const updatedSchedule = data.paymentSchedule.filter((_, i) => i !== index);
    updateData({ paymentSchedule: updatedSchedule });
  };

  const totalPercentage = data.paymentSchedule.reduce((sum, schedule) => sum + schedule.percentage, 0);

  return (
    <div className="space-y-6">
      {/* Payment Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Payment Type</Label>
              <Select value={data.paymentType} onValueChange={handlePaymentTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price Project</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.paymentType === 'hourly' ? (
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={data.rate || ''}
                  onChange={(e) => handleRateChange(e.target.value)}
                  placeholder="2500"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="totalAmount">Total Project Amount (₹)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={data.totalAmount || ''}
                  onChange={(e) => handleTotalAmountChange(e.target.value)}
                  placeholder="50000"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Schedule */}
      {data.paymentType === 'fixed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Schedule</CardTitle>
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${totalPercentage === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                    Total: {totalPercentage}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPaymentSchedule}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Payment
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.paymentSchedule.map((schedule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Payment {index + 1}</h4>
                      {data.paymentSchedule.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePaymentSchedule(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label htmlFor={`payment-description-${index}`}>Description</Label>
                        <Input
                          id={`payment-description-${index}`}
                          value={schedule.description}
                          onChange={(e) => updatePaymentSchedule(index, 'description', e.target.value)}
                          placeholder="e.g., Upfront payment"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`payment-percentage-${index}`}>Percentage (%)</Label>
                        <Input
                          id={`payment-percentage-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          value={schedule.percentage || ''}
                          onChange={(e) => updatePaymentSchedule(index, 'percentage', parseFloat(e.target.value) || 0)}
                          placeholder="50"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`payment-due-${index}`}>Due Date (Optional)</Label>
                        <Input
                          id={`payment-due-${index}`}
                          type="date"
                          value={schedule.dueDate || ''}
                          onChange={(e) => updatePaymentSchedule(index, 'dueDate', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {data.totalAmount && schedule.percentage > 0 && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Amount: ₹{((data.totalAmount * schedule.percentage) / 100).toLocaleString()}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {totalPercentage !== 100 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ⚠️ Payment schedule should total 100%. Current total: {totalPercentage}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Late Fee */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Late Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Include Late Fee Clause</Label>
                <p className="text-sm text-muted-foreground">
                  Add penalty for delayed payments
                </p>
              </div>
              <Switch
                checked={data.lateFeeEnabled}
                onCheckedChange={(checked) => updateData({ lateFeeEnabled: checked })}
              />
            </div>
            
            {data.lateFeeEnabled && (
              <div>
                <Label htmlFor="lateFeeAmount">Late Fee Amount (₹ per day)</Label>
                <Input
                  id="lateFeeAmount"
                  type="number"
                  value={data.lateFeeAmount || ''}
                  onChange={(e) => updateData({ lateFeeAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Daily penalty for payments made after due date
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentTerms;
