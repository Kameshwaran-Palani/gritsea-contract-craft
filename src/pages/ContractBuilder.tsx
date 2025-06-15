import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Save, Eye, Sparkles, FileText, Download, Send, Lock, Clock, Copy, Mail, Phone, KeyRound, AlertCircle } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContractStatusBadge from '@/components/contract-builder/ContractStatusBadge';
import ESignDialog from '@/components/contract-builder/ESignDialog';
import TemplateSelection from '@/components/contract-builder/TemplateSelection';
import DocumentHeaders from '@/components/contract-builder/DocumentHeaders';
import AgreementIntroduction from '@/components/contract-builder/AgreementIntroduction';
import PartiesInformation from '@/components/contract-builder/PartiesInformation';
import ScopeOfWork from '@/components/contract-builder/ScopeOfWork';
import PaymentTerms from '@/components/contract-builder/PaymentTerms';
import OngoingWork from '@/components/contract-builder/OngoingWork';
import ServiceLevelAgreement from '@/components/contract-builder/ServiceLevelAgreement';
import Confidentiality from '@/components/contract-builder/Confidentiality';
import IntellectualProperty from '@/components/contract-builder/IntellectualProperty';
import TerminationDispute from '@/components/contract-builder/TerminationDispute';
import SignatureStep from '@/components/contract-builder/SignatureStep';
import DesignCustomization from '@/components/contract-builder/DesignCustomization';
import ContractPreview from '@/components/contract-builder/ContractPreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ContractData {
  // Template
  templateId?: string;
  templateName?: string;
  
  // Document Headers
  documentTitle: string;
  documentSubtitle: string;
  
  // Brand Logos
  leftLogo?: string;
  rightLogo?: string;
  logoStyle: 'round' | 'rectangle';
  
  // Design
  primaryColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  lineSpacing?: number;
  headingStyle?: string;
  listStyle?: string;
  textAlignment?: string;
  paragraphSpacing?: number;
  
  // Section-specific formatting
  partiesBold?: boolean;
  partiesBullets?: boolean;
  scopeBold?: boolean;
  scopeBullets?: boolean;
  paymentBold?: boolean;
  paymentBullets?: boolean;
  termsBold?: boolean;
  termsBullets?: boolean;
  
  // Parties
  freelancerName: string;
  freelancerBusinessName?: string;
  freelancerAddress: string;
  freelancerEmail: string;
  freelancerPhone?: string;
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientPhone?: string;
  startDate: string;
  endDate?: string;
  
  // Scope
  services: string;
  deliverables: string;
  milestones: Array<{ title: string; description: string; dueDate: string; amount?: number }>;
  
  // Payment
  paymentType: 'fixed' | 'hourly';
  rate: number;
  totalAmount?: number;
  paymentSchedule: Array<{ description: string; percentage: number; dueDate?: string }>;
  lateFeeEnabled: boolean;
  lateFeeAmount?: number;
  
  // Ongoing Work
  isRetainer: boolean;
  retainerAmount?: number;
  renewalCycle?: 'monthly' | 'quarterly' | 'yearly';
  autoRenew: boolean;
  
  // SLA
  responseTime: string;
  revisionLimit: number;
  uptimeRequirement?: string;
  
  // NDA
  includeNDA: boolean;
  confidentialityScope?: string;
  confidentialityDuration?: string;
  breachPenalty?: number;
  
  // IP
  ipOwnership: 'freelancer' | 'client' | 'joint';
  usageRights: 'limited' | 'full';
  
  // Termination
  terminationConditions: string;
  noticePeriod: string;
  jurisdiction: string;
  arbitrationClause: boolean;
  
  // Signature
  freelancerSignature?: string;
  clientSignature?: string;
  signedDate?: string;
  
  // Security
  accessKey?: string;
  
  // Agreement Introduction
  agreementIntroText: string;
  effectiveDate: string;
  introductionClauses?: string[];
  
  // Font size controls
  headerFontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  sectionHeaderFontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  subHeaderFontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  bodyFontSize?: 'small' | 'medium' | 'large' | 'xlarge';
}

const ContractBuilder = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  
  // Determine if this is editing mode
  const isEditMode = Boolean(id);
  
  // Filter steps based on edit mode - split into Edit and Design tabs
  const EDIT_STEPS = [
    ...(isEditMode ? [] : [{ id: 'template', title: 'Choose Template', component: TemplateSelection }]),
    { id: 'headers', title: 'Document Headers', component: DocumentHeaders },
    { id: 'introduction', title: 'Agreement Introduction', component: AgreementIntroduction },
    { id: 'parties', title: 'Parties Information', component: PartiesInformation },
    { id: 'scope', title: 'Scope of Work', component: ScopeOfWork },
    { id: 'payment', title: 'Payment Terms', component: PaymentTerms },
    { id: 'ongoing', title: 'Ongoing Work', component: OngoingWork },
    { id: 'sla', title: 'Service Level Agreement', component: ServiceLevelAgreement },
    { id: 'nda', title: 'Confidentiality', component: Confidentiality },
    { id: 'ip', title: 'Intellectual Property', component: IntellectualProperty },
    { id: 'termination', title: 'Termination & Dispute', component: TerminationDispute },
    { id: 'signature', title: 'Signature', component: SignatureStep },
  ];

  const DESIGN_STEPS = [
    { id: 'design', title: 'Design & Branding', component: DesignCustomization },
  ];
  
  const [activeTab, setActiveTab] = useState('edit');
  const [activeSection, setActiveSection] = useState<string | undefined>(isEditMode ? 'headers' : 'template');
  const [contractData, setContractData] = useState<ContractData>({
    documentTitle: 'SERVICE AGREEMENT',
    documentSubtitle: 'PROFESSIONAL SERVICE CONTRACT',
    agreementIntroText: 'This Service Agreement ("Agreement") is entered into between the parties identified below for the provision of professional services as outlined in this document.',
    effectiveDate: '',
    logoStyle: 'round',
    primaryColor: '#3B82F6',
    fontFamily: 'inter',
    fontSize: 'medium',
    lineSpacing: 1.5,
    headingStyle: 'h1',
    listStyle: 'ul',
    textAlignment: 'left',
    paragraphSpacing: 1.5,
    partiesBold: false,
    partiesBullets: false,
    scopeBold: false,
    scopeBullets: false,
    paymentBold: false,
    paymentBullets: false,
    termsBold: false,
    termsBullets: false,
    freelancerName: '',
    freelancerAddress: '',
    freelancerEmail: '',
    clientName: '',
    clientEmail: '',
    startDate: '',
    services: '',
    deliverables: '',
    milestones: [],
    paymentType: 'fixed',
    rate: 0,
    paymentSchedule: [{ description: 'Full payment', percentage: 100 }],
    lateFeeEnabled: false,
    isRetainer: false,
    autoRenew: false,
    responseTime: '24 hours',
    revisionLimit: 3,
    includeNDA: true,
    ipOwnership: 'client',
    usageRights: 'full',
    terminationConditions: 'Either party may terminate this agreement with written notice.',
    noticePeriod: '30 days',
    jurisdiction: 'India',
    arbitrationClause: true
  });
  
  const [contractId, setContractId] = useState<string | null>(id || null);
  const [contractStatus, setContractStatus] = useState<'draft' | 'sent' | 'signed' | 'cancelled' | 'sent_for_signature' | 'revision_requested'>('draft');
  const [saving, setSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showESignDialog, setShowESignDialog] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [shareInfo, setShareInfo] = useState<{
    link: string;
    secretKey: string;
    clientContact: string;
    authMethod: string;
  } | null>(null);

  // Auto-save functionality with debounce
  const debouncedSave = useCallback(
    debounce(() => {
      if (contractData && user && !isLocked) {
        saveProgress(true); // Pass true to indicate this is an auto-save
      }
    }, 2000), // Save after 2 seconds of no changes
    [contractData, user, isLocked]
  );

  // Debounce utility function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  useEffect(() => {
    if (user) {
      setContractData(prev => ({
        ...prev,
        freelancerName: user.user_metadata?.full_name || '',
        freelancerEmail: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (id && user) {
      loadContract(id);
    }
  }, [id, user]);

  // Auto-save when contract data changes
  useEffect(() => {
    if (contractId && user && !isLocked) {
      debouncedSave();
    }
  }, [contractData, contractId, user, isLocked, debouncedSave]);

  // Check if contract can be unlocked (24 hours passed)
  useEffect(() => {
    if (isLocked && lockedAt) {
      const lockTime = new Date(lockedAt).getTime();
      const now = new Date().getTime();
      const hoursPassed = (now - lockTime) / (1000 * 60 * 60);
      
      if (hoursPassed >= 24) {
        unlockContract();
      }
    }
  }, [isLocked, lockedAt]);

  const unlockContract = async () => {
    if (!contractId) return;
    
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          is_locked: false,
          locked_at: null
        })
        .eq('id', contractId);
      
      if (error) throw error;
      
      setIsLocked(false);
      setLockedAt(null);
      
      toast({
        title: "Contract Unlocked",
        description: "24 hours have passed. You can now edit the contract again."
      });
    } catch (error) {
      console.error('Error unlocking contract:', error);
    }
  };

  const loadContract = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      
      if (data && data.clauses_json) {
        const loadedData = data.clauses_json as unknown as ContractData;
        setContractData({
          ...loadedData,
          documentTitle: loadedData.documentTitle || 'SERVICE AGREEMENT',
          documentSubtitle: loadedData.documentSubtitle || 'PROFESSIONAL SERVICE CONTRACT',
          logoStyle: loadedData.logoStyle || 'round',
          primaryColor: loadedData.primaryColor || '#3B82F6',
          fontFamily: loadedData.fontFamily || 'inter',
          fontSize: loadedData.fontSize || 'medium',
          lineSpacing: loadedData.lineSpacing || 1.5,
          headingStyle: loadedData.headingStyle || 'h1',
          listStyle: loadedData.listStyle || 'ul',
          textAlignment: loadedData.textAlignment || 'left',
          paragraphSpacing: loadedData.paragraphSpacing || 1.5,
          partiesBold: loadedData.partiesBold || false,
          partiesBullets: loadedData.partiesBullets || false,
          scopeBold: loadedData.scopeBold || false,
          scopeBullets: loadedData.scopeBullets || false,
          paymentBold: loadedData.paymentBold || false,
          paymentBullets: loadedData.paymentBullets || false,
          termsBold: loadedData.termsBold || false,
          termsBullets: loadedData.termsBullets || false
        });
        setContractId(data.id);
        setContractStatus(data.status || 'draft');
        
        // Only lock if status is 'sent_for_signature' and no revision is requested
        setIsLocked(data.status === 'sent_for_signature' && data.is_locked);
      }
    } catch (error) {
      console.error('Error loading contract:', error);
      toast({
        title: "Error",
        description: "Failed to load contract",
        variant: "destructive"
      });
    }
  };

  const saveProgress = async (isAutoSave = false) => {
    if (!user || isLocked) return;
    
    setSaving(true);
    try {
      const contractPayload = {
        user_id: user.id,
        title: contractData.templateName || `Contract with ${contractData.clientName || 'Client'}`,
        status: contractStatus,
        client_name: contractData.clientName,
        client_email: contractData.clientEmail,
        client_phone: contractData.clientPhone,
        scope_of_work: contractData.services,
        payment_terms: JSON.stringify(contractData.paymentSchedule),
        project_timeline: contractData.endDate,
        contract_amount: contractData.totalAmount || contractData.rate,
        clauses_json: contractData as any
      };

      if (contractId) {
        const { error } = await supabase
          .from('contracts')
          .update(contractPayload)
          .eq('id', contractId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('contracts')
          .insert(contractPayload)
          .select('id')
          .single();
        if (error) throw error;
        setContractId(data.id);
        navigate(`/contract/edit/${data.id}`, { replace: true });
      }
      
      // Only show toast for manual saves, not auto-saves
      if (!isAutoSave && !isLocked) {
        toast({
          title: "Saved",
          description: "Your contract has been saved successfully.",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      toast({
        title: "Error",
        description: "Failed to save contract",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateContractData = (updates: Partial<ContractData>) => {
    if (!isLocked) {
      setContractData(prev => ({ ...prev, ...updates }));
    }
  };

  const handleSectionChange = (value: string | undefined) => {
    setActiveSection(value);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your PDF..."
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkNewPage = (neededHeight: number) => {
        if (yPosition + neededHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number, fontStyle: string = 'normal', color: string = '#000000') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        
        // Convert hex color to RGB
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          pdf.setTextColor(r, g, b);
        } else {
          pdf.setTextColor(0, 0, 0);
        }

        const lines = pdf.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.4;
        
        checkNewPage(lines.length * lineHeight);
        
        lines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        
        return lines.length * lineHeight;
      };

      // Header Section
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(contractData.documentTitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(contractData.documentSubtitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Add a line separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Agreement Introduction - only if text exists
      if (contractData.agreementIntroText && contractData.agreementIntroText.trim()) {
        addText('AGREEMENT INTRODUCTION', 16, 'bold', contractData.primaryColor);
        yPosition += 5;
        addText(contractData.agreementIntroText, 12);
        yPosition += 8;
        
        if (contractData.effectiveDate) {
          addText(`Effective Date: ${new Date(contractData.effectiveDate).toLocaleDateString()}`, 12, 'bold');
          yPosition += 10;
        }
      }

      // Parties Information - only if required fields exist
      if (contractData.freelancerName || contractData.clientName) {
        addText('PARTIES TO THE AGREEMENT', 16, 'bold', contractData.primaryColor);
        yPosition += 5;

        if (contractData.freelancerName) {
          addText('Service Provider:', 14, 'bold');
          yPosition += 2;
          addText(`Name: ${contractData.freelancerName}`, 12);
          if (contractData.freelancerBusinessName && contractData.freelancerBusinessName.trim()) {
            addText(`Business: ${contractData.freelancerBusinessName}`, 12);
          }
          if (contractData.freelancerAddress && contractData.freelancerAddress.trim()) {
            addText(`Address: ${contractData.freelancerAddress}`, 12);
          }
          if (contractData.freelancerEmail && contractData.freelancerEmail.trim()) {
            addText(`Email: ${contractData.freelancerEmail}`, 12);
          }
          if (contractData.freelancerPhone && contractData.freelancerPhone.trim()) {
            addText(`Phone: ${contractData.freelancerPhone}`, 12);
          }
          yPosition += 8;
        }

        if (contractData.clientName) {
          addText('Client:', 14, 'bold');
          yPosition += 2;
          addText(`Name: ${contractData.clientName}`, 12);
          if (contractData.clientCompany && contractData.clientCompany.trim()) {
            addText(`Company: ${contractData.clientCompany}`, 12);
          }
          if (contractData.clientEmail && contractData.clientEmail.trim()) {
            addText(`Email: ${contractData.clientEmail}`, 12);
          }
          if (contractData.clientPhone && contractData.clientPhone.trim()) {
            addText(`Phone: ${contractData.clientPhone}`, 12);
          }
          yPosition += 10;
        }
      }

      // Scope of Work - only if services or deliverables exist
      if ((contractData.services && contractData.services.trim()) || 
          (contractData.deliverables && contractData.deliverables.trim()) || 
          (contractData.milestones && contractData.milestones.length > 0)) {
        addText('SCOPE OF WORK', 16, 'bold', contractData.primaryColor);
        yPosition += 5;
        
        if (contractData.services && contractData.services.trim()) {
          addText('Services:', 14, 'bold');
          yPosition += 2;
          addText(contractData.services, 12);
          yPosition += 8;
        }

        if (contractData.deliverables && contractData.deliverables.trim()) {
          addText('Deliverables:', 14, 'bold');
          yPosition += 2;
          addText(contractData.deliverables, 12);
          yPosition += 8;
        }

        // Milestones - only if they exist
        if (contractData.milestones && contractData.milestones.length > 0) {
          addText('Milestones:', 14, 'bold');
          yPosition += 2;
          contractData.milestones.forEach((milestone, index) => {
            if (milestone.title && milestone.title.trim()) {
              addText(`${index + 1}. ${milestone.title}`, 12, 'bold');
              if (milestone.description && milestone.description.trim()) {
                addText(`   ${milestone.description}`, 12);
              }
              if (milestone.dueDate) {
                addText(`   Due: ${new Date(milestone.dueDate).toLocaleDateString()}`, 12);
              }
              if (milestone.amount) {
                addText(`   Amount: ₹${milestone.amount.toLocaleString()}`, 12);
              }
              yPosition += 3;
            }
          });
          yPosition += 5;
        }
      }

      // Payment Terms - only if payment info exists
      if (contractData.rate > 0 || contractData.totalAmount || 
          (contractData.paymentSchedule && contractData.paymentSchedule.length > 0)) {
        addText('PAYMENT TERMS', 16, 'bold', contractData.primaryColor);
        yPosition += 5;

        if (contractData.paymentType === 'hourly' && contractData.rate > 0) {
          addText(`Hourly Rate: ₹${contractData.rate?.toLocaleString()} per hour`, 12, 'bold');
        } else if (contractData.totalAmount && contractData.totalAmount > 0) {
          addText(`Total Project Amount: ₹${contractData.totalAmount?.toLocaleString()}`, 12, 'bold');
        }
        yPosition += 5;

        // Payment Schedule - only if exists and has valid entries
        if (contractData.paymentType === 'fixed' && contractData.paymentSchedule && 
            contractData.paymentSchedule.length > 0 && contractData.totalAmount) {
          const validPayments = contractData.paymentSchedule.filter(p => p.percentage > 0);
          if (validPayments.length > 0) {
            addText('Payment Schedule:', 14, 'bold');
            yPosition += 2;
            validPayments.forEach((payment, index) => {
              const amount = contractData.totalAmount ? (contractData.totalAmount * payment.percentage) / 100 : 0;
              addText(`${payment.description || `Payment ${index + 1}`}: ${payment.percentage}% - ₹${amount.toLocaleString()}`, 12);
              if (payment.dueDate) {
                addText(`Due: ${new Date(payment.dueDate).toLocaleDateString()}`, 12);
              }
            });
            yPosition += 8;
          }
        }

        // Late Fee - only if enabled
        if (contractData.lateFeeEnabled && contractData.lateFeeAmount && contractData.lateFeeAmount > 0) {
          addText(`Late Fee: ₹${contractData.lateFeeAmount} per day for payments made after the due date.`, 12);
          yPosition += 8;
        }
      }

      // Project Timeline - only if dates exist
      if (contractData.startDate || contractData.endDate) {
        addText('PROJECT TIMELINE', 16, 'bold', contractData.primaryColor);
        yPosition += 5;
        if (contractData.startDate) {
          addText(`Start Date: ${new Date(contractData.startDate).toLocaleDateString()}`, 12);
        }
        if (contractData.endDate) {
          addText(`End Date: ${new Date(contractData.endDate).toLocaleDateString()}`, 12);
        }
        yPosition += 10;
      }

      // Ongoing Work - only if retainer is enabled
      if (contractData.isRetainer && contractData.retainerAmount && contractData.retainerAmount > 0) {
        addText('ONGOING WORK TERMS', 16, 'bold', contractData.primaryColor);
        yPosition += 5;
        addText(`Monthly Retainer: ₹${contractData.retainerAmount.toLocaleString()}`, 12, 'bold');
        if (contractData.renewalCycle) {
          addText(`Renewal Cycle: ${contractData.renewalCycle}`, 12);
        }
        addText(`Auto Renewal: ${contractData.autoRenew ? 'Yes' : 'No'}`, 12);
        yPosition += 10;
      }

      // Service Level Agreement
      addText('SERVICE LEVEL AGREEMENT', 16, 'bold', contractData.primaryColor);
      yPosition += 5;
      addText(`Response Time: ${contractData.responseTime}`, 12);
      addText(`Revision Limit: ${contractData.revisionLimit} revisions included`, 12);
      if (contractData.uptimeRequirement && contractData.uptimeRequirement.trim()) {
        addText(`Uptime Requirement: ${contractData.uptimeRequirement}`, 12);
      }
      yPosition += 10;

      // Confidentiality - only if NDA is included
      if (contractData.includeNDA) {
        addText('CONFIDENTIALITY & NON-DISCLOSURE', 16, 'bold', contractData.primaryColor);
        yPosition += 5;
        addText('Both parties agree to maintain confidentiality of all proprietary information shared during this engagement.', 12);
        if (contractData.confidentialityScope && contractData.confidentialityScope.trim()) {
          addText(`Scope: ${contractData.confidentialityScope}`, 12);
        }
        if (contractData.confidentialityDuration && contractData.confidentialityDuration.trim()) {
          addText(`Duration: ${contractData.confidentialityDuration}`, 12);
        }
        if (contractData.breachPenalty && contractData.breachPenalty > 0) {
          addText(`Breach Penalty: ₹${contractData.breachPenalty.toLocaleString()}`, 12);
        }
        yPosition += 10;
      }

      // Intellectual Property
      addText('INTELLECTUAL PROPERTY RIGHTS', 16, 'bold', contractData.primaryColor);
      yPosition += 5;
      const ipText = contractData.ipOwnership === 'client' ? 'Client owns all work product' : 
                     contractData.ipOwnership === 'freelancer' ? 'Service Provider retains ownership' : 
                     'Joint ownership as specified';
      addText(`Ownership: ${ipText}`, 12);
      const usageText = contractData.usageRights === 'full' ? 'Full usage rights granted' : 'Limited usage rights as specified';
      addText(`Usage Rights: ${usageText}`, 12);
      yPosition += 10;

      // Termination & Dispute Resolution
      addText('TERMINATION & DISPUTE RESOLUTION', 16, 'bold', contractData.primaryColor);
      yPosition += 5;
      if (contractData.terminationConditions && contractData.terminationConditions.trim()) {
        addText(`Termination Conditions: ${contractData.terminationConditions}`, 12);
      }
      if (contractData.noticePeriod && contractData.noticePeriod.trim()) {
        addText(`Notice Period: ${contractData.noticePeriod}`, 12);
      }
      if (contractData.jurisdiction && contractData.jurisdiction.trim()) {
        addText(`Governing Jurisdiction: ${contractData.jurisdiction}`, 12);
      }
      addText(`Arbitration: ${contractData.arbitrationClause ? 'Disputes subject to arbitration' : 'Standard legal proceedings apply'}`, 12);
      yPosition += 15;

      // Signature Section
      checkNewPage(60);
      
      addText('SIGNATURES', 16, 'bold', contractData.primaryColor);
      yPosition += 20;

      // Service Provider Signature
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Service Provider:', margin, yPosition);
      if (contractData.freelancerName) {
        pdf.text(`${contractData.freelancerName}`, margin, yPosition + 15);
      }
      pdf.text(`Date: ${contractData.signedDate ? new Date(contractData.signedDate).toLocaleDateString() : '_____________'}`, margin, yPosition + 25);

      // Client Signature
      pdf.text('Client:', pageWidth - margin - 80, yPosition);
      if (contractData.clientName) {
        pdf.text(`${contractData.clientName}`, pageWidth - margin - 80, yPosition + 15);
      }
      pdf.text(`Date: ${contractData.signedDate ? new Date(contractData.signedDate).toLocaleDateString() : '_____________'}`, pageWidth - margin - 80, yPosition + 25);

      // Download the PDF
      const fileName = `${contractData.templateName || 'contract'}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Downloaded",
        description: "Your contract has been downloaded successfully."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShareLink = async () => {
    if (isLocked) {
      toast({
        title: "Contract Locked",
        description: "This contract is already locked and cannot generate new eSign links.",
        variant: "destructive"
      });
      return;
    }
    setShowESignDialog(true);
  };

  const handleESignSuccess = (shareData: any) => {
    setShareInfo(shareData);
    setIsLocked(true);
    setLockedAt(new Date().toISOString());
    setContractStatus('sent_for_signature');
    setShowESignDialog(false);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard`
    });
  };

  // Add event listeners for navbar actions
  useEffect(() => {
    const handleDownloadEvent = () => {
      handleDownloadPDF();
    };

    const handleShareEvent = () => {
      handleShareLink();
    };

    window.addEventListener('downloadPDF', handleDownloadEvent);
    window.addEventListener('shareContract', handleShareEvent);

    return () => {
      window.removeEventListener('downloadPDF', handleDownloadEvent);
      window.removeEventListener('shareContract', handleShareEvent);
    };
  }, [isLocked]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <SEOHead 
        title="Contract Builder - Agrezy"
        description="Create professional service contracts with our AI-powered step-by-step builder"
      />
      <div className="min-h-screen bg-background">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Left Panel */}
          <div className="w-2/5 border-r bg-card p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <ContractStatusBadge status={contractStatus} />
                {saving && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                    <span className="text-xs">Saving...</span>
                  </div>
                )}
              </div>

              {/* Simple status indicators */}
              {contractStatus === 'revision_requested' && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-medium">Revision Requested</h3>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Client has requested changes. Contract is now unlocked for editing.
                  </p>
                </div>
              )}

              {contractStatus === 'sent_for_signature' && isLocked && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Send className="h-5 w-5" />
                    <h3 className="font-medium">eSign Sent</h3>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Contract shared with client for signature. Editing is locked.
                  </p>
                </div>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="edit" disabled={isLocked}>
                  Edit Contract {isLocked && <Lock className="h-3 w-3 ml-1" />}
                </TabsTrigger>
                <TabsTrigger value="design" disabled={isLocked}>
                  Design {isLocked && <Lock className="h-3 w-3 ml-1" />}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-3">
                <Accordion type="single" value={activeSection} onValueChange={handleSectionChange} collapsible className="space-y-3">
                  {EDIT_STEPS.map((step, index) => {
                    const Component = step.component;
                    return (
                      <AccordionItem key={step.id} value={step.id} className={`border rounded-lg px-4 ${isLocked ? 'opacity-50' : ''}`}>
                        <AccordionTrigger className="text-left hover:no-underline py-4" disabled={isLocked}>
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                              activeSection === step.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-sm">{step.title}</span>
                            {isLocked && <Lock className="h-3 w-3 ml-auto" />}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                          <Component
                            data={contractData}
                            updateData={updateContractData}
                            onNext={() => {}}
                            onPrev={() => {}}
                            isFirst={index === 0}
                            isLast={index === EDIT_STEPS.length - 1}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </TabsContent>

              <TabsContent value="design" className="space-y-3">
                <Accordion type="single" value={activeSection} onValueChange={handleSectionChange} collapsible className="space-y-3">
                  {DESIGN_STEPS.map((step, index) => {
                    const Component = step.component;
                    return (
                      <AccordionItem key={step.id} value={step.id} className={`border rounded-lg px-4 ${isLocked ? 'opacity-50' : ''}`}>
                        <AccordionTrigger className="text-left hover:no-underline py-4" disabled={isLocked}>
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                              activeSection === step.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-sm">{step.title}</span>
                            {isLocked && <Lock className="h-3 w-3 ml-auto" />}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                          <Component
                            data={contractData}
                            updateData={updateContractData}
                            onNext={() => {}}
                            onPrev={() => {}}
                            isFirst={index === 0}
                            isLast={index === DESIGN_STEPS.length - 1}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel */}
          <div className="w-3/5 bg-muted/20">
            <ContractPreview data={contractData} />
          </div>
        </div>
      </div>
      <ESignDialog 
        isOpen={showESignDialog} 
        onClose={() => setShowESignDialog(false)} 
        contractId={contractId}
        onSuccess={handleESignSuccess}
      />
    </>
  );
};

export default ContractBuilder;
