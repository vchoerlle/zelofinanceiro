-- Tabela de parcelas de receitas (análoga a public.parcelas_dividas)
CREATE TABLE IF NOT EXISTS public.parcelas_receitas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    receita_parcelada_id UUID NOT NULL REFERENCES public.receitas_parceladas(id) ON DELETE CASCADE,
    receita_id UUID NOT NULL REFERENCES public.receitas(id) ON DELETE CASCADE,
    numero_parcela INTEGER NOT NULL,
    data_prevista DATE NOT NULL,
    valor_parcela DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebida', 'vencida')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(receita_parcelada_id, numero_parcela),
    UNIQUE(receita_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_parcelas_receitas_parent ON public.parcelas_receitas(receita_parcelada_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_receitas_status ON public.parcelas_receitas(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_receitas_data ON public.parcelas_receitas(data_prevista);

-- Habilitar RLS
ALTER TABLE public.parcelas_receitas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own parcelas_receitas" ON public.parcelas_receitas
    FOR SELECT USING (
      receita_parcelada_id IN (
        SELECT id FROM public.receitas_parceladas WHERE user_id = auth.uid()
      )
    );

CREATE POLICY "Users can insert their own parcelas_receitas" ON public.parcelas_receitas
    FOR INSERT WITH CHECK (
      receita_parcelada_id IN (
        SELECT id FROM public.receitas_parceladas WHERE user_id = auth.uid()
      )
    );

CREATE POLICY "Users can update their own parcelas_receitas" ON public.parcelas_receitas
    FOR UPDATE USING (
      receita_parcelada_id IN (
        SELECT id FROM public.receitas_parceladas WHERE user_id = auth.uid()
      )
    );

CREATE POLICY "Users can delete their own parcelas_receitas" ON public.parcelas_receitas
    FOR DELETE USING (
      receita_parcelada_id IN (
        SELECT id FROM public.receitas_parceladas WHERE user_id = auth.uid()
      )
    );

-- Função e trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parcelas_receitas_updated_at 
    BEFORE UPDATE ON public.parcelas_receitas 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


