import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContractData } from '@/pages/ContractBuilder';
import { FileText, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface ContractPreviewProps {
  data: ContractData;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ data }) => {
  const contractRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    try {
      if (!contractRef.current) {
        toast.error('Contract preview not found');
        return;
      }

      toast.info('Generating PDF...');
      
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 20;
      
      // Set font
      pdf.setFont('helvetica');
      
      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(data.documentTitle || 'SERVICE AGREEMENT', pageWidth / 2, margin + 10, { align: 'center' });
      
      // Subtitle
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.documentSubtitle || 'Professional Service Contract', pageWidth / 2, margin + 20, { align: 'center' });
      
      let yPosition = margin + 40;
      
      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = pdf.splitTextToSize(text, pageWidth - (margin * 2));
        
        // Check if we need a new page
        if (yPosition + (lines.length * fontSize * 0.4) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.4 + 5;
      };
      
      // Helper function to add section header
      const addSectionHeader = (title: string) => {
        yPosition += 10;
        addText(title, 14, true);
        yPosition += 5;
      };
      
      // Agreement Introduction
      if (data.agreementIntroText) {
        addText(data.agreementIntroText);
      }
      
      if (data.effectiveDate) {
        addText(`Effective Date: ${new Date(data.effectiveDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`);
      }
      
      // Parties Section
      addSectionHeader('1. PARTIES');
      
      addText('Service Provider:', 12, true);
      if (data.freelancerName) addText(data.freelancerName);
      if (data.freelancerBusinessName) addText(data.freelancerBusinessName);
      if (data.freelancerAddress) addText(data.freelancerAddress);
      if (data.freelancerEmail) addText(`Email: ${data.freelancerEmail}`);
      if (data.freelancerPhone) addText(`Phone: ${data.freelancerPhone}`);
      
      yPosition += 10;
      
      addText('Client:', 12, true);
      if (data.clientName) addText(data.clientName);
      if (data.clientCompany) addText(data.clientCompany);
      if (data.clientEmail) addText(`Email: ${data.clientEmail}`);
      if (data.clientPhone) addText(`Phone: ${data.clientPhone}`);
      
      // Scope of Work
      addSectionHeader('2. SCOPE OF WORK');
      
      addText('2.1 Services Description', 12, true);
      if (data.services) addText(data.services);
      
      if (data.deliverables) {
        addText('2.2 Deliverables', 12, true);
        addText(data.deliverables);
      }
      
      if (data.milestones && data.milestones.length > 0) {
        addText('2.3 Project Milestones', 12, true);
        data.milestones.forEach((milestone, index) => {
          addText(`${index + 1}. ${milestone.title}`);
          addText(milestone.description);
          addText(`Due: ${milestone.dueDate}`);
          if (milestone.amount) addText(`Amount: ₹${milestone.amount.toLocaleString()}`);
          yPosition += 5;
        });
      }
      
      // Payment Terms
      if (data.rate > 0 || data.totalAmount) {
        addSectionHeader('3. PAYMENT TERMS');
        
        addText(`Payment Structure: ${data.paymentType === 'fixed' ? 'Fixed Price Project' : 'Hourly Rate'}`);
        
        if (data.paymentType === 'fixed' && data.totalAmount) {
          addText(`Total Amount: ₹${data.totalAmount.toLocaleString()}`, 12, true);
        } else {
          addText(`Rate: ₹${data.rate}/hour`, 12, true);
        }
        
        if (data.paymentSchedule && data.paymentSchedule.length > 0) {
          addText('Payment Schedule:', 12, true);
          data.paymentSchedule.forEach(payment => {
            addText(`• ${payment.description}: ${payment.percentage}%`);
            if (payment.dueDate) addText(`  Due: ${payment.dueDate}`);
          });
        }
        
        if (data.lateFeeEnabled && data.lateFeeAmount) {
          addText(`Late Payment Fee: ₹${data.lateFeeAmount} will be charged for payments made after the due date.`);
        }
      }
      
      // Terms and Conditions
      addSectionHeader('4. TERMS AND CONDITIONS');
      
      addText('4.1 Service Level Agreement', 12, true);
      addText(`Response Time: ${data.responseTime}`);
      addText(`Revisions Included: ${data.revisionLimit}`);
      if (data.uptimeRequirement) addText(`Uptime Requirement: ${data.uptimeRequirement}`);
      
      if (data.includeNDA) {
        addText('4.2 Confidentiality', 12, true);
        addText('Both parties acknowledge that they may have access to confidential information and agree to maintain strict confidentiality.');
        if (data.confidentialityScope) addText(data.confidentialityScope);
        if (data.confidentialityDuration) addText(`Duration: ${data.confidentialityDuration}`);
      }
      
      addText('4.3 Intellectual Property', 12, true);
      addText(`Ownership: ${data.ipOwnership} retains intellectual property rights`);
      addText(`Usage Rights: ${data.usageRights} usage rights granted`);
      
      addText('4.4 Termination', 12, true);
      addText(data.terminationConditions);
      addText(`Notice Period: ${data.noticePeriod}`);
      
      if (data.isRetainer) {
        addText('4.5 Retainer Agreement', 12, true);
        if (data.retainerAmount) addText(`Monthly Retainer: ₹${data.retainerAmount.toLocaleString()}`);
        if (data.renewalCycle) addText(`Renewal Cycle: ${data.renewalCycle}`);
        addText(`Auto-renewal: ${data.autoRenew ? 'Yes' : 'No'}`);
      }
      
      // Governing Law
      addSectionHeader('5. GOVERNING LAW');
      addText(`This Agreement shall be governed by and construed in accordance with the laws of ${data.jurisdiction}.`);
      if (data.arbitrationClause) {
        addText('Any disputes arising under this agreement shall be resolved through arbitration.');
      }
      
      // Signatures
      yPosition += 20;
      addText('SIGNATURES', 16, true);
      yPosition += 20;
      
      // Service Provider signature line
      pdf.line(margin, yPosition, margin + 80, yPosition);
      yPosition += 10;
      addText(data.freelancerName || 'Service Provider Name');
      addText('Service Provider');
      if (data.signedDate) {
        addText(`Date: ${new Date(data.signedDate).toLocaleDateString()}`);
      } else {
        addText('Date: ______________');
      }
      
      // Client signature line
      const clientSignatureY = yPosition - 40;
      pdf.line(margin + 100, clientSignatureY, margin + 180, clientSignatureY);
      const currentY = yPosition;
      yPosition = clientSignatureY + 10;
      addText(data.clientName || 'Client Name');
      addText('Client');
      addText('Date: ______________');
      
      yPosition = Math.max(currentY, yPosition);
      
      // Footer
      yPosition += 20;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This agreement is governed by the Indian Contract Act, 1872 | Generated with Agrezy Platform', 
               pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Generate filename with current date
      const fileName = `${data.templateName || 'contract'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Download the PDF
      pdf.save(fileName);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const shareContract = async () => {
    try {
      const shareData = {
        title: `Service Agreement - ${data.templateName || 'Contract'}`,
        text: `Service Agreement between ${data.freelancerName || 'Service Provider'} and ${data.clientName || 'Client'}`,
        url: window.location.href
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Contract link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing contract:', error);
      toast.error('Failed to share contract');
    }
  };

  const getFontFamily = () => {
    switch (data.fontFamily) {
      case 'serif': return 'Georgia, serif';
      case 'sans': return 'Arial, sans-serif';
      case 'mono': return 'Courier New, monospace';
      default: return 'Inter, system-ui, sans-serif';
    }
  };

  const getHeaderFontSize = () => {
    switch (data.headerFontSize || 'large') {
      case 'small': return '24px';
      case 'medium': return '28px';
      case 'large': return '32px';
      case 'xlarge': return '36px';
      default: return '32px';
    }
  };

  const getBodyFontSize = () => {
    switch (data.bodyFontSize || 'medium') {
      case 'small': return '11px';
      case 'medium': return '12px';
      case 'large': return '14px';
      case 'xlarge': return '16px';
      default: return '12px';
    }
  };

  const getSectionHeaderFontSize = () => {
    switch (data.sectionHeaderFontSize || 'large') {
      case 'small': return '16px';
      case 'medium': return '18px';
      case 'large': return '20px';
      case 'xlarge': return '22px';
      default: return '20px';
    }
  };

  const getSubHeaderFontSize = () => {
    switch (data.subHeaderFontSize || 'medium') {
      case 'small': return '13px';
      case 'medium': return '14px';
      case 'large': return '16px';
      case 'xlarge': return '18px';
      default: return '14px';
    }
  };

  return (
    <>
      <style>
        {`
          @media print {
            .page-break-after {
              page-break-after: always;
            }
            .page-break-inside-avoid {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .page-break-before {
              page-break-before: always;
            }
          }
          
          .contract-page {
            min-height: 100vh;
            page-break-after: always;
          }
          
          .contract-page:last-child {
            page-break-after: auto;
          }
          
          .section-container {
            page-break-inside: avoid;
          }
          
          .milestone-item {
            page-break-inside: avoid;
          }
          
          .payment-schedule-item {
            page-break-inside: avoid;
          }
        `}
      </style>
      
      <div className="h-full overflow-y-auto bg-gray-50 p-4">
        {/* A4 Document Container */}
        <div ref={contractRef} className="space-y-0 contract-preview">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[794px] mx-auto bg-white shadow-lg"
            style={{ 
              fontFamily: getFontFamily(),
              fontSize: getBodyFontSize(),
              lineHeight: data.lineSpacing || 1.6,
              color: '#1a1a1a'
            }}
          >
            {/* Page 1 Content */}
            <div className="contract-page p-12">
              {/* Header with Logos - Reduced margin */}
              <div className="flex items-start justify-between mb-8">
                {/* Left Logo */}
                <div className="w-20 h-20 flex items-center justify-start">
                  {data.leftLogo && (
                    <img 
                      src={data.leftLogo} 
                      alt="Company logo" 
                      className={`w-20 h-20 object-contain ${
                        data.logoStyle === 'round' ? 'rounded-full' : 'rounded-lg'
                      }`}
                    />
                  )}
                </div>

                {/* Center - Document Header */}
                <div className="text-center flex-1 px-8">
                  <h1 className="font-bold uppercase tracking-wider mb-2" 
                      style={{ 
                        color: data.primaryColor || '#1a1a1a',
                        fontSize: getHeaderFontSize()
                      }}>
                    {data.documentTitle || 'SERVICE AGREEMENT'}
                  </h1>
                  <p className="text-gray-600 uppercase tracking-wide mb-3"
                     style={{ fontSize: getSubHeaderFontSize() }}>
                    {data.documentSubtitle || 'Professional Service Contract'}
                  </p>
                  {data.startDate && (
                    <p className="text-gray-500" style={{ fontSize: getBodyFontSize() }}>
                      Effective Date: {new Date(data.startDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>

                {/* Right Logo */}
                <div className="w-20 h-20 flex items-center justify-end">
                  {data.rightLogo && (
                    <img 
                      src={data.rightLogo} 
                      alt="Client logo" 
                      className={`w-20 h-20 object-contain ${
                        data.logoStyle === 'round' ? 'rounded-full' : 'rounded-lg'
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Horizontal Rule */}
              <div className="border-b-2 border-gray-800 mb-6"></div>

              {/* Agreement Introduction */}
              <div className="mb-6 section-container">
                <p className="text-justify leading-relaxed" style={{ fontSize: getBodyFontSize() }}>
                  {data.agreementIntroText || 'This Service Agreement ("Agreement") is entered into between the parties identified below for the provision of professional services as outlined in this document.'} 
                  {data.effectiveDate && (
                    <>
                      {' '}This agreement is effective as of{' '}
                      <span className="font-semibold border-b border-gray-400 px-2">
                        {new Date(data.effectiveDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>.
                    </>
                  )}
                </p>
                
                {data.introductionClauses && data.introductionClauses.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {data.introductionClauses.map((clause, index) => (
                      <p key={index} className="text-justify leading-relaxed pl-4 border-l-2 border-gray-300"
                         style={{ fontSize: getBodyFontSize() }}>
                        {clause}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* 1. PARTIES */}
              <div className="mb-6 section-container">
                <h2 className="font-bold uppercase mb-4 border-b-2 border-gray-400 pb-2" 
                    style={{ 
                      color: data.primaryColor || '#1a1a1a',
                      fontSize: getSectionHeaderFontSize()
                    }}>
                  1. PARTIES
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold uppercase mb-2 text-gray-700"
                        style={{ fontSize: getSubHeaderFontSize() }}>Service Provider:</h3>
                    <div className="space-y-1">
                      {data.freelancerName && <p className="font-semibold" style={{ fontSize: getBodyFontSize() }}>{data.freelancerName}</p>}
                      {data.freelancerBusinessName && <p className="italic" style={{ fontSize: getBodyFontSize() }}>{data.freelancerBusinessName}</p>}
                      {data.freelancerAddress && <p className="leading-relaxed" style={{ fontSize: getBodyFontSize() }}>{data.freelancerAddress}</p>}
                      {data.freelancerEmail && <p style={{ fontSize: getBodyFontSize() }}>Email: {data.freelancerEmail}</p>}
                      {data.freelancerPhone && <p style={{ fontSize: getBodyFontSize() }}>Phone: {data.freelancerPhone}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold uppercase mb-2 text-gray-700"
                        style={{ fontSize: getSubHeaderFontSize() }}>Client:</h3>
                    <div className="space-y-1">
                      {data.clientName && <p className="font-semibold" style={{ fontSize: getBodyFontSize() }}>{data.clientName}</p>}
                      {data.clientCompany && <p className="italic" style={{ fontSize: getBodyFontSize() }}>{data.clientCompany}</p>}
                      {data.clientEmail && <p style={{ fontSize: getBodyFontSize() }}>Email: {data.clientEmail}</p>}
                      {data.clientPhone && <p style={{ fontSize: getBodyFontSize() }}>Phone: {data.clientPhone}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. SCOPE OF WORK */}
              <div className="mb-6 section-container">
                <h2 className="font-bold uppercase mb-4 border-b-2 border-gray-400 pb-2" 
                    style={{ 
                      color: data.primaryColor || '#1a1a1a',
                      fontSize: getSectionHeaderFontSize()
                    }}>
                  2. SCOPE OF WORK
                </h2>
                
                <div className="mb-4">
                  <h3 className="font-semibold mb-2" style={{ fontSize: getSubHeaderFontSize() }}>2.1 Services Description</h3>
                  <p className="text-justify leading-relaxed whitespace-pre-wrap" style={{ fontSize: getBodyFontSize() }}>
                    {data.services || 'Services to be defined...'}
                  </p>
                </div>

                {data.deliverables && (
                  <div className="mb-4 section-container">
                    <h3 className="font-semibold mb-2" style={{ fontSize: getSubHeaderFontSize() }}>2.2 Deliverables</h3>
                    <p className="text-justify leading-relaxed whitespace-pre-wrap" style={{ fontSize: getBodyFontSize() }}>
                      {data.deliverables}
                    </p>
                  </div>
                )}

                {data.milestones && data.milestones.length > 0 && (
                  <div className="mb-4 section-container">
                    <h3 className="font-semibold mb-2" style={{ fontSize: getSubHeaderFontSize() }}>2.3 Project Milestones</h3>
                    <div className="space-y-2">
                      {data.milestones.map((milestone, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-3 milestone-item">
                          <p className="font-medium" style={{ fontSize: getBodyFontSize() }}>{milestone.title}</p>
                          <p className="text-gray-600" style={{ fontSize: getBodyFontSize() }}>{milestone.description}</p>
                          <p className="text-gray-500" style={{ fontSize: getBodyFontSize() }}>Due: {milestone.dueDate}</p>
                          {milestone.amount && <p className="font-medium" style={{ fontSize: getBodyFontSize() }}>Amount: ₹{milestone.amount.toLocaleString()}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Page 2 Content - Payment Terms and beyond */}
            <div className="contract-page p-12">
              {/* 3. PAYMENT TERMS */}
              {(data.rate > 0 || data.totalAmount) && (
                <div className="mb-6 section-container">
                  <h2 className="font-bold uppercase mb-4 border-b-2 border-gray-400 pb-2" 
                      style={{ 
                        color: data.primaryColor || '#1a1a1a',
                        fontSize: getSectionHeaderFontSize()
                      }}>
                    3. PAYMENT TERMS
                  </h2>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold" style={{ fontSize: getSubHeaderFontSize() }}>Payment Structure:</p>
                        <p style={{ fontSize: getBodyFontSize() }}>{data.paymentType === 'fixed' ? 'Fixed Price Project' : 'Hourly Rate'}</p>
                      </div>
                      <div>
                        <p className="font-semibold" style={{ fontSize: getSubHeaderFontSize() }}>Total Amount:</p>
                        {data.paymentType === 'fixed' && data.totalAmount ? (
                          <p className="font-bold" 
                             style={{ 
                               color: data.primaryColor || '#1a1a1a',
                               fontSize: getSectionHeaderFontSize()
                             }}>
                            ₹{data.totalAmount.toLocaleString()}
                          </p>
                        ) : (
                          <p className="font-bold" 
                             style={{ 
                               color: data.primaryColor || '#1a1a1a',
                               fontSize: getSectionHeaderFontSize()
                             }}>
                            ₹{data.rate}/hour
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {data.paymentSchedule && data.paymentSchedule.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2" style={{ fontSize: getSubHeaderFontSize() }}>Payment Schedule:</p>
                        <div className="space-y-1">
                          {data.paymentSchedule.map((payment, index) => (
                            <div key={index} className="flex justify-between items-center py-1 border-b border-gray-200 payment-schedule-item">
                              <span style={{ fontSize: getBodyFontSize() }}>{payment.description}</span>
                              <span className="font-medium" style={{ fontSize: getBodyFontSize() }}>{payment.percentage}%</span>
                              {payment.dueDate && <span className="text-gray-600" style={{ fontSize: getBodyFontSize() }}>{payment.dueDate}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.lateFeeEnabled && data.lateFeeAmount && (
                      <div className="border-t border-gray-200 pt-3">
                        <p className="font-semibold" style={{ fontSize: getSubHeaderFontSize() }}>Late Payment Fee:</p>
                        <p style={{ fontSize: getBodyFontSize() }}>₹{data.lateFeeAmount} will be charged for payments made after the due date.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. TERMS AND CONDITIONS */}
              <div className="mb-6 section-container">
                <h2 className="font-bold uppercase mb-4 border-b-2 border-gray-400 pb-2" 
                    style={{ 
                      color: data.primaryColor || '#1a1a1a',
                      fontSize: getSectionHeaderFontSize()
                    }}>
                  4. TERMS AND CONDITIONS
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">4.1 Service Level Agreement</h3>
                    <div className="space-y-1">
                      <p><span className="font-medium">Response Time:</span> {data.responseTime}</p>
                      <p><span className="font-medium">Revisions Included:</span> {data.revisionLimit}</p>
                      {data.uptimeRequirement && <p><span className="font-medium">Uptime Requirement:</span> {data.uptimeRequirement}</p>}
                    </div>
                  </div>

                  {data.includeNDA && (
                    <div>
                      <h3 className="font-semibold mb-2">4.2 Confidentiality</h3>
                      <p>Both parties acknowledge that they may have access to confidential information and agree to maintain strict confidentiality.</p>
                      {data.confidentialityScope && <p className="mt-1">{data.confidentialityScope}</p>}
                      {data.confidentialityDuration && <p>Duration: {data.confidentialityDuration}</p>}
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">4.3 Intellectual Property</h3>
                    <div className="space-y-1">
                      <p><span className="font-medium">Ownership:</span> <span className="capitalize">{data.ipOwnership}</span> retains intellectual property rights</p>
                      <p><span className="font-medium">Usage Rights:</span> <span className="capitalize">{data.usageRights}</span> usage rights granted</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">4.4 Termination</h3>
                    <p className="mb-1">{data.terminationConditions}</p>
                    <p><span className="font-medium">Notice Period:</span> {data.noticePeriod}</p>
                  </div>

                  {data.isRetainer && (
                    <div>
                      <h3 className="font-semibold mb-2">4.5 Retainer Agreement</h3>
                      <div className="space-y-1">
                        {data.retainerAmount && <p><span className="font-medium">Monthly Retainer:</span> ₹{data.retainerAmount.toLocaleString()}</p>}
                        {data.renewalCycle && <p><span className="font-medium">Renewal Cycle:</span> {data.renewalCycle}</p>}
                        <p><span className="font-medium">Auto-renewal:</span> {data.autoRenew ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. GOVERNING LAW */}
              <div className="mb-8 section-container">
                <h2 className="font-bold uppercase mb-4 border-b-2 border-gray-400 pb-2" 
                    style={{ 
                      color: data.primaryColor || '#1a1a1a',
                      fontSize: getSectionHeaderFontSize()
                    }}>
                  5. GOVERNING LAW
                </h2>
                <p className="leading-relaxed">
                  This Agreement shall be governed by and construed in accordance with the laws of {data.jurisdiction}.{' '}
                  {data.arbitrationClause && 'Any disputes arising under this agreement shall be resolved through arbitration.'}
                </p>
              </div>

              {/* Signature Section */}
              <div className="border-t-2 border-gray-800 pt-6 section-container">
                <h2 className="font-bold uppercase mb-6 text-center" 
                    style={{ 
                      color: data.primaryColor || '#1a1a1a',
                      fontSize: getSectionHeaderFontSize()
                    }}>
                  SIGNATURES
                </h2>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="h-12 border-b-2 border-gray-400 mb-3 flex items-end justify-center">
                      {data.freelancerSignature && (
                        <img src={data.freelancerSignature} alt="Service Provider signature" className="max-h-10 max-w-full" />
                      )}
                    </div>
                    <p className="font-bold" style={{ fontSize: getBodyFontSize() }}>{data.freelancerName || 'Service Provider Name'}</p>
                    <p className="text-gray-600" style={{ fontSize: getBodyFontSize() }}>Service Provider</p>
                    <p className="text-gray-600 mt-1" style={{ fontSize: getBodyFontSize() }}>
                      Date: {data.signedDate ? new Date(data.signedDate).toLocaleDateString() : '______________'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="h-12 border-b-2 border-gray-400 mb-3 flex items-end justify-center">
                      {data.clientSignature && (
                        <img src={data.clientSignature} alt="Client signature" className="max-h-10 max-w-full" />
                      )}
                    </div>
                    <p className="font-bold" style={{ fontSize: getBodyFontSize() }}>{data.clientName || 'Client Name'}</p>
                    <p className="text-gray-600" style={{ fontSize: getBodyFontSize() }}>Client</p>
                    <p className="text-gray-600 mt-1" style={{ fontSize: getBodyFontSize() }}>Date: ______________</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-gray-500 mt-8 pt-4 border-t border-gray-300" style={{ fontSize: getBodyFontSize() }}>
                <p>This agreement is governed by the Indian Contract Act, 1872 | Generated with Agrezy Platform</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ContractPreview;
