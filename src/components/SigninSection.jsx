import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { Eye, EyeOff, ArrowLeft, Check, Lock, ShieldCheck, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./ui/Logo";
import { Spinner } from "./ui/Spinner";
import { cn } from "../lib/utils";
import sideImage from "../Images/image 15.jpg";

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(base64));
}

const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
const SPECIAL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

/* ---------- Small presentational helpers ---------- */
const StepHeader = ({ title, subtitle, children }) => (
  <div className="mb-8">
    <h1 className="text-[1.75rem] sm:text-3xl font-bold text-foreground">{title}</h1>
    {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    {children}
  </div>
);

const ErrorText = ({ children }) =>
  children ? (
    <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
      {children}
    </p>
  ) : null;

const PasswordInput = ({ id, value, onChange, show, onToggle, placeholder, autoComplete, onKeyDown }) => (
  <div className="relative">
    <input
      id={id}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      autoComplete={autoComplete}
      className="input !pr-12"
    />
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      className="icon-btn absolute right-1 top-1/2 -translate-y-1/2 !size-10"
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
);

const IdentityPill = ({ value, onEdit }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3">
    <span className="truncate text-sm font-medium text-foreground">{value}</span>
    {onEdit && (
      <button onClick={onEdit} className="text-sm font-semibold text-primary hover:underline">
        Edit
      </button>
    )}
  </div>
);

const PasswordChecklist = ({ password }) => (
  <ul className="grid gap-1.5 rounded-2xl bg-muted/70 p-4 text-xs sm:grid-cols-2">
    {[
      [password.length >= 10, "At least 10 characters"],
      [/[A-Z]/.test(password), "One uppercase letter (A-Z)"],
      [/[a-z]/.test(password), "One lowercase letter (a-z)"],
      [/[0-9]/.test(password), "One number (0-9)"],
      [SPECIAL_REGEX.test(password), "One special character (!@#$…)"],
    ].map(([met, label]) => (
      <li key={label} className={cn("flex items-center gap-2 transition-colors", met ? "text-primary" : "text-muted-foreground")}>
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
            met ? "border-primary bg-primary text-primary-foreground" : "border-foreground/20",
          )}
        >
          {met && <Check size={10} strokeWidth={3.5} />}
        </span>
        {label}
      </li>
    ))}
  </ul>
);

const OtpInputs = ({ idPrefix, otp, onChange, onKeyDown }) => (
  <div className="flex justify-center gap-3 sm:gap-4">
    {[0, 1, 2, 3].map((index) => (
      <input
        key={index}
        id={`${idPrefix}-${index}`}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={otp[index]}
        onChange={(e) => onChange(index, e.target.value)}
        onKeyDown={(e) => onKeyDown(e, index)}
        autoComplete="one-time-code"
        aria-label={`Digit ${index + 1}`}
        className="size-14 sm:size-16 rounded-2xl border bg-card text-center text-2xl font-bold text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
      />
    ))}
  </div>
);

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
  const redirectTimer = useRef(null);

  // After signing in, return shoppers to where they came from (cart, wishlist…)
  const goAfterAuth = () => {
    clearTimeout(redirectTimer.current);
    const returnTo = sessionStorage.getItem("returnTo");
    sessionStorage.removeItem("returnTo");
    navigate(returnTo && returnTo !== "/signin" ? returnTo : "/");
  };
  const scheduleRedirect = () => {
    clearTimeout(redirectTimer.current);
    redirectTimer.current = setTimeout(goAfterAuth, 4000);
  };
  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  useEffect(() => {
    emailjs.init("aYMxHd4D49CBiJT-X");
    loadGoogleOneTap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step === 5) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setCountdown(4);
      const iv = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
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
    script.onerror = () => console.error("Failed to load Google Sign-In script");
    document.body.appendChild(script);
  };

  const initializeGoogleOneTap = () => {
    if (!window.google) return;
    try {
      window.google.accounts.id.initialize({
        client_id: "857334064448-pt36uthnh7dv3jd2vo819qlv8pgd2703.apps.googleusercontent.com",
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
      const userData = { name: googleName || "", email: userObject.email || "", phone: "" };
      const users = getRegisteredUsers();
      let existingUser = users.find((u) => u.email?.toLowerCase() === userData.email.toLowerCase());
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
      setUserName(userData.name);
      localStorage.setItem("user", JSON.stringify(userData));
      window.dispatchEvent(new Event("userUpdated"));
      setStep(5);
      scheduleRedirect();
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
  const saveRegisteredUsers = (users) => localStorage.setItem("registeredUsers", JSON.stringify(users));

  const validateEmailOrPhone = (input) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(input) || PHONE_REGEX.test(input);
  };

  const checkUserExists = (emailOrPhone) => {
    const users = getRegisteredUsers();
    return users.find(
      (user) => user.email?.toLowerCase() === emailOrPhone.toLowerCase() || user.phone === emailOrPhone,
    );
  };

  const handleContinue = () => {
    if (!validateEmailOrPhone(email)) return setError("Please enter a valid email address or phone number");
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
    const isPhone = PHONE_REGEX.test(email);
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

  const handleOtpChange = (index, value, prefix = "otp") => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) document.getElementById(`${prefix}-${index + 1}`)?.focus();
  };

  const handleVerifyOtp = () => {
    if (otp.join("") !== generatedOtp) return setError("Invalid verification code. Please try again.");
    setError("");
    setStep(4);
  };

  const validatePassword = (password) => {
    if (password.length < 10) return "Password must be at least 10 characters long";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter (A-Z)";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter (a-z)";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number (0-9)";
    if (!SPECIAL_REGEX.test(password)) return "Password must contain at least one special character (!@#$%^&*...)";
    const common = ["password", "qwerty", "123456", "letmein", "welcome", "admin", "lightstore"];
    if (common.some((p) => password.toLowerCase().includes(p)))
      return "Password is too common. Please choose something unique.";
    return null;
  };

  const handleCreatePassword = async () => {
    if (!userName || userName.trim().length === 0) return setError("Please enter your full name.");
    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);
    if (password !== confirmPassword) return setError("Passwords do not match.");
    const users = getRegisteredUsers();
    const isPhone = PHONE_REGEX.test(email);
    const newUser = isPhone
      ? { name: userName.trim(), phone: email, password, newsletter: subscribeNewsletter }
      : { name: userName.trim(), email, password, newsletter: subscribeNewsletter };
    users.push(newUser);
    saveRegisteredUsers(users);
    localStorage.setItem(
      "user",
      JSON.stringify({ name: userName.trim(), email: isPhone ? "" : email, phone: isPhone ? email : "" }),
    );
    window.dispatchEvent(new Event("userUpdated"));
    if (!isPhone) sendWelcomeEmail(userName.trim(), email);
    setStep(5);
    scheduleRedirect();
  };

  const handlePasswordLogin = () => {
    if (!password) return setError("Please enter your password");
    const users = getRegisteredUsers();
    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase() || u.phone === email);
    if (user && user.password === password) {
      localStorage.setItem(
        "user",
        JSON.stringify({ name: user.name || "", email: user.email || "", phone: user.phone || "" }),
      );
      window.dispatchEvent(new Event("userUpdated"));
      setStep(5);
      scheduleRedirect();
    } else {
      setError("Wrong password. Try again or click 'Forgot Password?' to reset it.");
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(resetCode);
    const isPhone = PHONE_REGEX.test(email);
    const reset = () => {
      setLoading(false);
      setStep(6);
      setTimer(60);
      setOtp(["", "", "", ""]);
      setPassword("");
      setConfirmPassword("");
      setError("");
    };
    if (isPhone) {
      alert(`Demo: Reset code sent to ${email}\nYour code is: ${resetCode}`);
      reset();
    } else {
      try {
        await emailjs.send("service_f8jpcjv", "template_gpentyl", {
          to_name: "User",
          to_email: email,
          otp: resetCode,
        });
        reset();
      } catch {
        setLoading(false);
        setError("Failed to send reset code. Please try again.");
      }
    }
  };

  const verifyResetCode = () => {
    if (otp.join("") === generatedOtp) {
      setStep(7);
      setError("");
    } else setError("Invalid reset code. Please try again.");
  };

  const handleResetPassword = () => {
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
      (u) => u.email?.toLowerCase() === email.toLowerCase() || u.phone === email,
    );
    if (userIndex !== -1) {
      users[userIndex].password = password;
      saveRegisteredUsers(users);
      setStep(5);
      scheduleRedirect();
    } else setError("User not found");
  };

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
      window.google.accounts.id.renderButton(tempDiv, { theme: "filled_blue", size: "large" });
      setTimeout(() => {
        const googleButton = tempDiv.querySelector('div[role="button"]');
        if (googleButton) googleButton.click();
        setTimeout(() => {
          if (document.body.contains(tempDiv)) document.body.removeChild(tempDiv);
        }, 1000);
      }, 100);
    } catch {
      setError("Failed to open Google Sign-In. Please try again.");
    }
  };

  const handleFacebookLogin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("Facebook login is currently unavailable. Please use email or Google sign-in.");
  };

  const otpKeyDown = (prefix, onEnter) => (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) document.getElementById(`${prefix}-${index - 1}`)?.focus();
    if (e.key === "Enter" && otp.join("").length === 4) onEnter();
  };

  const SocialButtons = () => (
    <div>
      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Or continue with</p>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleGoogleLogin} type="button" className="btn btn-outline btn-lg">
          <svg className="size-5" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M47.5324 24.5449C47.5324 22.6177 47.3698 20.9551 47.0179 19.2656H24.2998V28.9793H37.5281C37.2568 31.1033 35.8765 34.0766 33.0081 36.0942L32.9727 36.3203L39.8977 41.5976L40.417 41.6492C44.8944 37.5359 47.5324 31.6168 47.5324 24.5449Z" fill="#4285F4" />
            <path d="M24.2998 47.0004C30.7496 47.0004 36.2014 44.9831 40.417 41.6492L33.0081 36.0942C31.1142 37.3815 28.5668 38.2657 24.2998 38.2657C18.0044 38.2657 12.6074 34.1524 10.7947 28.651L10.5801 28.6689L3.39075 34.1443L3.31348 34.3453C7.50168 42.5916 15.2449 47.0004 24.2998 47.0004Z" fill="#34A853" />
            <path d="M10.7947 28.651C10.2792 27.2819 9.97794 25.7992 9.97794 24.2625C9.97794 22.7258 10.2792 21.2431 10.7676 19.874L10.754 19.6333L3.46425 13.9844L3.31348 14.0597C1.79707 17.0329 0.932617 20.438 0.932617 24.2625C0.932617 28.087 1.79707 31.4921 3.31348 34.4653L10.7947 28.651Z" fill="#FBBC05" />
            <path d="M24.2998 10.2593C29.5144 10.2593 33.1296 12.5736 35.1893 14.4737L41.7816 8.09073C36.174 2.75518 30.7496 0 24.2998 0C15.2449 0 7.50168 4.40878 3.31348 14.0597L10.7676 19.874C12.6074 14.3726 18.0044 10.2593 24.2998 10.2593Z" fill="#EB4335" />
          </svg>
          Google
        </button>
        <button onClick={handleFacebookLogin} type="button" className="btn btn-outline btn-lg">
          <svg className="size-5" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 35.9789 8.77641 45.908 20.25 47.7084V30.9375H14.1562V24H20.25V18.7125C20.25 12.6975 23.8331 9.375 29.3152 9.375C31.9402 9.375 34.6875 9.84375 34.6875 9.84375V15.75H31.6613C28.68 15.75 27.75 17.6002 27.75 19.5V24H34.4062L33.3422 30.9375H27.75V47.7084C39.2236 45.908 48 35.9789 48 24Z" fill="#1877F2" />
            <path d="M33.3422 30.9375L34.4062 24H27.75V19.5C27.75 17.6002 28.68 15.75 31.6613 15.75H34.6875V9.84375C34.6875 9.84375 31.9402 9.375 29.3152 9.375C23.8331 9.375 20.25 12.6975 20.25 18.7125V24H14.1562V30.9375H20.25V47.7084C21.4719 47.9028 22.7235 48 24 48C25.2765 48 26.5281 47.9028 27.75 47.7084V30.9375H33.3422Z" fill="white" />
          </svg>
          Facebook
        </button>
      </div>
    </div>
  );

  const NewsletterCheckbox = () => (
    <label className="group flex cursor-pointer select-none items-start gap-3">
      <input
        type="checkbox"
        checked={subscribeNewsletter}
        onChange={(e) => setSubscribeNewsletter(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
          subscribeNewsletter ? "border-primary bg-primary" : "border-foreground/25 bg-card group-hover:border-primary/60",
        )}
      >
        {subscribeNewsletter && <Check size={12} strokeWidth={3.5} className="text-primary-foreground" />}
      </span>
      <span className="text-sm leading-snug text-muted-foreground">
        Yes, sign me up for the <span className="font-semibold text-foreground">my.LIGHTSTORE</span> newsletter &amp;
        marketing updates <span className="opacity-70">(optional)</span>
      </span>
    </label>
  );

  // ✅ Keyframe animations scoped with ls- prefix to avoid conflicts
  const successCSS = `
    @keyframes ls-orbit1{from{transform:rotate(0deg) translateX(54px) rotate(0deg)}to{transform:rotate(360deg) translateX(54px) rotate(-360deg)}}
    @keyframes ls-orbit2{from{transform:rotate(120deg) translateX(70px) rotate(-120deg)}to{transform:rotate(480deg) translateX(70px) rotate(-480deg)}}
    @keyframes ls-orbit3{from{transform:rotate(240deg) translateX(44px) rotate(-240deg)}to{transform:rotate(600deg) translateX(44px) rotate(-600deg)}}
    @keyframes ls-draw{from{stroke-dashoffset:180}to{stroke-dashoffset:0}}
    @keyframes ls-drain{from{stroke-dashoffset:0}to{stroke-dashoffset:226}}
    .ls-orbit1{animation:ls-orbit1 3.2s linear infinite;width:0;height:0}
    .ls-orbit2{animation:ls-orbit2 5s linear infinite;width:0;height:0}
    .ls-orbit3{animation:ls-orbit3 2.4s linear infinite;width:0;height:0}
    .ls-draw{animation:ls-draw 0.5s ease forwards 0.4s}
    .ls-drain{animation:ls-drain 4s linear forwards 0.6s;transform-origin:80px 80px;transform:rotate(-90deg)}
  `;

  const stepVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const canGoBack = step === 2 || step === 3 || step === 4 || step === 6 || step === 7;

  return (
    <div className="grid min-h-[calc(100dvh-var(--nav-height))] lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="grain relative hidden overflow-hidden bg-ink lg:block">
        <motion.img
          src={sideImage}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-80"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/10" />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Logo tone="light" />
          <motion.div
            className="max-w-md text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            <div className="flex gap-1 text-accent">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.6 + i * 0.08 }}
                >
                  <Star size={18} className="fill-accent" />
                </motion.span>
              ))}
            </div>
            <p className="mt-5 text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              Great content starts with <span className="font-display font-normal italic">great light.</span>
            </p>
            <p className="mt-4 text-white/70">
              Save your favourites, check out faster and track your orders — all in one account.
            </p>
            <div className="mt-8 flex items-center gap-6 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} /> Secure sign-in
              </span>
              <span className="flex items-center gap-2">
                <Lock size={16} /> Private &amp; encrypted
              </span>
            </div>
          </motion.div>
        </div>
      </aside>

      {/* Form panel */}
      <div className="relative flex items-start justify-center overflow-hidden px-5 py-10 sm:px-8 sm:py-16 lg:items-center">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 size-72 rounded-full bg-primary/12 blur-3xl animate-float-slow" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-0 size-64 rounded-full bg-accent/12 blur-3xl animate-float" />
        <div className="relative w-full max-w-md">
          {canGoBack && (
            <button
              onClick={() => {
                setError("");
                setStep(step === 7 || step === 6 ? 3 : 1);
              }}
              className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step} variants={stepVariants} initial="initial" animate="animate" exit="exit">
              {/* ────── STEP 1: Email / phone ────── */}
              {step === 1 && (
                <>
                  <StepHeader
                    title="Welcome to my.LIGHTSTORE"
                    subtitle="Use your full name, email, or phone to sign up or log in."
                  />
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleContinue();
                    }}
                  >
                    <div>
                      <label htmlFor="signin-name" className="field-label">
                        Full name
                      </label>
                      <input
                        id="signin-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        autoComplete="name"
                        className="input"
                      />
                    </div>
                    <div>
                      <label htmlFor="signin-email" className="field-label">
                        Email or mobile number
                      </label>
                      <input
                        id="signin-email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        placeholder="you@example.com or 080…"
                        className="input"
                      />
                    </div>
                    <NewsletterCheckbox />
                    <ErrorText>{error}</ErrorText>
                    <button
                      type="submit"
                      disabled={loading || !userName || !email}
                      className="btn btn-primary btn-lg w-full"
                    >
                      {loading ? (
                        <>
                          <Spinner size={18} /> Checking…
                        </>
                      ) : (
                        "Continue"
                      )}
                    </button>
                  </form>
                  <SocialButtons />
                  <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
                    By continuing you agree to my.LIGHTSTORE's{" "}
                    <span className="cursor-pointer font-medium text-foreground underline underline-offset-2">
                      Terms and Conditions
                    </span>{" "}
                    and{" "}
                    <span className="cursor-pointer font-medium text-foreground underline underline-offset-2">
                      Privacy Policy
                    </span>
                    .
                  </p>
                </>
              )}

              {/* ────── STEP 2: OTP ────── */}
              {step === 2 && (
                <>
                  <StepHeader title="Verify your email" subtitle="We've sent a 4-digit verification code to">
                    <p className="mt-1 font-semibold text-foreground">{email}</p>
                  </StepHeader>
                  <OtpInputs
                    idPrefix="otp"
                    otp={otp}
                    onChange={(i, v) => handleOtpChange(i, v, "otp")}
                    onKeyDown={otpKeyDown("otp", handleVerifyOtp)}
                  />
                  <div className="mt-6 space-y-4">
                    <ErrorText>{error}</ErrorText>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={otp.join("").length !== 4}
                      className="btn btn-primary btn-lg w-full"
                    >
                      Verify code
                    </button>
                    <p className="text-center text-sm text-muted-foreground">
                      Didn't receive the code?{" "}
                      {timer > 0 ? (
                        <span>
                          Request a new one in <span className="font-semibold text-foreground tabular-nums">{timer}s</span>
                        </span>
                      ) : (
                        <button onClick={sendOtp} className="font-semibold text-primary hover:underline">
                          Request a new code
                        </button>
                      )}
                    </p>
                  </div>
                </>
              )}

              {/* ────── STEP 3: Password login ────── */}
              {step === 3 && isExistingUser && (
                <>
                  <StepHeader title="Welcome back!" subtitle="Log back into your my.LIGHTSTORE account." />
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePasswordLogin();
                    }}
                  >
                    <IdentityPill value={email} onEdit={() => setStep(1)} />
                    <div>
                      <div className="flex items-baseline justify-between">
                        <label htmlFor="login-password" className="field-label">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={loading}
                          className="text-xs font-semibold text-primary hover:underline disabled:opacity-60"
                        >
                          {loading ? "Sending reset code…" : "Forgot password?"}
                        </button>
                      </div>
                      <PasswordInput
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        show={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                        placeholder="Enter password"
                        autoComplete="current-password"
                      />
                    </div>
                    <ErrorText>{error}</ErrorText>
                    <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                      Log in
                    </button>
                  </form>
                  <SocialButtons />
                </>
              )}

              {/* ────── STEP 4: Create password ────── */}
              {step === 4 && (
                <>
                  <StepHeader title="Create your account" subtitle="Set up a password to secure your account." />
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCreatePassword();
                    }}
                  >
                    <IdentityPill value={email} onEdit={() => setStep(1)} />
                    <div>
                      <label htmlFor="create-name" className="field-label">
                        Full name
                      </label>
                      <input
                        id="create-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        autoComplete="name"
                        className="input"
                      />
                    </div>
                    <div>
                      <label htmlFor="create-password" className="field-label">
                        Password
                      </label>
                      <PasswordInput
                        id="create-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        show={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                        placeholder="Create a password"
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <label htmlFor="create-confirm" className="field-label">
                        Confirm password
                      </label>
                      <PasswordInput
                        id="create-confirm"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        show={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                      />
                      {confirmPassword && (
                        <p
                          className={cn(
                            "mt-2 text-xs font-medium",
                            password === confirmPassword ? "text-primary" : "text-danger",
                          )}
                        >
                          {password === confirmPassword ? "✓ Passwords match" : "Passwords do not match"}
                        </p>
                      )}
                    </div>
                    <PasswordChecklist password={password} />
                    <NewsletterCheckbox />
                    <ErrorText>{error}</ErrorText>
                    <button
                      type="submit"
                      disabled={
                        !userName ||
                        !password ||
                        !confirmPassword ||
                        password !== confirmPassword ||
                        validatePassword(password) !== null
                      }
                      className="btn btn-primary btn-lg w-full"
                    >
                      Create account
                    </button>
                  </form>
                </>
              )}

              {/* ────── STEP 5: Success ────── */}
              {step === 5 && (
                <div className="flex flex-col items-center text-center">
                  <style>{successCSS}</style>
                  <div className="relative mb-6 size-40" aria-hidden="true">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="160" height="160" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="36" style={{ fill: "hsl(var(--primary-soft))", stroke: "hsl(var(--primary) / 0.5)" }} strokeWidth="1" />
                        <path
                          d="M62 80 L75 93 L100 68"
                          fill="none"
                          style={{ stroke: "hsl(var(--primary))" }}
                          strokeWidth="3.5"
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
                          style={{ stroke: "hsl(var(--primary))" }}
                          strokeWidth="2.5"
                          strokeDasharray="226"
                          strokeDashoffset="0"
                          className="ls-drain"
                          opacity="0.5"
                        />
                      </svg>
                    </div>
                    {[
                      ["ls-orbit1", 10, "hsl(var(--accent))"],
                      ["ls-orbit2", 7, "hsl(var(--primary) / 0.6)"],
                      ["ls-orbit3", 5, "hsl(var(--primary))"],
                    ].map(([cls, size, color]) => (
                      <div key={cls} className="absolute inset-0 flex items-center justify-center">
                        <div className={cls}>
                          <div
                            style={{
                              width: size,
                              height: size,
                              borderRadius: "50%",
                              background: color,
                              marginLeft: -size / 2,
                              marginTop: -size / 2,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="eyebrow">Access granted</p>
                  <h1 className="mt-3 text-3xl font-bold text-foreground">
                    You're in, {userName ? userName.split(" ")[0] : "there"}
                  </h1>
                  <p className="mt-2 text-muted-foreground">my.LIGHTSTORE is ready for you.</p>

                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {["Verified account", "Secure session", "7-day remember me"].map((t) => (
                      <span key={t} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        <Check size={12} className="text-primary" strokeWidth={3} /> {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 w-full border-t pt-6">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Redirecting automatically</span>
                      <span className="font-semibold tabular-nums text-primary">{countdown}s</span>
                    </div>
                    <button onClick={goAfterAuth} className="btn btn-primary btn-lg w-full">
                      Continue shopping
                    </button>
                    <p className="mt-3 text-xs text-muted-foreground">{email}</p>
                  </div>
                </div>
              )}

              {/* ────── STEP 6: Verify reset code ────── */}
              {step === 6 && (
                <>
                  <StepHeader title="Verify reset code" subtitle="We've sent a reset code to">
                    <p className="mt-1 font-semibold text-foreground">{email}</p>
                  </StepHeader>
                  <OtpInputs
                    idPrefix="reset-otp"
                    otp={otp}
                    onChange={(i, v) => handleOtpChange(i, v, "reset-otp")}
                    onKeyDown={otpKeyDown("reset-otp", verifyResetCode)}
                  />
                  <div className="mt-6 space-y-4">
                    <ErrorText>{error}</ErrorText>
                    <button
                      onClick={verifyResetCode}
                      disabled={otp.join("").length !== 4}
                      className="btn btn-primary btn-lg w-full"
                    >
                      Verify code
                    </button>
                    <p className="text-center text-sm text-muted-foreground">
                      {timer > 0 ? (
                        <span>
                          Resend code in <span className="font-semibold text-foreground tabular-nums">{timer}s</span>
                        </span>
                      ) : (
                        <button onClick={handleForgotPassword} className="font-semibold text-primary hover:underline">
                          Resend code
                        </button>
                      )}
                    </p>
                  </div>
                </>
              )}

              {/* ────── STEP 7: Set new password ────── */}
              {step === 7 && (
                <>
                  <StepHeader title="Set a new password" subtitle="Create a new password for your account." />
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleResetPassword();
                    }}
                  >
                    <IdentityPill value={email} />
                    <div>
                      <label htmlFor="reset-password" className="field-label">
                        New password
                      </label>
                      <PasswordInput
                        id="reset-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        show={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <label htmlFor="reset-confirm" className="field-label">
                        Confirm password
                      </label>
                      <PasswordInput
                        id="reset-confirm"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        show={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                      />
                      {confirmPassword && (
                        <p
                          className={cn(
                            "mt-2 text-xs font-medium",
                            password === confirmPassword ? "text-primary" : "text-danger",
                          )}
                        >
                          {password === confirmPassword ? "✓ Passwords match" : "Passwords do not match"}
                        </p>
                      )}
                    </div>
                    <PasswordChecklist password={password} />
                    <ErrorText>{error}</ErrorText>
                    <button
                      type="submit"
                      disabled={!password || !confirmPassword || password !== confirmPassword}
                      className="btn btn-primary btn-lg w-full"
                    >
                      Reset password
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
