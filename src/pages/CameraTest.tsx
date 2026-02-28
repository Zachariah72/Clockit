import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Camera as CameraComponent } from "@/components/Camera";
import { Layout } from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";

const CameraTest = () => {
  const navigate = useNavigate();
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const handleCapture = (imageData: string, file: File) => {
    setCapturedImages(prev => [...prev, imageData]);
    console.log('Captured image:', file);
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
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Camera Test</h1>
                <p className="text-sm text-muted-foreground">Test camera functionality</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Camera Component */}
        <div className="p-4">
          <div className="max-w-md mx-auto">
            <CameraComponent
              onCapture={handleCapture}
              className="w-full"
            />
          </div>

          {/* Captured Images Gallery */}
          {capturedImages.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Captured Images ({capturedImages.length})
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {capturedImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-square rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={image}
                      alt={`Capture ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CameraTest;