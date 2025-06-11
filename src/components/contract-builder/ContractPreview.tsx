
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
        {/* Page 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg"
          style={{ 
            fontFamily: 'serif',
            lineHeight: '1.3',
            fontSize: '10px'
          }}
        >
          <div className="p-[12mm] h-full flex flex-col">
            {/* Document Header */}
            <div className="text-center mb-4 border-b-2 border-gray-800 pb-3">
              <h1 className="text-lg font-bold uppercase tracking-wider mb-1">
                SERVICE AGREEMENT
              </h1>
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                {data.templateName || 'Professional Service Contract'}
              </p>
              {data.startDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Effective Date: {new Date(data.startDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>

            {/* Agreement Introduction */}
            <div className="mb-3">
              <p className="text-justify text-xs leading-relaxed">
                This Service Agreement ("Agreement") is entered into on{' '}
                <span className="font-semibold underline">
                  {data.startDate ? new Date(data.startDate).toLocaleDateString() : '____________'}
                </span>{' '}
                between the parties identified below.
              </p>
            </div>

            {/* Parties Section */}
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase mb-2 border-b border-gray-400 pb-1">
                1. PARTIES
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-2">
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
            <div className="flex-1 mb-3">
              <h2 className="text-sm font-bold uppercase mb-2 border-b border-gray-400 pb-1">
                2. SCOPE OF WORK
              </h2>
              
              <h3 className="font-semibold mb-1 text-xs">2.1 Services Description</h3>
              <p className="text-justify mb-2 text-xs leading-relaxed">
                {data.services ? data.services.substring(0, 500) + (data.services.length > 500 ? '...' : '') : 'Services to be defined...'}
              </p>

              {data.deliverables && (
                <div className="mb-2">
                  <h3 className="font-semibold mb-1 text-xs">2.2 Deliverables</h3>
                  <p className="text-justify text-xs leading-relaxed">
                    {data.deliverables.substring(0, 300) + (data.deliverables.length > 300 ? '...' : '')}
                  </p>
                </div>
              )}

              {/* Payment Terms */}
              {(data.rate > 0 || data.totalAmount) && (
                <div className="mb-2">
                  <h3 className="font-semibold mb-1 text-xs">2.3 Payment Terms</h3>
                  <div className="bg-gray-50 p-2 rounded text-xs">
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
                  </div>
                </div>
              )}
            </div>

            {/* Additional Terms */}
            <div className="mb-3">
              <h2 className="text-sm font-bold uppercase mb-2 border-b border-gray-400 pb-1">
                3. ADDITIONAL TERMS
              </h2>
              
              <div className="space-y-1 text-xs">
                <div>
                  <span className="font-semibold">Confidentiality:</span> {data.includeNDA ? 'Both parties agree to maintain confidentiality.' : 'No specific terms apply.'}
                </div>
                <div>
                  <span className="font-semibold">IP Rights:</span> <span className="capitalize">{data.ipOwnership}</span>
                </div>
                <div>
                  <span className="font-semibold">Termination:</span> {data.terminationConditions}
                </div>
                <div>
                  <span className="font-semibold">Notice:</span> {data.noticePeriod}
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-auto pt-3 border-t border-gray-800">
              <h2 className="text-sm font-bold uppercase mb-3 text-center">SIGNATURES</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="h-8 border-b border-gray-400 mb-1"></div>
                  <p className="font-semibold text-xs">{data.freelancerName || 'Service Provider'}</p>
                  <p className="text-xs text-gray-600">Service Provider</p>
                  <p className="text-xs text-gray-600 mt-0.5">Date: ________</p>
                </div>
                
                <div className="text-center">
                  <div className="h-8 border-b border-gray-400 mb-1"></div>
                  <p className="font-semibold text-xs">{data.clientName || 'Client'}</p>
                  <p className="text-xs text-gray-600">Client</p>
                  <p className="text-xs text-gray-600 mt-0.5">Date: ________</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-2 pt-1 border-t border-gray-300">
              <p>Governed by Indian Contract Act, 1872 | Generated by Agrezy</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractPreview;
