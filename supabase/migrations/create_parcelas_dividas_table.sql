-- Criar tabela para vincular parcelas às dívidas
CREATE TABLE IF NOT EXISTS public.parcelas_dividas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    divida_id UUID NOT NULL REFERENCES public.dividas(id) ON DELETE CASCADE,
    despesa_id UUID NOT NULL REFERENCES public.despesas(id) ON DELETE CASCADE,
    numero_parcela INTEGER NOT NULL,
    data_vencimento DATE NOT NULL,
    valor_parcela DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'vencida')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(divida_id, numero_parcela),
    UNIQUE(despesa_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_parcelas_dividas_divida_id ON public.parcelas_dividas(divida_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_dividas_despesa_id ON public.parcelas_dividas(despesa_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_dividas_status ON public.parcelas_dividas(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_dividas_data_vencimento ON public.parcelas_dividas(data_vencimento);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.parcelas_dividas ENABLE ROW LEVEL SECURITY;

-- Política RLS para parcelas_dividas
CREATE POLICY "Users can view their own parcelas_dividas" ON public.parcelas_dividas
    FOR SELECT USING (
        divida_id IN (
            SELECT id FROM public.dividas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own parcelas_dividas" ON public.parcelas_dividas
    FOR INSERT WITH CHECK (
        divida_id IN (
            SELECT id FROM public.dividas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own parcelas_dividas" ON public.parcelas_dividas
    FOR UPDATE USING (
        divida_id IN (
            SELECT id FROM public.dividas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own parcelas_dividas" ON public.parcelas_dividas
    FOR DELETE USING (
        divida_id IN (
            SELECT id FROM public.dividas WHERE user_id = auth.uid()
        )
    );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_parcelas_dividas_updated_at 
    BEFORE UPDATE ON public.parcelas_dividas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 