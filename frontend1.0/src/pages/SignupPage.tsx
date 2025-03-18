import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, Lock, User, CheckCircle } from "lucide-react";

export function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!username || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post('http://localhost:3001/api/v1/user/signup', {
        username,
        password,
      });

      if (response.status === 201) {
        navigate('/signin');
      }
    } catch (error) {
      setError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-4xl md:grid md:grid-cols-2 shadow-xl rounded-3xl overflow-hidden">
        
        {/* Left Side - Sign Up */}
        <div className="bg-white p-10 flex flex-col justify-center w-full">
          <CardHeader className="space-y-4 pb-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-gray-500" />
            </div>
            <CardTitle className="text-center">
              <h2 className="text-3xl font-bold text-blue-800">Sign Up</h2>
              <p className="text-sm font-normal text-gray-500 mt-2">
                Create an account to get started
              </p>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-sm text-red-500 text-center">{error}</p>
              </div>
            )}

            {/* Username Input */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-gray-50 border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-gray-50 border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-gray-50 border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
              />
            </div>

            {/* Sign Up Button */}
            <Button
              className="w-full bg-gray-800 text-white hover:bg-gray-700 transition-all duration-200 font-medium py-3 rounded-lg"
              onClick={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign Up"
              )}
            </Button>

            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => navigate('/signin')}
                  className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </div>

        {/* Right Side - Welcome Message */}
        <div className="hidden md:flex bg-gradient-to-br from-purple-400 to-pink-400 flex-col justify-center items-center p-10 text-white">
          {/* D Shape */}
          <div className="absolute top-0 left-0 h-full w-1/2 bg-white/20 rounded-r-full -z-10" />

          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-white" />
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight leading-tight">
            Join Butter Money  
          </h2>

          {/* Description */}
          <p className="text-center text-base font-light mb-8 mt-4 leading-relaxed">
            Create your account today and explore the best home loan solutions.
            Fast, secure, and tailored to your needs.
          </p>

          {/* Decorative Icons */}
          <div className="flex space-x-6 mt-4">
            <div className="flex flex-col items-center">
              <Lock className="w-8 h-8 text-white/70" />
              <p className="text-sm text-white/60 mt-2">Secure</p>
            </div>
            <div className="flex flex-col items-center">
              <User className="w-8 h-8 text-white/70" />
              <p className="text-sm text-white/60 mt-2">Easy Access</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-white/70" />
              <p className="text-sm text-white/60 mt-2">Fast</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
