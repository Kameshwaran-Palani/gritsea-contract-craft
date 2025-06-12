
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
      case 'serif': return 'Times, serif';
      case 'sans': return 'Arial, sans-serif';
      case 'mono': return 'Courier, monospace';
      default: return 'Inter, sans-serif';
    }
  };

  const getFontSize = () => {
    switch (data.fontSize) {
      case 'small': return '10px';
      case 'large': return '12px';
      default: return '11px';
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

      {/* A4 Document Container */}
      <div ref={contractRef} className="space-y-4 contract-preview">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg flex flex-col"
          style={{ 
            fontFamily: getFontFamily(),
            lineHeight: '1.4',
            fontSize: getFontSize(),
            color: data.primaryColor || '#000000'
          }}
        >
          <div className="p-[15mm] flex-1 flex flex-col">
            {/* Header with Logos */}
            <div className="flex items-center justify-between mb-6">
              {/* Left Logo */}
              <div className="w-16 h-16 flex items-center justify-start">
                {data.leftLogo && (
                  <img 
                    src={data.leftLogo} 
                    alt="Left logo" 
                    className={`w-16 h-16 object-cover ${
                      data.logoStyle === 'round' ? 'rounded-full' : 'rounded-lg'
                    }`}
                  />
                )}
              </div>

              {/* Center - Document Header */}
              <div className="text-center flex-1">
                <h1 className="text-lg font-bold uppercase tracking-wider mb-1">
                  {data.documentTitle}
                </h1>
                <p className="text-xs text-gray-600 uppercase tracking-wide">
                  {data.documentSubtitle}
                </p>
                {data.startDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Effective Date: {new Date(data.startDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>

              {/* Right Logo */}
              <div className="w-16 h-16 flex items-center justify-end">
                {data.rightLogo && (
                  <img 
                    src={data.rightLogo} 
                    alt="Right logo" 
                    className={`w-16 h-16 object-cover ${
                      data.logoStyle === 'round' ? 'rounded-full' : 'rounded-lg'
                    }`}
                  />
                )}
              </div>
            </div>

            <div className="border-b-2 border-gray-800 mb-4"></div>

            {/* Agreement Introduction */}
            <div className="mb-4">
              <p className="text-justify text-xs leading-relaxed">
                This Service Agreement ("Agreement") is entered into on{' '}
                <span className="font-semibold underline">
                  {data.startDate ? new Date(data.startDate).toLocaleDateString() : '____________'}
                </span>{' '}
                between the parties identified below.
              </p>
            </div>

            {/* Parties Section */}
            <div className="mb-5">
              <h2 className="text-sm font-bold uppercase mb-3 border-b border-gray-400 pb-1">
                1. PARTIES
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <h3 className="font-bold text-xs uppercase mb-1 text-gray-700">Service Provider:</h3>
                  <div className="space-y-0.5 text-xs">
                    {data.freelancerName && <p className="font-semibold">{data.freelancerName}</p>}
                    {data.freelancerBusinessName && <p className="italic">{data.freelancerBusinessName}</p>}
                    {data.freelancerAddress && <p>{data.freelancerAddress}</p>}
                    {data.freelancerEmail && <p>Email: {data.freelancerEmail}</p>}
                    {data.freelancerPhone && <p>Phone: {data.freelancerPhone}</p>}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-xs uppercase mb-1 text-gray-700">Client:</h3>
                  <div className="space-y-0.5 text-xs">
                    {data.clientName && <p className="font-semibold">{data.clientName}</p>}
                    {data.clientCompany && <p className="italic">{data.clientCompany}</p>}
                    {data.clientEmail && <p>Email: {data.clientEmail}</p>}
                    {data.clientPhone && <p>Phone: {data.clientPhone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Scope of Work */}
            <div className="mb-5">
              <h2 className="text-sm font-bold uppercase mb-3 border-b border-gray-400 pb-1">
                2. SCOPE OF WORK
              </h2>
              
              <h3 className="font-semibold mb-2 text-xs">2.1 Services Description</h3>
              <p className="text-justify mb-3 text-xs leading-relaxed">
                {data.services ? data.services.substring(0, 600) + (data.services.length > 600 ? '...' : '') : 'Services to be defined...'}
              </p>

              {data.deliverables && (
                <div className="mb-3">
                  <h3 className="font-semibold mb-2 text-xs">2.2 Deliverables</h3>
                  <p className="text-justify text-xs leading-relaxed">
                    {data.deliverables.substring(0, 400) + (data.deliverables.length > 400 ? '...' : '')}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Terms */}
            {(data.rate > 0 || data.totalAmount) && (
              <div className="mb-5">
                <h2 className="text-sm font-bold uppercase mb-3 border-b border-gray-400 pb-1">
                  3. PAYMENT TERMS
                </h2>
                <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                  <p>
                    <span className="font-semibold">Structure:</span> {data.paymentType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  </p>
                  {data.paymentType === 'fixed' && data.totalAmount ? (
                    <p className="font-bold text-gray-800">
                      Total: ₹{data.totalAmount.toLocaleString()}
                    </p>
                  ) : (
                    <p className="font-bold text-gray-800">
                      Rate: ₹{data.rate}/hour
                    </p>
                  )}
                  
                  {data.paymentSchedule.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Payment Schedule:</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        {data.paymentSchedule.map((payment, index) => (
                          <li key={index} className="text-xs">
                            {payment.description}: {payment.percentage}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Terms */}
            <div className="mb-5">
              <h2 className="text-sm font-bold uppercase mb-3 border-b border-gray-400 pb-1">
                4. ADDITIONAL TERMS
              </h2>
              
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold">Confidentiality:</span> {data.includeNDA ? 'Both parties agree to maintain confidentiality of all project information.' : 'No specific confidentiality terms apply.'}
                </div>
                <div>
                  <span className="font-semibold">IP Rights:</span> <span className="capitalize">{data.ipOwnership}</span> retains intellectual property rights.
                </div>
                <div>
                  <span className="font-semibold">Response Time:</span> {data.responseTime}
                </div>
                <div>
                  <span className="font-semibold">Revisions:</span> {data.revisionLimit} revisions included
                </div>
                <div>
                  <span className="font-semibold">Termination:</span> {data.terminationConditions}
                </div>
                <div>
                  <span className="font-semibold">Notice Period:</span> {data.noticePeriod}
                </div>
                <div>
                  <span className="font-semibold">Jurisdiction:</span> {data.jurisdiction}
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="flex-1 flex flex-col justify-end">
              <div className="pt-4 border-t border-gray-800">
                <h2 className="text-sm font-bold uppercase mb-4 text-center">SIGNATURES</h2>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center">
                    {data.freelancerSignature ? (
                      <div className="h-10 border-b border-gray-400 mb-2 flex items-end justify-center">
                        <img src={data.freelancerSignature} alt="Freelancer signature" className="max-h-8 max-w-full" />
                      </div>
                    ) : (
                      <div className="h-10 border-b border-gray-400 mb-2"></div>
                    )}
                    <p className="font-semibold text-xs">{data.freelancerName || 'Service Provider'}</p>
                    <p className="text-xs text-gray-600">Service Provider</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Date: {data.signedDate ? new Date(data.signedDate).toLocaleDateString() : '________'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="h-10 border-b border-gray-400 mb-2"></div>
                    <p className="font-semibold text-xs">{data.clientName || 'Client'}</p>
                    <p className="text-xs text-gray-600">Client</p>
                    <p className="text-xs text-gray-600 mt-1">Date: ________</p>
                  </div>
                </div>
              </div>

              {/* Footer - Stick to bottom */}
              <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-300 mt-auto">
                <p>Governed by Indian Contract Act, 1872 | Generated by Agrezy</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractPreview;
