import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MagicLinkButtonProps {
  isLoading: boolean;
  onSendMagicLink: (email: string) => Promise<void>;
}

export const MagicLinkButton = ({ isLoading, onSendMagicLink }: MagicLinkButtonProps) => {
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const { toast } = useToast();

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין כתובת מייל",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@")) {
      toast({
        title: "שגיאה", 
        description: "נא להזין כתובת מייל תקינה",
        variant: "destructive",
      });
      return;
    }

    await onSendMagicLink(email);
    setShowEmailInput(false);
    setEmail("");
  };

  if (showEmailInput) {
    return (
      <div className="space-y-3">
        <Input
          type="email"
          placeholder="הזן כתובת מייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-right"
          dir="rtl"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSendMagicLink}
            disabled={isLoading}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Mail className="mr-2 h-4 w-4" />
            שלח קישור התחברות
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowEmailInput(false)}
            disabled={isLoading}
          >
            ביטול
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full bg-background text-foreground hover:bg-muted border-border"
      onClick={() => setShowEmailInput(true)}
    >
      <Mail className="mr-2 h-4 w-4" />
      התחבר עם מייל
    </Button>
  );
};