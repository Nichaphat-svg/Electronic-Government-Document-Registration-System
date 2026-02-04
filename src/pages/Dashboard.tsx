import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Inbox, Send, FileText, Clock, CheckCircle, ArrowRight, FileEdit, Megaphone } from "lucide-react";
import { UrgencyBadge } from "@/components/ui/UrgencyBadge";
import type { UrgencyLevel } from "@/types/documents";
import { useDocumentStats } from "@/hooks/useDocumentStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { UrgencyPieChart } from "@/components/dashboard/UrgencyPieChart";
import { DistributionChart } from "@/components/dashboard/DistributionChart";
import { PendingDocumentsList } from "@/components/dashboard/PendingDocumentsList";
import { useIncomingDocuments } from "@/hooks/useIncomingDocuments";
import { useOutgoingDocuments } from "@/hooks/useOutgoingDocuments";
import { useOrderDocuments } from "@/hooks/useOrderDocuments";
import { useMemoDocuments } from "@/hooks/useMemoDocuments";
import { useAnnouncementDocuments } from "@/hooks/useAnnouncementDocuments";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { documents: incomingDocs } = useIncomingDocuments();
  const { documents: outgoingDocs } = useOutgoingDocuments();
  const { documents: orderDocs } = useOrderDocuments();
  const { documents: memoDocs } = useMemoDocuments();
  const { documents: announcementDocs } = useAnnouncementDocuments();
  const { 
    monthlyStats, 
    urgencyStats, 
    distributionStats, 
    pendingDocuments,
    totalDistributions 
  } = useDocumentStats();
  const { role, getRoleLabel } = useUserProfile();

  const recentDocuments = [
    ...incomingDocs.map(d => ({ ...d, type: 'incoming' as const })),
    ...outgoingDocs.map(d => ({ ...d, type: 'outgoing' as const })),
    ...orderDocs.map(d => ({ ...d, type: 'order' as const })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const typeLabels = {
    incoming: 'หนังสือรับ',
    outgoing: 'หนังสือส่ง',
    order: 'หนังสือคำสั่ง',
  };

  const typeRoutes = {
    incoming: '/incoming',
    outgoing: '/outgoing',
    order: '/orders',
  };

  // Role-based dashboard content
  const isAdmin = role === 'admin';
  const isManager = role === 'moderator';

  const handleDocumentClick = (type: 'incoming' | 'outgoing' | 'order') => {
    navigate(typeRoutes[type]);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">แดชบอร์ด</h1>
          <p className="mt-1 text-muted-foreground">
            ภาพรวมระบบทะเบียนหนังสือราชการ • {getRoleLabel(role)}
          </p>
        </div>

        {/* User Info & Stats Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <UserInfoCard />
          
          <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="หนังสือรับ"
              value={incomingDocs.length}
              icon={Inbox}
              trend="รับทั้งหมด"
              iconClassName="bg-primary/10 text-primary"
              href="/incoming"
            />
            <StatCard
              title="หนังสือส่ง"
              value={outgoingDocs.length}
              icon={Send}
              trend="ส่งออกทั้งหมด"
              iconClassName="bg-accent/10 text-accent"
              href="/outgoing"
            />
            <StatCard
              title="หนังสือคำสั่ง"
              value={orderDocs.length}
              icon={FileText}
              trend="คำสั่งทั้งหมด"
              iconClassName="bg-[hsl(var(--urgent-normal))]/10 text-[hsl(var(--urgent-normal))]"
              href="/orders"
            />
          </div>
        </div>

        {/* Additional Document Types Row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="บันทึกข้อความ"
            value={memoDocs.length}
            icon={FileEdit}
            trend="บันทึกข้อความทั้งหมด"
            iconClassName="bg-purple-500/10 text-purple-500"
            href="/memos"
          />
          <StatCard
            title="หนังสือประกาศ"
            value={announcementDocs.length}
            icon={Megaphone}
            trend="ประกาศทั้งหมด"
            iconClassName="bg-orange-500/10 text-orange-500"
            href="/announcements"
          />
          <StatCard
            title="ส่งแล้ว"
            value={totalDistributions}
            icon={CheckCircle}
            trend="การกระจายเอกสาร"
            iconClassName="bg-[hsl(var(--urgent-medium))]/10 text-[hsl(var(--urgent-medium))]"
            href="/distributions"
          />
        </div>

        {/* Charts Row - Shown for Admin & Manager */}
        {(isAdmin || isManager) && (
          <div className="grid gap-6 lg:grid-cols-2">
            <MonthlyChart data={monthlyStats} />
            <UrgencyPieChart data={urgencyStats} />
          </div>
        )}

        {/* Distribution & Pending Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {(isAdmin || isManager) && (
            <DistributionChart data={distributionStats} />
          )}
          
          {/* Staff sees pending documents, Admin/Manager see it alongside charts */}
          <PendingDocumentsList documents={pendingDocuments} />
        </div>

        {/* Recent Documents - Shown for all */}
        <div className="animate-fade-in rounded-xl border border-border bg-card p-6 shadow-sm" style={{ animationDelay: '300ms' }}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">เอกสารล่าสุด</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
              ค้นหาทั้งหมด
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          {recentDocuments.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">ยังไม่มีเอกสารในระบบ</p>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/30 animate-slide-in cursor-pointer"
                  style={{ animationDelay: `${idx * 50}ms` }}
                  onClick={() => handleDocumentClick(doc.type)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleDocumentClick(doc.type);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {typeLabels[doc.type]}
                      </span>
                      <UrgencyBadge urgency={doc.urgency as UrgencyLevel} />
                    </div>
                    <p className="mt-1 truncate font-medium text-foreground">{doc.subject}</p>
                  </div>
                  <div className="ml-4 text-right text-sm text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
