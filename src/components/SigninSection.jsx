import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

export const SigninSection = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    emailjs.init("aYMxHd4D49CBiJT-X");
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    if (window.PublicKeyCredential) {
      try {
        const available =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setBiometricAvailable(available);
      } catch (error) {
        console.log("Biometric not available:", error);
        setBiometricAvailable(false);
      }
    }
  };

  const handleBiometricAuth = async () => {
    if (!biometricAvailable) {
      setError("Biometric authentication is not available on this device");
      return;
    }

    try {
      setLoading(true);

      if (isExistingUser) {
        const biometricSuccess = await simulateBiometricAuth();

        if (biometricSuccess) {
          const users = getRegisteredUsers();
          const user = users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase()
          );

          if (user) {
            localStorage.setItem(
              "user",
              JSON.stringify({ name: user.name, email: user.email })
            );
            setStep(5);
            setTimeout(() => {
              navigate(-1);
            }, 2000);
          }
        } else {
          setError("Biometric authentication failed. Please try again.");
        }
      } else {
        setError("Please complete password setup first");
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Biometric authentication failed. Please use password instead.");
      console.error("Biometric error:", error);
    }
  };

  const simulateBiometricAuth = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const confirmed = window.confirm(
          "🔐 Touch your fingerprint sensor or use Face ID to authenticate"
        );
        resolve(confirmed);
      }, 500);
    });
  };

  const getRegisteredUsers = () => {
    const users = localStorage.getItem("registeredUsers");
    return users
      ? JSON.parse(users)
      : [
          {
            name: "John Doe",
            email: "fiyinfoluwaojaleke@gmail.com",
            password: "password123",
          },
        ];
  };

  const saveRegisteredUsers = (users) => {
    localStorage.setItem("registeredUsers", JSON.stringify(users));
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const checkUserExists = (email) => {
    const users = getRegisteredUsers();
    return users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  };

  const handleContinue = () => {
    if (!name.trim()) {
      return setError("Please enter your name");
    }
    if (!validateEmail(email)) {
      return setError("Please enter a valid email address");
    }
    setError("");
    const existingUser = checkUserExists(email);
    if (existingUser) {
      setIsExistingUser(true);
      setName(existingUser.name);
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
    try {
      await emailjs.send("service_f8jpcjv", "template_gpentyl", {
        to_name: name,
        to_email: email,
        otp: otpCode,
      });
      setLoading(false);
      setStep(2);
      setTimer(60);
      console.log("OTP sent successfully:", otpCode);
    } catch (error) {
      setLoading(false);
      setError("Failed to send OTP. Please try again.");
      console.error("EmailJS Error:", error);
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
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp !== generatedOtp) {
      return setError("Invalid verification code. Please try again.");
    }
    setError("");
    setStep(4);
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter (A-Z)";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter (a-z)";
    }
    return null;
  };

  const handleCreatePassword = () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      return setError(passwordError);
    }

    if (password !== confirmPassword) {
      return setError(
        "Passwords do not match. Please make sure both passwords are the same."
      );
    }

    const users = getRegisteredUsers();
    const newUser = { name, email, password };
    users.push(newUser);
    saveRegisteredUsers(users);
    localStorage.setItem("user", JSON.stringify({ name, email }));
    setStep(5);
  };

  const handlePasswordLogin = () => {
    if (!password) {
      return setError("Please enter your password");
    }
    const users = getRegisteredUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (user && user.password === password) {
      localStorage.setItem(
        "user",
        JSON.stringify({ name: user.name, email: user.email })
      );
      setStep(5);
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } else {
      setError(
        "Wrong password. Try again or click 'Forgot Password?' to reset it."
      );
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(resetCode);
    try {
      await emailjs.send("service_f8jpcjv", "template_gpentyl", {
        to_name: name,
        to_email: email,
        otp: resetCode,
      });
      setLoading(false);
      setStep(6);
      setTimer(60);
      setOtp(["", "", "", ""]);
      setPassword("");
      setConfirmPassword("");
      console.log("Reset code sent:", resetCode);
    } catch (error) {
      setLoading(false);
      setError("Failed to send reset code. Please try again.");
      console.error("EmailJS Error:", error);
    }
  };

  const handleGetStarted = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background lg:py-12 lg:px-4">
      <div className="relative w-full max-w-lg">
        <div className="px-5 lg:px-8 py-12">
          {/* STEP 1: EMAIL & NAME INPUT */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Welcome to my.LIGHTSTORE
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                Use your email or phone to log in or sign up.
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Email or Mobile Number *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleContinue()}
                    className="w-full px-4 py-3 border border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3.5 font-semibold text-lg transition-colors disabled:opacity-60 rounded"
                >
                  {loading ? "Checking..." : "Continue"}
                </button>
                <div className="text-center">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 border-t border-border"></div>
                    <p className="text-muted-foreground text-sm">
                      Or log in with
                    </p>
                    <div className="flex-1 border-t border-border"></div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button className="w-12 h-12 flex items-center justify-center hover:opacity-80 transition">
                      <svg
                        className="w-12 h-12"
                        viewBox="0 0 48 48"
                        fill="none"
                      >
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
                    <button className="w-12 h-12 flex items-center justify-center hover:opacity-80 transition">
                      <svg
                        className="w-12 h-12"
                        viewBox="0 0 48 48"
                        fill="none"
                      >
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
                <p className="text-xs text-center text-muted-foreground mt-6">
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
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Need help? Visit our Help Center or contact us.
                </p>
              </div>
            </>
          )}

          {/* STEP 2: OTP VERIFICATION (NEW USERS) */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Verify your email address
              </h1>
              <p className="text-center text-muted-foreground mb-2">
                Hello {name}! We have sent a verification code to
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
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        const prevInput = document.getElementById(
                          `otp-${index - 1}`
                        );
                        if (prevInput) prevInput.focus();
                      }
                      if (e.key === "Enter" && otp.join("").length === 4) {
                        handleVerifyOtp();
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
                onClick={handleVerifyOtp}
                disabled={otp.join("").length !== 4}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 rounded"
              >
                Submit
              </button>
              <p className="text-center text-muted-foreground text-sm mb-2">
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
              <p className="text-xs text-center text-muted-foreground mt-4">
                Need help? Visit our Help Center or contact us on 19586.
              </p>
            </>
          )}

          {/* STEP 3: PASSWORD LOGIN (EXISTING USERS) */}
          {step === 3 && isExistingUser && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Welcome back!
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                Log back into your my.LIGHTSTORE account.
              </p>
              <div className="flex justify-center mb-6">
                <button
                  onClick={handleBiometricAuth}
                  disabled={loading || !biometricAvailable}
                  className="w-20 h-20 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 flex items-center justify-center rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-10 h-10 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-center text-sm text-muted-foreground mb-6">
                {biometricAvailable
                  ? "Tap to use biometric authentication"
                  : "Biometric authentication not available"}
              </p>
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">OR</p>
              </div>
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
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handlePasswordLogin()
                    }
                    className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Password must be at least 8 characters long
                  </p>
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                  onClick={handlePasswordLogin}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 font-semibold text-lg transition-colors rounded disabled:opacity-60"
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
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Need help? Visit our Help Center or contact us.
                </p>
              </div>
            </>
          )}

          {/* STEP 4: CREATE PASSWORD (NEW USERS) */}
          {step === 4 && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Create your account
              </h1>
              <p className="text-center text-muted-foreground mb-8">
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
                    Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleCreatePassword()
                    }
                    className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                  />
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
                  <p
                    className={`${
                      password.length >= 8
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {password.length >= 8 ? "✓" : "•"} Password must be at least
                    8 characters long
                  </p>
                  <p
                    className={`${
                      /[A-Z]/.test(password)
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {/[A-Z]/.test(password) ? "✓" : "•"} Password must contain
                    at least one uppercase letter (A-Z)
                  </p>
                  <p
                    className={`${
                      /[a-z]/.test(password)
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {/[a-z]/.test(password) ? "✓" : "•"} Password must contain
                    at least one lowercase letter (a-z)
                  </p>
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                  onClick={handleCreatePassword}
                  disabled={
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    validatePassword(password) !== null
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 font-semibold text-lg transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Need help? Visit our Help Center or contact us on 19586.
                </p>
              </div>
            </>
          )}

          {/* STEP 5: SUCCESS SCREEN */}
          {step === 5 && (
            <>
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-3">
                    {isExistingUser
                      ? "Login Successful!"
                      : "Account Created Successfully!"}
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Welcome {isExistingUser ? "back" : "to my.LIGHTSTORE"},{" "}
                    {name}!
                  </p>
                </div>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 font-semibold text-lg transition-colors rounded-lg mt-8"
                >
                  Get Started
                </button>
              </div>
            </>
          )}

          {/* STEP 6: FORGOT PASSWORD - OTP VERIFICATION */}
          {step === 6 && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Reset your password
              </h1>
              <p className="text-center text-muted-foreground mb-2">
                We have sent a verification code to
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
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        const prevInput = document.getElementById(
                          `reset-otp-${index - 1}`
                        );
                        if (prevInput) prevInput.focus();
                      }
                      if (e.key === "Enter" && otp.join("").length === 4) {
                        const enteredOtp = otp.join("");
                        if (enteredOtp !== generatedOtp) {
                          setError(
                            "Invalid verification code. Please try again."
                          );
                        } else {
                          setError("");
                          setStep(7);
                        }
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
                  const enteredOtp = otp.join("");
                  if (enteredOtp !== generatedOtp) {
                    return setError(
                      "Invalid verification code. Please try again."
                    );
                  }
                  setError("");
                  setStep(7);
                }}
                disabled={otp.join("").length !== 4}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 rounded"
              >
                Verify
              </button>
              <p className="text-center text-muted-foreground text-sm mb-2">
                Didn't receive the code?{" "}
                {timer > 0 ? (
                  <span>
                    Request a new code in{" "}
                    <span className="text-green-600 font-semibold">
                      {timer} seconds
                    </span>
                  </span>
                ) : (
                  <button
                    onClick={handleForgotPassword}
                    className="text-green-600 font-semibold underline hover:text-green-700"
                  >
                    resend code
                  </button>
                )}
              </p>
              <button
                onClick={() => setStep(3)}
                className="text-center w-full text-primary font-medium hover:text-primary/80 mt-4"
              >
                Back to Login
              </button>
            </>
          )}

          {/* STEP 7: SET NEW PASSWORD */}
          {step === 7 && (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
                Create new password
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                Your new password must be different from previous passwords.
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded focus:outline-none focus:border-primary transition-colors"
                  />
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
                  <p
                    className={`${
                      password.length >= 8
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {password.length >= 8 ? "✓" : "•"} Password must be at least
                    8 characters long
                  </p>
                  <p
                    className={`${
                      /[A-Z]/.test(password)
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {/[A-Z]/.test(password) ? "✓" : "•"} Password must contain
                    at least one uppercase letter (A-Z)
                  </p>
                  <p
                    className={`${
                      /[a-z]/.test(password)
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {/[a-z]/.test(password) ? "✓" : "•"} Password must contain
                    at least one lowercase letter (a-z)
                  </p>
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                  onClick={() => {
                    const passwordError = validatePassword(password);
                    if (passwordError) {
                      return setError(passwordError);
                    }

                    if (password !== confirmPassword) {
                      return setError(
                        "Passwords do not match. Please make sure both passwords are the same."
                      );
                    }

                    const users = getRegisteredUsers();
                    const userIndex = users.findIndex(
                      (u) => u.email.toLowerCase() === email.toLowerCase()
                    );
                    if (userIndex !== -1) {
                      users[userIndex].password = password;
                      saveRegisteredUsers(users);
                      localStorage.setItem(
                        "user",
                        JSON.stringify({ name, email })
                      );
                      setStep(5);
                      setTimeout(() => {
                        navigate(-1);
                      }, 2000);
                    }
                  }}
                  disabled={
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    validatePassword(password) !== null
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 font-semibold text-lg transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="text-center w-full text-primary font-medium hover:text-primary/80"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
