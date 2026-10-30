import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ContaUsuario, PerfilUsuario } from '../types';
import {
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  KeyRound,
  LogIn,
  AlertCircle,
  Briefcase,
  Users,
  Eye,
  EyeOff,
  UserCheck,
  Building,
  Sparkles,
  Phone,
  Mail,
  ShieldAlert,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBloqueado?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, isBloqueado = false }) => {
  const { contasUsuarios, usuarioAtual, fazerLogin, trocarUsuarioRapido } = useApp();

  const [modoAba, setModoAba] = useState<'rapido' | 'formulario'>('rapido');
  const [emailOuId, setEmailOuId] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTrocaRapida = (conta: ContaUsuario) => {
    trocarUsuarioRapido(conta.id);
    setSucesso(`Sessão iniciada como ${conta.nome} (${conta.cargo})`);
    setErro(null);
    setTimeout(() => {
      setSucesso(null);
      onClose();
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    const resultado = fazerLogin(emailOuId, senha);
    if (resultado.sucesso) {
      setSucesso(resultado.mensagem);
      setTimeout(() => {
        setSucesso(null);
        onClose();
      }, 700);
    } else {
      setErro(resultado.mensagem);
    }
  };

  const getPerfilBadge = (perfil: PerfilUsuario) => {
    switch (perfil) {
      case 'administrador':
        return { label: 'Administrador', cor: 'bg-red-100 text-red-800 border-red-200' };
      case 'gerente_financeiro':
        return { label: 'Gerente Financeiro', cor: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'gerente_rh':
        return { label: 'Gerente de RH', cor: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'funcionario':
        return { label: 'Funcionário / Colaborador', cor: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'auditor':
        return { label: 'Auditor Tributário', cor: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: perfil, cor: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-slate-800 relative">
        {/* Cabeçalho do Modal */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white p-6 relative">
          {!isBloqueado && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-red-700 flex items-center justify-center shadow-lg font-black text-xl">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  {isBloqueado ? 'Ecrã Bloqueado' : 'Gestão de Sessão & Contas'}
                </span>
                <span className="text-xs text-red-100 font-mono">ECHpro ERP</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                {isBloqueado ? 'Efetue Login para Continuar' : 'Autenticação & Troca de Utilizador'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-red-100 mt-2 leading-relaxed">
            Selecione uma conta pré-configurada para testar os diferentes perfis de acesso (Administrador, Gerentes, Funcionários e Auditores) ou insira as credenciais.
          </p>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 text-xs font-bold">
          <button
            onClick={() => setModoAba('rapido')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              modoAba === 'rapido'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Seleção Rápida de Perfil ({contasUsuarios.length})
          </button>
          <button
            onClick={() => setModoAba('formulario')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              modoAba === 'formulario'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" /> Login com Email & Senha
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {erro && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{sucesso}</span>
            </div>
          )}

          {/* MODO A: SELEÇÃO RÁPIDA DE CONTAS */}
          {modoAba === 'rapido' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Clique sobre qualquer conta para alternar imediatamente a sessão:</span>
                <span className="font-bold text-slate-700">Utilizador Ativo: {usuarioAtual.nome}</span>
              </div>

              <div className="space-y-2.5">
                {contasUsuarios.map(conta => {
                  const badge = getPerfilBadge(conta.perfil);
                  const isCurrent = conta.id === usuarioAtual.id;

                  return (
                    <div
                      key={conta.id}
                      onClick={() => handleTrocaRapida(conta)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isCurrent
                          ? 'border-red-600 bg-red-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-red-300 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl ${conta.avatarCor || 'bg-red-700'} text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0`}
                        >
                          {conta.nome.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs truncate group-hover:text-red-700 transition-colors">
                              {conta.nome}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${badge.cor}`}
                            >
                              {badge.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sessão Ativa
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {conta.cargo} • <span className="font-mono">{conta.email}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] font-bold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Entrar →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODO B: FORMULÁRIO DE LOGIN CONVENCIONAL */}
          {modoAba === 'formulario' && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Email Corporativo ou ID de Utilizador
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="ex: ebenchume@sapo.mz ou USR-001"
                    value={emailOuId}
                    onChange={e => setEmailOuId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>Dica de senha padrão: <strong>admin123</strong>, <strong>gerente123</strong>, <strong>colab123</strong></span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" /> Aceder ao Sistema ECHpro
              </button>
            </form>
          )}

          {/* Rodapé com Suporte Técnico */}
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>
                Suporte Técnico: <strong>+258 827473434</strong> • <strong>ebenchume@sapo.mz</strong>
              </span>
            </div>
            {!isBloqueado && (
              <button
                onClick={onClose}
                className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
