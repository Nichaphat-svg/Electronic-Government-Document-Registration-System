import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, FileEdit } from "lucide-react";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { MemoDocumentForm } from "@/components/documents/MemoDocumentForm";
import { DocumentNumberPopup } from "@/components/documents/DocumentNumberPopup";
import { useMemoDocuments } from "@/hooks/useMemoDocuments";
import { UrgencyBadge } from "@/components/ui/UrgencyBadge";
import type { MemoDocument, UrgencyLevel } from "@/types/documents";

export default function MemoDocuments() {
  const { documents, isLoading, create, update, delete: deleteDoc, isCreating, isUpdating } = useMemoDocuments();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<MemoDocument | null>(null);
  const [popupData, setPopupData] = useState<{
    open: boolean;
    documentNumber: number;
    documentDate: string;
    timestamp: string;
  }>({ open: false, documentNumber: 0, documentDate: "", timestamp: "" });

  const columns = [
    { 
      key: "document_number", 
      label: "เลขที่",
      render: (value: number) => String(value).padStart(3, '0')
    },
    { 
      key: "subject", 
      label: "เรื่อง",
      render: (value: string) => <span className="max-w-xs truncate block">{value}</span>
    },
    { key: "to_person", label: "เรียน" },
    { 
      key: "document_date", 
      label: "วันที่ออกหนังสือ",
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
        documentDate: result.document_date,
        timestamp: result.issued_at,
      });
    }
    setFormOpen(false);
  };

  const handleEdit = (doc: MemoDocument) => {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
              <FileEdit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">หนังสือบันทึกข้อความ</h1>
              <p className="text-sm text-muted-foreground">จัดการหนังสือบันทึกข้อความ</p>
            </div>
          </div>
          <Button onClick={() => { setEditingDoc(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มหนังสือบันทึกข้อความ
          </Button>
        </div>

        {/* Table */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <DocumentTable
            columns={columns}
            data={documents}
            isLoading={isLoading}
            onView={(doc) => doc.file_url && window.open(doc.file_url, '_blank')}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <MemoDocumentForm
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
        type="memo"
      />
    </MainLayout>
  );
}
