"use client";

import { useState } from "react";
import { toggleSystemSetting } from "@/actions/settings";

export function ToggleTour({ initialValue }: { initialValue: boolean }) {
  const [isEnabled, setIsEnabled] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const newValue = !isEnabled;
    const res = await toggleSystemSetting("onboarding_tour_enabled", newValue ? "true" : "false");
    if (res.success) {
      setIsEnabled(newValue);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-bold text-gray-900 dark:text-white">Tour de Boas-Vindas (Onboarding)</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ativa ou desativa o guia visual flutuante para novos clientes.</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={isEnabled} 
          onChange={handleToggle}
          disabled={loading}
        />
        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer ${isEnabled ? 'peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-primary' : 'dark:bg-gray-700'} after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
      </label>
    </div>
  );
}
