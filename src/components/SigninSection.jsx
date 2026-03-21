import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { Eye, EyeOff } from "lucide-react";

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(base64));
}

export const SigninSection = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [userName, setUserName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    emailjs.init("aYMxHd4D49CBiJT-X");
    loadGoogleOneTap();
  }, []);

  useEffect(() => {
    if (step === 5) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setCountdown(4);
      const iv = setInterval(
        () => setCountdown((c) => (c > 0 ? c - 1 : 0)),
        1000,
      );
      return () => clearInterval(iv);
    }
  }, [step]);

  const loadGoogleOneTap = () => {
    if (window.google) {
      initializeGoogleOneTap();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => initializeGoogleOneTap();
    script.onerror = () =>
      console.error("Failed to load Google Sign-In script");
    document.body.appendChild(script);
  };

  const initializeGoogleOneTap = () => {
    if (!window.google) return;
    try {
      window.google.accounts.id.initialize({
        client_id:
          "857334064448-pt36uthnh7dv3jd2vo819qlv8pgd2703.apps.googleusercontent.com",
        callback: handleGoogleOneTapResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: "popup",
      });
    } catch (error) {
      console.error("Error initializing Google Sign-In:", error);
    }
  };

  const sendWelcomeEmail = async (name, userEmail) => {
    try {
      await emailjs.send("service_f8jpcjv", "template_welcome", {
        to_name: name,
        to_email: userEmail,
        store_name: "my.LIGHTSTORE",
        shop_url: window.location.origin + "/shop",
      });
    } catch (err) {
      console.warn("Welcome email failed:", err);
    }
  };

  const handleGoogleOneTapResponse = (response) => {
    try {
      setLoading(true);
      setError("");
      const userObject = parseJwt(response.credential);
      const googleName =
        userObject.name ||
        userObject.given_name ||
        (userObject.given_name && userObject.family_name
          ? `${userObject.given_name} ${userObject.family_name}`
          : null);
      const userData = {
        name: googleName || "",
        email: userObject.email || "",
        phone: "",
      };
      const users = getRegisteredUsers();
      let existingUser = users.find(
        (u) => u.email?.toLowerCase() === userData.email.toLowerCase(),
      );
      if (!existingUser) {
        users.push({
          ...userData,
          password: `google_${Math.random().toString(36).slice(-8)}Aa1`,
          newsletter: subscribeNewsletter,
        });
        saveRegisteredUsers(users);
        setIsExistingUser(false);
        sendWelcomeEmail(userData.name, userData.email);
      } else {
        userData.name = existingUser.name || userData.name;
        setIsExistingUser(true);
      }
      localStorage.setItem("user", JSON.stringify(userData));
      window.dispatchEvent(new Event("userUpdated"));
      setStep(5);
      setTimeout(() => navigate("/"), 4000);
      setLoading(false);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setError("Google authentication failed. Please try again.");
      setLoading(false);
    }
  };

  const getRegisteredUsers = () => {
    const users = localStorage.getItem("registeredUsers");
    return users ? JSON.parse(users) : [];
  };
  const saveRegisteredUsers = (users) =>
    localStorage.setItem("registeredUsers", JSON.stringify(users));

  const validateEmailOrPhone = (input) => {
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return emailRegex.test(input) || phoneRegex.test(input);
  };

  const checkUserExists = (emailOrPhone) => {
    const users = getRegisteredUsers();
    return users.find(
      (user) =>
        user.email?.toLowerCase() === emailOrPhone.toLowerCase() ||
        user.phone === emailOrPhone,
    );
  };

  const handleContinue = () => {
    if (!validateEmailOrPhone(email))
      return setError("Please enter a valid email address or phone number");
    setError("");
    const existingUser = checkUserExists(email);
    if (existingUser) {
      setIsExistingUser(true);
      if (existingUser.name) setUserName(existingUser.name);
      setStep(3);
    } else {
      setIsExistingUser(false);
      sendOtp();
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otpCode);
    const isPhone =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(email);
    if (isPhone) {
      alert(`Demo: OTP sent to ${email}\nYour OTP is: ${otpCode}`);
      setLoading(false);
      setStep(2);
      setTimer(60);
    } else {
      try {
        await emailjs.send("service_f8jpcjv", "template_gpentyl", {
          to_name: "User",
          to_email: email,
          otp: otpCode,
        });
        setLoading(false);
        setStep(2);
        setTimer(60);
      } catch {
        setLoading(false);
        setError("Failed to send OTP. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3)
      document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleVerifyOtp = () => {
    if (otp.join("") !== generatedOtp)
      return setError("Invalid verification code. Please try again.");
    setError("");
    setStep(4);
  };

  const validatePassword = (password) => {
    if (password.length < 10)
      return "Password must be at least 10 characters long";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter (A-Z)";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter (a-z)";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number (0-9)";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      return "Password must contain at least one special character (!@#$%^&*...)";
    const common = [
      "password",
      "qwerty",
      "123456",
      "letmein",
      "welcome",
      "admin",
      "lightstore",
    ];
    if (common.some((p) => password.toLowerCase().includes(p)))
      return "Password is too common. Please choose something unique.";
    return null;
  };

  const handleCreatePassword = async () => {
    if (!userName || userName.trim().length === 0)
      return setError("Please enter your full name.");
    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    const users = getRegisteredUsers();
    const isPhone =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(email);
    const newUser = isPhone
      ? {
          name: userName.trim(),
          phone: email,
          password,
          newsletter: subscribeNewsletter,
        }
      : {
          name: userName.trim(),
          email,
          password,
          newsletter: subscribeNewsletter,
        };
    users.push(newUser);
    saveRegisteredUsers(users);
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: userName.trim(),
        email: isPhone ? "" : email,
        phone: isPhone ? email : "",
      }),
    );
    window.dispatchEvent(new Event("userUpdated"));
    if (!isPhone) sendWelcomeEmail(userName.trim(), email);
    setStep(5);
    setTimeout(() => navigate("/"), 4000);
  };

  const handlePasswordLogin = () => {
    if (!password) return setError("Please enter your password");
    const users = getRegisteredUsers();
    const user = users.find(
      (u) =>
        u.email?.toLowerCase() === email.toLowerCase() || u.phone === email,
    );
    if (user && user.password === password) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        }),
      );
      window.dispatchEvent(new Event("userUpdated"));
      setStep(5);
      setTimeout(() => navigate("/"), 4000);
    } else {
      setError(
        "Wrong password. Try again or click 'Forgot Password?' to reset it.",
      );
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(resetCode);
    const isPhone =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(email);
    if (isPhone) {
      alert(`Demo: Reset code sent to ${email}\nYour code is: ${resetCode}`);
      setLoading(false);
      setStep(6);
      setTimer(60);
      setOtp(["", "", "", ""]);
      setPassword("");
      setConfirmPassword("");
      setError("");
    } else {
      try {
        await emailjs.send("service_f8jpcjv", "template_gpentyl", {
          to_name: "User",
          to_email: email,
          otp: resetCode,
        });
        setLoading(false);
        setStep(6);
        setTimer(60);
        setOtp(["", "", "", ""]);
        setPassword("");
        setConfirmPassword("");
        setError("");
      } catch {
        setLoading(false);
        setError("Failed to send reset code. Please try again.");
      }
    }
  };

  const handleGetStarted = () => navigate("/");

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    if (!window.google) {
      setError("Google Sign-In is loading, please wait a moment.");
      return;
    }
    try {
      const tempDiv = document.createElement("div");
      tempDiv.style.display = "none";
      document.body.appendChild(tempDiv);
      window.google.accounts.id.renderButton(tempDiv, {
        theme: "filled_blue",
        size: "large",
      });
      setTimeout(() => {
        const googleButton = tempDiv.querySelector('div[role="button"]');
        if (googleButton) googleButton.click();
        setTimeout(() => {
          if (document.body.contains(tempDiv))
            document.body.removeChild(tempDiv);
        }, 1000);
      }, 100);
    } catch {
      setError("Failed to open Google Sign-In. Please try again.");
    }
  };

  const handleFacebookLogin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(
      "Facebook login is currently unavailable. Please use email or Google sign-in.",
    );
  };

  const SocialButtons = () => (
    <div className="text-center">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 border-t border-border"></div>
        <p className="text-foreground/60 text-sm">Or log in with</p>
        <div className="flex-1 border-t border-border"></div>
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={handleFacebookLogin}
          type="button"
          className="w-12 h-12 flex items-center justify-center hover:opacity-80 hover:scale-105 active:scale-95 transition"
        >
          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
            <path
              d="M48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 35.9789 8.77641 45.908 20.25 47.7084V30.9375H14.1562V24H20.25V18.7125C20.25 12.6975 23.8331 9.375 29.3152 9.375C31.9402 9.375 34.6875 9.84375 34.6875 9.84375V15.75H31.6613C28.68 15.75 27.75 17.6002 27.75 19.5V24H34.4062L33.3422 30.9375H27.75V47.7084C39.2236 45.908 48 35.9789 48 24Z"
              fill="#1877F2"
            />
            <path
              d="M33.3422 30.9375L34.4062 24H27.75V19.5C27.75 17.6002 28.68 15.75 31.6613 15.75H34.6875V9.84375C34.6875 9.84375 31.9402 9.375 29.3152 9.375C23.8331 9.375 20.25 12.6975 20.25 18.7125V24H14.1562V30.9375H20.25V47.7084C21.4719 47.9028 22.7235 48 24 48C25.2765 48 26.5281 47.9028 27.75 47.7084V30.9375H33.3422Z"
              fill="white"
            />
          </svg>
        </button>
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-12 h-12 flex items-center justify-center hover:opacity-80 hover:scale-105 active:scale-95 transition"
        >
          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
            <path
              d="M47.5324 24.5449C47.5324 22.6177 47.3698 20.9551 47.0179 19.2656H24.2998V28.9793H37.5281C37.2568 31.1033 35.8765 34.0766 33.0081 36.0942L32.9727 36.3203L39.8977 41.5976L40.417 41.6492C44.8944 37.5359 47.5324 31.6168 47.5324 24.5449Z"
              fill="#4285F4"
            />
            <path
              d="M24.2998 47.0004C30.7496 47.0004 36.2014 44.9831 40.417 41.6492L33.0081 36.0942C31.1142 37.3815 28.5668 38.2657 24.2998 38.2657C18.0044 38.2657 12.6074 34.1524 10.7947 28.651L10.5801 28.6689L3.39075 34.1443L3.31348 34.3453C7.50168 42.5916 15.2449 47.0004 24.2998 47.0004Z"
              fill="#34A853"
            />
            <path
              d="M10.7947 28.651C10.2792 27.2819 9.97794 25.7992 9.97794 24.2625C9.97794 22.7258 10.2792 21.2431 10.7676 19.874L10.754 19.6333L3.46425 13.9844L3.31348 14.0597C1.79707 17.0329 0.932617 20.438 0.932617 24.2625C0.932617 28.087 1.79707 31.4921 3.31348 34.4653L10.7947 28.651Z"
              fill="#FBBC05"
            />
            <path
              d="M24.2998 10.2593C29.5144 10.2593 33.1296 12.5736 35.1893 14.4737L41.7816 8.09073C36.174 2.75518 30.7496 0 24.2998 0C15.2449 0 7.50168 4.40878 3.31348 14.0597L10.7676 19.874C12.6074 14.3726 18.0044 10.2593 24.2998 10.2593Z"
              fill="#EB4335"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  const NewsletterCheckbox = () => (
    <label className="flex items-start gap-3 cursor-pointer group select-none">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={subscribeNewsletter}
          onChange={(e) => setSubscribeNewsletter(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${subscribeNewsletter ? "bg-green-600 border-green-600" : "border-border bg-background group-hover:border-green-500"}`}
        >
          {subscribeNewsletter && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors leading-snug">
        Yes, sign me up for{" "}
        <span className="font-semibold text-green-800">my.LIGHTSTORE</span>{" "}
        newsletter & marketing updates{" "}
        <span className="text-foreground/40">(optional)</span>
      </span>
    </label>
  );

  // ✅ Keyframe animations scoped with ls- prefix to avoid conflicts
  const successCSS = `
    @keyframes ls-rise{from{opacity:0;transform:translateY(30px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes ls-orbit1{from{transform:rotate(0deg) translateX(54px) rotate(0deg)}to{transform:rotate(360deg) translateX(54px) rotate(-360deg)}}
    @keyframes ls-orbit2{from{transform:rotate(120deg) translateX(70px) rotate(-120deg)}to{transform:rotate(480deg) translateX(70px) rotate(-480deg)}}
    @keyframes ls-orbit3{from{transform:rotate(240deg) translateX(44px) rotate(-240deg)}to{transform:rotate(600deg) translateX(44px) rotate(-600deg)}}
    @keyframes ls-draw{from{stroke-dashoffset:180}to{stroke-dashoffset:0}}
    @keyframes ls-drain{from{stroke-dashoffset:0}to{stroke-dashoffset:226}}
    @keyframes ls-tagIn{from{opacity:0;transform:scale(0.7) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
    .ls-rise{animation:ls-rise 0.5s ease both}
    .ls-rise-1{animation:ls-rise 0.5s ease both 0.3s;opacity:0}
    .ls-rise-2{animation:ls-rise 0.4s ease both 1.1s;opacity:0}
    .ls-orbit1{animation:ls-orbit1 3.2s linear infinite;width:0;height:0}
    .ls-orbit2{animation:ls-orbit2 5s linear infinite;width:0;height:0}
    .ls-orbit3{animation:ls-orbit3 2.4s linear infinite;width:0;height:0}
    .ls-draw{animation:ls-draw 0.5s ease forwards 0.4s}
    .ls-drain{animation:ls-drain 4s linear forwards 0.6s;transform-origin:80px 80px;transform:rotate(-90deg)}
    .ls-tag1{animation:ls-tagIn 0.3s ease both 0.7s;opacity:0}
    .ls-tag2{animation:ls-tagIn 0.3s ease both 0.85s;opacity:0}
    .ls-tag3{animation:ls-tagIn 0.3s ease both 1.0s;opacity:0}
  `;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 lg:py-12 lg:px-4">
      <div className="relative w-full max-w-lg">
        <div className="px-5 lg:px-8 py-12">
          {/* ────── STEP 1: Email / phone ────── */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Welcome to my.LIGHTSTORE
              </h1>
              <p className="text-center text-foreground/60 mb-8">
                Use your full name, email, or phone to sign up or log in.
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    autoComplete="name"
                    className="w-full px-4 py-3 border border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Email or Mobile Number *
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleContinue()}
                    autoComplete="email"
                    placeholder="Enter your email or phone"
                    className="w-full px-4 py-3 border border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <NewsletterCheckbox />
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                  onClick={handleContinue}
                  disabled={loading || !userName || !email}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3.5 font-semibold text-lg transition-colors disabled:opacity-60 rounded"
                >
                  {loading ? "Checking..." : "Continue"}
                </button>
                <SocialButtons />
                <p className="text-xs text-center text-foreground/60 mt-6">
                  By continuing you agree to my.LIGHTSTORE's{" "}
                  <span className="text-primary underline cursor-pointer">
                    Terms and Conditions
                  </span>{" "}
                  and{" "}
                  <span className="text-primary underline cursor-pointer">
                    Privacy Policy
                  </span>
                  .
                </p>
              </div>
            </>
          )}

          {/* ────── STEP 2: OTP ────── */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Verify your email address
              </h1>
              <p className="text-center text-foreground/60 mb-2">
                We have sent a verification code to
              </p>
              <p className="text-center text-foreground font-medium mb-8">
                {email}
              </p>
              <div className="flex gap-3 justify-center mb-6">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    autoComplete="one-time-code"
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0)
                        document.getElementById(`otp-${index - 1}`)?.focus();
                      if (e.key === "Enter" && otp.join("").length === 4)
                        handleVerifyOtp();
                    }}
                    className="w-16 h-16 text-center text-2xl font-semibold border-2 border-green-500 bg-background text-foreground rounded focus:outline-none focus:border-green-600"
                  />
                ))}
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center mb-4">{error}</p>
              )}
              <button
                onClick={handleVerifyOtp}
                disabled={otp.join("").length !== 4}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 rounded"
              >
                Submit
              </button>
              <p className="text-center text-foreground/60 text-sm">
                Didn't receive the verification code?{" "}
                {timer > 0 ? (
                  <span>
                    Request a new code in{" "}
                    <span className="text-green-600 font-semibold">
                      {timer} seconds
                    </span>
                  </span>
                ) : (
                  <button
                    onClick={sendOtp}
                    className="text-green-600 font-semibold underline hover:text-green-700"
                  >
                    request a new code
                  </button>
                )}
              </p>
            </>
          )}

          {/* ────── STEP 3: Password login ────── */}
          {step === 3 && isExistingUser && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Welcome back!
              </h1>
              <p className="text-center text-foreground/60 mb-8">
                Log back into your my.LIGHTSTORE account.
              </p>
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded flex justify-between items-center">
                  <span className="text-foreground">{email}</span>
                  <button
                    onClick={() => setStep(1)}
                    className="text-primary font-medium hover:text-primary/80"
                  >
                    Edit
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handlePasswordLogin()
                      }
                      className="w-full px-4 py-3 pr-12 border-2 border-border bg-background text-foreground rounded focus:outline-none focus:border-green-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                  onClick={handlePasswordLogin}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 font-semibold text-lg transition-colors disabled:opacity-60 rounded"
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
                <div className="text-center">
                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-primary font-medium hover:text-primary/80 disabled:opacity-60"
                  >
                    {loading
                      ? "Sending reset code..."
                      : "Forgot your password?"}
                  </button>
                </div>
                <SocialButtons />
              </div>
            </>
          )}

          {/* ────── STEP 4: Create password ────── */}
          {step === 4 && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Create your account
              </h1>
              <p className="text-center text-foreground/60 mb-8">
                Set up your password to secure your account.
              </p>
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded flex justify-between items-center">
                  <span className="text-foreground">{email}</span>
                  <button
                    onClick={() => setStep(1)}
                    className="text-primary font-medium hover:text-primary/80"
                  >
                    Edit
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    autoComplete="name"
                    className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 border-2 border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleCreatePassword()
                      }
                      className="w-full px-4 py-3 pr-12 border-2 border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-2">
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-green-600 text-xs mt-2">
                      ✓ Passwords match
                    </p>
                  )}
                </div>
                <div className="mt-3 p-3 bg-muted rounded text-xs space-y-1">
                  <p className="font-medium text-foreground mb-2">
                    Password Requirements:
                  </p>
                  {[
                    [password.length >= 10, "At least 10 characters"],
                    [/[A-Z]/.test(password), "One uppercase letter (A-Z)"],
                    [/[a-z]/.test(password), "One lowercase letter (a-z)"],
                    [/[0-9]/.test(password), "One number (0-9)"],
                    [
                      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
                      "One special character (!@#$%^&*...)",
                    ],
                  ].map(([met, label]) => (
                    <p
                      key={label}
                      className={met ? "text-green-600" : "text-foreground/60"}
                    >
                      {met ? "✓" : "•"} {label}
                    </p>
                  ))}
                </div>
                <NewsletterCheckbox />
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                  onClick={handleCreatePassword}
                  disabled={
                    !userName ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    validatePassword(password) !== null
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 font-semibold text-lg transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* ────── STEP 5: ✅ UNIQUE SUCCESS SCREEN ────── */}
          {step === 5 && (
            <div className="flex flex-col items-center text-center">
              <style>{successCSS}</style>

              {/* Orbiting solar system + checkmark */}
              <div
                className="ls-rise"
                style={{
                  position: "relative",
                  width: 160,
                  height: 160,
                  marginBottom: "2rem",
                }}
              >
                {/* SVG circle + checkmark + draining ring */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r="36"
                      fill="#EAF3DE"
                      stroke="#639922"
                      strokeWidth="1"
                    />
                    <path
                      d="M62 80 L75 93 L100 68"
                      fill="none"
                      stroke="#3B6D11"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="180"
                      strokeDashoffset="180"
                      className="ls-draw"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="36"
                      fill="none"
                      stroke="#639922"
                      strokeWidth="2.5"
                      strokeDasharray="226"
                      strokeDashoffset="0"
                      className="ls-drain"
                      opacity="0.5"
                    />
                  </svg>
                </div>
                {/* Orbit 1 — fast small dot */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="ls-orbit1">
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#C0DD97",
                        marginLeft: -5,
                        marginTop: -5,
                      }}
                    />
                  </div>
                </div>
                {/* Orbit 2 — slow large dot */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="ls-orbit2">
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#97C459",
                        marginLeft: -3.5,
                        marginTop: -3.5,
                      }}
                    />
                  </div>
                </div>
                {/* Orbit 3 — medium inner dot */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="ls-orbit3">
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#639922",
                        marginLeft: -2.5,
                        marginTop: -2.5,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="ls-rise-1 w-full">
                <p
                  className="text-green-600 mb-2"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Access granted
                </p>
                <h1 className="text-3xl font-medium text-foreground mb-2">
                  You're in, {userName ? userName.split(" ")[0] : "there"}
                </h1>
                <p className="text-foreground/60 text-base mb-7">
                  my.LIGHTSTORE is ready for you
                </p>
              </div>

              {/* Staggered pill tags */}
              <div className="flex gap-2 flex-wrap justify-center mb-7">
                <div className="ls-tag1 bg-muted border border-border rounded-full px-3.5 py-1.5 text-sm text-foreground/60 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle
                      cx="6"
                      cy="6"
                      r="5"
                      stroke="#639922"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M4 6l1.5 1.5L8 4"
                      stroke="#639922"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Verified account
                </div>
                <div className="ls-tag2 bg-muted border border-border rounded-full px-3.5 py-1.5 text-sm text-foreground/60 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect
                      x="1.5"
                      y="3"
                      width="9"
                      height="7"
                      rx="1.5"
                      stroke="#378ADD"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M4 3V2.5a2 2 0 014 0V3"
                      stroke="#378ADD"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Secure session
                </div>
                <div className="ls-tag3 bg-muted border border-border rounded-full px-3.5 py-1.5 text-sm text-foreground/60 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1l1.2 3.6H11L8.4 6.8l1 3.2L6 8.1 2.6 10l1-3.2L1 4.6h3.8L6 1z"
                      stroke="#BA7517"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                  7-day remember me
                </div>
              </div>

              {/* Countdown bar + CTA */}
              <div className="ls-rise-2 w-full border-t border-border pt-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-foreground/40">
                    Redirecting automatically
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {countdown}s
                  </span>
                </div>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3.5 font-medium text-base rounded-xl transition-colors"
                >
                  Go to my store
                </button>
                <p className="text-xs text-foreground/30 mt-3">{email}</p>
              </div>
            </div>
          )}

          {/* ────── STEP 6: Verify reset code ────── */}
          {step === 6 && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Verify reset code
              </h1>
              <p className="text-center text-foreground/60 mb-2">
                We have sent a reset code to
              </p>
              <p className="text-center text-foreground font-medium mb-8">
                {email}
              </p>
              <div className="flex gap-3 justify-center mb-6">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`reset-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index]}
                    autoComplete="one-time-code"
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0)
                        document
                          .getElementById(`reset-otp-${index - 1}`)
                          ?.focus();
                      if (e.key === "Enter" && otp.join("").length === 4) {
                        if (otp.join("") === generatedOtp) {
                          setStep(7);
                          setError("");
                        } else setError("Invalid reset code");
                      }
                    }}
                    className="w-16 h-16 text-center text-2xl font-semibold border-2 border-green-500 bg-background text-foreground rounded focus:outline-none focus:border-green-600"
                  />
                ))}
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center mb-4">{error}</p>
              )}
              <button
                onClick={() => {
                  if (otp.join("") === generatedOtp) {
                    setStep(7);
                    setError("");
                  } else setError("Invalid reset code. Please try again.");
                }}
                disabled={otp.join("").length !== 4}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 rounded"
              >
                Verify Code
              </button>
              <p className="text-center text-foreground/60 text-sm">
                {timer > 0 ? (
                  <span>
                    Resend code in{" "}
                    <span className="text-green-600 font-semibold">
                      {timer}s
                    </span>
                  </span>
                ) : (
                  <button
                    onClick={handleForgotPassword}
                    className="text-green-600 font-semibold underline"
                  >
                    Resend code
                  </button>
                )}
              </p>
            </>
          )}

          {/* ────── STEP 7: Set new password ────── */}
          {step === 7 && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Set new password
              </h1>
              <p className="text-center text-foreground/60 mb-8">
                Create a new password for your account
              </p>
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded">
                  <span className="text-foreground">{email}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 border-2 border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 border-2 border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-2">
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-green-600 text-xs mt-2">
                      ✓ Passwords match
                    </p>
                  )}
                </div>
                <div className="p-3 bg-muted rounded text-xs space-y-1">
                  <p className="font-medium text-foreground mb-2">
                    Password Requirements:
                  </p>
                  {[
                    [password.length >= 10, "At least 10 characters"],
                    [/[A-Z]/.test(password), "One uppercase letter (A-Z)"],
                    [/[a-z]/.test(password), "One lowercase letter (a-z)"],
                    [/[0-9]/.test(password), "One number (0-9)"],
                    [
                      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
                      "One special character (!@#$%^&*...)",
                    ],
                  ].map(([met, label]) => (
                    <p
                      key={label}
                      className={met ? "text-green-600" : "text-foreground/60"}
                    >
                      {met ? "✓" : "•"} {label}
                    </p>
                  ))}
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                  onClick={() => {
                    const passwordError = validatePassword(password);
                    if (passwordError) {
                      setError(passwordError);
                      return;
                    }
                    if (password !== confirmPassword) {
                      setError("Passwords do not match");
                      return;
                    }
                    const users = getRegisteredUsers();
                    const userIndex = users.findIndex(
                      (u) =>
                        u.email?.toLowerCase() === email.toLowerCase() ||
                        u.phone === email,
                    );
                    if (userIndex !== -1) {
                      users[userIndex].password = password;
                      saveRegisteredUsers(users);
                      setStep(5);
                      setTimeout(() => navigate("/"), 4000);
                    } else setError("User not found");
                  }}
                  disabled={
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
                >
                  Reset Password
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
