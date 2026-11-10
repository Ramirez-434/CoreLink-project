"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle, Loader2, Check, Lock } from "lucide-react";
import { updateOrderStatus } from "@/actions/order";

interface OrderStatusControlProps {
  orderId: string;
  initialStatus: string;
  customerName: string;
  productName: string;
}

const STATUS_LABELS: Record<string, { pt: string; en: string }> = {
  PENDING: { pt: "Processando", en: "Processing" },
  PROCESSING: { pt: "Processando", en: "Processing" },
  COMPLETED: { pt: "Concluído", en: "Completed" },
  CANCELLED: { pt: "Cancelado", en: "Cancelled" },
};

export function OrderStatusControl({
  orderId,
  initialStatus,
  customerName,
  productName,
}: OrderStatusControlProps) {
  const normalizedInitial = initialStatus === "PROCESSING" ? "PENDING" : initialStatus;
  const [status, setStatus] = useState<string>(normalizedInitial);
  const [persistedStatus, setPersistedStatus] = useState<string>(normalizedInitial);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Controle de estado explícito (isLoading) + useTransition + trava síncrona (useRef)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const submitLockRef = useRef<boolean>(false);

  const busy = isLoading || isPending;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const hasChanged = status !== persistedStatus;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Bloqueia duplo clique imediato (< 16ms) ou envio sem alteração de status
    if (submitLockRef.current || busy || !hasChanged) {
      return;
    }

    submitLockRef.current = true;
    setIsLoading(true);

    const labelObj = STATUS_LABELS[status] || { pt: status, en: status };
    const toastId = toast.loading(
      `Atualizando status do pedido #${shortId} no PostgreSQL...`
    );

    startTransition(async () => {
      try {
        const res = await updateOrderStatus(orderId, status);

        if (res.success) {
          setPersistedStatus(status);
          setJustSaved(true);
          setTimeout(() => setJustSaved(false), 3500);

          toast.success(
            `Pedido #${shortId} alterado para ${labelObj.pt} (${labelObj.en})!`,
            {
              id: toastId,
              description: `Cliente: ${customerName} • Software: ${productName} • Persistido via Prisma ORM.`,
            }
          );
        } else {
          toast.error(res.error || "Falha ao atualizar status do pedido.", {
            id: toastId,
          });
        }
      } catch {
        toast.error("Erro de comunicação ao salvar status do pedido.", {
          id: toastId,
        });
      } finally {
        setIsLoading(false);
        submitLockRef.current = false;
      }
    });
  };

  const badgeStyles =
    status === "COMPLETED"
      ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      : status === "CANCELLED"
      ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={busy}
      className="flex flex-col items-center gap-1.5"
    >
      <div className="flex items-center justify-center gap-2">
        <div className="relative flex items-center">
          <span className="absolute left-2.5 pointer-events-none">
            {status === "COMPLETED" ? (
              <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
            ) : status === "CANCELLED" ? (
              <XCircle size={14} className="text-red-600 dark:text-red-400" />
            ) : (
              <Clock size={14} className="text-amber-600 dark:text-amber-400" />
            )}
          </span>
          <select
            value={status}
            disabled={busy}
            onChange={(e) => {
              if (busy) return;
              setStatus(e.target.value);
              setJustSaved(false);
            }}
            aria-label={`Status do pedido ${shortId}`}
            className={`text-xs font-bold pl-7 pr-3 py-2 min-h-[44px] rounded-full border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${badgeStyles}`}
          >
            <option value="PENDING">Processando (Processing)</option>
            <option value="COMPLETED">Concluído (Completed)</option>
            <option value="CANCELLED">Cancelado (Cancelled)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={busy || !hasChanged}
          aria-busy={busy}
          data-loading={busy}
          title={
            busy
              ? "Salvando alteração no banco..."
              : !hasChanged
              ? "Selecione um novo status para habilitar o salvamento"
              : "Salvar novo status no PostgreSQL"
          }
          className={`text-xs px-4 py-2 min-h-[44px] rounded-full font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
            justSaved
              ? "bg-emerald-600 text-white"
              : hasChanged
              ? "bg-primary text-white hover:bg-primary-hover ring-2 ring-blue-400/40"
              : "bg-gray-900 dark:bg-gray-700 text-white"
          } disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none`}
        >
          {busy ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Salvando...
            </>
          ) : justSaved ? (
            <>
              <Check size={13} />
              Salvo!
            </>
          ) : (
            "Salvar"
          )}
        </button>
      </div>

      {busy && (
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <Lock size={12} /> Bloqueado contra duplo clique...
        </span>
      )}

      {!busy && justSaved && (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
          ✓ Status atualizado no PostgreSQL
        </span>
      )}
    </form>
  );
}
