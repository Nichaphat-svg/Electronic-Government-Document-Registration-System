import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OutgoingDocument } from "@/types/documents";
import { toast } from "@/hooks/use-toast";

export function useOutgoingDocuments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["outgoing-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outgoing_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OutgoingDocument[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<OutgoingDocument, 'id' | 'document_number' | 'issued_at' | 'created_at'>) => {
      const { data: result, error } = await supabase
        .from("outgoing_documents")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as OutgoingDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoing-documents"] });
      toast({ title: "สำเร็จ", description: "เพิ่มหนังสือส่งเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถเพิ่มหนังสือส่งได้", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<OutgoingDocument> & { id: string }) => {
      const { error } = await supabase
        .from("outgoing_documents")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoing-documents"] });
      toast({ title: "สำเร็จ", description: "แก้ไขหนังสือส่งเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถแก้ไขหนังสือส่งได้", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("outgoing_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoing-documents"] });
      toast({ title: "สำเร็จ", description: "ลบหนังสือส่งเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถลบหนังสือส่งได้", variant: "destructive" });
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
