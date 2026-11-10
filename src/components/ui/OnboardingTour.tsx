"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { X, ChevronRight, ChevronLeft, Compass, ArrowUpRight } from "lucide-react";

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position: "bottom" | "top";
  actionLabel?: string;
  actionHref?: string;
}

const allSteps: TourStep[] = [
  {
    targetId: "tour-perfil",
    title: "Complete seus Dados Fiscais",
    description:
      "Clique em qualquer item pendente do checklist para preencher Razão Social, CNPJ e Inscrição Estadual e liberar a emissão de Notas Fiscais (NF-e).",
    position: "bottom",
    actionLabel: "Abrir ficha cadastral",
    actionHref: "/minha-conta/perfil",
  },
  {
    targetId: "tour-whatsapp",
    title: "Implantação Assistida no WhatsApp",
    description:
      "Acione a equipe comercial com o ID do seu pedido e Razão Social já parametrizados para agendar a implantação e liberar suas licenças.",
    position: "bottom",
  },
  {
    targetId: "tour-pedidos",
    title: "Seus Sistemas e Licenças",
    description:
      "Acompanhe aqui o status de ativação de cada software adquirido, a quantidade de licenças vinculadas ao seu CNPJ e o catálogo de soluções.",
    position: "top",
    actionLabel: "Explorar catálogo de sistemas",
    actionHref: "/sistemas",
  },
];

export function OnboardingTour({ suppressAutoStart = false }: { suppressAutoStart?: boolean }) {
  const [activeSteps, setActiveSteps] = useState<TourStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popoverHeight, setPopoverHeight] = useState(236);
  const [isMobileSheet, setIsMobileSheet] = useState(false);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const resolveAvailableSteps = useCallback(() => {
    if (typeof document === "undefined") return [];
    return allSteps.filter((step) => Boolean(document.getElementById(step.targetId)));
  }, []);

  const startTour = useCallback(() => {
    const available = resolveAvailableSteps();
    if (available.length === 0) return;
    setActiveSteps(available);
    setCurrentStep(0);
    setIsVisible(true);
  }, [resolveAvailableSteps]);

  const handleClose = useCallback(() => {
    localStorage.setItem("has_seen_onboarding_tour", "true");
    setIsVisible(false);
    setCurrentStep(-1);
    requestAnimationFrame(() => {
      triggerButtonRef.current?.focus();
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < activeSteps.length - 1) {
        return prev + 1;
      }
      handleClose();
      return -1;
    });
  }, [activeSteps.length, handleClose]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Listen for custom "start-onboarding-tour" event from Welcome Banner or elsewhere
  useEffect(() => {
    const handleCustomStart = () => startTour();
    window.addEventListener("start-onboarding-tour", handleCustomStart);
    return () => window.removeEventListener("start-onboarding-tour", handleCustomStart);
  }, [startTour]);

  // Auto-start on first visit unless suppressed (?sucesso=true or ?welcome=true)
  useEffect(() => {
    if (suppressAutoStart) return;
    const hasSeenTour = localStorage.getItem("has_seen_onboarding_tour");
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [suppressAutoStart, startTour]);

  // Update targetRect on step change and keep it synced on scroll/resize
  useEffect(() => {
    if (!isVisible || currentStep < 0 || currentStep >= activeSteps.length) return;

    const targetId = activeSteps[currentStep].targetId;
    const element = document.getElementById(targetId);
    if (!element) {
      handleNext();
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    element.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
    });

    let rafId = 0;
    const updateRect = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const el = document.getElementById(targetId);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        }
        if (dialogRef.current) {
          setPopoverHeight(dialogRef.current.offsetHeight);
        }
        setIsMobileSheet(window.innerWidth < 640 || window.innerHeight < 520);
      });
    };

    updateRect();
    const scrollFinishTimer = setTimeout(updateRect, prefersReducedMotion ? 50 : 450);

    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("resize", updateRect, { passive: true });

    return () => {
      clearTimeout(scrollFinishTimer);
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
    };
  }, [isVisible, currentStep, activeSteps, handleNext]);

  // Keyboard navigation (Escape, ArrowRight, ArrowLeft, and strict Tab focus trap)
  useEffect(() => {
    if (!isVisible) return;

    const focusTimer = setTimeout(() => {
      nextButtonRef.current?.focus();
    }, 80);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === "ArrowLeft" && currentStep > 0) {
        e.preventDefault();
        handlePrev();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, currentStep, handleClose, handleNext, handlePrev]);

  const step = isVisible && currentStep >= 0 ? activeSteps[currentStep] : null;

  // Compute safe popover coordinates using real measured height
  let safeTop = 20;
  let safeLeft = 16;

  if (step && targetRect && typeof window !== "undefined") {
    const popoverWidth = Math.min(352, window.innerWidth - 32);
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    if (step.position === "bottom" && spaceBelow >= popoverHeight + 24) {
      safeTop = targetRect.bottom + 18;
    } else if (spaceAbove >= popoverHeight + 24) {
      safeTop = targetRect.top - popoverHeight - 18;
    } else if (spaceBelow >= spaceAbove) {
      safeTop = Math.min(
        Math.max(16, targetRect.bottom + 12),
        Math.max(16, window.innerHeight - popoverHeight - 16)
      );
    } else {
      safeTop = Math.max(16, window.innerHeight - popoverHeight - 16);
    }

    safeLeft = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, targetRect.left));
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Only trigger horizontal swipe when clearly horizontal (prevents interfering with vertical scroll)
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.8) {
      if (dx < 0) {
        handleNext();
      } else if (dx > 0 && currentStep > 0) {
        handlePrev();
      }
    }
  };

  return (
    <>
      {/* Replayable Help Trigger when Tour is Closed */}
      {!isVisible && (
        <div className="mt-8 flex justify-end print:hidden">
          <button
            ref={triggerButtonRef}
            type="button"
            onClick={startTour}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 py-2.5 rounded-xl transition-colors min-h-[44px]"
          >
            <Compass size={16} className="text-primary dark:text-blue-400 shrink-0" />
            Rever tour guiado do painel
          </button>
        </div>
      )}

      {isVisible && step && targetRect && (
        <>
          {/* Clickable Backdrop to Dismiss */}
          <div
            onClick={handleClose}
            aria-hidden="true"
            className="fixed inset-0 bg-black/50 z-40 transition-opacity print:hidden"
          />

          {/* Spotlight Frame */}
          <div
            aria-hidden="true"
            className="fixed z-40 border-2 border-primary rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-all duration-300 ease-out pointer-events-none print:hidden"
            style={{
              top: Math.max(4, targetRect.top - 8),
              left: Math.max(4, targetRect.left - 8),
              width: Math.min(window.innerWidth - 8, targetRect.width + 16),
              height: targetRect.height + 16,
            }}
          />

          {/* Accessible Dialog: Thumbs-First Bottom Sheet on Mobile/Landscape, Floating Popover on Desktop */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-tour-title"
            aria-describedby="onboarding-tour-desc"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`fixed z-50 bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 max-h-[78dvh] overflow-y-auto print:hidden ${
              isMobileSheet
                ? "inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] rounded-2xl p-5"
                : "rounded-2xl w-[calc(100vw-2rem)] max-w-sm p-6"
            }`}
            style={
              isMobileSheet
                ? undefined
                : {
                    top: safeTop,
                    left: safeLeft,
                  }
            }
          >
            {isMobileSheet && (
              <div
                aria-hidden="true"
                className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3"
              />
            )}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fechar tour de boas-vindas"
              className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 pr-10 mb-2">
              <span className="text-xs font-extrabold text-primary dark:text-blue-400 tabular-nums">
                Passo {currentStep + 1} de {activeSteps.length}
              </span>
              <div className="flex gap-1" aria-hidden="true">
                {activeSteps.map((s, idx) => (
                  <span
                    key={s.targetId}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStep
                        ? "w-4 bg-primary"
                        : "w-1.5 bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            <h3
              id="onboarding-tour-title"
              className="text-lg font-bold text-gray-900 dark:text-white mb-2 pr-8 break-words"
            >
              {step.title}
            </h3>
            <p
              id="onboarding-tour-desc"
              className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed break-words"
            >
              {step.description}
            </p>

            {step.actionLabel && step.actionHref && (
              <div className="mb-4">
                <Link
                  href={step.actionHref}
                  onClick={handleClose}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-blue-400 hover:underline min-h-[36px]"
                >
                  {step.actionLabel}
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            )}

            <div className="flex justify-between items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 px-3 min-h-[44px] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                Pular tour
              </button>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Passo anterior"
                    className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}

                <button
                  ref={nextButtonRef}
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-bold py-2.5 px-4 min-h-[44px] rounded-xl hover:bg-primary-hover shadow-sm transition-all"
                >
                  {currentStep === activeSteps.length - 1 ? "Concluir" : "Próximo"}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
