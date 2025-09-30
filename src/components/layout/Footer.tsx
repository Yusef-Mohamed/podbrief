import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} Podbreaf. All rights reserved.
    </footer>
  );
};

export default Footer;
