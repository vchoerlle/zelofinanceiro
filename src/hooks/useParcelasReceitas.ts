import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ParcelaReceitaStatus = "pendente" | "recebida" | "vencida";

export interface ParcelaReceita {
  id: string;
  receita_parcelada_id: string;
  receita_id: string;
  numero_parcela: number;
  data_prevista: string;
  valor_parcela: number;
  status: ParcelaReceitaStatus;
  created_at: string;
  updated_at: string;
  receita?: {
    descricao: string;
    valor: number;
    data: string;
    categoria_id: string;
    status?: string;
  };
}

export const useParcelasReceitas = () => {
  const [parcelas, setParcelas] = useState<ParcelaReceita[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  const fetchParcelasByReceitaParcelada = async (receitaParceladaId: string) => {
    try {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setParcelas([]);
        setLoading(false);
        return;
      }
      setCurrentParentId(receitaParceladaId);
      const { data, error } = await supabase
        .from("parcelas_receitas")
        .select(`
          *,
          receita:receitas (descricao, valor, data, categoria_id, status)
        `)
        .eq("receita_parcelada_id", receitaParceladaId)
        .order("numero_parcela", { ascending: true });

      if (error) throw error;

      setParcelas((data || []) as unknown as ParcelaReceita[]);
    } catch (error: any) {
      toast({ title: "Erro ao carregar parcelas", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createParcelasForReceita = async (
    receitaParceladaId: string,
    descricao: string,
    pagador: string,
    valorTotal: number,
    totalParcelas: number,
    dataPrimeiraParcela: string,
    categoriaId: string
  ) => {
    try {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Sessão expirada. Faça login novamente.");
      const valorParcela = valorTotal / totalParcelas;
      const novasParcelas: ParcelaReceita[] = [];

      for (let i = 1; i <= totalParcelas; i++) {
        const [ano, mes, dia] = dataPrimeiraParcela.split("-").map(Number);
        const dataPrevista = new Date(ano, mes - 1, dia);
        dataPrevista.setMonth(dataPrevista.getMonth() + (i - 1));

        const descricaoParcela = `${descricao} - ${pagador} - Parc ${i}/${totalParcelas}`;

        // Cria uma linha em receitas
        const { data: receita, error: receitaError } = await supabase
          .from("receitas")
          .insert({
            descricao: descricaoParcela,
            valor: valorParcela,
            data: dataPrevista.toISOString().split("T")[0],
            categoria_id: categoriaId,
            user_id: user.id,
          })
          .select()
          .single();

        if (receitaError) throw receitaError;

        const { data: parcela, error: parcelaError } = await supabase
          .from("parcelas_receitas")
          .insert({
            receita_parcelada_id: receitaParceladaId,
            receita_id: (receita as any).id,
            numero_parcela: i,
            data_prevista: dataPrevista.toISOString().split("T")[0],
            valor_parcela: valorParcela,
            status: "pendente",
          })
          .select()
          .single();

        if (parcelaError) throw parcelaError;

        novasParcelas.push({
          ...(parcela as any),
          receita: {
            descricao: descricaoParcela,
            valor: valorParcela,
            data: dataPrevista.toISOString().split("T")[0],
            categoria_id: categoriaId,
          },
        } as ParcelaReceita);
      }

      setParcelas(novasParcelas);
      toast({ title: "Parcelas criadas", description: `${totalParcelas} parcelas de receita foram criadas!` });
      return { data: novasParcelas, error: null };
    } catch (error: any) {
      toast({ title: "Erro ao criar parcelas", description: error.message, variant: "destructive" });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const updateParcelaStatus = async (parcelaId: string, status: ParcelaReceitaStatus) => {
    try {
      const parcela = parcelas.find((p) => p.id === parcelaId);
      if (!parcela) throw new Error("Parcela não encontrada");

      const { error: parcelaError } = await supabase
        .from("parcelas_receitas")
        .update({ status })
        .eq("id", parcelaId);

      if (parcelaError) throw parcelaError;

      // Atualiza também a receita associada
      const receitaStatus = status === "recebida" ? "recebida" : status === "vencida" ? "vencida" : "pendente";
      await supabase.from("receitas").update({ status: receitaStatus as any }).eq("id", parcela.receita_id);

      setParcelas((prev) => prev.map((p) => (p.id === parcelaId ? { ...p, status } : p)));

      // Recalcular status do parent (receitas_parceladas):
      if (currentParentId) {
        // Buscar todas as parcelas do parent para computar agregados, usando data_prevista para atraso
        const { data: allParcelas } = await supabase
          .from("parcelas_receitas")
          .select("id, status, data_prevista, valor_parcela")
          .eq("receita_parcelada_id", currentParentId);

        const total = (allParcelas || []).length;
        const recebidas = (allParcelas || []).filter((p: any) => p.status === "recebida").length;
        const valorRecebido = (allParcelas || []).reduce((sum: number, p: any) => sum + (p.status === "recebida" ? Number(p.valor_parcela) : 0), 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existeAtraso = (allParcelas || []).some((p: any) => {
          if (p.status === "recebida") return false;
          const d = new Date((p.data_prevista as string) + "T00:00:00");
          return d < today; // só conta como vencida se anterior a hoje
        });

        const parentStatus = recebidas >= total && total > 0 ? "quitada" : existeAtraso ? "vencida" : "pendente";

        await supabase
          .from("receitas_parceladas")
          .update({
            parcelas_recebidas: recebidas,
            status: parentStatus,
            valor_recebido: valorRecebido,
            valor_restante: (allParcelas || []).reduce((sum: number, p: any) => sum + Number(p.valor_parcela), 0) - valorRecebido,
          })
          .eq("id", currentParentId);

        await fetchParcelasByReceitaParcelada(currentParentId);
        // Notificar outras telas para recarregar a lista de receitas parceladas
        window.dispatchEvent(new CustomEvent("receitaParceladaChanged", { detail: { id: currentParentId } }));
      }

      window.dispatchEvent(new CustomEvent("parcelaReceitaStatusChanged"));
      toast({ title: "Status atualizado", description: "Status da parcela de receita atualizado!" });
      return { error: null };
    } catch (error: any) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
      return { error };
    }
  };

  const updateParcela = async (parcelaId: string, updates: { descricao?: string; valor?: number; data?: string }) => {
    try {
      const parcela = parcelas.find((p) => p.id === parcelaId);
      if (!parcela) throw new Error("Parcela não encontrada");

      // Atualiza receita vinculada
      await supabase
        .from("receitas")
        .update({ descricao: updates.descricao as any, valor: updates.valor as any, data: updates.data as any })
        .eq("id", parcela.receita_id);

      // Atualiza parcela (valor/data) se necessário
      const parcelaUpdates: any = {};
      if (updates.valor !== undefined) parcelaUpdates.valor_parcela = updates.valor;
      if (updates.data !== undefined) parcelaUpdates.data_prevista = updates.data;
      if (Object.keys(parcelaUpdates).length > 0) {
        await supabase.from("parcelas_receitas").update(parcelaUpdates).eq("id", parcelaId);
      }

      setParcelas((prev) =>
        prev.map((p) =>
          p.id === parcelaId
            ? {
                ...p,
                ...parcelaUpdates,
                receita: p.receita
                  ? {
                      ...p.receita,
                      descricao: updates.descricao || p.receita.descricao,
                      valor: updates.valor ?? p.receita.valor,
                      data: updates.data || p.receita.data,
                    }
                  : p.receita,
              }
            : p,
        ),
      );

      toast({ title: "Parcela atualizada", description: "Parcela de receita atualizada com sucesso!" });
      return { error: null };
    } catch (error: any) {
      toast({ title: "Erro ao atualizar parcela", description: error.message, variant: "destructive" });
      return { error };
    }
  };

  const deleteParcela = async (parcelaId: string) => {
    try {
      const parcela = parcelas.find((p) => p.id === parcelaId);
      if (!parcela) throw new Error("Parcela não encontrada");

      // Deleta a receita vinculada (CASCADE remove parcela)
      await supabase.from("receitas").delete().eq("id", parcela.receita_id);

      setParcelas((prev) => prev.filter((p) => p.id !== parcelaId));
      toast({ title: "Parcela removida", description: "Parcela de receita removida!" });
      return { error: null };
    } catch (error: any) {
      toast({ title: "Erro ao remover parcela", description: error.message, variant: "destructive" });
      return { error };
    }
  };

  const deleteParcelasByReceitaParcelada = async (receitaParceladaId: string) => {
    try {
      const { data: ids, error } = await supabase
        .from("parcelas_receitas")
        .select("receita_id")
        .eq("receita_parcelada_id", receitaParceladaId);
      if (error) throw error;

      const receitaIds = (ids || []).map((r: any) => r.receita_id);
      if (receitaIds.length > 0) {
        await supabase.from("receitas").delete().in("id", receitaIds);
      }
      setParcelas([]);
      toast({ title: "Parcelas removidas", description: "Todas as parcelas de receita foram removidas!" });
      return { error: null };
    } catch (error: any) {
      toast({ title: "Erro ao remover parcelas", description: error.message, variant: "destructive" });
      return { error };
    }
  };

  return {
    parcelas,
    loading,
    fetchParcelasByReceitaParcelada,
    createParcelasForReceita,
    updateParcelaStatus,
    updateParcela,
    deleteParcela,
    deleteParcelasByReceitaParcelada,
  };
};


