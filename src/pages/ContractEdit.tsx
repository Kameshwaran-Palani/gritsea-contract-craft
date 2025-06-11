
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Contract</h1>
          <p className="text-sm text-muted-foreground">Contract ID: {id}</p>
        </div>
        <ContractBuilder />
      </div>
    </DashboardLayout>
  );
};

export default ContractEdit;
