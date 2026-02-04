import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { formatDocumentNumber } from "@/lib/utils";

interface DocumentNumberPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentNumber: string | number;
  receivingNumber?: number;
  documentDate: string;
  timestamp: string;
  type: 'incoming' | 'outgoing' | 'order' | 'memo' | 'announcement';
}

const typeLabels = {
  incoming: 'หนังสือรับ',
  outgoing: 'หนังสือส่ง',
  order: 'หนังสือคำสั่ง',
  memo: 'หนังสือบันทึกข้อความ',
  announcement: 'หนังสือประกาศ',
};

export function DocumentNumberPopup({
  open,
  onOpenChange,
  documentNumber,
  receivingNumber,
  documentDate,
  timestamp,
  type,
}: DocumentNumberPopupProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimestamp = (timestampStr: string) => {
    const date = new Date(timestampStr);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const displayNumber = typeof documentNumber === 'number' 
    ? formatDocumentNumber(documentNumber) 
    : documentNumber;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            บันทึก{typeLabels[type]}สำเร็จ
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-urgent-normal/10">
            <CheckCircle2 className="h-10 w-10 text-urgent-normal" />
          </div>
          <div className="space-y-3 text-center">
            {type === 'incoming' && receivingNumber && (
              <div>
                <p className="text-sm text-muted-foreground">เลขรับ</p>
                <p className="text-3xl font-bold text-primary">{formatDocumentNumber(receivingNumber)}</p>
              </div>
            )}
            {type !== 'incoming' && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {type === 'order' ? 'เลขที่คำสั่ง' : type === 'memo' ? 'เลขที่บันทึกข้อความ' : type === 'announcement' ? 'เลขที่ประกาศ' : 'เลขที่'}
                </p>
                <p className="text-3xl font-bold text-primary">{displayNumber}</p>
              </div>
            )}
            {type === 'incoming' && (
              <div>
                <p className="text-sm text-muted-foreground">เลขที่หนังสือ</p>
                <p className="text-xl font-bold text-foreground">{documentNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">วันที่ออกหนังสือ</p>
              <p className="font-medium">{formatDate(documentDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {type === 'incoming' ? 'ประทับเวลาลงรับ' : 'ประทับเวลาออกเลข'}
              </p>
              <p className="text-sm font-medium text-muted-foreground">{formatTimestamp(timestamp)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
