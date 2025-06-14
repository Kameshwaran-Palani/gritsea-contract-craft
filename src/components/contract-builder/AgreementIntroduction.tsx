
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ContractData } from '@/pages/ContractBuilder';
import { FileText, Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AgreementIntroductionProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const AgreementIntroduction: React.FC<AgreementIntroductionProps> = ({
  data,
  updateData
}) => {
  const addClause = () => {
    const newClauses = [...(data.introductionClauses || []), ''];
    updateData({ introductionClauses: newClauses });
  };

  const updateClause = (index: number, value: string) => {
    const updatedClauses = [...(data.introductionClauses || [])];
    updatedClauses[index] = value;
    updateData({ introductionClauses: updatedClauses });
  };

  const removeClause = (index: number) => {
    const updatedClauses = (data.introductionClauses || []).filter((_, i) => i !== index);
    updateData({ introductionClauses: updatedClauses });
  };

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
              <FileText className="h-5 w-5" />
              Agreement Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.effectiveDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.effectiveDate ? format(new Date(data.effectiveDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.effectiveDate ? new Date(data.effectiveDate) : undefined}
                    onSelect={(date) => updateData({ effectiveDate: date ? date.toISOString().split('T')[0] : '' })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">
                The date when this agreement becomes effective
              </p>
            </div>

            <div>
              <Label htmlFor="agreementIntroText">Agreement Introduction Text</Label>
              <Textarea
                id="agreementIntroText"
                value={data.agreementIntroText || ''}
                onChange={(e) => updateData({ agreementIntroText: e.target.value })}
                placeholder="This Service Agreement (&quot;Agreement&quot;) is entered into between the parties identified below for the provision of professional services as outlined in this document."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Customize the opening text that introduces your agreement
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Additional Introduction Clauses</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addClause}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Clause
                </Button>
              </div>
              
              {(data.introductionClauses || []).map((clause, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Textarea
                    value={clause}
                    onChange={(e) => updateClause(index, e.target.value)}
                    placeholder="Enter additional clause or condition..."
                    className="flex-1 resize-none"
                    rows={2}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeClause(index)}
                    className="text-destructive hover:text-destructive mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <p className="text-xs text-muted-foreground">
                Add any additional clauses or conditions for the agreement introduction
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AgreementIntroduction;
