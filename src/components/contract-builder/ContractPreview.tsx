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
      toast.info('Generating PDF...');
      
      // Create a temporary div for PDF content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.padding = '40px';

      const contractHTML = `
        <div style="font-family: serif; line-height: 1.6; color: #000;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; letter-spacing: 2px;">${data.documentTitle || 'SERVICE AGREEMENT'}</h1>
            <p style="font-size: 14px; color: #666; margin: 0; letter-spacing: 1px;">${data.documentSubtitle || 'Professional Service Contract'}</p>
            <p style="font-size: 12px; color: #888; margin: 10px 0 0 0;">
              Effective Date: ${data.startDate ? new Date(data.startDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'N/A'}
            </p>
          </div>
          
          <!-- Parties Section -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #666; padding-bottom: 5px; margin-bottom: 15px;">1. PARTIES</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
              <div>
                <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Service Provider:</h3>
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">${data.freelancerName || 'Service Provider'}</p>
                ${data.freelancerBusinessName ? `<p style="font-size: 12px; font-style: italic; margin: 5px 0;">${data.freelancerBusinessName}</p>` : ''}
                <p style="font-size: 12px; margin: 5px 0;">Email: ${data.freelancerEmail || 'N/A'}</p>
                ${data.freelancerPhone ? `<p style="font-size: 12px; margin: 5px 0;">Phone: ${data.freelancerPhone}</p>` : ''}
              </div>
              <div>
                <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Client:</h3>
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">${data.clientName || 'Client'}</p>
                ${data.clientCompany ? `<p style="font-size: 12px; font-style: italic; margin: 5px 0;">${data.clientCompany}</p>` : ''}
                <p style="font-size: 12px; margin: 5px 0;">Email: ${data.clientEmail || 'N/A'}</p>
                ${data.clientPhone ? `<p style="font-size: 12px; margin: 5px 0;">Phone: ${data.clientPhone}</p>` : ''}
              </div>
            </div>
          </div>
          
          <!-- Scope of Work -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #666; padding-bottom: 5px; margin-bottom: 15px;">2. SCOPE OF WORK</h2>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
              <p style="font-size: 12px; text-align: justify; line-height: 1.6; margin: 0;">${data.services || 'No scope of work specified'}</p>
            </div>
            ${data.deliverables ? `
              <div style="margin-top: 15px;">
                <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Deliverables:</h3>
                <p style="font-size: 12px; text-align: justify; line-height: 1.6; margin: 0;">${data.deliverables}</p>
              </div>
            ` : ''}
          </div>
          
          <!-- Payment Terms -->
          ${(data.rate > 0 || data.totalAmount) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #666; padding-bottom: 5px; margin-bottom: 15px;">3. PAYMENT TERMS</h2>
              <div style="background-color: #f0f8f0; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
                <p style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0; color: #28a745;">
                  Total Amount: ₹${data.paymentType === 'fixed' && data.totalAmount ? data.totalAmount.toLocaleString() : data.rate + '/hour'}
                </p>
                ${data.paymentSchedule && data.paymentSchedule.length > 0 ? `
                  <div style="margin-top: 10px;">
                    <p style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">Payment Schedule:</p>
                    ${data.paymentSchedule.map(payment => `
                      <p style="font-size: 12px; margin: 2px 0;">${payment.description}: ${payment.percentage}%</p>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          <!-- Additional Terms -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #666; padding-bottom: 5px; margin-bottom: 15px;">4. ADDITIONAL TERMS</h2>
            <div style="font-size: 12px; line-height: 1.6;">
              ${data.includeNDA ? '<p style="margin: 5px 0;"><strong>Confidentiality:</strong> Both parties agree to maintain confidentiality of all project information.</p>' : ''}
              <p style="margin: 5px 0;"><strong>IP Rights:</strong> <span style="text-transform: capitalize;">${data.ipOwnership}</span> retains intellectual property rights.</p>
              <p style="margin: 5px 0;"><strong>Response Time:</strong> ${data.responseTime}</p>
              <p style="margin: 5px 0;"><strong>Revisions:</strong> ${data.revisionLimit} revisions included</p>
              <p style="margin: 5px 0;"><strong>Termination:</strong> ${data.terminationConditions}</p>
              <p style="margin: 5px 0;"><strong>Jurisdiction:</strong> ${data.jurisdiction}</p>
            </div>
          </div>
          
          <!-- Signature Section -->
          <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #000;">
            <h2 style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 40px;">SIGNATURES</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px;">
              <div style="text-align: center;">
                <div style="height: 60px; border-bottom: 2px solid #666; margin-bottom: 15px;"></div>
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">${data.freelancerName || 'Service Provider'}</p>
                <p style="font-size: 11px; color: #666; margin: 5px 0;">Service Provider</p>
                <p style="font-size: 11px; color: #666; margin: 10px 0 0 0;">Date: ________________</p>
              </div>
              <div style="text-align: center;">
                <div style="height: 60px; border-bottom: 2px solid #666; margin-bottom: 15px;"></div>
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">${data.clientName || 'Client'}</p>
                <p style="font-size: 11px; color: #666; margin: 5px 0;">Client</p>
                <p style="font-size: 11px; color: #666; margin: 10px 0 0 0;">Date: ________________</p>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; font-size: 10px; color: #888; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
            <p style="margin: 0;">Governed by Indian Contract Act, 1872 | Generated by Agrezy</p>
          </div>
        </div>
      `;

      tempDiv.innerHTML = contractHTML;
      document.body.appendChild(tempDiv);

      // Generate canvas from the temporary div
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: tempDiv.scrollHeight
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `${data.templateName?.replace(/[^a-z0-9]/gi, '_') || 'contract'}_${new Date().toISOString().split('T')[0]}.pdf`;
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
