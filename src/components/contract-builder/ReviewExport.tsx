
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContractData } from '@/pages/ContractBuilder';
import { Download, Send, Eye, FileText, CheckCircle, AlertCircle, Mail } from 'lucide-react';

interface ReviewExportProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const ReviewExport: React.FC<ReviewExportProps> = ({
  data
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingToClient, setIsSendingToClient] = useState(false);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPDF(false);
      // In real implementation, this would generate and download the PDF
      console.log('PDF generated');
    }, 2000);
  };

  const sendToClient = async () => {
    setIsSendingToClient(true);
    // Simulate sending to client
    setTimeout(() => {
      setIsSendingToClient(false);
      // In real implementation, this would send the contract to client
      console.log('Contract sent to client');
    }, 2000);
  };

  const getCompletionStatus = () => {
    const required = [
      { field: 'freelancerName', label: 'Your name' },
      { field: 'clientName', label: 'Client name' },
      { field: 'clientEmail', label: 'Client email' },
      { field: 'services', label: 'Services description' },
      { field: 'startDate', label: 'Start date' }
    ];

    const missing = required.filter(item => !data[item.field as keyof ContractData]);
    return { total: required.length, missing: missing.length, missingFields: missing };
  };

  const { total, missing, missingFields } = getCompletionStatus();
  const isComplete = missing === 0;

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
              Contract Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Completion: {total - missing}/{total} required fields
              </span>
              <Badge variant={isComplete ? "default" : "outline"}>
                {isComplete ? "Ready to Send" : "Incomplete"}
              </Badge>
            </div>
            
            {missing > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 mb-2">Please complete the following:</p>
                <ul className="text-sm text-orange-700 space-y-1">
                  {missingFields.map(field => (
                    <li key={field.field}>• {field.label}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Contract Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Contract Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">SERVICE AGREEMENT</h2>
                <p className="text-muted-foreground">
                  {data.templateName || 'Professional Service Contract'}
                </p>
              </div>

              <Separator />

              {/* Parties */}
              <div>
                <h3 className="font-semibold mb-2">PARTIES</h3>
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <p className="font-medium">Service Provider:</p>
                    <p>{data.freelancerName}</p>
                    {data.freelancerBusinessName && <p>{data.freelancerBusinessName}</p>}
                    <p>{data.freelancerEmail}</p>
                  </div>
                  <div>
                    <p className="font-medium">Client:</p>
                    <p>{data.clientName}</p>
                    {data.clientCompany && <p>{data.clientCompany}</p>}
                    <p>{data.clientEmail}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Scope */}
              <div>
                <h3 className="font-semibold mb-2">SCOPE OF WORK</h3>
                <p className="text-sm">{data.services}</p>
                {data.deliverables && (
                  <div className="mt-2">
                    <p className="font-medium text-sm">Deliverables:</p>
                    <p className="text-sm">{data.deliverables}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment */}
              <div>
                <h3 className="font-semibold mb-2">PAYMENT TERMS</h3>
                <div className="text-sm space-y-2">
                  <p>
                    <span className="font-medium">Type:</span> {data.paymentType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  </p>
                  {data.paymentType === 'fixed' ? (
                    <p>
                      <span className="font-medium">Total Amount:</span> ₹{data.totalAmount?.toLocaleString()}
                    </p>
                  ) : (
                    <p>
                      <span className="font-medium">Rate:</span> ₹{data.rate}/hour
                    </p>
                  )}
                  
                  {data.paymentSchedule.length > 0 && (
                    <div>
                      <p className="font-medium">Payment Schedule:</p>
                      <ul className="list-disc list-inside ml-4">
                        {data.paymentSchedule.map((payment, index) => (
                          <li key={index}>
                            {payment.description}: {payment.percentage}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Additional Terms */}
              <div className="text-sm space-y-2">
                <p><span className="font-medium">Response Time:</span> {data.responseTime}</p>
                <p><span className="font-medium">Revisions:</span> {data.revisionLimit} included</p>
                <p><span className="font-medium">IP Ownership:</span> {data.ipOwnership}</p>
                <p><span className="font-medium">Jurisdiction:</span> {data.jurisdiction}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export & Send
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                onClick={generatePDF}
                disabled={isGeneratingPDF || !isComplete}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </Button>
              
              <Button
                onClick={sendToClient}
                disabled={isSendingToClient || !isComplete}
                className="flex items-center gap-2 bg-accent hover:bg-accent/90"
              >
                <Mail className="h-4 w-4" />
                {isSendingToClient ? 'Sending...' : 'Send to Client'}
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Client receives a secure signing link via email</li>
                <li>• They can review and sign without creating an account</li>
                <li>• Both parties receive notifications when signed</li>
                <li>• Contract becomes legally binding once both parties sign</li>
                <li>• All documents are stored securely in your dashboard</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReviewExport;
