import React, { useRef, useEffect, useState } from 'react';
import { ContractData } from '@/pages/ContractBuilder';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PaginatedContractPreviewProps {
  data: ContractData & { freelancerSignature?: string | null; clientSignature?: string | null; clientSignedDate?: string | null };
}

const PaginatedContractPreview: React.FC<PaginatedContractPreviewProps> = ({
  data
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<HTMLElement[]>([]);
  const [signatureUpdateKey, setSignatureUpdateKey] = useState(0);
  const [isVerticalView, setIsVerticalView] = useState(true);

  // A4 dimensions in pixels (at 96 DPI)
  const PAGE_WIDTH = 794;
  const PAGE_HEIGHT = 1123;
  const PAGE_MARGIN = 60;
  const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
  const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_MARGIN * 2;

  useEffect(() => {
    setSignatureUpdateKey(prev => prev + 1);
  }, [data.freelancerSignature, data.clientSignature, data.signedDate]);

  const getHeaderStyle = (level: 'document' | 'section' | 'sub', sectionId?: string): React.CSSProperties => {
    if (level === 'document') {
        return {
            color: data.documentHeaderColor || data.primaryColor || '#3B82F6',
            textAlign: data.documentHeaderAlignment || 'center',
            fontSize: `${data.documentHeaderFontSize || data.headerFontSize || 32}px`,
        };
    }

    if (level === 'sub' && !sectionId) { // For document subtitle
        return {
            color: data.documentSubtitleColor || data.contentColor || '#6B7280',
            textAlign: data.documentSubtitleAlignment || 'center',
            fontSize: `${data.documentSubtitleFontSize || data.subHeaderFontSize || 16}px`
        }
    }

    if (level === 'section' && sectionId) {
        const sectionStyle = data.sectionStyles?.[sectionId];
        const useGlobal = data.applyGlobalStyles || !sectionStyle;

        return {
            color: useGlobal ? data.primaryColor : sectionStyle?.headerColor || data.primaryColor,
            textAlign: useGlobal ? (data.headerAlignment as any) : sectionStyle?.headerAlignment || data.headerAlignment,
            fontSize: `${useGlobal ? data.sectionHeaderFontSize : sectionStyle?.headerFontSize || data.sectionHeaderFontSize}px`
        };
    }

    // Fallback for other headers (e.g. section sub-headers)
    const style: React.CSSProperties = {
      color: data.primaryColor || '#3B82F6',
      textAlign: data.headerAlignment || 'left',
    };
    if (level === 'section') style.fontSize = `${data.sectionHeaderFontSize || 20}px`;
    if (level === 'sub') style.fontSize = `${data.subHeaderFontSize || 16}px`;
    return style;
  };

  const getContentStyle = (sectionId?: string): React.CSSProperties => {
    if (sectionId) {
        const sectionStyle = data.sectionStyles?.[sectionId];
        const useGlobal = data.applyGlobalStyles || !sectionStyle;

        return {
            color: useGlobal ? data.contentColor : sectionStyle?.contentColor || data.contentColor,
            textAlign: useGlobal ? (data.contentAlignment as any) : sectionStyle?.contentAlignment || data.contentAlignment,
            fontSize: `${useGlobal ? data.bodyFontSize : sectionStyle?.contentFontSize || data.bodyFontSize}px`,
        };
    }

    return {
        color: data.contentColor || '#374151',
        textAlign: data.contentAlignment || 'left',
        fontSize: `${data.bodyFontSize || 12}px`,
    };
  };
  
  const getBodyStyle = (): React.CSSProperties => ({
    fontSize: `${data.bodyFontSize || 12}px`,
  });

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
            {payment.dueDate && ` • Due: ${format(new Date(payment.dueDate), 'dd-MM-yyyy')}`}
          </div>
        </div>
      );
    });
  };

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
  }, [
    data,
    signatureUpdateKey, // Force re-pagination when signatures change
    data.freelancerName,
    data.clientName,
    data.documentTitle,
    data.services,
    data.deliverables,
    data.totalAmount,
    data.rate
  ]);

  return (
    <div className="contract-preview h-full flex flex-col bg-gray-100">
      <div className="flex-shrink-0 flex items-center justify-end p-2 pr-8 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Label htmlFor="view-switch" className="text-sm font-medium">Vertical View</Label>
          <Switch
            id="view-switch"
            checked={isVerticalView}
            onCheckedChange={setIsVerticalView}
          />
        </div>
      </div>
      <div className={cn("flex-grow overflow-auto", isVerticalView && "grid place-items-center")}>
        <div ref={contentRef} style={{
          position: 'absolute',
          left: '-9999px',
          width: `${CONTENT_WIDTH}px`,
          fontFamily: data.fontFamily === 'inter' ? 'Inter, sans-serif' : data.fontFamily === 'serif' ? 'Times, serif' : data.fontFamily === 'sans' ? 'Arial, sans-serif' : data.fontFamily === 'mono' ? 'Courier, monospace' : 'Inter, sans-serif',
          lineHeight: data.lineSpacing || 1.6,
          color: data.contentColor || '#1f2937'
        }}>
          <div className="text-center mb-4 pb-4">
            <h1 className="font-bold mb-2 tracking-tight" style={getHeaderStyle('document')}>
              {data.documentTitle || 'SERVICE AGREEMENT'}
            </h1>
            <h2 className="font-medium" style={getHeaderStyle('sub')}>
              {data.documentSubtitle || 'PROFESSIONAL SERVICE CONTRACT'}
            </h2>
            <hr className="border-gray-300 my-4" />
          </div>

          {hasAgreementIntro() && (
            <>
              <section className="mb-4">
                <h3 className="font-bold mb-4" style={getHeaderStyle('section', 'introduction')}>
                  AGREEMENT INTRODUCTION
                </h3>
                <div className="space-y-4" style={getContentStyle('introduction')}>
                  <p className="leading-relaxed">{data.agreementIntroText}</p>
                  {data.effectiveDate && (
                    <p className="font-semibold" style={{ color: data.primaryColor }}>
                      Effective Date: {format(new Date(data.effectiveDate), 'dd-MM-yyyy')}
                    </p>
                  )}
                </div>
              </section>
              <hr className="border-gray-300 my-4" />
            </>
          )}

          {hasPartiesInfo() && (
            <>
              <section className="mb-4">
                <h3 className="font-bold mb-6" style={getHeaderStyle('section', 'parties')}>
                  PARTIES TO THE AGREEMENT
                </h3>
                <div className="grid grid-cols-2 gap-8" style={getContentStyle('parties')}>
                  {data.freelancerName && (
                    <div>
                      <h4 className="font-bold mb-3" style={{...getHeaderStyle('sub'), color: data.primaryColor }}>
                        SERVICE PROVIDER
                      </h4>
                      <div className="space-y-1" style={getBodyStyle()}>
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
                      <h4 className="font-bold mb-3" style={{...getHeaderStyle('sub'), color: data.primaryColor }}>
                        CLIENT
                      </h4>
                      <div className="space-y-1" style={getBodyStyle()}>
                        <p><span className="font-semibold">Name:</span> {data.clientName}</p>
                        {data.clientCompany && <p><span className="font-semibold">Company:</span> {data.clientCompany}</p>}
                        {data.clientEmail && <p><span className="font-semibold">Email:</span> {data.clientEmail}</p>}
                        {data.clientPhone && <p><span className="font-semibold">Phone:</span> {data.clientPhone}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </section>
              <hr className="border-gray-300 my-4" />
            </>
          )}

          {hasScopeOfWork() && (
            <>
              <section className="mb-4">
                <h3 className="font-bold mb-6" style={getHeaderStyle('section', 'scope')}>
                  SCOPE OF WORK
                </h3>
                <div className="space-y-6" style={getContentStyle('scope')}>
                  {data.services && data.services.trim() && (
                    <div>
                      <h4 className="font-bold mb-3" style={{...getHeaderStyle('sub'), color: data.primaryColor }}>
                        SERVICES
                      </h4>
                      <p className="leading-relaxed">{data.services}</p>
                    </div>
                  )}
                  {data.deliverables && data.deliverables.trim() && (
                    <div>
                      <h4 className="font-bold mb-3" style={{...getHeaderStyle('sub'), color: data.primaryColor }}>
                        DELIVERABLES
                      </h4>
                      <p className="leading-relaxed">{data.deliverables}</p>
                    </div>
                  )}
                  {data.milestones && data.milestones.length > 0 && data.milestones.some(m => m.title && m.title.trim()) && (
                    <div>
                      <h4 className="font-bold mb-4" style={{...getHeaderStyle('sub'), color: data.primaryColor }}>
                        MILESTONES
                      </h4>
                      <div className="space-y-3">
                        {data.milestones.filter(m => m.title && m.title.trim()).map((milestone, index) => (
                          <div key={index} className="border-l-4 border-gray-300 pl-4" style={getBodyStyle()}>
                            <p className="font-semibold" style={{ color: data.primaryColor }}>{milestone.title}</p>
                            {milestone.description && <p className="mt-1">{milestone.description}</p>}
                            {milestone.dueDate && <p className="mt-1">Due: {format(new Date(milestone.dueDate), 'dd-MM-yyyy')}</p>}
                            {milestone.amount && <p className="font-semibold mt-1" style={{ color: data.primaryColor }}>Amount: ₹{milestone.amount.toLocaleString()}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
              <hr className="border-gray-300 my-4" />
            </>
          )}

          {hasPaymentTerms() && (
            <>
              <section className="mb-4">
                <h3 className="font-bold mb-6" style={getHeaderStyle('section', 'payment')}>
                  PAYMENT TERMS
                </h3>
                <div className="space-y-6" style={getContentStyle('payment')}>
                  <div>
                    <h4 className="font-bold mb-3" style={{...getHeaderStyle('sub'), color: data.primaryColor }}>
                      PAYMENT STRUCTURE
                    </h4>
                    {data.paymentType === 'hourly' && data.rate > 0 ? (
                      <p className="font-bold" style={{...getBodyStyle(), fontSize: '1.1em'}}>Hourly Rate: ₹{data.rate?.toLocaleString()}/hour</p>
                    ) : data.totalAmount && data.totalAmount > 0 ? (
                      <p className="font-bold" style={{...getBodyStyle(), fontSize: '1.1em'}}>Total Project Amount: ₹{data.totalAmount?.toLocaleString()}</p>
                    ) : null}
                  </div>

                  {data.paymentType === 'fixed' && data.paymentSchedule && data.paymentSchedule.length > 0 && data.totalAmount && (
                    <div>
                      <h4 className="font-bold mb-4" style={{...getHeaderStyle('sub'), color: data.primaryColor }}>
                        PAYMENT SCHEDULE
                      </h4>
                      <div className="space-y-2" style={getBodyStyle()}>
                        {formatPaymentSchedule()}
                      </div>
                    </div>
                  )}

                  {hasRetainerInfo() && (
                    <div>
                      <h4 className="font-bold mb-3" style={{...getHeaderStyle('sub'), color: data.primaryColor }}>
                        RETAINER
                      </h4>
                      <p style={getBodyStyle()}>Retainer Amount: ₹{data.retainerAmount?.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </section>
              <hr className="border-gray-300 my-4" />
            </>
          )}

          {hasProjectTimeline() && (
            <>
              <section className="mb-4">
                <h3 className="font-bold mb-6" style={getHeaderStyle('section', 'timeline')}>
                  PROJECT TIMELINE
                </h3>
                <div className="space-y-3" style={getContentStyle('timeline')}>
                  {data.startDate && <p><span className="font-bold">Start Date:</span> {format(new Date(data.startDate), 'dd-MM-yyyy')}</p>}
                  {data.endDate && <p><span className="font-bold">End Date:</span> {format(new Date(data.endDate), 'dd-MM-yyyy')}</p>}
                </div>
              </section>
              <hr className="border-gray-300 my-4" />
            </>
          )}

          {hasSLA() && (
            <>
              <section className="mb-4">
                <h3 className="font-bold mb-6" style={getHeaderStyle('section', 'sla')}>
                  SERVICE LEVEL AGREEMENT
                </h3>
                <div className="space-y-2" style={getContentStyle('sla')}>
                  {data.responseTime && <p><span className="font-bold">Response Time:</span> {data.responseTime}</p>}
                </div>
              </section>
              <hr className="border-gray-300 my-4" />
            </>
          )}

          {hasIP() && (
            <>
              <section className="mb-4">
                <h3 className="font-bold mb-6" style={getHeaderStyle('section', 'ip')}>
                  INTELLECTUAL PROPERTY
                </h3>
                <div style={getContentStyle('ip')}>
                  <p><span className="font-bold">IP Ownership:</span> {data.ipOwnership}</p>
                </div>
              </section>
              <hr className="border-gray-300 my-4" />
            </>
          )}

          {hasConfidentialityInfo() && (
            <>
              <section className="mb-4">
                <h3 className="font-bold mb-6" style={getHeaderStyle('section', 'nda')}>
                  CONFIDENTIALITY
                </h3>
                <div style={getContentStyle('nda')}>
                  <p>Both parties agree to maintain confidentiality of all proprietary and sensitive information shared during the course of this agreement.</p>
                </div>
              </section>
              <hr className="border-gray-300 my-4" />
            </>
          )}

          {hasTermination() && (
            <>
              <section className="mb-4">
                <h3 className="font-bold mb-6" style={getHeaderStyle('section', 'termination')}>
                  TERMINATION
                </h3>
                <div style={getContentStyle('termination')}>
                  <p>Either party may terminate this agreement with 30 days written notice. Upon termination, all outstanding payments for completed work shall be made within 15 days.</p>
                </div>
              </section>
            </>
          )}

          <section className="border-t-2 border-gray-300 pt-8 mt-8">
            <h3 className="font-bold mb-8" style={getHeaderStyle('section', 'signatures')}>
              DIGITAL SIGNATURES
            </h3>
            <div className="grid grid-cols-2 gap-8" style={getContentStyle('signatures')}>
              <div className="text-center">
                <div className="border-b-2 border-gray-400 mb-4 h-20 flex items-end justify-center">
                  {data.freelancerSignature ? (
                    <img
                      src={data.freelancerSignature}
                      alt="Service Provider Signature"
                      className="h-16 object-contain"
                      key={`freelancer-sig-${signatureUpdateKey}`}
                      onLoad={() => console.log('[PaginatedContractPreview] Freelancer signature rendered in preview (right panel)')}
                      onError={() => console.error('[PaginatedContractPreview] Error loading freelancer signature in preview')}
                    />
                  ) : (
                    <span className="text-xs text-gray-400">[DEBUG] No freelancerSignature present</span>
                  )}
                </div>
                <div className="space-y-1" style={getBodyStyle()}>
                  <p className="font-bold" style={{ color: data.primaryColor }}>SERVICE PROVIDER</p>
                  <p>{data.freelancerName || <span className="text-gray-400">[DEBUG] No freelancerName</span>}</p>
                  <p>Date: {data.signedDate ? format(new Date(data.signedDate), 'dd-MM-yyyy') : '_____________'}</p>
                </div>
              </div>

              <div className="text-center">
                <div className="border-b-2 border-gray-400 mb-4 h-20 flex items-end justify-center">
                  {data.clientSignature && (
                    <img 
                      src={data.clientSignature} 
                      alt="Client Signature" 
                      className="h-16 object-contain"
                      key={`client-sig-${signatureUpdateKey}`}
                      onLoad={() => console.log('Client signature loaded in preview')}
                      onError={() => console.error('Error loading client signature')}
                    />
                  )}
                </div>
                <div className="space-y-1" style={getBodyStyle()}>
                  <p className="font-bold" style={{ color: data.primaryColor }}>CLIENT</p>
                  <p>{data.clientName}</p>
                  <p>Date: {data.clientSignedDate ? format(new Date(data.clientSignedDate), 'dd-MM-yyyy') : '_____________'}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-8">
          <div className={cn(isVerticalView ? "flex flex-col space-y-8" : "flex space-x-8")}>
            {pages.map((page, index) => (
              <div 
                key={`page-${index}-${signatureUpdateKey}`} 
                className="flex-shrink-0 bg-white shadow-lg border border-gray-200 page-break-after" 
                style={{
                  width: `${PAGE_WIDTH}px`,
                  minHeight: `${PAGE_HEIGHT}px`,
                  padding: 0,
                  fontFamily: data.fontFamily === 'inter' ? 'Inter, sans-serif' : data.fontFamily === 'serif' ? 'Times, serif' : data.fontFamily === 'sans' ? 'Arial, sans-serif' : data.fontFamily === 'mono' ? 'Courier, monospace' : 'Inter, sans-serif',
                  lineHeight: data.lineSpacing || 1.6,
                  color: data.contentColor || '#1f2937',
                  pageBreakAfter: 'always',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Top Banner */}
                {(data.bannerPosition === 'top' || data.bannerPosition === 'both') && data.topBanner && (
                  <div style={{ width: '100%', height: `${data.bannerHeight}px`, overflow: 'hidden', flexShrink: 0 }}>
                    <img 
                      src={data.topBanner} 
                      alt="Top banner" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                
                {/* Page Content */}
                <div 
                  style={{ 
                    flex: 1,
                    padding: `${PAGE_MARGIN}px`,
                    overflow: 'hidden'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: page.innerHTML
                  }} 
                />
                
                {/* Bottom Banner */}
                {(data.bannerPosition === 'bottom' || data.bannerPosition === 'both') && data.bottomBanner && (
                  <div style={{ width: '100%', height: `${data.bannerHeight}px`, overflow: 'hidden', flexShrink: 0 }}>
                    <img 
                      src={data.bottomBanner} 
                      alt="Bottom banner" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginatedContractPreview;
