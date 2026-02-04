import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { AnnouncementDocumentForm } from "@/components/documents/AnnouncementDocumentForm";
import { DocumentNumberPopup } from "@/components/documents/DocumentNumberPopup";
import { useAnnouncementDocuments } from "@/hooks/useAnnouncementDocuments";
import { UrgencyBadge } from "@/components/ui/UrgencyBadge";
import type { AnnouncementDocument, UrgencyLevel } from "@/types/documents";

export default function AnnouncementDocuments() {
  const { documents, isLoading, create, update, delete: deleteDoc, isCreating, isUpdating } = useAnnouncementDocuments();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<AnnouncementDocument | null>(null);
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
      render: (value: string) => <span className="max-w-md truncate block">{value}</span>
    },
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

  const handleEdit = (doc: AnnouncementDocument) => {
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
              <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">หนังสือประกาศ</h1>
              <p className="text-sm text-muted-foreground">จัดการหนังสือประกาศ</p>
            </div>
          </div>
          <Button onClick={() => { setEditingDoc(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มหนังสือประกาศ
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

      <AnnouncementDocumentForm
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
        type="announcement"
      />
    </MainLayout>
  );
}
