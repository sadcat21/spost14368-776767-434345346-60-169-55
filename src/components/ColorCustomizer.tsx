
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, RotateCcw, Layers, ImageIcon, Paintbrush, ChevronDown } from "lucide-react";
import { ColorSettings } from "./ContentCanvas";
import { OverlayTemplateSaver } from "./OverlayTemplateSaver";
import { OverlayTemplateGallery } from "./OverlayTemplateGallery";
import { EnhancedOverlayTemplateManager } from "./EnhancedOverlayTemplateManager";

interface ColorCustomizerProps {
  onUpdate: (settings: ColorSettings) => void;
  initialSettings?: ColorSettings;
}

const defaultColorSettings: ColorSettings = {
  textColor: '#ffffff',
  backgroundColor: '#1a1a2e',
  overlayColor: 'rgba(0, 0, 0, 0.4)',
  overlayOpacity: 30,
  gradientType: 'none',
  gradientDirection: '135deg',
  gradientColors: ['#667eea', '#764ba2'],
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  useGradient: false,
  borderColor: '#e2e8f0',
  borderWidth: 0,
};

export const ColorCustomizer = ({ onUpdate, initialSettings }: ColorCustomizerProps) => {
  const [settings, setSettings] = useState<ColorSettings>(initialSettings || defaultColorSettings);
  const [useOverlayGradient, setUseOverlayGradient] = useState(false);
  const [overlayGradientStart, setOverlayGradientStart] = useState('#000000');
  const [overlayGradientEnd, setOverlayGradientEnd] = useState('#333333');
  const [overlayGradientAngle, setOverlayGradientAngle] = useState(135);
  const [overlayGradientDirection, setOverlayGradientDirection] = useState('linear');
  const [overlayStartOpacity, setOverlayStartOpacity] = useState(30);
  const [overlayEndOpacity, setOverlayEndOpacity] = useState(20);
  const [overlayStartPosition, setOverlayStartPosition] = useState(0);
  const [overlayEndPosition, setOverlayEndPosition] = useState(100);
  const [overlayGradientType, setOverlayGradientType] = useState<'linear' | 'radial' | 'conic' | 'repeating-linear' | 'repeating-radial' | 'diamond' | 'grid' | 'fade-blend' | 'soft-transition' | 'color-burst' | 'spiral' | 'wave' | 'crystalline' | 'plasma' | 'metallic' | 'prism' | 'aurora' | 'fire' | 'water' | 'earth' | 'cosmic' | 'galaxy' | 'rainbow' | 'sunset' | 'ocean' | 'forest' | 'desert' | 'storm' | 'nebula' | 'solar' | 'lunar' | 'volcanic' | 'glacier' | 'marble' | 'silk' | 'electric' | 'holographic'>('linear');
  const [gradientCenterX, setGradientCenterX] = useState(50);
  const [gradientCenterY, setGradientCenterY] = useState(50);
  const [gradientSize, setGradientSize] = useState(100);
  const [gradientRepeat, setGradientRepeat] = useState(50);
  const [useSharpStops, setUseSharpStops] = useState(false);
  const [borderGradientType, setBorderGradientType] = useState<'none' | 'straight' | 'curved' | 'wavy' | 'zigzag' | 'graduated' | 'organic'>('none');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // لتحديث المعرض تلقائياً

  // Update settings when initialSettings change
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const updateSetting = <K extends keyof ColorSettings>(
    key: K,
    value: ColorSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onUpdate(newSettings);
  };

  const resetToDefaults = () => {
    setSettings(defaultColorSettings);
    setUseOverlayGradient(false);
    setOverlayGradientStart('#000000');
    setOverlayGradientEnd('#333333');
    setOverlayGradientAngle(135);
    setOverlayStartOpacity(30);
    setOverlayEndOpacity(20);
    setOverlayStartPosition(0);
    setOverlayEndPosition(100);
    setOverlayGradientType('linear');
    setGradientCenterX(50);
    setGradientCenterY(50);
    setGradientSize(100);
    setGradientRepeat(50);
    setUseSharpStops(false);
    setBorderGradientType('none');
    onUpdate(defaultColorSettings);
  };

  const handleOverlayColorChange = (colorValue: string) => {
    if (useOverlayGradient) {
      const gradient = `linear-gradient(135deg, ${overlayGradientStart}, ${overlayGradientEnd})`;
      updateSetting("overlayColor", gradient);
    } else {
      // Convert hex to rgba with current opacity
      const hex = colorValue.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const rgba = `rgba(${r}, ${g}, ${b}, ${settings.overlayOpacity / 100})`;
      updateSetting("overlayColor", rgba);
    }
  };

  const handleOverlayOpacityChange = (opacity: number) => {
    updateSetting("overlayOpacity", opacity);
    
    if (!useOverlayGradient && settings.overlayColor.includes("rgba")) {
      const rgbaMatch = settings.overlayColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
      if (rgbaMatch) {
        const [, r, g, b] = rgbaMatch;
        const newRgba = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
        setSettings(prev => ({ ...prev, overlayColor: newRgba }));
        onUpdate({ ...settings, overlayColor: newRgba, overlayOpacity: opacity });
      }
    }
  };

  const handleOverlayGradientToggle = (checked: boolean) => {
    setUseOverlayGradient(checked);
    if (checked) {
      const gradient = generateAdvancedGradient();
      updateSetting("overlayColor", gradient);
    } else {
      const rgba = `rgba(0, 0, 0, ${settings.overlayOpacity / 100})`;
      updateSetting("overlayColor", rgba);
    }
  };

  // Generate advanced gradient based on settings
  const generateAdvancedGradient = () => {
    const hexToRgba = (hex: string, opacity: number) => {
      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };

    const startColor = hexToRgba(overlayGradientStart, overlayStartOpacity);
    const endColor = hexToRgba(overlayGradientEnd, overlayEndOpacity);
    
    // Add sharp stops if enabled
    const startStop = useSharpStops ? `${overlayStartPosition}%` : `${overlayStartPosition}%`;
    const endStop = useSharpStops ? `${overlayEndPosition}%` : `${overlayEndPosition}%`;
    const sharpTransition = useSharpStops ? `, ${startColor} ${overlayStartPosition + 1}%, ${endColor} ${overlayEndPosition - 1}%` : '';

    let gradientString = '';
    switch (overlayGradientType) {
      case 'linear':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} ${startStop}, ${endColor} ${endStop}${sharpTransition})`;
        break;
      case 'radial':
        const radialSize = gradientSize === 100 ? 'circle' : `${gradientSize}% ${gradientSize}%`;
        gradientString = `radial-gradient(${radialSize} at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} ${startStop}, ${endColor} ${endStop}${sharpTransition})`;
        break;
      case 'conic':
        gradientString = `conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} ${startStop}, ${endColor} ${endStop}${sharpTransition})`;
        break;
      case 'repeating-linear':
        const repeatSize = `${gradientRepeat}px`;
        gradientString = `repeating-linear-gradient(${overlayGradientAngle}deg, ${startColor} 0, ${endColor} ${repeatSize})`;
        break;
      case 'repeating-radial':
        const repeatRadialSize = `${gradientRepeat}px`;
        gradientString = `repeating-radial-gradient(circle at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0, ${endColor} ${repeatRadialSize})`;
        break;
      case 'diamond':
        gradientString = `conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX}% ${gradientCenterY}%, ${startColor}, ${endColor} 25%, ${startColor} 50%, ${endColor} 75%, ${startColor})`;
        break;
      case 'grid':
        const gridSize = `${gradientRepeat}px`;
        gradientString = `repeating-conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0deg 90deg, ${endColor} 90deg 180deg) ${gridSize} ${gridSize}`;
        break;
      case 'fade-blend':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, transparent 50%, ${endColor} 100%), linear-gradient(${overlayGradientAngle + 90}deg, ${endColor} 0%, transparent 50%, ${startColor} 100%)`;
        break;
      case 'soft-transition':
        const midColor = `rgba(${Math.round((parseInt(overlayGradientStart.substring(1, 3), 16) + parseInt(overlayGradientEnd.substring(1, 3), 16)) / 2)}, ${Math.round((parseInt(overlayGradientStart.substring(3, 5), 16) + parseInt(overlayGradientEnd.substring(3, 5), 16)) / 2)}, ${Math.round((parseInt(overlayGradientStart.substring(5, 7), 16) + parseInt(overlayGradientEnd.substring(5, 7), 16)) / 2)}, ${(overlayStartOpacity + overlayEndOpacity) / 200})`;
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, ${midColor} 30%, ${midColor} 70%, ${endColor} 100%)`;
        break;
      case 'color-burst':
        gradientString = `radial-gradient(circle at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0%, transparent 40%), radial-gradient(circle at ${100-gradientCenterX}% ${100-gradientCenterY}%, ${endColor} 0%, transparent 40%)`;
        break;
      case 'spiral':
        gradientString = `conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0deg, ${endColor} 120deg, ${startColor} 240deg, ${endColor} 360deg)`;
        break;
      case 'wave':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, ${endColor} 25%, ${startColor} 50%, ${endColor} 75%, ${startColor} 100%)`;
        break;
      case 'crystalline':
        gradientString = `conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX}% ${gradientCenterY}%, ${startColor}, ${endColor} 60deg, ${startColor} 120deg, ${endColor} 180deg, ${startColor} 240deg, ${endColor} 300deg, ${startColor})`;
        break;
      case 'plasma':
        gradientString = `radial-gradient(ellipse ${gradientSize}% ${gradientSize * 0.6}% at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0%, ${endColor} 50%, ${startColor} 100%), linear-gradient(${overlayGradientAngle}deg, transparent 40%, ${endColor} 50%, transparent 60%)`;
        break;
      case 'metallic':
        const metallicMid = `rgba(${Math.round((parseInt(overlayGradientStart.substring(1, 3), 16) + parseInt(overlayGradientEnd.substring(1, 3), 16)) / 2)}, ${Math.round((parseInt(overlayGradientStart.substring(3, 5), 16) + parseInt(overlayGradientEnd.substring(3, 5), 16)) / 2)}, ${Math.round((parseInt(overlayGradientStart.substring(5, 7), 16) + parseInt(overlayGradientEnd.substring(5, 7), 16)) / 2)}, ${Math.max(overlayStartOpacity, overlayEndOpacity) / 100})`;
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, ${metallicMid} 25%, ${endColor} 50%, ${metallicMid} 75%, ${startColor} 100%)`;
        break;
      case 'prism':
        gradientString = `conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0deg, #ff0080 60deg, #8000ff 120deg, #0080ff 180deg, #00ff80 240deg, #ff8000 300deg, ${endColor} 360deg)`;
        break;
      case 'aurora':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, #00ff88 20%, #0088ff 40%, #8800ff 60%, #ff0088 80%, ${endColor} 100%), radial-gradient(ellipse at ${gradientCenterX}% ${gradientCenterY}%, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`;
        break;
      case 'fire':
        gradientString = `radial-gradient(ellipse ${gradientSize}% 80% at ${gradientCenterX}% ${gradientCenterY}%, #ff4500 0%, #ff6600 25%, #ff8800 50%, #ffaa00 75%, ${endColor} 100%), linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, transparent 50%, rgba(255,69,0,0.3) 100%)`;
        break;
      case 'water':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, #4169e1 25%, #00bfff 50%, #87ceeb 75%, ${endColor} 100%), radial-gradient(circle at ${gradientCenterX}% ${gradientCenterY}%, rgba(255,255,255,0.2) 0%, transparent 40%)`;
        break;
      case 'earth':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, #8b4513 20%, #a0522d 40%, #cd853f 60%, #daa520 80%, ${endColor} 100%), repeating-linear-gradient(${overlayGradientAngle + 45}deg, transparent 0, transparent 10px, rgba(139,69,19,0.1) 10px, rgba(139,69,19,0.1) 20px)`;
        break;
      case 'cosmic':
        gradientString = `radial-gradient(ellipse at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0%, #2e0854 30%, #4a0e4e 60%, ${endColor} 100%), conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX + 20}% ${gradientCenterY + 20}%, transparent 0deg, rgba(255,255,255,0.1) 120deg, transparent 240deg)`;
        break;
      case 'galaxy':
        gradientString = `conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0deg, #4b0082 40deg, #8a2be2 80deg, #ff1493 120deg, #ff69b4 160deg, #ffd700 200deg, #ff4500 240deg, #dc143c 280deg, #b22222 320deg, ${endColor} 360deg), radial-gradient(circle at ${gradientCenterX}% ${gradientCenterY}%, transparent 0%, rgba(255,255,255,0.05) 70%, transparent 100%)`;
        break;
      case 'rainbow':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, #ff0000 0%, #ff8000 14.28%, #ffff00 28.56%, #80ff00 42.84%, #00ff00 57.12%, #00ff80 71.4%, #00ffff 85.68%, ${endColor} 100%)`;
        break;
      case 'sunset':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, #ff6347 20%, #ff7f50 40%, #ffa500 60%, #ffb84d 80%, ${endColor} 100%), radial-gradient(ellipse at ${gradientCenterX}% 20%, rgba(255,69,0,0.3) 0%, transparent 70%)`;
        break;
      case 'ocean':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, #006994 25%, #0080a8 50%, #40a9c0 75%, ${endColor} 100%), repeating-linear-gradient(${overlayGradientAngle + 90}deg, transparent 0, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 35px)`;
        break;
      case 'forest':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, #228b22 20%, #32cd32 40%, #90ee90 60%, #98fb98 80%, ${endColor} 100%), repeating-linear-gradient(${overlayGradientAngle + 30}deg, transparent 0, transparent 15px, rgba(34,139,34,0.2) 15px, rgba(34,139,34,0.2) 25px)`;
        break;
      case 'desert':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, #daa520 25%, #f4a460 50%, #ffde8a 75%, ${endColor} 100%), radial-gradient(circle at ${gradientCenterX + 30}% ${gradientCenterY - 20}%, rgba(255,140,0,0.3) 0%, transparent 50%)`;
        break;
      case 'storm':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, #2f4f4f 25%, #696969 50%, #778899 75%, ${endColor} 100%), repeating-linear-gradient(${overlayGradientAngle + 135}deg, transparent 0, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 12px)`;
        break;
      case 'nebula':
        gradientString = `radial-gradient(ellipse ${gradientSize}% ${gradientSize * 1.2}% at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0%, #ff1493 30%, #8a2be2 60%, ${endColor} 100%), conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX - 20}% ${gradientCenterY + 20}%, transparent 0deg, rgba(255,20,147,0.3) 90deg, transparent 180deg, rgba(138,43,226,0.3) 270deg, transparent 360deg)`;
        break;
      case 'solar':
        gradientString = `radial-gradient(circle at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0%, #ff4500 20%, #ff6347 40%, #ffa500 60%, #ffff00 80%, ${endColor} 100%), conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX}% ${gradientCenterY}%, transparent 0deg, rgba(255,215,0,0.2) 60deg, transparent 120deg, rgba(255,140,0,0.2) 180deg, transparent 240deg, rgba(255,69,0,0.2) 300deg, transparent 360deg)`;
        break;
      case 'lunar':
        gradientString = `radial-gradient(circle at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0%, #c0c0c0 30%, #d3d3d3 60%, ${endColor} 100%), radial-gradient(circle at ${gradientCenterX + 15}% ${gradientCenterY - 15}%, rgba(255,255,255,0.3) 0%, transparent 40%), radial-gradient(circle at ${gradientCenterX - 20}% ${gradientCenterY + 10}%, rgba(0,0,0,0.2) 0%, transparent 30%)`;
        break;
      case 'volcanic':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, #8b0000 25%, #dc143c 50%, #ff4500 75%, ${endColor} 100%), radial-gradient(ellipse at ${gradientCenterX}% ${gradientCenterY + 30}%, rgba(255,69,0,0.4) 0%, transparent 60%), repeating-linear-gradient(${overlayGradientAngle + 45}deg, transparent 0, transparent 20px, rgba(139,0,0,0.2) 20px, rgba(139,0,0,0.2) 25px)`;
        break;
      case 'glacier':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, #b0e0e6 25%, #87ceeb 50%, #e0f6ff 75%, ${endColor} 100%), radial-gradient(ellipse at ${gradientCenterX}% ${gradientCenterY}%, rgba(255,255,255,0.6) 0%, transparent 50%), repeating-linear-gradient(${overlayGradientAngle + 15}deg, transparent 0, transparent 40px, rgba(135,206,235,0.3) 40px, rgba(135,206,235,0.3) 45px)`;
        break;
      case 'marble':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, #f5f5dc 20%, #fffacd 40%, #f0f8ff 60%, #f8f8ff 80%, ${endColor} 100%), repeating-linear-gradient(${overlayGradientAngle + 25}deg, transparent 0, transparent 30px, rgba(169,169,169,0.2) 30px, rgba(169,169,169,0.2) 35px), repeating-linear-gradient(${overlayGradientAngle - 25}deg, transparent 0, transparent 50px, rgba(105,105,105,0.1) 50px, rgba(105,105,105,0.1) 55px)`;
        break;
      case 'silk':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} 0%, rgba(255,255,255,0.8) 50%, ${endColor} 100%), repeating-linear-gradient(${overlayGradientAngle + 90}deg, transparent 0, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)`;
        break;
      case 'electric':
        gradientString = `conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0deg, #00ffff 45deg, #ffffff 90deg, #ffff00 135deg, #ff00ff 180deg, #00ff00 225deg, #ff0000 270deg, #0000ff 315deg, ${endColor} 360deg), repeating-radial-gradient(circle at ${gradientCenterX}% ${gradientCenterY}%, transparent 0, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 12px)`;
        break;
      case 'holographic':
        gradientString = `conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0deg, #ff0080 30deg, #8000ff 60deg, #0080ff 90deg, #00ff80 120deg, #80ff00 150deg, #ff8000 180deg, #ff0080 210deg, #8000ff 240deg, #0080ff 270deg, #00ff80 300deg, #80ff00 330deg, ${endColor} 360deg), radial-gradient(ellipse at ${gradientCenterX}% ${gradientCenterY}%, transparent 0%, rgba(255,255,255,0.1) 40%, transparent 80%)`;
        break;
    }
    return gradientString;
  };

  // Generate background gradient
  const generateBackgroundGradient = () => {
    const gradientType = settings.gradientType || 'linear';
    const angle = parseInt(settings.gradientDirection?.replace('deg', '') || '135');
    const startColor = settings.gradientStart;
    const endColor = settings.gradientEnd;
    
    let gradientString = '';
    switch (gradientType) {
      case 'linear':
        gradientString = `linear-gradient(${angle}deg, ${startColor}, ${endColor})`;
        break;
      case 'radial':
        const radialSize = backgroundGradientSize === 100 ? 'circle' : `${backgroundGradientSize}% ${backgroundGradientSize}%`;
        gradientString = `radial-gradient(${radialSize} at ${backgroundGradientCenterX}% ${backgroundGradientCenterY}%, ${startColor}, ${endColor})`;
        break;
      case 'conic':
        gradientString = `conic-gradient(from ${angle}deg at ${backgroundGradientCenterX}% ${backgroundGradientCenterY}%, ${startColor}, ${endColor})`;
        break;
      case 'repeating-linear':
        gradientString = `repeating-linear-gradient(${angle}deg, ${startColor} 0, ${endColor} ${backgroundGradientRepeat}px)`;
        break;
      case 'repeating-radial':
        gradientString = `repeating-radial-gradient(circle at ${backgroundGradientCenterX}% ${backgroundGradientCenterY}%, ${startColor} 0, ${endColor} ${backgroundGradientRepeat}px)`;
        break;
      case 'diamond':
        gradientString = `conic-gradient(from ${angle}deg at ${backgroundGradientCenterX}% ${backgroundGradientCenterY}%, ${startColor}, ${endColor} 25%, ${startColor} 50%, ${endColor} 75%, ${startColor})`;
        break;
      case 'grid':
        gradientString = `repeating-conic-gradient(from ${angle}deg at ${backgroundGradientCenterX}% ${backgroundGradientCenterY}%, ${startColor} 0deg 90deg, ${endColor} 90deg 180deg)`;
        break;
      case 'fade-blend':
        gradientString = `linear-gradient(${angle}deg, ${startColor} 0%, transparent 50%, ${endColor} 100%), linear-gradient(${angle + 90}deg, ${endColor} 0%, transparent 50%, ${startColor} 100%)`;
        break;
      case 'soft-transition':
        gradientString = `linear-gradient(${angle}deg, ${startColor} 0%, ${startColor} 30%, ${endColor} 70%, ${endColor} 100%)`;
        break;
      case 'color-burst':
        gradientString = `radial-gradient(circle at ${backgroundGradientCenterX}% ${backgroundGradientCenterY}%, ${startColor} 0%, transparent 40%), radial-gradient(circle at ${100-backgroundGradientCenterX}% ${100-backgroundGradientCenterY}%, ${endColor} 0%, transparent 40%)`;
        break;
      case 'spiral':
        gradientString = `conic-gradient(from ${angle}deg at ${backgroundGradientCenterX}% ${backgroundGradientCenterY}%, ${startColor} 0deg, ${endColor} 120deg, ${startColor} 240deg, ${endColor} 360deg)`;
        break;
      case 'wave':
        gradientString = `linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 25%, ${startColor} 50%, ${endColor} 75%, ${startColor} 100%)`;
        break;
      case 'crystalline':
        gradientString = `conic-gradient(from ${angle}deg at ${backgroundGradientCenterX}% ${backgroundGradientCenterY}%, ${startColor}, ${endColor} 60deg, ${startColor} 120deg, ${endColor} 180deg, ${startColor} 240deg, ${endColor} 300deg, ${startColor})`;
        break;
      case 'plasma':
        gradientString = `radial-gradient(ellipse ${backgroundGradientSize}% ${backgroundGradientSize * 0.6}% at ${backgroundGradientCenterX}% ${backgroundGradientCenterY}%, ${startColor} 0%, ${endColor} 50%, ${startColor} 100%), linear-gradient(${angle}deg, transparent 40%, ${endColor} 50%, transparent 60%)`;
        break;
      case 'metallic':
        gradientString = `linear-gradient(${angle}deg, ${startColor} 0%, ${startColor} 25%, ${endColor} 50%, ${startColor} 75%, ${startColor} 100%)`;
        break;
      default:
        gradientString = `linear-gradient(${angle}deg, ${startColor}, ${endColor})`;
    }
    return gradientString;
  };

  const updateOverlayGradient = () => {
    if (useOverlayGradient) {
      const gradient = generateAdvancedGradient();
      updateSetting("overlayColor", gradient);
    }
  };

  const handleOverlayGradientStartChange = (color: string) => {
    setOverlayGradientStart(color);
    if (useOverlayGradient) {
      setTimeout(updateOverlayGradient, 0);
    }
  };

  const handleOverlayGradientEndChange = (color: string) => {
    setOverlayGradientEnd(color);
    if (useOverlayGradient) {
      setTimeout(updateOverlayGradient, 0);
    }
  };

  const handleGradientSettingChange = (setter: (value: any) => void, value: any) => {
    setter(value);
    // Force immediate update for all gradient settings
    setTimeout(() => {
      if (useOverlayGradient) {
        updateOverlayGradient();
      }
      // Also update background gradient if enabled
      if (settings.useGradient) {
        const newGradient = generateBackgroundGradient();
        updateSetting("backgroundColor", newGradient);
      }
    }, 0);
  };

  // إعدادات التداخل المتقدمة للطبقة العلوية
  const [overlayBlendType, setOverlayBlendType] = useState<'smooth' | 'sharp' | 'wavy' | 'zigzag' | 'curved' | 'organic'>('smooth');
  const [overlayTransitionWidth, setOverlayTransitionWidth] = useState(20);
  const [overlayWaveFrequency, setOverlayWaveFrequency] = useState(5);
  const [overlayWaveAmplitude, setOverlayWaveAmplitude] = useState(15);
  const [overlayZigzagSegments, setOverlayZigzagSegments] = useState(8);
  const [overlayCurveRadius, setOverlayCurveRadius] = useState(50);
  const [overlayCustomPath, setOverlayCustomPath] = useState('');
  
  // إعدادات الشفافية المتقدمة للطبقة العلوية
  const [advancedTransparencyEnabled, setAdvancedTransparencyEnabled] = useState(false);
  const [borderType, setBorderType] = useState<'soft' | 'hard' | 'feathered' | 'sharp' | 'glow' | 'double' | 'triple'>('soft');
  const [borderWidth, setBorderWidth] = useState(2);
  const [featherRadius, setFeatherRadius] = useState(10);
  const [innerGlow, setInnerGlow] = useState(0);
  const [outerGlow, setOuterGlow] = useState(0);
  const [glowColor, setGlowColor] = useState('#ffffff');
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowSpread, setShadowSpread] = useState(0);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowOpacity, setShadowOpacity] = useState(30);
  const [bevelEnabled, setBevelEnabled] = useState(false);
  const [bevelSize, setBevelSize] = useState(5);
  const [bevelSoftness, setBevelSoftness] = useState(50);
  
  // إعدادات التحكم المتقدم في التداخل (غير مفعلة افتراضياً)
  const [advancedBlendingEnabled, setAdvancedBlendingEnabled] = useState(false); // تعطيل التطبيق المتقدم افتراضياً
  
  // إعدادات الحدود الحادة المتقدمة
  const [sharpBorderEnabled, setSharpBorderEnabled] = useState(false);
  const [sharpBorderStyle, setSharpBorderStyle] = useState<'straight' | 'curved' | 'zigzag'>('straight');
  const [sharpBorderThickness, setSharpBorderThickness] = useState(3);
  const [sharpBorderCurvature, setSharpBorderCurvature] = useState(50);
  const [sharpBorderSegments, setSharpBorderSegments] = useState(8);

  // إعدادات تدرج الخلفية المتقدمة
  const [backgroundGradientCenterX, setBackgroundGradientCenterX] = useState(50);
  const [backgroundGradientCenterY, setBackgroundGradientCenterY] = useState(50);
  const [backgroundGradientSize, setBackgroundGradientSize] = useState(100);
  const [backgroundGradientRepeat, setBackgroundGradientRepeat] = useState(50);
  const [backgroundUseSharpStops, setBackgroundUseSharpStops] = useState(false);

  // Generate border gradient styles
  const generateBorderGradient = () => {
    if (borderGradientType === 'none' && !sharpBorderEnabled) return '';
    
    const borderColors = [settings.borderColor, settings.textColor];
    const borderWidth = settings.borderWidth || 2;
    
    // حدود حادة منفصلة
    if (sharpBorderEnabled) {
      const baseStyle = `border: ${sharpBorderThickness}px solid ${borderColors[0]}; `;
      
      switch (sharpBorderStyle) {
        case 'straight':
          return baseStyle + `box-shadow: inset 0 0 0 ${sharpBorderThickness}px ${borderColors[1]};`;
        case 'curved':
          const radius = sharpBorderCurvature;
          return baseStyle + `border-radius: ${radius}% ${100-radius}% ${radius}% ${100-radius}%; box-shadow: 0 0 0 ${sharpBorderThickness}px ${borderColors[1]};`;
        case 'zigzag':
          const segments = sharpBorderSegments;
          const zigzagPath = Array.from({length: segments}, (_, i) => {
            const x = (i / segments) * 100;
            const y = i % 2 === 0 ? 0 : 20;
            return `${x}% ${y}%`;
          }).join(', ');
          return baseStyle + `clip-path: polygon(${zigzagPath}); box-shadow: 0 0 0 ${sharpBorderThickness}px ${borderColors[1]};`;
      }
    }
    
    switch (borderGradientType) {
      case 'straight':
        return `border: ${borderWidth}px solid; border-image: linear-gradient(45deg, ${borderColors[0]}, ${borderColors[1]}) 1;`;
      case 'curved':
        return `border: ${borderWidth}px solid; border-image: radial-gradient(circle, ${borderColors[0]}, ${borderColors[1]}) 1; border-radius: 20px;`;
      case 'wavy':
        return `border: ${borderWidth}px solid; border-image: repeating-linear-gradient(45deg, ${borderColors[0]}, ${borderColors[1]} 10px, ${borderColors[0]} 20px) 1;`;
      case 'zigzag':
        return `border: ${borderWidth}px solid; border-image: repeating-conic-gradient(${borderColors[0]} 0deg 45deg, ${borderColors[1]} 45deg 90deg) 1;`;
      case 'graduated':
        return `border: ${borderWidth}px solid; border-image: linear-gradient(to right, ${borderColors[0]} 0%, ${borderColors[1]} 50%, ${borderColors[0]} 100%) 1;`;
      case 'organic':
        return `border: ${borderWidth}px solid; border-image: conic-gradient(from 0deg, ${borderColors[0]}, ${borderColors[1]}, ${borderColors[0]}) 1; border-radius: 50% 20% 80% 30%;`;
      default:
        return '';
    }
  };

  // Extract hex color from rgba for color input
  const getHexFromOverlayColor = () => {
    if (settings.overlayColor.includes("rgba")) {
      const rgbaMatch = settings.overlayColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
      if (rgbaMatch) {
        const [, r, g, b] = rgbaMatch;
        const hex = "#" + [r, g, b].map(x => {
          const hex = parseInt(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        }).join("");
        return hex;
      }
    }
    return settings.overlayColor.includes("#") ? settings.overlayColor : "#000000";
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Palette className="h-5 w-5" />
          إعدادات الألوان المتقدمة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Background Settings Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <ImageIcon className="h-5 w-5 text-primary" />
            إعدادات الخلفية
          </div>
          
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">استخدام تدرج الخلفية</Label>
              <Switch
                checked={settings.useGradient}
                onCheckedChange={(checked) => updateSetting("useGradient", checked)}
              />
            </div>

            {settings.useGradient ? (
              <div className="space-y-6 animate-fade-in">
                {/* نوع التدرج */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">نوع التدرج</Label>
                  <Select 
                    value={settings.gradientType || 'linear'}
                    onValueChange={(value: ColorSettings['gradientType']) => updateSetting("gradientType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">خطي</SelectItem>
                      <SelectItem value="radial">دائري</SelectItem>
                      <SelectItem value="conic">مخروطي</SelectItem>
                      <SelectItem value="repeating-linear">خطي متكرر</SelectItem>
                      <SelectItem value="repeating-radial">دائري متكرر</SelectItem>
                      <SelectItem value="diamond">ماسي</SelectItem>
                      <SelectItem value="grid">شبكي</SelectItem>
                      <SelectItem value="fade-blend">مزج متدرج</SelectItem>
                      <SelectItem value="soft-transition">انتقال ناعم</SelectItem>
                      <SelectItem value="color-burst">انفجار لوني</SelectItem>
                      <SelectItem value="spiral">حلزوني</SelectItem>
                      <SelectItem value="wave">موجي</SelectItem>
                      <SelectItem value="crystalline">بلوري</SelectItem>
                      <SelectItem value="plasma">بلازمي</SelectItem>
                      <SelectItem value="metallic">معدني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">بداية التدرج</Label>
                    <Input
                      type="color"
                      value={settings.gradientStart}
                      onChange={(e) => updateSetting("gradientStart", e.target.value)}
                      className="h-12 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">نهاية التدرج</Label>
                    <Input
                      type="color"
                      value={settings.gradientEnd}
                      onChange={(e) => updateSetting("gradientEnd", e.target.value)}
                      className="h-12 cursor-pointer"
                    />
                  </div>
                </div>

                {/* زاوية التدرج */}
                <div className="space-y-3">
                  <Label className="text-sm">زاوية التدرج: {settings.gradientDirection}</Label>
                  <Slider
                    value={[parseInt(settings.gradientDirection?.replace('deg', '') || '135')]}
                    onValueChange={([value]) => updateSetting("gradientDirection", `${value}deg`)}
                    min={0}
                    max={360}
                    step={15}
                    className="w-full"
                  />
                </div>

                {/* إعدادات التدرج الدائري والمخروطي */}
                {(settings.gradientType === 'radial' || settings.gradientType === 'conic' || 
                  settings.gradientType === 'repeating-radial' || settings.gradientType === 'diamond' ||
                  settings.gradientType === 'color-burst' || settings.gradientType === 'spiral' || 
                  settings.gradientType === 'crystalline' || settings.gradientType === 'plasma') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">مركز X: {gradientCenterX}%</Label>
                      <Slider
                        value={[gradientCenterX]}
                        onValueChange={([value]) => setGradientCenterX(value)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">مركز Y: {gradientCenterY}%</Label>
                      <Slider
                        value={[gradientCenterY]}
                        onValueChange={([value]) => setGradientCenterY(value)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {/* حجم التدرج */}
                {(settings.gradientType === 'radial' || settings.gradientType === 'repeating-radial') && (
                  <div className="space-y-2">
                    <Label className="text-sm">حجم التدرج: {gradientSize}%</Label>
                    <Slider
                      value={[gradientSize]}
                      onValueChange={([value]) => setGradientSize(value)}
                      min={20}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>
                )}

                {/* تكرار التدرج */}
                {(settings.gradientType === 'repeating-linear' || settings.gradientType === 'repeating-radial' || 
                  settings.gradientType === 'grid' || settings.gradientType === 'plasma') && (
                  <div className="space-y-2">
                    <Label className="text-sm">مسافة التكرار: {gradientRepeat}px</Label>
                    <Slider
                      value={[gradientRepeat]}
                      onValueChange={([value]) => setGradientRepeat(value)}
                      min={10}
                      max={200}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}

                {/* حواف حادة */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm">حواف حادة</Label>
                  <Switch
                    checked={useSharpStops}
                    onCheckedChange={setUseSharpStops}
                  />
                </div>
                
                <div className="p-3 rounded border-2 border-dashed border-muted-foreground/20">
                  <div className="text-xs text-muted-foreground mb-1">معاينة التدرج:</div>
                  <div 
                    className="h-8 rounded"
                    style={{ background: generateBackgroundGradient() }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm">لون الخلفية الأساسي</Label>
                <Input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                  className="h-12 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Overlay Settings Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Layers className="h-5 w-5 text-primary" />
            إعدادات الطبقة العلوية
          </div>
          
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">استخدام تدرج الطبقة العلوية</Label>
              <Switch
                checked={useOverlayGradient}
                onCheckedChange={handleOverlayGradientToggle}
              />
            </div>

            {useOverlayGradient ? (
              <div className="space-y-6 animate-fade-in">
                 {/* نوع التدرج */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">نوع التدرج</Label>
                  <Select 
                    value={overlayGradientType} 
                    onValueChange={(value: typeof overlayGradientType) => 
                      handleGradientSettingChange(setOverlayGradientType, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">خطي</SelectItem>
                      <SelectItem value="radial">دائري</SelectItem>
                      <SelectItem value="conic">مخروطي</SelectItem>
                      <SelectItem value="repeating-linear">خطي متكرر</SelectItem>
                      <SelectItem value="repeating-radial">دائري متكرر</SelectItem>
                      <SelectItem value="diamond">ماسي</SelectItem>
                      <SelectItem value="grid">شبكي معقد</SelectItem>
                      <SelectItem value="fade-blend">تلاشي وتداخل</SelectItem>
                      <SelectItem value="soft-transition">انتقال ناعم</SelectItem>
                      <SelectItem value="color-burst">انفجار لوني</SelectItem>
                      <SelectItem value="spiral">لولبي</SelectItem>
                      <SelectItem value="wave">موجي</SelectItem>
                      <SelectItem value="crystalline">بلوري</SelectItem>
                      <SelectItem value="plasma">بلازما</SelectItem>
                      <SelectItem value="metallic">معدني</SelectItem>
                      <SelectItem value="prism">منشوري</SelectItem>
                      <SelectItem value="aurora">شفق قطبي</SelectItem>
                      <SelectItem value="fire">ناري</SelectItem>
                      <SelectItem value="water">مائي</SelectItem>
                      <SelectItem value="earth">ترابي</SelectItem>
                      <SelectItem value="cosmic">كوني</SelectItem>
                      <SelectItem value="galaxy">مجري</SelectItem>
                      <SelectItem value="rainbow">قوس قزح</SelectItem>
                      <SelectItem value="sunset">غروب</SelectItem>
                      <SelectItem value="ocean">محيطي</SelectItem>
                      <SelectItem value="forest">غابات</SelectItem>
                      <SelectItem value="desert">صحراوي</SelectItem>
                      <SelectItem value="storm">عاصف</SelectItem>
                      <SelectItem value="nebula">سديمي</SelectItem>
                      <SelectItem value="solar">شمسي</SelectItem>
                      <SelectItem value="lunar">قمري</SelectItem>
                      <SelectItem value="volcanic">بركاني</SelectItem>
                      <SelectItem value="glacier">جليدي</SelectItem>
                      <SelectItem value="marble">رخامي</SelectItem>
                      <SelectItem value="silk">حريري</SelectItem>
                      <SelectItem value="electric">كهربائي</SelectItem>
                      <SelectItem value="holographic">ثلاثي الأبعاد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* زاوية التدرج */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">زاوية التدرج: {overlayGradientAngle}°</Label>
                  <Slider
                    value={[overlayGradientAngle]}
                    onValueChange={([value]) => handleGradientSettingChange(setOverlayGradientAngle, value)}
                    min={0}
                    max={360}
                    step={15}
                    className="w-full"
                  />
                </div>

                {/* إعدادات متقدمة للتدرج */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* موضع المركز */}
                  {(overlayGradientType === 'radial' || overlayGradientType === 'conic' || overlayGradientType === 'repeating-radial' || overlayGradientType === 'diamond' || overlayGradientType === 'grid' || overlayGradientType === 'spiral' || overlayGradientType === 'crystalline' || overlayGradientType === 'plasma') && (
                    <div className="space-y-3 bg-accent/20 p-3 rounded-lg">
                      <Label className="text-sm font-medium text-primary">موضع المركز</Label>
                      <div className="space-y-2">
                        <Label className="text-xs">المحور X: {gradientCenterX}%</Label>
                        <Slider
                          value={[gradientCenterX]}
                          onValueChange={([value]) => handleGradientSettingChange(setGradientCenterX, value)}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">المحور Y: {gradientCenterY}%</Label>
                        <Slider
                          value={[gradientCenterY]}
                          onValueChange={([value]) => handleGradientSettingChange(setGradientCenterY, value)}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* حجم التدرج والتكرار */}
                  <div className="space-y-3 bg-accent/20 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-primary">إعدادات الحجم</Label>
                    {overlayGradientType === 'radial' && (
                      <div className="space-y-2">
                        <Label className="text-xs">حجم التدرج: {gradientSize}%</Label>
                        <Slider
                          value={[gradientSize]}
                          onValueChange={([value]) => handleGradientSettingChange(setGradientSize, value)}
                          min={10}
                          max={200}
                          step={10}
                          className="w-full"
                        />
                      </div>
                    )}
                    {(overlayGradientType === 'repeating-linear' || overlayGradientType === 'repeating-radial' || overlayGradientType === 'grid' || overlayGradientType === 'plasma') && (
                      <div className="space-y-2">
                        <Label className="text-xs">مسافة التكرار: {gradientRepeat}px</Label>
                        <Slider
                          value={[gradientRepeat]}
                          onValueChange={([value]) => handleGradientSettingChange(setGradientRepeat, value)}
                          min={10}
                          max={200}
                          step={10}
                          className="w-full"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">التوقفات الحادة</Label>
                      <Switch
                        checked={useSharpStops}
                        onCheckedChange={(checked) => handleGradientSettingChange(setUseSharpStops, checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* ألوان التدرج مع الشفافية المنفصلة */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 bg-muted/20 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-primary">اللون الأول</Label>
                    <Input
                      type="color"
                      value={overlayGradientStart}
                      onChange={(e) => handleOverlayGradientStartChange(e.target.value)}
                      className="h-10 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <Label className="text-xs">الشفافية: {overlayStartOpacity}%</Label>
                      <Slider
                        value={[overlayStartOpacity]}
                        onValueChange={([value]) => handleGradientSettingChange(setOverlayStartOpacity, value)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">موضع البداية: {overlayStartPosition}%</Label>
                      <Slider
                        value={[overlayStartPosition]}
                        onValueChange={([value]) => handleGradientSettingChange(setOverlayStartPosition, value)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 bg-muted/20 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-primary">اللون الثاني</Label>
                    <Input
                      type="color"
                      value={overlayGradientEnd}
                      onChange={(e) => handleOverlayGradientEndChange(e.target.value)}
                      className="h-10 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <Label className="text-xs">الشفافية: {overlayEndOpacity}%</Label>
                      <Slider
                        value={[overlayEndOpacity]}
                        onValueChange={([value]) => handleGradientSettingChange(setOverlayEndOpacity, value)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">موضع النهاية: {overlayEndPosition}%</Label>
                      <Slider
                        value={[overlayEndPosition]}
                        onValueChange={([value]) => handleGradientSettingChange(setOverlayEndPosition, value)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                {/* إعدادات الشفافية المتقدمة */}
                <div className="space-y-4 bg-accent/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-primary">الشفافية المتقدمة</Label>
                    <Switch
                      checked={advancedTransparencyEnabled}
                      onCheckedChange={setAdvancedTransparencyEnabled}
                    />
                  </div>

                  {advancedTransparencyEnabled && (
                    <div className="space-y-4 animate-fade-in">
                      {/* نوع الحدود */}
                      <div className="space-y-2">
                        <Label className="text-xs">نوع الحدود</Label>
                        <Select value={borderType} onValueChange={(value: any) => setBorderType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="soft">ناعمة</SelectItem>
                            <SelectItem value="hard">صلبة</SelectItem>
                            <SelectItem value="feathered">ريشية</SelectItem>
                            <SelectItem value="sharp">حادة</SelectItem>
                            <SelectItem value="glow">متوهجة</SelectItem>
                            <SelectItem value="double">مزدوجة</SelectItem>
                            <SelectItem value="triple">ثلاثية</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* عرض الحدود */}
                      <div className="space-y-2">
                        <Label className="text-xs">عرض الحدود: {borderWidth}px</Label>
                        <Slider
                          value={[borderWidth]}
                          onValueChange={([value]) => setBorderWidth(value)}
                          min={1}
                          max={20}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* نصف قطر التدرج */}
                      {(borderType === 'feathered' || borderType === 'soft') && (
                        <div className="space-y-2">
                          <Label className="text-xs">نصف قطر التدرج: {featherRadius}px</Label>
                          <Slider
                            value={[featherRadius]}
                            onValueChange={([value]) => setFeatherRadius(value)}
                            min={5}
                            max={50}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      )}

                      {/* التوهج الداخلي والخارجي */}
                      {borderType === 'glow' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">التوهج الداخلي: {innerGlow}px</Label>
                            <Slider
                              value={[innerGlow]}
                              onValueChange={([value]) => setInnerGlow(value)}
                              min={0}
                              max={30}
                              step={2}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">التوهج الخارجي: {outerGlow}px</Label>
                            <Slider
                              value={[outerGlow]}
                              onValueChange={([value]) => setOuterGlow(value)}
                              min={0}
                              max={30}
                              step={2}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}

                      {/* لون التوهج */}
                      {borderType === 'glow' && (innerGlow > 0 || outerGlow > 0) && (
                        <div className="space-y-2">
                          <Label className="text-xs">لون التوهج</Label>
                          <Input
                            type="color"
                            value={glowColor}
                            onChange={(e) => setGlowColor(e.target.value)}
                            className="h-8 cursor-pointer"
                          />
                        </div>
                      )}

                      {/* إعدادات الظل */}
                      <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">ظل مخصص</Label>
                          <Switch
                            checked={shadowEnabled}
                            onCheckedChange={setShadowEnabled}
                          />
                        </div>

                        {shadowEnabled && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label className="text-xs">ضبابية الظل: {shadowBlur}px</Label>
                                <Slider
                                  value={[shadowBlur]}
                                  onValueChange={([value]) => setShadowBlur(value)}
                                  min={0}
                                  max={50}
                                  step={2}
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">انتشار الظل: {shadowSpread}px</Label>
                                <Slider
                                  value={[shadowSpread]}
                                  onValueChange={([value]) => setShadowSpread(value)}
                                  min={0}
                                  max={20}
                                  step={1}
                                  className="w-full"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label className="text-xs">لون الظل</Label>
                                <Input
                                  type="color"
                                  value={shadowColor}
                                  onChange={(e) => setShadowColor(e.target.value)}
                                  className="h-8 cursor-pointer"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">شفافية الظل: {shadowOpacity}%</Label>
                                <Slider
                                  value={[shadowOpacity]}
                                  onValueChange={([value]) => setShadowOpacity(value)}
                                  min={0}
                                  max={100}
                                  step={5}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* إعدادات التجسيم */}
                      <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">تأثير التجسيم (Bevel)</Label>
                          <Switch
                            checked={bevelEnabled}
                            onCheckedChange={setBevelEnabled}
                          />
                        </div>

                        {bevelEnabled && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs">حجم التجسيم: {bevelSize}px</Label>
                              <Slider
                                value={[bevelSize]}
                                onValueChange={([value]) => setBevelSize(value)}
                                min={1}
                                max={20}
                                step={1}
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">نعومة التجسيم: {bevelSoftness}%</Label>
                              <Slider
                                value={[bevelSoftness]}
                                onValueChange={([value]) => setBevelSoftness(value)}
                                min={0}
                                max={100}
                                step={10}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* إعدادات التداخل المتقدمة (غير مفعلة افتراضياً) */}
                <div className="space-y-4 bg-accent/10 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-primary">تحكم متقدم في التداخل بين الألوان</Label>
                    <Switch
                      checked={advancedBlendingEnabled}
                      onCheckedChange={setAdvancedBlendingEnabled}
                    />
                  </div>
                  
                  {advancedBlendingEnabled && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="space-y-2">
                        <Label className="text-xs">نوع التداخل</Label>
                        <Select 
                          value={overlayBlendType} 
                          onValueChange={(value: typeof overlayBlendType) => setOverlayBlendType(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="smooth">تداخل ناعم</SelectItem>
                            <SelectItem value="sharp">خط حاد مستقيم</SelectItem>
                            <SelectItem value="wavy">خط متموج</SelectItem>
                            <SelectItem value="zigzag">خط متعرج</SelectItem>
                            <SelectItem value="curved">خط منحني</SelectItem>
                            <SelectItem value="organic">شكل عضوي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                    {/* إعدادات خاصة بنوع التداخل */}
                    {overlayBlendType !== 'smooth' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">عرض المنطقة الانتقالية: {overlayTransitionWidth}px</Label>
                          <Slider
                            value={[overlayTransitionWidth]}
                            onValueChange={([value]) => setOverlayTransitionWidth(value)}
                            min={5}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>

                        {overlayBlendType === 'wavy' && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-xs">تردد الموجة: {overlayWaveFrequency}</Label>
                              <Slider
                                value={[overlayWaveFrequency]}
                                onValueChange={([value]) => setOverlayWaveFrequency(value)}
                                min={1}
                                max={20}
                                step={1}
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">سعة الموجة: {overlayWaveAmplitude}px</Label>
                              <Slider
                                value={[overlayWaveAmplitude]}
                                onValueChange={([value]) => setOverlayWaveAmplitude(value)}
                                min={5}
                                max={50}
                                step={5}
                                className="w-full"
                              />
                            </div>
                          </>
                        )}

                        {overlayBlendType === 'zigzag' && (
                          <div className="space-y-2">
                            <Label className="text-xs">عدد أجزاء التعرج: {overlayZigzagSegments}</Label>
                            <Slider
                              value={[overlayZigzagSegments]}
                              onValueChange={([value]) => setOverlayZigzagSegments(value)}
                              min={3}
                              max={25}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        )}

                        {overlayBlendType === 'curved' && (
                          <div className="space-y-2">
                            <Label className="text-xs">نصف قطر المنحنى: {overlayCurveRadius}%</Label>
                            <Slider
                              value={[overlayCurveRadius]}
                              onValueChange={([value]) => setOverlayCurveRadius(value)}
                              min={10}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* معاينة نوع التداخل */}
                    <div className="p-3 rounded border border-dashed border-muted-foreground/30">
                      <div className="text-xs text-muted-foreground mb-2">معاينة نوع التداخل:</div>
                      <div className="relative h-8 bg-gradient-to-r from-blue-500 to-red-500 rounded overflow-hidden">
                        {overlayBlendType === 'sharp' && (
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                            style={{ width: `${overlayTransitionWidth}%`, left: '40%' }}
                          />
                        )}
                        {overlayBlendType === 'wavy' && (
                          <div className="absolute inset-0">
                            <svg width="100%" height="100%" viewBox="0 0 100 32" preserveAspectRatio="none">
                              <path
                                d={`M 0 16 Q ${25} ${16 - overlayWaveAmplitude} ${50} 16 T 100 16 L 100 32 L 0 32 Z`}
                                fill="rgba(255,255,255,0.3)"
                              />
                            </svg>
                          </div>
                        )}
                        {overlayBlendType === 'zigzag' && (
                          <div className="absolute inset-0">
                            <svg width="100%" height="100%" viewBox="0 0 100 32" preserveAspectRatio="none">
                              <path
                                d={Array.from({length: overlayZigzagSegments}, (_, i) => {
                                  const x = (i / (overlayZigzagSegments - 1)) * 100;
                                  const y = i % 2 === 0 ? 16 - overlayTransitionWidth/4 : 16 + overlayTransitionWidth/4;
                                  return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                                }).join(' ') + ' L 100 32 L 0 32 Z'}
                                fill="rgba(255,255,255,0.3)"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                     </div>
                   </div>
                 )}
                </div>

                {/* معاينة التدرج المتقدم */}
                <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-background/50">
                  <div className="text-sm font-medium text-primary mb-2">معاينة التدرج المتقدم:</div>
                  <div 
                    className="h-12 rounded-lg border"
                    style={{ 
                      background: generateAdvancedGradient()
                    }}
                  />
                  <div className="text-xs text-muted-foreground mt-2 font-mono break-all">
                    {generateAdvancedGradient()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">لون الطبقة العلوية</Label>
                  <Input
                    type="color"
                    value={getHexFromOverlayColor()}
                    onChange={(e) => handleOverlayColorChange(e.target.value)}
                    className="h-12 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">شفافية الطبقة العلوية: {settings.overlayOpacity}%</Label>
                  <Slider
                    value={[settings.overlayOpacity]}
                    onValueChange={([value]) => handleOverlayOpacityChange(value)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Border Settings Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Paintbrush className="h-5 w-5 text-primary" />
            إعدادات الحدود المتطورة
          </div>
          
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            {/* نوع حدود التدرج */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">نوع حدود التدرج</Label>
              <Select 
                value={borderGradientType} 
                onValueChange={(value: typeof borderGradientType) => setBorderGradientType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بلا تدرج</SelectItem>
                  <SelectItem value="straight">مستقيمة</SelectItem>
                  <SelectItem value="curved">منحنية</SelectItem>
                  <SelectItem value="wavy">متموجة</SelectItem>
                  <SelectItem value="zigzag">متعرجة</SelectItem>
                  <SelectItem value="graduated">متدرجة</SelectItem>
                  <SelectItem value="organic">عضوية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(borderGradientType !== 'none' || sharpBorderEnabled) && (
              <div className="space-y-6 animate-fade-in">
                {/* إعدادات الحدود الحادة */}
                {sharpBorderEnabled && (
                  <div className="space-y-4 bg-accent/20 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-primary">إعدادات الحدود الحادة</Label>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">نمط الحد</Label>
                        <Select value={sharpBorderStyle} onValueChange={(value: any) => setSharpBorderStyle(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="straight">خط مستقيم</SelectItem>
                            <SelectItem value="curved">خط منحني</SelectItem>
                            <SelectItem value="zigzag">خط متعرج</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">سماكة الحد: {sharpBorderThickness}px</Label>
                        <Slider
                          value={[sharpBorderThickness]}
                          onValueChange={([value]) => setSharpBorderThickness(value)}
                          min={1}
                          max={10}
                          step={1}
                        />
                      </div>
                      
                      {sharpBorderStyle === 'curved' && (
                        <div className="space-y-2">
                          <Label className="text-xs">درجة الانحناء: {sharpBorderCurvature}%</Label>
                          <Slider
                            value={[sharpBorderCurvature]}
                            onValueChange={([value]) => setSharpBorderCurvature(value)}
                            min={0}
                            max={100}
                            step={5}
                          />
                        </div>
                      )}
                      
                      {sharpBorderStyle === 'zigzag' && (
                        <div className="space-y-2">
                          <Label className="text-xs">عدد الأجزاء: {sharpBorderSegments}</Label>
                          <Slider
                            value={[sharpBorderSegments]}
                            onValueChange={([value]) => setSharpBorderSegments(value)}
                            min={4}
                            max={20}
                            step={2}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="p-3 rounded border-2 border-dashed border-muted-foreground/20">
                  <div className="text-xs text-muted-foreground mb-1">معاينة الحدود المتقدمة:</div>
                  <div 
                    className="h-12 rounded border-4"
                    style={{ 
                      ...(() => {
                        const styles = generateBorderGradient();
                        const styleObj: React.CSSProperties = {};
                        
                        // Parse CSS string to React style object
                        styles.split(';').forEach(rule => {
                          const [property, value] = rule.split(':').map(s => s.trim());
                          if (property && value) {
                            const camelCaseProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                            (styleObj as any)[camelCaseProperty] = value;
                          }
                        });
                        
                        return styleObj;
                      })()
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* زر تمكين الحدود الحادة */}
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
              <Label className="text-sm font-medium">حدود حادة منفصلة</Label>
              <Switch
                checked={sharpBorderEnabled}
                onCheckedChange={setSharpBorderEnabled}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">لون الحدود</Label>
                <Input
                  type="color"
                  value={settings.borderColor}
                  onChange={(e) => updateSetting("borderColor", e.target.value)}
                  className="h-12 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">عرض الحدود: {settings.borderWidth}px</Label>
                <Slider
                  value={[settings.borderWidth]}
                  onValueChange={([value]) => updateSetting("borderWidth", value)}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Template Management Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Paintbrush className="h-5 w-5 text-primary" />
            إدارة نماذج الطبقة العلوية
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <OverlayTemplateSaver 
              gradientSettings={{
                useOverlayGradient,
                gradientType: overlayGradientType as any,
                gradientAngle: overlayGradientAngle,
                centerX: gradientCenterX,
                centerY: gradientCenterY,
                gradientSize,
                colorStops: [
                  { color: overlayGradientStart, opacity: overlayStartOpacity, position: overlayStartPosition },
                  { color: overlayGradientEnd, opacity: overlayEndOpacity, position: overlayEndPosition }
                ]
              }}
              advancedBlendingEnabled={false}
              onSaved={() => setRefreshTrigger(prev => prev + 1)} // تحديث المعرض بعد الحفظ
            />
            
            <Button 
              variant="outline" 
              onClick={resetToDefaults}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              إعادة تعيين الإعدادات
            </Button>
          </div>
          
          <OverlayTemplateGallery 
            refreshTrigger={refreshTrigger} // تمرير محفز التحديث
            onLoadTemplate={(overlaySettings) => {
              setUseOverlayGradient(overlaySettings.useOverlayGradient);
              setOverlayGradientStart(overlaySettings.overlayGradientStart);
              setOverlayGradientEnd(overlaySettings.overlayGradientEnd);
              setOverlayGradientAngle(overlaySettings.overlayGradientAngle);
              setOverlayGradientDirection(overlaySettings.overlayGradientDirection);
              setOverlayStartOpacity(overlaySettings.overlayStartOpacity);
              setOverlayEndOpacity(overlaySettings.overlayEndOpacity);
              setOverlayStartPosition(overlaySettings.overlayStartPosition);
              setOverlayEndPosition(overlaySettings.overlayEndPosition);
              setOverlayGradientType(overlaySettings.overlayGradientType as any);
              setGradientCenterX(overlaySettings.gradientCenterX);
              setGradientCenterY(overlaySettings.gradientCenterY);
              setGradientSize(overlaySettings.gradientSize);
              setGradientRepeat(overlaySettings.gradientRepeat);
              setUseSharpStops(overlaySettings.useSharpStops);
              setBorderGradientType(overlaySettings.borderGradientType as any);
            }}
          />
          
          <Separator className="my-6" />
          
          {/* النظام المحسّن لإدارة النماذج */}
          <EnhancedOverlayTemplateManager 
            currentSettings={{
              use_gradient: useOverlayGradient,
              gradient_type: overlayGradientType as 'linear' | 'radial' | 'conic',
              gradient_angle: overlayGradientAngle,
              center_x: gradientCenterX,
              center_y: gradientCenterY,
              gradient_size: gradientSize,
              use_sharp_stops: useSharpStops,
              first_color: overlayGradientStart,
              first_color_opacity: overlayStartOpacity,
              first_color_position: overlayStartPosition,
              second_color: overlayGradientEnd,
              second_color_opacity: overlayEndOpacity,
              second_color_position: overlayEndPosition,
              blend_mode: 'normal',
              advanced_blending_enabled: advancedBlendingEnabled,
              global_opacity: 100
            }}
            onApplyTemplate={(settings) => {
              setUseOverlayGradient(settings.use_gradient);
              setOverlayGradientType(settings.gradient_type as any);
              setOverlayGradientAngle(settings.gradient_angle);
              setGradientCenterX(settings.center_x);
              setGradientCenterY(settings.center_y);
              setGradientSize(settings.gradient_size);
              setUseSharpStops(settings.use_sharp_stops);
              setOverlayGradientStart(settings.first_color);
              setOverlayStartOpacity(settings.first_color_opacity);
              setOverlayStartPosition(settings.first_color_position);
              setOverlayGradientEnd(settings.second_color);
              setOverlayEndOpacity(settings.second_color_opacity);
              setOverlayEndPosition(settings.second_color_position);
              setAdvancedBlendingEnabled(settings.advanced_blending_enabled);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
