import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({
        fullName: "",
        company: "",
        email: "",
        phone: "",
        message: "",
      });

      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 py-28 lg:py-20 lg:px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Side - Contact Info */}
          <div className="text-foreground space-y-8 px-7 lg:px-3 lg:pt-12">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-left text-center font-bold mb-4">
                Contact Us
              </h1>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Not sure what you need? The team at my.LIGHTSTORE will be happy
                to listen to you and suggest solutions that best match your
                needs.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a
                    href="mailto:support@mylightstore.com"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    support@mylightstore.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <a
                    href="tel:+234-813-542-4926"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Support: +234-813-542-4926
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Location</h3>
                  <p className="text-foreground/70">
                    Osogbo, Osun State,
                    <br />
                    Nigeria
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Pattern */}
            <div className="hidden lg:block">
              <svg
                className="w-64 h-64 opacity-10"
                viewBox="0 0 200 200"
                fill="none"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>



          {/* Right Side - Contact Form */}
          <div className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-border relative overflow-hidden mx-auto">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-7 pointer-events-none">
              <svg
                viewBox="0 0 100 100"
                fill="currentColor"
                className="w-full h-full"
              >
                <circle cx="80" cy="20" r="50" />
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                We'd love to hear from you!
              </h2>
              <p className="text-foreground/60 mb-6">Let's get in touch</p>

              {success && (
                <div className="mb-6 bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded-lg">
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-2">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Leave us a message here..."
                    required
                    rows={5}
                    className="w-full px-5 py-3 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 bg-background resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
