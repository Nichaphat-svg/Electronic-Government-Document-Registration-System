import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { OrderDocumentForm } from "@/components/documents/OrderDocumentForm";
import { DocumentNumberPopup } from "@/components/documents/DocumentNumberPopup";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useOrderDocuments } from "@/hooks/useOrderDocuments";
import { UrgencyBadge } from "@/components/ui/UrgencyBadge";
import { formatDocumentNumber } from "@/lib/utils";
import type { OrderDocument, UrgencyLevel } from "@/types/documents";

export default function OrderDocuments() {
  const { documents, isLoading, create, update, delete: deleteDoc, isCreating, isUpdating } = useOrderDocuments();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<OrderDocument | null>(null);
  const [popupData, setPopupData] = useState<{
    open: boolean;
    documentNumber: number;
    documentDate: string;
    timestamp: string;
  }>({ open: false, documentNumber: 0, documentDate: "", timestamp: "" });

  const columns = [
    { 
      key: "document_number", 
      label: "เลขที่คำสั่ง",
      render: (value: number) => (
        <span className="font-bold text-primary">{formatDocumentNumber(value)}</span>
      )
    },
    { 
      key: "subject", 
      label: "เรื่อง",
      render: (value: string) => (
        <span className="max-w-md truncate block">{value}</span>
      )
    },
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
    { 
      key: "notes", 
      label: "หมายเหตุ",
      render: (value: string | null) => (
        <span className="text-muted-foreground">{value || '-'}</span>
      )
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
        documentDate: result.document_date,
        timestamp: result.issued_at,
      });
    }
    setFormOpen(false);
  };

  const handleEdit = (doc: OrderDocument) => {
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-urgent-normal/10">
              <FileText className="h-5 w-5 text-urgent-normal" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">หนังสือคำสั่ง</h1>
              <p className="text-sm text-muted-foreground">จัดการหนังสือคำสั่งทั้งหมด</p>
            </div>
          </div>
          <Button onClick={() => { setEditingDoc(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มหนังสือคำสั่ง
          </Button>
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

      <OrderDocumentForm
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
        documentDate={popupData.documentDate}
        timestamp={popupData.timestamp}
        type="order"
      />
    </MainLayout>
  );
}
