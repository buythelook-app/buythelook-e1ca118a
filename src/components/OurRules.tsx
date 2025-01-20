import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { HomeButton } from "./HomeButton";

export const OurRules = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← Back
        </Button>

        <h1 className="text-2xl font-semibold mb-6">Our Rules</h1>

        <div className="bg-netflix-card rounded-lg p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">General Guidelines</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Treat all members with respect and courtesy</li>
              <li>No harassment or bullying of any kind</li>
              <li>Keep discussions fashion-focused and constructive</li>
              <li>No spam or promotional content without approval</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Shopping Rules</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All purchases are final unless items are defective</li>
              <li>Returns must be initiated within 14 days</li>
              <li>Items must be unworn with original tags attached</li>
              <li>Shipping costs for returns are buyer's responsibility</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Community Guidelines</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Share authentic and honest reviews</li>
              <li>Respect intellectual property rights</li>
              <li>Report inappropriate content or behavior</li>
              <li>Follow size and measurement guidelines</li>
            </ul>
          </section>
        </div>
      </div>
      <HomeButton />
    </div>
  );
};