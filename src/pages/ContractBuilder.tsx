import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContractMilestone } from '@/components/contract-builder/ContractMilestone';
import { DatePicker } from '@/components/ui/date-picker';
import { InputCurrency } from '@/components/ui/input-currency';
import { SignatureStep } from '@/components/contract-builder/SignatureStep';

export interface ContractData {
  contractTitle: string;
  contractSubtitle: string;
  clientName: string;
  clientEmail: string;
  freelancerName: string;
  freelancerEmail: string;
  introduction: string;
  scopeOfWork: string;
  paymentTerms: string;
  totalAmount: number;
  paymentSchedule: { description: string; amount: number }[];
  timelineStartDate: Date | undefined;
  timelineEndDate: Date | undefined;
  milestones: { title: string; description: string; dueDate: Date | null; amount: number }[];
  confidentiality: boolean;
  intellectualProperty: string;
  terminationClause: string;
  governingLaw: string;
  disputeResolution: string;
  signature: string;
  freelancerSignature: string;
  signedDate: Date | undefined;
  shareInfo?: {
    link: string;
    secretKey: string;
    clientContact: string;
    authMethod: string;
  };
}

const ContractBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [activeStep, setActiveStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareInfo, setShareInfo] = useState<{
    link: string;
    secretKey: string;
    clientContact: string;
    authMethod: string;
  } | null>(null);
  const [status, setStatus] = useState('draft');
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<ContractData>({
    contractTitle: 'Service Agreement',
    contractSubtitle: 'General Service Contract',
    clientName: '',
    clientEmail: '',
    freelancerName: '',
    freelancerEmail: '',
    introduction: '',
    scopeOfWork: '',
    paymentTerms: '',
    totalAmount: 0,
    paymentSchedule: [{ description: '', amount: 0 }],
    timelineStartDate: undefined,
    timelineEndDate: undefined,
    milestones: [{ title: '', description: '', dueDate: null, amount: 0 }],
    confidentiality: false,
    intellectualProperty: '',
    terminationClause: '',
    governingLaw: '',
    disputeResolution: '',
    signature: '',
    freelancerSignature: '',
    signedDate: undefined,
    shareInfo: undefined
  });

  const steps = [
    { id: 'general', label: 'General Info' },
    { id: 'scope', label: 'Scope & Payments' },
    { id: 'timeline', label: 'Timeline & Milestones' },
    { id: 'legal', label: 'Legal Terms' },
    { id: 'signature', label: 'Signature' }
  ];

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  const updateData = (field: keyof ContractData, value: any) => {
    setData(prevData => ({ ...prevData, [field]: value }));
  };

  const nextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
  };

  const calculateProgress = () => {
    let completed = 0;
    if (data.contractTitle) completed += 1;
    if (data.clientName) completed += 1;
    if (data.freelancerName) completed += 1;
    if (data.scopeOfWork) completed += 1;
    if (data.paymentTerms) completed += 1;

    const calculatedProgress = Math.min((completed / 5) * 100, 100);
    setProgress(calculatedProgress);
  };

  useEffect(() => {
    calculateProgress();
  }, [data]);

  useEffect(() => {
    if (id) {
      loadContract(id);
    }
  }, [id]);

  const loadContract = async (contractId: string) => {
    try {
      const { data: contract, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) {
        throw error;
      }

      if (contract) {
        setData(contract);
        setStatus(contract.status || 'draft');
        setShareInfo(contract.shareInfo || null);
      }
    } catch (error: any) {
      console.error('Error loading contract:', error.message);
      toast({
        title: "Error",
        description: "Failed to load contract. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveContract = async () => {
    setIsSaving(true);
    try {
      const contractData = {
        ...data,
        user_id: user?.id,
        status: status
      };

      if (id) {
        // Update existing contract
        const { error } = await supabase
          .from('contracts')
          .update(contractData)
          .eq('id', id);

        if (error) {
          throw error;
        }

        toast({
          title: "Contract Updated",
          description: "Contract has been updated successfully."
        });
      } else {
        // Create new contract
        const { data: newContract, error } = await supabase
          .from('contracts')
          .insert([contractData])
          .select()

        if (error) {
          throw error;
        }

        toast({
          title: "Contract Saved",
          description: "Contract has been saved successfully."
        });

        // Redirect to the edit page for the new contract
        if (newContract && newContract.length > 0) {
          navigate(`/contract/${newContract[0].id}`);
        }
      }
    } catch (error: any) {
      console.error('Error saving contract:', error.message);
      toast({
        title: "Error",
        description: "Failed to save contract. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async (authMethod: string, clientContact: string) => {
    setShareLoading(true);
    try {
      // Mock API call to generate eSign link and secret key
      const mockResponse = {
        link: `${window.location.origin}/esign/${id}/${authMethod}`,
        secretKey: 'ABC123XYZ',
        clientContact: clientContact,
        authMethod: authMethod
      };

      // Update contract with share info
      const shareData = {
        link: mockResponse.link,
        secretKey: mockResponse.secretKey,
        clientContact: mockResponse.clientContact,
        authMethod: mockResponse.authMethod
      };

      const { error } = await supabase
        .from('contracts')
        .update({ shareInfo: shareData, status: 'sent_for_signature' })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setData(prevData => ({ ...prevData, shareInfo: shareData }));
      setShareInfo(shareData);
      setStatus('sent_for_signature');

      toast({
        title: "eSign Link Generated",
        description: "eSign link has been generated and sent to the client."
      });
    } catch (error: any) {
      console.error('Error sharing contract:', error.message);
      toast({
        title: "Error",
        description: "Failed to generate eSign link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShareLoading(false);
    }
  };

  // Emit contract data updates for PDF generation
  useEffect(() => {
    const event = new CustomEvent('contractDataUpdated', { detail: data });
    window.dispatchEvent(event);
  }, [data]);

  // Handle automatic eSign when freelancer signs
  useEffect(() => {
    if (data.freelancerSignature && data.freelancerName && !data.shareInfo) {
      // Automatically trigger eSign when freelancer completes their signature
      handleShare('email', data.clientEmail || 'client@example.com');
    }
  }, [data.freelancerSignature, data.freelancerName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-indigo-100/20">
      <div className="container mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Contract Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground">{progress}% completed</p>
                </div>
                <Separator className="my-4" />
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <Button
                      key={step.id}
                      variant={activeStep === index ? 'secondary' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setActiveStep(index)}
                    >
                      {step.label}
                    </Button>
                  ))}
                </div>
                <Separator className="my-4" />
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={saveContract}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Contract'}
                </Button>
              </CardContent>
            </Card>
            <ContractMilestone 
              contractId={id || 'new'}
              status={status}
              shareInfo={shareInfo}
            />
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {activeStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">General Information</h2>
                  <p className="text-muted-foreground">
                    Enter basic details about the contract and the parties involved.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Contract Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="contractTitle">Contract Title</Label>
                      <Input
                        id="contractTitle"
                        value={data.contractTitle}
                        onChange={(e) => updateData('contractTitle', e.target.value)}
                        placeholder="e.g., Service Agreement"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contractSubtitle">Contract Subtitle</Label>
                      <Input
                        id="contractSubtitle"
                        value={data.contractSubtitle}
                        onChange={(e) => updateData('contractSubtitle', e.target.value)}
                        placeholder="e.g., General Service Contract"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={data.clientName}
                        onChange={(e) => updateData('clientName', e.target.value)}
                        placeholder="Enter client name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Client Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={data.clientEmail}
                        onChange={(e) => updateData('clientEmail', e.target.value)}
                        placeholder="Enter client email"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="freelancerName">Your Name</Label>
                      <Input
                        id="freelancerName"
                        value={data.freelancerName}
                        onChange={(e) => updateData('freelancerName', e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="freelancerEmail">Your Email</Label>
                      <Input
                        id="freelancerEmail"
                        type="email"
                        value={data.freelancerEmail}
                        onChange={(e) => updateData('freelancerEmail', e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                  <Button onClick={nextStep}>Next</Button>
                </div>
              </div>
            )}

            {activeStep === 1 && (
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
                  <Button variant="outline" onClick={prevStep}>Previous</Button>
                  <Button onClick={nextStep}>Next</Button>
                </div>
              </div>
            )}

            {activeStep === 2 && (
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
                              newMilestones[index].dueDate = date;
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
                  <Button variant="outline" onClick={prevStep}>Previous</Button>
                  <Button onClick={nextStep}>Next</Button>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Legal Terms and Clauses</h2>
                  <p className="text-muted-foreground">
                    Define the legal terms, confidentiality, and dispute resolution methods.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Confidentiality Clause</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="confidentiality">Include Confidentiality Clause</Label>
                      <Switch
                        id="confidentiality"
                        checked={data.confidentiality}
                        onCheckedChange={(checked) => updateData('confidentiality', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Intellectual Property</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="intellectualProperty">Intellectual Property Rights</Label>
                      <Textarea
                        id="intellectualProperty"
                        value={data.intellectualProperty}
                        onChange={(e) => updateData('intellectualProperty', e.target.value)}
                        placeholder="Specify intellectual property rights and ownership."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Termination Clause</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="terminationClause">Termination Clause</Label>
                      <Textarea
                        id="terminationClause"
                        value={data.terminationClause}
                        onChange={(e) => updateData('terminationClause', e.target.value)}
                        placeholder="Define the conditions for contract termination."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Governing Law and Dispute Resolution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="governingLaw">Governing Law</Label>
                      <Input
                        id="governingLaw"
                        value={data.governingLaw}
                        onChange={(e) => updateData('governingLaw', e.target.value)}
                        placeholder="Specify the governing law for the contract."
                      />
                    </div>
                    <div>
                      <Label htmlFor="disputeResolution">Dispute Resolution</Label>
                      <Textarea
                        id="disputeResolution"
                        value={data.disputeResolution}
                        onChange={(e) => updateData('disputeResolution', e.target.value)}
                        placeholder="Describe the dispute resolution process."
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep}>Previous</Button>
                  <Button onClick={nextStep}>Next</Button>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <SignatureStep
                data={data}
                updateData={updateData}
                onNext={nextStep}
                onPrev={prevStep}
                isFirst={isFirstStep}
                isLast={isLastStep}
              />
            )}
          </div>
        </div>
      </div>

      {/* Contract Preview */}
      <div className="contract-preview hidden">
        <div>
          <h1>{data.contractTitle}</h1>
          <h2>{data.contractSubtitle}</h2>
          <hr />
          <section>
            <h3>Introduction</h3>
            <p>{data.introduction}</p>
          </section>
          <section>
            <h3>Scope of Work</h3>
            <p>{data.scopeOfWork}</p>
          </section>
          <section>
            <h3>Payment Terms</h3>
            <p>{data.paymentTerms}</p>
            <h4>Total Amount</h4>
            <p>{data.totalAmount}</p>
            <h4>Payment Schedule</h4>
            {data.paymentSchedule.map((item, index) => (
              <div key={index}>
                <p>{item.description}: {item.amount}</p>
              </div>
            ))}
          </section>
          <section>
            <h3>Timeline</h3>
            <p>Start Date: {data.timelineStartDate?.toLocaleDateString()}</p>
            <p>End Date: {data.timelineEndDate?.toLocaleDateString()}</p>
            <h4>Milestones</h4>
            {data.milestones.map((milestone, index) => (
              <div key={index}>
                <p>{milestone.title}: {milestone.description} - {milestone.dueDate?.toLocaleDateString()} - {milestone.amount}</p>
              </div>
            ))}
          </section>
          <section>
            <h3>Legal Terms</h3>
            <h4>Confidentiality</h4>
            <p>{data.confidentiality ? 'Included' : 'Not Included'}</p>
            <h4>Intellectual Property</h4>
            <p>{data.intellectualProperty}</p>
            <h4>Termination Clause</h4>
            <p>{data.terminationClause}</p>
            <h4>Governing Law</h4>
            <p>{data.governingLaw}</p>
            <h4>Dispute Resolution</h4>
            <p>{data.disputeResolution}</p>
          </section>
          <section>
            <h3>Signatures</h3>
            <p>Freelancer: {data.freelancerName}</p>
            <p>Client: {data.clientName}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContractBuilder;
