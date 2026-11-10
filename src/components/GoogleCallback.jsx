import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { Spinner } from "./ui/Spinner";

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
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="surface-card w-full max-w-sm p-8 text-center" role="status" aria-live="polite">
        {error ? (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
              <X size={26} />
            </div>
            <h2 className="mt-5 text-xl font-bold text-foreground">{error}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Redirecting to sign in…</p>
          </>
        ) : (
          <>
            <Spinner size={44} className="mx-auto text-primary" />
            <p className="mt-5 text-lg font-semibold text-foreground">Signing you in with Google…</p>
            <p className="mt-1 text-sm text-muted-foreground">This only takes a moment.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
