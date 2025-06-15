
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

      // Create a temporary container with A4 dimensions for better rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.width = '794px'; // A4 width at 96 DPI
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.padding = '40px';
      
      // Clone the contract content
      const clonedContent = contractContent.cloneNode(true) as HTMLElement;
      clonedContent.style.maxWidth = '100%';
      clonedContent.style.width = '100%';
      clonedContent.style.margin = '0';
      clonedContent.style.padding = '0';
      
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);

      // Create canvas from the temporary container
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm
      const a4Width = 210;
      const a4Height = 297;
      const margin = 20; // 20mm margin on all sides
      const contentWidth = a4Width - (margin * 2);
      const contentHeight = a4Height - (margin * 2);

      // Calculate image dimensions to fit A4 with margins
      const imgAspectRatio = canvas.height / canvas.width;
      const scaledWidth = contentWidth;
      const scaledHeight = scaledWidth * imgAspectRatio;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate how many pages we need
      const pagesNeeded = Math.ceil(scaledHeight / contentHeight);
      
      for (let page = 0; page < pagesNeeded; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calculate the portion of the image for this page
        const yOffset = -(page * contentHeight * (canvas.width / scaledWidth));
        
        pdf.addImage(
          imgData, 
          'PNG', 
          margin, 
          margin + yOffset, 
          scaledWidth, 
          scaledHeight
        );
      }

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
