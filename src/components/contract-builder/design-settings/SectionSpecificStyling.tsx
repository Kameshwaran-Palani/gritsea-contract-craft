
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Brush } from 'lucide-react';
import { ContractData, SectionDesign } from '@/pages/ContractBuilder';

interface SectionSpecificStylingProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
}

const contentSections = [
    { id: 'introduction', title: 'Agreement Introduction' },
    { id: 'parties', title: 'Parties Information' },
    { id: 'scope', title: 'Scope of Work' },
    { id: 'payment', title: 'Payment Terms' },
    { id: 'timeline', title: 'Project Timeline' },
    { id: 'sla', title: 'Service Level Agreement' },
    { id: 'ip', title: 'Intellectual Property' },
    { id: 'nda', title: 'Confidentiality' },
    { id: 'termination', title: 'Termination' },
    { id: 'signatures', title: 'Digital Signatures' },
];

interface SectionControlsProps {
    sectionId: string;
    data: ContractData;
    updateData: (updates: Partial<ContractData>) => void;
}

const SectionControls: React.FC<SectionControlsProps> = ({ sectionId, data, updateData }) => {
    const sectionStyle = data.sectionStyles?.[sectionId] || {};

    const handleUpdate = (updates: Partial<SectionDesign>) => {
        const updatePayload: Partial<ContractData> = {
            sectionStyles: {
                ...data.sectionStyles,
                [sectionId]: {
                    ...(data.sectionStyles?.[sectionId] || {}),
                    ...updates,
                },
            },
        };
        
        if (data.applyGlobalStyles) {
            updatePayload.applyGlobalStyles = false;
        }

        updateData(updatePayload);
    };

    return (
        <div className="space-y-4">
            <fieldset>
                <h4 className="font-medium text-sm mb-2">Header Styles</h4>
                <div className="space-y-3 p-3 border rounded-md">
                    <div>
                        <Label>Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Input
                                type="color"
                                value={sectionStyle.headerColor || data.primaryColor}
                                onChange={(e) => handleUpdate({ headerColor: e.target.value })}
                                className="w-16 h-8"
                            />
                            <span>{sectionStyle.headerColor || data.primaryColor}</span>
                        </div>
                    </div>
                    <div>
                        <Label>Alignment</Label>
                        <ToggleGroup
                            type="single"
                            value={sectionStyle.headerAlignment || data.headerAlignment}
                            onValueChange={(value: 'left' | 'center' | 'right') => {
                                if (value) handleUpdate({ headerAlignment: value });
                            }}
                            className="w-full justify-start gap-2 mt-1"
                        >
                            <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="right" aria-label="Align right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <div>
                        <Label htmlFor={`shfs-${sectionId}`}>Font Size (px)</Label>
                        <Input id={`shfs-${sectionId}`} type="number" placeholder="e.g. 20" value={sectionStyle.headerFontSize ?? data.sectionHeaderFontSize ?? ''} onChange={(e) => handleUpdate({ headerFontSize: Number(e.target.value) })} />
                    </div>
                </div>

                <h4 className="font-medium text-sm mt-4 mb-2">Content Styles</h4>
                <div className="space-y-3 p-3 border rounded-md">
                    <div>
                        <Label>Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Input
                                type="color"
                                value={sectionStyle.contentColor || data.contentColor}
                                onChange={(e) => handleUpdate({ contentColor: e.target.value })}
                                className="w-16 h-8"
                            />
                            <span>{sectionStyle.contentColor || data.contentColor}</span>
                        </div>
                    </div>
                    <div>
                        <Label>Alignment</Label>
                        <ToggleGroup
                            type="single"
                            value={sectionStyle.contentAlignment || data.contentAlignment}
                            onValueChange={(value: 'left' | 'center' | 'justify') => {
                                if (value) handleUpdate({ contentAlignment: value });
                            }}
                            className="w-full justify-start gap-2 mt-1"
                        >
                            <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="justify" aria-label="Align justify"><AlignJustify className="h-4 w-4" /></ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <div>
                        <Label htmlFor={`scfs-${sectionId}`}>Font Size (px)</Label>
                        <Input id={`scfs-${sectionId}`} type="number" placeholder="e.g. 12" value={sectionStyle.contentFontSize ?? data.bodyFontSize ?? ''} onChange={(e) => handleUpdate({ contentFontSize: Number(e.target.value) })} />
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

const SectionSpecificStyling: React.FC<SectionSpecificStylingProps> = ({ data, updateData }) => {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Brush className="h-5 w-5" />
                Section-Specific Styles
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" className="w-full">
                {contentSections.map(section => (
                    <AccordionItem key={section.id} value={section.id}>
                        <AccordionTrigger>{section.title}</AccordionTrigger>
                        <AccordionContent>
                            <SectionControls
                                sectionId={section.id}
                                data={data}
                                updateData={updateData}
                            />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
    </Card>
  );
};

export default SectionSpecificStyling;
