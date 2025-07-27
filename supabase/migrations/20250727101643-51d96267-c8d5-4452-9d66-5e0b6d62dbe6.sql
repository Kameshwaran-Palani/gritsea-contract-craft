-- Create table for uploaded documents with eSign capability
CREATE TABLE public.uploaded_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'docx', etc.
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent_for_signature', 'signed', 'revision_requested'
  signature_positions JSONB DEFAULT '[]'::jsonb, -- Array of signature position objects
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  public_link_id UUID DEFAULT gen_random_uuid(),
  verification_email_required BOOLEAN DEFAULT true,
  verification_phone_required BOOLEAN DEFAULT false,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for uploaded documents
CREATE POLICY "Users can create own uploaded documents"
ON public.uploaded_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own uploaded documents"
ON public.uploaded_documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own uploaded documents"
ON public.uploaded_documents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploaded documents"
ON public.uploaded_documents
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view documents for signing"
ON public.uploaded_documents
FOR SELECT
USING (public_link_id IS NOT NULL AND status = 'sent_for_signature');

CREATE POLICY "Public can update documents for signing"
ON public.uploaded_documents
FOR UPDATE
USING (public_link_id IS NOT NULL AND status = 'sent_for_signature');

-- Create storage bucket for uploaded documents
INSERT INTO storage.buckets (id, name, public) VALUES ('uploaded-documents', 'uploaded-documents', false);

-- Create storage policies for uploaded documents
CREATE POLICY "Users can upload their documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'uploaded-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploaded-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'uploaded-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'uploaded-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create signatures table for uploaded documents (if not exists)
CREATE TABLE IF NOT EXISTS public.uploaded_document_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.uploaded_documents(id) ON DELETE CASCADE,
  signer_type TEXT NOT NULL, -- 'client', 'owner'
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signature_image_url TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  client_verified_name TEXT,
  client_verified_email TEXT,
  client_verified_phone TEXT
);

-- Enable RLS for signatures
ALTER TABLE public.uploaded_document_signatures ENABLE ROW LEVEL SECURITY;

-- Create policies for uploaded document signatures
CREATE POLICY "Users can view signatures for their documents"
ON public.uploaded_document_signatures
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.uploaded_documents 
  WHERE id = uploaded_document_signatures.document_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Public can create signatures"
ON public.uploaded_document_signatures
FOR INSERT
WITH CHECK (true);

-- Create updated_at trigger for uploaded_documents
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_uploaded_documents_updated_at
BEFORE UPDATE ON public.uploaded_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();