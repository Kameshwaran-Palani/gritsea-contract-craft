
-- Enable Row Level Security on the revision_requests table
ALTER TABLE public.revision_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a new revision request.
-- This is needed for clients who are not logged in.
CREATE POLICY "Allow public insert for revision requests"
ON public.revision_requests
FOR INSERT
WITH CHECK (true);

-- Allow contract owners to view revision requests for their contracts.
CREATE POLICY "Allow contract owners to read revision requests"
ON public.revision_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.contracts
    WHERE public.contracts.id = public.revision_requests.contract_id
      AND public.contracts.user_id = auth.uid()
  )
);

-- Allow contract owners to update revision requests for their contracts (e.g., mark as resolved).
CREATE POLICY "Allow contract owners to update revision requests"
ON public.revision_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.contracts
    WHERE public.contracts.id = public.revision_requests.contract_id
      AND public.contracts.user_id = auth.uid()
  )
);
