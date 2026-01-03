-- Remove duplicate/conflicting UPDATE policy for uploaded_documents
DROP POLICY IF EXISTS "Public can update documents for signing" ON public.uploaded_documents;

-- Drop and recreate the signing policy to allow updating any fields when changing to signed
DROP POLICY IF EXISTS "Public can update documents to signed status" ON public.uploaded_documents;

CREATE POLICY "Public can update documents to signed status"
ON public.uploaded_documents
FOR UPDATE
USING ((public_link_id IS NOT NULL) AND (status = 'sent_for_signature'::text))
WITH CHECK (public_link_id IS NOT NULL);