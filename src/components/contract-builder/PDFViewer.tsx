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
    // Initialize or update fabric canvas after page loads
    setTimeout(() => {
      initializeFabricCanvas();
    }, 100);
  };

  const initializeFabricCanvas = () => {
    if (!canvasRef.current || !pageRef.current) return;

    // Clean up existing canvas
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    const pageElement = pageRef.current.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
    if (!pageElement) return;

    // Set canvas dimensions to match PDF page
    const rect = pageElement.getBoundingClientRect();
    canvasRef.current.width = rect.width;
    canvasRef.current.height = rect.height;
    canvasRef.current.style.position = 'absolute';
    canvasRef.current.style.top = '0';
    canvasRef.current.style.left = '0';
    canvasRef.current.style.pointerEvents = 'auto';

    // Initialize Fabric canvas
    const canvas = new FabricCanvas(canvasRef.current, {
      width: rect.width,
      height: rect.height,
      backgroundColor: 'transparent',
      selection: !readonly
    });

    fabricCanvasRef.current = canvas;

    // Load existing signature positions for current page
    loadSignaturePositions();

    if (!readonly) {
      // Handle adding new signature boxes
      canvas.on('mouse:down', (e) => {
        if (!isAddingSignature) return;

        const pointer = canvas.getPointer(e.e);
        addSignatureBox(pointer.x, pointer.y);
        setIsAddingSignature(false);
      });
    }
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
    updateSignaturePositions();
    setCurrentPage(newPage);
  };

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
        <div className="border rounded-lg bg-gray-50 p-4 overflow-auto max-h-[600px]">
          <div className="flex justify-center">
            <div ref={pageRef} className="relative">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                }
                error={
                  <div className="text-center p-8">
                    <p className="text-destructive">Failed to load PDF</p>
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
                    </div>
                  }
                />
              </Document>
              <canvas ref={canvasRef} className="absolute top-0 left-0" />
            </div>
          </div>
        </div>

        {/* Signature Positions List */}
        {!readonly && getCurrentPageSignatures().length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Signature Positions on Page {currentPage}</h4>
            <div className="space-y-2">
              {getCurrentPageSignatures().map((pos) => (
                <div key={pos.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">
                    Position: {Math.round(pos.x)}, {Math.round(pos.y)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSignatureBox(pos.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

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