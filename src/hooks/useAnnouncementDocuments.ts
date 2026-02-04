import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AnnouncementDocument } from "@/types/documents";
import { toast } from "@/hooks/use-toast";

export function useAnnouncementDocuments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["announcement-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcement_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AnnouncementDocument[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<AnnouncementDocument, 'id' | 'document_number' | 'issued_at' | 'created_at'>) => {
      const { data: result, error } = await supabase
        .from("announcement_documents")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as AnnouncementDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement-documents"] });
      toast({ title: "สำเร็จ", description: "เพิ่มหนังสือประกาศเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถเพิ่มหนังสือประกาศได้", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<AnnouncementDocument> & { id: string }) => {
      const { error } = await supabase
        .from("announcement_documents")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement-documents"] });
      toast({ title: "สำเร็จ", description: "แก้ไขหนังสือประกาศเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถแก้ไขหนังสือประกาศได้", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("announcement_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement-documents"] });
      toast({ title: "สำเร็จ", description: "ลบหนังสือประกาศเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถลบหนังสือประกาศได้", variant: "destructive" });
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
