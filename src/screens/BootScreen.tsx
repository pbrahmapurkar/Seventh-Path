import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppShell } from '../components/AppShellRouter';
import seventhPathLogo from '../assets/d39dcef0d5c4765688b970ab66912bbb65f81e62.png';

export function BootScreen() {
  const { navigate, isOnboarded } = useAppShell();
  const [isVisible, setIsVisible] = useState(true);

  // Inspiring taglines to rotate through
  const taglines = [
    "One step closer to your best self",
    "Small actions, big changes",
    "Progress starts here",
    "Consistency made simple"
  ];
  const [currentTagline, setCurrentTagline] = useState(taglines[0]);

  useEffect(() => {
    // Rotate taglines during loading
    const taglineInterval = setInterval(() => {
      setCurrentTagline(prev => {
        const currentIndex = taglines.indexOf(prev);
        return taglines[(currentIndex + 1) % taglines.length];
      });
    }, 600);

    // Complete loading after 2 seconds
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      
      // Navigate immediately after fade starts
      const targetRoute = isOnboarded ? '/home' : '/onboarding';
      
      // Immediate navigation as fallback
      try {
        navigate(targetRoute);
      } catch (error) {
        // Silent error handling for production
      }
      
      // Also try after fade animation
      setTimeout(() => {
        try {
          navigate(targetRoute);
        } catch (error) {
          // Silent error handling for production
        }
      }, 300); // Faster cross-fade animation
    }, 2000); // 2 seconds total duration

    return () => {
      clearInterval(taglineInterval);
      clearTimeout(completeTimer);
    };
  }, [navigate, isOnboarded]); // Removed taglines from dependencies

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.3, ease: "easeInOut" }
          }}
          transition={{ 
            duration: 0.4, 
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Deep Navy to Near-Black Gradient Background */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              background: `
                linear-gradient(135deg, 
                  #0a1628 0%, 
                  #091a29 25%, 
                  #0c1117 50%, 
                  #0a0a0a 75%, 
                  #000000 100%
                )
              `
            }}
          />

          {/* Soft Primary Accent Wash */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.08) 0%, rgba(0, 0, 0, 0.4) 70%)'
            }}
          />

          {/* Safe-Area-Aware Content Container */}
          <div 
            className="flex flex-col items-center justify-center px-8 py-12 max-w-sm mx-auto relative z-10"
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)',
            }}
          >
            
            {/* Logo Animation - Scale In with Breathing Glow */}
            <motion.div
              initial={{ scale: 1.0, opacity: 0 }}
              animate={{ 
                scale: [1.0, 1.2, 1.0], 
                opacity: 1
              }}
              transition={{ 
                duration: 0.5, 
                delay: 0.05,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="mb-8 relative"
            >
              {/* Primary-Tinted Breathing Glow */}
              <motion.div
                className="absolute inset-0 w-32 h-32 rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                  filter: 'blur(15px)'
                }}
              />
              
              {/* Logo Container */}
              <motion.div 
                className="w-24 h-24 rounded-full flex items-center justify-center relative shadow-2xl"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.2)",
                    "0 0 30px rgba(59, 130, 246, 0.3)",
                    "0 0 20px rgba(59, 130, 246, 0.2)"
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(59, 130, 246, 0.1) 0%, 
                      rgba(15, 23, 42, 0.8) 50%, 
                      rgba(0, 0, 0, 0.9) 100%
                    )
                  `,
                  border: '2px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                {/* App Logo */}
                <motion.img 
                  src={seventhPathLogo} 
                  alt="Seventh Path" 
                  className="w-14 h-14 object-contain relative z-10"
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3)) brightness(1.05)'
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Loading Indicator and Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="flex flex-col items-center space-y-6 w-full max-w-xs"
            >
              {/* Thin Shimmering Progress Bar */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Inspiring Tagline */}
              <motion.div
                key={currentTagline}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <motion.p 
                  className="text-white/80 text-lg font-medium"
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    letterSpacing: '0.02em',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {currentTagline}
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}