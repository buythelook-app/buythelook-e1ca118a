import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { HomeButton } from "./HomeButton";

export const AboutApp = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-700 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="max-w-2xl mx-auto bg-fashion-glass rounded-xl p-6 backdrop-blur-xl border border-white/20">
        <h1 className="text-3xl font-bold fashion-hero-text mb-6">About The App</h1>
        
        <div className="space-y-4 text-gray-700">
          <p>
            Welcome to Buy the Look! We're your ultimate destination for personalized customization! We believe in providing you with a unique and tailored shopping experience, as we help you unleash the look that best represents you.
          </p>
          
          <p>
            In our app, you'll discover personalized styling recommendations based on your tastes and needs. We are committed to delivering a personalized and engaging experience for all users of public and private services.
          </p>
          
          <p>
            We invite you to explore the exciting possibilities that Buy the Look has to offer! Our fashion experts and AI-powered recommendations are here to enhance your personal style.
          </p>
          
          <p>
            We're thrilled to see how Buy the Look can enhance your personal customization journey. Start exploring today!
          </p>
        </div>
      </div>
      <HomeButton />
    </div>
  );
};