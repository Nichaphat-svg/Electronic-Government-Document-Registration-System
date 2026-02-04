-- สร้าง enum สำหรับชั้นความเร็ว
CREATE TYPE public.urgency_level AS ENUM ('ด่วนที่สุด', 'ด่วนมาก', 'ด่วน', 'ปกติ');

-- สร้าง enum สำหรับประเภทหนังสือส่ง
CREATE TYPE public.document_type AS ENUM ('หนังสือภายนอก', 'หนังสือภายใน');

-- ตารางหนังสือรับ
CREATE TABLE public.incoming_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_number TEXT NOT NULL,
  from_office TEXT NOT NULL,
  subject TEXT NOT NULL,
  to_person TEXT NOT NULL,
  document_date DATE NOT NULL,
  urgency urgency_level NOT NULL DEFAULT 'ปกติ',
  notes TEXT,
  file_url TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ตารางหนังสือส่ง
CREATE TABLE public.outgoing_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_number SERIAL,
  subject TEXT NOT NULL,
  to_person TEXT NOT NULL,
  document_type document_type NOT NULL DEFAULT 'หนังสือภายนอก',
  urgency urgency_level NOT NULL DEFAULT 'ปกติ',
  document_date DATE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ตารางหนังสือคำสั่ง
CREATE TABLE public.order_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_number SERIAL,
  subject TEXT NOT NULL,
  urgency urgency_level NOT NULL DEFAULT 'ปกติ',
  document_date DATE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- เปิดใช้ RLS
ALTER TABLE public.incoming_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outgoing_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_documents ENABLE ROW LEVEL SECURITY;

-- สร้าง Policy สำหรับเข้าถึงข้อมูล (เปิดให้ทุกคนเข้าถึงได้สำหรับระบบภายใน)
CREATE POLICY "Allow all access to incoming documents" ON public.incoming_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to outgoing documents" ON public.outgoing_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to order documents" ON public.order_documents FOR ALL USING (true) WITH CHECK (true);