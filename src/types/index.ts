export type NaturezaConta = 'D' | 'C';
export type TipoConta = 'A' | 'I'; // A = Analítica (Movimento), I = Integradora

export interface Empresa {
  id: number;
  nome: string;
  nuit: string; // NUIT (Moçambique) ou CNPJ
  endereco: string;
  telefone: string;
  email: string;
  moeda: 'MZN' | 'BRL' | 'EUR' | 'USD';
  activa: boolean;
  regimeTributario: string;
}

export interface ContaContabil {
  codigoConta: string; // ex: '1.1.1', '6.2.2'
  designacao: string;
  tipoConta: TipoConta;
  naturezaPredominante: NaturezaConta;
  classe: number; // 1 a 8
  activa: boolean;
}

export interface DiarioContabil {
  idDiario: number;
  codigoDiario: 'CX' | 'VD' | 'CP' | 'OD' | 'FS';
  nomeDiario: string;
}

export interface LinhaLancamento {
  id: string;
  codigoConta: string;
  tipoMovimento: NaturezaConta; // 'D' ou 'C'
  valor: number;
  historicoEspecifico?: string;
}

export interface CabecalhoLancamento {
  idLancamento: number;
  dataLancamento: string;
  numeroDocumento: string;
  idDiario: number;
  descricaoGeral: string;
  idEmpresa: number;
  linhas: LinhaLancamento[];
  origem?: 'manual' | 'folha' | 'banco' | 'fecho';
  criadoEm: string;
}

export interface SaldoConta {
  codigoConta: string;
  designacao: string;
  tipoConta: TipoConta;
  naturezaPredominante: NaturezaConta;
  classe: number;
  totalDebito: number;
  totalCredito: number;
  saldoActual: number;
}

export interface Funcionario {
  id: number;
  idEmpresa: number;
  nome: string;
  nuit: string;
  biNumero: string;
  dataNascimento: string;
  dataAdmissao: string;
  dataCessacao?: string;
  cargo: string;
  departamento: string;
  salarioBase: number;
  numDependentes: number;
  inssContribuinte: boolean;
  activo: boolean;
  email: string;
  telefone: string;
  banco: string;
  ibanOuConta: string;
}

export interface FolhaLinhaItem {
  id: number;
  idFuncionario: number;
  funcionarioNome: string;
  cargo: string;
  departamento: string;
  salarioBase: number;
  subsidioAlimentacao: number;
  subsidioTransporte: number;
  outrosSubsidios: number;
  horasExtrasValor: number;
  descontosOutros: number;
  faltasValor: number;
  inssTrabalhador: number; // 3%
  inssEmpresa: number;     // 4%
  irps: number;            // Imposto Retido na Fonte
  liquido: number;
}

export interface FolhaSalario {
  id: number;
  idEmpresa: number;
  ano: number;
  mes: number; // 1 - 12
  estado: 'rascunho' | 'processada' | 'contabilizada' | 'paga';
  dataProcessamento?: string;
  observacoes?: string;
  lancamentoId?: number;
  linhas: FolhaLinhaItem[];
}

export interface SolicitacaoFerias {
  id: string;
  idFuncionario: number;
  funcionarioNome: string;
  departamento: string;
  dataInicio: string;
  dataFim: string;
  diasTotais: number;
  abonoPecuniario: boolean;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'concluido';
  dataSolicitacao: string;
  aprovadoPor?: string;
  motivo?: string;
  valorSubsidioFerias: number;
}

export interface Beneficio {
  id: string;
  idFuncionario: number;
  funcionarioNome: string;
  tipo: 'saude' | 'alimentacao' | 'transporte' | 'seguro_vida' | 'creche' | 'previdencia';
  nomeBeneficio: string;
  custoEmpresa: number;
  descontoColaborador: number;
  activo: boolean;
  dataInicio: string;
}

export interface EventoeSocial {
  id: string;
  codigoEvento: 'S-1000' | 'S-2200' | 'S-1200' | 'S-1210' | 'S-2230' | 'S-2299';
  nomeEvento: string;
  periodoReferencia: string;
  dataGeracao: string;
  dataTransmissao?: string;
  protocolo?: string;
  status: 'rascunho' | 'validado' | 'transmitido' | 'pendente_correcao';
  resumo: string;
  xmlPayload: string;
}

export interface TransacaoBancaria {
  id: string;
  idContaBancaria: string;
  bancoNome: string;
  data: string;
  descricao: string;
  tipo: 'credito' | 'debito';
  valor: number;
  categoria: string;
  conciliado: boolean;
  idLancamentoAssociado?: number;
  numeroDocumento?: string;
}

export interface AuditoriaLog {
  id: string;
  dataHora: string;
  usuario: string;
  modulo: 'Contabilidade' | 'Folha RH' | 'Férias & Benefícios' | 'eSocial / Fiscal' | 'Bancos' | 'Segurança' | 'Sistema';
  acao: string;
  detalhes: string;
  ip: string;
  hashIntegridade: string;
}

export interface NotificacaoAlerta {
  id: string;
  titulo: string;
  mensagem: string;
  data: string;
  tipo: 'critico' | 'aviso' | 'sucesso' | 'info';
  lida: boolean;
  linkAcao?: string;
}

export interface BackupStatus {
  id: string;
  dataHora: string;
  tipo: 'nuvem_redundante' | 'local_encriptado' | 'automatico_agendado';
  tamanho: string;
  status: 'sucesso' | 'sincronizado' | 'falha';
  hashVerificacao: string;
  servidorRegiao: string;
  origem?: 'manual' | 'automatico' | 'restauracao';
  formato?: 'json' | 'csv' | 'ambos' | 'completo';
  destino?: 'local' | 'nuvem' | 'ambos';
}

export interface ConfiguracaoBackupAuto {
  ativo: boolean;
  intervaloMinutos: number; // ex: 15, 60, 360, 1440
  formatoPadrao: 'json' | 'csv' | 'ambos';
  destino: 'local' | 'nuvem' | 'ambos';
  ultimoBackup?: string;
  proximaExecucao?: string;
  manterHistoricoMax: number;
}

export interface OrcamentoDepartamento {
  departamento: string;
  limiteMensal: number;
  ano: number;
  mes: number;
  observacoes?: string;
}

export interface LicencaInfo {
  chave: string;
  status: 'activa' | 'expirada' | 'pendente' | 'trial';
  titular: string;
  email: string;
  telefone: string;
  tipo: string;
  dataAtivacao: string;
  dataExpiracao: string;
  idDispositivo: string;
  assinaturaDigital: string;
}

export type PerfilUsuario =
  | 'administrador'
  | 'gerente_financeiro'
  | 'gerente_rh'
  | 'funcionario'
  | 'auditor';

export interface ContaUsuario {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  perfil: PerfilUsuario;
  departamento: string;
  senhaPredefinida: string;
  idFuncionarioAssociado?: number;
  doisFatoresVerificado: boolean;
  avatarCor: string;
  ultimoAcesso?: string;
  bloqueado?: boolean;
}



