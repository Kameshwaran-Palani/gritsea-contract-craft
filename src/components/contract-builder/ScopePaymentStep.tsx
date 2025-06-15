
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InputCurrency } from '@/components/ui/input-currency';
import { ContractData } from '@/types/ContractData';

interface ScopePaymentStepProps {
  data: ContractData;
  updateData: (field: keyof ContractData, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ScopePaymentStep: React.FC<ScopePaymentStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Scope and Payment Terms</h2>
        <p className="text-muted-foreground">
          Define the scope of work, payment terms, and total contract amount.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scope of Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="introduction">Introduction</Label>
            <Textarea
              id="introduction"
              value={data.introduction}
              onChange={(e) => updateData('introduction', e.target.value)}
              placeholder="Provide a brief introduction to the contract."
            />
          </div>
          <div>
            <Label htmlFor="scopeOfWork">Detailed Scope of Work</Label>
            <Textarea
              id="scopeOfWork"
              value={data.scopeOfWork}
              onChange={(e) => updateData('scopeOfWork', e.target.value)}
              placeholder="Describe the services to be provided in detail."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="paymentTerms">Payment Terms Description</Label>
            <Textarea
              id="paymentTerms"
              value={data.paymentTerms}
              onChange={(e) => updateData('paymentTerms', e.target.value)}
              placeholder="Specify payment terms, methods, and conditions."
            />
          </div>
          <div>
            <Label htmlFor="totalAmount">Total Contract Amount</Label>
            <InputCurrency
              id="totalAmount"
              value={data.totalAmount}
              onValueChange={(value) => updateData('totalAmount', value)}
              placeholder="Enter the total contract amount"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.paymentSchedule.map((schedule, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Input
                  id={`description-${index}`}
                  value={schedule.description}
                  onChange={(e) => {
                    const newSchedule = [...data.paymentSchedule];
                    newSchedule[index].description = e.target.value;
                    updateData('paymentSchedule', newSchedule);
                  }}
                  placeholder="e.g., Initial Payment"
                />
              </div>
              <div>
                <Label htmlFor={`amount-${index}`}>Amount</Label>
                <InputCurrency
                  id={`amount-${index}`}
                  value={schedule.amount}
                  onValueChange={(value) => {
                    const newSchedule = [...data.paymentSchedule];
                    newSchedule[index].amount = value;
                    updateData('paymentSchedule', newSchedule);
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
              updateData('paymentSchedule', [...data.paymentSchedule, { description: '', amount: 0 }]);
            }}
          >
            Add Payment
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
