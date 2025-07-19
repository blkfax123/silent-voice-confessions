import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GenderSelectionProps {
  onComplete: () => void;
}

export const GenderSelection = ({ onComplete }: GenderSelectionProps) => {
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const genders = [
    { value: "male", label: "Male", icon: User },
    { value: "female", label: "Female", icon: User },
    { value: "other", label: "Other", icon: Users },
    { value: "prefer_not_to_say", label: "Prefer not to say", icon: Users },
  ];

  const handleSubmit = async () => {
    if (!selectedGender) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('users')
        .update({ gender: selectedGender })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your gender preference has been saved.",
      });

      onComplete();
    } catch (error) {
      console.error('Error updating gender:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="gradient-text">Welcome to Silent Circle</CardTitle>
            <CardDescription>
              Please select your gender to help us personalize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {genders.map((gender) => {
                const Icon = gender.icon;
                return (
                  <motion.button
                    key={gender.value}
                    onClick={() => setSelectedGender(gender.value)}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      selectedGender === gender.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{gender.label}</span>
                  </motion.button>
                );
              })}
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!selectedGender || loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Continue"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};