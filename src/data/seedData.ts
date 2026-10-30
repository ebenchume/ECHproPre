import {
  Empresa,
  ContaContabil,
  DiarioContabil,
  CabecalhoLancamento,
  Funcionario,
  FolhaSalario,
  SolicitacaoFerias,
  Beneficio,
  EventoeSocial,
  TransacaoBancaria,
  AuditoriaLog,
  NotificacaoAlerta,
  BackupStatus,
  OrcamentoDepartamento,
  LicencaInfo,
  ConfiguracaoBackupAuto,
} from '../types';

export const initialEmpresa: Empresa = {
  id: 1,
  nome: 'ECHpro Tecnologias & Gestão Integrada, Lda',
  nuit: '400192837',
  endereco: 'Av. Julius Nyerere, nº 1420, 4º Andar, Maputo',
  telefone: '+258 827473434',
  email: 'ebenchume@sapo.mz',
  moeda: 'MZN',
  activa: true,
  regimeTributario: 'Regime Geral (PGC-NIRF / IRPC 32%)',
};

export const initialLicenca: LicencaInfo = {
  chave: 'ECHPRO-2026-MZ98-SAPO-7434',
  status: 'activa',
  titular: 'Eng. E. Benchume (Direção Executiva & Contabilidade)',
  email: 'ebenchume@sapo.mz',
  telefone: '+258 827473434',
  tipo: 'Enterprise Vitalícia (Windows 10/11 & Cloud PGC-NIRF)',
  dataAtivacao: '2026-01-15',
  dataExpiracao: 'Vitalícia / Permanente',
  idDispositivo: 'HWID-WIN11-MZ-827473434-7B9F',
  assinaturaDigital: 'SHA256:7b9fe827473434ebenchumesapo2026mz98',
};


export const initialDiarios: DiarioContabil[] = [
  { idDiario: 1, codigoDiario: 'CX', nomeDiario: 'Diário de Caixa' },
  { idDiario: 2, codigoDiario: 'VD', nomeDiario: 'Diário de Vendas e Facturação' },
  { idDiario: 3, codigoDiario: 'CP', nomeDiario: 'Diário de Compras e Fornecedores' },
  { idDiario: 4, codigoDiario: 'OD', nomeDiario: 'Operações Diversas e Fecho' },
  { idDiario: 5, codigoDiario: 'FS', nomeDiario: 'Folha de Salários e Encargos' },
];

export const initialPlanoContas: ContaContabil[] = [
  // CLASSE 1
  { codigoConta: '1', designacao: 'Meios Financeiros Líquidos', tipoConta: 'I', naturezaPredominante: 'D', classe: 1, activa: true },
  { codigoConta: '1.1', designacao: 'Caixa', tipoConta: 'I', naturezaPredominante: 'D', classe: 1, activa: true },
  { codigoConta: '1.1.1', designacao: 'Caixa Geral - Meticais', tipoConta: 'A', naturezaPredominante: 'D', classe: 1, activa: true },
  { codigoConta: '1.1.2', designacao: 'Fundo Fixo de Caixa', tipoConta: 'A', naturezaPredominante: 'D', classe: 1, activa: true },
  { codigoConta: '1.2', designacao: 'Bancos', tipoConta: 'I', naturezaPredominante: 'D', classe: 1, activa: true },
  { codigoConta: '1.2.1', designacao: 'Depósitos à Ordem - Millennium BIM', tipoConta: 'A', naturezaPredominante: 'D', classe: 1, activa: true },
  { codigoConta: '1.2.2', designacao: 'Depósitos à Ordem - Standard Bank', tipoConta: 'A', naturezaPredominante: 'D', classe: 1, activa: true },
  { codigoConta: '1.2.3', designacao: 'Depósitos a Prazo', tipoConta: 'A', naturezaPredominante: 'D', classe: 1, activa: true },

  // CLASSE 2
  { codigoConta: '2', designacao: 'Contas a Receber e a Pagar', tipoConta: 'I', naturezaPredominante: 'D', classe: 2, activa: true },
  { codigoConta: '2.1', designacao: 'Clientes', tipoConta: 'I', naturezaPredominante: 'D', classe: 2, activa: true },
  { codigoConta: '2.1.1', designacao: 'Clientes Nacionais - C/C', tipoConta: 'A', naturezaPredominante: 'D', classe: 2, activa: true },
  { codigoConta: '2.1.2', designacao: 'Clientes Estrangeiros', tipoConta: 'A', naturezaPredominante: 'D', classe: 2, activa: true },
  { codigoConta: '2.2', designacao: 'Fornecedores', tipoConta: 'I', naturezaPredominante: 'C', classe: 2, activa: true },
  { codigoConta: '2.2.1', designacao: 'Fornecedores Nacionais - C/C', tipoConta: 'A', naturezaPredominante: 'C', classe: 2, activa: true },
  { codigoConta: '2.4', designacao: 'Estado e Entidades Públicas', tipoConta: 'I', naturezaPredominante: 'C', classe: 2, activa: true },
  { codigoConta: '2.4.3', designacao: 'Imposto sobre o Valor Acrescentado (IVA)', tipoConta: 'I', naturezaPredominante: 'D', classe: 2, activa: true },
  { codigoConta: '2.4.3.1', designacao: 'IVA - Suportado', tipoConta: 'A', naturezaPredominante: 'D', classe: 2, activa: true },
  { codigoConta: '2.4.3.2', designacao: 'IVA - Dedutível', tipoConta: 'A', naturezaPredominante: 'D', classe: 2, activa: true },
  { codigoConta: '2.4.3.3', designacao: 'IVA - Liquidado', tipoConta: 'A', naturezaPredominante: 'C', classe: 2, activa: true },
  { codigoConta: '2.4.3.4', designacao: 'IVA - Apuramento', tipoConta: 'A', naturezaPredominante: 'D', classe: 2, activa: true },
  { codigoConta: '2.4.5', designacao: 'Segurança Social (INSS 7% Total a Pagar)', tipoConta: 'A', naturezaPredominante: 'C', classe: 2, activa: true },
  { codigoConta: '2.4.6', designacao: 'Imposto sobre o Rendimento (IRPS / IRPC)', tipoConta: 'I', naturezaPredominante: 'C', classe: 2, activa: true },
  { codigoConta: '2.4.6.1', designacao: 'IRPS - Retenções na Fonte de Trabalhadores', tipoConta: 'A', naturezaPredominante: 'C', classe: 2, activa: true },
  { codigoConta: '2.4.6.2', designacao: 'IRPC - Estimativa / Pagamentos por Conta', tipoConta: 'A', naturezaPredominante: 'C', classe: 2, activa: true },
  { codigoConta: '2.6', designacao: 'Pessoal', tipoConta: 'I', naturezaPredominante: 'C', classe: 2, activa: true },
  { codigoConta: '2.6.1', designacao: 'Remunerações e Salários a Pagar', tipoConta: 'A', naturezaPredominante: 'C', classe: 2, activa: true },
  { codigoConta: '2.6.2', designacao: 'Adiantamentos a Pessoal', tipoConta: 'A', naturezaPredominante: 'D', classe: 2, activa: true },

  // CLASSE 3
  { codigoConta: '3', designacao: 'Inventários e Activos Biológicos', tipoConta: 'I', naturezaPredominante: 'D', classe: 3, activa: true },
  { codigoConta: '3.1', designacao: 'Matérias-Primas', tipoConta: 'A', naturezaPredominante: 'D', classe: 3, activa: true },
  { codigoConta: '3.2', designacao: 'Mercadorias para Venda', tipoConta: 'A', naturezaPredominante: 'D', classe: 3, activa: true },

  // CLASSE 4
  { codigoConta: '4', designacao: 'Investimentos de Capital', tipoConta: 'I', naturezaPredominante: 'D', classe: 4, activa: true },
  { codigoConta: '4.2', designacao: 'Activos Tangíveis (Equipamentos e Móveis)', tipoConta: 'A', naturezaPredominante: 'D', classe: 4, activa: true },
  { codigoConta: '4.3', designacao: 'Activos Intangíveis (Software e Licenças)', tipoConta: 'A', naturezaPredominante: 'D', classe: 4, activa: true },

  // CLASSE 5
  { codigoConta: '5', designacao: 'Capital Próprio e Reservas', tipoConta: 'I', naturezaPredominante: 'C', classe: 5, activa: true },
  { codigoConta: '5.1', designacao: 'Capital Social Realizado', tipoConta: 'A', naturezaPredominante: 'C', classe: 5, activa: true },
  { codigoConta: '5.2', designacao: 'Reservas Legais', tipoConta: 'A', naturezaPredominante: 'C', classe: 5, activa: true },
  { codigoConta: '5.9', designacao: 'Resultados Transitados', tipoConta: 'A', naturezaPredominante: 'C', classe: 5, activa: true },

  // CLASSE 6
  { codigoConta: '6', designacao: 'Gastos e Perdas', tipoConta: 'I', naturezaPredominante: 'D', classe: 6, activa: true },
  { codigoConta: '6.1', designacao: 'Custo das Mercadorias Vendidas e Consumidas (CMV)', tipoConta: 'A', naturezaPredominante: 'D', classe: 6, activa: true },
  { codigoConta: '6.2', designacao: 'Gastos com o Pessoal', tipoConta: 'I', naturezaPredominante: 'D', classe: 6, activa: true },
  { codigoConta: '6.2.1', designacao: 'Remunerações dos Órgãos Sociais / Gerência', tipoConta: 'A', naturezaPredominante: 'D', classe: 6, activa: true },
  { codigoConta: '6.2.2', designacao: 'Ordenados e Salários do Pessoal', tipoConta: 'A', naturezaPredominante: 'D', classe: 6, activa: true },
  { codigoConta: '6.2.3', designacao: 'Encargos sobre Remunerações (INSS Empresa 4%)', tipoConta: 'A', naturezaPredominante: 'D', classe: 6, activa: true },
  { codigoConta: '6.2.4', designacao: 'Benefícios e Prémios a Colaboradores', tipoConta: 'A', naturezaPredominante: 'D', classe: 6, activa: true },
  { codigoConta: '6.3', designacao: 'Fornecimentos e Serviços de Terceiros (FST)', tipoConta: 'A', naturezaPredominante: 'D', classe: 6, activa: true },
  { codigoConta: '6.5', designacao: 'Gastos de Depreciações e Amortizações', tipoConta: 'A', naturezaPredominante: 'D', classe: 6, activa: true },
  { codigoConta: '6.8', designacao: 'Outros Gastos e Perdas Operacionais', tipoConta: 'A', naturezaPredominante: 'D', classe: 6, activa: true },

  // CLASSE 7
  { codigoConta: '7', designacao: 'Rendimentos e Ganhos', tipoConta: 'I', naturezaPredominante: 'C', classe: 7, activa: true },
  { codigoConta: '7.1', designacao: 'Vendas de Mercadorias e Produtos', tipoConta: 'A', naturezaPredominante: 'C', classe: 7, activa: true },
  { codigoConta: '7.2', designacao: 'Prestações de Serviços Especializados', tipoConta: 'A', naturezaPredominante: 'C', classe: 7, activa: true },
  { codigoConta: '7.8', designacao: 'Outros Rendimentos e Ganhos Operacionais', tipoConta: 'A', naturezaPredominante: 'C', classe: 7, activa: true },
  { codigoConta: '7.9', designacao: 'Rendimentos Financeiros / Juros Bancários', tipoConta: 'A', naturezaPredominante: 'C', classe: 7, activa: true },

  // CLASSE 8
  { codigoConta: '8', designacao: 'Resultados', tipoConta: 'I', naturezaPredominante: 'C', classe: 8, activa: true },
  { codigoConta: '8.1', designacao: 'Resultados Operacionais', tipoConta: 'A', naturezaPredominante: 'C', classe: 8, activa: true },
  { codigoConta: '8.8', designacao: 'Imposto sobre o Rendimento do Exercício (IRPC)', tipoConta: 'A', naturezaPredominante: 'D', classe: 8, activa: true },
  { codigoConta: '8.9', designacao: 'Resultado Líquido do Exercício', tipoConta: 'A', naturezaPredominante: 'C', classe: 8, activa: true },
];

export const initialFuncionarios: Funcionario[] = [
  {
    id: 1,
    idEmpresa: 1,
    nome: 'Carlos Alberto Mondlane',
    nuit: '109283741',
    biNumero: '110293847561B',
    dataNascimento: '1985-04-12',
    dataAdmissao: '2021-02-01',
    cargo: 'Diretor Financeiro & Contabilista Chefe',
    departamento: 'Finanças e Contabilidade',
    salarioBase: 95000,
    numDependentes: 2,
    inssContribuinte: true,
    activo: true,
    email: 'carlos.mondlane@echpro.co.mz',
    telefone: '+258 84 111 2233',
    banco: 'Millennium BIM',
    ibanOuConta: 'MZ59000100000012345678901',
  },
  {
    id: 2,
    idEmpresa: 1,
    nome: 'Amina Zainab Patel',
    nuit: '108374920',
    biNumero: '100492817290A',
    dataNascimento: '1990-09-18',
    dataAdmissao: '2022-05-15',
    cargo: 'Gestora de Recursos Humanos & Compliance',
    departamento: 'Recursos Humanos',
    salarioBase: 72000,
    numDependentes: 1,
    inssContribuinte: true,
    activo: true,
    email: 'amina.patel@echpro.co.mz',
    telefone: '+258 82 222 3344',
    banco: 'Standard Bank',
    ibanOuConta: 'MZ59000200000098765432101',
  },
  {
    id: 3,
    idEmpresa: 1,
    nome: 'Fernando Manuel Sitoe',
    nuit: '107482910',
    biNumero: '120938475610C',
    dataNascimento: '1993-11-25',
    dataAdmissao: '2023-01-10',
    cargo: 'Engenheiro de Software Sénior',
    departamento: 'Tecnologia da Informação',
    salarioBase: 85000,
    numDependentes: 0,
    inssContribuinte: true,
    activo: true,
    email: 'fernando.sitoe@echpro.co.mz',
    telefone: '+258 84 333 4455',
    banco: 'Millennium BIM',
    ibanOuConta: 'MZ59000100000055443322101',
  },
  {
    id: 4,
    idEmpresa: 1,
    nome: 'Sara Esperança Macuácua',
    nuit: '106392819',
    biNumero: '109283746501D',
    dataNascimento: '1996-03-08',
    dataAdmissao: '2023-08-01',
    cargo: 'Assistente de Contabilidade e Tesouraria',
    departamento: 'Finanças e Contabilidade',
    salarioBase: 38000,
    numDependentes: 1,
    inssContribuinte: true,
    activo: true,
    email: 'sara.macuacua@echpro.co.mz',
    telefone: '+258 86 444 5566',
    banco: 'BCI',
    ibanOuConta: 'MZ59000300000077889900101',
  },
  {
    id: 5,
    idEmpresa: 1,
    nome: 'Jorge António Cossa',
    nuit: '105284918',
    biNumero: '119283746592E',
    dataNascimento: '1988-07-22',
    dataAdmissao: '2022-10-01',
    cargo: 'Coordenador Comercial e Vendas',
    departamento: 'Comercial',
    salarioBase: 65000,
    numDependentes: 3,
    inssContribuinte: true,
    activo: true,
    email: 'jorge.cossa@echpro.co.mz',
    telefone: '+258 84 555 6677',
    banco: 'Moza Banco',
    ibanOuConta: 'MZ59000400000011223344501',
  },
];

export const initialLancamentos: CabecalhoLancamento[] = [
  {
    idLancamento: 1,
    dataLancamento: '2026-10-05',
    numeroDocumento: 'FT-2026/089',
    idDiario: 2,
    descricaoGeral: 'Facturação de consultoria de sistemas ERP e suporte mensal',
    idEmpresa: 1,
    origem: 'manual',
    criadoEm: '2026-10-05 10:30:00',
    linhas: [
      { id: '1-1', codigoConta: '2.1.1', tipoMovimento: 'D', valor: 350000, historicoEspecifico: 'Cliente Mineira do Norte, SA' },
      { id: '1-2', codigoConta: '7.2', tipoMovimento: 'C', valor: 299145.30, historicoEspecifico: 'Prestações de Serviços de TI e Gestão' },
      { id: '1-3', codigoConta: '2.4.3.3', tipoMovimento: 'C', valor: 50854.70, historicoEspecifico: 'IVA Liquidado 17%' },
    ],
  },
  {
    idLancamento: 2,
    dataLancamento: '2026-10-10',
    numeroDocumento: 'REC-BIM-9821',
    idDiario: 1,
    descricaoGeral: 'Recebimento de cliente por transferência bancária Millennium BIM',
    idEmpresa: 1,
    origem: 'banco',
    criadoEm: '2026-10-10 14:15:00',
    linhas: [
      { id: '2-1', codigoConta: '1.2.1', tipoMovimento: 'D', valor: 350000, historicoEspecifico: 'Depósito na conta Millennium BIM' },
      { id: '2-2', codigoConta: '2.1.1', tipoMovimento: 'C', valor: 350000, historicoEspecifico: 'Regularização da FT-2026/089' },
    ],
  },
  {
    idLancamento: 3,
    dataLancamento: '2026-10-15',
    numeroDocumento: 'FAT-FORN-4410',
    idDiario: 3,
    descricaoGeral: 'Compra de licenças de cloud e servidores redundantes',
    idEmpresa: 1,
    origem: 'manual',
    criadoEm: '2026-10-15 09:20:00',
    linhas: [
      { id: '3-1', codigoConta: '6.3', tipoMovimento: 'D', valor: 65000, historicoEspecifico: 'Infraestrutura de Servidores Cloud e Backup' },
      { id: '3-2', codigoConta: '2.4.3.2', tipoMovimento: 'D', valor: 11050, historicoEspecifico: 'IVA Dedutível 17%' },
      { id: '3-3', codigoConta: '2.2.1', tipoMovimento: 'C', valor: 76050, historicoEspecifico: 'Fornecedor CloudTech Moçambique' },
    ],
  },
];

export const initialFolhas: FolhaSalario[] = [
  {
    id: 1,
    idEmpresa: 1,
    ano: 2026,
    mes: 9,
    estado: 'contabilizada',
    dataProcessamento: '2026-09-28 17:00:00',
    observacoes: 'Folha de Setembro/2026 regular processada e integrada na contabilidade',
    lancamentoId: 4,
    linhas: [
      {
        id: 101,
        idFuncionario: 1,
        funcionarioNome: 'Carlos Alberto Mondlane',
        cargo: 'Diretor Financeiro & Contabilista Chefe',
        departamento: 'Finanças e Contabilidade',
        salarioBase: 95000,
        subsidioAlimentacao: 5000,
        subsidioTransporte: 3500,
        outrosSubsidios: 0,
        horasExtrasValor: 0,
        descontosOutros: 0,
        faltasValor: 0,
        inssTrabalhador: 3105,
        inssEmpresa: 4140,
        irps: 21320,
        liquido: 79075,
      },
      {
        id: 102,
        idFuncionario: 2,
        funcionarioNome: 'Amina Zainab Patel',
        cargo: 'Gestora de Recursos Humanos & Compliance',
        departamento: 'Recursos Humanos',
        salarioBase: 72000,
        subsidioAlimentacao: 4500,
        subsidioTransporte: 3000,
        outrosSubsidios: 0,
        horasExtrasValor: 0,
        descontosOutros: 0,
        faltasValor: 0,
        inssTrabalhador: 2385,
        inssEmpresa: 3180,
        irps: 13850,
        liquido: 63265,
      },
      {
        id: 103,
        idFuncionario: 3,
        funcionarioNome: 'Fernando Manuel Sitoe',
        cargo: 'Engenheiro de Software Sénior',
        departamento: 'Tecnologia da Informação',
        salarioBase: 85000,
        subsidioAlimentacao: 5000,
        subsidioTransporte: 3500,
        outrosSubsidios: 0,
        horasExtrasValor: 4200,
        descontosOutros: 0,
        faltasValor: 0,
        inssTrabalhador: 2931,
        inssEmpresa: 3908,
        irps: 19450,
        liquido: 70319,
      },
      {
        id: 104,
        idFuncionario: 4,
        funcionarioNome: 'Sara Esperança Macuácua',
        cargo: 'Assistente de Contabilidade e Tesouraria',
        departamento: 'Finanças e Contabilidade',
        salarioBase: 38000,
        subsidioAlimentacao: 4000,
        subsidioTransporte: 2500,
        outrosSubsidios: 0,
        horasExtrasValor: 0,
        descontosOutros: 0,
        faltasValor: 0,
        inssTrabalhador: 1335,
        inssEmpresa: 1780,
        irps: 3450,
        liquido: 39715,
      },
      {
        id: 105,
        idFuncionario: 5,
        funcionarioNome: 'Jorge António Cossa',
        cargo: 'Coordenador Comercial e Vendas',
        departamento: 'Comercial',
        salarioBase: 65000,
        subsidioAlimentacao: 4500,
        subsidioTransporte: 3000,
        outrosSubsidios: 5000,
        horasExtrasValor: 0,
        descontosOutros: 0,
        faltasValor: 0,
        inssTrabalhador: 2325,
        inssEmpresa: 3100,
        irps: 10850,
        liquido: 64325,
      },
    ],
  },
];

export const initialFerias: SolicitacaoFerias[] = [
  {
    id: 'FER-2026-001',
    idFuncionario: 2,
    funcionarioNome: 'Amina Zainab Patel',
    departamento: 'Recursos Humanos',
    dataInicio: '2026-11-10',
    dataFim: '2026-11-25',
    diasTotais: 15,
    abonoPecuniario: false,
    status: 'aprovado',
    dataSolicitacao: '2026-10-15',
    aprovadoPor: 'Carlos Alberto Mondlane',
    motivo: 'Férias regulares anuais',
    valorSubsidioFerias: 36000,
  },
  {
    id: 'FER-2026-002',
    idFuncionario: 4,
    funcionarioNome: 'Sara Esperança Macuácua',
    departamento: 'Finanças e Contabilidade',
    dataInicio: '2026-12-01',
    dataFim: '2026-12-15',
    diasTotais: 14,
    abonoPecuniario: true,
    status: 'pendente',
    dataSolicitacao: '2026-10-22',
    motivo: 'Descanso de fim de ano',
    valorSubsidioFerias: 19000,
  },
  {
    id: 'FER-2026-003',
    idFuncionario: 3,
    funcionarioNome: 'Fernando Manuel Sitoe',
    departamento: 'Tecnologia da Informação',
    dataInicio: '2026-12-18',
    dataFim: '2027-01-05',
    diasTotais: 18,
    abonoPecuniario: false,
    status: 'pendente',
    dataSolicitacao: '2026-10-25',
    motivo: 'Recesso de festas',
    valorSubsidioFerias: 51000,
  },
];

export const initialBeneficios: Beneficio[] = [
  {
    id: 'BEN-001',
    idFuncionario: 1,
    funcionarioNome: 'Carlos Alberto Mondlane',
    tipo: 'saude',
    nomeBeneficio: 'Plano de Saúde Executivo Platinum (Medis)',
    custoEmpresa: 6500,
    descontoColaborador: 0,
    activo: true,
    dataInicio: '2021-02-01',
  },
  {
    id: 'BEN-002',
    idFuncionario: 1,
    funcionarioNome: 'Carlos Alberto Mondlane',
    tipo: 'previdencia',
    nomeBeneficio: 'Fundo de Pensões Complementar Privado (5%)',
    custoEmpresa: 4750,
    descontoColaborador: 4750,
    activo: true,
    dataInicio: '2021-06-01',
  },
  {
    id: 'BEN-003',
    idFuncionario: 2,
    funcionarioNome: 'Amina Zainab Patel',
    tipo: 'saude',
    nomeBeneficio: 'Plano de Saúde Gold Familiar',
    custoEmpresa: 4800,
    descontoColaborador: 500,
    activo: true,
    dataInicio: '2022-05-15',
  },
  {
    id: 'BEN-004',
    idFuncionario: 3,
    funcionarioNome: 'Fernando Manuel Sitoe',
    tipo: 'seguro_vida',
    nomeBeneficio: 'Seguro de Vida e Invalidez E&Y 50x',
    custoEmpresa: 1200,
    descontoColaborador: 0,
    activo: true,
    dataInicio: '2023-01-10',
  },
  {
    id: 'BEN-005',
    idFuncionario: 4,
    funcionarioNome: 'Sara Esperança Macuácua',
    tipo: 'saude',
    nomeBeneficio: 'Plano de Saúde Básico Care',
    custoEmpresa: 2800,
    descontoColaborador: 300,
    activo: true,
    dataInicio: '2023-08-01',
  },
];

export const initialESocialEventos: EventoeSocial[] = [
  {
    id: 'ESO-001',
    codigoEvento: 'S-1000',
    nomeEvento: 'Informações do Empregador e Tabela de Lotações',
    periodoReferencia: '2026-01',
    dataGeracao: '2026-01-15 08:30:00',
    dataTransmissao: '2026-01-15 09:12:44',
    protocolo: '1.2.202601.00000000001928374',
    status: 'transmitido',
    resumo: 'Cadastramento geral da entidade patronal, alíquotas RAT/FAP e dados fiscais',
    xmlPayload: `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.pt/schema/evt/evtInfoEmpregador/v_S_01_02_00">
  <evtInfoEmpregador id="ID1400192837000002026011508300000001">
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>400192837</nrInsc>
    </ideEmpregador>
    <infoEmpregador>
      <inclusao>
        <idePeriodo>
          <iniValid>2026-01</iniValid>
        </idePeriodo>
        <infoCadastro>
          <nmRazao>ECHpro Tecnologias & Gestão Integrada, Lda</nmRazao>
          <classTrib>14</classTrib>
          <natJuridica>2062</natJuridica>
          <indCoop>0</indCoop>
          <indConstr>0</indConstr>
        </infoCadastro>
      </inclusao>
    </infoEmpregador>
  </evtInfoEmpregador>
</eSocial>`,
  },
  {
    id: 'ESO-002',
    codigoEvento: 'S-2200',
    nomeEvento: 'Cadastramento Inicial do Vínculo e Admissão',
    periodoReferencia: '2026-09',
    dataGeracao: '2026-09-20 11:00:00',
    dataTransmissao: '2026-09-20 11:25:10',
    protocolo: '1.2.202609.00000000005510293',
    status: 'transmitido',
    resumo: 'Admissão e registo formal de novos colaboradores na estrutura de cargos',
    xmlPayload: `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.pt/schema/evt/evtAdmissao/v_S_01_02_00">
  <evtAdmissao id="ID1400192837000002026092011000000002">
    <ideEmpregador>
      <nrInsc>400192837</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>107482910</cpfTrab>
      <nmTrab>Fernando Manuel Sitoe</nmTrab>
    </trabalhador>
    <vinculo>
      <matricula>MAT-003</matricula>
      <tpRegTrab>1</tpRegTrab>
      <tpRegPrev>1</tpRegPrev>
      <dataAdm>2023-01-10</dataAdm>
      <remuneracao>
        <vrSalFx>85000.00</vrSalFx>
        <undSalFixo>7</undSalFixo>
      </remuneracao>
    </vinculo>
  </evtAdmissao>
</eSocial>`,
  },
  {
    id: 'ESO-003',
    codigoEvento: 'S-1200',
    nomeEvento: 'Remuneração de Trabalhador vinculado ao RGPS / INSS',
    periodoReferencia: '2026-09',
    dataGeracao: '2026-09-29 18:00:00',
    dataTransmissao: '2026-09-30 08:45:19',
    protocolo: '1.2.202609.00000000009948210',
    status: 'transmitido',
    resumo: 'Folha de salários consolidada referente ao mês de Setembro de 2026',
    xmlPayload: `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.pt/schema/evt/evtRemun/v_S_01_02_00">
  <evtRemun id="ID1400192837000002026092918000000003">
    <idePeriodo>
      <perApur>2026-09</perApur>
    </idePeriodo>
    <infoRemunPerApur>
      <vrSalarioBaseTotal>355000.00</vrSalarioBaseTotal>
      <vrInssTotalTrabalhador>12081.00</vrInssTotalTrabalhador>
      <vrInssTotalPatronal>14048.00</vrInssTotalPatronal>
      <vrIrpsTotalRetido>68920.00</vrIrpsTotalRetido>
    </infoRemunPerApur>
  </evtRemun>
</eSocial>`,
  },
  {
    id: 'ESO-004',
    codigoEvento: 'S-1210',
    nomeEvento: 'Pagamentos de Rendimentos do Trabalho (IRRF / IRPS)',
    periodoReferencia: '2026-10',
    dataGeracao: '2026-10-25 14:00:00',
    status: 'validado',
    resumo: 'Demonstrativo de quitação financeira de salários de Outubro com retenções',
    xmlPayload: `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.pt/schema/evt/evtPgtos/v_S_01_02_00">
  <evtPgtos id="ID1400192837000002026102514000000004">
    <idePeriodo>
      <perApur>2026-10</perApur>
    </idePeriodo>
    <infoPgto>
      <dtPgto>2026-10-31</dtPgto>
      <tpPgto>1</tpPgto>
      <statusIntegracaoBancaria>Pronto para envio</statusIntegracaoBancaria>
    </infoPgto>
  </evtPgtos>
</eSocial>`,
  },
];

export const initialTransacoesBancarias: TransacaoBancaria[] = [
  {
    id: 'TXN-BIM-001',
    idContaBancaria: '1.2.1',
    bancoNome: 'Millennium BIM',
    data: '2026-10-10',
    descricao: 'TRF RECEBIDA - CLIENTE MINEIRA DO NORTE SA',
    tipo: 'credito',
    valor: 350000,
    categoria: 'Recebimento de Clientes',
    conciliado: true,
    idLancamentoAssociado: 2,
    numeroDocumento: 'REC-BIM-9821',
  },
  {
    id: 'TXN-BIM-002',
    idContaBancaria: '1.2.1',
    bancoNome: 'Millennium BIM',
    data: '2026-10-16',
    descricao: 'TRF EMITIDA - CLOUDTECH INFRAESTRUTURA CLOUD',
    tipo: 'debito',
    valor: 76050,
    categoria: 'Fornecedores e TI',
    conciliado: true,
    idLancamentoAssociado: 3,
    numeroDocumento: 'FAT-FORN-4410',
  },
  {
    id: 'TXN-BIM-003',
    idContaBancaria: '1.2.1',
    bancoNome: 'Millennium BIM',
    data: '2026-10-24',
    descricao: 'TRF RECEBIDA - ENGENHARIA & MINERAIS LIMITADA',
    tipo: 'credito',
    valor: 185000,
    categoria: 'Recebimento de Clientes',
    conciliado: false,
    numeroDocumento: 'FT-2026/092',
  },
  {
    id: 'TXN-BIM-004',
    idContaBancaria: '1.2.1',
    bancoNome: 'Millennium BIM',
    data: '2026-10-27',
    descricao: 'DEBITO DIRECTO - VODACOM INTERNET DEDICADA FIBRA',
    tipo: 'debito',
    valor: 18500,
    categoria: 'Telecomunicações / FST',
    conciliado: false,
    numeroDocumento: 'VD-FIB-1092',
  },
  {
    id: 'TXN-STB-001',
    idContaBancaria: '1.2.2',
    bancoNome: 'Standard Bank',
    data: '2026-10-28',
    descricao: 'TRF RECEBIDA - CONTRATO ANUAL PORTOS E CAMINHOS DE FERRO',
    tipo: 'credito',
    valor: 420000,
    categoria: 'Prestações de Serviços',
    conciliado: false,
    numeroDocumento: 'FT-2026/095',
  },
];

export const initialAuditoria: AuditoriaLog[] = [
  {
    id: 'LOG-001',
    dataHora: '2026-10-29 07:15:20',
    usuario: 'carlos.mondlane (Diretor Financeiro)',
    modulo: 'Segurança',
    acao: 'Login com Autenticação de 2 Fatores (2FA)',
    detalhes: 'Sessão iniciada com sucesso via TOTP Authenticator com chave encriptada',
    ip: '197.235.12.84',
    hashIntegridade: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'LOG-002',
    dataHora: '2026-10-28 16:40:11',
    usuario: 'amina.patel (RH)',
    modulo: 'Férias & Benefícios',
    acao: 'Aprovação de Pedido de Férias',
    detalhes: 'Aprovadas as férias da colaboradora Amina Zainab Patel para 15 dias',
    ip: '197.235.12.84',
    hashIntegridade: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
  },
  {
    id: 'LOG-003',
    dataHora: '2026-10-25 14:10:05',
    usuario: 'amina.patel (RH)',
    modulo: 'eSocial / Fiscal',
    acao: 'Validação de Evento S-1210',
    detalhes: 'Geração e validação de schema XML do evento S-1210 Pagamentos com sucesso',
    ip: '197.235.12.84',
    hashIntegridade: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  },
  {
    id: 'LOG-004',
    dataHora: '2026-10-20 18:05:42',
    usuario: 'carlos.mondlane (Diretor Financeiro)',
    modulo: 'Contabilidade',
    acao: 'Integração de Folha na Contabilidade',
    detalhes: 'Lançamento automático de Folha gerado no Diário FS com validação de partidas dobradas',
    ip: '197.235.12.84',
    hashIntegridade: '1f82c949826bc598972ca34063df4e747c3e1e23f114c9f13674643f80c657a8',
  },
];

export const initialNotificacoes: NotificacaoAlerta[] = [
  {
    id: 'NOT-001',
    titulo: 'Vencimento de Guia INSS (7%)',
    mensagem: 'A remessa mensal de INSS (Trabalhador 3% + Empresa 4%) vence no dia 10 do próximo mês. Prepare o mapa de apuramento.',
    data: '2026-10-29 07:00:00',
    tipo: 'critico',
    lida: false,
    linkAcao: 'folha',
  },
  {
    id: 'NOT-002',
    titulo: 'Transações Bancárias Pendentes de Conciliação',
    mensagem: 'Existem 3 novas transações via API do Millennium BIM e Standard Bank aguardando validação de conciliação automática.',
    data: '2026-10-28 17:30:00',
    tipo: 'aviso',
    lida: false,
    linkAcao: 'bancos',
  },
  {
    id: 'NOT-003',
    titulo: 'Solicitações de Férias a Aguardar Parecer',
    mensagem: '2 colaboradores submeteram planos de férias para o período de festas de Dezembro/Janeiro.',
    data: '2026-10-28 12:00:00',
    tipo: 'info',
    lida: false,
    linkAcao: 'ferias',
  },
  {
    id: 'NOT-004',
    titulo: 'Backup em Nuvem Redundante Concluído',
    mensagem: 'Snapshot criptográfico dos dados financeiros e cadastrais foi replicado para o servidor seguro em Frankfurt com SHA-256 verificado.',
    data: '2026-10-29 02:00:00',
    tipo: 'sucesso',
    lida: true,
    linkAcao: 'auditoria',
  },
];

export const initialBackups: BackupStatus[] = [
  {
    id: 'BKP-20261029-01',
    dataHora: '2026-10-29 02:00:15',
    tipo: 'nuvem_redundante',
    tamanho: '24.8 MB',
    status: 'sincronizado',
    hashVerificacao: '7d4a138bb3c2f0f81d89e49129e924a4f8d9c612',
    servidorRegiao: 'Frankfurt (AWS EU-Central-1 Redundant)',
  },
  {
    id: 'BKP-20261028-01',
    dataHora: '2026-10-28 02:00:12',
    tipo: 'nuvem_redundante',
    tamanho: '24.5 MB',
    status: 'sincronizado',
    hashVerificacao: '3a18e001b9f71c4d92a10d9a6c71e84a51b2c451',
    servidorRegiao: 'Frankfurt (AWS EU-Central-1 Redundant)',
  },
  {
    id: 'BKP-20261027-01',
    dataHora: '2026-10-27 18:30:00',
    tipo: 'local_encriptado',
    tamanho: '24.2 MB',
    status: 'sucesso',
    hashVerificacao: '9c52b1239aa8e3d002f54a8b1234c9e782a10bf9',
    servidorRegiao: 'Cofre Local Encriptado (AES-256-GCM)',
  },
];

export const initialOrcamentos: OrcamentoDepartamento[] = [
  {
    departamento: 'Finanças e Contabilidade',
    limiteMensal: 150000,
    ano: 2026,
    mes: 10,
    observacoes: 'Inclui ordenados chefe, tesouraria e softwares de auditoria',
  },
  {
    departamento: 'Recursos Humanos',
    limiteMensal: 95000,
    ano: 2026,
    mes: 10,
    observacoes: 'Gestão de pessoal, admissões e benefícios',
  },
  {
    departamento: 'Tecnologia da Informação',
    limiteMensal: 170000,
    ano: 2026,
    mes: 10,
    observacoes: 'Engenharia de software, servidores cloud e licenças',
  },
  {
    departamento: 'Comercial',
    limiteMensal: 80000,
    ano: 2026,
    mes: 10,
    observacoes: 'Coordenação comercial, prospecção e comissões',
  },
  {
    departamento: 'Operações',
    limiteMensal: 60000,
    ano: 2026,
    mes: 10,
    observacoes: 'Logística de escritório, suprimentos e serviços gerais',
  },
];

export const initialConfigBackupAuto: ConfiguracaoBackupAuto = {
  ativo: true,
  intervaloMinutos: 60,
  formatoPadrao: 'ambos',
  destino: 'ambos',
  ultimoBackup: '2026-10-29 02:00:15',
  proximaExecucao: 'Agendado periodicamente',
  manterHistoricoMax: 30,
};


