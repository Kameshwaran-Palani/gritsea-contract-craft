
import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, User, Download, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ContractBuilder from './ContractBuilder';
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

      // Get the paginated contract content
      const pages = document.querySelectorAll('.page-break-after');
      if (!pages.length) {
        throw new Error('No pages found for PDF generation');
      }

      // Create PDF with A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;

      // Process each page
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        if (i > 0) {
          pdf.addPage();
        }

        // Use html2canvas to convert page to image
        const canvas = await import('html2canvas').then(html2canvas => 
          html2canvas.default(page, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: page.offsetWidth,
            height: page.offsetHeight
          })
        );

        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions to fit A4
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
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
      {/* Clean Header with Website Theme */}
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
            {/* Agrezy Branding with Website Theme */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Agrezy</span>
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
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
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
