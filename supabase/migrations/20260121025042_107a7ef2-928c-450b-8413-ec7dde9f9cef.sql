-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS memo_documents_document_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS announcement_documents_document_number_seq START 1;

-- Create memo_documents table (หนังสือบันทึกข้อความ)
CREATE TABLE public.memo_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_number INTEGER NOT NULL DEFAULT nextval('memo_documents_document_number_seq'::regclass),
  subject TEXT NOT NULL,
  to_person TEXT NOT NULL,
  urgency urgency_level NOT NULL DEFAULT 'ปกติ',
  document_date DATE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcement_documents table (หนังสือประกาศ)
CREATE TABLE public.announcement_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_number INTEGER NOT NULL DEFAULT nextval('announcement_documents_document_number_seq'::regclass),
  subject TEXT NOT NULL,
  urgency urgency_level NOT NULL DEFAULT 'ปกติ',
  document_date DATE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.memo_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for memo_documents
CREATE POLICY "Allow all access to memo documents" 
ON public.memo_documents 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create RLS policies for announcement_documents
CREATE POLICY "Allow all access to announcement documents" 
ON public.announcement_documents 
FOR ALL 
USING (true) 
WITH CHECK (true);