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
  const formatPaymentSchedule = () => {
    if (!data.paymentSchedule || data.paymentSchedule.length === 0) return null;
    return data.paymentSchedule.map((payment, index) => {
      const amount = data.totalAmount ? data.totalAmount * payment.percentage / 100 : 0;
      return <div key={index} className="mb-3 border-b border-gray-100 pb-2">
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
        </div>;
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
    // Use setTimeout to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      paginateContent();
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);
  return <div className="contract-preview h-full overflow-auto bg-gray-100 p-8">
      {/* Hidden content for measurement */}
      <div ref={contentRef} className="hidden" style={{
      width: `${CONTENT_WIDTH}px`,
      fontFamily: data.fontFamily === 'inter' ? 'Inter, sans-serif' : data.fontFamily === 'roboto' ? 'Roboto, sans-serif' : data.fontFamily === 'playfair' ? 'Playfair Display, serif' : 'Inter, sans-serif',
      lineHeight: data.lineSpacing || 1.6,
      color: '#1f2937'
    }}>
        {/* Document Header */}
        <div className="text-center mb-8 pb-6 border-b border-gray-300">
          <div className="flex justify-between items-center mb-6">
            {data.leftLogo && <div className="flex-shrink-0">
                <img src={data.leftLogo} alt="Company Logo" className={`h-12 w-auto object-contain ${data.logoStyle === 'round' ? 'rounded-full' : 'rounded-md'}`} />
              </div>}
            
            <div className="flex-1 text-center mx-4">
              <h1 className={`${getHeaderFontSizeClass(data.headerFontSize)} font-bold mb-2 text-gray-900 tracking-tight`}>
                {data.documentTitle}
              </h1>
              <h2 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} text-gray-600 font-medium`}>
                {data.documentSubtitle}
              </h2>
            </div>
            
            {data.rightLogo && <div className="flex-shrink-0">
                <img src={data.rightLogo} alt="Client Logo" className={`h-12 w-auto object-contain ${data.logoStyle === 'round' ? 'rounded-full' : 'rounded-md'}`} />
              </div>}
          </div>
        </div>

        {/* Agreement Introduction */}
        {hasAgreementIntro() && <section className="mb-8">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-4 text-gray-900 border-b-2 border-gray-200 pb-2`}>
              AGREEMENT INTRODUCTION
            </h3>
            <div className={`${getFontSizeClass(data.bodyFontSize)} text-gray-700 space-y-4`}>
              <p className="leading-relaxed">{data.agreementIntroText}</p>
              {data.effectiveDate && <div className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900">
                    Effective Date: {new Date(data.effectiveDate).toLocaleDateString()}
                  </p>
                </div>}
            </div>
          </section>}

        {/* Parties Information */}
        {hasPartiesInfo() && <section className="mb-8">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`}>
              PARTIES TO THE AGREEMENT
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {data.freelancerName && <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-4 text-gray-900`}>
                    SERVICE PROVIDER
                  </h4>
                  <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-2 text-gray-700`}>
                    <p><span className="font-semibold text-gray-900">Name:</span> {data.freelancerName}</p>
                    {data.freelancerBusinessName && <p><span className="font-semibold text-gray-900">Business:</span> {data.freelancerBusinessName}</p>}
                    {data.freelancerAddress && <p><span className="font-semibold text-gray-900">Address:</span> {data.freelancerAddress}</p>}
                    {data.freelancerEmail && <p><span className="font-semibold text-gray-900">Email:</span> {data.freelancerEmail}</p>}
                    {data.freelancerPhone && <p><span className="font-semibold text-gray-900">Phone:</span> {data.freelancerPhone}</p>}
                  </div>
                </div>}
              {data.clientName && <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-4 text-gray-900`}>
                    CLIENT
                  </h4>
                  <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-2 text-gray-700`}>
                    <p><span className="font-semibold text-gray-900">Name:</span> {data.clientName}</p>
                    {data.clientCompany && <p><span className="font-semibold text-gray-900">Company:</span> {data.clientCompany}</p>}
                    {data.clientEmail && <p><span className="font-semibold text-gray-900">Email:</span> {data.clientEmail}</p>}
                    {data.clientPhone && <p><span className="font-semibold text-gray-900">Phone:</span> {data.clientPhone}</p>}
                  </div>
                </div>}
            </div>
          </section>}

        {/* Scope of Work */}
        {hasScopeOfWork() && <section className="mb-8">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`}>
              SCOPE OF WORK
            </h3>
            <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-6 text-gray-700`}>
              {data.services && data.services.trim() && <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900`}>
                    SERVICES
                  </h4>
                  <p className="leading-relaxed">{data.services}</p>
                </div>}
              {data.deliverables && data.deliverables.trim() && <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900`}>
                    DELIVERABLES
                  </h4>
                  <p className="leading-relaxed">{data.deliverables}</p>
                </div>}
              {data.milestones && data.milestones.length > 0 && data.milestones.some(m => m.title && m.title.trim()) && <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-4 text-gray-900`}>
                    MILESTONES
                  </h4>
                  <div className="space-y-4">
                    {data.milestones.filter(m => m.title && m.title.trim()).map((milestone, index) => <div key={index} className="border-l-4 border-blue-400 bg-blue-50 pl-4 py-3 rounded-r-md">
                        <p className="font-semibold text-gray-900">{milestone.title}</p>
                        {milestone.description && <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>}
                        {milestone.dueDate && <p className="text-sm text-blue-600 mt-1 font-medium">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>}
                        {milestone.amount && <p className="text-sm font-semibold text-green-600 mt-1">Amount: ₹{milestone.amount.toLocaleString()}</p>}
                      </div>)}
                  </div>
                </div>}
            </div>
          </section>}

        {/* Payment Terms */}
        {hasPaymentTerms() && <section className="mb-8">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`}>
              PAYMENT TERMS
            </h3>
            <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-6`}>
              <div className="">
                <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-3 text-gray-900`}>
                  PAYMENT STRUCTURE
                </h4>
                {data.paymentType === 'hourly' && data.rate > 0 ? <p className="text-lg font-bold text-green-700">Hourly Rate: ₹{data.rate?.toLocaleString()}/hour</p> : data.totalAmount && data.totalAmount > 0 ? <p className="text-lg font-bold text-green-700">Total Project Amount: ₹{data.totalAmount?.toLocaleString()}</p> : null}
              </div>

              {data.paymentType === 'fixed' && data.paymentSchedule && data.paymentSchedule.length > 0 && data.totalAmount && <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className={`${getSubHeaderFontSizeClass(data.subHeaderFontSize)} font-bold mb-4 text-gray-900`}>
                    PAYMENT SCHEDULE
                  </h4>
                  <div className="space-y-1">
                    {formatPaymentSchedule()}
                  </div>
                </div>}
            </div>
          </section>}

        {/* Continue with other sections... */}
        {hasProjectTimeline() && <section className="mb-8">
            <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-6 text-gray-900 border-b-2 border-gray-200 pb-2`}>
              PROJECT TIMELINE
            </h3>
            <div className={`${getFontSizeClass(data.bodyFontSize)} bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-3`}>
              {data.startDate && <p className="text-gray-900"><span className="font-bold">Start Date:</span> {new Date(data.startDate).toLocaleDateString()}</p>}
              {data.endDate && <p className="text-gray-900"><span className="font-bold">End Date:</span> {new Date(data.endDate).toLocaleDateString()}</p>}
            </div>
          </section>}

        {/* Add remaining sections following the same pattern */}
        
        {/* Signature Section */}
        <section className="border-t-2 border-gray-300 pt-12 mt-16">
          <h3 className={`${getSectionHeaderFontSizeClass(data.sectionHeaderFontSize)} font-bold mb-8 text-gray-900`}>
            SIGNATURES
          </h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="border-b-2 border-gray-400 mb-4 h-20 flex items-end justify-center">
                {data.freelancerSignature && <img src={data.freelancerSignature} alt="Service Provider Signature" className="h-16 object-contain" />}
              </div>
              <div className={`${getFontSizeClass(data.bodyFontSize)} space-y-1`}>
                <p className="font-bold text-gray-900">SERVICE PROVIDER</p>
                <p className="text-gray-700">{data.freelancerName}</p>
                <p className="text-gray-600">Date: {data.signedDate ? new Date(data.signedDate).toLocaleDateString() : '_____________'}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-gray-400 mb-4 h-20 flex items-end justify-center">
                {data.clientSignature && <img src={data.clientSignature} alt="Client Signature" className="h-16 object-contain" />}
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

      {/* Paginated Display */}
      <div className="space-y-8">
        {pages.map((page, index) => <div key={index} className="mx-auto bg-white shadow-lg border border-gray-200 page-break-after" style={{
        width: `${PAGE_WIDTH}px`,
        minHeight: `${PAGE_HEIGHT}px`,
        padding: `${PAGE_MARGIN}px`,
        fontFamily: data.fontFamily === 'inter' ? 'Inter, sans-serif' : data.fontFamily === 'roboto' ? 'Roboto, sans-serif' : data.fontFamily === 'playfair' ? 'Playfair Display, serif' : 'Inter, sans-serif',
        lineHeight: data.lineSpacing || 1.6,
        color: '#1f2937',
        pageBreakAfter: 'always'
      }} dangerouslySetInnerHTML={{
        __html: page.innerHTML
      }} />)}
      </div>
    </div>;
};
export default PaginatedContractPreview;