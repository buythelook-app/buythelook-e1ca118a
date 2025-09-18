import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useFairyGuidance } from "@/hooks/useFairyGuidance";

interface FairyAssistantProps {
  isAuthenticated: boolean;
  firstName?: string;
}

export const FairyAssistant = ({ isAuthenticated, firstName }: FairyAssistantProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCurrentGuidance, markActionCompleted } = useFairyGuidance();

  // Animation states
  const [isFloating, setIsFloating] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  useEffect(() => {
    // Show fairy after a brief delay on first load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Get contextual guidance based on current route and user state
    const guidance = getCurrentGuidance(location.pathname, isAuthenticated);
    if (guidance) {
      setCurrentMessage(guidance.message);
      setShowMessage(true);
      
      // Auto-hide message after reading time
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
      }, guidance.duration || 8000);

      return () => clearTimeout(hideTimer);
    }
  }, [location.pathname, isAuthenticated, getCurrentGuidance]);

  useEffect(() => {
    // Idle detection - show hints after inactivity
    const checkIdle = () => {
      const now = Date.now();
      if (now - lastInteraction > 30000) { // 30 seconds idle
        const guidance = getCurrentGuidance(location.pathname, isAuthenticated, true);
        if (guidance) {
          setCurrentMessage(guidance.message);
          setShowMessage(true);
        }
      }
    };

    const idleTimer = setInterval(checkIdle, 10000);
    return () => clearInterval(idleTimer);
  }, [lastInteraction, location.pathname, isAuthenticated, getCurrentGuidance]);

  const handleFairyClick = () => {
    setIsExpanded(!isExpanded);
    setLastInteraction(Date.now());
    
    if (!isExpanded) {
      // Show contextual help when expanded
      const guidance = getCurrentGuidance(location.pathname, isAuthenticated);
      if (guidance) {
        setCurrentMessage(guidance.message);
        setShowMessage(true);
      }
    }
  };

  const handleActionClick = (action: string) => {
    setLastInteraction(Date.now());
    markActionCompleted(action);
    
    switch (action) {
      case 'start_quiz':
        navigate('/quiz');
        break;
      case 'view_looks':
        navigate('/');
        break;
      case 'open_filters':
        // Trigger filter opening logic
        break;
      case 'sign_up':
        navigate('/auth');
        break;
      default:
        break;
    }
    
    setIsExpanded(false);
    setShowMessage(false);
  };

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return firstName ? `${timeGreeting}, ${firstName}!` : `${timeGreeting}!`;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Fairy Character */}
      <div 
        className={`fixed z-50 transition-all duration-500 cursor-pointer ${
          isFloating ? 'animate-bounce' : ''
        }`}
        style={{
          top: '300px',
          left: '20px',
          transform: isExpanded ? 'scale(1.1)' : 'scale(1)',
        }}
        onClick={handleFairyClick}
      >
        <div className="relative">
          {/* Fairy Image - using only the fairy */}
          <div className={`
            w-14 h-14 rounded-full bg-gradient-to-br from-fashion-primary to-fashion-accent 
            flex items-center justify-center shadow-lg transform transition-all duration-300
            ${isExpanded ? 'shadow-xl scale-110' : 'hover:scale-105'}
            border-2 border-white/20
          `}>
            <img 
              src="/lovable-uploads/fairy-only.png" 
              alt="Fashion Fairy Assistant" 
              className="w-16 h-16 object-contain"
            />
          </div>
          
          {/* Sparkle effect */}
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-4 h-4 text-fashion-accent animate-pulse" />
          </div>
          
          {/* Notification dot for new guidance */}
          {showMessage && !isExpanded && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-netflix-accent rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Message Bubble */}
      {showMessage && (
        <div 
          className={`fixed z-40 transition-all duration-300 ${
            isExpanded ? 'left-24' : 'left-24'
          }`}
          style={{
            top: '290px',
            maxWidth: '300px',
          }}
        >
          <Card className="bg-white/95 backdrop-blur-sm border border-fashion-primary/20 p-4 shadow-xl">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {currentMessage}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMessage(false)}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {location.pathname === '/' && !isAuthenticated && (
                <Button
                  size="sm"
                  onClick={() => handleActionClick('sign_up')}
                  className="text-xs bg-fashion-primary hover:bg-fashion-primary/90"
                >
                  Sign Up
                </Button>
              )}
              
              {location.pathname === '/' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleActionClick('start_quiz')}
                  className="text-xs border-fashion-primary text-fashion-primary hover:bg-fashion-primary hover:text-white"
                >
                  Styling Quiz
                </Button>
              )}
            </div>
          </Card>
          
          {/* Speech bubble tail */}
          <div 
            className="absolute top-6 -left-2 w-4 h-4 bg-white/95 border-l border-b border-fashion-primary/20 transform rotate-45"
          />
        </div>
      )}

      {/* Expanded Help Panel */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        >
          <div 
            className="absolute top-80 left-24 w-80 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-white border border-fashion-primary/20 shadow-2xl">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-fashion-primary" />
                    Your Fashion Assistant
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{getUserGreeting()}</p>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">How can I help you?</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActionClick('start_quiz')}
                      className="w-full justify-start text-xs"
                    >
                      🎯 Start Styling Quiz
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActionClick('view_looks')}
                      className="w-full justify-start text-xs"
                    >
                      👗 View Outfit Recommendations
                    </Button>
                    {!isAuthenticated && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActionClick('sign_up')}
                        className="w-full justify-start text-xs"
                      >
                        ✨ Sign Up for Account
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    I'm here to guide you and help you find the perfect styling for you!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};