import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { IncomingDocument } from "@/types/documents";
import { toast } from "@/hooks/use-toast";

export function useIncomingDocuments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["incoming-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incoming_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as IncomingDocument[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<IncomingDocument, 'id' | 'receiving_number' | 'received_at' | 'created_at'>) => {
      const { data: result, error } = await supabase
        .from("incoming_documents")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as IncomingDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-documents"] });
      toast({ title: "สำเร็จ", description: "เพิ่มหนังสือรับเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถเพิ่มหนังสือรับได้", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<IncomingDocument> & { id: string }) => {
      const { error } = await supabase
        .from("incoming_documents")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-documents"] });
      toast({ title: "สำเร็จ", description: "แก้ไขหนังสือรับเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถแก้ไขหนังสือรับได้", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("incoming_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-documents"] });
      toast({ title: "สำเร็จ", description: "ลบหนังสือรับเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถลบหนังสือรับได้", variant: "destructive" });
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
