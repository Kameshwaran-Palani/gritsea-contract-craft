
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContractData } from '@/pages/ContractBuilder';
import { FileText, Calendar, User, Building, Mail, Phone, MapPin, Clock, Banknote } from 'lucide-react';

interface ContractPreviewProps {
  data: ContractData;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ data }) => {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="sticky top-0 bg-muted/20 pb-4 mb-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Live Preview
          </h2>
          <Badge variant="outline">Auto-updating</Badge>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-none"
      >
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold mb-2">SERVICE AGREEMENT</CardTitle>
            <p className="text-muted-foreground">
              {data.templateName || 'Professional Service Contract'}
            </p>
            {data.startDate && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4" />
                Effective from: {new Date(data.startDate).toLocaleDateString()}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Parties Section */}
        {(data.freelancerName || data.clientName) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                PARTIES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Service Provider:</h4>
                  {data.freelancerName && <p className="font-medium">{data.freelancerName}</p>}
                  {data.freelancerBusinessName && <p className="text-sm text-muted-foreground">{data.freelancerBusinessName}</p>}
                  {data.freelancerEmail && (
                    <p className="text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {data.freelancerEmail}
                    </p>
                  )}
                  {data.freelancerPhone && (
                    <p className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {data.freelancerPhone}
                    </p>
                  )}
                  {data.freelancerAddress && (
                    <p className="text-sm flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      {data.freelancerAddress}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Client:</h4>
                  {data.clientName && <p className="font-medium">{data.clientName}</p>}
                  {data.clientCompany && <p className="text-sm text-muted-foreground">{data.clientCompany}</p>}
                  {data.clientEmail && (
                    <p className="text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {data.clientEmail}
                    </p>
                  )}
                  {data.clientPhone && (
                    <p className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {data.clientPhone}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scope of Work */}
        {data.services && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                SCOPE OF WORK
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Services Description:</h4>
                <p className="text-sm leading-relaxed">{data.services}</p>
              </div>
              
              {data.deliverables && (
                <div>
                  <h4 className="font-medium mb-2">Deliverables:</h4>
                  <p className="text-sm leading-relaxed">{data.deliverables}</p>
                </div>
              )}

              {data.milestones.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Project Milestones:</h4>
                  <div className="space-y-2">
                    {data.milestones.map((milestone, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-muted/50">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-medium text-sm">{milestone.title}</h5>
                          {milestone.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground">{milestone.description}</p>
                        )}
                        {milestone.amount && (
                          <p className="text-xs font-medium text-primary mt-1">₹{milestone.amount.toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Terms */}
        {(data.rate > 0 || data.totalAmount) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                PAYMENT TERMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Payment Type:</span> {data.paymentType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  </p>
                  {data.paymentType === 'fixed' && data.totalAmount ? (
                    <p className="text-lg font-semibold text-primary">₹{data.totalAmount.toLocaleString()}</p>
                  ) : (
                    <p className="text-lg font-semibold text-primary">₹{data.rate}/hour</p>
                  )}
                </div>
                
                {data.paymentSchedule.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Payment Schedule:</h5>
                    {data.paymentSchedule.map((payment, index) => (
                      <div key={index} className="text-sm">
                        • {payment.description}: {payment.percentage}%
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {data.lateFeeEnabled && data.lateFeeAmount && (
                <div className="pt-2 border-t">
                  <p className="text-sm">
                    <span className="font-medium">Late Fee:</span> ₹{data.lateFeeAmount} per day after due date
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Service Level Agreement */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              SERVICE LEVEL AGREEMENT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Response Time:</span> {data.responseTime}
            </p>
            <p className="text-sm">
              <span className="font-medium">Revisions Included:</span> {data.revisionLimit === 0 ? 'Unlimited' : data.revisionLimit}
            </p>
            {data.uptimeRequirement && (
              <p className="text-sm">
                <span className="font-medium">Uptime Requirement:</span> {data.uptimeRequirement}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Additional Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ADDITIONAL TERMS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Confidentiality:</span> {data.includeNDA ? 'Included' : 'Not included'}</p>
            <p><span className="font-medium">IP Ownership:</span> {data.ipOwnership}</p>
            <p><span className="font-medium">Jurisdiction:</span> {data.jurisdiction}</p>
            <p><span className="font-medium">Notice Period:</span> {data.noticePeriod}</p>
            {data.arbitrationClause && (
              <p><span className="font-medium">Dispute Resolution:</span> Arbitration</p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-8 border-t">
          <p>This contract is governed by Indian Contract Act, 1872</p>
          <p className="mt-1">Generated by Agrezy • agrezy.com</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ContractPreview;
