import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Helper to parse Google JWT credential
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(base64));
}

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize Google One Tap
    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval);

        window.google.accounts.id.initialize({
          client_id:
            "857334064448-pt36uthnh7dv3jd2vo819qlv8pgd2703.apps.googleusercontent.com",
          callback: (response) => {
            try {
              // Parse JWT to get REAL user data
              const userObject = parseJwt(response.credential);
              console.log("✅ Google One Tap - REAL user data:", userObject);

              // Prepare REAL user data
              const userData = {
                name: userObject.name || userObject.given_name || "Google User",
                email: userObject.email || "",
                phone: "",
              };

              console.log("✅ Saving One Tap user data:", userData);

              // Check if user already exists in registered users
              const registeredUsers = JSON.parse(
                localStorage.getItem("registeredUsers") || "[]",
              );

              const existingUserIndex = registeredUsers.findIndex(
                (u) => u.email?.toLowerCase() === userData.email.toLowerCase(),
              );

              if (existingUserIndex === -1) {
                // New user
                console.log("New One Tap user - adding to registeredUsers");
                registeredUsers.push({
                  name: userData.name,
                  email: userData.email,
                  password: `google_${Date.now()}`,
                });
                localStorage.setItem(
                  "registeredUsers",
                  JSON.stringify(registeredUsers),
                );
              } else {
                // Existing user - update name if generic
                if (
                  registeredUsers[existingUserIndex].name === "User" ||
                  registeredUsers[existingUserIndex].name === "Google User"
                ) {
                  registeredUsers[existingUserIndex].name = userData.name;
                  localStorage.setItem(
                    "registeredUsers",
                    JSON.stringify(registeredUsers),
                  );
                }
              }

              // Set current user with REAL data
              localStorage.setItem("user", JSON.stringify(userData));

              // Trigger navbar update
              window.dispatchEvent(new Event("userUpdated"));

              console.log("✅ One Tap login successful");
              console.log("✅ Name:", userData.name);
              console.log("✅ Email:", userData.email);

              // Scroll to top and redirect to previous page or home
              window.scrollTo({ top: 0, behavior: "smooth" });

              const returnTo = sessionStorage.getItem("returnTo") || "/";
              sessionStorage.removeItem("returnTo");
              navigate(returnTo, { replace: true });
            } catch (error) {
              console.error("❌ Error parsing Google One Tap token:", error);
              setError("Authentication failed. Please try again.");
              setTimeout(() => navigate("/signin"), 2000);
            }
          },
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log("Google One Tap prompt failed, redirecting to signin");
            navigate("/signin", { replace: true });
          }
        });
      }
    }, 100);

    // Cleanup interval after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!error) {
        navigate("/signin", { replace: true });
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">{error}</h2>
            <p className="text-foreground/60">Redirecting to sign in...</p>
          </>
        ) : (
          <>
            <div className="relative w-16 h-16 mx-auto">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-6 bg-green-600 rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    transformOrigin: "1px -24px",
                    transform: `rotate(${i * 30}deg)`,
                    opacity: 1 - i * 0.08,
                    animation: `spin-fade 1.2s linear infinite`,
                    animationDelay: `${-1.2 + i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <p className="text-lg font-medium text-foreground">
              Signing you in with Google…
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin-fade {
          0% { opacity: 1; }
          100% { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

export default GoogleCallback;
