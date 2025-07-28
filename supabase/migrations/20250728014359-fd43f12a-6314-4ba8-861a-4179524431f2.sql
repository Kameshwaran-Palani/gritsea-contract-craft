-- Create the uploaded-documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploaded-documents', 'uploaded-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for uploaded documents
CREATE POLICY "Public can view uploaded documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploaded-documents');

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploaded-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'uploaded-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'uploaded-documents' AND auth.uid()::text = (storage.foldername(name))[1]);