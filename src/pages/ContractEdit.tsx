
import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, User, Download, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ContractBuilder from './ContractBuilder';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ContractEdit = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const { toast } = useToast();

  console.log('ContractEdit - User:', user);
  console.log('ContractEdit - Contract ID:', id);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!id) {
    return <Navigate to="/contracts" replace />;
  }

  const handleDownloadPDF = async () => {
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your PDF..."
      });

      // Get contract data from the ContractBuilder context or preview
      const contractContent = document.querySelector('.contract-preview');
      if (!contractContent) {
        throw new Error('Contract preview not found');
      }

      // Create PDF with exact A4 dimensions and proper margins
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkNewPage = (neededHeight: number) => {
        if (yPosition + neededHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Clean header section exactly matching the preview
      const titleElement = contractContent.querySelector('h1');
      const subtitleElement = contractContent.querySelector('h2');
      
      if (titleElement && titleElement.textContent && titleElement.textContent.trim()) {
        // Main title with blue color and center alignment
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(59, 130, 246); // Blue color matching preview
        const titleText = titleElement.textContent.trim();
        pdf.text(titleText, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;
      }

      if (subtitleElement && subtitleElement.textContent && subtitleElement.textContent.trim()) {
        // Subtitle with gray color and center alignment
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(107, 114, 128); // Gray color matching preview
        const subtitleText = subtitleElement.textContent.trim();
        pdf.text(subtitleText, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;
      }

      // Add horizontal line separator exactly like preview
      pdf.setDrawColor(229, 231, 235); // Light gray
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Process sections with exact formatting from preview
      const sections = contractContent.querySelectorAll('section');
      sections.forEach((section) => {
        const heading = section.querySelector('h3');
        
        if (heading && heading.textContent && heading.textContent.trim()) {
          const sectionTitle = heading.textContent.trim();
          
          // Check if we need a new page for this section
          checkNewPage(25);
          
          // Section header with blue color and underline (matching preview)
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(59, 130, 246); // Blue color
          pdf.text(sectionTitle, margin, yPosition);
          yPosition += 3;
          
          // Blue underline
          pdf.setDrawColor(59, 130, 246);
          pdf.setLineWidth(0.8);
          pdf.line(margin, yPosition, margin + 60, yPosition);
          yPosition += 12;

          // Handle different section content based on section type
          if (sectionTitle.includes('PARTIES TO THE AGREEMENT')) {
            // Two-column layout for parties information
            const serviceProvider = section.querySelector('div:first-of-type');
            const client = section.querySelector('div:last-of-type');
            
            if (serviceProvider) {
              // Service Provider column (left)
              pdf.setFontSize(14);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(0, 0, 0);
              pdf.text('SERVICE PROVIDER', margin, yPosition);
              yPosition += 8;
              
              const spDetails = serviceProvider.querySelectorAll('p');
              spDetails.forEach((detail) => {
                if (detail.textContent && detail.textContent.trim()) {
                  pdf.setFontSize(11);
                  pdf.setFont('helvetica', 'normal');
                  pdf.setTextColor(55, 65, 81);
                  const lines = pdf.splitTextToSize(detail.textContent.trim(), contentWidth / 2 - 10);
                  lines.forEach((line: string) => {
                    pdf.text(line, margin, yPosition);
                    yPosition += 5;
                  });
                }
              });
            }

            // Reset position for client column (right side)
            let clientY = yPosition - (serviceProvider?.querySelectorAll('p').length || 0) * 5 - 8;
            
            if (client) {
              pdf.setFontSize(14);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(0, 0, 0);
              pdf.text('CLIENT', pageWidth / 2 + 10, clientY);
              clientY += 8;
              
              const clientDetails = client.querySelectorAll('p');
              clientDetails.forEach((detail) => {
                if (detail.textContent && detail.textContent.trim()) {
                  pdf.setFontSize(11);
                  pdf.setFont('helvetica', 'normal');
                  pdf.setTextColor(55, 65, 81);
                  const lines = pdf.splitTextToSize(detail.textContent.trim(), contentWidth / 2 - 10);
                  lines.forEach((line: string) => {
                    pdf.text(line, pageWidth / 2 + 10, clientY);
                    clientY += 5;
                  });
                }
              });
            }
            
            yPosition = Math.max(yPosition, clientY) + 10;
            
          } else {
            // Regular section content
            const paragraphs = section.querySelectorAll('p, div');
            paragraphs.forEach((p) => {
              if (p.textContent && 
                  p.textContent.trim() && 
                  !p.textContent.includes('Page ') && 
                  p.textContent.trim() !== sectionTitle) {
                
                const text = p.textContent.trim();
                if (text) {
                  // Check for subsection headers
                  const isSubHeader = p.querySelector('span[class*="font-bold"]') || 
                                    p.textContent.includes(':') && p.textContent.length < 100;
                  
                  if (isSubHeader) {
                    pdf.setFontSize(12);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(0, 0, 0);
                  } else {
                    pdf.setFontSize(11);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(55, 65, 81);
                  }
                  
                  const lines = pdf.splitTextToSize(text, contentWidth);
                  const lineHeight = 5;
                  
                  checkNewPage(lines.length * lineHeight);
                  
                  lines.forEach((line: string) => {
                    pdf.text(line, margin, yPosition);
                    yPosition += lineHeight;
                  });
                  yPosition += 3; // Extra spacing between paragraphs
                }
              }
            });
          }
          
          yPosition += 10; // Section spacing
        }
      });

      // Signature section with proper formatting
      checkNewPage(80);
      
      // Add separator line before signatures
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text('SIGNATURES', margin, yPosition);
      yPosition += 20;

      // Two-column signature layout
      const signatureY = yPosition;
      
      // Service Provider signature (left)
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('SERVICE PROVIDER', margin, signatureY);
      
      // Signature line
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(margin, signatureY + 20, margin + 70, signatureY + 20);
      
      // Labels
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Name: _________________________', margin, signatureY + 30);
      pdf.text('Date: __________________________', margin, signatureY + 38);
      
      // Client signature (right)
      const clientSignatureX = pageWidth / 2 + 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CLIENT', clientSignatureX, signatureY);
      
      // Signature line
      pdf.line(clientSignatureX, signatureY + 20, clientSignatureX + 70, signatureY + 20);
      
      // Labels
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Name: _________________________', clientSignatureX, signatureY + 30);
      pdf.text('Date: __________________________', clientSignatureX, signatureY + 38);

      // Download the PDF
      const fileName = `contract-${Date.now()}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Downloaded",
        description: "Contract has been downloaded as PDF successfully."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShareContract = async () => {
    // Trigger share from ContractBuilder
    const event = new CustomEvent('shareContract');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header with Professional Design */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ChevronLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            {/* Agrezy Branding */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Agrezy</span>
            </div>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-lg font-semibold text-gray-900">Contract Editor</h1>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            
            <Button
              onClick={handleShareContract}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4" />
              Get E-Sign
            </Button>
            
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Contract Builder without sidebar wrapper */}
      <ContractBuilder />
    </div>
  );
};

export default ContractEdit;
