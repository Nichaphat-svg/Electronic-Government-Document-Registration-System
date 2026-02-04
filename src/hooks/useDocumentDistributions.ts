import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DocumentDistribution } from "@/types/documents";
import { toast } from "@/hooks/use-toast";

export function useDocumentDistributions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["document-distributions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_distributions")
        .select(`
          *,
          incoming_document:incoming_documents(*),
          room:rooms(*)
        `)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return data as DocumentDistribution[];
    },
  });

  const createManyMutation = useMutation({
    mutationFn: async (distributions: { incoming_document_id: string; room_id: string }[]) => {
      // Use upsert with ignoreDuplicates to prevent errors when a document
      // has already been sent to the same room (unique constraint).
      const { data, error } = await supabase
        .from("document_distributions")
        .upsert(distributions, {
          onConflict: "incoming_document_id,room_id",
          ignoreDuplicates: true,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-distributions"] });
      toast({ title: "สำเร็จ", description: "ส่งหนังสือเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถส่งหนังสือได้", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("document_distributions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-distributions"] });
      toast({ title: "สำเร็จ", description: "ลบการกระจายเอกสารแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถลบได้", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, room_id }: { id: string; room_id: string }) => {
      const { data, error } = await supabase
        .from("document_distributions")
        .update({ room_id })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-distributions"] });
      toast({ title: "สำเร็จ", description: "แก้ไขการกระจายเอกสารแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถแก้ไขได้", variant: "destructive" });
    },
  });

  const getDistributionsByRoom = (roomId: string) => {
    return query.data?.filter(d => d.room_id === roomId) || [];
  };

  const getDistributionsByDocument = (documentId: string) => {
    return query.data?.filter(d => d.incoming_document_id === documentId) || [];
  };

  return {
    distributions: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createMany: createManyMutation.mutateAsync,
    isCreating: createManyMutation.isPending,
    delete: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    getDistributionsByRoom,
    getDistributionsByDocument,
  };
}
