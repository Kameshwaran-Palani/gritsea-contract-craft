
import html2canvas from 'html2canvas';

interface Contract {
  id: string;
  title: string;
  status: 'draft' | 'signed' | 'shared' | 'terminated';
  client_name: string;
  client_email: string;
  contract_amount: number;
  created_at: string;
  updated_at: string;
  freelancer_name?: string;
  freelancer_business_name?: string;
  freelancer_address?: string;
  freelancer_email?: string;
  freelancer_phone?: string;
  client_company?: string;
  client_phone?: string;
  services?: string;
  deliverables?: string;
  rate?: number;
  total_amount?: number;
  payment_type?: string;
  start_date?: string;
  document_title?: string;
  document_subtitle?: string;
  primary_color?: string;
  font_family?: string;
  font_size?: string;
  left_logo?: string;
  right_logo?: string;
  logo_style?: string;
}

export const generateContractCardImage = async (contract: Contract): Promise<string> => {
  console.log('🎨 Starting FAST card image generation for:', contract.id);
  
  const getFontFamily = () => {
    switch (contract.font_family) {
      case 'serif': return 'Times, serif';
      case 'sans': return 'Arial, sans-serif';
      case 'mono': return 'Courier, monospace';
      default: return 'Inter, sans-serif';
    }
  };

  // Create optimized card-sized preview - much smaller and faster
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '400px'; // Small card size
  tempDiv.style.height = '565px'; // A4 ratio but small
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.fontFamily = getFontFamily();
  tempDiv.style.fontSize = '12px'; // Smaller font for card
  tempDiv.style.lineHeight = '1.4';
  tempDiv.style.color = contract.primary_color || '#000000';
  tempDiv.style.padding = '24px';
  tempDiv.style.boxSizing = 'border-box';
  tempDiv.style.overflow = 'hidden';

  const documentTitle = contract.document_title || 'SERVICE AGREEMENT';
  const documentSubtitle = contract.document_subtitle || contract.title || 'CONTRACT WITH CLIENT';
  const effectiveDate = contract.start_date ? new Date(contract.start_date).toLocaleDateString() : new Date().toLocaleDateString();
  const freelancerName = contract.freelancer_name || 'Service Provider';
  const clientName = contract.client_name || 'Client';
  const servicesText = contract.services || 'Services to be defined as per agreement between both parties.';
  const contractAmount = contract.total_amount || contract.contract_amount || 0;

  tempDiv.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%; font-family: ${getFontFamily()};">
      <!-- Compact Header -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0; color: ${contract.primary_color || '#000000'};">
          ${documentTitle}
        </h1>
        <p style="font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px 0;">
          ${documentSubtitle}
        </p>
        <p style="font-size: 10px; color: #888; margin: 0;">Effective: ${effectiveDate}</p>
      </div>

      <div style="border-bottom: 1px solid #ddd; margin-bottom: 16px;"></div>

      <!-- Compact Parties Section -->
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 12px 0; color: #555;">
          PARTIES
        </h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 10px;">
          <div>
            <h3 style="font-weight: bold; font-size: 11px; margin: 0 0 6px 0; color: #555;">Provider:</h3>
            <p style="font-weight: bold; margin: 0 0 2px 0;">${freelancerName}</p>
            ${contract.freelancer_email ? `<p style="margin: 0 0 2px 0; font-size: 9px;">${contract.freelancer_email}</p>` : ''}
          </div>
          
          <div>
            <h3 style="font-weight: bold; font-size: 11px; margin: 0 0 6px 0; color: #555;">Client:</h3>
            <p style="font-weight: bold; margin: 0 0 2px 0;">${clientName}</p>
            <p style="margin: 0 0 2px 0; font-size: 9px;">${contract.client_email || 'client@company.com'}</p>
          </div>
        </div>
      </div>

      <!-- Compact Services Preview -->
      <div style="margin-bottom: 16px; flex: 1;">
        <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 8px 0; color: #555;">
          SCOPE OF WORK
        </h2>
        <p style="font-size: 10px; line-height: 1.3; margin: 0; color: #666;">
          ${servicesText.length > 120 ? servicesText.substring(0, 120) + '...' : servicesText}
        </p>
      </div>

      <!-- Compact Payment Info -->
      ${contractAmount > 0 ? `
        <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 10px; margin-top: auto;">
          <h3 style="font-weight: bold; margin: 0 0 4px 0; font-size: 11px;">PAYMENT</h3>
          <p style="font-weight: bold; color: #333; margin: 0;">
            ₹${contractAmount.toLocaleString()}
          </p>
        </div>
      ` : `
        <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 10px; margin-top: auto;">
          <p style="color: #666; margin: 0; font-size: 9px;">
            Payment terms to be defined
          </p>
        </div>
      `}

      <!-- Compact Footer -->
      <div style="text-align: center; font-size: 8px; color: #aaa; padding-top: 8px; margin-top: 8px; border-top: 1px solid #eee;">
        <p style="margin: 0;">Agrezy</p>
      </div>
    </div>
  `;

  document.body.appendChild(tempDiv);
  console.log('📄 FAST card-sized div created');

  try {
    // Much shorter wait time for cards
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('🔄 Starting FAST html2canvas conversion...');
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale: 1, // Lower scale for faster generation
      useCORS: true,
      allowTaint: false,
      width: 400,
      height: 565,
      logging: false,
      foreignObjectRendering: false,
      imageTimeout: 5000, // Shorter timeout
    });

    document.body.removeChild(tempDiv);
    const dataUrl = canvas.toDataURL('image/png', 0.8); // Good quality but not max
    console.log('✅ FAST card image generated for:', contract.id, 'Size:', dataUrl.length);
    return dataUrl;
  } catch (error) {
    document.body.removeChild(tempDiv);
    console.error('❌ Error generating FAST card image:', contract.id, error);
    return '';
  }
};
