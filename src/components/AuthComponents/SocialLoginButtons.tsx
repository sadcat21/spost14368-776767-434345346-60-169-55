import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Facebook, Loader2 } from 'lucide-react';
import { FaGoogle, FaApple } from 'react-icons/fa';

interface SocialLoginButtonsProps {
  onFacebookLogin: () => void;
  onGoogleLogin: () => void;
  loading: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onFacebookLogin,
  onGoogleLogin,
  loading
}) => {
  const socialButtons = [
    {
      icon: Facebook,
      label: 'متابعة مع Facebook',
      color: 'bg-[#1877F2] hover:bg-[#166FE5]',
      onClick: onFacebookLogin,
      available: true
    },
    {
      icon: FaGoogle,
      label: 'متابعة مع Gmail',
      color: 'bg-[#DB4437] hover:bg-[#C23321]',
      onClick: onGoogleLogin,
      available: true
    }
  ];

  return (
    <div className="space-y-3">
      {socialButtons.map((button, index) => {
        const IconComponent = button.icon;
        
        return (
          <motion.div
            key={button.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
          >
            <Button
              onClick={button.onClick}
              disabled={loading || !button.available}
              className={`
                w-full h-12 text-white font-medium rounded-xl
                ${button.color}
                ${!button.available ? 'opacity-50 cursor-not-allowed' : ''}
                transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg
                active:scale-[0.98]
              `}
              size="lg"
            >
              {loading && button.available ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  جاري الاتصال...
                </>
              ) : (
                <>
                  <IconComponent className="h-5 w-5 ml-2" />
                  {button.label}
                  {!button.available && (
                    <span className="text-xs opacity-70 mr-2">(قريباً)</span>
                  )}
                </>
              )}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
};