-- Create termination_requests table for contract termination requests
CREATE TABLE public.termination_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid,
  document_id uuid,
  request_type text NOT NULL CHECK (request_type IN ('contract', 'document')),
  requested_by text NOT NULL CHECK (requested_by IN ('client', 'freelancer')),
  client_name text NOT NULL,
  client_email text,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at timestamp with time zone,
  resolved_by uuid
);

-- Enable RLS
ALTER TABLE public.termination_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for termination requests
CREATE POLICY "Users can view termination requests for their contracts" 
ON public.termination_requests 
FOR SELECT 
USING (
  (contract_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM contracts 
    WHERE contracts.id = termination_requests.contract_id 
    AND contracts.user_id = auth.uid()
  ))
  OR
  (document_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM uploaded_documents 
    WHERE uploaded_documents.id = termination_requests.document_id 
    AND uploaded_documents.user_id = auth.uid()
  ))
);

CREATE POLICY "Public can create termination requests" 
ON public.termination_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update termination requests for their items" 
ON public.termination_requests 
FOR UPDATE 
USING (
  (contract_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM contracts 
    WHERE contracts.id = termination_requests.contract_id 
    AND contracts.user_id = auth.uid()
  ))
  OR
  (document_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM uploaded_documents 
    WHERE uploaded_documents.id = termination_requests.document_id 
    AND uploaded_documents.user_id = auth.uid()
  ))
);

-- Add trigger for updated_at
CREATE TRIGGER update_termination_requests_updated_at
BEFORE UPDATE ON public.termination_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();