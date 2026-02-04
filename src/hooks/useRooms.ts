import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Room } from "@/types/documents";
import { toast } from "@/hooks/use-toast";

export function useRooms() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Room[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("rooms")
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      return data as Room;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({ title: "สำเร็จ", description: "เพิ่มห้องเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถเพิ่มห้องได้", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({ title: "สำเร็จ", description: "ลบห้องเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถลบห้องได้", variant: "destructive" });
    },
  });

  return {
    rooms: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
