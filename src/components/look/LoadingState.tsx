
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-netflix-accent" />
    </div>
  );
};
