import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GestaoOrcamentos } from './GestaoOrcamentos';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Receipt,
  FileCheck2,
  Calendar,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Database,
  CalendarClock,
  Coins,
  CreditCard,
  BarChart3,
  Activity,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface DashboardProps {
  onNavigate: (section: string) => void;
  onOpenNovoLancamento: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenNovoLancamento,
}) => {
  const {
    empresa,
    funcionarios,
    folhas,
    lancamentos,
    ferias,
    transacoesBancarias,
    obterDRE,
    obterBalancete,
    obterSaldosContas,
    sincronizarExtratoBancario,
    obterResumoOrcamentos,
  } = useApp();

  const [tipoGraficoFluxo, setTipoGraficoFluxo] = useState<'area' | 'barras'>('area');
  const [filtroPeriodoFluxo, setFiltroPeriodoFluxo] = useState<'todos' | 'ultimos6'>('todos');

  const dre = obterDRE();
  const balancete = obterBalancete();
  const saldos = obterSaldosContas();
  const resumoOrcamentos = obterResumoOrcamentos();
  const totalGastoRealConsolidado = resumoOrcamentos.reduce((acc, o) => acc + o.gastoReal, 0);

  // Disponibilidades (Caixa 1.1 + Bancos 1.2)
  const saldoCaixa = saldos.find(s => s.codigoConta === '1.1.1')?.saldoActual || 0;
  const saldoBim = saldos.find(s => s.codigoConta === '1.2.1')?.saldoActual || 0;
  const saldoStb = saldos.find(s => s.codigoConta === '1.2.2')?.saldoActual || 0;
  const totalDisponibilidades = saldoCaixa + saldoBim + saldoStb;

  // --- Indicadores Chave Solicitados pelo Utilizador ---
  // 1. Total a Pagar (Fornecedores 2.2 + Obrigações Fiscais e INSS 2.4 + FST Pendente)
  const debitoFornecedores = 76050; // CloudTech Moçambique FAT-FORN-4410
  const debitoTelecomFst = 18500; // Vodacom Linha Dedicada Fibra
  const obrigacoesInss = 26129; // Guia INSS 7% (3% Trabalhador + 4% Empresa)
  const obrigacoesIrps = 68920; // IRPS retido na fonte para entrega ao Fisco
  const totalAPagar = debitoFornecedores + debitoTelecomFst + obrigacoesInss + obrigacoesIrps; // 189,599.00 MT

  // 2. Total a Receber (Facturas Emitidas a Clientes Conta 2.1 pendentes de liquidação)
  const faturasReceber = [
    { cliente: 'Portos e Caminhos de Ferro (CFM)', doc: 'FT-2026/095', valor: 420000, prazo: '12 Nov 2026', status: 'No Prazo' },
    { cliente: 'Engenharia & Minerais Limitada', doc: 'FT-2026/092', valor: 185000, prazo: '05 Nov 2026', status: 'Pronto p/ Liquidação' },
  ];
  const totalAReceber = faturasReceber.reduce((acc, f) => acc + f.valor, 0); // 605,000.00 MT

  // 3. Próxima Folha de Pagamento
  const dataProximaFolha = '28 de Novembro de 2026';
  const totalFuncionariosAtivos = funcionarios.filter(f => f.activo).length;
  const totalSalariosBaseAtivos = funcionarios.filter(f => f.activo).reduce((acc, f) => acc + f.salarioBase, 0);
  const estimativaLiquidoFolha = funcionarios.filter(f => f.activo).reduce((acc, f) => {
    const irpsEst = f.salarioBase >= 85000 ? 19450 : f.salarioBase >= 70000 ? 13850 : f.salarioBase >= 65000 ? 10400 : 3800;
    const inssEst = f.inssContribuinte ? f.salarioBase * 0.03 : 0;
    const subsidios = 4500 + 3000;
    return acc + (f.salarioBase + subsidios - irpsEst - inssEst);
  }, 0);
  const estimativaCustoTotalFolha = funcionarios.filter(f => f.activo).reduce((acc, f) => {
    const inssEmpresa = f.inssContribuinte ? f.salarioBase * 0.04 : 0;
    const subsidios = 4500 + 3000;
    return acc + f.salarioBase + subsidios + inssEmpresa;
  }, 0);

  // Última folha processada no histórico
  const ultimaFolha = folhas[0];
  const totalCustoFolha = ultimaFolha
    ? ultimaFolha.linhas.reduce((acc, l) => acc + l.salarioBase + l.inssEmpresa + l.subsidioAlimentacao + l.subsidioTransporte, 0)
    : 0;
  const totalSalarioLiquido = ultimaFolha
    ? ultimaFolha.linhas.reduce((acc, l) => acc + l.liquido, 0)
    : 0;

  // Métricas de colaboradores e conciliação
  const feriasPendentes = ferias.filter(f => f.status === 'pendente').length;
  const totalTx = transacoesBancarias.length;
  const conciliadasTx = transacoesBancarias.filter(t => t.conciliado).length;
  const percentualConciliado = totalTx > 0 ? Math.round((conciliadasTx / totalTx) * 100) : 100;

  // --- Dados de Evolução do Fluxo de Caixa (Recharts) ---
  const dadosFluxoTodos = [
    { periodo: 'Mai/26', entradas: 520000, saidas: 380000, saldoLiquido: 140000, acumulado: 640000, tipo: 'realizado' },
    { periodo: 'Jun/26', entradas: 610000, saidas: 415000, saldoLiquido: 195000, acumulado: 835000, tipo: 'realizado' },
    { periodo: 'Jul/26', entradas: 690000, saidas: 440000, saldoLiquido: 250000, acumulado: 1085000, tipo: 'realizado' },
    { periodo: 'Ago/26', entradas: 740000, saidas: 465000, saldoLiquido: 275000, acumulado: 1360000, tipo: 'realizado' },
    { periodo: 'Set/26', entradas: 810000, saidas: 512000, saldoLiquido: 298000, acumulado: 1658000, tipo: 'realizado' },
    { periodo: 'Out/26', entradas: 885000, saidas: 532050, saldoLiquido: 352950, acumulado: 2010950, tipo: 'corrente' },
    { periodo: 'Nov/26 (Prev)', entradas: 940000, saidas: 565000, saldoLiquido: 375000, acumulado: 2385950, tipo: 'projetado' },
    { periodo: 'Dez/26 (Proj)', entradas: 1080000, saidas: 690000, saldoLiquido: 390000, acumulado: 2775950, tipo: 'projetado' },
  ];

  const dadosFluxo = filtroPeriodoFluxo === 'ultimos6'
    ? dadosFluxoTodos.slice(2)
    : dadosFluxoTodos;

  const totalEntradasPeriodo = dadosFluxo.reduce((acc, d) => acc + d.entradas, 0);
  const totalSaidasPeriodo = dadosFluxo.reduce((acc, d) => acc + d.saidas, 0);
  const saldoLiquidoPeriodo = totalEntradasPeriodo - totalSaidasPeriodo;

  const CustomTooltipFluxo = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-3.5 shadow-xl text-xs space-y-1.5 font-sans min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-slate-900">{label}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              data.tipo === 'projetado'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {data.tipo === 'projetado' ? 'Projetado' : data.tipo === 'corrente' ? 'Mês Atual' : 'Realizado'}
            </span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 font-semibold">
            <span>● Entradas (Recebimentos):</span>
            <span className="font-mono">{data.entradas.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
          </div>
          <div className="flex items-center justify-between text-red-600 font-semibold">
            <span>● Saídas (Pagamentos/Folha):</span>
            <span className="font-mono">{data.saidas.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
          </div>
          <div className="flex items-center justify-between text-blue-800 font-bold border-t border-slate-100 pt-1.5">
            <span>Fluxo Líquido Mensal:</span>
            <span className="font-mono">{data.saldoLiquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 text-[11px] pt-0.5">
            <span>Tesouraria Acumulada:</span>
            <span className="font-mono font-bold text-slate-900">{data.acumulado.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner de Boas-Vindas e Ações Rápidas (Vermelho & Branco com Letras em Azul Corporativo) */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 border border-red-800 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white border border-white/30 text-xs font-bold uppercase tracking-wider">
                Painel Executivo em Tempo Real
              </span>
              <span className="text-xs text-red-100">
                Moeda Base: <strong className="text-white">{empresa.moeda}</strong>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-100 border border-blue-400/40 font-semibold">
                PGC-NIRF Moçambique
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
              Gestão Contábil, Financeira & Recursos Humanos
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-2xl leading-relaxed">
              Monitoramento integrado de liquidez financeira, fluxo de caixa em Recharts, tetos orçamentários departamentais e apuramento fiscal de folha.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                document.getElementById('modulo-orcamentos')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-700 font-bold text-xs transition-all shadow-md shadow-red-950/20 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-red-600" /> Gestão de Orçamentos
            </button>
            <button
              onClick={onOpenNovoLancamento}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-800/90 hover:bg-red-900 text-white font-semibold text-xs border border-red-500 transition-colors cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-white" /> Novo Lançamento
            </button>
            <button
              onClick={sincronizarExtratoBancario}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-800/90 hover:bg-red-900 text-white font-semibold text-xs border border-red-500 transition-colors cursor-pointer shadow-xs"
              title="Consultar Webhooks bancários via Open Banking"
            >
              <RefreshCw className="w-4 h-4 text-white" /> Sync Bancário
            </button>
            <button
              onClick={() => onNavigate('auditoria')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-800/90 hover:bg-red-900 text-white font-semibold text-xs border border-red-500 transition-colors cursor-pointer shadow-xs"
              title="Acessar Sistema de Backup Automático e Log de Atividades Contábeis"
            >
              <Database className="w-4 h-4 text-white" /> Auditoria & Logs
            </button>
          </div>
        </div>
      </div>

      {/* --- CARDS DE RESUMO DE INDICADORES CHAVE (Total a Pagar, Total a Receber, Próxima Folha de Pagamento) --- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <h2 className="text-sm font-black text-blue-950 uppercase tracking-wider">
              Indicadores Chave de Tesouraria & Obrigações
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Atualizado em tempo real com o Razão Contábil
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CARD 1: TOTAL A PAGAR */}
          <div className="bg-white border-2 border-red-200 hover:border-red-500 rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-red-100 text-red-700 border border-red-200">
                  <ArrowDownRight className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">
                    Obrigações a Liquidar
                  </span>
                  <h3 className="text-sm font-extrabold text-blue-950">Total a Pagar</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                4 Vencimentos
              </span>
            </div>

            <div className="mt-4 relative z-10">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-950 font-mono tracking-tight">
                  {totalAPagar.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-extrabold text-red-600">{empresa.moeda}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Fornecedores homologados e compromissos tributários imediatos
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs relative z-10">
              <div className="flex items-center justify-between text-slate-600">
                <span>Fornecedores TI & Cloud (FAT-4410):</span>
                <span className="font-semibold text-blue-950">{debitoFornecedores.toLocaleString()} MT</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Obrigações Fiscais (INSS 7% + IRPS):</span>
                <span className="font-semibold text-red-700">{(obrigacoesInss + obrigacoesIrps).toLocaleString()} MT</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Telecomunicações & Infraestrutura:</span>
                <span className="font-semibold text-blue-950">{debitoTelecomFst.toLocaleString()} MT</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('contabilidade')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-red-200 hover:border-red-600"
            >
              Liquidar no Diário de Pagamentos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CARD 2: TOTAL A RECEBER */}
          <div className="bg-white border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <ArrowUpRight className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                    Créditos de Clientes
                  </span>
                  <h3 className="text-sm font-extrabold text-blue-950">Total a Receber</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                2 Facturas
              </span>
            </div>

            <div className="mt-4 relative z-10">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-950 font-mono tracking-tight">
                  {totalAReceber.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-extrabold text-emerald-600">{empresa.moeda}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Recebimentos contratuais previstos para os próximos 15 dias
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs relative z-10">
              {faturasReceber.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-slate-600">
                  <span className="truncate max-w-[170px]" title={f.cliente}>{f.cliente}:</span>
                  <span className="font-semibold text-emerald-700 font-mono">{f.valor.toLocaleString()} MT</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-slate-600 pt-0.5 border-t border-dashed border-slate-100">
                <span className="text-[11px]">Saldo Líquido Previsto (Receber - Pagar):</span>
                <span className="font-bold text-blue-950 font-mono">
                  +{(totalAReceber - totalAPagar).toLocaleString()} MT
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('bancos')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200 hover:border-emerald-600"
            >
              Conciliar Recebimentos Bancários <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CARD 3: PRÓXIMA FOLHA DE PAGAMENTO */}
          <div className="bg-white border-2 border-blue-200 hover:border-blue-500 rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 border border-blue-200">
                  <CalendarClock className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                    Recursos Humanos
                  </span>
                  <h3 className="text-sm font-extrabold text-blue-950">Próxima Folha de Pagamento</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Agendada
              </span>
            </div>

            <div className="mt-4 relative z-10">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-950 font-mono tracking-tight">
                  {estimativaLiquidoFolha.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-extrabold text-blue-700">{empresa.moeda}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Data Prevista de Quitação: <strong className="text-blue-950">{dataProximaFolha}</strong>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs relative z-10">
              <div className="flex items-center justify-between text-slate-600">
                <span>Colaboradores Abrangidos:</span>
                <span className="font-semibold text-blue-950">{totalFuncionariosAtivos} Colaboradores Ativos</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Custo Bruto Consolidado (c/ Encargos):</span>
                <span className="font-semibold text-blue-950">{estimativaCustoTotalFolha.toLocaleString()} MT</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Encargos Patronais INSS (4%):</span>
                <span className="font-semibold text-red-700">{(totalSalariosBaseAtivos * 0.04).toLocaleString()} MT</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('folha')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-800 text-blue-800 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-blue-200 hover:border-blue-800"
            >
              Apurar Mapa de Remunerações <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* --- GRÁFICO RECHARTS: EVOLUÇÃO DO FLUXO DE CAIXA --- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-blue-950 flex items-center gap-2">
                  Evolução do Fluxo de Caixa & Tesouraria
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                    Recharts Interativo
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Análise temporal comparativa entre Entradas (Recebimentos), Saídas (Operações/Folha) e Saldo Líquido
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setTipoGraficoFluxo('area')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  tipoGraficoFluxo === 'area'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-blue-950'
                }`}
              >
                Área de Tendência
              </button>
              <button
                onClick={() => setTipoGraficoFluxo('barras')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  tipoGraficoFluxo === 'barras'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-blue-950'
                }`}
              >
                Barras Comparativas
              </button>
            </div>

            <select
              value={filtroPeriodoFluxo}
              onChange={e => setFiltroPeriodoFluxo(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 text-blue-950 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="todos">Todo o Exercício (8 Meses)</option>
              <option value="ultimos6">Últimos 6 Meses</option>
            </select>
          </div>
        </div>

        {/* Resumo Rápido Acima do Gráfico */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 block">Total Entradas Período</span>
            <span className="text-base sm:text-lg font-black text-emerald-900 font-mono">
              {totalEntradasPeriodo.toLocaleString('pt-PT')} MT
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-50/70 border border-red-200">
            <span className="text-[11px] font-semibold text-red-800 block">Total Saídas Período</span>
            <span className="text-base sm:text-lg font-black text-red-900 font-mono">
              {totalSaidasPeriodo.toLocaleString('pt-PT')} MT
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
            <span className="text-[11px] font-semibold text-blue-800 block">Fluxo Líquido Acumulado</span>
            <span className="text-base sm:text-lg font-black text-blue-950 font-mono">
              +{saldoLiquidoPeriodo.toLocaleString('pt-PT')} MT
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-600 block">Cobertura de Caixa</span>
            <span className="text-base sm:text-lg font-black text-blue-950 font-mono">
              ~3.8x Meses
            </span>
          </div>
        </div>

        {/* Container do Gráfico Recharts */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {tipoGraficoFluxo === 'area' ? (
              <AreaChart data={dadosFluxo} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="corEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="corSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="corAcumulado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="periodo"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={value => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltipFluxo />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="entradas"
                  name="Entradas (Recebimentos)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#corEntradas)"
                />
                <Area
                  type="monotone"
                  dataKey="saidas"
                  name="Saídas (Operações e Folha)"
                  stroke="#dc2626"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#corSaidas)"
                />
                <Area
                  type="monotone"
                  dataKey="acumulado"
                  name="Saldo de Tesouraria Acumulado"
                  stroke="#1e3a8a"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#corAcumulado)"
                />
              </AreaChart>
            ) : (
              <BarChart data={dadosFluxo} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="periodo"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={value => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltipFluxo />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  iconType="square"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                />
                <Bar dataKey="entradas" name="Entradas (Recebimentos)" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas (Operações e Folha)" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saldoLiquido" name="Saldo Líquido Mensal" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Entradas Operacionais
            </span>
            <span className="flex items-center gap-1.5 text-red-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Saídas Correntes
            </span>
            <span className="flex items-center gap-1.5 text-blue-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-900" /> Tesouraria Acumulada
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            * Períodos marcados com (Prev) e (Proj) refletem simulações de fluxo com base nas receitas contratuais.
          </span>
        </div>
      </div>

      {/* Grid de KPIs Secundários (Disponibilidades, DRE, Conciliação) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPI 1: Disponibilidades Bancárias */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-red-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tesouraria & Bancos</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-blue-950 tracking-tight">
              {totalDisponibilidades.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-semibold text-slate-400">{empresa.moeda}</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% mês
              </span>
              <span className="font-medium text-blue-950">Millennium BIM + Standard Bank</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Volume de Negócios / Facturação */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-red-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Volume de Negócios (DRE)</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-blue-950 tracking-tight">
              {dre.volumeNegocios.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-semibold text-slate-400">{empresa.moeda}</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="text-blue-950 font-medium">
                Margem Bruta: {dre.volumeNegocios > 0 ? Math.round((dre.margemBruta / dre.volumeNegocios) * 100) : 0}%
              </span>
              <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 font-mono text-[10px] font-bold">
                PGC Cl. 7
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Conciliação Bancária & Conformidade */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-red-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conciliação Automática</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-blue-950 tracking-tight">
              {percentualConciliado}%{' '}
              <span className="text-xs font-semibold text-slate-400">Conciliado</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{conciliadasTx} de {totalTx} transações</span>
              <span
                className="text-red-600 font-bold cursor-pointer hover:underline"
                onClick={() => onNavigate('bancos')}
              >
                Ver Extrato Bancário →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MÓDULO DE GESTÃO DE ORÇAMENTOS E ALERTAS DE VARIAÇÃO */}
      <GestaoOrcamentos />

      {/* Painel Central: Gráficos e Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Demonstração Sintética do Resultado (DRE) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-red-600" />
                Estrutura de Resultados & Margens (PGC-NIRF)
              </h2>
              <p className="text-xs text-slate-500">
                Apuramento consolidado de vendas, custos com pessoal e margem operacional
              </p>
            </div>
            <button
              onClick={() => onNavigate('contabilidade')}
              className="text-xs text-red-600 hover:text-red-700 font-bold cursor-pointer"
            >
              Ver DRE Completa →
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {/* Barra 1: Volume de Negócios */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-950 font-semibold">1. Volume de Negócios (Vendas + Serviços)</span>
                <span className="text-red-700 font-black">
                  {dre.volumeNegocios.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Barra 2: Gastos com Pessoal */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-950 font-semibold">2. Gastos com o Pessoal (Salários + INSS 4% + Subsídios)</span>
                <span className="text-slate-800 font-bold">
                  - {dre.gastosPessoal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-900 h-full rounded-full"
                  style={{
                    width: dre.volumeNegocios > 0 ? `${Math.min(100, (dre.gastosPessoal / dre.volumeNegocios) * 100)}%` : '0%',
                  }}
                />
              </div>
            </div>

            {/* Barra 3: Fornecimentos e Serviços de Terceiros (FST) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-950 font-semibold">3. Fornecimentos e Serviços de Terceiros (FST)</span>
                <span className="text-slate-800 font-bold">
                  - {dre.fst.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-slate-500 h-full rounded-full"
                  style={{
                    width: dre.volumeNegocios > 0 ? `${Math.min(100, (dre.fst / dre.volumeNegocios) * 100)}%` : '0%',
                  }}
                />
              </div>
            </div>

            {/* Resultado Operacional */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between bg-red-50/60 p-4 rounded-xl border border-red-100">
              <div>
                <span className="text-xs text-slate-600 block font-medium">Resultado Operacional (EBIT)</span>
                <span className="text-lg font-black text-red-700 font-mono">
                  {dre.resultadoOperacional.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-600 block font-medium">Resultado Líquido Estimado</span>
                <span className="text-lg font-black text-blue-950 font-mono">
                  {dre.resultadoLiquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Despesas Reais de RH por Departamento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                Custos de Pessoal por Dept.
              </h2>
              <span className="text-xs text-slate-500">{funcionarios.length} Colaboradores</span>
            </div>

            <div className="mt-4 space-y-3">
              {resumoOrcamentos.map(item => {
                const totalGeral = totalGastoRealConsolidado;
                const perc = totalGeral > 0 ? Math.round((item.gastoReal / totalGeral) * 100) : 0;
                return (
                  <div key={item.departamento} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-950 truncate max-w-[170px] font-medium">{item.departamento}</span>
                      <span className="text-blue-950 font-bold">{item.gastoReal.toLocaleString()} MT ({perc}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-800 h-full rounded-full"
                        style={{ width: `${perc}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200">
            <button
              onClick={() => onNavigate('folha')}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-red-50 text-blue-950 hover:text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              Gerenciar Colaboradores & Folha →
            </button>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Indicadores de Auditoria, eSocial e Alertas Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Conformidade eSocial & Fisco */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Conformidade eSocial / Fisco
            </span>
            <FileCheck2 className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">S-1000 (Empregador):</span>
              <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Transmitido
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">S-1200 (Remunerações):</span>
              <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Transmitido
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">S-1210 (Pagamentos IRPS):</span>
              <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Validado
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Auditoria Mensal Pronta:</span>
              <span className="text-blue-950 font-bold">100% Conforme</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('esocial')}
            className="mt-4 w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold text-center block transition-colors cursor-pointer border border-red-200"
          >
            Aceder ao Módulo eSocial →
          </button>
        </div>

        {/* Card 2: Férias & Benefícios Corporativos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Férias & Benefícios
            </span>
            <Calendar className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Pedidos de Férias Pendentes:</span>
              <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {feriasPendentes} Requerimentos
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Férias Aprovadas Próximas:</span>
              <span className="text-blue-950 font-semibold">1 em Nov/2026</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Benefícios Ativos:</span>
              <span className="text-blue-950 font-semibold">Saúde, Seguro & Pensões</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Abono Pecuniário Solicitado:</span>
              <span className="text-blue-950 font-semibold">1 Colaborador</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ferias')}
            className="mt-4 w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold text-center block transition-colors cursor-pointer border border-red-200"
          >
            Gerenciar Escala de Férias →
          </button>
        </div>

        {/* Card 3: Auditoria & Partidas Dobradas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Integridade do Razão Contábil
            </span>
            <ShieldCheck className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Balanço Débitos:</span>
              <span className="text-blue-950 font-mono font-bold">
                {balancete.totalDebitos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Balanço Créditos:</span>
              <span className="text-blue-950 font-mono font-bold">
                {balancete.totalCreditos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Partidas Dobradas:</span>
              <span className={`font-bold ${!balancete.desbalanceado ? 'text-emerald-600' : 'text-red-600'}`}>
                {!balancete.desbalanceado ? '✓ Equilibradas (D = C)' : '⚠️ Desbalanceadas!'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Lançamentos no Razão:</span>
              <span className="text-red-700 font-bold">{lancamentos.length} Registros</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('contabilidade')}
            className="mt-4 w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold text-center block transition-colors cursor-pointer border border-red-200"
          >
            Ver Balancete de Verificação →
          </button>
        </div>
      </div>
    </div>
  );
};
