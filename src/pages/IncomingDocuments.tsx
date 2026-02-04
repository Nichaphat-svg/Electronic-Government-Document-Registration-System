import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { IncomingDocumentForm } from "@/components/documents/IncomingDocumentForm";
import { DocumentNumberPopup } from "@/components/documents/DocumentNumberPopup";
import { SendDocumentDialog } from "@/components/documents/SendDocumentDialog";
import { Button } from "@/components/ui/button";
import { Plus, Inbox, Send } from "lucide-react";
import { useIncomingDocuments } from "@/hooks/useIncomingDocuments";
import { UrgencyBadge } from "@/components/ui/UrgencyBadge";
import { formatDocumentNumber } from "@/lib/utils";
import type { IncomingDocument, UrgencyLevel } from "@/types/documents";

export default function IncomingDocuments() {
  const { documents, isLoading, create, update, delete: deleteDoc, isCreating, isUpdating } = useIncomingDocuments();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<IncomingDocument | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [popupData, setPopupData] = useState<{
    open: boolean;
    documentNumber: string;
    receivingNumber: number;
    documentDate: string;
    timestamp: string;
  }>({ open: false, documentNumber: "", receivingNumber: 0, documentDate: "", timestamp: "" });

  const columns = [
    { 
      key: "receiving_number", 
      label: "เลขรับ",
      render: (value: number) => (
        <span className="font-bold text-primary">{formatDocumentNumber(value)}</span>
      )
    },
    { key: "document_number", label: "เลขหนังสือ" },
    { key: "from_office", label: "จากสำนักงาน" },
    { 
      key: "subject", 
      label: "เรื่อง",
      render: (value: string) => (
        <span className="max-w-xs truncate block">{value}</span>
      )
    },
    { key: "to_person", label: "เรียน" },
    { 
      key: "document_date", 
      label: "วันที่",
      render: (value: string) => new Date(value).toLocaleDateString('th-TH')
    },
    { 
      key: "urgency", 
      label: "ชั้นความเร็ว",
      render: (value: UrgencyLevel) => <UrgencyBadge urgency={value} />
    },
  ];

  const handleSubmit = async (data: any) => {
    if (editingDoc) {
      await update({ id: editingDoc.id, ...data });
      setEditingDoc(null);
    } else {
      const result = await create(data);
      setPopupData({
        open: true,
        documentNumber: result.document_number,
        receivingNumber: result.receiving_number,
        documentDate: result.document_date,
        timestamp: result.received_at,
      });
    }
    setFormOpen(false);
  };

  const handleEdit = (doc: IncomingDocument) => {
    setEditingDoc(doc);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(id);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Inbox className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">หนังสือรับ</h1>
              <p className="text-sm text-muted-foreground">จัดการหนังสือรับเข้าทั้งหมด</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSendDialogOpen(true)} 
              className="gap-2"
              disabled={documents.length === 0}
            >
              <Send className="h-4 w-4" />
              ส่งหนังสือ
            </Button>
            <Button onClick={() => { setEditingDoc(null); setFormOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มหนังสือรับ
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <DocumentTable
            columns={columns}
            data={documents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      </div>

      <IncomingDocumentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={editingDoc}
        isLoading={isCreating || isUpdating}
      />

      <DocumentNumberPopup
        open={popupData.open}
        onOpenChange={(open) => setPopupData(prev => ({ ...prev, open }))}
        documentNumber={popupData.documentNumber}
        receivingNumber={popupData.receivingNumber}
        documentDate={popupData.documentDate}
        timestamp={popupData.timestamp}
        type="incoming"
      />

      <SendDocumentDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        documents={documents}
      />
    </MainLayout>
  );
}
