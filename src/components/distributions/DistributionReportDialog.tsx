import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, FileText, Building2 } from "lucide-react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { DocumentDistribution } from "@/types/documents";

// Beautiful color palette for rooms
const ROOM_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#a855f7", // purple
  "#eab308", // yellow
  "#0ea5e9", // sky
  "#22c55e", // green
];

interface Room {
  id: string;
  name: string;
}

interface DistributionReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distributions: DocumentDistribution[];
  rooms: Room[];
}

type Period = "week" | "month" | "year";

export function DistributionReportDialog({
  open,
  onOpenChange,
  distributions,
  rooms,
}: DistributionReportDialogProps) {
  const [period, setPeriod] = useState<Period>("month");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");

  const getDateRange = (period: Period) => {
    const now = new Date();
    switch (period) {
      case "week":
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "year":
        return { start: startOfYear(now), end: endOfYear(now) };
    }
  };

  const getPeriodLabel = (period: Period) => {
    const now = new Date();
    switch (period) {
      case "week":
        return `สัปดาห์นี้`;
      case "month":
        return now.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
      case "year":
        return `ปี ${now.getFullYear() + 543}`;
    }
  };

  const filteredDistributions = useMemo(() => {
    const { start, end } = getDateRange(period);
    
    return distributions.filter((dist) => {
      const sentDate = new Date(dist.sent_at);
      const inPeriod = isWithinInterval(sentDate, { start, end });
      const inRoom = selectedRoom === "all" || dist.room_id === selectedRoom;
      return inPeriod && inRoom;
    });
  }, [distributions, period, selectedRoom]);

  const roomStats = useMemo(() => {
    const { start, end } = getDateRange(period);
    const periodDistributions = distributions.filter((dist) => {
      const sentDate = new Date(dist.sent_at);
      return isWithinInterval(sentDate, { start, end });
    });

    const total = periodDistributions.length;
    
    const stats = rooms.map((room) => {
      const count = periodDistributions.filter((d) => d.room_id === room.id).length;
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
      return { room, count, percentage };
    }).filter((stat) => stat.count > 0);

    return { stats, total };
  }, [distributions, rooms, period]);

  // Prepare chart data with colors
  const chartData = useMemo(() => {
    return roomStats.stats.map((stat, index) => ({
      name: stat.room.name,
      value: stat.count,
      percentage: parseFloat(stat.percentage),
      fill: ROOM_COLORS[index % ROOM_COLORS.length],
    }));
  }, [roomStats.stats]);

  const selectedRoomStats = useMemo(() => {
    if (selectedRoom === "all") {
      return null;
    }
    const room = rooms.find((r) => r.id === selectedRoom);
    const count = filteredDistributions.length;
    const percentage = roomStats.total > 0 ? ((count / roomStats.total) * 100).toFixed(1) : "0.0";
    return { room, count, percentage };
  }, [selectedRoom, rooms, filteredDistributions, roomStats.total]);

  const handlePrint = () => {
    const periodLabel = getPeriodLabel(period);
    const roomName = selectedRoom === "all" ? "ทุกห้อง" : rooms.find((r) => r.id === selectedRoom)?.name || "";

    let tableContent = "";
    
    if (selectedRoom === "all") {
      tableContent = `
        <table>
          <thead>
            <tr>
              <th style="width: 60px;">ลำดับ</th>
              <th>ห้อง/หน่วยงาน</th>
              <th style="width: 120px;" class="text-center">จำนวน (ฉบับ)</th>
              <th style="width: 100px;" class="text-center">ร้อยละ</th>
            </tr>
          </thead>
          <tbody>
            ${roomStats.stats.map((stat, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${stat.room.name}</td>
                <td class="text-center">${stat.count}</td>
                <td class="text-center percentage">${stat.percentage}%</td>
              </tr>
            `).join("")}
            <tr class="total-row">
              <td colspan="2" class="text-right">รวมทั้งหมด</td>
              <td class="text-center">${roomStats.total}</td>
              <td class="text-center">100%</td>
            </tr>
          </tbody>
        </table>
      `;
    } else {
      tableContent = `
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">ลำดับ</th>
              <th style="width: 80px;">เลขรับ</th>
              <th style="width: 120px;">เลขหนังสือ</th>
              <th>เรื่อง</th>
              <th style="width: 100px;">วันที่ส่ง</th>
            </tr>
          </thead>
          <tbody>
            ${filteredDistributions.map((dist, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td class="text-center">${dist.incoming_document?.receiving_number?.toString().padStart(3, "0") || "-"}</td>
                <td>${dist.incoming_document?.document_number || "-"}</td>
                <td>${dist.incoming_document?.subject || "-"}</td>
                <td class="text-center">${new Date(dist.sent_at).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="summary-box" style="margin-top: 15px;">
          <p>คิดเป็นร้อยละ <span class="percentage" style="font-size: 24px;">${selectedRoomStats?.percentage}%</span> ของทั้งหมด ${roomStats.total} ฉบับ</p>
        </div>
      `;
    }

    const reportContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>รายงานการกระจายเอกสาร</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Sarabun', 'TH SarabunPSK', sans-serif; 
            padding: 20px; 
            max-width: 800px; 
            margin: 0 auto;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          h1 { text-align: center; margin-bottom: 5px; font-size: 22px; color: #1e40af; }
          h2 { text-align: center; margin-top: 5px; color: #666; font-size: 16px; font-weight: normal; }
          .summary-box { 
            background: #f5f5f5; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0;
            text-align: center;
          }
          .summary-number { font-size: 40px; font-weight: bold; color: #2563eb; }
          .summary-label { font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-size: 14px; }
          th { background-color: #2563eb !important; color: white !important; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .percentage { color: #059669; font-weight: bold; }
          .total-row { background-color: #dbeafe !important; font-weight: bold; }
          .footer { margin-top: 25px; text-align: right; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
          @media print {
            body { padding: 10px; }
            table { font-size: 12px; }
            th, td { padding: 6px 4px; }
          }
          @page { margin: 15mm; size: A4; }
        </style>
      </head>
      <body>
        <h1>รายงานสรุปการกระจายเอกสาร</h1>
        <h2>${periodLabel} - ${roomName}</h2>
        
        <div class="summary-box">
          <div class="summary-number">${selectedRoom === "all" ? roomStats.total : filteredDistributions.length}</div>
          <div class="summary-label">จำนวนหนังสือทั้งหมด</div>
        </div>

        ${tableContent}

        <div class="footer">
          พิมพ์เมื่อ: ${new Date().toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
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
      frameDoc.write(reportContent);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            สรุปรายงานการกระจายเอกสาร
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">ช่วงเวลา</label>
              <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">รายสัปดาห์</SelectItem>
                  <SelectItem value="month">รายเดือน</SelectItem>
                  <SelectItem value="year">รายปี</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">ห้อง/หน่วยงาน</label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด (รวม)</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Period Label */}
          <div className="text-center text-muted-foreground">
            {getPeriodLabel(period)}
          </div>

          {/* Summary Cards */}
          {selectedRoom === "all" ? (
            <>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">{roomStats.total}</div>
                    <div className="text-muted-foreground mt-2">จำนวนหนังสือทั้งหมด</div>
                  </div>
                </CardContent>
              </Card>

              {/* Charts Section */}
              {chartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Pie Chart */}
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="text-sm font-medium text-center mb-2">แผนภูมิวงกลม</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            labelLine={false}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string) => [`${value} ฉบับ`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Bar Chart */}
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="text-sm font-medium text-center mb-2">แผนภูมิแท่ง</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            width={80}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`${value} ฉบับ`, 'จำนวน']}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`bar-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Room List with Color Indicators */}
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {roomStats.stats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูลในช่วงเวลานี้</p>
                ) : (
                  roomStats.stats.map((stat, index) => (
                    <Card key={stat.room.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: ROOM_COLORS[index % ROOM_COLORS.length] }}
                          />
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{stat.room.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold">{stat.count} ฉบับ</span>
                          <span 
                            className="text-sm font-medium px-2 py-1 rounded text-white"
                            style={{ backgroundColor: ROOM_COLORS[index % ROOM_COLORS.length] }}
                          >
                            {stat.percentage}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">{filteredDistributions.length}</div>
                    <div className="text-muted-foreground mt-2">
                      จำนวนหนังสือ - {rooms.find((r) => r.id === selectedRoom)?.name}
                    </div>
                    <div className="mt-2">
                      <span className="text-lg text-green-600 font-medium bg-green-100 px-3 py-1 rounded">
                        คิดเป็น {selectedRoomStats?.percentage}% ของทั้งหมด {roomStats.total} ฉบับ
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {filteredDistributions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูลในช่วงเวลานี้</p>
                ) : (
                  filteredDistributions.map((dist, index) => (
                    <Card key={dist.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="py-3">
                        <div className="flex items-start gap-3">
                          <span className="text-muted-foreground text-sm">{index + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{dist.incoming_document?.subject || "-"}</div>
                            <div className="text-sm text-muted-foreground">
                              เลขรับ: {dist.incoming_document?.receiving_number?.toString().padStart(3, "0") || "-"} | 
                              เลขหนังสือ: {dist.incoming_document?.document_number || "-"}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(dist.sent_at).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}

          {/* Print Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              พิมพ์รายงาน
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
