-- Allow using termination_requests for revision requests too
ALTER TABLE public.termination_requests
DROP CONSTRAINT IF EXISTS termination_requests_request_type_check;

ALTER TABLE public.termination_requests
ADD CONSTRAINT termination_requests_request_type_check
CHECK (request_type = ANY (ARRAY['contract'::text, 'document'::text, 'revision'::text]));