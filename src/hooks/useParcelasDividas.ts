import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ParcelaDivida {
  id: string;
  divida_id: string;
  despesa_id: string;
  numero_parcela: number;
  data_vencimento: string;
  valor_parcela: number;
  status: 'pendente' | 'paga' | 'vencida';
  created_at: string;
  updated_at: string;
  despesa?: {
    descricao: string;
    valor: number;
    data: string;
    categoria_id: string;
    status: 'pago' | 'pendente' | 'atraso';
  };
}

export const useParcelasDividas = () => {
  const [parcelas, setParcelas] = useState<ParcelaDivida[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentDividaId, setCurrentDividaId] = useState<string | null>(null);

  const fetchParcelasByDivida = async (dividaId: string) => {
    try {
      setCurrentDividaId(dividaId);
      const { data, error } = await supabase
        .from('parcelas_dividas')
        .select(`
          *,
          despesa:despesas (descricao, valor, data, categoria_id, status)
        `)
        .eq('divida_id', dividaId)
        .order('numero_parcela', { ascending: true });

      if (error) throw error;
      

      
      // Mapear os dados para usar o status da despesa como status da parcela
      const parcelasComStatusDespesa = (data || []).map((parcela: any) => {
        // Mapear status da despesa para status da parcela
        let statusFinal = parcela.status; // Status padrão da parcela
        
        if (parcela.despesa?.status) {
          // Mapear status da despesa para status da parcela
          switch (parcela.despesa.status) {
            case 'pago':
              statusFinal = 'paga';
              break;
            case 'atraso':
              statusFinal = 'vencida';
              break;
            case 'pendente':
              statusFinal = 'pendente';
              break;
            default:
              statusFinal = parcela.status;
          }
        }
        

        
        return {
          ...parcela,
          status: statusFinal
        };
      });
      

      setParcelas(parcelasComStatusDespesa as ParcelaDivida[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar parcelas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createParcelasForDivida = async (
    dividaId: string,
    descricao: string,
    credor: string,
    valorTotal: number,
    parcelas: number,
    dataPrimeiraParcela: string,
    categoriaId: string
  ) => {
    try {
      const valorParcela = valorTotal / parcelas;
      const parcelasToCreate = [];

      // Criar todas as parcelas
      for (let i = 1; i <= parcelas; i++) {
        // Calcular data de vencimento da parcela
        // Garantir que a data seja tratada corretamente sem fuso horário
        const [ano, mes, dia] = dataPrimeiraParcela.split('-').map(Number);
        const dataVencimento = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11
        dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1));

        // Criar descrição da parcela com número
        const descricaoParcela = `${descricao} - ${credor} - Parc ${i}/${parcelas}`;

        // Inserir despesa com status pendente
        const { data: despesa, error: despesaError } = await supabase
          .from('despesas')
          .insert({
            descricao: descricaoParcela,
            valor: valorParcela,
            data: dataVencimento.toISOString().split('T')[0],
            categoria_id: categoriaId,
            status: 'pendente', // Sempre pendente para novas parcelas
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (despesaError) throw despesaError;

        // Criar vínculo da parcela
        const { error: parcelaError } = await supabase
          .from('parcelas_dividas')
          .insert({
            divida_id: dividaId,
            despesa_id: despesa.id,
            numero_parcela: i,
            data_vencimento: dataVencimento.toISOString().split('T')[0],
            valor_parcela: valorParcela,
            status: 'pendente'
          });

        if (parcelaError) throw parcelaError;

        parcelasToCreate.push({
          id: despesa.id,
          divida_id: dividaId,
          despesa_id: despesa.id,
          numero_parcela: i,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          valor_parcela: valorParcela,
          status: 'pendente' as const,
          created_at: despesa.created_at,
          updated_at: despesa.updated_at,
          despesa: {
            descricao: descricaoParcela,
            valor: valorParcela,
            data: dataVencimento.toISOString().split('T')[0],
            categoria_id: categoriaId
          }
        });
      }

      setParcelas(parcelasToCreate);
      
      toast({
        title: "Parcelas criadas",
        description: `${parcelas} parcelas foram criadas com sucesso!`,
      });
      
      return { data: parcelasToCreate, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar parcelas",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateParcelaStatus = async (parcelaId: string, status: 'pendente' | 'paga' | 'vencida') => {
    try {
      // Buscar a parcela para obter o despesa_id
      const parcela = parcelas.find(p => p.id === parcelaId);
      if (!parcela) throw new Error("Parcela não encontrada");

      // Mapear status da parcela para status da despesa
      const statusDespesa = status === 'paga' ? 'pago' : 
                           status === 'vencida' ? 'atraso' : 'pendente';

      // Atualizar a parcela
      const { error: parcelaError } = await supabase
        .from('parcelas_dividas')
        .update({ status })
        .eq('id', parcelaId);

      if (parcelaError) throw parcelaError;

      // Atualizar também o status da despesa correspondente
      const { error: despesaError } = await supabase
        .from('despesas')
        .update({ status: statusDespesa })
        .eq('id', parcela.despesa_id);

      if (despesaError) {
        console.warn('Erro ao atualizar status da despesa:', despesaError);
        // Não falhar se não conseguir atualizar a despesa
      }
      
      setParcelas(prev => 
        prev.map(parcela => 
          parcela.id === parcelaId ? { ...parcela, status } : parcela
        )
      );
      
      // Recarregar os dados da dívida para atualizar o resumo
      if (currentDividaId) {
        await fetchParcelasByDivida(currentDividaId);
      }
      
      // Armazenar no localStorage para sincronização entre páginas
      const dividasParaRecalcular = JSON.parse(localStorage.getItem('dividasParaRecalcular') || '[]');
      if (!dividasParaRecalcular.includes(parcela.divida_id)) {
        dividasParaRecalcular.push(parcela.divida_id);
        localStorage.setItem('dividasParaRecalcular', JSON.stringify(dividasParaRecalcular));
      }
      
      // Disparar evento para notificar mudança de status
      window.dispatchEvent(new CustomEvent('parcelaStatusChanged'));
      
      toast({
        title: "Status atualizado",
        description: "Status da parcela atualizado com sucesso!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateParcela = async (parcelaId: string, updates: { descricao?: string; valor?: number; data?: string }) => {
    try {
      // Buscar a parcela para obter o despesa_id
      const parcela = parcelas.find(p => p.id === parcelaId);
      if (!parcela) throw new Error("Parcela não encontrada");

      // Atualizar a despesa relacionada
      const { error: despesaError } = await supabase
        .from('despesas')
        .update({
          descricao: updates.descricao,
          valor: updates.valor,
          data: updates.data
        })
        .eq('id', parcela.despesa_id);

      if (despesaError) throw despesaError;

      // Atualizar a parcela se houver mudanças específicas
      const parcelaUpdates: any = {};
      if (updates.valor !== undefined) parcelaUpdates.valor_parcela = updates.valor;
      if (updates.data !== undefined) parcelaUpdates.data_vencimento = updates.data;

      if (Object.keys(parcelaUpdates).length > 0) {
        const { error: parcelaError } = await supabase
          .from('parcelas_dividas')
          .update(parcelaUpdates)
          .eq('id', parcelaId);

        if (parcelaError) throw parcelaError;
      }

      // Atualizar o estado local
      setParcelas(prev => 
        prev.map(parcela => 
          parcela.id === parcelaId ? {
            ...parcela,
            ...parcelaUpdates,
            despesa: parcela.despesa ? {
              ...parcela.despesa,
              descricao: updates.descricao || parcela.despesa.descricao,
              valor: updates.valor || parcela.despesa.valor,
              data: updates.data || parcela.despesa.data
            } : undefined
          } : parcela
        )
      );
      
      toast({
        title: "Parcela atualizada",
        description: "Parcela atualizada com sucesso!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar parcela",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteParcela = async (parcelaId: string) => {
    try {
      // Buscar a parcela para obter o despesa_id
      const parcela = parcelas.find(p => p.id === parcelaId);
      if (!parcela) throw new Error("Parcela não encontrada");

      // Deletar a despesa relacionada
      const { error: despesaError } = await supabase
        .from('despesas')
        .delete()
        .eq('id', parcela.despesa_id);

      if (despesaError) throw despesaError;

      // A parcela será deletada automaticamente pelo CASCADE
      setParcelas(prev => prev.filter(p => p.id !== parcelaId));
      
      toast({
        title: "Parcela removida",
        description: "Parcela removida com sucesso!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover parcela",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteParcelasByDivida = async (dividaId: string) => {
    try {
      // Buscar todas as parcelas da dívida
      const { data: parcelasData, error: fetchError } = await supabase
        .from('parcelas_dividas')
        .select('despesa_id')
        .eq('divida_id', dividaId);

      if (fetchError) throw fetchError;

      // Deletar as despesas relacionadas
      const despesaIds = parcelasData.map(p => p.despesa_id);
      if (despesaIds.length > 0) {
        const { error: despesasError } = await supabase
          .from('despesas')
          .delete()
          .in('id', despesaIds);

        if (despesasError) throw despesasError;
      }

      // As parcelas serão deletadas automaticamente pelo CASCADE
      setParcelas([]);
      
      toast({
        title: "Parcelas removidas",
        description: "Todas as parcelas da dívida foram removidas!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover parcelas",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    parcelas,
    loading,
    fetchParcelasByDivida,
    createParcelasForDivida,
    updateParcelaStatus,
    updateParcela,
    deleteParcela,
    deleteParcelasByDivida,
    refetch: fetchParcelasByDivida
  };
}; 