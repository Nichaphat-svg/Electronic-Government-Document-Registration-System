import { useMemo } from "react";
import { useIncomingDocuments } from "./useIncomingDocuments";
import { useOutgoingDocuments } from "./useOutgoingDocuments";
import { useOrderDocuments } from "./useOrderDocuments";
import { useMemoDocuments } from "./useMemoDocuments";
import { useAnnouncementDocuments } from "./useAnnouncementDocuments";
import { useDocumentDistributions } from "./useDocumentDistributions";

export function useDocumentStats() {
  const { documents: incomingDocs } = useIncomingDocuments();
  const { documents: outgoingDocs } = useOutgoingDocuments();
  const { documents: orderDocs } = useOrderDocuments();
  const { documents: memoDocs } = useMemoDocuments();
  const { documents: announcementDocs } = useAnnouncementDocuments();
  const { distributions } = useDocumentDistributions();

  const monthlyStats = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('th-TH', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const incoming = incomingDocs.filter(doc => {
        const docDate = new Date(doc.created_at);
        return docDate.getFullYear() === year && docDate.getMonth() === month;
      }).length;
      
      const outgoing = outgoingDocs.filter(doc => {
        const docDate = new Date(doc.created_at);
        return docDate.getFullYear() === year && docDate.getMonth() === month;
      }).length;
      
      const orders = orderDocs.filter(doc => {
        const docDate = new Date(doc.created_at);
        return docDate.getFullYear() === year && docDate.getMonth() === month;
      }).length;

      const memos = memoDocs.filter(doc => {
        const docDate = new Date(doc.created_at);
        return docDate.getFullYear() === year && docDate.getMonth() === month;
      }).length;

      const announcements = announcementDocs.filter(doc => {
        const docDate = new Date(doc.created_at);
        return docDate.getFullYear() === year && docDate.getMonth() === month;
      }).length;
      
      months.push({
        name: monthKey,
        หนังสือรับ: incoming,
        หนังสือส่ง: outgoing,
        หนังสือคำสั่ง: orders,
        บันทึกข้อความ: memos,
        ประกาศ: announcements,
      });
    }
    
    return months;
  }, [incomingDocs, outgoingDocs, orderDocs, memoDocs, announcementDocs]);

  const urgencyStats = useMemo(() => {
    const allDocs = [...incomingDocs, ...outgoingDocs, ...orderDocs, ...memoDocs, ...announcementDocs];
    const urgencyCounts: Record<string, number> = {
      'ด่วนที่สุด': 0,
      'ด่วนมาก': 0,
      'ด่วน': 0,
      'ปกติ': 0,
    };
    
    allDocs.forEach(doc => {
      if (doc.urgency && urgencyCounts[doc.urgency] !== undefined) {
        urgencyCounts[doc.urgency]++;
      }
    });
    
    return Object.entries(urgencyCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [incomingDocs, outgoingDocs, orderDocs, memoDocs, announcementDocs]);

  const distributionStats = useMemo(() => {
    const roomCounts: Record<string, number> = {};
    
    distributions.forEach(dist => {
      const roomName = dist.room?.name || 'ไม่ระบุ';
      roomCounts[roomName] = (roomCounts[roomName] || 0) + 1;
    });
    
    return Object.entries(roomCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [distributions]);

  const pendingDocuments = useMemo(() => {
    return incomingDocs.filter(doc => {
      const docDistributions = distributions.filter(d => d.incoming_document_id === doc.id);
      return docDistributions.length === 0;
    });
  }, [incomingDocs, distributions]);

  return {
    monthlyStats,
    urgencyStats,
    distributionStats,
    pendingDocuments,
    totalIncoming: incomingDocs.length,
    totalOutgoing: outgoingDocs.length,
    totalOrders: orderDocs.length,
    totalMemos: memoDocs.length,
    totalAnnouncements: announcementDocs.length,
    totalDistributions: distributions.length,
  };
}
