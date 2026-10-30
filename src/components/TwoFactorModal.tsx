import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  QrCode,
} from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onClose }) => {
  const { doisFatoresAtivo, alternar2FA, verificarCodigo2FA, usuarioAtual } = useApp();

  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidarCodigo = () => {
    if (codigo.trim().length !== 6) {
      setErro('Por favor informe o código de 6 dígitos gerado pelo Authenticator.');
      return;
    }

    const ok = verificarCodigo2FA(codigo);
    if (ok) {
      setSucesso('Autenticação de 2 Fatores validada com sucesso!');
      setErro(null);
      setTimeout(() => {
        onClose();
        setSucesso(null);
        setCodigo('');
      }, 1200);
    } else {
      setErro('Código inválido ou expirado. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-800">
        {/* Topo em Vermelho */}
        <div className="p-4 bg-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/20 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Central de Segurança 2FA</h3>
              <p className="text-[11px] text-red-100">Autenticação em Dois Fatores TOTP</p>
            </div>
          </div>
          <button onClick={onClose} className="text-red-100 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-4 text-xs">
          {sucesso && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{sucesso}</span>
            </div>
          )}

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Status Atual */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Proteção 2FA na Conta:</span>
              <span className="font-bold text-slate-900">{usuarioAtual.email}</span>
            </div>
            <button
              onClick={() => alternar2FA(!doisFatoresAtivo)}
              className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                doisFatoresAtivo
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {doisFatoresAtivo ? 'Ativo ✓' : 'Ativar Agora'}
            </button>
          </div>

          {/* Instruções TOTP */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-center">
            <div className="w-16 h-16 mx-auto bg-white rounded-xl flex items-center justify-center border border-slate-200 text-red-600 shadow-xs">
              <QrCode className="w-10 h-10" />
            </div>
            <div>
              <p className="text-slate-700 font-bold text-xs">Chave de Configuração Manual:</p>
              <p className="font-mono text-red-700 text-xs font-black mt-0.5 tracking-wider">
                JBSW Y3DP EHPK 3PXP
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              Insira o código de 6 dígitos gerado no Google Authenticator, Microsoft Authenticator ou 1Password:
            </p>
          </div>

          {/* Input Código */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold block">Código de Verificação (6 Dígitos):</label>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={codigo}
                onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleValidarCodigo();
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-center text-xl font-mono font-black text-red-700 tracking-widest focus:outline-none focus:border-red-600 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 font-semibold cursor-pointer"
          >
            Fechar
          </button>
          <button
            onClick={handleValidarCodigo}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-200 cursor-pointer"
          >
            Validar & Confirmar Sessão
          </button>
        </div>
      </div>
    </div>
  );
};
