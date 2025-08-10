-- Tabela principal para parcelamentos de receitas (análogo a public.dividas)
CREATE TABLE IF NOT EXISTS public.receitas_parceladas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    pagador TEXT NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_recebido DECIMAL(10,2) DEFAULT 0,
    valor_restante DECIMAL(10,2) NOT NULL,
    data_primeiro_recebimento DATE NOT NULL,
    parcelas INTEGER NOT NULL DEFAULT 1,
    parcelas_recebidas INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'vencida', 'quitada')),
    categoria_id UUID REFERENCES public.categorias(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_receitas_parceladas_user_id ON public.receitas_parceladas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_parceladas_status ON public.receitas_parceladas(status);
CREATE INDEX IF NOT EXISTS idx_receitas_parceladas_data ON public.receitas_parceladas(data_primeiro_recebimento);

-- Habilitar RLS
ALTER TABLE public.receitas_parceladas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own receitas_parceladas" ON public.receitas_parceladas
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own receitas_parceladas" ON public.receitas_parceladas
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own receitas_parceladas" ON public.receitas_parceladas
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own receitas_parceladas" ON public.receitas_parceladas
    FOR DELETE USING (user_id = auth.uid());

-- Função e trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_receitas_parceladas_updated_at 
    BEFORE UPDATE ON public.receitas_parceladas 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


