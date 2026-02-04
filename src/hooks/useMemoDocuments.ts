import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MemoDocument } from "@/types/documents";
import { toast } from "@/hooks/use-toast";

export function useMemoDocuments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["memo-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memo_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MemoDocument[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<MemoDocument, 'id' | 'document_number' | 'issued_at' | 'created_at'>) => {
      const { data: result, error } = await supabase
        .from("memo_documents")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as MemoDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memo-documents"] });
      toast({ title: "สำเร็จ", description: "เพิ่มหนังสือบันทึกข้อความเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถเพิ่มหนังสือบันทึกข้อความได้", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<MemoDocument> & { id: string }) => {
      const { error } = await supabase
        .from("memo_documents")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memo-documents"] });
      toast({ title: "สำเร็จ", description: "แก้ไขหนังสือบันทึกข้อความเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถแก้ไขหนังสือบันทึกข้อความได้", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("memo_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memo-documents"] });
      toast({ title: "สำเร็จ", description: "ลบหนังสือบันทึกข้อความเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถลบหนังสือบันทึกข้อความได้", variant: "destructive" });
    },
  });

  return {
    documents: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
