
import React from 'react';
import { ContractData } from '@/pages/ContractBuilder';
import PaginatedContractPreview from './PaginatedContractPreview';

interface ContractPreviewProps {
  data: ContractData;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ data }) => {
  // Use the new paginated preview for realistic document layout
  return <PaginatedContractPreview data={data} />;
};

export default ContractPreview;
