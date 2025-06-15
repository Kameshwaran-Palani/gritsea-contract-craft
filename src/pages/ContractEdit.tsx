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

      // Get the preview element to match its styling
      const previewElement = document.querySelector('.contract-preview > div');
      if (!previewElement) {
        throw new Error('Contract preview not found');
      }

      // Create PDF with exact same styling as preview
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 25;
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

      // Helper function to add text with word wrapping and exact font sizing
      const addText = (text: string, fontSize: number, fontStyle: string = 'normal', color: string = '#1a1a1a') => {
        if (!text || !text.trim()) return 0;
        
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        
        // Convert hex color to RGB
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          pdf.setTextColor(r, g, b);
        } else if (color === '#1a1a1a') {
          pdf.setTextColor(26, 26, 26);
        }

        const lines = pdf.splitTextToSize(text.trim(), contentWidth);
        const lineHeight = fontSize * 0.4;
        
        checkNewPage(lines.length * lineHeight);
        
        lines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        
        return lines.length * lineHeight;
      };

      // Get contract data from preview
      const titleElement = previewElement.querySelector('h1');
      const subtitleElement = previewElement.querySelector('h2');
      
      // Header with logos and title
      if (titleElement?.textContent?.trim()) {
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(26, 26, 26);
        pdf.text(titleElement.textContent.trim(), pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
      }

      if (subtitleElement?.textContent?.trim()) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(102, 102, 102);
        pdf.text(subtitleElement.textContent.trim(), pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;
      }

      // Add separator line (matching preview)
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Extract sections that are actually rendered in preview
      const sections = previewElement.querySelectorAll('section');
      sections.forEach((section) => {
        const heading = section.querySelector('h3');
        
        if (heading?.textContent?.trim()) {
          // Section heading with primary color
          addText(heading.textContent.trim(), 16, 'bold', '#3B82F6');
          yPosition += 5;

          // Process subsections
          const subsections = section.querySelectorAll('h4');
          const paragraphs = section.querySelectorAll('p:not(h4 + p)');
          
          subsections.forEach((subsection) => {
            if (subsection.textContent?.trim()) {
              addText(subsection.textContent.trim(), 14, 'bold');
              yPosition += 2;
            }
          });

          paragraphs.forEach((p) => {
            if (p.textContent?.trim() && !p.closest('h4')) {
              addText(p.textContent.trim(), 12);
              yPosition += 3;
            }
          });

          // Special handling for payment schedule tables
          const paymentTable = section.querySelector('.border.rounded-lg');
          if (paymentTable) {
            const paymentItems = paymentTable.querySelectorAll('.mb-3');
            paymentItems.forEach((item) => {
              const description = item.querySelector('.font-medium');
              const amount = item.querySelector('.font-semibold');
              if (description?.textContent && amount?.textContent) {
                addText(`${description.textContent}: ${amount.textContent}`, 12);
                yPosition += 2;
              }
            });
          }

          // Special handling for milestones
          const milestones = section.querySelectorAll('.border-l-4');
          milestones.forEach((milestone) => {
            const title = milestone.querySelector('.font-medium');
            const description = milestone.querySelector('.text-gray-600');
            const dueDate = milestone.querySelector('.text-gray-500');
            const amount = milestone.querySelector('.text-sm.font-medium');
            
            if (title?.textContent) {
              addText(`• ${title.textContent}`, 12, 'bold');
              if (description?.textContent) {
                addText(`  ${description.textContent}`, 11);
              }
              if (dueDate?.textContent) {
                addText(`  ${dueDate.textContent}`, 11);
              }
              if (amount?.textContent) {
                addText(`  ${amount.textContent}`, 11, 'bold');
              }
              yPosition += 3;
            }
          });

          yPosition += 8;
        }
      });

      // Signature section with proper spacing
      checkNewPage(60);
      addText('SIGNATURES', 16, 'bold', '#3B82F6');
      yPosition += 20;

      // Two column signature layout
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(26, 26, 26);
      
      // Service Provider column
      pdf.text('Service Provider:', margin, yPosition);
      pdf.line(margin, yPosition + 20, margin + 80, yPosition + 20);
      if (contractData?.freelancerName) {
        pdf.text(contractData.freelancerName, margin, yPosition + 25);
      }
      pdf.text(`Date: ${contractData?.signedDate ? new Date(contractData.signedDate).toLocaleDateString() : '_____________'}`, margin, yPosition + 35);

      // Client column
      pdf.text('Client:', pageWidth - margin - 80, yPosition);
      pdf.line(pageWidth - margin - 80, yPosition + 20, pageWidth - margin, yPosition + 20);
      if (contractData?.clientName) {
        pdf.text(contractData.clientName, pageWidth - margin - 80, yPosition + 25);
      }
      pdf.text(`Date: ${contractData?.signedDate ? new Date(contractData.signedDate).toLocaleDateString() : '_____________'}`, pageWidth - margin - 80, yPosition + 35);

      // Download PDF
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
      {/* Clean Header with Agrezy Branding */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            {/* Agrezy Branding */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="text-lg font-bold gradient-text">Agrezy</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-semibold">Contract Editor</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            
            <Button
              onClick={handleShareContract}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
              Get E-Sign
            </Button>
            
            <Link to="/settings">
              <Button variant="ghost" size="sm">
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
