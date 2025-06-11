
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ContractData } from '@/pages/ContractBuilder';
import { FileText } from 'lucide-react';

interface ContractPreviewProps {
  data: ContractData;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ data }) => {
  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-4">
      <div className="sticky top-0 bg-gray-100 pb-3 mb-3 border-b border-gray-200 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Live Preview
          </h2>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Auto-updating
          </Badge>
        </div>
      </div>

      {/* A4 Document Container with proper spacing */}
      <div className="space-y-6 contract-preview">
        {/* Page 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg overflow-hidden"
          style={{ 
            fontFamily: 'serif',
            lineHeight: '1.4',
            fontSize: '11px'
          }}
        >
          <div className="p-[15mm] h-full flex flex-col">
            {/* Document Header */}
            <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
              <h1 className="text-xl font-bold uppercase tracking-wider mb-1">
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
            <div className="mb-4">
              <p className="text-justify text-xs">
                This Service Agreement ("Agreement") is entered into on{' '}
                <span className="font-semibold underline">
                  {data.startDate ? new Date(data.startDate).toLocaleDateString() : '____________'}
                </span>{' '}
                between the parties identified below.
              </p>
            </div>

            {/* Parties Section */}
            <div className="mb-6">
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

            {/* Scope of Work - First Part */}
            <div className="flex-1">
              <h2 className="text-sm font-bold uppercase mb-3 border-b border-gray-400 pb-1">
                2. SCOPE OF WORK
              </h2>
              
              <h3 className="font-semibold mb-1 text-xs">2.1 Services Description</h3>
              <p className="text-justify mb-3 text-xs leading-relaxed">
                {data.services ? data.services.substring(0, 600) + (data.services.length > 600 ? '...' : '') : 'Services to be defined...'}
              </p>

              {data.deliverables && (
                <div className="mb-3">
                  <h3 className="font-semibold mb-1 text-xs">2.2 Deliverables</h3>
                  <p className="text-justify text-xs leading-relaxed">
                    {data.deliverables.substring(0, 400) + (data.deliverables.length > 400 ? '...' : '')}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-300">
              <p>Page 1 of 2</p>
              <p className="mt-0.5">Generated by Agrezy • agrezy.com</p>
            </div>
          </div>
        </motion.div>

        {/* Page 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg overflow-hidden"
          style={{ 
            fontFamily: 'serif',
            lineHeight: '1.4',
            fontSize: '11px'
          }}
        >
          <div className="p-[15mm] h-full flex flex-col">
            {/* Payment Terms */}
            {(data.rate > 0 || data.totalAmount) && (
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase mb-3 border-b border-gray-400 pb-1">
                  3. PAYMENT TERMS
                </h2>
                
                <h3 className="font-semibold mb-1 text-xs">3.1 Compensation</h3>
                <p className="text-xs mb-2">
                  The Client agrees to pay the Service Provider as follows:
                </p>
                
                <div className="bg-gray-50 p-2 rounded mb-3">
                  <p className="text-xs">
                    <span className="font-semibold">Payment Structure:</span> {data.paymentType === 'fixed' ? 'Fixed Price Project' : 'Hourly Rate'}
                  </p>
                  {data.paymentType === 'fixed' && data.totalAmount ? (
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      Total Amount: ₹{data.totalAmount.toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      Hourly Rate: ₹{data.rate}/hour
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Additional Terms */}
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase mb-3 border-b border-gray-400 pb-1">
                4. ADDITIONAL TERMS
              </h2>
              
              <div className="space-y-2 text-xs">
                <div>
                  <h3 className="font-semibold">4.1 Confidentiality</h3>
                  <p>{data.includeNDA ? 'Both parties agree to maintain confidentiality of all proprietary information.' : 'No specific confidentiality terms apply.'}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">4.2 Intellectual Property</h3>
                  <p>All intellectual property rights shall be owned by: <span className="font-medium capitalize">{data.ipOwnership}</span></p>
                </div>
                
                <div>
                  <h3 className="font-semibold">4.3 Termination</h3>
                  <p>{data.terminationConditions}</p>
                  <p className="mt-0.5">Notice Period: {data.noticePeriod}</p>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-auto pt-6 border-t-2 border-gray-800">
              <h2 className="text-sm font-bold uppercase mb-4 text-center">
                SIGNATURES
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="h-12 border-b-2 border-gray-400 mb-1"></div>
                  <p className="font-semibold text-xs">{data.freelancerName || 'Service Provider'}</p>
                  <p className="text-xs text-gray-600">Service Provider</p>
                  <p className="text-xs text-gray-600 mt-1">Date: ________________</p>
                </div>
                
                <div className="text-center">
                  <div className="h-12 border-b-2 border-gray-400 mb-1"></div>
                  <p className="font-semibold text-xs">{data.clientName || 'Client'}</p>
                  <p className="text-xs text-gray-600">Client</p>
                  <p className="text-xs text-gray-600 mt-1">Date: ________________</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-300">
              <p>Page 2 of 2</p>
              <p className="mt-0.5">This contract is governed by the Indian Contract Act, 1872</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractPreview;
