import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export const OurRules = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background p-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="max-w-2xl mx-auto bg-netflix-card rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-6">Our Rules</h1>
        
        <div className="space-y-4 text-netflix-text">
          <p>
            Welcome to Buy the Look application! By using this application, you agree to all the terms and conditions outlined below.
          </p>
          
          <p>
            Please read these carefully and make sure you understand them before proceeding with the application.
          </p>
          
          <h2 className="text-xl font-medium mt-6 mb-3">Responsible Usage</h2>
          <p>
            Usage: You are required to use the application responsibly and in accordance with the law.
          </p>
          
          <h2 className="text-xl font-medium mt-6 mb-3">Data Protection</h2>
          <p>
            Privacy: We handle your user data with care and respect your privacy according to our privacy policy.
          </p>
          
          <h2 className="text-xl font-medium mt-6 mb-3">Usage Restrictions</h2>
          <p>
            It is prohibited to use the application for illegal purposes or in violation of these terms.
          </p>
          
          <h2 className="text-xl font-medium mt-6 mb-3">Limitation of Liability</h2>
          <p>
            We are not responsible for any damage caused by incorrect use of the application.
          </p>
          
          <h2 className="text-xl font-medium mt-6 mb-3">Terms of Use Updates</h2>
          <p>
            We reserve the right to update these terms from time to time. It's advisable to check them periodically.
          </p>
        </div>
      </div>
    </div>
  );
};