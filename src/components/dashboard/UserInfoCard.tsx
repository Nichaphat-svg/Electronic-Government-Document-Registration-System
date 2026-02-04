import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Edit, Building2, Briefcase } from "lucide-react";
import { useUserProfile, AppRole } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";

export function UserInfoCard() {
  const { user } = useAuth();
  const { profile, role, updateProfile, isUpdating, getRoleLabel } = useUserProfile();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    position: profile?.position || '',
    department: profile?.department || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    setOpen(false);
  };

  const getRoleBadgeVariant = (role: AppRole): "default" | "secondary" | "destructive" => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          ข้อมูลผู้ใช้งาน
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFormData({
                full_name: profile?.full_name || '',
                position: profile?.position || '',
                department: profile?.department || '',
              })}
            >
              <Edit className="h-4 w-4 mr-1" />
              แก้ไข
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>แก้ไขโปรไฟล์</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">ตำแหน่ง</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="กรอกตำแหน่ง"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">หน่วยงาน</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="กรอกหน่วยงาน"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              {profile?.full_name || user?.email?.split('@')[0] || 'ไม่ระบุชื่อ'}
            </h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant={getRoleBadgeVariant(role)} className="mt-1">
              {getRoleLabel(role)}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">ตำแหน่ง</p>
              <p className="text-sm font-medium">{profile?.position || 'ไม่ระบุ'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">หน่วยงาน</p>
              <p className="text-sm font-medium">{profile?.department || 'ไม่ระบุ'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
