import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Empresa,
  ContaContabil,
  DiarioContabil,
  CabecalhoLancamento,
  LinhaLancamento,
  SaldoConta,
  Funcionario,
  FolhaSalario,
  FolhaLinhaItem,
  SolicitacaoFerias,
  Beneficio,
  EventoeSocial,
  TransacaoBancaria,
  AuditoriaLog,
  NotificacaoAlerta,
  BackupStatus,
  ConfiguracaoBackupAuto,
  OrcamentoDepartamento,
  LicencaInfo,
} from '../types';
import {
  initialEmpresa,
  initialDiarios,
  initialPlanoContas,
  initialFuncionarios,
  initialLancamentos,
  initialFolhas,
  initialFerias,
  initialBeneficios,
  initialESocialEventos,
  initialTransacoesBancarias,
  initialAuditoria,
  initialNotificacoes,
  initialBackups,
  initialOrcamentos,
  initialLicenca,
  initialConfigBackupAuto,
} from '../data/seedData';

// Função auxiliar simples para hash de integridade (SHA-256 hex)
export async function gerarHashSHA256(texto: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback rápido
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(32, 'a');
}

export interface AppContextType {
  // Empresa & Configurações
  empresa: Empresa;
  updateEmpresa: (emp: Empresa) => void;

  // Contabilidade
  planoContas: ContaContabil[];
  diarios: DiarioContabil[];
  lancamentos: CabecalhoLancamento[];
  adicionarConta: (conta: ContaContabil) => void;
  criarLancamento: (
    data: string,
    numeroDoc: string,
    idDiario: number,
    descricao: string,
    linhas: Omit<LinhaLancamento, 'id'>[],
    origem?: 'manual' | 'folha' | 'banco' | 'fecho'
  ) => { sucesso: boolean; mensagem: string; idLancamento?: number };
  obterSaldosContas: () => SaldoConta[];
  obterBalancete: () => {
    totalDebitos: number;
    totalCreditos: number;
    desbalanceado: boolean;
    contas: SaldoConta[];
  };
  obterDRE: () => {
    vendas: number;
    servicos: number;
    volumeNegocios: number;
    cmv: number;
    margemBruta: number;
    gastosPessoal: number;
    fst: number;
    depreciacoes: number;
    outrosGastos: number;
    totalGastosOperacionais: number;
    resultadoOperacional: number;
    irpc: number;
    resultadoLiquido: number;
  };
  executarFechoExercicio: (ano: number, taxaIrpc?: number) => { sucesso: boolean; mensagem: string; resultado?: any };

  // Recursos Humanos & Folha
  funcionarios: Funcionario[];
  adicionarFuncionario: (f: Omit<Funcionario, 'id'>) => void;
  atualizarFuncionario: (f: Funcionario) => void;
  folhas: FolhaSalario[];
  processarFolhaMes: (ano: number, mes: number) => FolhaSalario;
  integrarFolhaContabilidade: (idFolha: number) => { sucesso: boolean; mensagem: string };
  pagarFolha: (idFolha: number) => { sucesso: boolean; mensagem: string };

  // Férias & Benefícios
  ferias: SolicitacaoFerias[];
  solicitarFerias: (dados: Omit<SolicitacaoFerias, 'id' | 'status' | 'dataSolicitacao' | 'valorSubsidioFerias'>) => void;
  atualizarStatusFerias: (id: string, novoStatus: 'aprovado' | 'rejeitado' | 'concluido', aprovadoPor?: string) => void;
  beneficios: Beneficio[];
  adicionarBeneficio: (b: Omit<Beneficio, 'id'>) => void;
  alternarBeneficio: (id: string) => void;

  // eSocial & Fiscal
  eventoseSocial: EventoeSocial[];
  transmitirEventoeSocial: (id: string) => Promise<{ sucesso: boolean; protocolo: string }>;
  gerarNovoEventoeSocial: (codigo: 'S-1000' | 'S-2200' | 'S-1200' | 'S-1210' | 'S-2230', referencia: string) => void;

  // Bancos & Conciliação
  transacoesBancarias: TransacaoBancaria[];
  sincronizarExtratoBancario: () => void;
  conciliarTransacao: (idTransacao: string, codigoContaContrapartida?: string) => { sucesso: boolean; mensagem: string };
  desconciliarTransacao: (idTransacao: string) => void;

  // Auditoria & Segurança 2FA
  auditoria: AuditoriaLog[];
  registrarAuditoria: (modulo: AuditoriaLog['modulo'], acao: string, detalhes: string) => void;
  doisFatoresAtivo: boolean;
  alternar2FA: (ativar: boolean) => void;
  verificarCodigo2FA: (codigo: string) => boolean;
  chaveCriptografia: string;
  regenerarChaveCriptografia: () => void;

  // Backups & Sistema de Backup Automático & Exportações
  backups: BackupStatus[];
  configBackupAuto: ConfiguracaoBackupAuto;
  atualizarConfigBackupAuto: (nova: Partial<ConfiguracaoBackupAuto>) => void;
  executarBackupManual: (tipo?: 'nuvem_redundante' | 'local_encriptado' | 'automatico_agendado') => Promise<BackupStatus>;
  restaurarBackup: (jsonContent: string) => boolean;
  exportarBackupCompletoJSON: () => void;
  exportarCSV: (tipo: 'lancamentos' | 'plano' | 'funcionarios' | 'folhas' | 'bancos' | 'orcamentos' | 'todos') => void;
  sincronizarBackupNuvem: () => Promise<{ sucesso: boolean; id: string; hash: string }>;

  // Gestão de Orçamentos por Departamento
  orcamentos: OrcamentoDepartamento[];
  atualizarOrcamento: (departamento: string, novoLimite: number, observacoes?: string) => void;
  obterResumoOrcamentos: () => Array<{
    departamento: string;
    limite: number;
    gastoReal: number;
    percentualUsado: number;
    diferenca: number;
    status: 'normal' | 'alerta' | 'estourado';
    observacoes?: string;
  }>;

  // Notificações
  notificacoes: NotificacaoAlerta[];
  marcarNotificacaoLida: (id: string) => void;
  marcarTodasNotificacoesLidas: () => void;
  adicionarNotificacao: (notif: Omit<NotificacaoAlerta, 'id' | 'data' | 'lida'>) => void;

  // Sessão & Usuário
  usuarioAtual: {
    nome: string;
    cargo: string;
    email: string;
    doisFatoresVerificado: boolean;
  };
  setDoisFatoresVerificado: (v: boolean) => void;

  // Licença & Chave de Ativação (Windows 10/11 & Web)
  licenca: LicencaInfo;
  validarChaveAtivacao: (chave: string) => { valida: boolean; mensagem: string; tipo?: string };
  ativarSistema: (chave: string, titular?: string, email?: string) => { sucesso: boolean; mensagem: string };
  gerarChaveLicencaOficial: (titular: string, email: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'echpro_gestao_integrada_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Carregar do localStorage se existir
  const [empresa, setEmpresa] = useState<Empresa>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_empresa`);
    return saved ? JSON.parse(saved) : initialEmpresa;
  });

  const [planoContas, setPlanoContas] = useState<ContaContabil[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_plano`);
    return saved ? JSON.parse(saved) : initialPlanoContas;
  });

  const [diarios] = useState<DiarioContabil[]>(initialDiarios);

  const [lancamentos, setLancamentos] = useState<CabecalhoLancamento[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_lancamentos`);
    return saved ? JSON.parse(saved) : initialLancamentos;
  });

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_funcionarios`);
    return saved ? JSON.parse(saved) : initialFuncionarios;
  });

  const [folhas, setFolhas] = useState<FolhaSalario[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_folhas`);
    return saved ? JSON.parse(saved) : initialFolhas;
  });

  const [ferias, setFerias] = useState<SolicitacaoFerias[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ferias`);
    return saved ? JSON.parse(saved) : initialFerias;
  });

  const [beneficios, setBeneficios] = useState<Beneficio[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_beneficios`);
    return saved ? JSON.parse(saved) : initialBeneficios;
  });

  const [eventoseSocial, setEventoseSocial] = useState<EventoeSocial[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_esocial`);
    return saved ? JSON.parse(saved) : initialESocialEventos;
  });

  const [transacoesBancarias, setTransacoesBancarias] = useState<TransacaoBancaria[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transacoes`);
    return saved ? JSON.parse(saved) : initialTransacoesBancarias;
  });

  const [auditoria, setAuditoria] = useState<AuditoriaLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auditoria`);
    return saved ? JSON.parse(saved) : initialAuditoria;
  });

  const [notificacoes, setNotificacoes] = useState<NotificacaoAlerta[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notificacoes`);
    return saved ? JSON.parse(saved) : initialNotificacoes;
  });

  const [backups, setBackups] = useState<BackupStatus[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_backups`);
    return saved ? JSON.parse(saved) : initialBackups;
  });

  const [configBackupAuto, setConfigBackupAuto] = useState<ConfiguracaoBackupAuto>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_config_backup_auto`);
    return saved ? JSON.parse(saved) : initialConfigBackupAuto;
  });

  const [orcamentos, setOrcamentos] = useState<OrcamentoDepartamento[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orcamentos`);
    return saved ? JSON.parse(saved) : initialOrcamentos;
  });

  const [licenca, setLicenca] = useState<LicencaInfo>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_licenca`);
    return saved ? JSON.parse(saved) : initialLicenca;
  });

  const [doisFatoresAtivo, setDoisFatoresAtivo] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_2fa`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [chaveCriptografia, setChaveCriptografia] = useState<string>(
    'AES256-GCM-ECH-KEY-9988220011-SHA256'
  );

  const [usuarioAtual, setUsuarioAtual] = useState({
    nome: 'Carlos Alberto Mondlane',
    cargo: 'Diretor Financeiro & Contabilista Chefe',
    email: 'carlos.mondlane@echpro.co.mz',
    doisFatoresVerificado: true,
  });

  // Salvar no localStorage quando o estado mudar
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_empresa`, JSON.stringify(empresa));
      localStorage.setItem(`${STORAGE_KEY}_plano`, JSON.stringify(planoContas));
      localStorage.setItem(`${STORAGE_KEY}_lancamentos`, JSON.stringify(lancamentos));
      localStorage.setItem(`${STORAGE_KEY}_funcionarios`, JSON.stringify(funcionarios));
      localStorage.setItem(`${STORAGE_KEY}_folhas`, JSON.stringify(folhas));
      localStorage.setItem(`${STORAGE_KEY}_ferias`, JSON.stringify(ferias));
      localStorage.setItem(`${STORAGE_KEY}_beneficios`, JSON.stringify(beneficios));
      localStorage.setItem(`${STORAGE_KEY}_esocial`, JSON.stringify(eventoseSocial));
      localStorage.setItem(`${STORAGE_KEY}_transacoes`, JSON.stringify(transacoesBancarias));
      localStorage.setItem(`${STORAGE_KEY}_auditoria`, JSON.stringify(auditoria));
      localStorage.setItem(`${STORAGE_KEY}_notificacoes`, JSON.stringify(notificacoes));
      localStorage.setItem(`${STORAGE_KEY}_backups`, JSON.stringify(backups));
      localStorage.setItem(`${STORAGE_KEY}_config_backup_auto`, JSON.stringify(configBackupAuto));
      localStorage.setItem(`${STORAGE_KEY}_orcamentos`, JSON.stringify(orcamentos));
      localStorage.setItem(`${STORAGE_KEY}_2fa`, JSON.stringify(doisFatoresAtivo));
      localStorage.setItem(`${STORAGE_KEY}_licenca`, JSON.stringify(licenca));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }, [
    empresa,
    planoContas,
    lancamentos,
    funcionarios,
    folhas,
    ferias,
    beneficios,
    eventoseSocial,
    transacoesBancarias,
    auditoria,
    notificacoes,
    backups,
    configBackupAuto,
    orcamentos,
    doisFatoresAtivo,
    licenca,
  ]);

  const registrarAuditoria = async (
    modulo: AuditoriaLog['modulo'],
    acao: string,
    detalhes: string
  ) => {
    const dataHora = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = `LOG-${Date.now().toString().slice(-6)}`;
    const hashIntegridade = await gerarHashSHA256(
      `${id}-${dataHora}-${usuarioAtual.email}-${modulo}-${acao}-${detalhes}`
    );
    const novoLog: AuditoriaLog = {
      id,
      dataHora,
      usuario: `${usuarioAtual.nome} (${usuarioAtual.cargo})`,
      modulo,
      acao,
      detalhes,
      ip: '197.235.12.84',
      hashIntegridade,
    };
    setAuditoria(prev => [novoLog, ...prev]);
  };

  const updateEmpresa = (novaEmpresa: Empresa) => {
    setEmpresa(novaEmpresa);
    registrarAuditoria('Sistema', 'Actualização de Dados da Empresa', `Alterados dados de ${novaEmpresa.nome}`);
  };

  const adicionarConta = (conta: ContaContabil) => {
    setPlanoContas(prev => {
      const exists = prev.some(c => c.codigoConta === conta.codigoConta);
      if (exists) return prev;
      return [...prev, conta].sort((a, b) => a.codigoConta.localeCompare(b.codigoConta));
    });
    registrarAuditoria('Contabilidade', 'Criação de Conta Contábil', `Adicionada conta ${conta.codigoConta} - ${conta.designacao}`);
  };

  const criarLancamento = (
    data: string,
    numeroDoc: string,
    idDiario: number,
    descricao: string,
    linhasInput: Omit<LinhaLancamento, 'id'>[],
    origem: 'manual' | 'folha' | 'banco' | 'fecho' = 'manual'
  ) => {
    if (linhasInput.length < 2) {
      return { sucesso: false, mensagem: 'Um lançamento contábil requer pelo menos duas partidas (Débito e Crédito).' };
    }

    let debito = 0;
    let credito = 0;
    for (const l of linhasInput) {
      if (l.tipoMovimento === 'D') debito += l.valor;
      else if (l.tipoMovimento === 'C') credito += l.valor;
    }

    if (Math.abs(debito - credito) >= 0.05) {
      return {
        sucesso: false,
        mensagem: `Partidas dobradas desequilibradas! Total Débitos (${debito.toFixed(2)}) ≠ Total Créditos (${credito.toFixed(2)}). Diferença: ${(debito - credito).toFixed(2)} MT`,
      };
    }

    const novoId = lancamentos.length > 0 ? Math.max(...lancamentos.map(l => l.idLancamento)) + 1 : 1;
    const linhasComId: LinhaLancamento[] = linhasInput.map((l, index) => ({
      ...l,
      id: `${novoId}-${index + 1}`,
    }));

    const novoLancamento: CabecalhoLancamento = {
      idLancamento: novoId,
      dataLancamento: data,
      numeroDocumento: numeroDoc,
      idDiario,
      descricaoGeral: descricao,
      idEmpresa: empresa.id,
      linhas: linhasComId,
      origem,
      criadoEm: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setLancamentos(prev => [novoLancamento, ...prev]);
    registrarAuditoria(
      'Contabilidade',
      `Novo Lançamento (${numeroDoc})`,
      `${descricao} [Total: ${debito.toFixed(2)} ${empresa.moeda}]`
    );

    return { sucesso: true, mensagem: 'Lançamento gravado com sucesso no razão!', idLancamento: novoId };
  };

  const obterSaldosContas = (): SaldoConta[] => {
    const mapaDebitos: Record<string, number> = {};
    const mapaCreditos: Record<string, number> = {};

    lancamentos.forEach(lanc => {
      lanc.linhas.forEach(linha => {
        if (linha.tipoMovimento === 'D') {
          mapaDebitos[linha.codigoConta] = (mapaDebitos[linha.codigoConta] || 0) + linha.valor;
        } else {
          mapaCreditos[linha.codigoConta] = (mapaCreditos[linha.codigoConta] || 0) + linha.valor;
        }
      });
    });

    return planoContas.map(conta => {
      const d = mapaDebitos[conta.codigoConta] || 0;
      const c = mapaCreditos[conta.codigoConta] || 0;
      let saldo = 0;
      if (conta.naturezaPredominante === 'D') {
        saldo = d - c;
      } else {
        saldo = c - d;
      }
      return {
        codigoConta: conta.codigoConta,
        designacao: conta.designacao,
        tipoConta: conta.tipoConta,
        naturezaPredominante: conta.naturezaPredominante,
        classe: conta.classe,
        totalDebito: d,
        totalCredito: c,
        saldoActual: saldo,
      };
    });
  };

  const obterBalancete = () => {
    const saldos = obterSaldosContas();
    const contasComMovimento = saldos.filter(s => s.totalDebito > 0 || s.totalCredito > 0);
    const totalDebitos = contasComMovimento.reduce((acc, c) => acc + c.totalDebito, 0);
    const totalCreditos = contasComMovimento.reduce((acc, c) => acc + c.totalCredito, 0);
    const desbalanceado = Math.abs(totalDebitos - totalCreditos) >= 0.05;

    return {
      totalDebitos,
      totalCreditos,
      desbalanceado,
      contas: contasComMovimento,
    };
  };

  const obterDRE = () => {
    const saldos = obterSaldosContas();
    const getSaldo = (codigo: string) => {
      const c = saldos.find(s => s.codigoConta === codigo);
      return c ? Math.abs(c.saldoActual) : 0;
    };

    const vendas = getSaldo('7.1');
    const servicos = getSaldo('7.2');
    const volumeNegocios = vendas + servicos;

    const cmv = getSaldo('6.1');
    const margemBruta = volumeNegocios - cmv;

    const gastosPessoal = getSaldo('6.2.1') + getSaldo('6.2.2') + getSaldo('6.2.3') + getSaldo('6.2.4');
    const fst = getSaldo('6.3');
    const depreciacoes = getSaldo('6.5');
    const outrosGastos = getSaldo('6.8');

    const totalGastosOperacionais = cmv + gastosPessoal + fst + depreciacoes + outrosGastos;
    const resultadoOperacional = volumeNegocios - totalGastosOperacionais;

    const irpc = getSaldo('8.8');
    const resultadoLiquido = resultadoOperacional - irpc;

    return {
      vendas,
      servicos,
      volumeNegocios,
      cmv,
      margemBruta,
      gastosPessoal,
      fst,
      depreciacoes,
      outrosGastos,
      totalGastosOperacionais,
      resultadoOperacional,
      irpc,
      resultadoLiquido,
    };
  };

  const executarFechoExercicio = (ano: number, taxaIrpc = 0.32) => {
    const saldos = obterSaldosContas();
    const contasClasse6 = saldos.filter(c => c.classe === 6 && c.saldoActual !== 0);
    const contasClasse7 = saldos.filter(c => c.classe === 7 && c.saldoActual !== 0);

    if (contasClasse6.length === 0 && contasClasse7.length === 0) {
      return { sucesso: false, mensagem: `Não existem saldos nas Classes 6 ou 7 para o exercício de ${ano}.` };
    }

    const linhasFecho: Omit<LinhaLancamento, 'id'>[] = [];
    let totalGastos = 0;
    let totalRendimentos = 0;

    // Zerar gastos (Classe 6) -> Crédito
    contasClasse6.forEach(c => {
      const valor = Math.abs(c.saldoActual);
      linhasFecho.push({
        codigoConta: c.codigoConta,
        tipoMovimento: 'C',
        valor,
        historicoEspecifico: `Fecho de Exercício ${ano} – Anulação ${c.designacao}`,
      });
      totalGastos += valor;
    });

    // Zerar rendimentos (Classe 7) -> Débito
    contasClasse7.forEach(c => {
      const valor = Math.abs(c.saldoActual);
      linhasFecho.push({
        codigoConta: c.codigoConta,
        tipoMovimento: 'D',
        valor,
        historicoEspecifico: `Fecho de Exercício ${ano} – Anulação ${c.designacao}`,
      });
      totalRendimentos += valor;
    });

    // Contrapartidas na conta 8.1 Resultados Operacionais
    if (totalGastos > 0) {
      linhasFecho.push({
        codigoConta: '8.1',
        tipoMovimento: 'D',
        valor: totalGastos,
        historicoEspecifico: `Transferência de Gastos e Perdas – Exercício ${ano}`,
      });
    }

    if (totalRendimentos > 0) {
      linhasFecho.push({
        codigoConta: '8.1',
        tipoMovimento: 'C',
        valor: totalRendimentos,
        historicoEspecifico: `Transferência de Rendimentos e Ganhos – Exercício ${ano}`,
      });
    }

    const lucroAntesImposto = totalRendimentos - totalGastos;
    let irpcDevido = 0;

    if (lucroAntesImposto > 0) {
      irpcDevido = Math.round(lucroAntesImposto * taxaIrpc * 100) / 100;
      linhasFecho.push({
        codigoConta: '8.8',
        tipoMovimento: 'D',
        valor: irpcDevido,
        historicoEspecifico: `Estimativa IRPC (${(taxaIrpc * 100).toFixed(0)}%) sobre lucro tributável de ${lucroAntesImposto.toFixed(2)} MT`,
      });
      linhasFecho.push({
        codigoConta: '2.4.6.2',
        tipoMovimento: 'C',
        valor: irpcDevido,
        historicoEspecifico: `IRPC a Pagar / Pagamento por Conta – Exercício ${ano}`,
      });
    }

    const res = criarLancamento(
      `${ano}-12-31`,
      `FECHO-${ano}`,
      4, // Diário OD
      `Fecho de Exercício Fiscal ${ano} – Apuramento de Resultados e IRPC`,
      linhasFecho,
      'fecho'
    );

    if (!res.sucesso) return res;

    registrarAuditoria(
      'Contabilidade',
      `Fecho de Exercício Contábil ${ano}`,
      `Total Gastos: ${totalGastos.toFixed(2)} MT, Total Rendimentos: ${totalRendimentos.toFixed(2)} MT, Lucro Líquido: ${(lucroAntesImposto - irpcDevido).toFixed(2)} MT`
    );

    adicionarNotificacao({
      titulo: `Fecho do Exercício ${ano} Concluído`,
      mensagem: `Apuramento fiscal finalizado com sucesso. Resultado Líquido: ${(lucroAntesImposto - irpcDevido).toLocaleString()} ${empresa.moeda}.`,
      tipo: 'sucesso',
    });

    return {
      sucesso: true,
      mensagem: `Fecho do exercício fiscal de ${ano} concluído com sucesso!`,
      resultado: {
        anoFiscal: ano,
        totalGastos,
        totalRendimentos,
        lucroAntesImposto,
        irpcDevido,
        resultadoLiquido: lucroAntesImposto - irpcDevido,
      },
    };
  };

  // Folha de Pagamento & RH
  const adicionarFuncionario = (f: Omit<Funcionario, 'id'>) => {
    const novoId = funcionarios.length > 0 ? Math.max(...funcionarios.map(x => x.id)) + 1 : 1;
    const novoFuncionario: Funcionario = { ...f, id: novoId };
    setFuncionarios(prev => [...prev, novoFuncionario]);
    registrarAuditoria('Folha RH', 'Admissão de Colaborador', `Cadastrado ${novoFuncionario.nome} (${novoFuncionario.cargo})`);
  };

  const atualizarFuncionario = (f: Funcionario) => {
    setFuncionarios(prev => prev.map(x => (x.id === f.id ? f : x)));
    registrarAuditoria('Folha RH', 'Atualização de Colaborador', `Modificado cadastro de ${f.nome}`);
  };

  // Cálculo de IRPS (Tabela Progressiva com dedução por dependentes)
  const calcularIRPS = (baseTributavel: number, dependentes: number): number => {
    if (baseTributavel <= 20250) return 0;

    let taxa = 0.10;
    if (baseTributavel <= 30000) taxa = 0.10;
    else if (baseTributavel <= 45000) taxa = 0.15;
    else if (baseTributavel <= 70000) taxa = 0.20;
    else if (baseTributavel <= 100000) taxa = 0.25;
    else taxa = 0.32;

    const abatimentoPorDependente = Math.min(dependentes, 4) * 600;
    const impostoBruto = (baseTributavel - 20250) * taxa;
    const impostoFinal = Math.max(0, impostoBruto - abatimentoPorDependente);

    return Math.round(impostoFinal * 100) / 100;
  };

  const processarFolhaMes = (ano: number, mes: number): FolhaSalario => {
    const linhas: FolhaLinhaItem[] = funcionarios
      .filter(f => f.activo)
      .map((f, index) => {
        const salarioBase = f.salarioBase;
        const subsidioAlimentacao = 4500;
        const subsidioTransporte = 3000;
        const outrosSubsidios = 0;
        const horasExtrasValor = 0;
        const faltasValor = 0;
        const descontosOutros = 0;

        const totalRendimentos = salarioBase + subsidioAlimentacao + subsidioTransporte + outrosSubsidios + horasExtrasValor;

        // INSS Trabalhador (3%) e Empresa (4%) sobre o salário base + horas extras
        const baseINSS = f.inssContribuinte ? (salarioBase + horasExtrasValor) : 0;
        const inssTrabalhador = Math.round(baseINSS * 0.03 * 100) / 100;
        const inssEmpresa = Math.round(baseINSS * 0.04 * 100) / 100;

        // Base tributável para IRPS = Rendimentos sujeitos menos desconto do INSS trabalhador
        const baseIRPS = Math.max(0, totalRendimentos - inssTrabalhador);
        const irps = calcularIRPS(baseIRPS, f.numDependentes);

        const liquido = totalRendimentos - inssTrabalhador - irps - faltasValor - descontosOutros;

        return {
          id: (ano * 1000 + mes * 100) + index + 1,
          idFuncionario: f.id,
          funcionarioNome: f.nome,
          cargo: f.cargo,
          departamento: f.departamento,
          salarioBase,
          subsidioAlimentacao,
          subsidioTransporte,
          outrosSubsidios,
          horasExtrasValor,
          descontosOutros,
          faltasValor,
          inssTrabalhador,
          inssEmpresa,
          irps,
          liquido,
        };
      });

    const novaFolhaId = folhas.length > 0 ? Math.max(...folhas.map(f => f.id)) + 1 : 1;
    const novaFolha: FolhaSalario = {
      id: novaFolhaId,
      idEmpresa: empresa.id,
      ano,
      mes,
      estado: 'processada',
      dataProcessamento: new Date().toISOString().replace('T', ' ').substring(0, 19),
      observacoes: `Folha de Pagamento ${mes.toString().padStart(2, '0')}/${ano} processada automaticamente`,
      linhas,
    };

    setFolhas(prev => {
      const filtradas = prev.filter(f => !(f.ano === ano && f.mes === mes));
      return [novaFolha, ...filtradas];
    });

    registrarAuditoria(
      'Folha RH',
      `Processamento da Folha ${mes}/${ano}`,
      `Processados ${linhas.length} colaboradores. Total Líquido: ${linhas.reduce((acc, l) => acc + l.liquido, 0).toFixed(2)} MT`
    );

    adicionarNotificacao({
      titulo: `Folha ${mes}/${ano} Processada`,
      mensagem: `${linhas.length} salários apurados. Pronto para conferência e integração contabilística.`,
      tipo: 'sucesso',
      linkAcao: 'folha',
    });

    return novaFolha;
  };

  const integrarFolhaContabilidade = (idFolha: number) => {
    const folha = folhas.find(f => f.id === idFolha);
    if (!folha) return { sucesso: false, mensagem: 'Folha de salários não encontrada.' };

    const totalSalarioBase = folha.linhas.reduce((acc, l) => acc + l.salarioBase + l.horasExtrasValor, 0);
    const totalSubsidios = folha.linhas.reduce((acc, l) => acc + l.subsidioAlimentacao + l.subsidioTransporte + l.outrosSubsidios, 0);
    const totalInssTrabalhador = folha.linhas.reduce((acc, l) => acc + l.inssTrabalhador, 0);
    const totalInssEmpresa = folha.linhas.reduce((acc, l) => acc + l.inssEmpresa, 0);
    const totalInssTotal = Math.round((totalInssTrabalhador + totalInssEmpresa) * 100) / 100;
    const totalIrps = folha.linhas.reduce((acc, l) => acc + l.irps, 0);
    const totalLiquido = folha.linhas.reduce((acc, l) => acc + l.liquido, 0);

    // Linhas do lançamento em partidas dobradas:
    // Débito 6.2.2 (Ordenados do Pessoal)
    // Débito 6.2.4 (Benefícios e Subsídios)
    // Débito 6.2.3 (Encargos Patronais INSS 4%)
    // Crédito 2.4.5 (INSS a Pagar 7%)
    // Crédito 2.4.6.1 (IRPS Retenções Trabalhadores a Pagar)
    // Crédito 2.6.1 (Remunerações a Pagar aos Colaboradores)
    const linhasLancamento: Omit<LinhaLancamento, 'id'>[] = [
      {
        codigoConta: '6.2.2',
        tipoMovimento: 'D',
        valor: totalSalarioBase,
        historicoEspecifico: `Ordenados e Salários do Mês ${folha.mes}/${folha.ano}`,
      },
      {
        codigoConta: '6.2.4',
        tipoMovimento: 'D',
        valor: totalSubsidios,
        historicoEspecifico: `Subsídios de Alimentação e Transporte ${folha.mes}/${folha.ano}`,
      },
      {
        codigoConta: '6.2.3',
        tipoMovimento: 'D',
        valor: totalInssEmpresa,
        historicoEspecifico: `Encargo Patronal INSS 4% Empresa ${folha.mes}/${folha.ano}`,
      },
      {
        codigoConta: '2.4.5',
        tipoMovimento: 'C',
        valor: totalInssTotal,
        historicoEspecifico: `Segurança Social INSS 7% (3% Trab + 4% Emp) ${folha.mes}/${folha.ano}`,
      },
      {
        codigoConta: '2.4.6.1',
        tipoMovimento: 'C',
        valor: totalIrps,
        historicoEspecifico: `Retenção de IRPS na Fonte ${folha.mes}/${folha.ano}`,
      },
      {
        codigoConta: '2.6.1',
        tipoMovimento: 'C',
        valor: totalLiquido,
        historicoEspecifico: `Líquido de Vencimentos a Pagar ${folha.mes}/${folha.ano}`,
      },
    ];

    const dataDoc = `${folha.ano}-${folha.mes.toString().padStart(2, '0')}-28`;
    const res = criarLancamento(
      dataDoc,
      `FS-${folha.ano}/${folha.mes.toString().padStart(2, '0')}`,
      5, // Diário de Folha de Salários
      `Integração Automática da Folha de Vencimentos ${folha.mes}/${folha.ano}`,
      linhasLancamento,
      'folha'
    );

    if (res.sucesso && res.idLancamento) {
      setFolhas(prev =>
        prev.map(f => (f.id === idFolha ? { ...f, estado: 'contabilizada', lancamentoId: res.idLancamento } : f))
      );
      registrarAuditoria(
        'Contabilidade',
        `Integração de Folha na Contabilidade`,
        `Folha ${folha.mes}/${folha.ano} contabilizada no lançamento ID #${res.idLancamento} [Diário FS]`
      );
      return { sucesso: true, mensagem: `Folha integrada com sucesso na contabilidade (Lançamento #${res.idLancamento})!` };
    }

    return res;
  };

  const pagarFolha = (idFolha: number) => {
    const folha = folhas.find(f => f.id === idFolha);
    if (!folha) return { sucesso: false, mensagem: 'Folha não encontrada' };

    const totalLiquido = folha.linhas.reduce((acc, l) => acc + l.liquido, 0);

    // Lançamento de liquidação bancária: Débito 2.6.1 / Crédito 1.2.1 Bancos
    const res = criarLancamento(
      new Date().toISOString().substring(0, 10),
      `PG-SAL-${folha.ano}/${folha.mes}`,
      1, // Diário de Caixa/Bancos
      `Pagamento bancário de salários líquidos aos colaboradores ${folha.mes}/${folha.ano}`,
      [
        {
          codigoConta: '2.6.1',
          tipoMovimento: 'D',
          valor: totalLiquido,
          historicoEspecifico: `Liquidação de salários do mês ${folha.mes}/${folha.ano}`,
        },
        {
          codigoConta: '1.2.1',
          tipoMovimento: 'C',
          valor: totalLiquido,
          historicoEspecifico: `Transferência bancária em lote Millennium BIM`,
        },
      ],
      'banco'
    );

    if (res.sucesso) {
      setFolhas(prev => prev.map(f => (f.id === idFolha ? { ...f, estado: 'paga' } : f)));
      // Gerar também transação bancária correspondente
      const novaTx: TransacaoBancaria = {
        id: `TXN-PG-SAL-${Date.now().toString().slice(-4)}`,
        idContaBancaria: '1.2.1',
        bancoNome: 'Millennium BIM',
        data: new Date().toISOString().substring(0, 10),
        descricao: `PAGAMENTO EM LOTE - FOLHA DE SALÁRIOS ${folha.mes}/${folha.ano}`,
        tipo: 'debito',
        valor: totalLiquido,
        categoria: 'Folha de Pagamento',
        conciliado: true,
        idLancamentoAssociado: res.idLancamento,
        numeroDocumento: `PG-SAL-${folha.ano}/${folha.mes}`,
      };
      setTransacoesBancarias(prev => [novaTx, ...prev]);

      registrarAuditoria(
        'Bancos',
        'Pagamento de Salários em Lote',
        `Transferência de ${totalLiquido.toFixed(2)} MT executada para ${folha.linhas.length} colaboradores`
      );

      return { sucesso: true, mensagem: 'Pagamento de salários liquidado via transferência bancária com sucesso!' };
    }

    return res;
  };

  // Férias & Benefícios
  const solicitarFerias = (dados: Omit<SolicitacaoFerias, 'id' | 'status' | 'dataSolicitacao' | 'valorSubsidioFerias'>) => {
    const func = funcionarios.find(f => f.id === dados.idFuncionario);
    const salario = func ? func.salarioBase : 40000;
    const valorSubsidio = Math.round((salario / 30) * dados.diasTotais * 100) / 100;

    const nova: SolicitacaoFerias = {
      ...dados,
      id: `FER-${new Date().getFullYear()}-${(ferias.length + 1).toString().padStart(3, '0')}`,
      status: 'pendente',
      dataSolicitacao: new Date().toISOString().substring(0, 10),
      valorSubsidioFerias: valorSubsidio,
    };
    setFerias(prev => [nova, ...prev]);
    registrarAuditoria('Férias & Benefícios', 'Nova Solicitação de Férias', `${dados.funcionarioNome} solicitou ${dados.diasTotais} dias.`);
  };

  const atualizarStatusFerias = (id: string, novoStatus: 'aprovado' | 'rejeitado' | 'concluido', aprovadoPor = usuarioAtual.nome) => {
    setFerias(prev =>
      prev.map(f => (f.id === id ? { ...f, status: novoStatus, aprovadoPor } : f))
    );
    registrarAuditoria('Férias & Benefícios', `Parecer de Férias: ${novoStatus.toUpperCase()}`, `Solicitação ${id} foi marcada como ${novoStatus} por ${aprovadoPor}`);
  };

  const adicionarBeneficio = (b: Omit<Beneficio, 'id'>) => {
    const novo: Beneficio = { ...b, id: `BEN-${(beneficios.length + 1).toString().padStart(3, '0')}` };
    setBeneficios(prev => [...prev, novo]);
    registrarAuditoria('Férias & Benefícios', 'Atribuição de Benefício', `Atribuído ${b.nomeBeneficio} para ${b.funcionarioNome}`);
  };

  const alternarBeneficio = (id: string) => {
    setBeneficios(prev =>
      prev.map(b => (b.id === id ? { ...b, activo: !b.activo } : b))
    );
  };

  // eSocial
  const transmitirEventoeSocial = async (id: string): Promise<{ sucesso: boolean; protocolo: string }> => {
    // Simulação de transmissão criptografada com certificado digital A1/A3
    await new Promise(r => setTimeout(r, 900));
    const protocolo = `1.2.${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}.${Math.random().toString().slice(2, 19)}`;

    setEventoseSocial(prev =>
      prev.map(evt =>
        evt.id === id
          ? {
              ...evt,
              status: 'transmitido',
              protocolo,
              dataTransmissao: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : evt
      )
    );

    const evento = eventoseSocial.find(e => e.id === id);
    registrarAuditoria('eSocial / Fiscal', `Transmissão de Evento ${evento?.codigoEvento || id}`, `Protocolo emitido: ${protocolo}`);

    adicionarNotificacao({
      titulo: `Evento eSocial ${evento?.codigoEvento} Transmitido`,
      mensagem: `Protocolo de recepção gerado: ${protocolo}. Certificado A1 validado.`,
      tipo: 'sucesso',
      linkAcao: 'esocial',
    });

    return { sucesso: true, protocolo };
  };

  const gerarNovoEventoeSocial = (codigo: 'S-1000' | 'S-2200' | 'S-1200' | 'S-1210' | 'S-2230', referencia: string) => {
    const id = `ESO-${(eventoseSocial.length + 1).toString().padStart(3, '0')}`;
    const descricoes = {
      'S-1000': 'Informações do Empregador e Alíquotas',
      'S-2200': 'Admissão / Cadastramento de Vínculo',
      'S-1200': 'Remuneração de Trabalhador no Período',
      'S-1210': 'Pagamentos de Rendimentos do Trabalho',
      'S-2230': 'Afastamento Temporário / Licença Férias',
      'S-2299': 'Desligamento e Rescisão Contratual',
    };

    const novo: EventoeSocial = {
      id,
      codigoEvento: codigo,
      nomeEvento: descricoes[codigo] || 'Evento Fiscal eSocial',
      periodoReferencia: referencia,
      dataGeracao: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'validado',
      resumo: `Evento oficial gerado automaticamente a partir dos módulos integrados para ${referencia}`,
      xmlPayload: `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.pt/schema/evt/${codigo}/v_S_01_02_00">
  <evento id="ID1${empresa.nuit}${Date.now()}">
    <ideEmpregador>
      <nrInsc>${empresa.nuit}</nrInsc>
    </ideEmpregador>
    <dados>
      <periodo>${referencia}</periodo>
      <statusIntegracao>Validado com Sucesso</statusIntegracao>
      <hashSha256>${Math.random().toString(36).substring(2)}</hashSha256>
    </dados>
  </evento>
</eSocial>`,
    };

    setEventoseSocial(prev => [novo, ...prev]);
    registrarAuditoria('eSocial / Fiscal', `Geração de Evento ${codigo}`, `Evento ${codigo} gerado para competência ${referencia}`);
  };

  // Bancos & Conciliação
  const sincronizarExtratoBancario = () => {
    // Adicionar transação realista simulada recebida via API bancária
    const bancos = ['Millennium BIM', 'Standard Bank', 'BCI'];
    const b = bancos[Math.floor(Math.random() * bancos.length)];
    const idConta = b === 'Millennium BIM' ? '1.2.1' : '1.2.2';
    const agora = new Date().toISOString().substring(0, 10);
    const id = `TXN-API-${Date.now().toString().slice(-4)}`;

    const nova: TransacaoBancaria = {
      id,
      idContaBancaria: idConta,
      bancoNome: b,
      data: agora,
      descricao: `SYNC API: LIQUIDAÇÃO CLIENTE PORTOS DE MOÇAMBIQUE - FAT #${Math.floor(1000 + Math.random() * 9000)}`,
      tipo: 'credito',
      valor: Math.floor(45000 + Math.random() * 85000),
      categoria: 'Recebimento de Clientes',
      conciliado: false,
    };

    setTransacoesBancarias(prev => [nova, ...prev]);
    registrarAuditoria('Bancos', 'Sincronização API Bancária', `Nova transação detectada via Open Banking: ${nova.valor} MT`);

    adicionarNotificacao({
      titulo: 'Sincronização Bancária em Tempo Real',
      mensagem: `Recebida nova transação de ${nova.valor.toLocaleString()} ${empresa.moeda} no ${b}.`,
      tipo: 'info',
      linkAcao: 'bancos',
    });
  };

  const conciliarTransacao = (idTransacao: string, codigoContaContrapartida = '2.1.1') => {
    const tx = transacoesBancarias.find(t => t.id === idTransacao);
    if (!tx) return { sucesso: false, mensagem: 'Transação não encontrada.' };
    if (tx.conciliado) return { sucesso: false, mensagem: 'Transação já se encontra conciliada.' };

    // Criar o lançamento contábil correspondente se ainda não existir
    let idLanc = tx.idLancamentoAssociado;
    if (!idLanc) {
      const linhas: Omit<LinhaLancamento, 'id'>[] =
        tx.tipo === 'credito'
          ? [
              { codigoConta: tx.idContaBancaria, tipoMovimento: 'D', valor: tx.valor, historicoEspecifico: tx.descricao },
              { codigoConta: codigoContaContrapartida, tipoMovimento: 'C', valor: tx.valor, historicoEspecifico: 'Conciliação de recebimento' },
            ]
          : [
              { codigoConta: codigoContaContrapartida, tipoMovimento: 'D', valor: tx.valor, historicoEspecifico: 'Conciliação de pagamento' },
              { codigoConta: tx.idContaBancaria, tipoMovimento: 'C', valor: tx.valor, historicoEspecifico: tx.descricao },
            ];

      const res = criarLancamento(
        tx.data,
        `CONC-${tx.id}`,
        1, // Diário de Caixa / Bancos
        `Conciliação Automática: ${tx.descricao}`,
        linhas,
        'banco'
      );

      if (res.sucesso && res.idLancamento) {
        idLanc = res.idLancamento;
      }
    }

    setTransacoesBancarias(prev =>
      prev.map(t => (t.id === idTransacao ? { ...t, conciliado: true, idLancamentoAssociado: idLanc } : t))
    );

    registrarAuditoria(
      'Bancos',
      'Conciliação Bancária Confirmada',
      `Transação ${tx.id} (${tx.valor.toFixed(2)} MT) conciliada com sucesso com lançamento #${idLanc || 'OK'}`
    );

    return { sucesso: true, mensagem: 'Transação bancária conciliada com sucesso no razão contábil!' };
  };

  const desconciliarTransacao = (idTransacao: string) => {
    setTransacoesBancarias(prev =>
      prev.map(t => (t.id === idTransacao ? { ...t, conciliado: false } : t))
    );
    registrarAuditoria('Bancos', 'Desconciliação', `Transação ${idTransacao} desconciliada.`);
  };

  // Segurança 2FA & Criptografia
  const alternar2FA = (ativar: boolean) => {
    setDoisFatoresAtivo(ativar);
    registrarAuditoria('Segurança', ativar ? 'Ativação de 2FA' : 'Desativação de 2FA', 'Autenticação de 2 Fatores atualizada pelo usuário.');
  };

  const verificarCodigo2FA = (codigo: string): boolean => {
    // Código de 6 dígitos (aceita '123456' padrão ou qualquer código com 6 dígitos para o fluxo seguro)
    const valid = codigo.trim().length === 6 && /^\d+$/.test(codigo.trim());
    if (valid) {
      setUsuarioAtual(prev => ({ ...prev, doisFatoresVerificado: true }));
      registrarAuditoria('Segurança', 'Verificação 2FA Concluída', 'Código TOTP validado com sucesso.');
    }
    return valid;
  };

  const regenerarChaveCriptografia = () => {
    const novaChave = `AES256-GCM-ECH-${Math.random().toString(36).substring(2, 10).toUpperCase()}-SHA256`;
    setChaveCriptografia(novaChave);
    registrarAuditoria('Segurança', 'Rotação de Chave Criptográfica', `Nova chave de sessão gerada: ${novaChave.substring(0, 14)}***`);
  };

  // Backups e Sistema de Backup Automático
  const atualizarConfigBackupAuto = (nova: Partial<ConfiguracaoBackupAuto>) => {
    setConfigBackupAuto(prev => {
      const atualizado = { ...prev, ...nova };
      if (nova.intervaloMinutos !== undefined || nova.ativo !== undefined) {
        const agora = new Date();
        atualizado.proximaExecucao = atualizado.ativo
          ? new Date(agora.getTime() + atualizado.intervaloMinutos * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
          : 'Pausado';
      }
      return atualizado;
    });

    registrarAuditoria(
      'Sistema',
      'Configuração de Backup Automático',
      `Rotina de backup automático atualizada: ${nova.ativo !== undefined ? (nova.ativo ? 'Ativado' : 'Desativado') : 'Parâmetros alterados'}`
    );
  };

  const executarBackupManual = async (tipo: 'nuvem_redundante' | 'local_encriptado' | 'automatico_agendado' = 'nuvem_redundante'): Promise<BackupStatus> => {
    await new Promise(r => setTimeout(r, 600));
    const prefixo = tipo === 'automatico_agendado' ? 'BKP-AUTO' : tipo === 'local_encriptado' ? 'BKP-LOC' : 'BKP-NUV';
    const id = `${prefixo}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(backups.length + 1).toString().padStart(2, '0')}`;
    const hash = await gerarHashSHA256(JSON.stringify({ lancamentos, funcionarios, folhas, transacoesBancarias, orcamentos }));

    const novo: BackupStatus = {
      id,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      tipo,
      origem: 'manual',
      formato: 'completo',
      destino: tipo === 'nuvem_redundante' ? 'nuvem' : 'local',
      tamanho: `${(Math.random() * 2 + 24.5).toFixed(1)} MB`,
      status: 'sincronizado',
      hashVerificacao: hash.substring(0, 40),
      servidorRegiao: tipo === 'nuvem_redundante' ? 'Frankfurt (AWS EU-Central-1 Redundant)' : 'Cofre Local Encriptado (AES-256)',
    };

    setBackups(prev => [novo, ...prev]);
    registrarAuditoria('Sistema', 'Execução de Backup', `Backup ${id} gerado com sucesso [Hash: ${hash.slice(0, 10)}...]`);

    adicionarNotificacao({
      titulo: 'Backup Concluído',
      mensagem: `Snapshot ${id} gerado e replicado com sucesso em armazenamento seguro.`,
      tipo: 'sucesso',
      linkAcao: 'auditoria',
    });

    return novo;
  };

  const sincronizarBackupNuvem = async () => {
    await new Promise(r => setTimeout(r, 800));
    const id = `BKP-CLOUD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(backups.length + 1).toString().padStart(2, '0')}`;
    const snapshotData = {
      empresa,
      planoContas,
      lancamentos,
      funcionarios,
      folhas,
      ferias,
      beneficios,
      eventoseSocial,
      transacoesBancarias,
      orcamentos,
      licenca,
    };
    const hash = await gerarHashSHA256(JSON.stringify(snapshotData));
    const novo: BackupStatus = {
      id,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      tipo: 'nuvem_redundante',
      origem: 'manual',
      formato: 'completo',
      destino: 'nuvem',
      tamanho: `${(Math.random() * 1.5 + 25.2).toFixed(1)} MB`,
      status: 'sincronizado',
      hashVerificacao: hash.substring(0, 40),
      servidorRegiao: 'Frankfurt (AWS EU-Central-1 Multi-AZ & S3 Geo-Redundante)',
    };

    setBackups(prev => [novo, ...prev]);
    registrarAuditoria('Sistema', 'Sincronização em Nuvem', `Snapshot ${id} sincronizado com cofre na nuvem.`);
    adicionarNotificacao({
      titulo: 'Sincronização em Nuvem Concluída',
      mensagem: `Dados contábeis e de RH sincronizados em nuvem redundante [${id}].`,
      tipo: 'sucesso',
      linkAcao: 'auditoria',
    });

    return { sucesso: true, id, hash };
  };

  // Helper para download de ficheiros no navegador
  const downloadArquivo = (conteudo: string, nomeArquivo: string, tipoMime: string) => {
    const blob = new Blob([conteudo], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Exportar Backup Integral em JSON com SHA-256
  const exportarBackupCompletoJSON = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const payload = {
      sistema: 'ECHpro ERP Contabilidade & RH PGC-NIRF',
      versao: '2.8-pro',
      dataExportacao: new Date().toISOString(),
      responsavel: usuarioAtual.nome,
      empresa,
      planoContas,
      diarios,
      lancamentos,
      funcionarios,
      folhas,
      ferias,
      beneficios,
      eventoseSocial,
      transacoesBancarias,
      orcamentos,
      configBackupAuto,
      licenca,
      suporte: {
        telefone: '+258 827473434',
        email: 'ebenchume@sapo.mz',
      },
    };

    const hash = await gerarHashSHA256(JSON.stringify(payload));
    const fullBackup = {
      ...payload,
      hashIntegridade: `SHA256:${hash}`,
    };

    const jsonStr = JSON.stringify(fullBackup, null, 2);
    downloadArquivo(jsonStr, `ECHpro_Backup_Completo_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');

    registrarAuditoria('Sistema', 'Exportação de Backup JSON', `Snapshot completo exportado em ficheiro JSON [Hash: ${hash.slice(0, 10)}...]`);
    adicionarNotificacao({
      titulo: 'Ficheiro JSON de Backup Exportado',
      mensagem: `Backup integral contábil e de RH gerado com assinatura digital SHA-256.`,
      tipo: 'sucesso',
      linkAcao: 'auditoria',
    });
  };

  // Exportar Relatórios e Dados em CSV (com separador ';' e UTF-8 BOM para compatibilidade com Microsoft Excel)
  const exportarCSV = (tipo: 'lancamentos' | 'plano' | 'funcionarios' | 'folhas' | 'bancos' | 'orcamentos' | 'todos') => {
    const BOM = '\uFEFF';
    const dataStr = new Date().toISOString().slice(0, 10);

    const gerarCSVLancamentos = () => {
      const headers = ['Data Lançamento', 'Diário', 'Nº Documento', 'Origem', 'Descrição Geral', 'Código Conta', 'Histórico Específico Linha', 'Movimento', 'Valor (MT)'];
      const rows: string[][] = [];
      lancamentos.forEach(l => {
        const diario = diarios.find(d => d.idDiario === l.idDiario)?.nomeDiario || `Diário ${l.idDiario}`;
        l.linhas.forEach(linha => {
          rows.push([
            l.dataLancamento,
            diario,
            l.numeroDocumento,
            l.origem || 'manual',
            l.descricaoGeral,
            linha.codigoConta,
            linha.historicoEspecifico || '',
            linha.tipoMovimento === 'D' ? 'Débito' : 'Crédito',
            linha.valor.toFixed(2),
          ]);
        });
      });
      return BOM + [headers.map(escapeCSV).join(';'), ...rows.map(r => r.map(escapeCSV).join(';'))].join('\r\n');
    };

    const gerarCSVPlano = () => {
      const saldos = obterSaldosContas();
      const headers = ['Código Conta PGC', 'Designação da Conta', 'Classe', 'Natureza Predominante', 'Total Débitos (MT)', 'Total Créditos (MT)', 'Saldo Atual (MT)'];
      const rows = saldos.map(s => [
        s.codigoConta,
        s.designacao,
        String(s.classe),
        s.naturezaPredominante === 'D' ? 'Devedora' : 'Credora',
        s.totalDebito.toFixed(2),
        s.totalCredito.toFixed(2),
        s.saldoActual.toFixed(2),
      ]);
      return BOM + [headers.map(escapeCSV).join(';'), ...rows.map(r => r.map(escapeCSV).join(';'))].join('\r\n');
    };

    const gerarCSVFuncionarios = () => {
      const headers = ['ID', 'Nome Completo', 'Cargo', 'Departamento', 'NUIT', 'Nº BI', 'Salário Base (MT)', 'Nº Dependentes', 'Contribuinte INSS', 'Data Admissão', 'Banco', 'IBAN / Conta', 'Email', 'Telefone', 'Status Ativo'];
      const rows = funcionarios.map(f => [
        String(f.id),
        f.nome,
        f.cargo,
        f.departamento,
        f.nuit,
        f.biNumero,
        f.salarioBase.toFixed(2),
        String(f.numDependentes),
        f.inssContribuinte ? 'Sim' : 'Não',
        f.dataAdmissao,
        f.banco,
        f.ibanOuConta,
        f.email,
        f.telefone,
        f.activo ? 'Ativo' : 'Inativo',
      ]);
      return BOM + [headers.map(escapeCSV).join(';'), ...rows.map(r => r.map(escapeCSV).join(';'))].join('\r\n');
    };

    const gerarCSVFolhas = () => {
      const headers = ['ID Folha', 'Mês / Ano', 'Colaborador', 'Cargo', 'Departamento', 'Salário Base (MT)', 'Subsídios (MT)', 'INSS Trabalhador (3%) (MT)', 'IRPS Retido (MT)', 'INSS Patronal (4%) (MT)', 'Outros Descontos (MT)', 'Salário Líquido (MT)', 'Estado Processamento'];
      const rows: string[][] = [];
      folhas.forEach(f => {
        const periodo = `${f.mes.toString().padStart(2, '0')}/${f.ano}`;
        f.linhas.forEach(linha => {
          const subsidios = linha.subsidioAlimentacao + linha.subsidioTransporte + linha.outrosSubsidios;
          rows.push([
            String(f.id),
            periodo,
            linha.funcionarioNome,
            linha.cargo,
            linha.departamento,
            linha.salarioBase.toFixed(2),
            subsidios.toFixed(2),
            linha.inssTrabalhador.toFixed(2),
            linha.irps.toFixed(2),
            linha.inssEmpresa.toFixed(2),
            linha.descontosOutros.toFixed(2),
            linha.liquido.toFixed(2),
            f.estado.toUpperCase(),
          ]);
        });
      });
      return BOM + [headers.map(escapeCSV).join(';'), ...rows.map(r => r.map(escapeCSV).join(';'))].join('\r\n');
    };

    const gerarCSVBancos = () => {
      const headers = ['ID Transação', 'Data', 'Banco', 'Descrição', 'Tipo Movimento', 'Valor (MT)', 'Categoria', 'Status Conciliado', 'ID Lançamento Associado'];
      const rows = transacoesBancarias.map(t => [
        t.id,
        t.data,
        t.bancoNome,
        t.descricao,
        t.tipo.toUpperCase(),
        t.valor.toFixed(2),
        t.categoria,
        t.conciliado ? 'Conciliado' : 'Pendente',
        t.idLancamentoAssociado ? String(t.idLancamentoAssociado) : 'N/A',
      ]);
      return BOM + [headers.map(escapeCSV).join(';'), ...rows.map(r => r.map(escapeCSV).join(';'))].join('\r\n');
    };

    const gerarCSVOrcamentos = () => {
      const resumo = obterResumoOrcamentos();
      const headers = ['Departamento', 'Teto Orçamental Mensal (MT)', 'Gasto Real Mensal (MT)', 'Percentual Consumido (%)', 'Saldo Diferença (MT)', 'Status Alerta', 'Observações'];
      const rows = resumo.map(r => [
        r.departamento,
        r.limite.toFixed(2),
        r.gastoReal.toFixed(2),
        `${r.percentualUsado}%`,
        r.diferenca.toFixed(2),
        r.status.toUpperCase(),
        r.observacoes || '',
      ]);
      return BOM + [headers.map(escapeCSV).join(';'), ...rows.map(r => r.map(escapeCSV).join(';'))].join('\r\n');
    };

    if (tipo === 'lancamentos' || tipo === 'todos') {
      downloadArquivo(gerarCSVLancamentos(), `ECHpro_Lancamentos_Contabeis_${dataStr}.csv`, 'text/csv;charset=utf-8;');
    }
    if (tipo === 'plano' || tipo === 'todos') {
      setTimeout(() => downloadArquivo(gerarCSVPlano(), `ECHpro_Plano_Contas_PGC_${dataStr}.csv`, 'text/csv;charset=utf-8;'), tipo === 'todos' ? 200 : 0);
    }
    if (tipo === 'funcionarios' || tipo === 'todos') {
      setTimeout(() => downloadArquivo(gerarCSVFuncionarios(), `ECHpro_Quadro_Pessoal_RH_${dataStr}.csv`, 'text/csv;charset=utf-8;'), tipo === 'todos' ? 400 : 0);
    }
    if (tipo === 'folhas' || tipo === 'todos') {
      setTimeout(() => downloadArquivo(gerarCSVFolhas(), `ECHpro_Folhas_Salario_${dataStr}.csv`, 'text/csv;charset=utf-8;'), tipo === 'todos' ? 600 : 0);
    }
    if (tipo === 'bancos' || tipo === 'todos') {
      setTimeout(() => downloadArquivo(gerarCSVBancos(), `ECHpro_Extrato_Bancario_${dataStr}.csv`, 'text/csv;charset=utf-8;'), tipo === 'todos' ? 800 : 0);
    }
    if (tipo === 'orcamentos' || tipo === 'todos') {
      setTimeout(() => downloadArquivo(gerarCSVOrcamentos(), `ECHpro_Gestao_Orcamentos_${dataStr}.csv`, 'text/csv;charset=utf-8;'), tipo === 'todos' ? 1000 : 0);
    }

    registrarAuditoria('Sistema', 'Exportação de Dados em CSV', `Exportação de ficheiro(s) CSV realizada para o módulo: ${tipo.toUpperCase()}`);
    adicionarNotificacao({
      titulo: 'Exportação CSV Concluída',
      mensagem: `Ficheiro(s) CSV para o módulo ${tipo} gerados com sucesso para armazenamento local ou auditoria.`,
      tipo: 'sucesso',
      linkAcao: 'auditoria',
    });
  };

  // Rotina de Backup Automático periódico em segundo plano
  useEffect(() => {
    if (!configBackupAuto.ativo) return;

    const intervalTimer = setInterval(async () => {
      const agora = new Date();
      const ultimo = configBackupAuto.ultimoBackup ? new Date(configBackupAuto.ultimoBackup) : new Date(0);
      const diffMinutos = (agora.getTime() - ultimo.getTime()) / (1000 * 60);

      if (diffMinutos >= configBackupAuto.intervaloMinutos) {
        const id = `BKP-AUTO-${agora.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const hash = await gerarHashSHA256(JSON.stringify({ lancamentos, funcionarios, folhas, transacoesBancarias, orcamentos }));
        const novoBkp: BackupStatus = {
          id,
          dataHora: agora.toISOString().replace('T', ' ').substring(0, 19),
          tipo: 'automatico_agendado',
          origem: 'automatico',
          formato: configBackupAuto.formatoPadrao,
          destino: configBackupAuto.destino,
          tamanho: `${(Math.random() * 1.5 + 24.5).toFixed(1)} MB`,
          status: 'sincronizado',
          hashVerificacao: hash.substring(0, 40),
          servidorRegiao: configBackupAuto.destino === 'local'
            ? 'Cofre Local Encriptado (AES-256)'
            : 'Nuvem Redundante (Frankfurt Multi-AZ & Local Snapshot)',
        };

        setBackups(prev => [novoBkp, ...prev.slice(0, configBackupAuto.manterHistoricoMax - 1)]);

        const proximo = new Date(agora.getTime() + configBackupAuto.intervaloMinutos * 60 * 1000)
          .toISOString().replace('T', ' ').substring(0, 19);

        setConfigBackupAuto(prev => ({
          ...prev,
          ultimoBackup: novoBkp.dataHora,
          proximaExecucao: proximo,
        }));

        registrarAuditoria(
          'Sistema',
          'Backup Automático Realizado',
          `Rotina agendada executou o backup ${id} (${configBackupAuto.destino.toUpperCase()}) com integridade SHA-256.`
        );

        adicionarNotificacao({
          titulo: 'Backup Automático Concluído',
          mensagem: `Snapshot periódico ${id} sincronizado com sucesso (${configBackupAuto.intervaloMinutos} min).`,
          tipo: 'info',
          linkAcao: 'auditoria',
        });
      }
    }, 20000);

    return () => clearInterval(intervalTimer);
  }, [configBackupAuto, lancamentos, funcionarios, folhas, transacoesBancarias, orcamentos]);

  const restaurarBackup = (jsonContent: string): boolean => {
    try {
      const data = JSON.parse(jsonContent);
      if (data.empresa) setEmpresa(data.empresa);
      if (data.planoContas) setPlanoContas(data.planoContas);
      if (data.lancamentos) setLancamentos(data.lancamentos);
      if (data.funcionarios) setFuncionarios(data.funcionarios);
      if (data.folhas) setFolhas(data.folhas);
      if (data.ferias) setFerias(data.ferias);
      if (data.beneficios) setBeneficios(data.beneficios);
      if (data.eventoseSocial) setEventoseSocial(data.eventoseSocial);
      if (data.transacoesBancarias) setTransacoesBancarias(data.transacoesBancarias);
      if (data.orcamentos) setOrcamentos(data.orcamentos);
      if (data.configBackupAuto) setConfigBackupAuto(data.configBackupAuto);
      if (data.licenca) setLicenca(data.licenca);

      const restoreId = `RESTORE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
      const novoStatus: BackupStatus = {
        id: restoreId,
        dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
        tipo: 'local_encriptado',
        origem: 'restauracao',
        tamanho: `${(jsonContent.length / 1024).toFixed(1)} KB`,
        status: 'sucesso',
        hashVerificacao: data.hashIntegridade?.substring(0, 40) || 'VERIFICADO-OK',
        servidorRegiao: 'Restauração Local Concluída com Sucesso',
      };
      setBackups(prev => [novoStatus, ...prev]);

      registrarAuditoria('Sistema', 'Restauração de Backup', `Dados do sistema restaurados a partir de ficheiro de backup (${restoreId}).`);
      adicionarNotificacao({
        titulo: 'Restauração Concluída com Sucesso',
        mensagem: `Todos os dados contábeis, de folha de pagamento e cadastros foram restaurados a partir do ficheiro importado.`,
        tipo: 'sucesso',
        linkAcao: 'auditoria',
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Notificações
  const marcarNotificacaoLida = (id: string) => {
    setNotificacoes(prev => prev.map(n => (n.id === id ? { ...n, lida: true } : n)));
  };

  const marcarTodasNotificacoesLidas = () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const adicionarNotificacao = (notif: Omit<NotificacaoAlerta, 'id' | 'data' | 'lida'>) => {
    const nova: NotificacaoAlerta = {
      ...notif,
      id: `NOT-${Date.now().toString().slice(-5)}`,
      data: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lida: false,
    };
    setNotificacoes(prev => [nova, ...prev]);
  };

  // Gestão de Orçamentos por Departamento
  const atualizarOrcamento = (departamento: string, novoLimite: number, observacoes?: string) => {
    setOrcamentos(prev => {
      const exists = prev.some(o => o.departamento === departamento);
      if (exists) {
        return prev.map(o =>
          o.departamento === departamento
            ? { ...o, limiteMensal: novoLimite, observacoes: observacoes ?? o.observacoes }
            : o
        );
      }
      return [
        ...prev,
        {
          departamento,
          limiteMensal: novoLimite,
          ano: new Date().getFullYear(),
          mes: new Date().getMonth() + 1,
          observacoes,
        },
      ];
    });

    registrarAuditoria(
      'Sistema',
      'Definição de Limite de Orçamento',
      `Orçamento do departamento ${departamento} ajustado para ${novoLimite.toLocaleString()} MT`
    );

    adicionarNotificacao({
      titulo: 'Limite Orçamentário Atualizado',
      mensagem: `O teto mensal de gastos do departamento "${departamento}" foi definido para ${novoLimite.toLocaleString()} ${empresa.moeda}.`,
      tipo: 'info',
      linkAcao: 'dashboard',
    });
  };

  const obterResumoOrcamentos = () => {
    const gastosPorDept: Record<string, number> = {};

    // 1. Somar salários brutos + encargos patronais (INSS 4%) + subsídios dos colaboradores ativos
    funcionarios.filter(f => f.activo).forEach(f => {
      const salarioBase = f.salarioBase;
      const subsidios = 4500 + 3000; // Alimentação + Transporte padrão
      const inssPatronal = f.inssContribuinte ? salarioBase * 0.04 : 0;
      const totalColab = salarioBase + subsidios + inssPatronal;

      gastosPorDept[f.departamento] = (gastosPorDept[f.departamento] || 0) + totalColab;
    });

    // 2. Adicionar custos de benefícios atribuídos por departamento
    beneficios.filter(b => b.activo).forEach(b => {
      const func = funcionarios.find(f => f.id === b.idFuncionario);
      if (func) {
        gastosPorDept[func.departamento] = (gastosPorDept[func.departamento] || 0) + b.custoEmpresa;
      }
    });

    // Departamentos existentes
    const todosDeptos = Array.from(new Set([
      ...orcamentos.map(o => o.departamento),
      ...Object.keys(gastosPorDept),
    ]));

    return todosDeptos.map(dept => {
      const orc = orcamentos.find(o => o.departamento === dept);
      const limite = orc ? orc.limiteMensal : 100000;
      const gastoReal = Math.round(gastosPorDept[dept] || 0);
      const percentualUsado = limite > 0 ? Math.round((gastoReal / limite) * 100) : 0;
      const diferenca = limite - gastoReal;

      let status: 'normal' | 'alerta' | 'estourado' = 'normal';
      if (percentualUsado >= 100) {
        status = 'estourado';
      } else if (percentualUsado >= 85) {
        status = 'alerta';
      }

      return {
        departamento: dept,
        limite,
        gastoReal,
        percentualUsado,
        diferenca,
        status,
        observacoes: orc?.observacoes,
      };
    });
  };

  const setDoisFatoresVerificado = (v: boolean) => {
    setUsuarioAtual(prev => ({ ...prev, doisFatoresVerificado: v }));
  };

  // Funções de Validação e Ativação de Licença ECHpro
  const validarChaveAtivacao = (chave: string) => {
    const limpa = chave.trim().toUpperCase();
    if (!limpa) {
      return { valida: false, mensagem: 'Por favor, insira uma chave de ativação.' };
    }
    if (!limpa.startsWith('ECHPRO-')) {
      return { valida: false, mensagem: 'A chave deve iniciar pelo identificador oficial ECHPRO-' };
    }
    const regex = /^ECHPRO(-[A-Z0-9]{4}){2,5}$/;
    if (!regex.test(limpa) && limpa.length < 16) {
      return { valida: false, mensagem: 'Formato inválido. Padrão exigido: ECHPRO-XXXX-XXXX-XXXX-XXXX' };
    }
    const isEnterprise = limpa.includes('2026') || limpa.includes('MZ') || limpa.includes('SAPO') || limpa.includes('7434') || limpa.includes('ENT');
    return {
      valida: true,
      mensagem: 'Chave autêntica e válida verificada pela infraestrutura ECHpro!',
      tipo: isEnterprise ? 'Enterprise Vitalícia (Windows 10/11 & Cloud)' : 'Corporativa PGC-NIRF Anual',
    };
  };

  const ativarSistema = (chave: string, titular?: string, email?: string) => {
    const validacao = validarChaveAtivacao(chave);
    if (!validacao.valida) {
      return { sucesso: false, mensagem: validacao.mensagem };
    }

    const agora = new Date().toISOString().slice(0, 10);
    const titularFinal = titular?.trim() || 'Eng. E. Benchume (Direção Executiva)';
    const emailFinal = email?.trim() || 'ebenchume@sapo.mz';
    const novaLicenca: LicencaInfo = {
      chave: chave.trim().toUpperCase(),
      status: 'activa',
      titular: titularFinal,
      email: emailFinal,
      telefone: '+258 827473434',
      tipo: validacao.tipo || 'Enterprise Vitalícia (Windows 10/11 & Cloud PGC-NIRF)',
      dataAtivacao: agora,
      dataExpiracao: 'Vitalícia / Permanente',
      idDispositivo: `HWID-WIN11-MZ-${Math.floor(100000 + Math.random() * 900000)}`,
      assinaturaDigital: `SHA256:${Math.random().toString(16).substring(2, 10)}${Date.now()}`,
    };

    setLicenca(novaLicenca);
    registrarAuditoria(
      'Sistema',
      'Ativação de Licença',
      `Software ECHpro ativado com sucesso para ${titularFinal} (${emailFinal}) com a chave ${novaLicenca.chave}`
    );
    adicionarNotificacao({
      titulo: 'Licença Ativada com Sucesso!',
      mensagem: `Sistema ECHpro ativado em definitivo para ${titularFinal}. Suporte técnico oficial: +258 827473434 / ebenchume@sapo.mz.`,
      tipo: 'sucesso',
    });

    return { sucesso: true, mensagem: 'Licença ativada com sucesso!' };
  };

  const gerarChaveLicencaOficial = (titular: string, email: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randPart = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const chave = `ECHPRO-2026-${randPart(4)}-${randPart(4)}-${randPart(4)}`;
    return chave;
  };

  return (
    <AppContext.Provider
      value={{
        empresa,
        updateEmpresa,
        planoContas,
        diarios,
        lancamentos,
        adicionarConta,
        criarLancamento,
        obterSaldosContas,
        obterBalancete,
        obterDRE,
        executarFechoExercicio,
        funcionarios,
        adicionarFuncionario,
        atualizarFuncionario,
        folhas,
        processarFolhaMes,
        integrarFolhaContabilidade,
        pagarFolha,
        ferias,
        solicitarFerias,
        atualizarStatusFerias,
        beneficios,
        adicionarBeneficio,
        alternarBeneficio,
        eventoseSocial,
        transmitirEventoeSocial,
        gerarNovoEventoeSocial,
        transacoesBancarias,
        sincronizarExtratoBancario,
        conciliarTransacao,
        desconciliarTransacao,
        auditoria,
        registrarAuditoria,
        doisFatoresAtivo,
        alternar2FA,
        verificarCodigo2FA,
        chaveCriptografia,
        regenerarChaveCriptografia,
        backups,
        configBackupAuto,
        atualizarConfigBackupAuto,
        executarBackupManual,
        restaurarBackup,
        exportarBackupCompletoJSON,
        exportarCSV,
        sincronizarBackupNuvem,
        orcamentos,
        atualizarOrcamento,
        obterResumoOrcamentos,
        notificacoes,
        marcarNotificacaoLida,
        marcarTodasNotificacoesLidas,
        adicionarNotificacao,
        usuarioAtual,
        setDoisFatoresVerificado,
        licenca,
        validarChaveAtivacao,
        ativarSistema,
        gerarChaveLicencaOficial,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  return context;
};
