import { useState, useMemo, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useIncomingDocuments } from "@/hooks/useIncomingDocuments";
import { useOutgoingDocuments } from "@/hooks/useOutgoingDocuments";
import { useOrderDocuments } from "@/hooks/useOrderDocuments";
import { useMemoDocuments } from "@/hooks/useMemoDocuments";
import { useAnnouncementDocuments } from "@/hooks/useAnnouncementDocuments";
import { FileText, FileOutput, FileCheck, Calendar, TrendingUp, PieChart, Printer, FileEdit, Megaphone } from "lucide-react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

type PeriodType = "week" | "month" | "year";

interface ReportStats {
  incoming: number;
  outgoing: number;
  orders: number;
  memos: number;
  announcements: number;
  total: number;
}

export default function Reports() {
  const [period, setPeriod] = useState<PeriodType>("month");
  
  const { documents: incomingDocs } = useIncomingDocuments();
  const { documents: outgoingDocs } = useOutgoingDocuments();
  const { documents: orderDocs } = useOrderDocuments();
  const { documents: memoDocs } = useMemoDocuments();
  const { documents: announcementDocs } = useAnnouncementDocuments();

  const getDateRange = (periodType: PeriodType) => {
    const now = new Date();
    switch (periodType) {
      case "week":
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "year":
        return { start: startOfYear(now), end: endOfYear(now) };
    }
  };

  const stats = useMemo<ReportStats>(() => {
    const { start, end } = getDateRange(period);
    
    const filteredIncoming = incomingDocs.filter(doc => {
      const docDate = parseISO(doc.received_at);
      return isWithinInterval(docDate, { start, end });
    });

    const filteredOutgoing = outgoingDocs.filter(doc => {
      const docDate = parseISO(doc.issued_at);
      return isWithinInterval(docDate, { start, end });
    });

    const filteredOrders = orderDocs.filter(doc => {
      const docDate = parseISO(doc.issued_at);
      return isWithinInterval(docDate, { start, end });
    });

    const filteredMemos = memoDocs.filter(doc => {
      const docDate = parseISO(doc.issued_at);
      return isWithinInterval(docDate, { start, end });
    });

    const filteredAnnouncements = announcementDocs.filter(doc => {
      const docDate = parseISO(doc.issued_at);
      return isWithinInterval(docDate, { start, end });
    });

    return {
      incoming: filteredIncoming.length,
      outgoing: filteredOutgoing.length,
      orders: filteredOrders.length,
      memos: filteredMemos.length,
      announcements: filteredAnnouncements.length,
      total: filteredIncoming.length + filteredOutgoing.length + filteredOrders.length + filteredMemos.length + filteredAnnouncements.length
    };
  }, [period, incomingDocs, outgoingDocs, orderDocs, memoDocs, announcementDocs]);

  const calculatePercentage = (value: number) => {
    if (stats.total === 0) return 0;
    return ((value / stats.total) * 100).toFixed(1);
  };

  const periodLabel = useMemo(() => {
    const { start, end } = getDateRange(period);
    switch (period) {
      case "week":
        return `${format(start, 'd MMM', { locale: th })} - ${format(end, 'd MMM yyyy', { locale: th })}`;
      case "month":
        return format(start, 'MMMM yyyy', { locale: th });
      case "year":
        return format(start, 'yyyy', { locale: th });
    }
  }, [period]);

  const pieChartData = [
    { name: 'หนังสือรับ', value: stats.incoming, color: 'hsl(215, 70%, 35%)' },
    { name: 'หนังสือส่ง', value: stats.outgoing, color: 'hsl(215, 60%, 55%)' },
    { name: 'บันทึกข้อความ', value: stats.memos, color: 'hsl(280, 60%, 50%)' },
    { name: 'หนังสือคำสั่ง', value: stats.orders, color: 'hsl(145, 60%, 40%)' },
    { name: 'หนังสือประกาศ', value: stats.announcements, color: 'hsl(35, 80%, 50%)' },
  ];

  const barChartData = [
    { name: 'หนังสือรับ', จำนวน: stats.incoming },
    { name: 'หนังสือส่ง', จำนวน: stats.outgoing },
    { name: 'บันทึกข้อความ', จำนวน: stats.memos },
    { name: 'หนังสือคำสั่ง', จำนวน: stats.orders },
    { name: 'หนังสือประกาศ', จำนวน: stats.announcements },
  ];

  const printReportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>รายงานสรุปเอกสาร - ${periodLabel}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Sarabun', 'TH Sarabun New', Arial, sans-serif; 
            padding: 30px; 
            color: #333;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header { 
            text-align: center; 
            margin-bottom: 25px;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 15px;
          }
          .header h1 { 
            font-size: 22px; 
            margin: 0 0 8px 0;
            color: #1e40af;
          }
          .header p { 
            font-size: 14px; 
            margin: 3px 0;
            color: #666;
          }
          .period-label {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 10px; 
            text-align: left;
            font-size: 14px;
          }
          th { 
            background-color: #1e40af !important; 
            color: white !important;
            font-weight: bold;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-row { 
            background-color: #dbeafe !important; 
            font-weight: bold; 
          }
          .summary-section {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 8px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-top: 12px;
          }
          .summary-card {
            background: white;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
          }
          .summary-card .label {
            font-size: 11px;
            color: #666;
            margin-top: 3px;
          }
          .summary-card .percent {
            font-size: 12px;
            color: #059669;
            margin-top: 2px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          @media print {
            body { padding: 15px; }
            .no-print { display: none !important; }
            table { font-size: 12px; }
            th, td { padding: 6px; }
            .summary-card .value { font-size: 20px; }
          }
          @page { margin: 15mm; size: A4; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>รายงานสรุปเอกสาร</h1>
          <p class="period-label">ช่วงเวลา: ${periodLabel}</p>
          <p>ประเภท: ${period === 'week' ? 'รายสัปดาห์' : period === 'month' ? 'รายเดือน' : 'รายปี'}</p>
        </div>

        <div class="summary-section">
          <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 16px;">สรุปจำนวนเอกสาร</h3>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="value">${stats.incoming}</div>
              <div class="label">หนังสือรับ</div>
              <div class="percent">${calculatePercentage(stats.incoming)}%</div>
            </div>
            <div class="summary-card">
              <div class="value">${stats.outgoing}</div>
              <div class="label">หนังสือส่ง</div>
              <div class="percent">${calculatePercentage(stats.outgoing)}%</div>
            </div>
            <div class="summary-card">
              <div class="value">${stats.memos}</div>
              <div class="label">บันทึกข้อความ</div>
              <div class="percent">${calculatePercentage(stats.memos)}%</div>
            </div>
            <div class="summary-card">
              <div class="value">${stats.orders}</div>
              <div class="label">หนังสือคำสั่ง</div>
              <div class="percent">${calculatePercentage(stats.orders)}%</div>
            </div>
            <div class="summary-card">
              <div class="value">${stats.announcements}</div>
              <div class="label">หนังสือประกาศ</div>
              <div class="percent">${calculatePercentage(stats.announcements)}%</div>
            </div>
            <div class="summary-card">
              <div class="value">${stats.total}</div>
              <div class="label">รวมทั้งหมด</div>
              <div class="percent">100%</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ประเภทเอกสาร</th>
              <th class="text-right">จำนวน (ฉบับ)</th>
              <th class="text-right">เปอร์เซ็นต์</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>หนังสือรับ</td>
              <td class="text-right">${stats.incoming}</td>
              <td class="text-right">${calculatePercentage(stats.incoming)}%</td>
            </tr>
            <tr>
              <td>หนังสือส่ง (ภายนอก)</td>
              <td class="text-right">${stats.outgoing}</td>
              <td class="text-right">${calculatePercentage(stats.outgoing)}%</td>
            </tr>
            <tr>
              <td>บันทึกข้อความ</td>
              <td class="text-right">${stats.memos}</td>
              <td class="text-right">${calculatePercentage(stats.memos)}%</td>
            </tr>
            <tr>
              <td>หนังสือคำสั่ง</td>
              <td class="text-right">${stats.orders}</td>
              <td class="text-right">${calculatePercentage(stats.orders)}%</td>
            </tr>
            <tr>
              <td>หนังสือประกาศ</td>
              <td class="text-right">${stats.announcements}</td>
              <td class="text-right">${calculatePercentage(stats.announcements)}%</td>
            </tr>
            <tr class="total-row">
              <td>รวมทั้งหมด</td>
              <td class="text-right">${stats.total}</td>
              <td class="text-right">100%</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>พิมพ์เมื่อ: ${format(new Date(), 'd MMMM yyyy เวลา HH:mm น.', { locale: th })}</p>
          <p>ระบบสารบรรณอิเล็กทรอนิกส์</p>
        </div>
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
        }
        setTimeout(() => document.body.removeChild(printFrame), 1000);
      }, 300);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              สรุปรายงาน
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {periodLabel}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="เลือกช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">รายสัปดาห์</SelectItem>
                  <SelectItem value="month">รายเดือน</SelectItem>
                  <SelectItem value="year">รายปี</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              พิมพ์รายงาน
            </Button>
          </div>
        </div>

        {/* Summary Cards - Row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">หนังสือรับ</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.incoming}</p>
                  <p className="text-xs text-muted-foreground">{calculatePercentage(stats.incoming)}%</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-sky-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">หนังสือส่ง</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.outgoing}</p>
                  <p className="text-xs text-muted-foreground">{calculatePercentage(stats.outgoing)}%</p>
                </div>
                <FileOutput className="h-8 w-8 text-sky-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">บันทึกข้อความ</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.memos}</p>
                  <p className="text-xs text-muted-foreground">{calculatePercentage(stats.memos)}%</p>
                </div>
                <FileEdit className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards - Row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card className="border-l-4 border-l-green-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">หนังสือคำสั่ง</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.orders}</p>
                  <p className="text-xs text-muted-foreground">{calculatePercentage(stats.orders)}%</p>
                </div>
                <FileCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">หนังสือประกาศ</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.announcements}</p>
                  <p className="text-xs text-muted-foreground">{calculatePercentage(stats.announcements)}%</p>
                </div>
                <Megaphone className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">รวมทั้งหมด</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">100%</p>
                </div>
                <PieChart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Main Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">สัดส่วนเอกสารทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {stats.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} ฉบับ`, 'จำนวน']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    ไม่มีข้อมูลในช่วงเวลานี้
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">จำนวนเอกสารแยกตามประเภท</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }}
                      className="fill-muted-foreground"
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      className="fill-muted-foreground"
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} ฉบับ`, 'จำนวน']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="จำนวน" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Percentage Summary Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">ตารางสรุปเปอร์เซ็นต์</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">ประเภทเอกสาร</th>
                    <th className="text-right py-3 px-4 font-medium">จำนวน (ฉบับ)</th>
                    <th className="text-right py-3 px-4 font-medium">เปอร์เซ็นต์</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">หนังสือรับ</td>
                    <td className="text-right py-3 px-4 font-medium">{stats.incoming}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{calculatePercentage(stats.incoming)}%</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">หนังสือส่ง (ภายนอก)</td>
                    <td className="text-right py-3 px-4 font-medium">{stats.outgoing}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{calculatePercentage(stats.outgoing)}%</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">บันทึกข้อความ</td>
                    <td className="text-right py-3 px-4 font-medium">{stats.memos}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{calculatePercentage(stats.memos)}%</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">หนังสือคำสั่ง</td>
                    <td className="text-right py-3 px-4 font-medium">{stats.orders}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{calculatePercentage(stats.orders)}%</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">หนังสือประกาศ</td>
                    <td className="text-right py-3 px-4 font-medium">{stats.announcements}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{calculatePercentage(stats.announcements)}%</td>
                  </tr>
                  <tr className="bg-muted/50 font-bold">
                    <td className="py-3 px-4">รวมทั้งหมด</td>
                    <td className="text-right py-3 px-4">{stats.total}</td>
                    <td className="text-right py-3 px-4">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
