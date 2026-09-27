// Portfólio de projetos do João Pedro — curadoria de PM (Hermes)
// Fonte: vault Obsidian (~/Documents/Obsidian/Hermes-Agent), ~/Desktop/projetos,
// cron jobs (~/.hermes/cron/jobs.json) e sessões do Hermes.
// Atualizado por último em: 2026-09-27

export type Status = "backlog" | "analise" | "progresso" | "feito" | "arquivado";
export type Area = "Produto" | "Conteudo" | "Panvel" | "Negocios" | "Carreira" | "Estudos" | "Vida";
export type Prioridade = "alta" | "media" | "baixa";

export interface Projeto {
  id: string;
  nome: string;
  resumo: string;
  area: Area;
  status: Status;
  prioridade: Prioridade;
  progresso: number; // 0-100
  inicio?: string; // YYYY-MM-DD
  atualizado: string; // YYYY-MM-DD
  prazo?: string; // marco com data
  proximaAcao?: string;
  links?: { label: string; url: string }[];
  stack?: string[];
  parceiro?: string;
  alerta?: string;
  nota?: string;
}

export const STATUS_META: Record<Status, { label: string; emoji: string; cor: string; ordem: number }> = {
  backlog:    { label: "Backlog / Ideias",  emoji: "💡", cor: "#64748b", ordem: 0 },
  analise:    { label: "Em análise",        emoji: "🔍", cor: "#a78bfa", ordem: 1 },
  progresso:  { label: "Em progresso",      emoji: "🔨", cor: "#38bdf8", ordem: 2 },
  feito:      { label: "Concluído",         emoji: "✅", cor: "#34d399", ordem: 3 },
  arquivado:  { label: "Arquivado",         emoji: "📦", cor: "#6b7280", ordem: 4 },
};

export const AREA_META: Record<Area, { label: string; cor: string }> = {
  Produto:   { label: "Produto próprio",  cor: "#38bdf8" },
  Conteudo:  { label: "Conteúdo & Marca", cor: "#f472b6" },
  Panvel:    { label: "Trabalho",         cor: "#fb923c" },
  Negocios:  { label: "Negócios",         cor: "#facc15" },
  Carreira:  { label: "Carreira",         cor: "#4ade80" },
  Estudos:   { label: "Estudos",          cor: "#c084fc" },
  Vida:      { label: "Finanças & Vida",  cor: "#2dd4bf" },
};

export const PRIORIDADE_META: Record<Prioridade, { label: string; cor: string }> = {
  alta:  { label: "Alta",  cor: "#f87171" },
  media: { label: "Média", cor: "#fbbf24" },
  baixa: { label: "Baixa", cor: "#94a3b8" },
};

export const PROJETOS: Projeto[] = [
  // ───────────────────────── PRODUTO PRÓPRIO ─────────────────────────
  {
    id: "mission-control",
    nome: "Mission Control (Hermes HQ)",
    resumo: "Dashboard local do Hermes: crons, sessões, custos e memória. Virou vitrine pública de portfólio.",
    area: "Produto", status: "progresso", prioridade: "alta", progresso: 85,
    inicio: "2026-08-14", atualizado: "2026-09-27",
    proximaAcao: "Apontar o CNAME mission-control.chuvadedados.com no Hostinger e publicar esta página /projetos.",
    links: [
      { label: "Demo", url: "https://mission-control-mauve-six.vercel.app" },
      { label: "Repo", url: "https://github.com/jotazoz/mission-control" },
    ],
    stack: ["Next.js 16", "React 19", "Tailwind 4", "node:sqlite", "Vercel"],
  },
  {
    id: "panorama",
    nome: "Panorama — jornal pessoal",
    resumo: "Jornal pessoal que publica 2x/semana, montado a partir do vault com curadoria editorial.",
    area: "Produto", status: "progresso", prioridade: "media", progresso: 75,
    inicio: "2026-08", atualizado: "2026-09-25",
    proximaAcao: "Manter o cron de ter/sex 9h e revisar a próxima edição.",
    links: [
      { label: "Produção", url: "https://panorama-wine.vercel.app" },
      { label: "Repo", url: "https://github.com/jotazoz/panorama" },
    ],
    stack: ["Next.js 16", "Basic Auth", "Vercel"],
    nota: "Publica terças e sextas 9h (cron ac498973f143).",
  },
  {
    id: "secretaria",
    nome: "Secretaria (Agenda Digital)",
    resumo: "Painel pessoal vivo: junta áudios, notas do vault, tarefas (Reminders) e compromissos por data e tema.",
    area: "Produto", status: "progresso", prioridade: "alta", progresso: 70,
    inicio: "2026-09-23", atualizado: "2026-09-27",
    proximaAcao: "Escrever o conector do Notion (chave já configurada) e revisar os tópicos sem curadoria.",
    links: [
      { label: "Produção", url: "https://secretaria-flax-alpha.vercel.app" },
      { label: "Repo (privado)", url: "https://github.com/jotazoz/secretaria" },
    ],
    stack: ["Next.js", "Basic Auth", "Python (consolidador)", "Vercel"],
    nota: "Cron horário 198930089a2a atualiza o JSON.",
  },
  {
    id: "chuva-de-dados",
    nome: "Chuva de Dados — canal & site",
    resumo: "Canal/portal de conteúdo sobre dados e BI (YouTube + Instagram + site). Portfólio profissional e topo de funil.",
    area: "Conteudo", status: "progresso", prioridade: "alta", progresso: 60,
    inicio: "2026-08", atualizado: "2026-09-21",
    proximaAcao: "Destravar a fábrica de conteúdo (último run com erro) e gravar a próxima edição.",
    links: [
      { label: "Site", url: "https://chuvadedados.com" },
      { label: "Repo", url: "https://github.com/jotazoz/chuva-de-dados" },
      { label: "Pautas", url: "https://chuvadedados.com/pauta" },
    ],
    stack: ["Next.js 16", "Vercel", "Curadoria NYT automatizada"],
    alerta: "Fábrica de conteúdo semanal falhou em 21/09 (cron cf4c7512cd7b).",
  },
  {
    id: "links-chuvadedados",
    nome: "Links Chuva de Dados",
    resumo: "Página agregadora de links do canal para bio do Instagram e LinkedIn.",
    area: "Conteudo", status: "feito", prioridade: "baixa", progresso: 100,
    inicio: "2026-09-01", atualizado: "2026-09-01",
    links: [{ label: "Produção", url: "https://links-chuvadedados.vercel.app" }],
    stack: ["Next.js", "Vercel"],
  },

  // ───────────────────────── TRABALHO PANVEL ─────────────────────────
  {
    id: "panvel-onboarding",
    nome: "Onboarding Dados & IA (Panvel)",
    resumo: "Hub de onboarding do time de Dados e IA: material-base, glossário, processos e trilha de entrada.",
    area: "Panvel", status: "progresso", prioridade: "alta", progresso: 70,
    inicio: "2026-09-21", atualizado: "2026-09-25",
    proximaAcao: "Consolidar o material-base e propor a frente de onboarding de trainees.",
    links: [{ label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/panvel-onboarding" }],
    stack: ["Obsidian", "NotebookLM"],
    nota: "Entrada em 21/09/2026, Analista Dados/IA III, cooperado.",
  },
  {
    id: "panvel-manual-dados",
    nome: "Manual de Dados (p/ Luiz)",
    resumo: "Site do manual de dados do time, montado para apresentar ao Luiz na segunda-feira.",
    area: "Panvel", status: "progresso", prioridade: "alta", progresso: 75,
    inicio: "2026-09-25", atualizado: "2026-09-27",
    prazo: "2026-09-29",
    proximaAcao: "Fechar a versão de apresentação e ensaiar a demo de segunda.",
    links: [{ label: "Site", url: "https://manual-dados-ia.vercel.app" }],
    stack: ["HTML", "Vercel"],
    nota: "Local: ~/Desktop/projetos/manual-dados-ia. Nasceu como Bíblia Panvel e foi renomeado para Manual de Dados e IA.",
  },
  {
    id: "panvel-biblia",
    nome: "Bíblia Panvel (material de estudo)",
    resumo: "Material de estudo interno do domínio Panvel: negócio, motor de precificação, 64 termos, tabelas do lake e rotina. A versão pública virou o Manual de Dados e IA.",
    area: "Panvel", status: "progresso", prioridade: "media", progresso: 70,
    inicio: "2026-09-23", atualizado: "2026-09-27",
    proximaAcao: "Ajustar com as correções do Luiz após a conversa de segunda e registrar a versão 0.2.",
    links: [{ label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/Biblia-Panvel/0-index" }],
    stack: ["Obsidian", "PDF"],
    nota: "O site público antigo (biblia-panvel) foi removido de propósito e o material foi republicado como Manual de Dados e IA.",
  },
  {
    id: "operacoes-panvel",
    nome: "Operações Panvel",
    resumo: "Frente de trabalho operacional: rotinas, chamados e melhorias do time de Dados e IA.",
    area: "Panvel", status: "progresso", prioridade: "alta", progresso: 45,
    inicio: "2026-09-23", atualizado: "2026-09-25",
    proximaAcao: "Mapear as demandas recorrentes e priorizar o que automatizar primeiro.",
    links: [{ label: "Site", url: "https://operacoes-panvel.vercel.app" }],
    stack: ["AWS", "Athena", "Databricks"],
    nota: "Local: ~/Desktop/projetos/operacoes-panvel",
  },
  {
    id: "trilha-panvel",
    nome: "Trilha técnica Panvel (Python/ML)",
    resumo: "Plano de domínio técnico do ambiente Panvel: Python, ML, Athena/Databricks e engenharia de dados.",
    area: "Panvel", status: "progresso", prioridade: "alta", progresso: 40,
    inicio: "2026-09-26", atualizado: "2026-09-26",
    proximaAcao: "Seguir o checkpoint de sexta (cron b3bc9ddfa037) e bater a meta semanal de estudo.",
    links: [{ label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/mapa-de-estudos-tecnico" }],
    stack: ["Python", "ML", "Databricks", "Athena"],
    nota: "Lembrete semanal sábado 9h (cron 0988da8be03c).",
  },
  {
    id: "panvel-data-lake",
    nome: "Data Lake PRD + Athena (acessos)",
    resumo: "Acesso validado ao Data Lake de produção da Panvel via AWS SSO, Athena e repos CodeCommit.",
    area: "Panvel", status: "progresso", prioridade: "media", progresso: 65,
    inicio: "2026-09-22", atualizado: "2026-09-25",
    proximaAcao: "Explorar as tabelas do domínio de pricing e montar as primeiras queries de valor.",
    stack: ["AWS SSO", "Athena", "CodeCommit", "Glue"],
    nota: "18 repos espelhados em ~/panvel-repos (conta PRD-Datascience 562248030452).",
  },
  {
    id: "panvel-ambiente",
    nome: "Ambiente Panvel (VPN + SSH + acessos)",
    resumo: "Setup do ambiente de trabalho: Harmony SASE (VPN), SSH na EC2 e VS Code Remote-SSH funcionando.",
    area: "Panvel", status: "feito", prioridade: "media", progresso: 100,
    inicio: "2026-09-23", atualizado: "2026-09-24",
    links: [{ label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/2026-09-24-harmony-sase-panvel-login" }],
    stack: ["Harmony SASE", "SSH", "VS Code Remote"],
    nota: "Destravado em 24/09 depois de bloqueio por Device Posture Check.",
  },

  // ───────────────────────── NEGÓCIOS ─────────────────────────
  {
    id: "projeto-limpeza",
    nome: "Projeto Limpeza (CF Diaristas)",
    resumo: "Plataforma de serviços domésticos em POA com a Elisabete como sócia operacional: diarista, cozinheira e cuidadora.",
    area: "Negocios", status: "progresso", prioridade: "alta", progresso: 45,
    inicio: "2026-09-26", atualizado: "2026-09-27",
    proximaAcao: "Fechar as minutas de parceria e prestação de serviços e validar o modelo de split de pagamento.",
    links: [
      { label: "CF Diaristas", url: "https://cf-diaristas.vercel.app" },
      { label: "CF Cuidadores", url: "https://cf-cuidadores.vercel.app" },
    ],
    stack: ["Next.js", "Asaas (split)", "Vercel"],
    parceiro: "Elisabete (sócia operacional)",
    nota: "Pesquisas de mercado, jurídico e split de pagamento já levantadas no vault.",
  },
  {
    id: "negocio-candidatura",
    nome: "Candidatura gerenciada por IA",
    resumo: "Serviço/produto que usa a esteira de vagas já construída (busca, score, material e aplicação real em ATS) como negócio.",
    area: "Negocios", status: "analise", prioridade: "media", progresso: 35,
    inicio: "2026-09-17", atualizado: "2026-09-26",
    proximaAcao: "Definir preço, marca (própria ou Chuva de Dados) e montar o vídeo de case.",
    links: [{ label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/negocio-candidatura-gerenciada-2026-09-17" }],
    parceiro: "Pai (sócio)",
    nota: "MEI vedado; mirar França/euro no médio prazo.",
  },
  {
    id: "licitacoes-inteligencia",
    nome: "Licitações Inteligência (Eliseu)",
    resumo: "Plataforma de análise de licitações e dados públicos para a parceria com o Eliseu Kopp Jr.",
    area: "Negocios", status: "progresso", prioridade: "media", progresso: 65,
    inicio: "2026-08", atualizado: "2026-08-24",
    proximaAcao: "Definir o próximo ciclo de features e revalidar o deploy.",
    links: [{ label: "Produção", url: "https://licitacoes-inteligencia.vercel.app" }],
    stack: ["Next.js", "TCE-RS", "Vercel"],
    parceiro: "Eliseu Kopp Jr. (advogado)",
  },
  {
    id: "maquina-resultados",
    nome: "Máquina / Fábrica de Resultados (AESC)",
    resumo: "Sites de cases de resultados do trabalho na AESC, com o case de divergência de contagens.",
    area: "Negocios", status: "feito", prioridade: "baixa", progresso: 100,
    inicio: "2026-08", atualizado: "2026-09-02",
    links: [
      { label: "Fábrica de Resultados", url: "https://fabrica-de-resultados.vercel.app" },
      { label: "Case HSANA", url: "https://maquina-de-resultados.vercel.app/case-divergencia-contagens.html" },
    ],
    stack: ["HTML", "Vercel"],
    nota: "Trabalho entregue enquanto estava na AESC.",
  },

  {
    id: "infra-hermes",
    nome: "Infra do Hermes (Oracle + backups)",
    resumo: "Hospedagem e sustentação do Hermes: VPS Oracle Free, backup semanal, gateways de Telegram e keep-awake.",
    area: "Produto", status: "feito", prioridade: "media", progresso: 90,
    inicio: "2026-08-06", atualizado: "2026-09-26",
    proximaAcao: "Só monitorar: os LaunchAgents cuidam de backup, gateway e keep-awake.",
    stack: ["Oracle Cloud", "launchd", "Telegram Bot API"],
    nota: "LaunchAgents: ai.hermes.gateway, com.hermes.backup-semanal, com.hermes.keep-awake.",
  },

  // ───────────────────────── CARREIRA ─────────────────────────
  {
    id: "mestrado-ufrgs",
    nome: "Mestrado PPGC/UFRGS",
    resumo: "Inscrição no mestrado em Ciência da Computação (PPGC/UFRGS) 2027/1, com IA como tema central.",
    area: "Carreira", status: "progresso", prioridade: "alta", progresso: 55,
    inicio: "2026-09-17", atualizado: "2026-09-26",
    prazo: "2026-10-19",
    proximaAcao: "Follow-up com os professores (cron 06/10) e fechar as cartas de recomendação.",
    links: [{ label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/mestrado-plano-orientadores-2026-09-25" }],
    nota: "4 crons agendados: 01/10, 19/10 (inscrições), 13/11, 22/12. E-mails enviados em 26/09.",
  },
  {
    id: "job-hunt",
    nome: "Pipeline de vagas (job hunt)",
    resumo: "Automação de busca/curadoria de vagas (LinkedIn, Gupy, Indeed), score de match e planilha de tracking.",
    area: "Carreira", status: "progresso", prioridade: "baixa", progresso: 70,
    inicio: "2026-08", atualizado: "2026-09-26",
    proximaAcao: "Reativar o cron diário se voltar a caçar vagas; hoje está pausado (vaga na Panvel fechada).",
    stack: ["Camofox", "Google Sheets", "Gmail"],
    nota: "Crons e5aac039d644 e 0d82f9f05087 estão desabilitados.",
  },
  {
    id: "curriculo-linkedin",
    nome: "Currículo (PT/EN) + LinkedIn",
    resumo: "Currículo em português e inglês e perfil do LinkedIn atualizados com a Panvel e o mestrado.",
    area: "Carreira", status: "feito", prioridade: "media", progresso: 100,
    inicio: "2026-09-19", atualizado: "2026-09-26",
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/joaopedrodesouzapinto" },
      { label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/2026-09-25-curriculo-e-linkedin-en" },
    ],
  },
  {
    id: "decisao-carreira",
    nome: "Decisão de carreira AESC × Panvel",
    resumo: "Análise e negociação que resultou na mudança para a Panvel (Analista Dados/IA III, R$48/h, entrada 21/09).",
    area: "Carreira", status: "feito", prioridade: "alta", progresso: 100,
    inicio: "2026-09-04", atualizado: "2026-09-22",
    links: [{ label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/desfecho-panvel-48h-inicio-21set" }],
  },

  // ───────────────────────── ESTUDOS ─────────────────────────
  {
    id: "estudos-tecnicos",
    nome: "Estudos: Python, ML e dados",
    resumo: "Trilha de estudo contínua: ML Specialization, Google Data Analytics e AI Automation (fins de semana).",
    area: "Estudos", status: "progresso", prioridade: "media", progresso: 45,
    inicio: "2026-09-01", atualizado: "2026-09-26",
    proximaAcao: "Manter o ritmo de 2-3h/semana e avançar no ML Specialization.",
    stack: ["Python", "scikit-learn", "Google Data Analytics"],
    nota: "Crons de sábado: estudo AI Automation (9h) e ML/Python (9h).",
  },
  {
    id: "antigravity-lab",
    nome: "Laboratório Antigravity (Google)",
    resumo: "Exploração do Google Antigravity (agy CLI), contexto importado e comparação com o Hermes.",
    area: "Estudos", status: "analise", prioridade: "baixa", progresso: 50,
    inicio: "2026-09-25", atualizado: "2026-09-25",
    proximaAcao: "Rodar o primeiro brief no Antigravity aplicado ao mission-control e comparar o resultado.",
    links: [{ label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/2026-09-25-brief-antigravity-mission-control" }],
    stack: ["Antigravity", "agy CLI"],
  },

  // ───────────────────────── FINANÇAS & VIDA ─────────────────────────
  {
    id: "financas-pessoais",
    nome: "Finanças pessoais",
    resumo: "Planilha de orçamento + coleta automática de extratos e faturas, com diagnóstico de gastos e metas.",
    area: "Vida", status: "progresso", prioridade: "alta", progresso: 75,
    inicio: "2026-07", atualizado: "2026-09-21",
    proximaAcao: "Rodar a coleta mensal (dia 21) e revisar o orçamento contra o cenário real da Panvel.",
    links: [{ label: "Planilha", url: "https://docs.google.com/spreadsheets/d/1zhO542HgqYRDyXnZ3Cm7ztgJYAjwI5Zz2XT_vF_cZZ8" }],
    stack: ["Google Sheets", "Apps Script"],
    nota: "Cron 7c5ed61635e4 coleta extratos todo dia 21.",
  },
  {
    id: "imovel",
    nome: "Compra de imóvel (Cristal / MCMV)",
    resumo: "Análise de compra na planta (ISLA Zona Sul), custos de aquisição e simulações do MCMV.",
    area: "Vida", status: "feito", prioridade: "baixa", progresso: 100,
    inicio: "2026-09-16", atualizado: "2026-09-16",
    links: [{ label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/2026-09-16-decisao-esperar-2-anos-imovel" }],
    nota: "Decisão: seguir no aluguel e comprar em 2028-2029 (consórcio HS contempla em 2-3 anos).",
  },
  {
    id: "plano-saude",
    nome: "Plano de saúde (Doctor Clin)",
    resumo: "Comparativo BEM GLOBAL × FLEX FAMÍLIA HOSPITALAR e simulação com/sem plano depois de sair da AESC.",
    area: "Vida", status: "feito", prioridade: "media", progresso: 100,
    inicio: "2026-09-22", atualizado: "2026-09-22",
    links: [{ label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/doctorclin-planos-pf-2026-09-22" }],
  },
  {
    id: "nova-fase",
    nome: "Nova fase: rotina e orçamento",
    resumo: "Reorganização da rotina, compras e orçamento depois da entrada na Panvel (lava-louças, faxina, mercado).",
    area: "Vida", status: "feito", prioridade: "baixa", progresso: 90,
    inicio: "2026-09-11", atualizado: "2026-09-15",
    links: [{ label: "Vault", url: "obsidian://open?vault=Hermes-Agent&file=Projects/nova-fase-rotina-compras-2026-09" }],
  },

  // ───────────────────────── BACKLOG / PORTFÓLIO ─────────────────────────
  {
    id: "portfolio-internacional",
    nome: "Portfólio PT+EN (internacional)",
    resumo: "Versão bilíngue do portfólio de dados/BI para freelancer internacional (Upwork/Contra) e vagas remotas.",
    area: "Conteudo", status: "backlog", prioridade: "media", progresso: 10,
    atualizado: "2026-09-01",
    proximaAcao: "Decidir se vira uma seção do chuvadedados.com ou um site separado em inglês.",
    stack: ["Next.js", "Vercel"],
  },
  {
    id: "cases-portfolio",
    nome: "Cases de portfólio de dados",
    resumo: "Cases que sustentam o portfólio: Olist (SQL), mercado de dados (Looker), previsão de match (ML) e Renner.",
    area: "Conteudo", status: "feito", prioridade: "baixa", progresso: 100,
    inicio: "2026-06", atualizado: "2026-08-16",
    links: [
      { label: "Olist", url: "https://github.com/jotazoz/analise-ecommerce-olist" },
      { label: "Mercado de dados", url: "https://github.com/jotazoz/dashboard-mercado-dados-bi" },
      { label: "Previsão match", url: "https://github.com/jotazoz/previsao-match-vagas" },
    ],
    stack: ["SQL", "Looker Studio", "ML"],
  },
  {
    id: "case-panvel-processo",
    nome: "Case Panvel (processo seletivo)",
    resumo: "Motor de previsão diarizada e metas realistas que sustentou a aprovação no processo da Panvel.",
    area: "Conteudo", status: "feito", prioridade: "media", progresso: 100,
    inicio: "2026-08", atualizado: "2026-09-03",
    links: [
      { label: "Site do case", url: "https://case-panvel-site.vercel.app" },
      { label: "Repo", url: "https://github.com/jotazoz/case-panvel" },
    ],
    stack: ["Python", "Forecast", "Vercel"],
  },
  {
    id: "painel-bi",
    nome: "Painel BI (AESC)",
    resumo: "Cérebro interno do trabalho de BI na AESC: kanban de chamados, formulário de feedback e casos 5W2H.",
    area: "Panvel", status: "arquivado", prioridade: "baixa", progresso: 100,
    inicio: "2026-08", atualizado: "2026-08-09",
    links: [{ label: "Repo", url: "https://github.com/jotazoz/painel-bi" }],
    stack: ["Next.js", "Google Sheets"],
    nota: "Arquivado ao sair da AESC — pode voltar como template de kanban de BI.",
  },
  {
    id: "devolucoes-farmacia",
    nome: "Devoluções Farmácia (AESC)",
    resumo: "Painel de BI de devoluções de medicamentos/materiais da farmácia do Hospital Santana.",
    area: "Panvel", status: "arquivado", prioridade: "baixa", progresso: 100,
    inicio: "2026-09-01", atualizado: "2026-09-01",
    stack: ["Power BI"],
    nota: "Arquivado ao sair da AESC.",
  },
];
