import { useState, useEffect, useCallback } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Phone, Camera, Check, ArrowLeft, Chrome, Apple, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const usernameSchema = z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters");
const phoneSchema = z.string().optional();

const Auth = React.memo(() => {
  const [screen, setScreen] = useState<'hub' | 'signup' | 'signin'>('hub');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; username?: string; phone?: string }>({});

  const { signIn, signUp, signInWithOAuth, user, session } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  }, []);

  const saveOnboardingPreferences = async () => {
    const preferences = localStorage.getItem('onboardingPreferences');
    if (preferences && session?.access_token) {
      try {
        const response = await fetch('http://localhost:3000/api/users/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: preferences
        });
        if (response.ok) {
          localStorage.removeItem('onboardingPreferences');
        }
      } catch (error) {
        console.error('Failed to save onboarding preferences', error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors: { email?: string; password?: string; username?: string; phone?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (screen === 'signup') {
      const usernameResult = usernameSchema.safeParse(username);
      if (!usernameResult.success) {
        newErrors.username = usernameResult.error.errors[0].message;
      }

      const phoneResult = phoneSchema.safeParse(phone);
      if (!phoneResult.success) {
        newErrors.phone = phoneResult.error.errors[0].message;
      }

      if (!acceptTerms) {
        newErrors.email = "You must accept the terms and privacy policy"; // reusing email for general error
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      if (screen === 'signin') {
        const { error } = await signIn(email, password, rememberMe);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          await handlePostAuth();
        }
      } else if (screen === 'signup') {
        const { error } = await signUp(email, password, username, phone || undefined, avatar || undefined);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Try logging in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created successfully!");
          await handlePostAuth();
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple' | 'facebook') => {
    setIsLoading(true);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
    // OAuth will redirect, so no need to set loading false
  };

  const handlePostAuth = async () => {
    await saveOnboardingPreferences();

    // Prompt for contacts access
    const allowContacts = window.confirm("Allow access to your contacts to find and invite friends?");
    if (allowContacts) {
      // TODO: Implement contacts access logic
      console.log("Contacts access granted");
    }

    // Personalization engine activation (placeholder)
    console.log("Personalization engine activated");

    navigate("/");
  };

  const OAuthButtons = () => (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-xl"
        onClick={() => handleOAuth('google')}
        disabled={isLoading}
      >
        <Chrome className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-xl"
        onClick={() => handleOAuth('apple')}
        disabled={isLoading}
      >
        <Apple className="w-5 h-5 mr-2" />
        Continue with Apple
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-xl"
        onClick={() => handleOAuth('facebook')}
        disabled={isLoading}
      >
        <Facebook className="w-5 h-5 mr-2" />
        Continue with Facebook
      </Button>
    </div>
  );

  const HubScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-8"
    >
      <div>
        <h1 className="text-5xl font-bold text-gradient mb-4">
          Clockit
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your ultimate social media and music experience
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={() => setScreen('signup')}
          className="w-full h-14 rounded-2xl text-lg font-semibold"
          size="lg"
        >
          Sign Up
        </Button>
        <Button
          onClick={() => setScreen('signin')}
          variant="outline"
          className="w-full h-14 rounded-2xl text-lg"
          size="lg"
        >
          Sign In
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <OAuthButtons />
      </div>
    </motion.div>
  );

  const SignUpScreen = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-muted-foreground">Join the Clockit community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
              className="pl-10 h-12 rounded-xl bg-muted/50 border-border/50"
            />
          </div>
          {errors.username && (
            <p className="text-destructive text-sm mt-1">{errors.username}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              className="pl-10 h-12 rounded-xl bg-muted/50 border-border/50"
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={handlePhoneChange}
              className="pl-10 h-12 rounded-xl bg-muted/50 border-border/50"
            />
          </div>
          {errors.phone && (
            <p className="text-destructive text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className="pl-10 pr-10 h-12 rounded-xl bg-muted/50 border-border/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            className="hidden"
            id="avatar"
          />
          <label
            htmlFor="avatar"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            {avatar ? avatar.name : "Add profile photo (optional)"}
          </label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
            I accept the{" "}
            <button type="button" className="text-primary hover:underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button type="button" className="text-primary hover:underline">
              Privacy Policy
            </button>
          </label>
        </div>

        <Button
          type="submit"
          variant="glow"
          className="w-full h-12 rounded-xl text-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-background border-t-transparent rounded-full"
            />
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <OAuthButtons />
      </div>

      <div className="text-center">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => {
              setScreen('signin');
              setErrors({});
            }}
            className="text-primary hover:underline font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </motion.div>
  );

  const SignInScreen = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
        <p className="text-muted-foreground">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              className="pl-10 h-12 rounded-xl bg-muted/50 border-border/50"
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className="pl-10 pr-10 h-12 rounded-xl bg-muted/50 border-border/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground">
              Remember me
            </label>
          </div>
          <button type="button" className="text-sm text-primary hover:underline">
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="glow"
          className="w-full h-12 rounded-xl text-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-background border-t-transparent rounded-full"
            />
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <OAuthButtons />
      </div>

      <div className="text-center">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <button
            onClick={() => {
              setScreen('signup');
              setErrors({});
            }}
            className="text-primary hover:underline font-medium"
          >
            Sign Up
          </button>
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back button for signup/signin */}
        {screen !== 'hub' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setScreen('hub')}
            className="mb-6 p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        )}

        {/* Form Card */}
        <div className="glass-card p-8 rounded-3xl">
          <AnimatePresence mode="wait">
            {screen === 'hub' && <HubScreen key="hub" />}
            {screen === 'signup' && <SignUpScreen key="signup" />}
            {screen === 'signin' && <SignInScreen key="signin" />}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
});

export default Auth;
