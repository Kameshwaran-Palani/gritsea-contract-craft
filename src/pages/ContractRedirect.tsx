
import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';

const ContractRedirect = () => {
  const { id } = useParams<{ id: string }>();
  
  // Redirect to the proper contract view page
  if (id) {
    return <Navigate to={`/contract/view/${id}`} replace />;
  }
  
  // If no ID, redirect to contracts list
  return <Navigate to="/contracts" replace />;
};

export default ContractRedirect;
