import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventoeSocial } from '../types';
import {
  FileCheck2,
  Send,
  Code,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ESocialFiscalView: React.FC = () => {
  const {
    empresa,
    eventoseSocial,
    transmitirEventoeSocial,
    gerarNovoEventoeSocial,
    folhas,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'eventos' | 'auditoria_fiscal'>('eventos');
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoeSocial | null>(eventoseSocial[0] || null);
  const [transmitindoId, setTransmitindoId] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const handleTransmitir = async (id: string) => {
    setTransmitindoId(id);
    await transmitirEventoeSocial(id);
    setTransmitindoId(null);
  };

  const handleCopiarXML = (xml: string) => {
    navigator.clipboard.writeText(xml);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const ultimaFolha = folhas[0];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <FileCheck2 className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Conformidade eSocial & Relatórios Fiscais Oficiais
            </h1>
            <p className="text-xs text-slate-500">
              Geração de schemas XML validados (S-1000 a S-2230), transmissão com certificado e mapas de retenções para auditorias mensais
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => gerarNovoEventoeSocial('S-1200', '2026-10')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-200 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Gerar Evento S-1200 Folha
          </button>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('eventos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'eventos'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Code className="w-4 h-4" /> Eventos & Transmissões ({eventoseSocial.length})
        </button>

        <button
          onClick={() => setActiveTab('auditoria_fiscal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'auditoria_fiscal'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Relatórios Automáticos de Auditoria Mensal
        </button>
      </div>

      {/* ABA 1: EVENTOS ESOCIAL */}
      {activeTab === 'eventos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Lista de Eventos */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider px-1">
              Eventos Oficiais Gerados
            </h3>

            {eventoseSocial.map(evt => (
              <div
                key={evt.id}
                onClick={() => setEventoSelecionado(evt)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  eventoSelecionado?.id === evt.id
                    ? 'bg-red-50/70 border-red-400 shadow-md ring-1 ring-red-400'
                    : 'bg-white border-slate-200 hover:border-red-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-red-700 px-2 py-0.5 rounded-md bg-red-100/70 border border-red-200">
                    {evt.codigoEvento}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono ${
                      evt.status === 'transmitido'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs mt-2">{evt.nomeEvento}</h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{evt.resumo}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium">Ref: {evt.periodoReferencia}</span>
                  {evt.protocolo && (
                    <span className="text-slate-600 font-mono text-[10px] truncate max-w-[150px] font-semibold">
                      Prot: {evt.protocolo.slice(0, 14)}...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Coluna Direita: Visualizador de XML e Transmissão */}
          <div className="lg:col-span-7">
            {eventoSelecionado ? (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full">
                <div className="p-4 bg-red-700 text-white flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-100 font-mono font-bold text-xs bg-red-800/60 px-2 py-0.5 rounded border border-red-600">
                        {eventoSelecionado.codigoEvento}
                      </span>
                      <span className="text-white font-bold text-xs">
                        {eventoSelecionado.nomeEvento}
                      </span>
                    </div>
                    {eventoSelecionado.protocolo && (
                      <p className="text-[11px] text-red-100 font-mono mt-1 font-semibold">
                        Protocolo de Recepção: {eventoSelecionado.protocolo}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopiarXML(eventoSelecionado.xmlPayload)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" /> {copiado ? 'Copiado!' : 'Copiar XML'}
                    </button>

                    {eventoSelecionado.status !== 'transmitido' && (
                      <button
                        disabled={transmitindoId === eventoSelecionado.id}
                        onClick={() => handleTransmitir(eventoSelecionado.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-700 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {transmitindoId === eventoSelecionado.id ? 'Transmitindo...' : 'Transmitir ao Fisco'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 bg-slate-50 overflow-x-auto border-t border-slate-200">
                  <pre className="text-[11px] font-mono text-slate-800 leading-relaxed">
                    {eventoSelecionado.xmlPayload}
                  </pre>
                </div>

                <div className="p-3 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between font-medium">
                  <span>Assinatura Digital: ICP / Certificado A1 Válido</span>
                  <span className="text-emerald-700 font-bold">✓ Ambiente de Produção Conectado</span>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs">
                Selecione um evento à esquerda para inspecionar a estrutura XML.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: RELATÓRIOS AUTOMÁTICOS PARA AUDITORIA MENSAL */}
      {activeTab === 'auditoria_fiscal' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-red-600 tracking-wider">
                  Auditorias & Fiscalização
                </span>
                <h2 className="text-base font-black text-slate-900 tracking-tight mt-0.5">
                  Mapa Fiscal Mensal de Retenções e Contribuições
                </h2>
                <p className="text-xs text-slate-500">
                  Resumo auditável pronto para inspecções da Autoridade Tributária e INSS
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-red-600" /> Imprimir Relatório de Auditoria
              </button>
            </div>

            {ultimaFolha ? (
              <div className="mt-5 space-y-4 text-xs">
                {/* Resumo Consolidado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-600 text-[11px] font-medium">Guia INSS 7% Total a Recolher:</span>
                    <p className="text-lg font-bold text-slate-900 font-mono mt-1">
                      {(
                        ultimaFolha.linhas.reduce((a, b) => a + b.inssTrabalhador, 0) +
                        ultimaFolha.linhas.reduce((a, b) => a + b.inssEmpresa, 0)
                      ).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
                      MT
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Trabalhador 3% + Empresa 4%
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-600 text-[11px] font-medium">Guia IRPS Retido na Fonte:</span>
                    <p className="text-lg font-bold text-red-700 font-mono mt-1">
                      {ultimaFolha.linhas
                        .reduce((a, b) => a + b.irps, 0)
                        .toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
                      MT
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Tabela progressiva com dependentes</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-600 text-[11px] font-medium">Status de Auditoria Contábil:</span>
                    <p className="text-lg font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Auditável
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Partidas dobradas conferidas</p>
                  </div>
                </div>

                {/* Tabela Nominal de Retenções */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-red-50 text-red-900 text-[11px] font-bold border-b border-red-200">
                      <tr>
                        <th className="p-2.5">NUIT</th>
                        <th className="p-2.5">Nome do Trabalhador</th>
                        <th className="p-2.5 text-right">Salário Sujeito</th>
                        <th className="p-2.5 text-right">INSS Trab. (3%)</th>
                        <th className="p-2.5 text-right">INSS Emp. (4%)</th>
                        <th className="p-2.5 text-right">IRPS Retido</th>
                        <th className="p-2.5 text-right">Total Recolhimento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                      {ultimaFolha.linhas.map(l => (
                        <tr key={l.id} className="hover:bg-red-50/20 transition-colors">
                          <td className="p-2.5 font-mono text-red-700 font-bold">{l.id}</td>
                          <td className="p-2.5 font-bold text-slate-900">{l.funcionarioNome}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                            {l.salarioBase.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-700">
                            {l.inssTrabalhador.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-700">
                            {l.inssEmpresa.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-red-700">
                            {l.irps.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {(l.inssTrabalhador + l.inssEmpresa + l.irps).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500">Nenhuma folha processada no período.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
