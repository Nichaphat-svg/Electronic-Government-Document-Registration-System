import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Send, Printer, CheckSquare, Square } from "lucide-react";
import { useRooms } from "@/hooks/useRooms";
import { useDocumentDistributions } from "@/hooks/useDocumentDistributions";
import { formatDocumentNumber } from "@/lib/utils";
import type { IncomingDocument, Room } from "@/types/documents";
import { toast } from "@/hooks/use-toast";

interface SendDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: IncomingDocument[];
}

type Step = "select-documents" | "select-rooms" | "confirm" | "print-report";

export function SendDocumentDialog({
  open,
  onOpenChange,
  documents,
}: SendDocumentDialogProps) {
  const { rooms, create: createRoom, delete: deleteRoom, isCreating, isLoading: isLoadingRooms } = useRooms();
  const { createMany: distributeDocuments, isCreating: isSending } = useDocumentDistributions();
  
  const [step, setStep] = useState<Step>("select-documents");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [sentData, setSentData] = useState<{ documents: IncomingDocument[]; rooms: Room[] }>({ documents: [], rooms: [] });
  const [selectedPrintDocs, setSelectedPrintDocs] = useState<string[]>([]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open]);

  const handleReset = () => {
    setStep("select-documents");
    setSelectedDocIds([]);
    setSelectedRoomIds([]);
    setNewRoomName("");
    setSentData({ documents: [], rooms: [] });
    setSelectedPrintDocs([]);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const toggleDocument = (docId: string) => {
    setSelectedDocIds(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const toggleAllDocuments = () => {
    if (selectedDocIds.length === documents.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(documents.map(d => d.id));
    }
  };

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds(prev =>
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const toggleAllRooms = () => {
    if (selectedRoomIds.length === rooms.length) {
      setSelectedRoomIds([]);
    } else {
      setSelectedRoomIds(rooms.map(r => r.id));
    }
  };

  const togglePrintDoc = (docId: string) => {
    setSelectedPrintDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      await createRoom(newRoomName.trim());
      setNewRoomName("");
    } catch (error) {
      console.error("Failed to add room:", error);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
      setSelectedRoomIds(prev => prev.filter(id => id !== roomId));
    } catch (error) {
      console.error("Failed to delete room:", error);
    }
  };

  const handleSendDocuments = async () => {
    if (selectedDocIds.length === 0 || selectedRoomIds.length === 0) {
      toast({ 
        title: "กรุณาเลือกข้อมูล", 
        description: "กรุณาเลือกหนังสือและห้องที่จะส่ง", 
        variant: "destructive" 
      });
      return;
    }

    const distributions = selectedDocIds.flatMap(docId =>
      selectedRoomIds.map(roomId => ({
        incoming_document_id: docId,
        room_id: roomId,
      }))
    );

    try {
      await distributeDocuments(distributions);
      const sentDocs = documents.filter(d => selectedDocIds.includes(d.id));
      const sentRooms = rooms.filter(r => selectedRoomIds.includes(r.id));
      setSentData({ documents: sentDocs, rooms: sentRooms });
      setSelectedPrintDocs(sentDocs.map(d => d.id));
      toast({ 
        title: "สำเร็จ", 
        description: `ส่งหนังสือ ${sentDocs.length} ฉบับ ไปยัง ${sentRooms.length} ห้อง เรียบร้อยแล้ว` 
      });
      setStep("print-report");
    } catch (error) {
      console.error("Failed to send documents:", error);
      toast({ 
        title: "ผิดพลาด", 
        description: "ไม่สามารถส่งหนังสือได้ กรุณาลองใหม่อีกครั้ง", 
        variant: "destructive" 
      });
    }
  };

  const handlePrint = () => {
    const selectedDocs = sentData.documents.filter(d => selectedPrintDocs.includes(d.id));
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>รายงานการส่งหนังสือ</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Sarabun', 'TH SarabunPSK', sans-serif; 
            padding: 20px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          h1 { text-align: center; margin-bottom: 15px; font-size: 22px; color: #1e40af; }
          .print-date { text-align: center; margin-bottom: 20px; font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-size: 14px; }
          th { background-color: #2563eb !important; color: white !important; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .room-section { margin-bottom: 25px; page-break-inside: avoid; }
          .room-title { 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 10px; 
            padding: 8px 12px;
            background: #dbeafe;
            border-radius: 6px;
            color: #1e40af;
          }
          @media print {
            body { padding: 10px; }
            table { font-size: 12px; }
            th, td { padding: 6px 4px; }
          }
          @page { margin: 15mm; size: A4; }
        </style>
      </head>
      <body>
        <h1>รายงานการส่งหนังสือ</h1>
        <p class="print-date">วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        ${sentData.rooms.map(room => `
          <div class="room-section">
            <div class="room-title">ส่งไปยัง: ${room.name}</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 70px;">เลขรับ</th>
                  <th style="width: 110px;">เลขหนังสือ</th>
                  <th>เรื่อง</th>
                  <th style="width: 130px;">จาก</th>
                  <th style="width: 90px;">วันที่</th>
                </tr>
              </thead>
              <tbody>
                ${selectedDocs.map(doc => `
                  <tr>
                    <td style="text-align: center;">${formatDocumentNumber(doc.receiving_number)}</td>
                    <td>${doc.document_number}</td>
                    <td>${doc.subject}</td>
                    <td>${doc.from_office}</td>
                    <td style="text-align: center;">${new Date(doc.document_date).toLocaleDateString('th-TH')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    // Mobile-friendly print using iframe
    const printFrame = document.createElement('iframe');
    printFrame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;';
    document.body.appendChild(printFrame);
    
    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(printContent);
      frameDoc.close();
      
      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (e) {
          console.error('Print error:', e);
          toast({ title: "ไม่สามารถพิมพ์ได้", variant: "destructive" });
        }
        setTimeout(() => document.body.removeChild(printFrame), 1000);
      }, 300);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "select-documents":
        return (
          <>
            <DialogHeader>
              <DialogTitle>เลือกหนังสือที่จะส่ง</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                เลือกแล้ว {selectedDocIds.length} จาก {documents.length} รายการ
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllDocuments}
                className="gap-2"
              >
                {selectedDocIds.length === documents.length ? (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    ยกเลิกทั้งหมด
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4" />
                    เลือกทั้งหมด
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedDocIds.includes(doc.id) ? 'bg-primary/5 border-primary/30' : ''
                    }`}
                    onClick={() => toggleDocument(doc.id)}
                  >
                    <Checkbox
                      checked={selectedDocIds.includes(doc.id)}
                      onCheckedChange={() => toggleDocument(doc.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">เลขรับ: {formatDocumentNumber(doc.receiving_number)}</span>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-sm">{doc.document_number}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{doc.subject}</p>
                      <p className="text-xs text-muted-foreground">จาก: {doc.from_office}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>ยกเลิก</Button>
              <Button
                onClick={() => setStep("select-rooms")}
                disabled={selectedDocIds.length === 0}
              >
                ถัดไป ({selectedDocIds.length} รายการ)
              </Button>
            </DialogFooter>
          </>
        );

      case "select-rooms":
        return (
          <>
            <DialogHeader>
              <DialogTitle>เลือกห้องที่จะส่ง</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="ชื่อห้องใหม่"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRoom()}
                />
                <Button onClick={handleAddRoom} disabled={isCreating || !newRoomName.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  เลือกแล้ว {selectedRoomIds.length} จาก {rooms.length} ห้อง
                </span>
                {rooms.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAllRooms}
                    className="gap-2"
                  >
                    {selectedRoomIds.length === rooms.length ? (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        ยกเลิกทั้งหมด
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4" />
                        เลือกทั้งหมด
                      </>
                    )}
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[250px] pr-4">
                {isLoadingRooms ? (
                  <div className="flex items-center justify-center h-20">
                    <span className="text-muted-foreground">กำลังโหลด...</span>
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="flex items-center justify-center h-20">
                    <span className="text-muted-foreground">ไม่มีห้อง กรุณาเพิ่มห้องใหม่</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedRoomIds.includes(room.id) ? 'bg-primary/5 border-primary/30' : ''
                        }`}
                        onClick={() => toggleRoom(room.id)}
                      >
                        <Checkbox
                          checked={selectedRoomIds.includes(room.id)}
                          onCheckedChange={() => toggleRoom(room.id)}
                        />
                        <span className="flex-1">{room.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("select-documents")}>ย้อนกลับ</Button>
              <Button
                onClick={handleSendDocuments}
                disabled={selectedRoomIds.length === 0 || isSending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSending ? "กำลังส่ง..." : `ส่งหนังสือ ${selectedDocIds.length} ฉบับ → ${selectedRoomIds.length} ห้อง`}
              </Button>
            </DialogFooter>
          </>
        );

      case "print-report":
        return (
          <>
            <DialogHeader>
              <DialogTitle>พิมพ์รายงานการส่งหนังสือ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ส่งหนังสือไปยัง {sentData.rooms.length} ห้อง สำเร็จแล้ว
              </p>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium mb-2">ห้องที่ส่ง:</p>
                <div className="flex flex-wrap gap-2">
                  {sentData.rooms.map(room => (
                    <span key={room.id} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                      {room.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">เลือกหนังสือที่จะพิมพ์:</p>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {sentData.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer"
                        onClick={() => togglePrintDoc(doc.id)}
                      >
                        <Checkbox
                          checked={selectedPrintDocs.includes(doc.id)}
                          onCheckedChange={() => togglePrintDoc(doc.id)}
                        />
                        <span className="text-sm">เลขรับ {formatDocumentNumber(doc.receiving_number)}: {doc.subject}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>ปิด</Button>
              <Button
                onClick={handlePrint}
                disabled={selectedPrintDocs.length === 0}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                พิมพ์รายงาน ({selectedPrintDocs.length} รายการ)
              </Button>
            </DialogFooter>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
