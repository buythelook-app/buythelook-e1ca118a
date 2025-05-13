
interface StyleProfileDisplayProps {
  styleProfile: string | undefined;
}

export const StyleProfileDisplay = ({ styleProfile }: StyleProfileDisplayProps) => {
  if (!styleProfile) return null;
  
  return (
    <div className="mt-4 md:mt-0 px-4 py-2 bg-netflix-card rounded-full text-netflix-accent">
      Based on your {styleProfile} style preference
    </div>
  );
};
