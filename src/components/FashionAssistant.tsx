import { useState, useEffect } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface AssistantMessage {
  id: string;
  text: string;
  isUser: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export const FashionAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check user profile to determine initial message
    const checkUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if user has completed style quiz
          const hasStyleProfile = localStorage.getItem('userStyle');
          setUserProfile({ hasStyleProfile: !!hasStyleProfile });
          
          if (!hasStyleProfile) {
            // First time user - welcome message
            setMessages([{
              id: '1',
              text: `היי! אני הפיה הדיגיטלית שלך 🧚‍♀️ אני כאן כדי לעזור לך למצוא את הסגנון המושלם. בואי נתחיל עם שאלון הסטיילינג?`,
              isUser: false,
              actions: [{
                label: 'לשאלון הסטיילינג',
                action: () => {
                  navigate('/quiz');
                  setIsOpen(false);
                }
              }]
            }]);
          } else {
            // Returning user - help with filters or recommendations
            setMessages([{
              id: '1', 
              text: `ברוכה השבה! מה נעשה היום? אולי תרצי לגלות לוקים חדשים או לעדכן את ההעדפות שלך?`,
              isUser: false,
              actions: [
                {
                  label: 'חפש לוקים חדשים',
                  action: () => {
                    navigate('/');
                    setIsOpen(false);
                  }
                },
                {
                  label: 'עדכן העדפות',
                  action: () => {
                    navigate('/quiz');
                    setIsOpen(false);
                  }
                }
              ]
            }]);
          }
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      }
    };

    checkUserProfile();
  }, [navigate]);

  const addMessage = (text: string, isUser: boolean, actions?: Array<{label: string; action: () => void}>) => {
    const newMessage: AssistantMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      actions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'style-quiz':
        addMessage('מעולה! אני אוביל אותך לשאלון הסטיילינג 💫', false);
        setTimeout(() => {
          navigate('/quiz');
          setIsOpen(false);
        }, 1000);
        break;
      case 'recommendations':
        addMessage('בואי נמצא לך לוקים מדהימים! 👗', false);
        setTimeout(() => {
          navigate('/');
          setIsOpen(false);
        }, 1000);
        break;
      case 'help':
        addMessage('אני כאן לעזור! איך אני יכולה לסייע לך?', false, [
          {
            label: 'איך משתמשים בפילטרים?',
            action: () => addMessage('הפילטרים נמצאים בעמוד הראשי - תוכלי לבחור מצב רוח, אירוע ועוד כדי למצוא לוקים מותאמים 🎯', false)
          },
          {
            label: 'איך שומרים לוקים למועדפים?',
            action: () => addMessage('פשוט לחצי על הלב ליד כל לוק כדי לשמור אותו ברשימת המועדפים שלך ❤️', false)
          }
        ]);
        break;
    }
  };

  return (
    <>
      {/* Fairy assistant button - positioned on the logo */}
      <div className="fixed top-2 left-20 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-8 h-8 p-0 bg-fashion-primary/20 hover:bg-fashion-primary/30 border-2 border-fashion-primary backdrop-blur-sm shadow-lg"
          variant="ghost"
        >
          <Sparkles className="w-4 h-4 text-fashion-primary animate-pulse" />
        </Button>
      </div>

      {/* Assistant chat window */}
      {isOpen && (
        <div className="fixed top-16 left-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-fashion-primary/20 overflow-hidden">
          <div className="bg-gradient-to-r from-fashion-primary to-fashion-accent p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">הפיה הדיגיטלית שלך</span>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="w-6 h-6 p-0 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-fashion-primary text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.actions && (
                    <div className="mt-2 space-y-1">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          onClick={action.action}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs bg-white hover:bg-fashion-primary hover:text-white"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-600 mb-2">פעולות מהירות:</div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleQuickAction('style-quiz')}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                שאלון סטיילינג
              </Button>
              <Button
                onClick={() => handleQuickAction('recommendations')}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                לוקים חדשים
              </Button>
              <Button
                onClick={() => handleQuickAction('help')}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                עזרה
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};