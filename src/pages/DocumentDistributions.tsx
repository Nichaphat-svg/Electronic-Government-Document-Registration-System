import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useDocumentDistributions } from "@/hooks/useDocumentDistributions";
import { useRooms } from "@/hooks/useRooms";
import { formatDocumentNumber } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Pencil, Check, X, Filter, FileBarChart, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import type { DocumentDistribution } from "@/types/documents";
import { DistributionReportDialog } from "@/components/distributions/DistributionReportDialog";

export default function DocumentDistributions() {
  const { distributions, isLoading, delete: deleteDistribution, update: updateDistribution, isDeleting, isUpdating } = useDocumentDistributions();
  const { rooms } = useRooms();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRoomId, setEditRoomId] = useState<string>("");
  const [filterRoomId, setFilterRoomId] = useState<string>("all");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDistribution(deleteId);
      setDeleteId(null);
    }
  };

  const handleEdit = (distribution: DocumentDistribution) => {
    setEditingId(distribution.id);
    setEditRoomId(distribution.room_id);
  };

  const handleSaveEdit = async () => {
    if (editingId && editRoomId) {
      await updateDistribution({ id: editingId, room_id: editRoomId });
      setEditingId(null);
      setEditRoomId("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRoomId("");
  };

  const filteredDistributions = useMemo(() => {
    let result = distributions;
    
    // Filter by room
    if (filterRoomId !== "all") {
      result = result.filter(d => d.room_id === filterRoomId);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => {
        const doc = d.incoming_document;
        if (!doc) return false;
        return (
          doc.subject?.toLowerCase().includes(query) ||
          doc.document_number?.toLowerCase().includes(query) ||
          doc.from_office?.toLowerCase().includes(query) ||
          String(doc.receiving_number).includes(query) ||
          d.room?.name?.toLowerCase().includes(query)
        );
      });
    }
    
    return result;
  }, [distributions, filterRoomId, searchQuery]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">การกระจายเอกสาร</h1>
            <p className="text-muted-foreground">จัดการหนังสือที่ส่งไปแต่ละห้อง</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(true)}
              className="gap-2"
            >
              <FileBarChart className="h-4 w-4" />
              สรุปรายงาน
            </Button>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาเรื่อง, เลขหนังสือ, ห้อง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterRoomId} onValueChange={setFilterRoomId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="กรองตามห้อง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">เลขรับ</TableHead>
                <TableHead className="w-[150px]">เลขหนังสือ</TableHead>
                <TableHead>เรื่อง</TableHead>
                <TableHead className="w-[150px]">จาก</TableHead>
                <TableHead className="w-[150px]">ห้องที่ส่ง</TableHead>
                <TableHead className="w-[180px]">วันที่ส่ง</TableHead>
                <TableHead className="w-[120px] text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDistributions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    ไม่มีข้อมูลการกระจายเอกสาร
                  </TableCell>
                </TableRow>
              ) : (
                filteredDistributions.map((dist) => (
                  <TableRow key={dist.id}>
                    <TableCell className="font-medium">
                      {dist.incoming_document?.receiving_number 
                        ? formatDocumentNumber(dist.incoming_document.receiving_number) 
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {dist.incoming_document?.document_number || "-"}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {dist.incoming_document?.subject || "-"}
                    </TableCell>
                    <TableCell>
                      {dist.incoming_document?.from_office || "-"}
                    </TableCell>
                    <TableCell>
                      {editingId === dist.id ? (
                        <Select value={editRoomId} onValueChange={setEditRoomId}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms.map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                          {dist.room?.name || "-"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(dist.sent_at).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === dist.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={isUpdating}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(dist)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(dist.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
              <AlertDialogDescription>
                คุณต้องการลบการกระจายเอกสารนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "กำลังลบ..." : "ลบ"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <DistributionReportDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          distributions={distributions}
          rooms={rooms}
        />
      </div>
    </MainLayout>
  );
}