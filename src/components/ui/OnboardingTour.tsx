"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";

const steps = [
  {
    targetId: "tour-pedidos",
    title: "Seus Sistemas e Pedidos",
    description: "Aqui você encontra todos os sistemas que adquiriu. O status do pedido e os detalhes da compra ficam nesta área.",
    position: "bottom"
  },
  {
    targetId: "tour-lgpd",
    title: "Sua Privacidade",
    description: "Nós levamos seus dados a sério. Nesta área você pode solicitar a exportação ou exclusão completa dos seus dados a qualquer momento.",
    position: "top"
  }
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("has_seen_onboarding_tour");
    if (!hasSeenTour) {
      setTimeout(() => {
        setCurrentStep(0);
        setIsVisible(true);
      }, 1000); // Give time for the page to render
    }
  }, []);

  useEffect(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      const element = document.getElementById(steps[currentStep].targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          setTargetRect(element.getBoundingClientRect());
        }, 500); // Wait for scroll
      } else {
        // Skip step if element not found
        handleNext();
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem("has_seen_onboarding_tour", "true");
    setIsVisible(false);
  };

  if (!isVisible || currentStep === -1 || !targetRect) return null;

  const step = steps[currentStep];

  // Calculate safe positions to prevent overflow
  const popoverHeight = 220; // Approximate height of the popover
  let safeTop = step.position === "bottom" ? targetRect.bottom + 20 : targetRect.top - popoverHeight;
  
  if (safeTop + popoverHeight > window.innerHeight) {
    safeTop = Math.max(20, window.innerHeight - popoverHeight - 20);
  }
  if (safeTop < 20) {
    safeTop = 20;
  }

  const safeLeft = Math.max(20, Math.min(window.innerWidth - 340, targetRect.left));

  return (
    <>
      {/* Overlay Escuro */}
      <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" />
      
      {/* Destaque (Spotlight) */}
      <div 
        className="fixed z-40 border-2 border-primary rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out pointer-events-none"
        style={{
          top: targetRect.top - 10,
          left: targetRect.left - 10,
          width: targetRect.width + 20,
          height: targetRect.height + 20,
        }}
      />

      {/* Caixa de Diálogo (Popover) */}
      <div 
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-80 p-6 animate-fade-in-up transition-all duration-500"
        style={{
          top: safeTop,
          left: safeLeft,
        }}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
        
        <div className="text-xs font-bold text-primary mb-2">
          Passo {currentStep + 1} de {steps.length}
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {step.description}
        </p>
        
        <div className="flex justify-between items-center">
          <button onClick={handleClose} className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Pular tour
          </button>
          <button 
            onClick={handleNext} 
            className="flex items-center gap-1 bg-primary text-white text-sm font-bold py-2 px-4 rounded-xl hover:bg-primary-hover hover-lift shadow-sm transition-all"
          >
            {currentStep === steps.length - 1 ? "Concluir" : "Próximo"} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
