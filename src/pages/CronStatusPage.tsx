
import { CronStatusChecker } from "@/components/CronStatusChecker";
import { HomeButton } from "@/components/HomeButton";

export default function CronStatusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cron Job Status</h1>
        <HomeButton />
      </div>
      
      <div className="flex justify-center">
        <CronStatusChecker />
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">הסבר על הקרון</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>• <strong>מטרה:</strong> להפעיל את ה-trainer-agent באופן אוטומטי מדי יום</p>
          <p>• <strong>תזמון:</strong> 9:00 בבוקר UTC (12:00 בישראל בחורף, 13:00 בקיץ)</p>
          <p>• <strong>פעולה:</strong> יצירת תוצאות agent validation והכנסתן למסד הנתונים</p>
          <p>• <strong>לוגים:</strong> ניתן לראות בקונסול של הדפדפן ובלוגים של Supabase Edge Functions</p>
        </div>
      </div>
    </div>
  );
}
