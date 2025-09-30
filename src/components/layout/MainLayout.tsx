import React from "react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import Header from "./Header";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="flex-1 pb-20">
          <div className="px-6 py-8">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
