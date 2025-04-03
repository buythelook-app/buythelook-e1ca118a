
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StyleTipsProps {
  recommendations: string[];
  stylePreference?: string | null;
}

export const StyleTips = ({ recommendations, stylePreference }: StyleTipsProps) => {
  if (!recommendations || recommendations.length === 0) return null;
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{stylePreference ? `${stylePreference} Style Tips` : 'Styling Tips'}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="text-gray-700">{recommendation}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
