
-- Add new columns to contracts table for signature workflow
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS signed_by_name TEXT,
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS verification_email_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS verification_phone_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

-- Create revision_requests table
CREATE TABLE IF NOT EXISTS public.revision_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved BOOLEAN DEFAULT false
);

-- Enable RLS on revision_requests table
ALTER TABLE public.revision_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for revision_requests
CREATE POLICY "Users can view revision requests for their contracts" ON public.revision_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contracts 
      WHERE contracts.id = revision_requests.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create revision requests" ON public.revision_requests
  FOR INSERT WITH CHECK (true);

-- Update signatures table to include more metadata
ALTER TABLE public.signatures 
ADD COLUMN IF NOT EXISTS client_verified_name TEXT,
ADD COLUMN IF NOT EXISTS client_verified_email TEXT,
ADD COLUMN IF NOT EXISTS client_verified_phone TEXT;

-- Create contract_snapshots table for version control
CREATE TABLE IF NOT EXISTS public.contract_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  snapshot_data JSONB NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS on contract_snapshots table
ALTER TABLE public.contract_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contract_snapshots
CREATE POLICY "Users can view snapshots for their contracts" ON public.contract_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contracts 
      WHERE contracts.id = contract_snapshots.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create snapshots for their contracts" ON public.contract_snapshots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contracts 
      WHERE contracts.id = contract_snapshots.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );

-- Add policy to allow public access to contracts via public_link_id for signing
CREATE POLICY "Public can view contracts for signing via public link" ON public.contracts
  FOR SELECT USING (public_link_id IS NOT NULL AND status IN ('sent_for_signature', 'revision_requested'));

-- Add policy to allow signature creation for public users
CREATE POLICY "Public can create signatures" ON public.signatures
  FOR INSERT WITH CHECK (true);

-- Add policy to allow public contract updates for signing
CREATE POLICY "Public can update contracts for signing" ON public.contracts
  FOR UPDATE USING (public_link_id IS NOT NULL AND status = 'sent_for_signature');
