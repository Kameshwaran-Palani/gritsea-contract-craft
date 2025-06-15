
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ContractData } from '@/pages/ContractBuilder';
import { Palette } from 'lucide-react';

interface GlobalStylingProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
}

const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#14B8A6', '#8B5A2B', '#DC2626',
    '#7C3AED', '#059669', '#0EA5E9', '#D97706',
    '#BE185D', '#065F46', '#1E40AF', '#78350F',
    '#A21CAF', '#064E3B', '#1E3A8A', '#451A03',
    '#000000', '#374151', '#6B7280', '#9CA3AF',
    '#D1D5DB', '#E5E7EB', '#F3F4F6', '#FFFFFF'
];

const GlobalStyling: React.FC<GlobalStylingProps> = ({ data, updateData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Global Colors
          </div>
          <div className="flex items-center space-x-2">
              <Label htmlFor="apply-global" className="text-sm font-medium">Apply to All Sections</Label>
              <Switch
                  id="apply-global"
                  checked={data.applyGlobalStyles}
                  onCheckedChange={(checked) => updateData({ applyGlobalStyles: checked })}
              />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Header Color</Label>
          <div className="mt-2 space-y-3">
            <div className="grid grid-cols-8 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => updateData({ primaryColor: color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    data.primaryColor === color ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="customColor">Custom Header Color:</Label>
              <Input
                id="customColor"
                type="color"
                value={data.primaryColor}
                onChange={(e) => updateData({ primaryColor: e.target.value })}
                className="w-20 h-10"
              />
              <span className="text-sm text-muted-foreground">{data.primaryColor}</span>
            </div>
          </div>
        </div>
        <div className="pt-4">
          <Label>Body Text Color</Label>
          <div className="mt-2 flex items-center gap-2">
            <Input
              id="contentColor"
              type="color"
              value={data.contentColor || '#374151'}
              onChange={(e) => updateData({ contentColor: e.target.value })}
              className="w-20 h-10"
            />
            <span className="text-sm text-muted-foreground">{data.contentColor}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalStyling;
