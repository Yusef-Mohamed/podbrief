import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Compass, Library } from "lucide-react";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      name: "Home",
      href: "/home",
      icon: Home,
    },
    {
      name: "Explore",
      href: "/explore",
      icon: Compass,
    },
    {
      name: "Your Library",
      href: "/library",
      icon: Library,
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link to="/home" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <span className="text-foreground text-xl font-semibold">
            PodBrief
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.href ||
              (item.href === "/explore" &&
                location.pathname.startsWith("/explore"));

            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
