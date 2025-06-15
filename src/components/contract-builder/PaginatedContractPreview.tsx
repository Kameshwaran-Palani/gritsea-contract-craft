import React, { useRef, useEffect, useState } from 'react';
import { ContractData } from '@/pages/ContractBuilder';

interface PaginatedContractPreviewProps {
  data: ContractData;
}

const PaginatedContractPreview: React.FC<PaginatedContractPreviewProps> = ({
  data
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<HTMLElement[]>([]);

  // A4 dimensions in pixels (at 96 DPI)
  const PAGE_WIDTH = 794; // 210mm
  const PAGE_HEIGHT = 1123; // 297mm
  const PAGE_MARGIN = 60; // ~20mm
  const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
  const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_MARGIN * 2;

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

  // Helper functions to check if sections have content
  const hasPartiesInfo = () => data.freelancerName || data.clientName;
  const hasScopeOfWork = () => {
    return data.services && data.services.trim() || data.deliverables && data.deliverables.trim() || data.milestones && data.milestones.length > 0 && data.milestones.some(m => m.title && m.title.trim());
  };
  const hasPaymentTerms = () => data.rate > 0 || data.totalAmount > 0 || data.paymentSchedule && data.paymentSchedule.length > 0;
  const hasProjectTimeline = () => data.startDate || data.endDate;
  const hasRetainerInfo = () => data.isRetainer && data.retainerAmount && data.retainerAmount > 0;
  const hasConfidentialityInfo = () => data.includeNDA;
  const hasAgreementIntro = () => data.agreementIntroText && data.agreementIntroText.trim();
  const hasSLA = () => data.responseTime;
  const hasIP = () => data.ipOwnership;
  const hasTermination = () => true; // Always show termination clause

  // Helper function to format payment schedule
  const formatPaymentSchedule = () => {
    if (!data.paymentSchedule || data.paymentSchedule.length === 0) return null;
    return data.paymentSchedule.map((payment, index) => {
      const amount = data.totalAmount ? data.totalAmount * payment.percentage / 100 : 0;
      return (
        <div key={index} className="mb-2">
          <div className="flex justify-between">
            <span>{payment.description || `Payment ${index + 1}`}</span>
            <span>₹{amount.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-600">
            {payment.percentage}% of total amount
            {payment.dueDate && ` • Due: ${new Date(payment.dueDate).toLocaleDateString()}`}
          </div>
        </div>
      );
    });
  };

  // Paginate content function
  const paginateContent = () => {
    if (!contentRef.current) return;
    const container = contentRef.current;
    const children = Array.from(container.children) as HTMLElement[];
    const newPages: HTMLElement[] = [];
    let currentPage = document.createElement('div');
    currentPage.className = 'page-content';
    let currentHeight = 0;

    children.forEach(child => {
      const childHeight = child.offsetHeight;
      const marginBottom = parseInt(getComputedStyle(child).marginBottom) || 0;
      const totalHeight = childHeight + marginBottom;

      // Check if adding this child would exceed page height
      if (currentHeight + totalHeight > CONTENT_HEIGHT && currentHeight > 0) {
        // Start a new page
        newPages.push(currentPage);
        currentPage = document.createElement('div');
        currentPage.className = 'page-content';
        currentHeight = 0;
      }

      // Clone the child and add to current page
      const clonedChild = child.cloneNode(true) as HTMLElement;
      currentPage.appendChild(clonedChild);
      currentHeight += totalHeight;
    });

    // Add the last page if it has content
    if (currentPage.children.length > 0) {
      newPages.push(currentPage);
    }
    setPages(newPages);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      paginateContent();
    }, 100);
    return () => clearTimeout(timer);
  }, [data, data.freelancerSignature, data.signedDate]); // Added signedDate as dependency

  return (
    <div className="contract-preview h-full overflow-x-auto bg-gray-100 p-8">
      {/* Hidden content for measurement */}
      <div ref={contentRef} className="hidden" style={{
        width: `${CONTENT_WIDTH}px`,
        fontFamily: data.fontFamily === 'inter' ? 'Inter, sans-serif' : data.fontFamily === 'roboto' ? 'Roboto, sans-serif' : data.fontFamily === 'playfair' ? 'Playfair Display, serif' : 'Inter, sans-serif',
        lineHeight: data.lineSpacing || 1.6,
        color: '#1f2937'
      }}>
        {/* Document Header */}
        <div className="text-center mb-8 pb-6">
          <h1 className={`${getHeaderFontSizeClass(data.headerFontSize)} font-bold mb-2 text-gray-900 tracking-tight`}>
            {data.documentTitle || 'SERVICE AGREEMENT'}
          </h1>
          <h2 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} text-gray-600 font-medium`}>
            {data.documentSubtitle || 'PROFESSIONAL SERVICE CONTRACT'}
          </h2>
        </div>

        {/* Agreement Introduction */}
        {hasAgreementIntro() && (
          <>
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-4 text-gray-900`}>
                AGREEMENT INTRODUCTION
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} text-gray-700 space-y-4`}>
                <p className="leading-relaxed">{data.agreementIntroText}</p>
                {data.effectiveDate && (
                  <p className="font-semibold text-gray-900">
                    Effective Date: {new Date(data.effectiveDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </section>
            <hr className="border-gray-300 my-8" />
          </>
        )}

        {/* Parties Information */}
        {hasPartiesInfo() && (
          <>
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900`}>
                PARTIES TO THE AGREEMENT
              </h3>
              <div className="grid grid-cols-2 gap-8">
                {data.freelancerName && (
                  <div>
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900`}>
                      SERVICE PROVIDER
                    </h4>
                    <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-1 text-gray-700`}>
                      <p><span className="font-semibold">Name:</span> {data.freelancerName}</p>
                      {data.freelancerBusinessName && <p><span className="font-semibold">Business:</span> {data.freelancerBusinessName}</p>}
                      {data.freelancerAddress && <p><span className="font-semibold">Address:</span> {data.freelancerAddress}</p>}
                      {data.freelancerEmail && <p><span className="font-semibold">Email:</span> {data.freelancerEmail}</p>}
                      {data.freelancerPhone && <p><span className="font-semibold">Phone:</span> {data.freelancerPhone}</p>}
                    </div>
                  </div>
                )}
                {data.clientName && (
                  <div>
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900`}>
                      CLIENT
                    </h4>
                    <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-1 text-gray-700`}>
                      <p><span className="font-semibold">Name:</span> {data.clientName}</p>
                      {data.clientCompany && <p><span className="font-semibold">Company:</span> {data.clientCompany}</p>}
                      {data.clientEmail && <p><span className="font-semibold">Email:</span> {data.clientEmail}</p>}
                      {data.clientPhone && <p><span className="font-semibold">Phone:</span> {data.clientPhone}</p>}
                    </div>
                  </div>
                )}
              </div>
            </section>
            <hr className="border-gray-300 my-8" />
          </>
        )}

        {/* Scope of Work */}
        {hasScopeOfWork() && (
          <>
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900`}>
                SCOPE OF WORK
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-6 text-gray-700`}>
                {data.services && data.services.trim() && (
                  <div>
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900`}>
                      SERVICES
                    </h4>
                    <p className="leading-relaxed">{data.services}</p>
                  </div>
                )}
                {data.deliverables && data.deliverables.trim() && (
                  <div>
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900`}>
                      DELIVERABLES
                    </h4>
                    <p className="leading-relaxed">{data.deliverables}</p>
                  </div>
                )}
                {data.milestones && data.milestones.length > 0 && data.milestones.some(m => m.title && m.title.trim()) && (
                  <div>
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-4 text-gray-900`}>
                      MILESTONES
                    </h4>
                    <div className="space-y-3">
                      {data.milestones.filter(m => m.title && m.title.trim()).map((milestone, index) => (
                        <div key={index} className="border-l-4 border-gray-300 pl-4">
                          <p className="font-semibold text-gray-900">{milestone.title}</p>
                          {milestone.description && <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>}
                          {milestone.dueDate && <p className="text-sm text-gray-600 mt-1">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>}
                          {milestone.amount && <p className="text-sm font-semibold text-gray-900 mt-1">Amount: ₹{milestone.amount.toLocaleString()}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
            <hr className="border-gray-300 my-8" />
          </>
        )}

        {/* Payment Terms */}
        {hasPaymentTerms() && (
          <>
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900`}>
                PAYMENT TERMS
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-6`}>
                <div>
                  <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900`}>
                    PAYMENT STRUCTURE
                  </h4>
                  {data.paymentType === 'hourly' && data.rate > 0 ? (
                    <p className="text-lg font-bold text-gray-900">Hourly Rate: ₹{data.rate?.toLocaleString()}/hour</p>
                  ) : data.totalAmount && data.totalAmount > 0 ? (
                    <p className="text-lg font-bold text-gray-900">Total Project Amount: ₹{data.totalAmount?.toLocaleString()}</p>
                  ) : null}
                </div>

                {data.paymentType === 'fixed' && data.paymentSchedule && data.paymentSchedule.length > 0 && data.totalAmount && (
                  <div>
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-4 text-gray-900`}>
                      PAYMENT SCHEDULE
                    </h4>
                    <div className="space-y-2">
                      {formatPaymentSchedule()}
                    </div>
                  </div>
                )}

                {hasRetainerInfo() && (
                  <div>
                    <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900`}>
                      RETAINER
                    </h4>
                    <p>Retainer Amount: ₹{data.retainerAmount?.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </section>
            <hr className="border-gray-300 my-8" />
          </>
        )}

        {/* Project Timeline */}
        {hasProjectTimeline() && (
          <>
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900`}>
                PROJECT TIMELINE
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-3`}>
                {data.startDate && <p><span className="font-bold">Start Date:</span> {new Date(data.startDate).toLocaleDateString()}</p>}
                {data.endDate && <p><span className="font-bold">End Date:</span> {new Date(data.endDate).toLocaleDateString()}</p>}
              </div>
            </section>
            <hr className="border-gray-300 my-8" />
          </>
        )}

        {/* Ongoing Work */}
        {data.paymentType === 'ongoing' && (
          <>
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900`}>
                ONGOING WORK
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} text-gray-700`}>
                <p>This is an ongoing work arrangement with flexible timeline and deliverables.</p>
              </div>
            </section>
            <hr className="border-gray-300 my-8" />
          </>
        )}

        {/* Service Level Agreement */}
        {hasSLA() && (
          <>
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900`}>
                SERVICE LEVEL AGREEMENT
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} text-gray-700 space-y-2`}>
                {data.responseTime && <p><span className="font-bold">Response Time:</span> {data.responseTime}</p>}
              </div>
            </section>
            <hr className="border-gray-300 my-8" />
          </>
        )}

        {/* Intellectual Property */}
        {hasIP() && (
          <>
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900`}>
                INTELLECTUAL PROPERTY
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} text-gray-700`}>
                <p><span className="font-bold">IP Ownership:</span> {data.ipOwnership}</p>
              </div>
            </section>
            <hr className="border-gray-300 my-8" />
          </>
        )}

        {/* Confidentiality */}
        {hasConfidentialityInfo() && (
          <>
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900`}>
                CONFIDENTIALITY
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} text-gray-700`}>
                <p>Both parties agree to maintain confidentiality of all proprietary and sensitive information shared during the course of this agreement.</p>
              </div>
            </section>
            <hr className="border-gray-300 my-8" />
          </>
        )}

        {/* Termination */}
        {hasTermination() && (
          <>
            <section className="mb-8">
              <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900`}>
                TERMINATION
              </h3>
              <div className={`${getFontSizeClass(data.bodyFontSize)} text-gray-700`}>
                <p>Either party may terminate this agreement with 30 days written notice. Upon termination, all outstanding payments for completed work shall be made within 15 days.</p>
              </div>
            </section>
            <hr className="border-gray-300 my-8" />
          </>
        )}

        {/* Signature Section - Both Parties */}
        <section className="border-t-2 border-gray-300 pt-12 mt-16">
          <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-8 text-gray-900`}>
            DIGITAL SIGNATURES
          </h3>
          <div className="grid grid-cols-2 gap-8">
            {/* Service Provider Signature */}
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

            {/* Client Signature */}
            <div className="text-center">
              <div className="border-b-2 border-gray-400 mb-4 h-20 flex items-end justify-center">
                {data.clientSignature && (
                  <img src={data.clientSignature} alt="Client Signature" className="h-16 object-contain" />
                )}
              </div>
              <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-1`}>
                <p className="font-bold text-gray-900">CLIENT</p>
                <p className="text-gray-700">{data.clientName}</p>
                <p className="text-gray-600">Date: _____________</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Horizontally Scrollable Paginated Display */}
      <div className="flex space-x-8 overflow-x-auto pb-4">
        {pages.map((page, index) => (
          <div key={`${index}-${data.freelancerSignature}`} className="flex-shrink-0 bg-white shadow-lg border border-gray-200 page-break-after" style={{
            width: `${PAGE_WIDTH}px`,
            minHeight: `${PAGE_HEIGHT}px`,
            padding: `${PAGE_MARGIN}px`,
            fontFamily: data.fontFamily === 'inter' ? 'Inter, sans-serif' : data.fontFamily === 'roboto' ? 'Roboto, sans-serif' : data.fontFamily === 'playfair' ? 'Playfair Display, serif' : 'Inter, sans-serif',
            lineHeight: data.lineSpacing || 1.6,
            color: '#1f2937',
            pageBreakAfter: 'always'
          }} dangerouslySetInnerHTML={{
            __html: page.innerHTML
          }} />
        ))}
      </div>
    </div>
  );
};

export default PaginatedContractPreview;
