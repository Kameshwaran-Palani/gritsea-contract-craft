
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ContractData } from '@/pages/ContractBuilder';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface ScopeOfWorkProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const ScopeOfWork: React.FC<ScopeOfWorkProps> = ({
  data,
  updateData
}) => {
  const handleInputChange = (field: keyof ContractData, value: string) => {
    updateData({ [field]: value });
  };

  const addMilestone = () => {
    const newMilestone = {
      title: '',
      description: '',
      dueDate: '',
      amount: 0
    };
    updateData({
      milestones: [...data.milestones, newMilestone]
    });
  };

  const updateMilestone = (index: number, field: string, value: string | number) => {
    const updatedMilestones = data.milestones.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    );
    updateData({ milestones: updatedMilestones });
  };

  const removeMilestone = (index: number) => {
    const updatedMilestones = data.milestones.filter((_, i) => i !== index);
    updateData({ milestones: updatedMilestones });
  };

  return (
    <div className="space-y-6">
      {/* Services Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Services Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="services">Services to be Provided *</Label>
              <Textarea
                id="services"
                value={data.services}
                onChange={(e) => handleInputChange('services', e.target.value)}
                placeholder="Describe in detail what services you will provide. Be specific about what's included and what's not."
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be as specific as possible to avoid scope creep
              </p>
            </div>
            
            <div>
              <Label htmlFor="deliverables">Deliverables & Format</Label>
              <Textarea
                id="deliverables"
                value={data.deliverables}
                onChange={(e) => handleInputChange('deliverables', e.target.value)}
                placeholder="List all deliverables and their formats (e.g., PDF files, source code, design files, etc.)"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Project Milestones
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={addMilestone}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Milestone
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.milestones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No milestones added yet</p>
                <p className="text-sm">Add milestones to break down your project into manageable phases</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Milestone {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor={`milestone-title-${index}`}>Title</Label>
                        <Input
                          id={`milestone-title-${index}`}
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          placeholder="e.g., Initial Design Mockups"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`milestone-date-${index}`}>Due Date</Label>
                        <Input
                          id={`milestone-date-${index}`}
                          type="date"
                          value={milestone.dueDate}
                          onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label htmlFor={`milestone-description-${index}`}>Description</Label>
                      <Textarea
                        id={`milestone-description-${index}`}
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Describe what will be delivered in this milestone"
                        rows={2}
                      />
                    </div>
                    
                    {data.paymentType === 'fixed' && (
                      <div className="mt-4">
                        <Label htmlFor={`milestone-amount-${index}`}>Payment Amount (₹)</Label>
                        <Input
                          id={`milestone-amount-${index}`}
                          type="number"
                          value={milestone.amount || ''}
                          onChange={(e) => updateMilestone(index, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="25000"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ScopeOfWork;
