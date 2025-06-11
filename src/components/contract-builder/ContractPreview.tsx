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
      <div className="sticky top-0 bg-gray-100 pb-4 mb-4 border-b border-gray-200 z-10">
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

      {/* A4 Document Container with Page Breaks */}
      <div className="space-y-8 contract-preview">
        {/* Page 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg overflow-hidden"
          style={{ 
            fontFamily: 'serif',
            lineHeight: '1.6',
            fontSize: '12px'
          }}
        >
          <div className="p-[20mm] h-full flex flex-col">
            {/* Document Header */}
            <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
              <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">
                SERVICE AGREEMENT
              </h1>
              <p className="text-sm text-gray-600 uppercase tracking-wide">
                {data.templateName || 'Professional Service Contract'}
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

            {/* Agreement Introduction */}
            <div className="mb-6">
              <p className="text-justify">
                This Service Agreement ("Agreement") is entered into on{' '}
                <span className="font-semibold underline">
                  {data.startDate ? new Date(data.startDate).toLocaleDateString() : '____________'}
                </span>{' '}
                between the parties identified below for the purpose of establishing the terms and conditions 
                of professional services to be provided.
              </p>
            </div>

            {/* Parties Section */}
            <div className="mb-8">
              <h2 className="text-lg font-bold uppercase mb-4 border-b border-gray-400 pb-1">
                1. PARTIES
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <h3 className="font-bold text-sm uppercase mb-2 text-gray-700">Service Provider:</h3>
                  <div className="space-y-1 text-sm">
                    {data.freelancerName && <p className="font-semibold">{data.freelancerName}</p>}
                    {data.freelancerBusinessName && <p className="italic">{data.freelancerBusinessName}</p>}
                    {data.freelancerAddress && <p>{data.freelancerAddress}</p>}
                    {data.freelancerEmail && <p>Email: {data.freelancerEmail}</p>}
                    {data.freelancerPhone && <p>Phone: {data.freelancerPhone}</p>}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-sm uppercase mb-2 text-gray-700">Client:</h3>
                  <div className="space-y-1 text-sm">
                    {data.clientName && <p className="font-semibold">{data.clientName}</p>}
                    {data.clientCompany && <p className="italic">{data.clientCompany}</p>}
                    {data.clientEmail && <p>Email: {data.clientEmail}</p>}
                    {data.clientPhone && <p>Phone: {data.clientPhone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Scope of Work - First Part */}
            {data.services && (
              <div className="flex-1">
                <h2 className="text-lg font-bold uppercase mb-4 border-b border-gray-400 pb-1">
                  2. SCOPE OF WORK
                </h2>
                
                <h3 className="font-semibold mb-2">2.1 Services Description</h3>
                <p className="text-justify mb-4 text-sm leading-relaxed">
                  {data.services.substring(0, 800)}{data.services.length > 800 ? '...' : ''}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-auto pt-4 border-t border-gray-300">
              <p>Page 1 of 2</p>
              <p className="mt-1">Generated by Agrezy • agrezy.com</p>
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
            lineHeight: '1.6',
            fontSize: '12px'
          }}
        >
          <div className="p-[20mm] h-full flex flex-col">
            {/* Continued Scope of Work */}
            {data.deliverables && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">2.2 Deliverables</h3>
                <p className="text-justify mb-4 text-sm leading-relaxed">
                  {data.deliverables}
                </p>
              </div>
            )}

            {/* Payment Terms */}
            {(data.rate > 0 || data.totalAmount) && (
              <div className="mb-8">
                <h2 className="text-lg font-bold uppercase mb-4 border-b border-gray-400 pb-1">
                  3. PAYMENT TERMS
                </h2>
                
                <h3 className="font-semibold mb-2">3.1 Compensation</h3>
                <p className="text-sm mb-3">
                  The Client agrees to pay the Service Provider as follows:
                </p>
                
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-sm">
                    <span className="font-semibold">Payment Structure:</span> {data.paymentType === 'fixed' ? 'Fixed Price Project' : 'Hourly Rate'}
                  </p>
                  {data.paymentType === 'fixed' && data.totalAmount ? (
                    <p className="text-lg font-bold text-gray-800 mt-1">
                      Total Amount: ₹{data.totalAmount.toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-gray-800 mt-1">
                      Hourly Rate: ₹{data.rate}/hour
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Additional Terms */}
            <div className="mb-8">
              <h2 className="text-lg font-bold uppercase mb-4 border-b border-gray-400 pb-1">
                4. ADDITIONAL TERMS
              </h2>
              
              <div className="space-y-3 text-sm">
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
                  <p className="mt-1">Notice Period: {data.noticePeriod}</p>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-auto pt-8 border-t-2 border-gray-800">
              <h2 className="text-lg font-bold uppercase mb-6 text-center">
                SIGNATURES
              </h2>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="h-16 border-b-2 border-gray-400 mb-2"></div>
                  <p className="font-semibold text-sm">{data.freelancerName || 'Service Provider'}</p>
                  <p className="text-xs text-gray-600">Service Provider</p>
                  <p className="text-xs text-gray-600 mt-2">Date: ________________</p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 border-b-2 border-gray-400 mb-2"></div>
                  <p className="font-semibold text-sm">{data.clientName || 'Client'}</p>
                  <p className="text-xs text-gray-600">Client</p>
                  <p className="text-xs text-gray-600 mt-2">Date: ________________</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-300">
              <p>Page 2 of 2</p>
              <p className="mt-1">This contract is governed by the Indian Contract Act, 1872</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractPreview;
