import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggle";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
      {/* App Icon */}
      <ModeToggle className="mb-8" />
      <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-8">
        <div className="w-12 h-12 bg-primary-foreground rounded-full flex items-center justify-center">
          <span className="text-primary text-2xl font-bold">i</span>
        </div>
      </div>

      {/* App Title */}
      <h1 className="text-5xl font-bold mb-6 text-center">PodBrief</h1>

      {/* Tagline */}
      <div className="text-muted-foreground text-lg text-center max-w-md leading-relaxed mb-10">
        <p>Your daily dose of insightful podcasts, simplified and</p>
        <p>summarized.</p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="px-8">
          <Link to="/signin">Sign In</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="px-8">
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
};

export default Home;
