import React from 'react';
import type { SidebarLogoSettings } from '@/components/SidebarLogoCustomizer';

interface LogoWithFrameProps {
  logoSettings: SidebarLogoSettings;
  className?: string;
  containerClassName?: string;
}

export const LogoWithFrame: React.FC<LogoWithFrameProps> = ({
  logoSettings,
  className = "",
  containerClassName = ""
}) => {
  if (!logoSettings?.logoUrl) return null;

  // حساب موضع الشعار
  const getLogoPosition = () => {
    if (logoSettings.useCustomLogoPosition) {
      return {
        top: `${logoSettings.customLogoY}%`,
        left: `${logoSettings.customLogoX}%`,
        transform: 'translate(-50%, -50%)'
      };
    }

    const position = logoSettings.logoPosition;
    let styles: React.CSSProperties = {};

    // تحديد الموضع العمودي
    if (position.includes('top')) {
      styles.top = '8px';
    } else if (position.includes('bottom')) {
      styles.bottom = '8px';
    } else if (position.includes('center')) {
      styles.top = '50%';
      styles.transform = 'translateY(-50%)';
    }

    // تحديد الموضع الأفقي
    if (position.includes('left')) {
      styles.left = '8px';
    } else if (position.includes('right')) {
      styles.right = '8px';
    } else if (position.includes('center') || position === 'center') {
      styles.left = '50%';
      styles.transform = styles.transform ? 'translate(-50%, -50%)' : 'translateX(-50%)';
    }

    return styles;
  };

  // الحصول على أنماط الإطار
  const getFrameStyles = (): React.CSSProperties => {
    if (!logoSettings.logoFrameEnabled || logoSettings.logoFrameShape === 'none') {
      return {};
    }

    let frameStyles: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1,
      pointerEvents: 'none',
    };

    // الشكل الأساسي
    const { logoFrameShape } = logoSettings;
    
    // تطبيق الأشكال المختلفة
    switch (logoFrameShape) {
      case 'circle':
        frameStyles.borderRadius = '50%';
        break;
      case 'square':
        frameStyles.borderRadius = '0';
        break;
      case 'rounded-square':
        frameStyles.borderRadius = '15%';
        break;
      case 'rectangle':
        frameStyles.borderRadius = '0';
        frameStyles.aspectRatio = '16/9';
        break;
      case 'oval':
        frameStyles.borderRadius = '50%';
        frameStyles.aspectRatio = '16/9';
        break;
      case 'diamond':
        frameStyles.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
        break;
      case 'hexagon':
        frameStyles.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
        break;
      case 'octagon':
        frameStyles.clipPath = 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)';
        break;
      case 'pentagon':
        frameStyles.clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
        break;
      case 'star':
        frameStyles.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        break;
      case 'heart':
        frameStyles.clipPath = 'polygon(50% 100%, 0% 40%, 0% 25%, 25% 0%, 50% 25%, 75% 0%, 100% 25%, 100% 40%)';
        break;
      case 'shield':
        frameStyles.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
        break;
      case 'trapezoid':
        frameStyles.clipPath = 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)';
        break;
      case 'arrow-right':
        frameStyles.clipPath = 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)';
        break;
      case 'arrow-up':
        frameStyles.clipPath = 'polygon(20% 0%, 80% 0%, 100% 60%, 80% 60%, 80% 100%, 20% 100%, 20% 60%, 0% 60%)';
        break;
      case 'cross':
        frameStyles.clipPath = 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)';
        break;
      case 'ribbon':
        frameStyles.clipPath = 'polygon(0% 0%, 100% 0%, 90% 50%, 100% 100%, 0% 100%, 10% 50%)';
        break;
      case 'flower':
        frameStyles.borderRadius = '0 100% 0 100%';
        break;
      case 'leaf':
        frameStyles.borderRadius = '0 100%';
        break;
      case 'organic':
        frameStyles.borderRadius = '63% 37% 54% 46% / 55% 48% 52% 45%';
        break;
      case 'wave':
        frameStyles.clipPath = 'polygon(0% 50%, 15% 30%, 40% 45%, 65% 25%, 100% 50%, 100% 100%, 0% 100%)';
        break;
      default:
        break;
    }

    // الأبعاد
    const frameSize = logoSettings.logoSize + (logoSettings.logoFramePadding * 2);
    frameStyles.width = `${frameSize}px`;
    frameStyles.height = `${frameSize}px`;

    // الأبعاد المخصصة
    if (logoSettings.logoFrameCustomDimensions) {
      if (logoSettings.logoFrameAspectRatio === 'custom') {
        frameStyles.width = `${logoSettings.logoFrameWidth}px`;
        frameStyles.height = `${logoSettings.logoFrameHeight}px`;
      } else if (logoSettings.logoFrameAspectRatio === 'portrait') {
        frameStyles.aspectRatio = '3/4';
      } else if (logoSettings.logoFrameAspectRatio === 'landscape') {
        frameStyles.aspectRatio = '4/3';
      }
    }

    // اللون والخلفية
    if (logoSettings.logoFrameGradientEnabled) {
      frameStyles.background = `linear-gradient(${logoSettings.logoFrameGradientDirection}deg, ${logoSettings.logoFrameGradientStart}, ${logoSettings.logoFrameGradientEnd})`;
    } else {
      const alpha = Math.round((logoSettings.logoFrameOpacity / 100) * 255).toString(16).padStart(2, '0');
      frameStyles.backgroundColor = `${logoSettings.logoFrameColor}${alpha}`;
    }

    // الحدود
    if (logoSettings.logoFrameBorderWidth > 0) {
      const borderAlpha = Math.round(((logoSettings.logoFrameBorderOpacity || 100) / 100) * 255).toString(16).padStart(2, '0');
      frameStyles.border = `${logoSettings.logoFrameBorderWidth}px ${logoSettings.logoFrameBorderStyle} ${logoSettings.logoFrameBorderColor}${borderAlpha}`;
    }

    // الظلال
    if (logoSettings.logoFrameShadowEnabled) {
      const shadowAlpha = Math.round((logoSettings.logoFrameShadowOpacity / 100) * 255).toString(16).padStart(2, '0');
      const shadowColor = logoSettings.logoFrameShadowColor.includes('rgba') 
        ? logoSettings.logoFrameShadowColor
        : `${logoSettings.logoFrameShadowColor}${shadowAlpha}`;
      
      frameStyles.boxShadow = `${logoSettings.logoFrameShadowOffsetX}px ${logoSettings.logoFrameShadowOffsetY}px ${logoSettings.logoFrameShadowBlur}px ${logoSettings.logoFrameShadowSpread}px ${shadowColor}`;
    }

    // الدوران
    frameStyles.transform = `translate(-50%, -50%) rotate(${logoSettings.logoFrameRotation}deg)`;

    // الحركات
    if (logoSettings.logoFrameAnimationEnabled && logoSettings.logoFrameAnimationType !== 'none') {
      const speed = (100 - logoSettings.logoFrameAnimationSpeed) / 10 + 0.5; // من 0.5 إلى 10 ثواني
      const intensity = logoSettings.logoFrameAnimationIntensity / 100;

      switch (logoSettings.logoFrameAnimationType) {
        case 'pulse':
          frameStyles.animation = `pulse ${speed}s infinite`;
          break;
        case 'rotate':
          frameStyles.animation = `spin ${speed}s linear infinite`;
          break;
        case 'bounce':
          frameStyles.animation = `bounce ${speed}s infinite`;
          break;
        case 'float':
          frameStyles.animation = `float ${speed}s ease-in-out infinite`;
          break;
        case 'glow':
          frameStyles.animation = `glow ${speed}s ease-in-out infinite`;
          break;
        case 'zoom':
          frameStyles.animation = `zoom ${speed}s ease-in-out infinite`;
          break;
        case 'shake':
          frameStyles.animation = `shake ${speed}s infinite`;
          break;
      }
    }

    return frameStyles;
  };

  const logoPosition = getLogoPosition();
  const frameStyles = getFrameStyles();

  return (
    <div 
      className={`absolute ${containerClassName}`}
      style={logoPosition}
    >
      {/* الإطار */}
      {logoSettings.logoFrameEnabled && logoSettings.logoFrameShape !== 'none' && (
        <div style={frameStyles} />
      )}
      
      {/* الشعار */}
      <img
        src={logoSettings.logoUrl}
        alt="شعار"
        className={`relative z-10 object-contain ${className}`}
        style={{
          width: `${logoSettings.logoSize}px`,
          height: `${logoSettings.logoSize}px`,
          opacity: logoSettings.logoOpacity / 100,
          filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.1))`
        }}
      />
    </div>
  );
};

export default LogoWithFrame;