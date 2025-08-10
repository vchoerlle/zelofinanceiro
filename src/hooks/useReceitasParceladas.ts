import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useParcelasReceitas } from "@/hooks/useParcelasReceitas";

export type ReceitaParceladaStatus = "pendente" | "vencida" | "quitada";

export interface ReceitaParcelada {
  id: string;
  user_id: string;
  descricao: string;
  pagador: string;
  valor_total: number;
  valor_recebido: number;
  valor_restante: number;
  data_primeiro_recebimento: string;
  parcelas: number;
  parcelas_recebidas: number;
  status: ReceitaParceladaStatus;
  categoria_id?: string | null;
  created_at: string;
  updated_at: string;
  categorias?: {
    nome: string;
    cor: string;
    icone: string;
  };
}

export const useReceitasParceladas = () => {
  const [lista, setLista] = useState<ReceitaParcelada[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { createParcelasForReceita, deleteParcelasByReceitaParcelada } = useParcelasReceitas();

  const fetchAll = async () => {
    try {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setLista([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("receitas_parceladas")
        .select("*") as any;
      if (error) throw error;
      setLista((data || []) as unknown as ReceitaParcelada[]);
    } catch (error: any) {
      toast({ title: "Erro ao carregar receitas parceladas", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (payload: Omit<ReceitaParcelada, "id" | "user_id" | "created_at" | "updated_at" | "valor_recebido" | "parcelas_recebidas" | "status" | "categorias">) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      // Sanitizar payload: enviar apenas colunas válidas e não enviar strings vazias
      // Normalizar comparação de data para não marcar hoje como vencida
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const primeiraData = new Date(payload.data_primeiro_recebimento + "T00:00:00");

      const insertPayload = {
        descricao: payload.descricao,
        pagador: payload.pagador,
        valor_total: payload.valor_total,
        valor_recebido: 0,
        valor_restante: payload.valor_restante ?? payload.valor_total,
        data_primeiro_recebimento: payload.data_primeiro_recebimento,
        parcelas: payload.parcelas ?? 1,
        parcelas_recebidas: 0,
        status: primeiraData < today ? "vencida" : "pendente",
        categoria_id: payload.categoria_id ?? null,
        user_id: user.id,
      } as const;

      const { data: createdRow, error } = await supabase
        .from("receitas_parceladas")
        .insert([insertPayload])
        .select("*")
        .single();

      if (error) throw error;

      // Gerar parcelas com o id recém-criado
      if (createdRow && payload.parcelas > 0 && payload.categoria_id) {
        await createParcelasForReceita(
          (createdRow as any).id,
          payload.descricao,
          payload.pagador,
          payload.valor_total,
          payload.parcelas,
          payload.data_primeiro_recebimento,
          payload.categoria_id,
        );
      }

      await fetchAll();
      toast({ title: "Receita parcelada criada" });
      return { data: createdRow ?? true, error: null } as any;
    } catch (error: any) {
      toast({ title: "Erro ao criar receita parcelada", description: error.message, variant: "destructive" });
      return { data: null, error };
    }
  };

  const updateItem = async (id: string, updates: Partial<ReceitaParcelada>) => {
    try {
      const { error } = await supabase
        .from("receitas_parceladas")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
      await fetchAll();
      toast({ title: "Receita parcelada atualizada" });
      return { data: true, error: null } as any;
    } catch (error: any) {
      toast({ title: "Erro ao atualizar receita parcelada", description: error.message, variant: "destructive" });
      return { data: null, error };
    }
  };

  const deleteItem = async (id: string) => {
    try {
      // Remove parcelas/receitas associadas
      await deleteParcelasByReceitaParcelada(id);
      const { error } = await supabase.from("receitas_parceladas").delete().eq("id", id);
      if (error) throw error;
      setLista((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Receita parcelada removida" });
      return { error: null };
    } catch (error: any) {
      toast({ title: "Erro ao remover receita parcelada", description: error.message, variant: "destructive" });
      return { error };
    }
  };

  useEffect(() => {
    fetchAll();
    const onChanged = () => fetchAll();
    window.addEventListener("receitaParceladaChanged", onChanged as EventListener);
    return () => window.removeEventListener("receitaParceladaChanged", onChanged as EventListener);
  }, []);

  return { lista, loading, fetchAll, createItem, updateItem, deleteItem };
};


