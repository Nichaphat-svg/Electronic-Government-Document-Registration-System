import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OrderDocument } from "@/types/documents";
import { toast } from "@/hooks/use-toast";

export function useOrderDocuments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["order-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrderDocument[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<OrderDocument, 'id' | 'document_number' | 'issued_at' | 'created_at'>) => {
      const { data: result, error } = await supabase
        .from("order_documents")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as OrderDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-documents"] });
      toast({ title: "สำเร็จ", description: "เพิ่มหนังสือคำสั่งเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถเพิ่มหนังสือคำสั่งได้", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<OrderDocument> & { id: string }) => {
      const { error } = await supabase
        .from("order_documents")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-documents"] });
      toast({ title: "สำเร็จ", description: "แก้ไขหนังสือคำสั่งเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถแก้ไขหนังสือคำสั่งได้", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("order_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-documents"] });
      toast({ title: "สำเร็จ", description: "ลบหนังสือคำสั่งเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถลบหนังสือคำสั่งได้", variant: "destructive" });
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
