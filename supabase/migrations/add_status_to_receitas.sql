-- Adiciona coluna status em receitas para facilitar controle de recebimento
ALTER TABLE public.receitas
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebida', 'vencida'));

-- Índice auxiliar
CREATE INDEX IF NOT EXISTS idx_receitas_status ON public.receitas(status);

