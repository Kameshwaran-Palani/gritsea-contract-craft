
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

export const generateContractCoverImage = async (contract: Contract): Promise<string> => {
  console.log('🎨 Starting HIGH QUALITY contract image generation for:', contract.id);
  console.log('📝 Contract data:', {
    title: contract.title,
    client_name: contract.client_name,
    freelancer_name: contract.freelancer_name,
    services: contract.services?.substring(0, 100),
    contract_amount: contract.contract_amount
  });
  
  const getFontFamily = () => {
    switch (contract.font_family) {
      case 'serif': return 'Times, serif';
      case 'sans': return 'Arial, sans-serif';
      case 'mono': return 'Courier, monospace';
      default: return 'Inter, sans-serif';
    }
  };

  // Create a temporary div to render the contract - Higher resolution
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '1588px'; // A4 width at 192 DPI (double resolution)
  tempDiv.style.height = '2246px'; // A4 height at 192 DPI (double resolution)
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.fontFamily = getFontFamily();
  tempDiv.style.fontSize = '28px'; // Double font size for higher resolution
  tempDiv.style.lineHeight = '1.5';
  tempDiv.style.color = contract.primary_color || '#000000';
  tempDiv.style.padding = '120px'; // Double padding
  tempDiv.style.boxSizing = 'border-box';
  tempDiv.style.overflow = 'hidden';

  // Use actual contract data or fallback values
  const documentTitle = contract.document_title || 'SERVICE AGREEMENT';
  const documentSubtitle = contract.document_subtitle || contract.title || 'CONTRACT WITH CLIENT';
  const effectiveDate = contract.start_date ? new Date(contract.start_date).toLocaleDateString() : new Date().toLocaleDateString();
  const freelancerName = contract.freelancer_name || 'Service Provider';
  const clientName = contract.client_name || 'Client';
  const servicesText = contract.services || 'Services to be defined as per agreement between both parties.';
  const contractAmount = contract.total_amount || contract.contract_amount || 0;

  console.log('📋 Using data:', {
    documentTitle,
    documentSubtitle,
    freelancerName,
    clientName,
    contractAmount,
    servicesLength: servicesText.length
  });

  tempDiv.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%; font-family: ${getFontFamily()};">
      <!-- Header with Logos -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 80px;">
        <!-- Left Logo -->
        <div style="width: 160px; height: 160px; display: flex; align-items: center; justify-content: flex-start;">
          ${contract.left_logo ? `<img src="${contract.left_logo}" alt="Left logo" style="width: 160px; height: 160px; object-fit: cover; ${contract.logo_style === 'round' ? 'border-radius: 50%;' : 'border-radius: 16px;'}" onerror="this.style.display='none'" />` : ''}
        </div>

        <!-- Center - Document Header -->
        <div style="text-align: center; flex: 1;">
          <h1 style="font-size: 48px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 20px 0; color: ${contract.primary_color || '#000000'};">
            ${documentTitle}
          </h1>
          <p style="font-size: 32px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 20px 0;">
            ${documentSubtitle}
          </p>
          <p style="font-size: 28px; color: #888; margin: 0;">Effective: ${effectiveDate}</p>
        </div>

        <!-- Right Logo -->
        <div style="width: 160px; height: 160px; display: flex; align-items: center; justify-content: flex-end;">
          ${contract.right_logo ? `<img src="${contract.right_logo}" alt="Right logo" style="width: 160px; height: 160px; object-fit: cover; ${contract.logo_style === 'round' ? 'border-radius: 50%;' : 'border-radius: 16px;'}" onerror="this.style.display='none'" />` : ''}
        </div>
      </div>

      <div style="border-bottom: 4px solid #333; margin-bottom: 80px;"></div>

      <!-- Agreement Introduction -->
      <div style="margin-bottom: 60px;">
        <p style="text-align: justify; font-size: 28px; line-height: 1.6; margin: 0;">
          This Service Agreement ("Agreement") is entered into on
          <span style="font-weight: bold; text-decoration: underline;">
            ${effectiveDate}
          </span>
          between the parties identified below.
        </p>
      </div>

      <!-- Parties Section -->
      <div style="margin-bottom: 80px;">
        <h2 style="font-size: 32px; font-weight: bold; text-transform: uppercase; margin: 0 0 40px 0; border-bottom: 2px solid #666; padding-bottom: 10px;">
          1. PARTIES
        </h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 80px; margin-bottom: 60px;">
          <div>
            <h3 style="font-weight: bold; font-size: 28px; text-transform: uppercase; margin: 0 0 30px 0; color: #555;">Service Provider:</h3>
            <div style="line-height: 1.8;">
              <p style="font-weight: bold; margin: 0 0 10px 0; font-size: 28px;">${freelancerName}</p>
              ${contract.freelancer_business_name ? `<p style="font-style: italic; margin: 0 0 10px 0; font-size: 26px;">${contract.freelancer_business_name}</p>` : ''}
              ${contract.freelancer_address ? `<p style="margin: 0 0 10px 0; font-size: 24px;">${contract.freelancer_address}</p>` : '<p style="margin: 0 0 10px 0; font-size: 24px;">Address: To be provided</p>'}
              ${contract.freelancer_email ? `<p style="margin: 0 0 10px 0; font-size: 24px;">Email: ${contract.freelancer_email}</p>` : '<p style="margin: 0 0 10px 0; font-size: 24px;">Email: contact@provider.com</p>'}
              ${contract.freelancer_phone ? `<p style="margin: 0 0 10px 0; font-size: 24px;">Phone: ${contract.freelancer_phone}</p>` : '<p style="margin: 0 0 10px 0; font-size: 24px;">Phone: +91 XXXXXXXXXX</p>'}
            </div>
          </div>
          
          <div>
            <h3 style="font-weight: bold; font-size: 28px; text-transform: uppercase; margin: 0 0 30px 0; color: #555;">Client:</h3>
            <div style="line-height: 1.8;">
              <p style="font-weight: bold; margin: 0 0 10px 0; font-size: 28px;">${clientName}</p>
              ${contract.client_company ? `<p style="font-style: italic; margin: 0 0 10px 0; font-size: 26px;">${contract.client_company}</p>` : ''}
              <p style="margin: 0 0 10px 0; font-size: 24px;">Email: ${contract.client_email || 'client@company.com'}</p>
              ${contract.client_phone ? `<p style="margin: 0 0 10px 0; font-size: 24px;">Phone: ${contract.client_phone}</p>` : '<p style="margin: 0 0 10px 0; font-size: 24px;">Phone: +91 XXXXXXXXXX</p>'}
            </div>
          </div>
        </div>
      </div>

      <!-- Scope of Work Preview -->
      <div style="margin-bottom: 60px; flex: 1;">
        <h2 style="font-size: 32px; font-weight: bold; text-transform: uppercase; margin: 0 0 40px 0; border-bottom: 2px solid #666; padding-bottom: 10px;">
          2. SCOPE OF WORK
        </h2>
        
        <h3 style="font-weight: bold; margin: 0 0 20px 0; font-size: 28px;">2.1 Services Description</h3>
        <p style="text-align: justify; font-size: 28px; line-height: 1.6; margin: 0 0 40px 0;">
          ${servicesText.length > 500 ? servicesText.substring(0, 500) + '...' : servicesText}
        </p>

        ${contract.deliverables ? `
          <h3 style="font-weight: bold; margin: 0 0 20px 0; font-size: 28px;">2.2 Deliverables</h3>
          <p style="text-align: justify; font-size: 28px; line-height: 1.6; margin: 0 0 40px 0;">
            ${contract.deliverables.length > 300 ? contract.deliverables.substring(0, 300) + '...' : contract.deliverables}
          </p>
        ` : ''}
      </div>

      <!-- Payment Terms Preview -->
      ${contractAmount > 0 ? `
        <div style="margin-top: auto;">
          <div style="background-color: #f8f9fa; padding: 40px; border-radius: 16px; font-size: 28px;">
            <h3 style="font-weight: bold; margin: 0 0 20px 0; font-size: 32px;">3. PAYMENT TERMS</h3>
            <p style="font-weight: bold; color: #333; margin: 0 0 10px 0;">
              Total Amount: ₹${contractAmount.toLocaleString()}
            </p>
            ${contract.rate && contract.rate > 0 ? `
              <p style="color: #666; margin: 0;">
                Rate: ₹${contract.rate.toLocaleString()} ${contract.payment_type === 'hourly' ? '/hour' : '/project'}
              </p>
            ` : ''}
          </div>
        </div>
      ` : `
        <div style="margin-top: auto;">
          <div style="background-color: #f8f9fa; padding: 40px; border-radius: 16px; font-size: 28px;">
            <h3 style="font-weight: bold; margin: 0 0 20px 0; font-size: 32px;">3. PAYMENT TERMS</h3>
            <p style="color: #666; margin: 0;">
              Payment terms to be defined as per mutual agreement.
            </p>
          </div>
        </div>
      `}

      <!-- Footer -->
      <div style="text-align: center; font-size: 24px; color: #888; padding-top: 40px; border-top: 2px solid #ddd; margin-top: 40px;">
        <p style="margin: 0;">Generated by Agrezy</p>
      </div>
    </div>
  `;

  document.body.appendChild(tempDiv);
  console.log('📄 HIGH RESOLUTION temporary div created and appended to body');

  try {
    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('🔄 Starting HIGH QUALITY html2canvas conversion...');
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale: 2, // High quality scaling
      useCORS: true,
      allowTaint: false,
      width: 1588,
      height: 2246,
      logging: false,
      foreignObjectRendering: false,
      imageTimeout: 15000, // Increased timeout
      onclone: (clonedDoc) => {
        console.log('📋 HIGH QUALITY document cloned for canvas generation');
      }
    });

    document.body.removeChild(tempDiv);
    const dataUrl = canvas.toDataURL('image/png', 1.0); // Maximum quality
    console.log('✅ HIGH QUALITY contract image generated successfully for:', contract.id, 'Data URL length:', dataUrl.length);
    return dataUrl;
  } catch (error) {
    document.body.removeChild(tempDiv);
    console.error('❌ Error generating HIGH QUALITY contract image for:', contract.id, error);
    return '';
  }
};
