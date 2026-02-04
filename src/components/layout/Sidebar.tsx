import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Inbox, 
  Send, 
  FileText, 
  Search,
  FileStack,
  LogOut,
  Share2,
  Menu,
  TrendingUp,
  FileEdit,
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
  { icon: LayoutDashboard, label: "แดชบอร์ด", path: "/" },
  { icon: Inbox, label: "หนังสือรับ", path: "/incoming" },
  { icon: Send, label: "หนังสือส่ง", path: "/outgoing" },
  { icon: FileText, label: "หนังสือคำสั่ง", path: "/orders" },
  { icon: FileEdit, label: "บันทึกข้อความ", path: "/memos" },
  { icon: Megaphone, label: "หนังสือประกาศ", path: "/announcements" },
  { icon: Share2, label: "การกระจายเอกสาร", path: "/distributions" },
  { icon: TrendingUp, label: "สรุปรายงาน", path: "/reports" },
  { icon: Search, label: "ค้นหา", path: "/search" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({ title: "ออกจากระบบไม่สำเร็จ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "ออกจากระบบสำเร็จ" });
        // Use window.location to ensure complete session clear and redirect
        window.location.href = "/auth";
      }
    } catch (err) {
      toast({ title: "เกิดข้อผิดพลาด", description: "กรุณาลองใหม่อีกครั้ง", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
          <FileStack className="h-6 w-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">ทะเบียนหนังสือ</h1>
          <p className="text-xs text-sidebar-foreground/70">ราชการอิเล็กทรอนิกส์</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto space-y-1 px-3 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer with user info */}
      <div className="mt-auto border-t border-sidebar-border px-4 py-4 space-y-3 bg-sidebar">
        {user && (
          <div className="px-2">
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
          </div>
        )}
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-sidebar px-4 shadow-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <FileStack className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <h1 className="text-base font-semibold text-sidebar-foreground">ทะเบียนหนังสือ</h1>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 h-full p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 bg-sidebar text-sidebar-foreground shadow-xl lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}
