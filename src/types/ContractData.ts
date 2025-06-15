
export interface ContractData {
  contractTitle: string;
  contractSubtitle: string;
  clientName: string;
  clientEmail: string;
  freelancerName: string;
  freelancerEmail: string;
  introduction: string;
  scopeOfWork: string;
  paymentTerms: string;
  totalAmount: number;
  paymentSchedule: { description: string; amount: number; percentage?: number; dueDate?: string }[];
  timelineStartDate: Date | undefined;
  timelineEndDate: Date | undefined;
  milestones: { title: string; description: string; dueDate: Date | null; amount: number }[];
  confidentiality: boolean;
  intellectualProperty: string;
  terminationClause: string;
  governingLaw: string;
  disputeResolution: string;
  signature: string;
  freelancerSignature: string;
  signedDate: Date | undefined;
  shareInfo?: {
    link: string;
    secretKey: string;
    clientContact: string;
    authMethod: string;
  };
  
  // Additional properties used by other components
  templateName?: string;
  paymentType?: string;
  rate?: number;
  introductionClauses?: string[];
  effectiveDate?: Date;
  agreementIntroText?: string;
  includeNDA?: boolean;
  confidentialityScope?: string;
  confidentialityDuration?: string;
  breachPenalty?: string;
  paymentBold?: boolean;
  services?: string;
  deliverables?: string;
  startDate?: Date;
  endDate?: Date;
  isRetainer?: boolean;
  retainerAmount?: number;
  fontFamily?: string;
  lineSpacing?: number;
  leftLogo?: string;
  logoStyle?: string;
  headerFontSize?: string;
  primaryColor?: string;
  documentTitle?: string;
  subHeaderFontSize?: string;
  documentSubtitle?: string;
  rightLogo?: string;
  sectionHeaderFontSize?: string;
  bodyFontSize?: string;
}
