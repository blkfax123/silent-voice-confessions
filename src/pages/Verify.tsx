import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect to home after 3 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
            </div>
            <CardTitle className="text-2xl text-white">Email Confirmed!</CardTitle>
            <CardDescription className="text-purple-200">
              Your email has been successfully verified. You may now log in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate("/")}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Continue to App
            </Button>
            <p className="text-center text-sm text-purple-300">
              Redirecting automatically in 3 seconds...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Verify;