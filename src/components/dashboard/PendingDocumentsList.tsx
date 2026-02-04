import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { UrgencyBadge } from "@/components/ui/UrgencyBadge";
import type { UrgencyLevel } from "@/types/documents";
import { useNavigate } from "react-router-dom";

interface PendingDocument {
  id: string;
  subject: string;
  from_office: string;
  urgency: string;
  created_at: string;
}

interface PendingDocumentsListProps {
  documents: PendingDocument[];
}

export function PendingDocumentsList({ documents }: PendingDocumentsListProps) {
  const navigate = useNavigate();
  const pendingDocs = documents.slice(0, 5);

  const handleDocumentClick = (docId: string) => {
    navigate('/incoming');
  };

  const handleViewAll = () => {
    navigate('/incoming');
  };

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '250ms' }}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--urgent-medium))]" />
          หนังสือรอดำเนินการ
          {documents.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {documents.length}
            </Badge>
          )}
        </CardTitle>
        {documents.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleViewAll}>
            ดูทั้งหมด
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {pendingDocs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            ไม่มีหนังสือรอดำเนินการ
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDocs.map((doc, idx) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/30 animate-slide-in cursor-pointer"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => handleDocumentClick(doc.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleDocumentClick(doc.id);
                  }
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <UrgencyBadge urgency={doc.urgency as UrgencyLevel} />
                    <span className="text-xs text-muted-foreground truncate">
                      {doc.from_office}
                    </span>
                  </div>
                  <p className="truncate text-sm font-medium text-foreground">
                    {doc.subject}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(doc.created_at).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
