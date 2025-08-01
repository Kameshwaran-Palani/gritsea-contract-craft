import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
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

/*interface SignaturePosition {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}*/

interface SignaturePosition {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string; // <-- add this
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
  const [draggedBox, setDraggedBox] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const pageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    toast({
      title: "PDF Loaded",
      description: `Document loaded with ${numPages} pages`
    });
  };

  const handlePDFClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingSignature || readonly) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSignature: SignaturePosition = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      page: currentPage,
      x: x - 75, // Center the box
      y: y - 25,
      width: 150,
      height: 50
    };

    onSignaturePositionsChange([...signaturePositions, newSignature]);
    setIsAddingSignature(false);
  };

  const handleMouseDown = (e: React.MouseEvent, signatureId: string) => {
    if (readonly) return;
    
    e.stopPropagation();
    setDraggedBox(signatureId);
    
    const signature = signaturePositions.find(s => s.id === signatureId);
    if (signature) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedBox || readonly) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    const updatedPositions = signaturePositions.map(sig => 
      sig.id === draggedBox 
        ? { ...sig, x: Math.max(0, x), y: Math.max(0, y) }
        : sig
    );

    onSignaturePositionsChange(updatedPositions);
  };

  const handleMouseUp = () => {
    setDraggedBox(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const removeSignatureBox = (signatureId: string) => {
    const updatedPositions = signaturePositions.filter(pos => pos.id !== signatureId);
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
    setCurrentPage(newPage);
  };

  const getCurrentPageSignatures = () => {
    return signaturePositions.filter(pos => pos.page === currentPage);
  };

  const SignatureBox = ({ signature }: { signature: SignaturePosition }) => (
    {/* <div
      className="absolute border-2 border-blue-500 bg-blue-100/30 backdrop-blur-sm rounded flex items-center justify-center text-xs font-medium text-blue-700 cursor-move select-none group hover:bg-blue-100/50 transition-colors"
      style={{
        top: signature.y,
        left: signature.x,
        width: signature.width,
        height: signature.height,
        zIndex: 10,
        pointerEvents: readonly ? 'none' : 'auto'
      }}
      onMouseDown={(e) => handleMouseDown(e, signature.id)}
    >*/}

    

  {/*  {readonly && signature.image ? (
  <img
    src={signature.image}
    alt="Signature"
    cl<div
  className="absolute"
  style={{
    top: signature.y,
    left: signature.x,
    width: signature.width,
    height: signature.height,
    zIndex: 10,
    pointerEvents: readonly ? 'none' : 'auto',
  }}
>
  {readonly && signature.image ? (
    <img
      src={signature.image}
      alt="Signature"
      className="w-full h-full object-contain pointer-events-none"
      style={{ backgroundColor: 'transparent' }}
    />
  ) : (
    <span
      className="pointer-events-none text-xs text-blue-600"
      style={{
        border: '1px dashed #3B82F6',
        backgroundColor: '#EFF6FF',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      {readonly ? 'Signature Required' : 'Sign Here'}
    </span>
  )}
assName="h-full w-auto object-contain pointer-events-none"
  />
) : (
  <span className="pointer-events-none">
    {readonly ? 'Signature Required' : 'Sign Here'}
  </span>
)/*/}

  <div
  className="absolute"
  style={{
    top: signature.y,
    left: signature.x,
    width: signature.width,
    height: signature.height,
    zIndex: 10,
    pointerEvents: readonly ? 'none' : 'auto',
    backgroundColor: 'transparent'
  }}
  onMouseDown={(e) => !readonly && handleMouseDown(e, signature.id)}
>
  {signature.image ? (
    <img
      src={signature.image}
      alt="Signature"
      className="w-full h-full object-contain pointer-events-none"
    />
  ) : (
    !readonly && (
      <div
        className="w-full h-full border border-dashed border-gray-400 bg-white/60 text-xs text-gray-600 flex items-center justify-center"
      >
        Sign Here
      </div>
    )
  )}

  {!readonly && (
    <button
      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
      onClick={(e) => {
        e.stopPropagation();
        removeSignatureBox(signature.id);
      }}
    >
      ×
    </button>
  )}
</div>
      {!readonly && (
        <button
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
          onClick={(e) => {
            e.stopPropagation();
            removeSignatureBox(signature.id);
          }}
        >
          ×
        </button>
      )}
    </div>
  );

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
              <div
                ref={pageRef}
                className="relative w-fit"
                onClick={handlePDFClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ cursor: isAddingSignature ? 'crosshair' : 'default' }}
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  loading={
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  }
                />
                
                {/* Render signature boxes for current page */}
                {getCurrentPageSignatures().map((signature) => (
                  <SignatureBox key={signature.id} signature={signature} />
                ))}
              </div>
            </Document>
          </div>
        </div>

        {isAddingSignature && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <MousePointer className="h-4 w-4 inline mr-2" />
              Click anywhere on the PDF to place a signature box
            </p>
          </div>
        )}

        {/* Signature positions list for current page */}
        {!readonly && getCurrentPageSignatures().length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">
              Signatures on Page {currentPage} ({getCurrentPageSignatures().length})
            </h4>
            <div className="space-y-2">
              {getCurrentPageSignatures().map((sig) => (
                <div key={sig.id} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                  <span>Position: {Math.round(sig.x)}, {Math.round(sig.y)} | Size: {sig.width}×{sig.height}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSignatureBox(sig.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
