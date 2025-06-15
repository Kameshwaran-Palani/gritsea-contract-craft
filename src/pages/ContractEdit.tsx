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

      // Create PDF using similar approach as ContractBuilder
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

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number, fontStyle: string = 'normal') => {
        if (!text || !text.trim()) return 0; // Skip empty content
        
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(0, 0, 0);

        const lines = pdf.splitTextToSize(text.trim(), contentWidth);
        const lineHeight = fontSize * 0.4;
        
        checkNewPage(lines.length * lineHeight);
        
        lines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        
        return lines.length * lineHeight;
      };

      // Extract text content from the preview, but only include sections with content
      const titleElement = contractContent.querySelector('h1');
      const subtitleElement = contractContent.querySelector('h2');
      
      if (titleElement && titleElement.textContent && titleElement.textContent.trim()) {
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(titleElement.textContent.trim(), pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
      }

      if (subtitleElement && subtitleElement.textContent && subtitleElement.textContent.trim()) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.text(subtitleElement.textContent.trim(), pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;
      }

      // Add separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Extract and add other content sections - only if they have content
      const sections = contractContent.querySelectorAll('section');
      sections.forEach((section) => {
        const heading = section.querySelector('h3');
        const hasContent = section.textContent && section.textContent.trim();
        
        // Only add section if it has meaningful content beyond just the heading
        if (hasContent && hasContent.length > (heading?.textContent?.length || 0) + 10) {
          if (heading && heading.textContent && heading.textContent.trim()) {
            addText(heading.textContent.trim(), 16, 'bold');
            yPosition += 5;
          }

          const paragraphs = section.querySelectorAll('p, div');
          paragraphs.forEach((p) => {
            if (p.textContent && p.textContent.trim() && 
                !p.textContent.includes('Page ') && // Skip page indicators
                p.textContent.trim() !== heading?.textContent?.trim()) { // Skip duplicate headings
              const added = addText(p.textContent.trim(), 12);
              if (added > 0) yPosition += 3;
            }
          });
          yPosition += 8;
        }
      });

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
