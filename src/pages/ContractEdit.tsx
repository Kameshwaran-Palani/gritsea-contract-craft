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
      const contractContent = document.querySelector('.contract-preview');
      if (!contractContent) {
        throw new Error('Contract preview not found');
      }

      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your PDF..."
      });

      // Create a temporary container for better PDF rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width at 96 DPI
      tempContainer.style.backgroundColor = '#ffffff';
      
      // Clone the contract content
      const clonedContent = contractContent.cloneNode(true) as HTMLElement;
      clonedContent.style.maxWidth = '100%';
      clonedContent.style.width = '100%';
      clonedContent.style.margin = '0';
      clonedContent.style.padding = '0';
      
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);

      // Get all pages from the cloned content
      const pages = tempContainer.querySelectorAll('.mx-auto.bg-white.shadow-lg');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const a4Width = 210;
      const a4Height = 297;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        if (i > 0) {
          pdf.addPage();
        }

        // Create canvas for this specific page
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794,
          windowWidth: 794,
          height: 1123 // A4 height at 96 DPI
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Add the page to PDF with exact A4 dimensions
        pdf.addImage(imgData, 'PNG', 0, 0, a4Width, a4Height);
      }

      // Remove temporary container
      document.body.removeChild(tempContainer);

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
