
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
      
      // Create canvas from the contract content
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: contractRef.current.scrollHeight,
        width: contractRef.current.scrollWidth
      });

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
      const fileName = `${data.templateName || 'contract'}_${new Date().toISOString().split('T')[0]}.pdf`;
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
        // Fallback to copying link to clipboard
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

  const getFontSize = () => {
    switch (data.fontSize) {
      case 'small': return '11px';
      case 'large': return '14px';
      case 'xlarge': return '16px';
      default: return '12px';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4">
      <div className="sticky top-0 bg-gray-50 pb-3 mb-3 border-b border-gray-200 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Live Preview
          </h2>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Auto-updating
          </Badge>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={downloadPDF} size="sm" className="rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={shareContract} variant="outline" size="sm" className="rounded-xl">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* A4 Document Container - Exact match for PDF */}
      <div ref={contractRef} className="space-y-4 contract-preview">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[794px] min-h-[1123px] mx-auto bg-white shadow-lg p-16"
          style={{ 
            fontFamily: getFontFamily(),
            fontSize: getFontSize(),
            lineHeight: data.lineSpacing || 1.6,
            color: '#1a1a1a'
          }}
        >
          {/* Header with Logos */}
          <div className="flex items-start justify-between mb-12">
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
              <h1 className="text-3xl font-bold uppercase tracking-wider mb-3" style={{ color: data.primaryColor || '#1a1a1a' }}>
                {data.documentTitle || 'SERVICE AGREEMENT'}
              </h1>
              <p className="text-base text-gray-600 uppercase tracking-wide mb-4">
                {data.documentSubtitle || 'Professional Service Contract'}
              </p>
              {data.startDate && (
                <p className="text-sm text-gray-500">
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
          <div className="border-b-3 border-gray-800 mb-8"></div>

          {/* Agreement Introduction */}
          <div className="mb-8">
            <p className="text-justify leading-relaxed">
              This Service Agreement ("Agreement") is entered into on{' '}
              <span className="font-semibold border-b border-gray-400 px-2">
                {data.startDate ? new Date(data.startDate).toLocaleDateString() : '____________'}
              </span>{' '}
              between the parties identified below for the provision of professional services as outlined in this document.
            </p>
          </div>

          {/* 1. PARTIES */}
          <div className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-6 border-b-2 border-gray-400 pb-2" style={{ color: data.primaryColor || '#1a1a1a' }}>
              1. PARTIES
            </h2>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-base uppercase mb-3 text-gray-700">Service Provider:</h3>
                <div className="space-y-2">
                  {data.freelancerName && <p className="font-semibold text-base">{data.freelancerName}</p>}
                  {data.freelancerBusinessName && <p className="italic">{data.freelancerBusinessName}</p>}
                  {data.freelancerAddress && <p className="leading-relaxed">{data.freelancerAddress}</p>}
                  {data.freelancerEmail && <p>Email: {data.freelancerEmail}</p>}
                  {data.freelancerPhone && <p>Phone: {data.freelancerPhone}</p>}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-base uppercase mb-3 text-gray-700">Client:</h3>
                <div className="space-y-2">
                  {data.clientName && <p className="font-semibold text-base">{data.clientName}</p>}
                  {data.clientCompany && <p className="italic">{data.clientCompany}</p>}
                  {data.clientEmail && <p>Email: {data.clientEmail}</p>}
                  {data.clientPhone && <p>Phone: {data.clientPhone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* 2. SCOPE OF WORK */}
          <div className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-6 border-b-2 border-gray-400 pb-2" style={{ color: data.primaryColor || '#1a1a1a' }}>
              2. SCOPE OF WORK
            </h2>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-base">2.1 Services Description</h3>
              <p className="text-justify leading-relaxed whitespace-pre-wrap">
                {data.services || 'Services to be defined...'}
              </p>
            </div>

            {data.deliverables && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-base">2.2 Deliverables</h3>
                <p className="text-justify leading-relaxed whitespace-pre-wrap">
                  {data.deliverables}
                </p>
              </div>
            )}

            {data.milestones && data.milestones.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-base">2.3 Project Milestones</h3>
                <div className="space-y-3">
                  {data.milestones.map((milestone, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <p className="font-medium">{milestone.title}</p>
                      <p className="text-gray-600">{milestone.description}</p>
                      <p className="text-sm text-gray-500">Due: {milestone.dueDate}</p>
                      {milestone.amount && <p className="text-sm font-medium">Amount: ₹{milestone.amount.toLocaleString()}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. PAYMENT TERMS */}
          {(data.rate > 0 || data.totalAmount) && (
            <div className="mb-8">
              <h2 className="text-xl font-bold uppercase mb-6 border-b-2 border-gray-400 pb-2" style={{ color: data.primaryColor || '#1a1a1a' }}>
                3. PAYMENT TERMS
              </h2>
              
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold">Payment Structure:</p>
                    <p>{data.paymentType === 'fixed' ? 'Fixed Price Project' : 'Hourly Rate'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Total Amount:</p>
                    {data.paymentType === 'fixed' && data.totalAmount ? (
                      <p className="text-xl font-bold" style={{ color: data.primaryColor || '#1a1a1a' }}>
                        ₹{data.totalAmount.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xl font-bold" style={{ color: data.primaryColor || '#1a1a1a' }}>
                        ₹{data.rate}/hour
                      </p>
                    )}
                  </div>
                </div>
                
                {data.paymentSchedule && data.paymentSchedule.length > 0 && (
                  <div>
                    <p className="font-semibold mb-3">Payment Schedule:</p>
                    <div className="space-y-2">
                      {data.paymentSchedule.map((payment, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span>{payment.description}</span>
                          <span className="font-medium">{payment.percentage}%</span>
                          {payment.dueDate && <span className="text-sm text-gray-600">{payment.dueDate}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.lateFeeEnabled && data.lateFeeAmount && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-semibold">Late Payment Fee:</p>
                    <p>₹{data.lateFeeAmount} will be charged for payments made after the due date.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. TERMS AND CONDITIONS */}
          <div className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-6 border-b-2 border-gray-400 pb-2" style={{ color: data.primaryColor || '#1a1a1a' }}>
              4. TERMS AND CONDITIONS
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">4.1 Service Level Agreement</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Response Time:</span> {data.responseTime}</p>
                  <p><span className="font-medium">Revisions Included:</span> {data.revisionLimit}</p>
                  {data.uptimeRequirement && <p><span className="font-medium">Uptime Requirement:</span> {data.uptimeRequirement}</p>}
                </div>
              </div>

              {data.includeNDA && (
                <div>
                  <h3 className="font-semibold mb-2">4.2 Confidentiality</h3>
                  <p>Both parties acknowledge that they may have access to confidential information and agree to maintain strict confidentiality.</p>
                  {data.confidentialityScope && <p className="mt-2">{data.confidentialityScope}</p>}
                  {data.confidentialityDuration && <p>Duration: {data.confidentialityDuration}</p>}
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">4.3 Intellectual Property</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Ownership:</span> <span className="capitalize">{data.ipOwnership}</span> retains intellectual property rights</p>
                  <p><span className="font-medium">Usage Rights:</span> <span className="capitalize">{data.usageRights}</span> usage rights granted</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4.4 Termination</h3>
                <p className="mb-2">{data.terminationConditions}</p>
                <p><span className="font-medium">Notice Period:</span> {data.noticePeriod}</p>
              </div>

              {data.isRetainer && (
                <div>
                  <h3 className="font-semibold mb-2">4.5 Retainer Agreement</h3>
                  <div className="space-y-2">
                    {data.retainerAmount && <p><span className="font-medium">Monthly Retainer:</span> ₹{data.retainerAmount.toLocaleString()}</p>}
                    {data.renewalCycle && <p><span className="font-medium">Renewal Cycle:</span> {data.renewalCycle}</p>}
                    <p><span className="font-medium">Auto-renewal:</span> {data.autoRenew ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. GOVERNING LAW */}
          <div className="mb-12">
            <h2 className="text-xl font-bold uppercase mb-6 border-b-2 border-gray-400 pb-2" style={{ color: data.primaryColor || '#1a1a1a' }}>
              5. GOVERNING LAW
            </h2>
            <p className="leading-relaxed">
              This Agreement shall be governed by and construed in accordance with the laws of {data.jurisdiction}.{' '}
              {data.arbitrationClause && 'Any disputes arising under this agreement shall be resolved through arbitration.'}
            </p>
          </div>

          {/* Signature Section */}
          <div className="border-t-3 border-gray-800 pt-8">
            <h2 className="text-xl font-bold uppercase mb-8 text-center" style={{ color: data.primaryColor || '#1a1a1a' }}>
              SIGNATURES
            </h2>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="text-center">
                <div className="h-16 border-b-2 border-gray-400 mb-4 flex items-end justify-center">
                  {data.freelancerSignature && (
                    <img src={data.freelancerSignature} alt="Service Provider signature" className="max-h-12 max-w-full" />
                  )}
                </div>
                <p className="font-bold text-base">{data.freelancerName || 'Service Provider Name'}</p>
                <p className="text-gray-600">Service Provider</p>
                <p className="text-gray-600 mt-2">
                  Date: {data.signedDate ? new Date(data.signedDate).toLocaleDateString() : '______________'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-16 border-b-2 border-gray-400 mb-4 flex items-end justify-center">
                  {data.clientSignature && (
                    <img src={data.clientSignature} alt="Client signature" className="max-h-12 max-w-full" />
                  )}
                </div>
                <p className="font-bold text-base">{data.clientName || 'Client Name'}</p>
                <p className="text-gray-600">Client</p>
                <p className="text-gray-600 mt-2">Date: ______________</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-12 pt-6 border-t border-gray-300">
            <p>This agreement is governed by the Indian Contract Act, 1872 | Generated with Agrezy Platform</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractPreview;
