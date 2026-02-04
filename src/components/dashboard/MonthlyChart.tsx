import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

interface MonthlyChartProps {
  data: Array<{
    name: string;
    หนังสือรับ: number;
    หนังสือส่ง: number;
    หนังสือคำสั่ง: number;
    บันทึกข้อความ: number;
    ประกาศ: number;
  }>;
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          จำนวนหนังสือรายเดือน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar dataKey="หนังสือรับ" fill="hsl(215, 70%, 35%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="หนังสือส่ง" fill="hsl(215, 60%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="หนังสือคำสั่ง" fill="hsl(145, 60%, 40%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="บันทึกข้อความ" fill="hsl(280, 60%, 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ประกาศ" fill="hsl(35, 80%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
