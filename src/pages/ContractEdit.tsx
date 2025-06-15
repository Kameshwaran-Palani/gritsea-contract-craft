
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

      // Create PDF using jsPDF with cleaner formatting
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

      // Helper function to add text with clean formatting
      const addText = (text: string, fontSize: number, fontStyle: string = 'normal', color: string = '#000000') => {
        if (!text || !text.trim()) return 0;
        
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        
        // Convert hex color to RGB
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          pdf.setTextColor(r, g, b);
        } else {
          pdf.setTextColor(0, 0, 0);
        }

        const lines = pdf.splitTextToSize(text.trim(), contentWidth);
        const lineHeight = fontSize * 0.35;
        
        checkNewPage(lines.length * lineHeight);
        
        lines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        
        return lines.length * lineHeight;
      };

      // Helper function to add section divider
      const addSectionDivider = () => {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      };

      // Extract text content from the preview with clean structure
      const titleElement = contractContent.querySelector('h1');
      const subtitleElement = contractContent.querySelector('h2');
      
      // Clean header
      if (titleElement && titleElement.textContent && titleElement.textContent.trim()) {
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(59, 130, 246); // Blue color
        pdf.text(titleElement.textContent.trim(), pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 12;
      }

      if (subtitleElement && subtitleElement.textContent && subtitleElement.textContent.trim()) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(107, 114, 128); // Gray color
        pdf.text(subtitleElement.textContent.trim(), pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;
      }

      addSectionDivider();

      // Extract and add content sections with proper formatting
      const sections = contractContent.querySelectorAll('section');
      sections.forEach((section) => {
        const heading = section.querySelector('h3');
        
        if (heading && heading.textContent && heading.textContent.trim()) {
          // Section header with clean styling
          checkNewPage(20);
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(59, 130, 246);
          pdf.text(heading.textContent.trim(), margin, yPosition);
          yPosition += 8;
          
          // Add underline
          pdf.setDrawColor(59, 130, 246);
          pdf.setLineWidth(0.5);
          pdf.line(margin, yPosition, margin + 60, yPosition);
          yPosition += 8;

          // Content paragraphs
          const paragraphs = section.querySelectorAll('p, div');
          paragraphs.forEach((p) => {
            if (p.textContent && 
                p.textContent.trim() && 
                !p.textContent.includes('Page ') && 
                p.textContent.trim() !== heading?.textContent?.trim()) {
              
              // Clean text formatting
              const text = p.textContent.trim();
              if (text) {
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(55, 65, 81);
                
                const lines = pdf.splitTextToSize(text, contentWidth);
                const lineHeight = 5;
                
                checkNewPage(lines.length * lineHeight);
                
                lines.forEach((line: string) => {
                  pdf.text(line, margin, yPosition);
                  yPosition += lineHeight;
                });
                yPosition += 3;
              }
            }
          });
          yPosition += 6;
        }
      });

      // Clean signature section
      checkNewPage(50);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text('SIGNATURES', margin, yPosition);
      yPosition += 15;

      // Service Provider signature area
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Service Provider:', margin, yPosition);
      yPosition += 20;
      
      // Signature line
      pdf.setDrawColor(0, 0, 0);
      pdf.line(margin, yPosition, margin + 70, yPosition);
      yPosition += 8;
      
      // Name and date
      pdf.setFont('helvetica', 'normal');
      pdf.text('Name: _________________________', margin, yPosition);
      yPosition += 8;
      pdf.text('Date: _________________________', margin, yPosition);
      
      // Client signature area
      const clientX = pageWidth - margin - 80;
      yPosition -= 36; // Reset to signature level
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Client:', clientX, yPosition);
      yPosition += 20;
      
      // Signature line
      pdf.line(clientX, yPosition, clientX + 70, yPosition);
      yPosition += 8;
      
      // Name and date
      pdf.setFont('helvetica', 'normal');
      pdf.text('Name: ___________________', clientX, yPosition);
      yPosition += 8;
      pdf.text('Date: ___________________', clientX, yPosition);

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
