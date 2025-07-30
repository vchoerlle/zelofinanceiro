import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Veiculo } from "./useVeiculos";
import { TipoManutencao } from "./useTiposManutencao";
import { VeiculoTipoManutencao } from "./useVeiculosTiposManutencao";

export interface ManutencaoRealizada {
  id: string;
  veiculo_id: string;
  tipo_manutencao_id: string;
  data_realizada: string;
  quilometragem_realizada: number;
  valor_manutencao: number;
  observacoes?: string;
  created_at: string;
  veiculo?: Veiculo;
  tipoManutencao?: TipoManutencao;
}

export interface ManutencaoPendente {
  id: string;
  veiculo_id: string;
  tipo_manutencao_id: string;
  veiculo?: Veiculo;
  tipoManutencao?: TipoManutencao;
  tipo: string;
  sistema: string;
  status: "Atrasada" | "Em dia" | "Pendente";
  proximaEm: string;
  kmRestantes: number;
  ultimaManutencao?: ManutencaoRealizada;
}

export const useManutencoesPendentes = (
  veiculos: Veiculo[],
  tiposManutencao: TipoManutencao[],
  vinculos: VeiculoTipoManutencao[]
) => {
  const [manutencaoRealizada, setManutencaoRealizada] = useState<ManutencaoRealizada[]>([]);
  const [manutencoesPendentes, setManutencoesPendentes] = useState<ManutencaoPendente[]>([]);
  const [loading, setLoading] = useState(false); // Iniciar como false para evitar loading desnecessário
  const { toast } = useToast();

  const fetchManutencaoRealizada = useCallback(async () => {
    try {
      setLoading(true); // Definir loading como true apenas quando buscar dados
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('manutencoes')
        .select(`
          *,
          veiculo:veiculos(*),
          tipoManutencao:tipos_manutencao(*)
        `)
        .eq('user_id', user.id)
        .order('data_realizada', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setManutencaoRealizada(data || []);
    } catch (error) {
      console.error('Erro ao buscar manutenções realizadas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar manutenções realizadas",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Sempre definir loading como false ao finalizar
    }
  }, [toast]);

  const calcularManutencoesPendentes = useCallback(() => {
    const pendentes: ManutencaoPendente[] = [];

    veiculos.forEach(veiculo => {
      tiposManutencao.forEach(tipo => {
        // Verificar se existe vínculo entre veículo e tipo
        const temVinculo = vinculos.some(v => 
          v.veiculo_id === veiculo.id && v.tipo_manutencao_id === tipo.id
        );

        if (!temVinculo) return;

        // Buscar manutenções realizadas para este veículo e tipo
        const manutencoesDoTipo = manutencaoRealizada.filter(m => 
          m.veiculo_id === veiculo.id && m.tipo_manutencao_id === tipo.id
        );

        // Ordenar por data_realizada (mais recente primeiro)
        manutencoesDoTipo.sort((a, b) => 
          new Date(b.data_realizada).getTime() - new Date(a.data_realizada).getTime()
        );

        const ultimaManutencao = manutencoesDoTipo[0];
        let status: "Atrasada" | "Em dia" | "Pendente";
        let proximaEm: string;
        let kmRestantes: number;

        if (ultimaManutencao) {
          // Já foi realizada pelo menos uma vez
          const quilometragemUltimaManutencao = ultimaManutencao.quilometragem_realizada;
          const proximaQuilometragem = quilometragemUltimaManutencao + tipo.intervalo_km;
          const kmRestantes = proximaQuilometragem - veiculo.quilometragem;

          if (kmRestantes <= 0) {
            status = "Atrasada";
            proximaEm = `${Math.abs(kmRestantes).toLocaleString()} km atrás`;
          } else if (kmRestantes <= tipo.intervalo_km * 0.1) {
            status = "Pendente";
            proximaEm = `${kmRestantes.toLocaleString()} km`;
          } else {
            status = "Em dia";
            proximaEm = `${kmRestantes.toLocaleString()} km`;
          }
        } else {
          // Primeira vez - nunca foi realizada
          const kmExcedentes = veiculo.quilometragem - tipo.intervalo_km;
          const kmParaProxima = tipo.intervalo_km - (veiculo.quilometragem % tipo.intervalo_km);

          if (kmExcedentes > 0) {
            status = "Atrasada";
            proximaEm = `${kmExcedentes.toLocaleString()} km atrás`;
            kmRestantes = -kmExcedentes;
          } else if (kmParaProxima <= tipo.intervalo_km * 0.1) {
            status = "Pendente";
            proximaEm = `${kmParaProxima.toLocaleString()} km`;
            kmRestantes = kmParaProxima;
          } else {
            status = "Em dia";
            proximaEm = `${kmParaProxima.toLocaleString()} km`;
            kmRestantes = kmParaProxima;
          }
        }

        pendentes.push({
          id: `${veiculo.id}-${tipo.id}`,
          veiculo_id: veiculo.id,
          tipo_manutencao_id: tipo.id,
          veiculo,
          tipoManutencao: tipo,
          tipo: tipo.nome,
          sistema: tipo.sistema,
          status,
          proximaEm,
          kmRestantes,
          ultimaManutencao
        });
      });
    });

    setManutencoesPendentes(pendentes);
  }, [veiculos, tiposManutencao, manutencaoRealizada, vinculos]);

  const realizarManutencao = useCallback(async (
    manutencao: ManutencaoPendente,
    dados: {
      quilometragem: number;
      valor: number;
      observacoes: string;
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Inserir manutenção realizada
      const { data: manutencaoData, error: manutencaoError } = await supabase
        .from('manutencoes')
        .insert({
          user_id: user.id,
          veiculo_id: manutencao.veiculo_id,
          tipo_manutencao_id: manutencao.tipo_manutencao_id,
          data_realizada: new Date().toISOString().split('T')[0],
          quilometragem_realizada: dados.quilometragem,
          valor_manutencao: dados.valor,
          observacoes: dados.observacoes
        })
        .select()
        .single();

      if (manutencaoError) throw manutencaoError;

      // Atualizar quilometragem do veículo se for maior que a atual
      if (dados.quilometragem > manutencao.veiculo!.quilometragem) {
        const { error: veiculoError } = await supabase
          .from('veiculos')
          .update({ quilometragem: dados.quilometragem })
          .eq('id', manutencao.veiculo_id);

        if (veiculoError) throw veiculoError;

        // Atualizar estado local do veículo
        const veiculoIndex = veiculos.findIndex(v => v.id === manutencao.veiculo_id);
        if (veiculoIndex !== -1) {
          const veiculosAtualizados = [...veiculos];
          veiculosAtualizados[veiculoIndex] = {
            ...veiculosAtualizados[veiculoIndex],
            quilometragem: dados.quilometragem
          };
        }
      }

      // Recarregar dados
      await fetchManutencaoRealizada();
      calcularManutencoesPendentes();

      toast({
        title: "Sucesso",
        description: "Manutenção realizada com sucesso!",
      });

      return { success: true, data: manutencaoData };
    } catch (error) {
      console.error('Erro ao realizar manutenção:', error);
      toast({
        title: "Erro",
        description: "Erro ao realizar manutenção",
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [veiculos, fetchManutencaoRealizada, calcularManutencoesPendentes, toast]);

  const getManutencoesPorVeiculo = useCallback((veiculoId: string) => {
    return manutencaoRealizada.filter(m => m.veiculo_id === veiculoId);
  }, [manutencaoRealizada]);

  const getManutencoesPorTipo = useCallback((tipoManutencaoId: string) => {
    return manutencaoRealizada.filter(m => m.tipo_manutencao_id === tipoManutencaoId);
  }, [manutencaoRealizada]);

  const debugManutencoesPorVeiculoTipo = useCallback((veiculoId: string, tipoManutencaoId: string) => {
    const manutencoes = manutencaoRealizada.filter(m => 
      m.veiculo_id === veiculoId && m.tipo_manutencao_id === tipoManutencaoId
    );

    return manutencoes.sort((a, b) => 
      new Date(b.data_realizada).getTime() - new Date(a.data_realizada).getTime()
    );
  }, [manutencaoRealizada]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchManutencaoRealizada();
  }, [fetchManutencaoRealizada]);

  // Recalcular quando as manutenções realizadas ou vínculos mudarem
  useEffect(() => {
    // Sempre recalcular, mesmo que não haja vínculos (para mostrar lista vazia)
    if (veiculos.length > 0 && tiposManutencao.length > 0) {
      calcularManutencoesPendentes();
    }
  }, [manutencaoRealizada, vinculos, veiculos, tiposManutencao, calcularManutencoesPendentes]);

  // Remover lógica de loading duplicada - agora controlada pelo fetchManutencaoRealizada

  return {
    manutencoesPendentes,
    manutencaoRealizada,
    loading,
    realizarManutencao,
    getManutencoesPorVeiculo,
    getManutencoesPorTipo,
    debugManutencoesPorVeiculoTipo,
    refetch: async () => {
      await fetchManutencaoRealizada();
      setTimeout(() => {
        calcularManutencoesPendentes();
      }, 200);
    }
  };
};