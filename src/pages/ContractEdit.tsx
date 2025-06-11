
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import ContractBuilder from './ContractBuilder';

const ContractEdit = () => {
  const { user } = useAuth();
  const { id } = useParams();

  console.log('ContractEdit - User:', user);
  console.log('ContractEdit - Contract ID:', id);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!id) {
    return <Navigate to="/contracts" replace />;
  }

  return (
    <DashboardLayout>
      <ContractBuilder contractId={id} />
    </DashboardLayout>
  );
};

export default ContractEdit;
