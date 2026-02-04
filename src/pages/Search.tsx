import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Inbox, Send, FileText, FileEdit, Megaphone } from "lucide-react";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { useIncomingDocuments } from "@/hooks/useIncomingDocuments";
import { useOutgoingDocuments } from "@/hooks/useOutgoingDocuments";
import { useOrderDocuments } from "@/hooks/useOrderDocuments";
import { useMemoDocuments } from "@/hooks/useMemoDocuments";
import { useAnnouncementDocuments } from "@/hooks/useAnnouncementDocuments";
import { UrgencyBadge } from "@/components/ui/UrgencyBadge";
import { Badge } from "@/components/ui/badge";
import type { UrgencyLevel, DocumentType } from "@/types/documents";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const { documents: incomingDocs, isLoading: incomingLoading } = useIncomingDocuments();
  const { documents: outgoingDocs, isLoading: outgoingLoading } = useOutgoingDocuments();
  const { documents: orderDocs, isLoading: orderLoading } = useOrderDocuments();
  const { documents: memoDocs, isLoading: memoLoading } = useMemoDocuments();
  const { documents: announcementDocs, isLoading: announcementLoading } = useAnnouncementDocuments();

  const filterDocuments = <T extends { subject: string }>(docs: T[]) => {
    if (!searchQuery.trim()) return docs;
    const query = searchQuery.toLowerCase();
    return docs.filter((doc) => {
      const searchableFields = Object.values(doc).filter(v => typeof v === 'string');
      return searchableFields.some(field => field.toLowerCase().includes(query));
    });
  };

  const incomingColumns = [
    { key: "document_number", label: "เลขหนังสือ" },
    { key: "from_office", label: "จากสำนักงาน" },
    { 
      key: "subject", 
      label: "เรื่อง",
      render: (value: string) => <span className="max-w-xs truncate block">{value}</span>
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

  const outgoingColumns = [
    { key: "document_number", label: "เลขที่" },
    { 
      key: "subject", 
      label: "เรื่อง",
      render: (value: string) => <span className="max-w-xs truncate block">{value}</span>
    },
    { key: "to_person", label: "เรียน" },
    { 
      key: "document_type", 
      label: "ประเภท",
      render: (value: DocumentType) => <Badge variant="secondary">{value}</Badge>
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
  ];

  const orderColumns = [
    { key: "document_number", label: "เลขที่คำสั่ง" },
    { 
      key: "subject", 
      label: "เรื่อง",
      render: (value: string) => <span className="max-w-md truncate block">{value}</span>
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
  ];

  const memoColumns = [
    { key: "document_number", label: "เลขที่", render: (value: number) => String(value).padStart(3, '0') },
    { key: "subject", label: "เรื่อง", render: (value: string) => <span className="max-w-md truncate block">{value}</span> },
    { key: "to_person", label: "เรียน" },
    { key: "document_date", label: "วันที่", render: (value: string) => new Date(value).toLocaleDateString('th-TH') },
    { key: "urgency", label: "ชั้นความเร็ว", render: (value: UrgencyLevel) => <UrgencyBadge urgency={value} /> },
  ];

  const announcementColumns = [
    { key: "document_number", label: "เลขที่", render: (value: number) => String(value).padStart(3, '0') },
    { key: "subject", label: "เรื่อง", render: (value: string) => <span className="max-w-md truncate block">{value}</span> },
    { key: "document_date", label: "วันที่", render: (value: string) => new Date(value).toLocaleDateString('th-TH') },
    { key: "urgency", label: "ชั้นความเร็ว", render: (value: UrgencyLevel) => <UrgencyBadge urgency={value} /> },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <SearchIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ค้นหาหนังสือ</h1>
              <p className="text-sm text-muted-foreground">ค้นหาเอกสารจากทุกประเภท</p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาเลขหนังสือ, เรื่อง, สำนักงาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Tabs defaultValue="incoming" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
              <TabsTrigger value="incoming" className="gap-1 text-xs">
                <Inbox className="h-4 w-4" />
                <span className="hidden sm:inline">หนังสือรับ</span>
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="gap-1 text-xs">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">หนังสือส่ง</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-1 text-xs">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">คำสั่ง</span>
              </TabsTrigger>
              <TabsTrigger value="memos" className="gap-1 text-xs">
                <FileEdit className="h-4 w-4" />
                <span className="hidden sm:inline">บันทึก</span>
              </TabsTrigger>
              <TabsTrigger value="announcements" className="gap-1 text-xs">
                <Megaphone className="h-4 w-4" />
                <span className="hidden sm:inline">ประกาศ</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incoming" className="mt-6">
              <DocumentTable
                columns={incomingColumns}
                data={filterDocuments(incomingDocs)}
                isLoading={incomingLoading}
              />
            </TabsContent>

            <TabsContent value="outgoing" className="mt-6">
              <DocumentTable
                columns={outgoingColumns}
                data={filterDocuments(outgoingDocs)}
                isLoading={outgoingLoading}
              />
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <DocumentTable
                columns={orderColumns}
                data={filterDocuments(orderDocs)}
                isLoading={orderLoading}
              />
            </TabsContent>

            <TabsContent value="memos" className="mt-6">
              <DocumentTable
                columns={memoColumns}
                data={filterDocuments(memoDocs)}
                isLoading={memoLoading}
              />
            </TabsContent>

            <TabsContent value="announcements" className="mt-6">
              <DocumentTable
                columns={announcementColumns}
                data={filterDocuments(announcementDocs)}
                isLoading={announcementLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
