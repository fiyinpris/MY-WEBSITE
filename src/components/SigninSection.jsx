import { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export const SigninSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleGetOtp = () => {
    if (!name.trim()) return setError("Please enter your name");
    if (!validateEmail(email))
      return setError("Please enter a valid email address");

    setError("");
    setLoading(true);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);

    const templateParams = {
      to_name: name,
      to_email: email,
      otp: otpCode,
    };

    emailjs
      .send(
        "service_f8jpcjv",
        "template_gpentyl",
        templateParams,
        "aYMxHd4D49CBiJT-X"
      )
      .then(
        () => {
          setLoading(false);
          setStep(2);
          setTimer(60);
        },
        (error) => {
          setLoading(false);
          console.error("Failed to send OTP:", error);
          setError("Failed to send OTP. Please try again.");
        }
      );
  };

  // OTP countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // OTP verification
  const handleVerifyOtp = () => {
    if (otp !== generatedOtp) return setError("Invalid OTP. Please try again.");
    setError("");
    setDone(true);

    const userData = { name, email };
    localStorage.setItem("user", JSON.stringify(userData));

    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background mt-12 pt-15 pb-20">
      <div className="relative bg-card border border-border rounded-3xl shadow-2xl w-full lg:max-w-md overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-6 text-center">
          <h1 className="text-3xl font-bold tracking-wide">
            {step === 1 ? "WELCOME!" : "VERIFY OTP"}
          </h1>
        </div>

        {/* Form Content */}
        <div className="px-8 py-8">
          {step === 1 ? (
            <>
              <div className="mb-6">
                <p className="text-foreground text-center mb-6">
                  Sign In or{" "}
                  <span className="underline font-semibold cursor-pointer hover:text-primary">
                    Create an Account
                  </span>
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border-b-2 border-border focus:border-primary focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border-b-2 border-border focus:border-primary focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (OTP will be sent)"
                    readOnly
                    className="w-full px-4 py-3 bg-transparent border-b-2 border-border focus:border-primary focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-foreground/70 hover:text-foreground"
                  >
                    Show
                  </button>
                </div>

                <button
                  onClick={() => {}}
                  className="text-sm text-muted-foreground hover:text-foreground underline text-left"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
              )}

              <button
                onClick={handleGetOtp}
                disabled={loading}
                className={`w-full mt-8 bg-foreground text-background py-3.5 rounded-full font-semibold text-lg transition-all ${
                  loading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-foreground/90 hover:scale-[1.02]"
                }`}
              >
                {loading ? "Sending..." : "Continue"}
              </button>

              <p className="text-xs text-center text-muted-foreground mt-6 leading-relaxed">
                By signing up for email, you agree to my.LIGHTSTORE's{" "}
                <span className="text-primary underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-primary underline cursor-pointer">
                  Privacy Policy
                </span>
                .
              </p>
            </>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-foreground text-center mb-2">
                  Enter the OTP sent to
                </p>
                <p className="text-primary font-semibold text-center">
                  {email}
                </p>
              </div>

              <div className="space-y-5">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full px-4 py-3 bg-transparent border-b-2 border-border focus:border-primary focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground text-center text-2xl tracking-widest"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
              )}

              {done ? (
                <p className="text-green-600 font-semibold text-center mt-6 text-lg">
                  ✓ Verified! Redirecting...
                </p>
              ) : (
                <>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={!otp || otp.length !== 6}
                    className="w-full mt-8 bg-foreground text-background py-3.5 rounded-full font-semibold text-lg transition-all hover:bg-foreground/90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify OTP
                  </button>

                  <button
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setError("");
                    }}
                    className="w-full mt-4 text-primary border-2 border-primary py-3 rounded-full font-semibold hover:bg-primary/10 transition"
                  >
                    Go Back
                  </button>

                  <div className="text-center mt-6">
                    {timer > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Resend OTP in{" "}
                        <span className="font-bold text-foreground">
                          {timer}s
                        </span>
                      </p>
                    ) : (
                      <button
                        onClick={handleGetOtp}
                        className="text-sm text-primary font-semibold underline hover:text-primary/80"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
