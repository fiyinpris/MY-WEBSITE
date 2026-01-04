import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(base64));
}

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval);

        window.google.accounts.id.initialize({
          client_id: "YOUR_CLIENT_ID", // replace with your Google Client ID
          callback: (response) => {
            const userObject = parseJwt(response.credential);
            localStorage.setItem(
              "user",
              JSON.stringify({
                name: userObject.name,
                email: userObject.email,
              })
            );
            window.dispatchEvent(new Event("userUpdated"));
            navigate("/", { replace: true });
          },
        });

        window.google.accounts.id.prompt();
      }
    }, 100); // check every 100ms
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-medium">Signing you in with Google…</p>
    </div>
  );
};

export default GoogleCallback;
