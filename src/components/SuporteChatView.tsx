import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Headphones,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  HelpCircle,
  FileText,
  Clock,
  Phone,
  Mail,
  KeyRound,
  Laptop,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  remetente: 'usuario' | 'suporte';
  nome: string;
  texto: string;
  dataHora: string;
}

export const SuporteChatView: React.FC = () => {
  const { usuarioAtual, empresa, licenca } = useApp();

  const [mensagens, setMensagens] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      remetente: 'suporte',
      nome: 'Dra. Elsa Tembe (Consultora Fiscal Sénior - ECHpro)',
      texto: `Olá ${usuarioAtual.nome}! Bem-vindo ao canal de Suporte Técnico Dedicado da ECHpro. Estamos online para apoiar na parametrização contábil do PGC-NIRF, retenções fiscais de IRPS/INSS, transmissão do eSocial e reconciliação bancária. Como posso auxiliá-lo hoje?`,
      dataHora: '07:30',
    },
  ]);

  const [inputTexto, setInputTexto] = useState('');
  const [isDigitando, setIsDigitando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens, isDigitando]);

  const handleEnviarMensagem = (textoEnvio?: string) => {
    const texto = textoEnvio || inputTexto;
    if (!texto.trim()) return;

    const agora = new Date().toTimeString().slice(0, 5);
    const novaMsgUsuario: ChatMessage = {
      id: `msg-${Date.now()}`,
      remetente: 'usuario',
      nome: usuarioAtual.nome,
      texto,
      dataHora: agora,
    };

    setMensagens(prev => [...prev, novaMsgUsuario]);
    if (!textoEnvio) setInputTexto('');
    setIsDigitando(true);

    // Resposta inteligente e contextual baseada nas normas fiscais de Moçambique e eSocial
    setTimeout(() => {
      let resposta = '';
      const t = texto.toLowerCase();

      if (t.includes('irps') || t.includes('imposto')) {
        resposta = `Sobre a retenção de IRPS (Lei 33/2007 e alterações): O cálculo no ECHpro é progressivo. São isentos rendimentos até 20.250,00 MT. Acima deste valor aplicam-se as alíquotas marginais (10% a 32%), com dedução por dependente legal informado no cadastro do colaborador. Os valores retidos são lançados automaticamente a crédito na conta 2.4.6.1 do PGC-NIRF.`;
      } else if (t.includes('inss') || t.includes('segurança social')) {
        resposta = `O regime geral da Segurança Social (INSS) estipula 7% no total sobre as remunerações sujeitas: 3% suportados pelo colaborador (desconto em folha) e 4% de encargo patronal pela empresa. No ECHpro, ao processar e integrar a folha, debita-se a conta 6.2.3 (INSS Empresa) e credita-se a conta 2.4.5 (INSS a Pagar).`;
      } else if (t.includes('fecho') || t.includes('exercício') || t.includes('irpc')) {
        resposta = `Para o Fecho de Exercício Fiscal: O módulo contábil do ECHpro zera todas as contas com saldo nas Classes 6 (Gastos) e 7 (Rendimentos), transferindo os resultados para a conta 8.1. Havendo lucro tributável, o sistema calcula o IRPC à taxa oficial de 32% e gera o lançamento correspondente contra a conta 2.4.6.2.`;
      } else if (t.includes('banco') || t.includes('conciliação') || t.includes('api')) {
        resposta = `A sincronização bancária opera via webhooks seguros e APIs com Millennium BIM e Standard Bank. Quando um movimento a crédito ou débito é detectado, você pode clicar em "Conciliar Auto" para gerar imediatamente a partida dobrada correspondente com a conta de clientes (2.1.1) ou fornecedores (2.2.1).`;
      } else if (t.includes('esocial') || t.includes('evento')) {
        resposta = `O módulo eSocial gera os schemas XML oficiais válidos: S-1000 (Cadastro Empregador), S-2200 (Admissões), S-1200 (Folha Nominal) e S-1210 (Pagamentos). Você pode validar o schema diretamente no visualizador e acionar a transmissão com certificado A1/A3 criptografado.`;
      } else {
        resposta = `Excelente questão. Os dados informados já constam parametrizados no banco de dados e refletem em tempo real no Razão Contábil da ${empresa.nome}. Posso auxiliá-lo em algum lançamento específico ou emissão de relatório?`;
      }

      setMensagens(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          remetente: 'suporte',
          nome: 'Dra. Elsa Tembe (Consultora Fiscal Sénior)',
          texto: resposta,
          dataHora: new Date().toTimeString().slice(0, 5),
        },
      ]);
      setIsDigitando(false);
    }, 1000);
  };

  const duvidasFrequentes = [
    'Como calcular as alíquotas de IRPS e deduções?',
    'Qual a regra de contabilização do INSS (3% + 4%)?',
    'Como conciliar extratos de Millennium BIM e Standard Bank?',
    'Como validar e transmitir o evento S-1200 do eSocial?',
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <Headphones className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Suporte Técnico & Consultoria Fiscal Dedicada
            </h1>
            <p className="text-xs text-slate-500">
              Canal direto em tempo real com especialistas em PGC-NIRF, legislação tributária (IRPS/INSS/IRPC) e auditoria de sistemas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-700 font-bold">Consultores Online Agora</span>
        </div>
      </div>

      {/* Cartões de Contato Direto & Suporte Oficial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Telefone & WhatsApp */}
        <a
          href="tel:+258827473434"
          className="bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/40 p-4 rounded-2xl shadow-xs transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <Phone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Linha Direta & WhatsApp
            </span>
            <p className="text-sm font-black text-slate-900 group-hover:text-red-700 truncate">
              +258 827473434
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">Chamada & Mensagem Imediata</span>
          </div>
        </a>

        {/* Email Oficial */}
        <a
          href="mailto:ebenchume@sapo.mz"
          className="bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/40 p-4 rounded-2xl shadow-xs transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Correio Eletrónico Dedicado
            </span>
            <p className="text-sm font-black text-slate-900 group-hover:text-red-700 truncate">
              ebenchume@sapo.mz
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Eng. E. Benchume (Consultoria)</span>
          </div>
        </a>

        {/* Status da Licença & Ativação */}
        <div className="bg-red-50/70 border border-red-200 p-4 rounded-2xl shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white text-red-700 border border-red-200 flex items-center justify-center font-bold flex-shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                Licença Registrada
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs font-mono font-bold text-slate-900 truncate">
              {licenca.chave}
            </p>
            <span className="text-[10px] text-slate-500 block truncate">
              {licenca.tipo}
            </span>
          </div>
        </div>
      </div>

      {/* Janela de Chat */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[600px]">
        {/* Topo do Chat */}
        <div className="p-3.5 bg-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-red-700 flex items-center justify-center font-bold text-sm shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Mesa de Ajuda Fiscal ECHpro</p>
              <p className="text-[10px] text-red-100">Tempo médio de resposta: &lt; 1 minuto</p>
            </div>
          </div>
          <span className="text-[10px] text-white font-mono flex items-center gap-1 font-bold bg-red-800/60 px-2 py-0.5 rounded border border-red-600">
            <ShieldCheck className="w-3.5 h-3.5 text-red-200" /> Canal Criptografado TLS 1.3
          </span>
        </div>

        {/* Corpo das Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
          {mensagens.map(m => {
            const isMe = m.remetente === 'usuario';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs ${
                    isMe
                      ? 'bg-slate-900 text-white'
                      : 'bg-red-700 text-white'
                  }`}
                >
                  {isMe ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div>
                  <div
                    className={`flex items-center gap-2 mb-1 text-[11px] ${
                      isMe ? 'justify-end text-slate-500' : 'text-slate-500'
                    }`}
                  >
                    <span className="font-bold text-slate-800">{m.nome}</span>
                    <span className="text-slate-400 text-[10px]">{m.dataHora}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-red-600 text-white rounded-tr-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {m.texto}
                  </div>
                </div>
              </div>
            );
          })}

          {isDigitando && (
            <div className="flex gap-2 items-center text-xs text-red-700 italic pl-10 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce delay-150" />
              <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce delay-300" />
              <span className="ml-1 text-[11px]">Consultoria fiscal digitando resposta...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Atalhos de Perguntas Frequentes */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 flex-shrink-0 font-bold">Dúvidas Frequentes:</span>
          {duvidasFrequentes.map((df, idx) => (
            <button
              key={idx}
              onClick={() => handleEnviarMensagem(df)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 text-red-700 border border-slate-200 hover:border-red-300 font-bold whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer shadow-xs"
            >
              {df}
            </button>
          ))}
        </div>

        {/* Campo de Envio */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Digite sua dúvida contábil, fiscal ou técnica..."
            value={inputTexto}
            onChange={e => setInputTexto(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleEnviarMensagem();
            }}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-medium"
          />
          <button
            onClick={() => handleEnviarMensagem()}
            className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-md shadow-red-200"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
