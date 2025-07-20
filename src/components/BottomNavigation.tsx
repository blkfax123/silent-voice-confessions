import { Link, useLocation } from "react-router-dom";
import { Home, Search, MessageCircle, Plus, User } from "lucide-react";
import { motion } from "framer-motion";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Post", href: "/post", icon: Plus },
  { name: "Profile", href: "/profile", icon: User },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-t border-border">
      <div className="max-w-md mx-auto px-2">
        <div className="flex justify-around items-center py-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className="relative flex flex-col items-center p-2 rounded-xl transition-colors duration-200"
              >
                <motion.div
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg nav-glow" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'nav-glow' : ''}`} />
                </motion.div>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                <span className={`text-xs mt-1 transition-colors duration-200 ${
                  isActive ? "text-primary-glow font-medium" : "text-muted-foreground"
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};