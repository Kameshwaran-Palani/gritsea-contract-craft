
import React from 'react';
import { ContractData } from '@/pages/ContractBuilder';

interface ContractPreviewProps {
  data: ContractData;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ data }) => {
  const getFontSizeClass = (size: string = 'medium') => {
    const sizes = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      xlarge: 'text-xl'
    };
    return sizes[size as keyof typeof sizes] || sizes.medium;
  };

  const getHeaderFontSizeClass = (size: string = 'xlarge') => {
    const sizes = {
      small: 'text-lg',
      medium: 'text-xl',
      large: 'text-2xl',
      xlarge: 'text-3xl'
    };
    return sizes[size as keyof typeof sizes] || sizes.xlarge;
  };

  const getSectionHeaderFontSizeClass = (size: string = 'large') => {
    const sizes = {
      small: 'text-base',
      medium: 'text-lg',
      large: 'text-xl',
      xlarge: 'text-2xl'
    };
    return sizes[size as keyof typeof sizes] || sizes.large;
  };

  const getSubHeaderFontSizeClass = (size: string = 'medium') => {
    const sizes = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      xlarge: 'text-xl'
    };
    return sizes[size as keyof typeof sizes] || sizes.medium;
  };

  const formatPaymentSchedule = () => {
    if (!data.paymentSchedule || data.paymentSchedule.length === 0) {
      return null;
    }

    return data.paymentSchedule.map((payment, index) => {
      const amount = data.totalAmount ? (data.totalAmount * payment.percentage) / 100 : 0;
      return (
        <div key={index} className="mb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className={`font-medium ${data.paymentBold ? 'font-bold' : ''}`}>
                {payment.description || `Payment ${index + 1}`}
              </p>
              <p className="text-sm text-gray-600">
                {payment.percentage}% of total amount
                {payment.dueDate && ` - Due: ${new Date(payment.dueDate).toLocaleDateString()}`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">₹{amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="contract-preview h-full overflow-auto bg-gray-100 p-4">
      {/* A4 sized container with proper margins and spacing */}
      <div 
        className="max-w-4xl mx-auto bg-white shadow-lg min-h-[297mm]"
        style={{
          width: '210mm',
          minHeight: '297mm',
          fontFamily: data.fontFamily === 'inter' ? 'Inter, sans-serif' : 
                     data.fontFamily === 'roboto' ? 'Roboto, sans-serif' : 
                     data.fontFamily === 'playfair' ? 'Playfair Display, serif' : 'Inter, sans-serif',
          lineHeight: data.lineSpacing || 1.5,
          color: '#1a1a1a',
          padding: '20mm'
        }}
      >
        {/* Header Section */}
        <div className="border-b-2 border-gray-200 pb-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            {/* Left Logo */}
            {data.leftLogo && (
              <div className="flex-shrink-0">
                <img 
                  src={data.leftLogo} 
                  alt="Company Logo" 
                  className={`h-16 w-auto object-contain ${data.logoStyle === 'round' ? 'rounded-full' : 'rounded-lg'}`}
                />
              </div>
            )}
            
            {/* Center Title */}
            <div className="flex-1 text-center mx-4">
              <h1 
                className={`${getHeaderFontSizeClass(data.headerFontSize)} font-bold mb-2`}
                style={{ color: data.primaryColor }}
              >
                {data.documentTitle}
              </h1>
              <h2 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} text-gray-600`}>
                {data.documentSubtitle}
              </h2>
            </div>
            
            {/* Right Logo */}
            {data.rightLogo && (
              <div className="flex-shrink-0">
                <img 
                  src={data.rightLogo} 
                  alt="Client Logo" 
                  className={`h-16 w-auto object-contain ${data.logoStyle === 'round' ? 'rounded-full' : 'rounded-lg'}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Content Sections with proper spacing */}
        <div className="space-y-10">
          {/* Agreement Introduction */}
          {data.agreementIntroText && (
            <section className="page-break-inside-avoid">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-semibold mb-4`} style={{ color: data.primaryColor }}>
                Agreement Introduction
              </h3>
              <p className={`${getFontSizeClass(data.bodyFontSize)} mb-4 leading-relaxed`}>
                {data.agreementIntroText}
              </p>
              {data.effectiveDate && (
                <p className={`${getFontSizeClass(data.bodyFontSize)} mb-4`}>
                  <strong>Effective Date:</strong> {new Date(data.effectiveDate).toLocaleDateString()}
                </p>
              )}
            </section>
          )}

          {/* Parties Information */}
          <section className="page-break-inside-avoid">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-semibold mb-6`} style={{ color: data.primaryColor }}>
              Parties to the Agreement
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-medium mb-3 ${data.partiesBold ? 'font-bold' : ''}`}>
                  Service Provider
                </h4>
                <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-2`}>
                  <p><strong>Name:</strong> {data.freelancerName}</p>
                  {data.freelancerBusinessName && <p><strong>Business:</strong> {data.freelancerBusinessName}</p>}
                  <p><strong>Address:</strong> {data.freelancerAddress}</p>
                  <p><strong>Email:</strong> {data.freelancerEmail}</p>
                  {data.freelancerPhone && <p><strong>Phone:</strong> {data.freelancerPhone}</p>}
                </div>
              </div>
              <div>
                <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-medium mb-3 ${data.partiesBold ? 'font-bold' : ''}`}>
                  Client
                </h4>
                <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-2`}>
                  <p><strong>Name:</strong> {data.clientName}</p>
                  {data.clientCompany && <p><strong>Company:</strong> {data.clientCompany}</p>}
                  <p><strong>Email:</strong> {data.clientEmail}</p>
                  {data.clientPhone && <p><strong>Phone:</strong> {data.clientPhone}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Scope of Work */}
          {data.services && (
            <section className="page-break-inside-avoid">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-semibold mb-6`} style={{ color: data.primaryColor }}>
                Scope of Work
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-6`}>
                <div>
                  <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-medium mb-3 ${data.scopeBold ? 'font-bold' : ''}`}>
                    Services
                  </h4>
                  <p className="leading-relaxed">{data.services}</p>
                </div>
                {data.deliverables && (
                  <div>
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-medium mb-3 ${data.scopeBold ? 'font-bold' : ''}`}>
                      Deliverables
                    </h4>
                    <p className="leading-relaxed">{data.deliverables}</p>
                  </div>
                )}
                {data.milestones && data.milestones.length > 0 && (
                  <div>
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-medium mb-3 ${data.scopeBold ? 'font-bold' : ''}`}>
                      Milestones
                    </h4>
                    <div className="space-y-3">
                      {data.milestones.map((milestone, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                          <p className="text-sm text-gray-500 mt-1">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                          {milestone.amount && <p className="text-sm font-medium mt-1">Amount: ₹{milestone.amount.toLocaleString()}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Payment Terms */}
          <section className="page-break-inside-avoid">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-semibold mb-6`} style={{ color: data.primaryColor }}>
              Payment Terms
            </h3>
            <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-6`}>
              <div>
                <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-medium mb-3 ${data.paymentBold ? 'font-bold' : ''}`}>
                  Payment Structure
                </h4>
                {data.paymentType === 'hourly' ? (
                  <p>Hourly Rate: <strong>₹{data.rate?.toLocaleString()}</strong> per hour</p>
                ) : (
                  <p>Total Project Amount: <strong>₹{data.totalAmount?.toLocaleString()}</strong></p>
                )}
              </div>

              {data.paymentType === 'fixed' && data.paymentSchedule && data.paymentSchedule.length > 0 && (
                <div>
                  <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-medium mb-4 ${data.paymentBold ? 'font-bold' : ''}`}>
                    Payment Schedule
                  </h4>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {formatPaymentSchedule()}
                  </div>
                </div>
              )}

              {data.lateFeeEnabled && data.lateFeeAmount && (
                <div>
                  <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-medium mb-3 ${data.paymentBold ? 'font-bold' : ''}`}>
                    Late Payment Terms
                  </h4>
                  <p>Late Fee: ₹{data.lateFeeAmount} per day for payments made after the due date.</p>
                </div>
              )}
            </div>
          </section>

          {/* Project Timeline */}
          {(data.startDate || data.endDate) && (
            <section className="page-break-inside-avoid">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-semibold mb-6`} style={{ color: data.primaryColor }}>
                Project Timeline
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-3`}>
                {data.startDate && <p><strong>Start Date:</strong> {new Date(data.startDate).toLocaleDateString()}</p>}
                {data.endDate && <p><strong>End Date:</strong> {new Date(data.endDate).toLocaleDateString()}</p>}
              </div>
            </section>
          )}

          {/* Ongoing Work & Retainer */}
          {data.isRetainer && (
            <section className="page-break-inside-avoid">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-semibold mb-6`} style={{ color: data.primaryColor }}>
                Retainer Agreement
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-3`}>
                {data.retainerAmount && <p><strong>Retainer Amount:</strong> ₹{data.retainerAmount.toLocaleString()}</p>}
                {data.renewalCycle && <p><strong>Renewal Cycle:</strong> {data.renewalCycle}</p>}
                <p><strong>Auto-Renewal:</strong> {data.autoRenew ? 'Yes' : 'No'}</p>
              </div>
            </section>
          )}

          {/* Service Level Agreement */}
          <section className="page-break-inside-avoid">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-semibold mb-6`} style={{ color: data.primaryColor }}>
              Service Level Agreement
            </h3>
            <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-3`}>
              <p><strong>Response Time:</strong> {data.responseTime}</p>
              <p><strong>Revision Limit:</strong> {data.revisionLimit} revisions included</p>
              {data.uptimeRequirement && <p><strong>Uptime Requirement:</strong> {data.uptimeRequirement}</p>}
            </div>
          </section>

          {/* Confidentiality */}
          {data.includeNDA && (
            <section className="page-break-inside-avoid">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-semibold mb-6`} style={{ color: data.primaryColor }}>
                Confidentiality Agreement
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-3`}>
                <p className="leading-relaxed">Both parties agree to maintain confidentiality of all proprietary information shared during this engagement.</p>
                {data.confidentialityScope && <p><strong>Scope:</strong> {data.confidentialityScope}</p>}
                {data.confidentialityDuration && <p><strong>Duration:</strong> {data.confidentialityDuration}</p>}
                {data.breachPenalty && <p><strong>Breach Penalty:</strong> ₹{data.breachPenalty.toLocaleString()}</p>}
              </div>
            </section>
          )}

          {/* Intellectual Property */}
          <section className="page-break-inside-avoid">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-semibold mb-6`} style={{ color: data.primaryColor }}>
              Intellectual Property Rights
            </h3>
            <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-3`}>
              <p><strong>Ownership:</strong> {data.ipOwnership === 'client' ? 'Client owns all work product' : 
                                                  data.ipOwnership === 'freelancer' ? 'Service Provider retains ownership' : 
                                                  'Joint ownership as specified'}</p>
              <p><strong>Usage Rights:</strong> {data.usageRights === 'full' ? 'Full usage rights granted' : 'Limited usage rights as specified'}</p>
            </div>
          </section>

          {/* Termination & Dispute Resolution */}
          <section className="page-break-inside-avoid">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-semibold mb-6`} style={{ color: data.primaryColor }}>
              Termination & Dispute Resolution
            </h3>
            <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-3 ${data.termsBold ? 'font-bold' : ''}`}>
              <p><strong>Termination Conditions:</strong> {data.terminationConditions}</p>
              <p><strong>Notice Period:</strong> {data.noticePeriod}</p>
              <p><strong>Governing Jurisdiction:</strong> {data.jurisdiction}</p>
              <p><strong>Arbitration:</strong> {data.arbitrationClause ? 'Disputes subject to arbitration' : 'Standard legal proceedings apply'}</p>
            </div>
          </section>

          {/* Signature Section */}
          <section className="border-t-2 border-gray-200 pt-12 mt-16 page-break-inside-avoid">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-semibold mb-8`} style={{ color: data.primaryColor }}>
              Signatures
            </h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="border-b border-gray-300 mb-4" style={{ minHeight: '80px' }}>
                  {data.freelancerSignature && (
                    <img src={data.freelancerSignature} alt="Service Provider Signature" className="h-16 object-contain" />
                  )}
                </div>
                <p className={`${getFontSizeClass(data.bodyFontSize)} text-center leading-relaxed`}>
                  <strong>Service Provider</strong><br />
                  {data.freelancerName}<br />
                  Date: {data.signedDate ? new Date(data.signedDate).toLocaleDateString() : '_____________'}
                </p>
              </div>
              <div>
                <div className="border-b border-gray-300 mb-4" style={{ minHeight: '80px' }}>
                  {data.clientSignature && (
                    <img src={data.clientSignature} alt="Client Signature" className="h-16 object-contain" />
                  )}
                </div>
                <p className={`${getFontSizeClass(data.bodyFontSize)} text-center leading-relaxed`}>
                  <strong>Client</strong><br />
                  {data.clientName}<br />
                  Date: {data.signedDate ? new Date(data.signedDate).toLocaleDateString() : '_____________'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
