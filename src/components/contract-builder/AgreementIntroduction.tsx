
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractData } from '@/pages/ContractBuilder';
import { FileText, Calendar } from 'lucide-react';

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
              <Input
                id="effectiveDate"
                type="date"
                value={data.effectiveDate || ''}
                onChange={(e) => updateData({ effectiveDate: e.target.value })}
              />
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AgreementIntroduction;
