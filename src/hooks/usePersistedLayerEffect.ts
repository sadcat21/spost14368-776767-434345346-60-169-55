import { useState, useEffect } from "react";
import type { LayerEffect } from "../components/LayerEffectsSelector";

const STORAGE_KEY = "lovable_layer_effects_settings";

// التأثير الافتراضي الذي يظهر عند أول تشغيل
const DEFAULT_LAYER_EFFECT: LayerEffect = {
  type: "arc",
  label: "قوس",
  icon: () => null, // سيتم تعيينه في المكون
  description: "تأثير قوسي منحني",
  properties: {
    intensity: 50,
    rotation: 0,
    scale: 100,
    opacity: 80,
    color: "#3b82f6"
  },
  gradientSettings: {
    useOverlayGradient: true,
    gradientType: 'radial',
    gradientAngle: 210,
    centerX: 50,
    centerY: 50,
    gradientSize: 100,
    colorStops: [
      {
        color: "#3b82f6",
        opacity: 100,
        position: 60
      },
      {
        color: "#1e40af",
        opacity: 100,
        position: 15
      }
    ]
  }
};

interface UsePersistedLayerEffectOptions {
  defaultEffect?: LayerEffect;
  enableDefaultOnFirstRun?: boolean;
}

export const usePersistedLayerEffect = (options: UsePersistedLayerEffectOptions = {}) => {
  const [currentLayerEffect, setCurrentLayerEffect] = useState<LayerEffect | undefined>(
    options.defaultEffect
  );

  // تحميل الإعدادات المحفوظة عند التهيئة
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedEffect = JSON.parse(saved) as LayerEffect;
        setCurrentLayerEffect(parsedEffect);
      } else if (options.enableDefaultOnFirstRun !== false) {
        // في حالة عدم وجود إعدادات محفوظة، استخدم التأثير الافتراضي
        setCurrentLayerEffect(DEFAULT_LAYER_EFFECT);
      }
    } catch (error) {
      console.warn("Failed to load saved layer effect:", error);
      // في حالة حدوث خطأ، استخدم التأثير الافتراضي
      if (options.enableDefaultOnFirstRun !== false) {
        setCurrentLayerEffect(DEFAULT_LAYER_EFFECT);
      }
    }
  }, [options.enableDefaultOnFirstRun]);

  // حفظ الإعدادات عند تغييرها
  const updateLayerEffect = (effect: LayerEffect) => {
    setCurrentLayerEffect(effect);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(effect));
    } catch (error) {
      console.warn("Failed to save layer effect:", error);
    }
  };

  // مسح الإعدادات المحفوظة
  const clearLayerEffect = () => {
    setCurrentLayerEffect(undefined);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear layer effect:", error);
    }
  };

  return {
    currentLayerEffect,
    updateLayerEffect,
    clearLayerEffect
  };
};