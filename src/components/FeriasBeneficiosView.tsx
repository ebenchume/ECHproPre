import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SolicitacaoFerias, Beneficio } from '../types';
import {
  Palmtree,
  PlusCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  HeartPulse,
  Shield,
  Briefcase,
  Search,
  Filter,
} from 'lucide-react';

export const FeriasBeneficiosView: React.FC = () => {
  const {
    empresa,
    funcionarios,
    ferias,
    solicitarFerias,
    atualizarStatusFerias,
    beneficios,
    adicionarBeneficio,
    alternarBeneficio,
    usuarioAtual,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ferias' | 'beneficios'>('ferias');
  const [showNovaFeriasModal, setShowNovaFeriasModal] = useState(false);
  const [showNovoBeneficioModal, setShowNovoBeneficioModal] = useState(false);

  // Form Férias
  const [formFerias, setFormFerias] = useState({
    idFuncionario: funcionarios[0]?.id || 1,
    dataInicio: '2026-12-01',
    dataFim: '2026-12-15',
    diasTotais: 15,
    abonoPecuniario: false,
    motivo: 'Férias regulares anuais',
  });

  // Form Benefício
  const [formBen, setFormBen] = useState<{
    idFuncionario: number;
    tipo: 'saude' | 'alimentacao' | 'transporte' | 'seguro_vida' | 'creche' | 'previdencia';
    nomeBeneficio: string;
    custoEmpresa: number;
    descontoColaborador: number;
    dataInicio: string;
  }>({
    idFuncionario: funcionarios[0]?.id || 1,
    tipo: 'saude',
    nomeBeneficio: 'Plano Odontológico & Oftalmológico',
    custoEmpresa: 1800,
    descontoColaborador: 200,
    dataInicio: new Date().toISOString().substring(0, 10),
  });

  const handleSalvarFerias = () => {
    const func = funcionarios.find(f => f.id === formFerias.idFuncionario);
    if (!func) return;

    solicitarFerias({
      idFuncionario: func.id,
      funcionarioNome: func.nome,
      departamento: func.departamento,
      dataInicio: formFerias.dataInicio,
      dataFim: formFerias.dataFim,
      diasTotais: Number(formFerias.diasTotais),
      abonoPecuniario: formFerias.abonoPecuniario,
      motivo: formFerias.motivo,
    });
    setShowNovaFeriasModal(false);
  };

  const handleSalvarBeneficio = () => {
    const func = funcionarios.find(f => f.id === formBen.idFuncionario);
    if (!func) return;

    adicionarBeneficio({
      idFuncionario: func.id,
      funcionarioNome: func.nome,
      tipo: formBen.tipo,
      nomeBeneficio: formBen.nomeBeneficio,
      custoEmpresa: Number(formBen.custoEmpresa),
      descontoColaborador: Number(formBen.descontoColaborador),
      activo: true,
      dataInicio: formBen.dataInicio,
    });
    setShowNovoBeneficioModal(false);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <Palmtree className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Gestão de Férias & Benefícios Corporativos
            </h1>
            <p className="text-xs text-slate-500">
              Escala de férias, cálculo de subsídios de descanso, abonos e gestão de planos de saúde e previdência
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'ferias' ? (
            <button
              onClick={() => setShowNovaFeriasModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-200 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Solicitar Férias
            </button>
          ) : (
            <button
              onClick={() => setShowNovoBeneficioModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-200 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Novo Benefício
            </button>
          )}
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('ferias')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'ferias'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" /> Escala & Pedidos de Férias ({ferias.length})
        </button>

        <button
          onClick={() => setActiveTab('beneficios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'beneficios'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HeartPulse className="w-4 h-4" /> Benefícios & Seguros ({beneficios.length})
        </button>
      </div>

      {/* ABA 1: FÉRIAS */}
      {activeTab === 'ferias' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total de Pedidos</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{ferias.length}</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Aguardando Parecer</span>
              <p className="text-xl font-bold text-amber-700 mt-1">
                {ferias.filter(f => f.status === 'pendente').length} Pendentes
              </p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Aprovados & Programados</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">
                {ferias.filter(f => f.status === 'aprovado').length} Programados
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-red-50 text-red-900 border-b border-red-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Ref.</th>
                  <th className="py-2.5 px-3 font-bold">Colaborador</th>
                  <th className="py-2.5 px-3 font-bold">Período de Gozo</th>
                  <th className="py-2.5 px-3 text-center font-bold">Dias</th>
                  <th className="py-2.5 px-3 text-right font-bold">Subsídio Estimado</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 text-center font-bold">Ações de Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ferias.map(item => (
                  <tr key={item.id} className="hover:bg-red-50/20 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-red-700 font-bold">{item.id}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{item.funcionarioNome}</p>
                      <p className="text-[10px] text-slate-500">{item.departamento}</p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                      {item.dataInicio} até {item.dataFim}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                      {item.diasTotais} dias
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-bold">
                      {item.valorSubsidioFerias.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                          item.status === 'aprovado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'pendente'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.status === 'pendente' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => atualizarStatusFerias(item.id, 'aprovado')}
                            className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => atualizarStatusFerias(item.id, 'rejeitado')}
                            className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Rejeitar
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          {item.aprovadoPor ? `Por ${item.aprovadoPor}` : 'Concluído'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: BENEFÍCIOS */}
      {activeTab === 'beneficios' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beneficios.map(b => (
              <div
                key={b.id}
                className={`bg-white border rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between ${
                  b.activo ? 'border-slate-200 hover:border-red-200' : 'border-slate-200/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                        {b.tipo === 'saude' ? (
                          <HeartPulse className="w-4 h-4" />
                        ) : b.tipo === 'previdencia' ? (
                          <Briefcase className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">{b.nomeBeneficio}</h3>
                        <p className="text-[11px] text-slate-500">{b.funcionarioNome}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Custo Empresa:</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        {b.custoEmpresa.toLocaleString()} MT/mês
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Desconto Colaborador:</span>
                      <span className="font-mono text-amber-700 font-bold">
                        {b.descontoColaborador.toLocaleString()} MT/mês
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Início de Vigência:</span>
                      <span className="text-slate-600 font-mono text-[11px] font-medium">{b.dataInicio}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      b.activo
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {b.activo ? 'Activo' : 'Suspenso'}
                  </span>
                  <button
                    onClick={() => alternarBeneficio(b.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
                  >
                    {b.activo ? 'Desativar' : 'Reativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: SOLICITAR FÉRIAS */}
      {showNovaFeriasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <Palmtree className="w-4 h-4 text-red-600" /> Solicitar Período de Férias
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Colaborador:</label>
                <select
                  value={formFerias.idFuncionario}
                  onChange={e => setFormFerias({ ...formFerias, idFuncionario: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600"
                >
                  {funcionarios.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.nome} ({f.cargo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Data Início:</label>
                  <input
                    type="date"
                    value={formFerias.dataInicio}
                    onChange={e => setFormFerias({ ...formFerias, dataInicio: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Data Fim:</label>
                  <input
                    type="date"
                    value={formFerias.dataFim}
                    onChange={e => setFormFerias({ ...formFerias, dataFim: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Dias Consecutivos:</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formFerias.diasTotais}
                  onChange={e => setFormFerias({ ...formFerias, diasTotais: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Motivo / Observação:</label>
                <input
                  type="text"
                  value={formFerias.motivo}
                  onChange={e => setFormFerias({ ...formFerias, motivo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNovaFeriasModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarFerias}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md shadow-red-200 cursor-pointer"
              >
                Submeter Solicitação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO BENEFÍCIO */}
      {showNovoBeneficioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <HeartPulse className="w-4 h-4 text-red-600" /> Atribuir Benefício
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Colaborador:</label>
                <select
                  value={formBen.idFuncionario}
                  onChange={e => setFormBen({ ...formBen, idFuncionario: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600"
                >
                  {funcionarios.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Tipo de Benefício:</label>
                <select
                  value={formBen.tipo}
                  onChange={e => setFormBen({ ...formBen, tipo: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600"
                >
                  <option value="saude">Plano de Saúde / Médico</option>
                  <option value="previdencia">Fundo de Pensões Privado</option>
                  <option value="seguro_vida">Seguro de Vida e Acidentes</option>
                  <option value="alimentacao">Vale / Subsídio Alimentação Extra</option>
                  <option value="transporte">Subsídio de Mobilidade / Combustível</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Designação / Nome do Plano:</label>
                <input
                  type="text"
                  value={formBen.nomeBeneficio}
                  onChange={e => setFormBen({ ...formBen, nomeBeneficio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Custo Empresa (MT):</label>
                  <input
                    type="number"
                    value={formBen.custoEmpresa}
                    onChange={e => setFormBen({ ...formBen, custoEmpresa: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Desconto Colaborador (MT):</label>
                  <input
                    type="number"
                    value={formBen.descontoColaborador}
                    onChange={e => setFormBen({ ...formBen, descontoColaborador: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNovoBeneficioModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarBeneficio}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md shadow-red-200 cursor-pointer"
              >
                Salvar Benefício
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
