import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Canvas as FabricCanvas, Rect } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  MapPin, 
  Trash2,
  Save,
  MousePointer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SignaturePosition {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PDFViewerProps {
  fileUrl: string;
  signaturePositions: SignaturePosition[];
  onSignaturePositionsChange: (positions: SignaturePosition[]) => void;
  onSave: () => void;
  readonly?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  signaturePositions = [],
  onSignaturePositionsChange,
  onSave,
  readonly = false
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isAddingSignature, setIsAddingSignature] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    toast({
      title: "PDF Loaded",
      description: `Document loaded with ${numPages} pages`
    });
  };

  const onPageLoadSuccess = () => {
    // Use MutationObserver to detect when PDF canvas is fully rendered
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && pageRef.current) {
          const pdfCanvas = pageRef.current.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
          if (pdfCanvas && pdfCanvas.width > 0) {
            observer.disconnect();
            initializeFabricCanvas();
          }
        }
      });
    });

    if (pageRef.current) {
      observer.observe(pageRef.current, { childList: true, subtree: true });
      // Fallback timeout
      setTimeout(() => {
        observer.disconnect();
        initializeFabricCanvas();
      }, 1000);
    }
  };

  const initializeFabricCanvas = () => {
    if (!canvasRef.current || !pageRef.current) {
      console.log('Canvas refs not ready');
      return;
    }

    // Clean up existing canvas
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }

    const pageElement = pageRef.current.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
    if (!pageElement) {
      console.log('PDF page element not found, retrying...');
      // Retry with exponential backoff
      setTimeout(() => initializeFabricCanvas(), 300);
      return;
    }

    // Wait for the canvas to be fully loaded
    if (pageElement.width === 0 || pageElement.height === 0) {
      console.log('PDF canvas not ready, retrying...');
      setTimeout(() => initializeFabricCanvas(), 300);
      return;
    }

    // Get PDF page dimensions with proper positioning
    const pdfRect = pageElement.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) {
      console.log('Container rect not available');
      return;
    }

    // Calculate exact positioning relative to the container
    const offsetX = pdfRect.left - containerRect.left;
    const offsetY = pdfRect.top - containerRect.top;

    // Set canvas to exact dimensions and position
    const fabricCanvas = canvasRef.current;
    fabricCanvas.width = pageElement.width;
    fabricCanvas.height = pageElement.height;
    fabricCanvas.style.position = 'absolute';
    fabricCanvas.style.top = `${offsetY}px`;
    fabricCanvas.style.left = `${offsetX}px`;
    fabricCanvas.style.width = `${pdfRect.width}px`;
    fabricCanvas.style.height = `${pdfRect.height}px`;
    fabricCanvas.style.pointerEvents = readonly ? 'none' : 'auto';
    fabricCanvas.style.zIndex = '10';
    fabricCanvas.style.cursor = isAddingSignature ? 'crosshair' : 'default';

    console.log('Canvas positioning:', {
      pdfWidth: pageElement.width,
      pdfHeight: pageElement.height,
      displayWidth: pdfRect.width,
      displayHeight: pdfRect.height,
      offsetX,
      offsetY
    });

    // Initialize Fabric canvas with exact dimensions
    const canvas = new FabricCanvas(fabricCanvas, {
      width: pageElement.width,
      height: pageElement.height,
      backgroundColor: 'transparent',
      selection: !readonly,
      interactive: !readonly,
      preserveObjectStacking: true
    });

    fabricCanvasRef.current = canvas;

    // Load existing signature positions for current page
    loadSignaturePositions();

    if (!readonly) {
      // Handle adding new signature boxes
      canvas.on('mouse:down', (e) => {
        if (!isAddingSignature) return;

        const pointer = canvas.getPointer(e.e);
        console.log('Adding signature at:', pointer);
        addSignatureBox(pointer.x, pointer.y);
        setIsAddingSignature(false);
        
        toast({
          title: "Signature box added",
          description: `Added signature box at page ${currentPage}`
        });
      });

      // Handle object modifications
      canvas.on('object:modified', () => {
        console.log('Object modified, updating positions');
        updateSignaturePositions();
      });

      // Handle object selection
      canvas.on('selection:created', () => {
        console.log('Object selected');
      });

      // Handle object movement
      canvas.on('object:moving', () => {
        canvas.renderAll();
      });
    }

    canvas.renderAll();
  };

  const loadSignaturePositions = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.clear();

    const pagePositions = signaturePositions.filter(pos => pos.page === currentPage);
    
    pagePositions.forEach(pos => {
      const rect = new Rect({
        left: pos.x,
        top: pos.y,
        width: pos.width,
        height: pos.height,
        fill: 'rgba(59, 130, 246, 0.2)',
        stroke: '#3b82f6',
        strokeWidth: 2,
        cornerStyle: 'circle',
        cornerColor: '#3b82f6',
        cornerSize: 8,
        transparentCorners: false,
        selectable: !readonly,
        hasControls: !readonly,
        hasBorders: !readonly
      });

      rect.set('signatureId', pos.id);
      canvas.add(rect);
    });

    canvas.renderAll();
  };

  const addSignatureBox = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const signatureId = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const rect = new Rect({
      left: x - 50,
      top: y - 15,
      width: 100,
      height: 30,
      fill: 'rgba(59, 130, 246, 0.2)',
      stroke: '#3b82f6',
      strokeWidth: 2,
      cornerStyle: 'circle',
      cornerColor: '#3b82f6',
      cornerSize: 8,
      transparentCorners: false,
      selectable: true,
      hasControls: true,
      hasBorders: true
    });

    rect.set('signatureId', signatureId);
    canvas.add(rect);

    // Add to signature positions
    const newPosition: SignaturePosition = {
      id: signatureId,
      page: currentPage,
      x: x - 50,
      y: y - 15,
      width: 100,
      height: 30
    };

    onSignaturePositionsChange([...signaturePositions, newPosition]);
    canvas.renderAll();
  };

  const removeSignatureBox = (signatureId: string) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    
    objects.forEach(obj => {
      if (obj.get('signatureId') === signatureId) {
        canvas.remove(obj);
      }
    });

    // Remove from signature positions
    const updatedPositions = signaturePositions.filter(pos => pos.id !== signatureId);
    onSignaturePositionsChange(updatedPositions);
    canvas.renderAll();
  };

  const updateSignaturePositions = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    
    const updatedPositions = signaturePositions.filter(pos => pos.page !== currentPage);
    
    objects.forEach(obj => {
      const signatureId = obj.get('signatureId');
      if (signatureId) {
        updatedPositions.push({
          id: signatureId,
          page: currentPage,
          x: obj.left || 0,
          y: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 30
        });
      }
    });

    onSignaturePositionsChange(updatedPositions);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePageChange = (newPage: number) => {
    if (fabricCanvasRef.current) {
      updateSignaturePositions();
    }
    setCurrentPage(newPage);
  };

  // Add resize observer to handle dynamic resizing
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (fabricCanvasRef.current) {
        setTimeout(() => initializeFabricCanvas(), 100);
      }
    });

    if (pageRef.current) {
      resizeObserver.observe(pageRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [currentPage, scale, rotation]);

  const getCurrentPageSignatures = () => {
    return signaturePositions.filter(pos => pos.page === currentPage);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            PDF Viewer
            {!readonly && (
              <Badge variant="secondary" className="ml-2">
                {signaturePositions.length} signature{signaturePositions.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          
          {!readonly && (
            <div className="flex items-center gap-2">
              <Button
                variant={isAddingSignature ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAddingSignature(!isAddingSignature)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isAddingSignature ? 'Click to Place' : 'Add Signature'}
              </Button>
              <Button variant="outline" size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Controls */}
        <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= numPages}
            >
              Next
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div ref={containerRef} className="border rounded-lg bg-gray-50 p-4 overflow-auto max-h-[600px] relative">
          <div className="flex justify-center">
            <div ref={pageRef} className="relative">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading PDF...</span>
                  </div>
                }
                error={
                  <div className="text-center p-8">
                    <p className="text-destructive">Failed to load PDF</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please check the file format and try again
                    </p>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  onLoadSuccess={onPageLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading page...</span>
                    </div>
                  }
                  onRenderSuccess={() => {
                    console.log('Page rendered successfully');
                  }}
                />
              </Document>
              <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-auto" />
            </div>
          </div>
        </div>


        {isAddingSignature && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Click anywhere on the PDF to place a signature box
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFViewer;