import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ContractData } from '@/pages/ContractBuilder';
import { Copyright, Users, User } from 'lucide-react';

interface IntellectualPropertyProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const IntellectualProperty: React.FC<IntellectualPropertyProps> = ({
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
              <Copyright className="h-5 w-5" />
              Intellectual Property Ownership
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Who owns the intellectual property?</Label>
              <RadioGroup
                value={data.ipOwnership}
                onValueChange={(value) => updateData({ ipOwnership: value as 'freelancer' | 'client' | 'joint' })}
                className="mt-3"
              >
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      data.ipOwnership === 'client' ? 'border-accent bg-accent/5' : 'border-border'
                    }`}
                  >
                    <RadioGroupItem value="client" id="client" className="mt-1" />
                    <div className="flex-1">
                      <label htmlFor="client" className="flex items-center gap-2 font-medium cursor-pointer">
                        <User className="h-4 w-4" />
                        Client Owns IP (Most Common)
                      </label>
                      <div className="mt-2 text-xs text-green-600">
                        ✅ Higher rates justified • ✅ Client has full control • ✅ No future restrictions
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      data.ipOwnership === 'freelancer' ? 'border-accent bg-accent/5' : 'border-border'
                    }`}
                  >
                    <RadioGroupItem value="freelancer" id="freelancer" className="mt-1" />
                    <div className="flex-1">
                      <label htmlFor="freelancer" className="flex items-center gap-2 font-medium cursor-pointer">
                        <User className="h-4 w-4" />
                        Freelancer Retains IP
                      </label>
                      <div className="mt-2 text-xs text-orange-600">
                        ⚠️ Lower rates expected • ⚠️ Limited client control • ⚠️ Usage restrictions apply
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      data.ipOwnership === 'joint' ? 'border-accent bg-accent/5' : 'border-border'
                    }`}
                  >
                    <RadioGroupItem value="joint" id="joint" className="mt-1" />
                    <div className="flex-1">
                      <label htmlFor="joint" className="flex items-center gap-2 font-medium cursor-pointer">
                        <Users className="h-4 w-4" />
                        Joint Ownership
                      </label>
                      <div className="mt-2 text-xs text-blue-600">
                        ℹ️ Shared revenue potential • ℹ️ Requires detailed terms • ℹ️ Complex to manage
                      </div>
                    </div>
                  </motion.div>
                </div>
              </RadioGroup>
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
            <CardTitle>Usage Rights & Licensing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Client's Usage Rights</Label>
              <Select 
                value={data.usageRights} 
                onValueChange={(value) => updateData({ usageRights: value as 'limited' | 'full' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Rights (Modify, Distribute, Sublicense)</SelectItem>
                  <SelectItem value="limited">Limited Rights (Use Only, No Modification)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Full Rights Include:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Modify and edit the work</li>
                  <li>• Create derivative works</li>
                  <li>• Distribute and publish</li>
                  <li>• Transfer rights to others</li>
                  <li>• Commercial usage</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Limited Rights Include:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use as delivered only</li>
                  <li>• No modifications allowed</li>
                  <li>• Specific purpose usage</li>
                  <li>• Credit/attribution required</li>
                  <li>• Non-transferable license</li>
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
            <CardTitle>Portfolio & Credit Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Standard Portfolio Rights</h4>
              <p className="text-sm text-blue-800 mb-3">
                Regardless of IP ownership, you typically retain the right to:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Display work in your portfolio</li>
                <li>• Use as case studies (with client permission)</li>
                <li>• Credit yourself as the creator</li>
                <li>• Reference the project for future clients</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default IntellectualProperty;
