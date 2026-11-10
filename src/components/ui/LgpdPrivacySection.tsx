"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Trash2, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";

interface LgpdPrivacySectionProps {
  email: string;
  activeOrderCount: number;
}

export function LgpdPrivacySection({ email, activeOrderCount }: LgpdPrivacySectionProps) {
  const [exportRequested, setExportRequested] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  const cancelDeleteButtonRef = useRef<HTMLButtonElement | null>(null);
  const openDeleteButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (confirmingDelete) {
      cancelDeleteButtonRef.current?.focus();
    }
  }, [confirmingDelete]);

  const handleExportRequest = () => {
    setExportRequested(true);
    toast.success(`Solicitação registrada! O pacote de dados será enviado para ${email}.`);
  };

  const handleConfirmDelete = () => {
    setDeleteRequested(true);
    setConfirmingDelete(false);
    toast.success(
      "Protocolo de encerramento e exclusão de dados registrado junto ao encarregado (DPO)."
    );
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(false);
    requestAnimationFrame(() => {
      openDeleteButtonRef.current?.focus();
    });
  };

  return (
    <section
      aria-labelledby="lgpd-section-heading"
      className="mt-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h2
          id="lgpd-section-heading"
          className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Shield size={20} className="text-primary dark:text-blue-400 shrink-0" />
          Privacidade e Titularidade de Dados (LGPD)
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed max-w-3xl">
        Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode solicitar a portabilidade e exportação completa dos dados vinculados ao seu cadastro ou abrir um protocolo de encerramento de conta.
      </p>

      {exportRequested && (
        <div
          role="status"
          className="mb-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-200"
        >
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Exportação de dados solicitada com sucesso</p>
            <p className="mt-0.5 text-emerald-700 dark:text-emerald-300">
              Enviaremos o arquivo estruturado com seus dados cadastrais e histórico de pedidos para{" "}
              <strong>{email}</strong> em até 48 horas úteis.
            </p>
          </div>
        </div>
      )}

      {deleteRequested && (
        <div
          role="status"
          className="mb-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200"
        >
          <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Protocolo de exclusão em análise fiscal</p>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300">
              Nossa equipe de privacidade enviou as instruções de confirmação para{" "}
              <strong>{email}</strong>. Documentos fiscais emitidos seguem o prazo legal de guarda obrigatória.
            </p>
          </div>
        </div>
      )}

      {confirmingDelete && !deleteRequested && (
        <div
          role="alertdialog"
          aria-labelledby="confirm-delete-title"
          aria-describedby="confirm-delete-desc"
          className="mb-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <h3 id="confirm-delete-title" className="font-bold text-red-900 dark:text-red-200">
                Confirmar solicitação de exclusão da conta?
              </h3>
              <p id="confirm-delete-desc" className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                {activeOrderCount > 0
                  ? `Atenção: você possui ${activeOrderCount} licença(s)/pedido(s) ativo(s). A exclusão encerrará o acesso ao painel corporativo e revogará credenciais vinculadas.`
                  : "Esta ação iniciará o encerramento permanente do seu acesso ao painel corporativo e a remoção dos dados não sujeitos a retenção fiscal obrigatória."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              ref={cancelDeleteButtonRef}
              type="button"
              onClick={handleCancelDelete}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
            >
              Cancelar e manter minha conta
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors min-h-[44px]"
            >
              Sim, solicitar exclusão de dados
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleExportRequest}
          disabled={exportRequested}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-sm rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
        >
          <Download size={16} />
          {exportRequested ? "Exportação já solicitada" : "Solicitar Exportação de Dados"}
        </button>

        {!confirmingDelete && (
          <button
            ref={openDeleteButtonRef}
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={deleteRequested}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 font-bold text-sm rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
          >
            <Trash2 size={16} />
            {deleteRequested ? "Protocolo de exclusão registrado" : "Solicitar Exclusão da Conta"}
          </button>
        )}
      </div>
    </section>
  );
}

