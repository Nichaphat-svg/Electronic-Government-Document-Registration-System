export type UrgencyLevel = 'ด่วนที่สุด' | 'ด่วนมาก' | 'ด่วน' | 'ปกติ';
export type DocumentType = 'หนังสือภายนอก' | 'หนังสือภายใน';

export interface IncomingDocument {
  id: string;
  receiving_number: number;
  document_number: string;
  from_office: string;
  subject: string;
  to_person: string;
  document_date: string;
  urgency: UrgencyLevel;
  notes: string | null;
  file_url: string | null;
  received_at: string;
  created_at: string;
}

export interface OutgoingDocument {
  id: string;
  document_number: number;
  subject: string;
  to_person: string;
  document_type: DocumentType;
  urgency: UrgencyLevel;
  document_date: string;
  issued_at: string;
  notes: string | null;
  file_url: string | null;
  created_at: string;
}

export interface OrderDocument {
  id: string;
  document_number: number;
  subject: string;
  urgency: UrgencyLevel;
  document_date: string;
  issued_at: string;
  notes: string | null;
  file_url: string | null;
  created_at: string;
}

export interface MemoDocument {
  id: string;
  document_number: number;
  subject: string;
  to_person: string;
  urgency: UrgencyLevel;
  document_date: string;
  issued_at: string;
  notes: string | null;
  file_url: string | null;
  created_at: string;
}

export interface AnnouncementDocument {
  id: string;
  document_number: number;
  subject: string;
  urgency: UrgencyLevel;
  document_date: string;
  issued_at: string;
  notes: string | null;
  file_url: string | null;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  created_at: string;
}

export interface DocumentDistribution {
  id: string;
  incoming_document_id: string;
  room_id: string;
  sent_at: string;
  sent_by: string | null;
  created_at: string;
  incoming_document?: IncomingDocument;
  room?: Room;
}
