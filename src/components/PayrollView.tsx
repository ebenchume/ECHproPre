import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Funcionario, FolhaSalario, FolhaLinhaItem } from '../types';
import {
  Users,
  PlusCircle,
  PlayCircle,
  Link,
  CreditCard,
  FileText,
  Search,
  CheckCircle2,
  Printer,
  Calendar,
  Sparkles,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Building,
} from 'lucide-react';

export const PayrollView: React.FC = () => {
  const {
    empresa,
    funcionarios,
    adicionarFuncionario,
    atualizarFuncionario,
    folhas,
    processarFolhaMes,
    integrarFolhaContabilidade,
    pagarFolha,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'folhas' | 'funcionarios'>('folhas');
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2026);
  const [mesSelecionado, setMesSelecionado] = useState<number>(10);

  // Modal Novo Colaborador
  const [showFuncionarioModal, setShowFuncionarioModal] = useState(false);
  const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState<Funcionario | null>(null);
  const [buscaFuncionario, setBuscaFuncionario] = useState('');

  // Modal Recibo de Vencimento
  const [reciboVisualizacao, setReciboVisualizacao] = useState<FolhaLinhaItem | null>(null);

  // Form Colaborador
  const [formFunc, setFormFunc] = useState({
    nome: '',
    nuit: '',
    biNumero: '',
    dataNascimento: '1990-01-01',
    dataAdmissao: new Date().toISOString().substring(0, 10),
    cargo: '',
    departamento: 'Operações',
    salarioBase: 35000,
    numDependentes: 0,
    inssContribuinte: true,
    activo: true,
    email: '',
    telefone: '',
    banco: 'Millennium BIM',
    ibanOuConta: '',
  });

  // Obter folha ativa do mês/ano
  const folhaAtiva = folhas.find(f => f.ano === anoSelecionado && f.mes === mesSelecionado);

  const handleProcessar = () => {
    processarFolhaMes(anoSelecionado, mesSelecionado);
  };

  const handleIntegrar = (id: number) => {
    const res = integrarFolhaContabilidade(id);
    alert(res.mensagem);
  };

  const handlePagar = (id: number) => {
    const res = pagarFolha(id);
    alert(res.mensagem);
  };

  const handleSalvarFuncionario = () => {
    if (!formFunc.nome || !formFunc.salarioBase) return;
    if (funcionarioEmEdicao) {
      atualizarFuncionario({
        ...funcionarioEmEdicao,
        ...formFunc,
      });
    } else {
      adicionarFuncionario({
        idEmpresa: empresa.id,
        ...formFunc,
      });
    }
    setShowFuncionarioModal(false);
    setFuncionarioEmEdicao(null);
    setFormFunc({
      nome: '',
      nuit: '',
      biNumero: '',
      dataNascimento: '1990-01-01',
      dataAdmissao: new Date().toISOString().substring(0, 10),
      cargo: '',
      departamento: 'Operações',
      salarioBase: 35000,
      numDependentes: 0,
      inssContribuinte: true,
      activo: true,
      email: '',
      telefone: '',
      banco: 'Millennium BIM',
      ibanOuConta: '',
    });
  };

  const abrirEdicaoFuncionario = (f: Funcionario) => {
    setFuncionarioEmEdicao(f);
    setFormFunc({
      nome: f.nome,
      nuit: f.nuit,
      biNumero: f.biNumero,
      dataNascimento: f.dataNascimento,
      dataAdmissao: f.dataAdmissao,
      cargo: f.cargo,
      departamento: f.departamento,
      salarioBase: f.salarioBase,
      numDependentes: f.numDependentes,
      inssContribuinte: f.inssContribuinte,
      activo: f.activo,
      email: f.email,
      telefone: f.telefone,
      banco: f.banco,
      ibanOuConta: f.ibanOuConta,
    });
    setShowFuncionarioModal(true);
  };

  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const funcionariosFiltrados = funcionarios.filter(f =>
    !buscaFuncionario ||
    f.nome.toLowerCase().includes(buscaFuncionario.toLowerCase()) ||
    f.cargo.toLowerCase().includes(buscaFuncionario.toLowerCase()) ||
    f.departamento.toLowerCase().includes(buscaFuncionario.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Recursos Humanos & Folha de Pagamento Automatizada
            </h1>
            <p className="text-xs text-slate-500">
              Cálculo legal de retenção IRPS, INSS (3% + 4%), integração automática no Razão e pagamentos bancários em lote
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setFuncionarioEmEdicao(null);
              setShowFuncionarioModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-200 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Novo Colaborador
          </button>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('folhas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'folhas'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PlayCircle className="w-4 h-4" /> Processamento Mensal da Folha
        </button>

        <button
          onClick={() => setActiveTab('funcionarios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'funcionarios'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Cadastro de Colaboradores ({funcionarios.length})
        </button>
      </div>

      {/* ABA 1: PROCESSAMENTO DE FOLHA */}
      {activeTab === 'folhas' && (
        <div className="space-y-5">
          {/* Barra de Seleção de Competência e Disparo */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <span className="text-xs text-slate-700 font-bold">Competência:</span>
                <select
                  value={mesSelecionado}
                  onChange={e => setMesSelecionado(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                >
                  {mesesNomes.map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={anoSelecionado}
                  onChange={e => setAnoSelecionado(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              {folhaAtiva && (
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold uppercase font-mono ${
                    folhaAtiva.estado === 'contabilizada'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : folhaAtiva.estado === 'paga'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  Estado: {folhaAtiva.estado}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleProcessar}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-200 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" /> Processar Folha {mesSelecionado}/{anoSelecionado}
              </button>

              {folhaAtiva && (
                <>
                  <button
                    disabled={folhaAtiva.estado === 'contabilizada' || folhaAtiva.estado === 'paga'}
                    onClick={() => handleIntegrar(folhaAtiva.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      folhaAtiva.estado === 'contabilizada' || folhaAtiva.estado === 'paga'
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs cursor-pointer'
                    }`}
                  >
                    <Link className="w-3.5 h-3.5" />
                    {folhaAtiva.estado === 'contabilizada' || folhaAtiva.estado === 'paga'
                      ? 'Folha já Integrada'
                      : 'Integrar na Contabilidade'}
                  </button>

                  <button
                    disabled={folhaAtiva.estado === 'paga'}
                    onClick={() => handlePagar(folhaAtiva.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      folhaAtiva.estado === 'paga'
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    {folhaAtiva.estado === 'paga' ? 'Pagamento Liquidado' : 'Pagar em Lote via Banco'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Dados da Folha Ativa */}
          {folhaAtiva ? (
            <div className="space-y-4">
              {/* Quadro Resumo dos Totais */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Total Vencimento Base</span>
                  <p className="text-base font-bold text-slate-900 mt-1 font-mono">
                    {folhaAtiva.linhas
                      .reduce((a, b) => a + b.salarioBase, 0)
                      .toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
                    MT
                  </p>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium">INSS Retido (3% Trab)</span>
                  <p className="text-base font-bold text-red-700 mt-1 font-mono">
                    {folhaAtiva.linhas
                      .reduce((a, b) => a + b.inssTrabalhador, 0)
                      .toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
                    MT
                  </p>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium">INSS Encargo (4% Patronal)</span>
                  <p className="text-base font-bold text-slate-800 mt-1 font-mono">
                    {folhaAtiva.linhas
                      .reduce((a, b) => a + b.inssEmpresa, 0)
                      .toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
                    MT
                  </p>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Total Líquido a Pagar</span>
                  <p className="text-base font-black text-emerald-700 mt-1 font-mono">
                    {folhaAtiva.linhas
                      .reduce((a, b) => a + b.liquido, 0)
                      .toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
                    MT
                  </p>
                </div>
              </div>

              {/* Tabela de Detalhe por Colaborador */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-3 bg-red-50/70 border-b border-red-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-red-950">
                    Demonstrativo Nominal da Folha ({folhaAtiva.linhas.length} Colaboradores)
                  </span>
                  <span className="text-xs text-red-900 font-mono font-bold">
                    IRPS Total Retido:{' '}
                    <strong className="text-red-700">
                      {folhaAtiva.linhas.reduce((a, b) => a + b.irps, 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                    </strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 font-bold">Colaborador</th>
                        <th className="py-2.5 px-3 font-bold">Cargo & Dept</th>
                        <th className="py-2.5 px-3 text-right font-bold">Venc. Base</th>
                        <th className="py-2.5 px-3 text-right font-bold">Subsídios</th>
                        <th className="py-2.5 px-3 text-right font-bold">INSS (3%)</th>
                        <th className="py-2.5 px-3 text-right font-bold">IRPS Retido</th>
                        <th className="py-2.5 px-3 text-right font-bold">Líquido</th>
                        <th className="py-2.5 px-3 text-center font-bold">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {folhaAtiva.linhas.map(linha => (
                        <tr key={linha.id} className="hover:bg-red-50/20 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{linha.funcionarioNome}</td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                            {linha.cargo} • <span className="text-slate-500">{linha.departamento}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                            {linha.salarioBase.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            {(linha.subsidioAlimentacao + linha.subsidioTransporte + linha.outrosSubsidios).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-red-700">
                            {linha.inssTrabalhador.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                            {linha.irps.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                            {linha.liquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => setReciboVisualizacao(linha)}
                              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" /> Recibo
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <Users className="w-12 h-12 text-red-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                Folha de {mesesNomes[mesSelecionado - 1]} de {anoSelecionado} ainda não processada
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Clique no botão de processamento para calcular automaticamente o mapa de vencimentos com base nas alíquotas oficiais de INSS e IRPS.
              </p>
              <button
                onClick={handleProcessar}
                className="mt-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-200 cursor-pointer"
              >
                Calcular e Gerar Folha Agora
              </button>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: CADASTRO DE COLABORADORES */}
      {activeTab === 'funcionarios' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                placeholder="Pesquisar por nome, cargo ou departamento..."
                value={buscaFuncionario}
                onChange={e => setBuscaFuncionario(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funcionariosFiltrados.map(f => (
              <div
                key={f.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-red-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{f.nome}</h3>
                      <p className="text-xs text-red-600 font-bold">{f.cargo}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{f.departamento}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.activo
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {f.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">NUIT / BI:</span>
                      <span className="text-slate-800 font-mono font-bold">{f.nuit || f.biNumero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Salário Base:</span>
                      <span className="text-slate-900 font-mono font-black">
                        {f.salarioBase.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dependentes IRPS:</span>
                      <span className="text-slate-800 font-mono font-bold">{f.numDependentes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Banco & Conta:</span>
                      <span className="text-slate-800 text-[11px] font-medium truncate max-w-[170px]">{f.banco}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => abrirEdicaoFuncionario(f)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Editar Cadastro
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: RECIBO DE VENCIMENTO INDIVIDUAL */}
      {reciboVisualizacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-red-700 text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-100" />
                Recibo Oficial de Vencimentos • {mesSelecionado}/{anoSelecionado}
              </span>
              <button
                onClick={() => setReciboVisualizacao(null)}
                className="text-red-100 hover:text-white cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Cabeçalho da Empresa e do Colaborador */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">{empresa.nome}</h2>
                    <p className="text-slate-500 text-[11px]">NUIT: {empresa.nuit} • {empresa.endereco}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-mono text-[11px] font-bold border border-red-200">
                    PGC-NIRF
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-slate-700 font-medium">
                  <div>Colaborador: <strong className="text-slate-900">{reciboVisualizacao.funcionarioNome}</strong></div>
                  <div>Cargo: <strong className="text-slate-900">{reciboVisualizacao.cargo}</strong></div>
                  <div>Departamento: <span className="text-slate-600">{reciboVisualizacao.departamento}</span></div>
                  <div>Período: <span className="text-slate-600">{mesSelecionado}/{anoSelecionado}</span></div>
                </div>
              </div>

              {/* Rubricas */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-red-50 text-red-900 text-[11px] font-bold border-b border-red-200">
                    <tr>
                      <th className="p-2.5">Código / Descrição da Rubrica</th>
                      <th className="p-2.5 text-right">Rendimentos</th>
                      <th className="p-2.5 text-right">Descontos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                    <tr>
                      <td className="p-2.5 font-medium">001 - Vencimento Base Mensal</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {reciboVisualizacao.salarioBase.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-400">-</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">102 - Subsídio de Alimentação</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {reciboVisualizacao.subsidioAlimentacao.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-400">-</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">103 - Subsídio de Transporte</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {reciboVisualizacao.subsidioTransporte.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-400">-</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">501 - Segurança Social INSS (3% Trabalhador)</td>
                      <td className="p-2.5 text-right font-mono text-slate-400">-</td>
                      <td className="p-2.5 text-right font-mono font-bold text-red-700">
                        {reciboVisualizacao.inssTrabalhador.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">502 - Retenção de IRPS na Fonte</td>
                      <td className="p-2.5 text-right font-mono text-slate-400">-</td>
                      <td className="p-2.5 text-right font-mono font-bold text-red-700">
                        {reciboVisualizacao.irps.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-red-50 font-black border-t-2 border-red-200">
                    <tr>
                      <td className="p-3 text-red-950 uppercase text-xs">VALOR LÍQUIDO A RECEBER</td>
                      <td colSpan={2} className="p-3 text-right font-mono text-base font-black text-red-700">
                        {reciboVisualizacao.liquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex justify-between">
                <span>Encargo Patronal INSS (4% Empresa): {reciboVisualizacao.inssEmpresa.toFixed(2)} MT</span>
                <span className="font-bold text-slate-700">Transferência Bancária Directa</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setReciboVisualizacao(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-200 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRO / EDIÇÃO DE COLABORADOR */}
      {showFuncionarioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 my-8">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <Users className="w-4 h-4 text-red-600" />
              {funcionarioEmEdicao ? 'Editar Colaborador' : 'Admissão de Novo Colaborador'}
            </h3>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Nome Completo:</label>
                <input
                  type="text"
                  placeholder="Nome do colaborador"
                  value={formFunc.nome}
                  onChange={e => setFormFunc({ ...formFunc, nome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">NUIT (Fiscal):</label>
                  <input
                    type="text"
                    placeholder="9 dígitos"
                    value={formFunc.nuit}
                    onChange={e => setFormFunc({ ...formFunc, nuit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">BI / Identificação:</label>
                  <input
                    type="text"
                    value={formFunc.biNumero}
                    onChange={e => setFormFunc({ ...formFunc, biNumero: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Cargo / Função:</label>
                  <input
                    type="text"
                    value={formFunc.cargo}
                    onChange={e => setFormFunc({ ...formFunc, cargo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Departamento:</label>
                  <select
                    value={formFunc.departamento}
                    onChange={e => setFormFunc({ ...formFunc, departamento: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600"
                  >
                    <option value="Finanças e Contabilidade">Finanças e Contabilidade</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Tecnologia da Informação">Tecnologia da Informação</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Operações">Operações</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Vencimento Base (MT):</label>
                  <input
                    type="number"
                    step="500"
                    value={formFunc.salarioBase}
                    onChange={e => setFormFunc({ ...formFunc, salarioBase: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Dependentes IRPS:</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formFunc.numDependentes}
                    onChange={e => setFormFunc({ ...formFunc, numDependentes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Banco Principal:</label>
                  <select
                    value={formFunc.banco}
                    onChange={e => setFormFunc({ ...formFunc, banco: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600"
                  >
                    <option value="Millennium BIM">Millennium BIM</option>
                    <option value="Standard Bank">Standard Bank</option>
                    <option value="BCI">BCI</option>
                    <option value="Moza Banco">Moza Banco</option>
                    <option value="Absa Bank">Absa Bank</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">IBAN / Conta Bancária:</label>
                  <input
                    type="text"
                    value={formFunc.ibanOuConta}
                    onChange={e => setFormFunc({ ...formFunc, ibanOuConta: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={formFunc.inssContribuinte}
                    onChange={e => setFormFunc({ ...formFunc, inssContribuinte: e.target.checked })}
                    className="rounded bg-slate-100 border-slate-300 text-red-600 focus:ring-0"
                  />
                  <span>Contribui para INSS (3% + 4%)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={formFunc.activo}
                    onChange={e => setFormFunc({ ...formFunc, activo: e.target.checked })}
                    className="rounded bg-slate-100 border-slate-300 text-red-600 focus:ring-0"
                  />
                  <span>Colaborador Activo</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowFuncionarioModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarFuncionario}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md shadow-red-200 cursor-pointer"
              >
                Salvar Colaborador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
