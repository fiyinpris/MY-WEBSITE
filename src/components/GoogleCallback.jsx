import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(base64));
}

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get the code from URL params (from OAuth redirect)
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");

    if (code) {
      // If there's a code, we're coming from OAuth redirect
      // In a real app, you'd exchange this code for a token on your backend
      // For now, we'll just redirect to home
      console.log("OAuth code received:", code);
      
      // Store that user is logged in
      localStorage.setItem("user", JSON.stringify({
        name: "Google User",
        email: "user@gmail.com"
      }));
      
      window.dispatchEvent(new Event("userUpdated"));
      navigate("/", { replace: true });
    } else {
      // No code in URL, so we're on the callback page directly
      // Initialize Google One Tap
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);

          window.google.accounts.id.initialize({
            client_id: "857334064448-pt36uthnh7dv3jd2vo819qlv8pgd2703.apps.googleusercontent.com",
            callback: (response) => {
              try {
                const userObject = parseJwt(response.credential);
                localStorage.setItem(
                  "user",
                  JSON.stringify({
                    name: userObject.name,
                    email: userObject.email,
                  })
                );
                window.dispatchEvent(new Event("userUpdated"));
                
                // Navigate back to where user came from, or home
                const returnTo = sessionStorage.getItem("returnTo") || "/";
                sessionStorage.removeItem("returnTo");
                navigate(returnTo, { replace: true });
              } catch (error) {
                console.error("Error parsing Google token:", error);
                navigate("/", { replace: true });
              }
            },
          });

          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // If prompt fails, just go back
              console.log("Google prompt failed, redirecting home");
              navigate("/", { replace: true });
            }
          });
        }
      }, 100);

      // Cleanup and timeout
      return () => {
        clearInterval(interval);
      };
    }
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium">Signing you in with Google…</p>
      </div>
    </div>
  );
};

export default GoogleCallback;