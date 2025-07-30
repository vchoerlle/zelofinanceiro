# 🏦 Zelo Financeiro - Controle Financeiro Inteligente

> **Gerencie suas finanças de forma simples e inteligente com dashboard intuitivo, relatórios detalhados e assistente integrado.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

## 📖 Sobre o Projeto

O **Zelo Financeiro** é uma aplicação web moderna para controle financeiro pessoal e empresarial, desenvolvida com foco na simplicidade e eficiência. Com interface intuitiva e recursos avançados, oferece uma solução completa para gestão de finanças com sistema de assinatura integrado.

### 🎯 Objetivos

- Simplificar o controle financeiro diário
- Fornecer insights através de relatórios detalhados
- Centralizar todas as informações financeiras em um só lugar
- Oferecer experiência de usuário excepcional
- Sistema de assinatura para monetização

## ✨ Funcionalidades

### 🔐 **Sistema de Autenticação Avançado**

- **Cadastro Seguro** - Validação de senha forte (minúscula, maiúscula, número, símbolo, mínimo 6 caracteres)
- **Verificação de Email** - Prevenção de cadastros duplicados
- **Recuperação de Senha** - Sistema completo de reset via email
- **Gestão de Perfil** - Edição de dados pessoais e foto de perfil
- **Sistema de Assinatura** - Controle de acesso baseado em dias restantes
- **Bloqueio Automático** - Usuários com assinatura expirada são bloqueados automaticamente

### 💰 **Gestão Financeira Core**

- **Dashboard Interativo** - Visão geral das finanças em tempo real
- **Receitas & Despesas** - Controle completo de entradas e saídas
- **Categorização Inteligente** - Organize suas transações por categorias personalizáveis
- **Gestão de Parcelamentos** - Acompanhe e controle seus compromissos financeiros
- **Metas Financeiras** - Defina e monitore objetivos financeiros
- **Status de Pagamento** - Controle de status (Pago, Pendente, Atraso) para despesas

### 📊 **Relatórios e Análises**

- **Relatórios Detalhados** - Análises profundas do comportamento financeiro
- **Dashboard Empresarial** - Métricas específicas para negócios
- **Visualizações Gráficas** - Gráficos e charts informativos
- **Filtros por Período** - Análises customizadas por data

### 🚗 **Gestão de Veículos** (Diferencial)

- **Controle de Quilometragem** - Monitore o uso dos seus veículos
- **Manutenções Programadas** - Gerencie tipos de manutenção personalizáveis
- **Custos Operacionais** - Acompanhe gastos relacionados aos veículos
- **Histórico de Manutenções** - Registro completo de serviços realizados
- **Vinculação de Tipos** - Associação de tipos de manutenção aos veículos

### 🛒 **Recursos Adicionais**

- **Lista de Mercado** - Planeje suas compras com categorização
- **Integração com IA** - Assistente inteligente para insights financeiros
- **Análise de Documentos** - Upload e análise de comprovantes via OpenAI
- **Interface Responsiva** - Acesso completo em dispositivos móveis
- **Tema Escuro/Claro** - Alternância automática de temas
- **Plano Familiar** - Campo para WhatsApp familiar (quando habilitado)

### 🛡️ **Sistema de Segurança**

- **Row Level Security (RLS)** - Políticas de acesso no banco de dados
- **Validação Frontend** - Verificações em tempo real
- **Proteção de Rotas** - Acesso controlado por autenticação
- **Logout Automático** - Desconexão por inatividade ou assinatura expirada

## 🛠️ Tecnologias Utilizadas

### **Frontend**

- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool rápida e moderna
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes de UI modernos e acessíveis

### **Backend & Banco de Dados**

- **Supabase** - Backend-as-a-Service com PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security** - Políticas de segurança no banco
- **Supabase Auth** - Sistema de autenticação completo

### **Ferramentas de Desenvolvimento**

- **ESLint** - Linting de código
- **PostCSS** - Processamento de CSS
- **React Hooks** - Gerenciamento de estado e efeitos
- **Lucide React** - Ícones modernos

### **Integrações**

- **OpenAI API** - Análise inteligente de documentos
- **Toast Notifications** - Feedback visual para usuários

## 📁 Estrutura do Projeto

```
zelo-financeiro/
├── public/                 # Arquivos estáticos
│   ├── favicon.ico
│   ├── logo/              # Logos do projeto
│   └── video/             # Vídeos promocionais
├── src/
│   ├── components/        # Componentes React
│   │   ├── auth/         # Componentes de autenticação
│   │   ├── ui/           # Componentes base (shadcn/ui)
│   │   └── [modais]      # Modais específicos do domínio
│   ├── pages/            # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── Receitas.tsx
│   │   ├── Despesas.tsx
│   │   ├── Veiculos.tsx
│   │   └── [...]
│   ├── hooks/            # Hooks customizados
│   │   ├── useAuth.ts
│   │   ├── useSubscription.ts
│   │   └── [...]
│   ├── lib/              # Utilitários e helpers
│   ├── integrations/     # Integrações externas
│   │   └── supabase/     # Configuração do Supabase
│   └── [arquivos base]
├── supabase/             # Configurações do Supabase
│   ├── migrations/       # Migrações do banco
│   └── functions/        # Edge Functions
├── [arquivos de configuração]
└── README.md
```

## 🚀 Como Executar

### **Pré-requisitos**

- Node.js 18+ instalado
- npm ou yarn
- Git
- Conta no Supabase

### **Instalação**

1. **Clone o repositório**

```bash
git clone [URL-DO-REPOSITORIO]
cd zelo-financeiro
```

2. **Instale as dependências**

```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_OPENAI_API_KEY=sua_chave_da_openai
```

4. **Execute em modo de desenvolvimento**

```bash
npm run dev
# ou
yarn dev
```

5. **Acesse a aplicação**

```
http://localhost:5173
```

### **Scripts Disponíveis**

```bash
npm run dev          # Executa em modo desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build de produção
npm run lint         # Executa o linting do código
```

## ⚙️ Configuração do Banco de Dados

### **Supabase Setup**

1. **Crie um projeto no Supabase**
2. **Execute as migrações** no SQL Editor:

```sql
-- Exemplo de migração para sistema de assinatura
ALTER TABLE profiles ADD COLUMN dias_restantes INTEGER DEFAULT 30;
ALTER TABLE profiles ADD COLUMN plano_familiar TEXT DEFAULT 'nao';
ALTER TABLE profiles ADD COLUMN whatsapp_familiar TEXT;
```

3. **Configure as políticas RLS** para segurança:

```sql
-- Política para bloquear acesso quando assinatura expirada
CREATE POLICY "Bloquear acesso quando assinatura expirada" ON transacoes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.dias_restantes IS NULL OR profiles.dias_restantes > 0)
  )
);
```

### **Estrutura do Banco**

Principais tabelas:
- `profiles` - Perfis dos usuários
- `transacoes` - Transações financeiras
- `despesas` - Despesas específicas
- `receitas` - Receitas específicas
- `categorias` - Categorias de transações
- `veiculos` - Veículos dos usuários
- `manutencoes` - Manutenções dos veículos

## 🔧 Desenvolvimento

### **Estrutura de Componentes**

```typescript
// Exemplo de componente com validação
interface FormProps {
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}

export function MeuFormulario({ onSubmit, loading }: FormProps) {
  const [formData, setFormData] = useState<FormData>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campos do formulário */}
    </form>
  );
}
```

### **Hooks Customizados**

```typescript
// Exemplo de hook para assinatura
export const useSubscription = () => {
  const { user } = useAuth();
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
  
  // Lógica de verificação de assinatura
  
  return { diasRestantes, isValid };
};
```

### **Boas Práticas**

- ✅ Sempre use TypeScript com tipagem explícita
- ✅ Componentes funcionais com hooks
- ✅ Nomeação clara e descritiva
- ✅ Validação tanto no frontend quanto no backend
- ✅ Tratamento de erros consistente
- ✅ Feedback visual para usuários

## 📊 Performance

- **Build otimizado** com Vite
- **Tree shaking** automático
- **Lazy loading** de componentes não críticos
- **CSS otimizado** com Tailwind CSS purge
- **Imagens otimizadas** com WebP quando possível
- **Cache inteligente** no Supabase

## 🔒 Segurança

- **Autenticação JWT** via Supabase
- **Row Level Security** no PostgreSQL
- **Validação de entrada** em todas as camadas
- **Proteção contra ataques** comuns
- **Logs de auditoria** para ações críticas

## 🧪 Testes

Para testar o sistema de assinatura:

1. **Login normal** com uma conta
2. **Altere `dias_restantes` para 0** no banco
3. **Recarregue a página** - deve aparecer tela de bloqueio
4. **Verifique no console** - não deve conseguir carregar dados

## 📈 Roadmap

- [ ] **Notificações Push** - Alertas em tempo real
- [ ] **Relatórios Avançados** - Mais opções de análise
- [ ] **Integração com Bancos** - Importação automática
- [ ] **App Mobile** - Versão nativa
- [ ] **Multi-idioma** - Suporte a outros idiomas

## 👨‍💻 Autor

**Equipe Zelo Financeiro**

- 🌐 Website: [zelofinanceiro.com.br](https://zelofinanceiro.com.br)
- 📧 Email: contato@zelofinanceiro.com.br

---

<div align="center">

**Feito com ❤️ para simplificar sua vida financeira**

[![GitHub stars](https://img.shields.io/github/stars/seu-usuario/zelo-financeiro?style=social)](https://github.com/seu-usuario/zelo-financeiro)
[![GitHub forks](https://img.shields.io/github/forks/seu-usuario/zelo-financeiro?style=social)](https://github.com/seu-usuario/zelo-financeiro)

</div>
