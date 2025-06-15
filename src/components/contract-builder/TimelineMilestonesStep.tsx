
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { InputCurrency } from '@/components/ui/input-currency';
import { ContractData } from '@/types/ContractData';

interface TimelineMilestonesStepProps {
  data: ContractData;
  updateData: (field: keyof ContractData, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const TimelineMilestonesStep: React.FC<TimelineMilestonesStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Project Timeline and Milestones</h2>
        <p className="text-muted-foreground">
          Set the project timeline and define key milestones.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <DatePicker
                selected={data.timelineStartDate}
                onSelect={(date) => updateData('timelineStartDate', date)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <DatePicker
                selected={data.timelineEndDate}
                onSelect={(date) => updateData('timelineEndDate', date)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Milestones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.milestones.map((milestone, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <Label htmlFor={`milestoneTitle-${index}`}>Title</Label>
                <Input
                  id={`milestoneTitle-${index}`}
                  value={milestone.title}
                  onChange={(e) => {
                    const newMilestones = [...data.milestones];
                    newMilestones[index].title = e.target.value;
                    updateData('milestones', newMilestones);
                  }}
                  placeholder="e.g., Design Mockup"
                />
              </div>
              <div>
                <Label htmlFor={`milestoneDescription-${index}`}>Description</Label>
                <Input
                  id={`milestoneDescription-${index}`}
                  value={milestone.description}
                  onChange={(e) => {
                    const newMilestones = [...data.milestones];
                    newMilestones[index].description = e.target.value;
                    updateData('milestones', newMilestones);
                  }}
                  placeholder="Provide a brief description"
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <DatePicker
                  selected={milestone.dueDate || undefined}
                  onSelect={(date) => {
                    const newMilestones = [...data.milestones];
                    newMilestones[index].dueDate = date || null;
                    updateData('milestones', newMilestones);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`milestoneAmount-${index}`}>Amount</Label>
                <InputCurrency
                  id={`milestoneAmount-${index}`}
                  value={milestone.amount}
                  onValueChange={(value) => {
                    const newMilestones = [...data.milestones];
                    newMilestones[index].amount = value;
                    updateData('milestones', newMilestones);
                  }}
                  placeholder="Enter amount"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              updateData('milestones', [...data.milestones, { title: '', description: '', dueDate: null, amount: 0 }]);
            }}
          >
            Add Milestone
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev}>Previous</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
};
