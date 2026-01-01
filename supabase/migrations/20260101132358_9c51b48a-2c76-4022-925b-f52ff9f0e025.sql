-- Add RLS policy to allow public updates for signing uploaded documents
CREATE POLICY "Public can update documents to signed status" 
ON public.uploaded_documents 
FOR UPDATE 
USING (
  public_link_id IS NOT NULL 
  AND status = 'sent_for_signature'
)
WITH CHECK (
  public_link_id IS NOT NULL 
  AND status = 'signed'
);