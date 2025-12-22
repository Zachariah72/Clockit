import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Palette, Check, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

const Appearance = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [showPreview, setShowPreview] = useState(false);

  const themes = [
    {
      id: "light",
      name: "Light",
      description: "Clean and bright interface",
      icon: Sun,
      preview: {
        background: "bg-white",
        text: "text-gray-900",
        accent: "bg-blue-500"
      }
    },
    {
      id: "dark",
      name: "Dark",
      description: "Easy on the eyes in low light",
      icon: Moon,
      preview: {
        background: "bg-gray-900",
        text: "text-white",
        accent: "bg-blue-500"
      }
    },
    {
      id: "black",
      name: "Monochrome",
      description: "Pure black theme for everything",
      icon: EyeOff,
      preview: {
        background: "bg-black",
        text: "text-black",
        accent: "bg-black"
      }
    },
    {
      id: "teal",
      name: "Ocean Teal",
      description: "Refreshing teal accent theme",
      icon: Palette,
      preview: {
        background: "bg-slate-50 dark:bg-slate-900",
        text: "text-slate-900 dark:text-slate-100",
        accent: "bg-[#3B9797]"
      }
    }
  ];

  const handleThemeSelect = async (themeId: string) => {
    try {
      setTheme(themeId as any);
      toast.success(`Switched to ${themes.find(t => t.id === themeId)?.name} theme`);
    } catch (error) {
      console.error('Theme change error:', error);
      toast.error('Failed to change theme');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Appearance & Themes</h1>
                <p className="text-sm text-muted-foreground">Customize your visual experience</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Current Theme</h3>
                <p className="text-sm text-muted-foreground">
                  {themes.find(t => t.id === theme)?.name || "Unknown"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? "Hide" : "Preview"}
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Theme Selection */}
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4">
            {themes.map((themeOption, index) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.id;

              return (
                <motion.div
                  key={themeOption.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleThemeSelect(themeOption.id)}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        themeOption.id === "black"
                          ? "bg-black"
                          : themeOption.id === "teal"
                          ? "bg-[#3B9797]"
                          : "bg-primary"
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          themeOption.id === "black" ? "text-black" : "text-primary-foreground"
                        }`} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground">{themeOption.name}</h3>
                        <p className="text-sm text-muted-foreground">{themeOption.description}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Theme Preview */}
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-3 rounded-lg border bg-muted/30"
                    >
                      <div className={`w-full h-16 rounded ${themeOption.preview.background} border flex items-center justify-center`}>
                        <div className={`text-sm font-medium ${themeOption.preview.text}`}>
                          Sample Text
                        </div>
                        <div className={`ml-2 w-4 h-4 rounded-full ${themeOption.preview.accent}`}></div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Theme Information */}
        <div className="p-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-2xl bg-muted/30 border border-border"
          >
            <h3 className="font-semibold text-foreground mb-2">Theme Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Light:</strong> Standard light theme with high contrast</p>
              <p><strong>Dark:</strong> Dark theme optimized for low-light environments</p>
              <p><strong>Monochrome:</strong> Pure black theme - everything becomes black (#000000)</p>
              <p><strong>Ocean Teal:</strong> Teal accent theme with #3B9797 color</p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Changes are saved automatically
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Appearance;