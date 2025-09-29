import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Home</h1>
        <p className="text-muted-foreground mt-2">Welcome to the home page.</p>
      </div>
    </div>
  );
};

export default HomePage;
