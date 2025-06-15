
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
      small: 'text-xl',
      medium: 'text-2xl',
      large: 'text-3xl',
      xlarge: 'text-4xl'
    };
    return sizes[size as keyof typeof sizes] || sizes.xlarge;
  };

  const getSectionHeaderFontSizeClass = (size: string = 'large') => {
    const sizes = {
      small: 'text-lg',
      medium: 'text-xl',
      large: 'text-2xl',
      xlarge: 'text-3xl'
    };
    return sizes[size as keyof typeof sizes] || sizes.large;
  };

  const getSubHeaderFontSizeClass = (size: string = 'medium') => {
    const sizes = {
      small: 'text-base',
      medium: 'text-lg',
      large: 'text-xl',
      xlarge: 'text-2xl'
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
        <div key={index} className="mb-3 border-b border-gray-100 pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className={`font-medium text-gray-800 ${data.paymentBold ? 'font-bold' : ''}`}>
                {payment.description || `Payment ${index + 1}`}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {payment.percentage}% of total amount
                {payment.dueDate && ` • Due: ${new Date(payment.dueDate).toLocaleDateString()}`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">₹{amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      );
    });
  };

  // Helper functions to check if sections have content
  const hasPartiesInfo = () => {
    return data.freelancerName || data.clientName;
  };

  const hasScopeOfWork = () => {
    return (data.services && data.services.trim()) || 
           (data.deliverables && data.deliverables.trim()) || 
           (data.milestones && data.milestones.length > 0 && data.milestones.some(m => m.title && m.title.trim()));
  };

  const hasPaymentTerms = () => {
    return data.rate > 0 || data.totalAmount > 0 || 
           (data.paymentSchedule && data.paymentSchedule.length > 0);
  };

  const hasProjectTimeline = () => {
    return data.startDate || data.endDate;
  };

  const hasRetainerInfo = () => {
    return data.isRetainer && data.retainerAmount && data.retainerAmount > 0;
  };

  const hasConfidentialityInfo = () => {
    return data.includeNDA;
  };

  const hasAgreementIntro = () => {
    return data.agreementIntroText && data.agreementIntroText.trim();
  };

  return (
    <div className="contract-preview h-full overflow-auto bg-gray-50 p-4">
      <div 
        className="mx-auto bg-white shadow-sm border border-gray-200"
        style={{
          width: '210mm',
          minHeight: '297mm',
          fontFamily: data.fontFamily === 'inter' ? 'Inter, sans-serif' : 
                     data.fontFamily === 'roboto' ? 'Roboto, sans-serif' : 
                     data.fontFamily === 'playfair' ? 'Playfair Display, serif' : 'Inter, sans-serif',
          lineHeight: data.lineSpacing || 1.6,
          color: '#1f2937',
          padding: '20mm'
        }}
      >
        {/* Clean Header Section */}
        <div className="border-b border-gray-300 pb-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            {/* Left Logo */}
            {data.leftLogo && (
              <div className="flex-shrink-0">
                <img 
                  src={data.leftLogo} 
                  alt="Company Logo" 
                  className={`h-12 w-auto object-contain ${data.logoStyle === 'round' ? 'rounded-full' : 'rounded-md'}`}
                />
              </div>
            )}
            
            {/* Center Title */}
            <div className="flex-1 text-center mx-4">
              <h1 
                className={`${getHeaderFontSizeClass(data.headerFontSize)} font-bold mb-2 text-gray-900 tracking-tight`}
                style={{ color: data.primaryColor }}
              >
                {data.documentTitle}
              </h1>
              <h2 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} text-gray-600 font-medium`}>
                {data.documentSubtitle}
              </h2>
            </div>
            
            {/* Right Logo */}
            {data.rightLogo && (
              <div className="flex-shrink-0">
                <img 
                  src={data.rightLogo} 
                  alt="Client Logo" 
                  className={`h-12 w-auto object-contain ${data.logoStyle === 'round' ? 'rounded-full' : 'rounded-md'}`}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Agreement Introduction */}
          {hasAgreementIntro() && (
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-4 text-gray-900 border-b-2 border-gray-200 pb-2`} 
                  style={{ color: data.primaryColor }}>
                AGREEMENT INTRODUCTION
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} text-gray-700 space-y-4`}>
                <p className="leading-relaxed">{data.agreementIntroText}</p>
                {data.effectiveDate && (
                  <div className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-500">
                    <p className="font-semibold text-gray-900">
                      Effective Date: {new Date(data.effectiveDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Parties Information */}
          {hasPartiesInfo() && (
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`} 
                  style={{ color: data.primaryColor }}>
                PARTIES TO THE AGREEMENT
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                {data.freelancerName && (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-4 text-gray-900 ${data.partiesBold ? 'font-bold' : ''}`}>
                      SERVICE PROVIDER
                    </h4>
                    <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-2 text-gray-700`}>
                      <p><span className="font-semibold text-gray-900">Name:</span> {data.freelancerName}</p>
                      {data.freelancerBusinessName && <p><span className="font-semibold text-gray-900">Business:</span> {data.freelancerBusinessName}</p>}
                      {data.freelancerAddress && <p><span className="font-semibold text-gray-900">Address:</span> {data.freelancerAddress}</p>}
                      {data.freelancerEmail && <p><span className="font-semibold text-gray-900">Email:</span> {data.freelancerEmail}</p>}
                      {data.freelancerPhone && <p><span className="font-semibold text-gray-900">Phone:</span> {data.freelancerPhone}</p>}
                    </div>
                  </div>
                )}
                {data.clientName && (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-4 text-gray-900 ${data.partiesBold ? 'font-bold' : ''}`}>
                      CLIENT
                    </h4>
                    <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-2 text-gray-700`}>
                      <p><span className="font-semibold text-gray-900">Name:</span> {data.clientName}</p>
                      {data.clientCompany && <p><span className="font-semibold text-gray-900">Company:</span> {data.clientCompany}</p>}
                      {data.clientEmail && <p><span className="font-semibold text-gray-900">Email:</span> {data.clientEmail}</p>}
                      {data.clientPhone && <p><span className="font-semibold text-gray-900">Phone:</span> {data.clientPhone}</p>}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Scope of Work */}
          {hasScopeOfWork() && (
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`} 
                  style={{ color: data.primaryColor }}>
                SCOPE OF WORK
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-6 text-gray-700`}>
                {data.services && data.services.trim() && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900 ${data.scopeBold ? 'font-bold' : ''}`}>
                      SERVICES
                    </h4>
                    <p className="leading-relaxed">{data.services}</p>
                  </div>
                )}
                {data.deliverables && data.deliverables.trim() && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900 ${data.scopeBold ? 'font-bold' : ''}`}>
                      DELIVERABLES
                    </h4>
                    <p className="leading-relaxed">{data.deliverables}</p>
                  </div>
                )}
                {data.milestones && data.milestones.length > 0 && data.milestones.some(m => m.title && m.title.trim()) && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-4 text-gray-900 ${data.scopeBold ? 'font-bold' : ''}`}>
                      MILESTONES
                    </h4>
                    <div className="space-y-4">
                      {data.milestones.filter(m => m.title && m.title.trim()).map((milestone, index) => (
                        <div key={index} className="border-l-4 border-blue-400 bg-blue-50 pl-4 py-3 rounded-r-md">
                          <p className="font-semibold text-gray-900">{milestone.title}</p>
                          {milestone.description && <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>}
                          {milestone.dueDate && <p className="text-sm text-blue-600 mt-1 font-medium">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>}
                          {milestone.amount && <p className="text-sm font-semibold text-green-600 mt-1">Amount: ₹{milestone.amount.toLocaleString()}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Payment Terms */}
          {hasPaymentTerms() && (
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`} 
                  style={{ color: data.primaryColor }}>
                PAYMENT TERMS
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-6`}>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900 ${data.paymentBold ? 'font-bold' : ''}`}>
                    PAYMENT STRUCTURE
                  </h4>
                  {data.paymentType === 'hourly' && data.rate > 0 ? (
                    <p className="text-lg font-bold text-green-700">Hourly Rate: ₹{data.rate?.toLocaleString()}/hour</p>
                  ) : data.totalAmount && data.totalAmount > 0 ? (
                    <p className="text-lg font-bold text-green-700">Total Project Amount: ₹{data.totalAmount?.toLocaleString()}</p>
                  ) : null}
                </div>

                {data.paymentType === 'fixed' && data.paymentSchedule && data.paymentSchedule.length > 0 && data.totalAmount && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-4 text-gray-900 ${data.paymentBold ? 'font-bold' : ''}`}>
                      PAYMENT SCHEDULE
                    </h4>
                    <div className="space-y-1">
                      {formatPaymentSchedule()}
                    </div>
                  </div>
                )}

                {data.lateFeeEnabled && data.lateFeeAmount && data.lateFeeAmount > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-2 text-red-900 ${data.paymentBold ? 'font-bold' : ''}`}>
                      LATE PAYMENT TERMS
                    </h4>
                    <p className="text-red-700">Late Fee: ₹{data.lateFeeAmount} per day for payments made after the due date.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Project Timeline */}
          {hasProjectTimeline() && (
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`} 
                  style={{ color: data.primaryColor }}>
                PROJECT TIMELINE
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-3`}>
                {data.startDate && <p className="text-gray-900"><span className="font-bold">Start Date:</span> {new Date(data.startDate).toLocaleDateString()}</p>}
                {data.endDate && <p className="text-gray-900"><span className="font-bold">End Date:</span> {new Date(data.endDate).toLocaleDateString()}</p>}
              </div>
            </section>
          )}

          {/* Ongoing Work & Retainer */}
          {hasRetainerInfo() && (
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`} 
                  style={{ color: data.primaryColor }}>
                RETAINER AGREEMENT
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} bg-purple-50 p-6 rounded-lg border border-purple-200 space-y-3`}>
                <p className="text-gray-900"><span className="font-bold">Retainer Amount:</span> ₹{data.retainerAmount.toLocaleString()}</p>
                {data.renewalCycle && <p className="text-gray-900"><span className="font-bold">Renewal Cycle:</span> {data.renewalCycle}</p>}
                <p className="text-gray-900"><span className="font-bold">Auto-Renewal:</span> {data.autoRenew ? 'Yes' : 'No'}</p>
              </div>
            </section>
          )}

          {/* Service Level Agreement */}
          <section className="mb-8">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`} 
                style={{ color: data.primaryColor }}>
              SERVICE LEVEL AGREEMENT
            </h3>
            <div className={`${getFontSizeClass(data.bodyFontSize)} bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-3`}>
              <p className="text-gray-900"><span className="font-bold">Response Time:</span> {data.responseTime}</p>
              <p className="text-gray-900"><span className="font-bold">Revision Limit:</span> {data.revisionLimit} revisions included</p>
              {data.uptimeRequirement && <p className="text-gray-900"><span className="font-bold">Uptime Requirement:</span> {data.uptimeRequirement}</p>}
            </div>
          </section>

          {/* Confidentiality */}
          {hasConfidentialityInfo() && (
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`} 
                  style={{ color: data.primaryColor }}>
                CONFIDENTIALITY AGREEMENT
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} bg-yellow-50 p-6 rounded-lg border border-yellow-200 space-y-3`}>
                <p className="leading-relaxed text-gray-700">Both parties agree to maintain confidentiality of all proprietary information shared during this engagement.</p>
                {data.confidentialityScope && <p className="text-gray-900"><span className="font-bold">Scope:</span> {data.confidentialityScope}</p>}
                {data.confidentialityDuration && <p className="text-gray-900"><span className="font-bold">Duration:</span> {data.confidentialityDuration}</p>}
                {data.breachPenalty && data.breachPenalty > 0 && <p className="text-gray-900"><span className="font-bold">Breach Penalty:</span> ₹{data.breachPenalty.toLocaleString()}</p>}
              </div>
            </section>
          )}

          {/* Intellectual Property */}
          <section className="mb-8">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`} 
                style={{ color: data.primaryColor }}>
              INTELLECTUAL PROPERTY RIGHTS
            </h3>
            <div className={`${getFontSizeClass(data.bodyFontSize)} bg-indigo-50 p-6 rounded-lg border border-indigo-200 space-y-3`}>
              <p className="text-gray-900"><span className="font-bold">Ownership:</span> {data.ipOwnership === 'client' ? 'Client owns all work product' : 
                                                data.ipOwnership === 'freelancer' ? 'Service Provider retains ownership' : 
                                                'Joint ownership as specified'}</p>
              <p className="text-gray-900"><span className="font-bold">Usage Rights:</span> {data.usageRights === 'full' ? 'Full usage rights granted' : 'Limited usage rights as specified'}</p>
            </div>
          </section>

          {/* Termination & Dispute Resolution */}
          <section className="mb-8">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`} 
                style={{ color: data.primaryColor }}>
              TERMINATION & DISPUTE RESOLUTION
            </h3>
            <div className={`${getFontSizeClass(data.bodyFontSize)} bg-red-50 p-6 rounded-lg border border-red-200 space-y-3 ${data.termsBold ? 'font-bold' : ''}`}>
              <p className="text-gray-900"><span className="font-bold">Termination Conditions:</span> {data.terminationConditions}</p>
              <p className="text-gray-900"><span className="font-bold">Notice Period:</span> {data.noticePeriod}</p>
              <p className="text-gray-900"><span className="font-bold">Governing Jurisdiction:</span> {data.jurisdiction}</p>
              <p className="text-gray-900"><span className="font-bold">Arbitration:</span> {data.arbitrationClause ? 'Disputes subject to arbitration' : 'Standard legal proceedings apply'}</p>
            </div>
          </section>

          {/* Signature Section */}
          <section className="border-t-2 border-gray-300 pt-12 mt-16">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-8 text-gray-900`} 
                style={{ color: data.primaryColor }}>
              SIGNATURES
            </h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="text-center">
                <div className="border-b-2 border-gray-400 mb-4 h-20 flex items-end justify-center">
                  {data.freelancerSignature && (
                    <img src={data.freelancerSignature} alt="Service Provider Signature" className="h-16 object-contain" />
                  )}
                </div>
                <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-1`}>
                  <p className="font-bold text-gray-900">SERVICE PROVIDER</p>
                  <p className="text-gray-700">{data.freelancerName}</p>
                  <p className="text-gray-600">Date: {data.signedDate ? new Date(data.signedDate).toLocaleDateString() : '_____________'}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-gray-400 mb-4 h-20 flex items-end justify-center">
                  {data.clientSignature && (
                    <img src={data.clientSignature} alt="Client Signature" className="h-16 object-contain" />
                  )}
                </div>
                <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-1`}>
                  <p className="font-bold text-gray-900">CLIENT</p>
                  <p className="text-gray-700">{data.clientName}</p>
                  <p className="text-gray-600">Date: {data.signedDate ? new Date(data.signedDate).toLocaleDateString() : '_____________'}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
