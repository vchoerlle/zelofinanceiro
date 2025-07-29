-- Adicionar campo status na tabela despesas
ALTER TABLE public.despesas 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'atraso'));

-- Criar índice para melhor performance em consultas por status
CREATE INDEX IF NOT EXISTS idx_despesas_status ON public.despesas(status);

-- Atualizar despesas existentes baseado na data
-- Se a data é anterior a hoje, marcar como 'atraso'
-- Se a data é hoje ou futura, manter como 'pendente'
UPDATE public.despesas 
SET status = CASE 
    WHEN data < CURRENT_DATE THEN 'atraso'
    ELSE 'pendente'
END
WHERE status IS NULL;

-- Função para atualizar status automaticamente baseado na data
CREATE OR REPLACE FUNCTION update_despesa_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a data foi alterada, atualizar o status
    IF OLD.data != NEW.data THEN
        NEW.status = CASE 
            WHEN NEW.data < CURRENT_DATE THEN 'atraso'
            ELSE 'pendente'
        END;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar status automaticamente quando a data é alterada
DROP TRIGGER IF EXISTS update_despesa_status_trigger ON public.despesas;
CREATE TRIGGER update_despesa_status_trigger
    BEFORE UPDATE ON public.despesas
    FOR EACH ROW
    EXECUTE FUNCTION update_despesa_status();

-- Função para atualizar status de despesas vencidas (executar diariamente)
CREATE OR REPLACE FUNCTION update_vencidas_despesas()
RETURNS void AS $$
BEGIN
    UPDATE public.despesas 
    SET status = 'atraso'
    WHERE data < CURRENT_DATE 
    AND status = 'pendente';
END;
$$ language 'plpgsql';

-- Comentários para documentação
COMMENT ON COLUMN public.despesas.status IS 'Status da despesa: pago, pendente, atraso';
COMMENT ON FUNCTION update_despesa_status() IS 'Função para atualizar status automaticamente baseado na data';
COMMENT ON FUNCTION update_vencidas_despesas() IS 'Função para marcar despesas vencidas como atraso'; 