
import React from 'react';
import { ContractData } from '@/types/ContractData';

interface ContractPreviewSectionProps {
  data: ContractData;
}

export const ContractPreviewSection: React.FC<ContractPreviewSectionProps> = ({ data }) => {
  return (
    <div className="contract-preview hidden">
      <div className="bg-white p-8 text-black">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{data.contractTitle}</h1>
          <h2 className="text-lg text-gray-600">{data.contractSubtitle}</h2>
        </div>
        
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Service Provider:</h3>
              <p>{data.freelancerName}</p>
              <p>{data.freelancerEmail}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Client:</h3>
              <p>{data.clientName}</p>
              <p>{data.clientEmail}</p>
            </div>
          </div>
        </div>

        {data.introduction && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Introduction</h3>
            <p className="text-sm leading-relaxed">{data.introduction}</p>
          </div>
        )}

        {data.scopeOfWork && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Scope of Work</h3>
            <p className="text-sm leading-relaxed">{data.scopeOfWork}</p>
          </div>
        )}

        {data.paymentTerms && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Payment Terms</h3>
            <p className="text-sm leading-relaxed">{data.paymentTerms}</p>
            {data.totalAmount > 0 && (
              <p className="font-semibold mt-2">Total Amount: ${data.totalAmount}</p>
            )}
          </div>
        )}

        {data.paymentSchedule.some(item => item.description || item.amount > 0) && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Payment Schedule</h3>
            {data.paymentSchedule.map((item, index) => (
              (item.description || item.amount > 0) && (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.description}</span>
                  <span>${item.amount}</span>
                </div>
              )
            ))}
          </div>
        )}

        {(data.timelineStartDate || data.timelineEndDate) && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Timeline</h3>
            {data.timelineStartDate && <p className="text-sm">Start Date: {data.timelineStartDate.toLocaleDateString()}</p>}
            {data.timelineEndDate && <p className="text-sm">End Date: {data.timelineEndDate.toLocaleDateString()}</p>}
          </div>
        )}

        {data.milestones.some(milestone => milestone.title || milestone.description) && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Milestones</h3>
            {data.milestones.map((milestone, index) => (
              (milestone.title || milestone.description) && (
                <div key={index} className="mb-2 text-sm">
                  <div className="font-medium">{milestone.title}</div>
                  <div className="text-gray-600">{milestone.description}</div>
                  {milestone.dueDate && <div className="text-xs text-gray-500">Due: {milestone.dueDate.toLocaleDateString()}</div>}
                  {milestone.amount > 0 && <div className="text-xs font-medium">Amount: ${milestone.amount}</div>}
                </div>
              )
            ))}
          </div>
        )}

        {(data.confidentiality || data.intellectualProperty || data.terminationClause || data.governingLaw || data.disputeResolution) && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Legal Terms</h3>
            {data.confidentiality && <p className="text-sm mb-2">• Confidentiality clause applies</p>}
            {data.intellectualProperty && (
              <div className="mb-2">
                <h4 className="font-medium text-sm">Intellectual Property</h4>
                <p className="text-sm">{data.intellectualProperty}</p>
              </div>
            )}
            {data.terminationClause && (
              <div className="mb-2">
                <h4 className="font-medium text-sm">Termination</h4>
                <p className="text-sm">{data.terminationClause}</p>
              </div>
            )}
            {data.governingLaw && (
              <div className="mb-2">
                <h4 className="font-medium text-sm">Governing Law</h4>
                <p className="text-sm">{data.governingLaw}</p>
              </div>
            )}
            {data.disputeResolution && (
              <div className="mb-2">
                <h4 className="font-medium text-sm">Dispute Resolution</h4>
                <p className="text-sm">{data.disputeResolution}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 pt-8 border-t">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-semibold">Service Provider Signature:</p>
              {data.freelancerSignature && (
                <img src={data.freelancerSignature} alt="Freelancer Signature" className="mt-2 max-h-16" />
              )}
              <p className="text-sm mt-2">{data.freelancerName}</p>
              <p className="text-xs text-gray-500">Date: {data.signedDate?.toLocaleDateString() || '_____________'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Client Signature:</p>
              <div className="mt-2 h-16 border-b border-gray-300"></div>
              <p className="text-sm mt-2">{data.clientName}</p>
              <p className="text-xs text-gray-500">Date: _____________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
