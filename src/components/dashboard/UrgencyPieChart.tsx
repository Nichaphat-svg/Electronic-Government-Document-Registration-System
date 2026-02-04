import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AlertCircle } from "lucide-react";

interface UrgencyPieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS: Record<string, string> = {
  'ด่วนที่สุด': 'hsl(0, 72%, 35%)',
  'ด่วนมาก': 'hsl(0, 65%, 55%)',
  'ด่วน': 'hsl(45, 90%, 50%)',
  'ปกติ': 'hsl(145, 60%, 40%)',
};

export function UrgencyPieChart({ data }: UrgencyPieChartProps) {
  const filteredData = data.filter(item => item.value > 0);

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          สัดส่วนตามชั้นความเร็ว
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {filteredData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              ยังไม่มีข้อมูล
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
