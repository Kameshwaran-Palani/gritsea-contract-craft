
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ContractBuilder from './ContractBuilder';
import DashboardLayout from '@/components/DashboardLayout';

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contract Editor</h1>
            <p className="text-muted-foreground">Contract ID: {id}</p>
          </div>
        </div>
        
        {/* Contract Builder without additional wrapper */}
        <div className="bg-white rounded-lg">
          <ContractBuilder />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContractEdit;
