import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploadField } from "./FileUploadField";
import type { OutgoingDocument, UrgencyLevel, DocumentType } from "@/types/documents";

const formSchema = z.object({
  subject: z.string().min(1, "กรุณากรอกเรื่อง"),
  to_person: z.string().min(1, "กรุณากรอกชื่อผู้รับ"),
  document_type: z.enum(['หนังสือภายนอก']),
  urgency: z.enum(['ด่วนที่สุด', 'ด่วนมาก', 'ด่วน', 'ปกติ']),
  document_date: z.string().min(1, "กรุณาเลือกวันที่"),
  notes: z.string().optional(),
  file_url: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface OutgoingDocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  initialData?: OutgoingDocument | null;
  isLoading?: boolean;
}

const urgencyOptions: UrgencyLevel[] = ['ด่วนที่สุด', 'ด่วนมาก', 'ด่วน', 'ปกติ'];
const documentTypeOptions: DocumentType[] = ['หนังสือภายนอก'];

export function OutgoingDocumentForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: OutgoingDocumentFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      to_person: "",
      document_type: "หนังสือภายนอก",
      urgency: "ปกติ",
      document_date: new Date().toISOString().split('T')[0],
      notes: "",
      file_url: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        subject: initialData.subject || "",
        to_person: initialData.to_person || "",
        document_type: "หนังสือภายนอก" as const,
        urgency: initialData.urgency || "ปกติ",
        document_date: initialData.document_date || new Date().toISOString().split('T')[0],
        notes: initialData.notes || "",
        file_url: initialData.file_url || "",
      });
    } else {
      form.reset({
        subject: "",
        to_person: "",
        document_type: "หนังสือภายนอก",
        urgency: "ปกติ",
        document_date: new Date().toISOString().split('T')[0],
        notes: "",
        file_url: "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {initialData ? "แก้ไขหนังสือส่ง" : "เพิ่มหนังสือส่ง"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เรื่อง</FormLabel>
                  <FormControl>
                    <Input placeholder="กรอกเรื่อง" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="to_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เรียน</FormLabel>
                  <FormControl>
                    <Input placeholder="กรอกชื่อผู้รับ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ประเภทหนังสือ</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทหนังสือ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชั้นความเร็ว</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกชั้นความเร็ว" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {urgencyOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันที่ออกหนังสือ</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเหตุ (ถ้ามี)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="กรอกหมายเหตุ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ไฟล์แนบ</FormLabel>
                  <FormControl>
                    <FileUploadField
                      value={field.value || ""}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
