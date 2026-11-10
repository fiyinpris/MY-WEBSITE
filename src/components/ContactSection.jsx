import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Instagram, MessageCircle, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { PageHeader } from "./ui/PageHeader";
import { Reveal } from "./ui/Reveal";
import { Spinner } from "./ui/Spinner";
import { cn } from "../lib/utils";
import { STORE_CONTACT, sendContactMessage } from "../lib/contact";

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: STORE_CONTACT.whatsappDisplay,
    href: STORE_CONTACT.whatsappHref,
    note: "Chat with our team",
  },
  { icon: Phone, label: "Phone", value: STORE_CONTACT.phoneDisplay, href: STORE_CONTACT.phoneHref, note: "Customer support" },
  { icon: Mail, label: "Email", value: STORE_CONTACT.email, href: `mailto:${STORE_CONTACT.email}`, note: "Write to us anytime" },
  {
    icon: Instagram,
    label: "Instagram",
    value: STORE_CONTACT.instagramHandle,
    href: STORE_CONTACT.instagramHref,
    note: "See setups & new arrivals",
  },
];

const emptyForm = { fullName: "", email: "", phone: "", message: "" };

export const ContactSection = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type, text }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: "error", text: "Please fill in your name, email and message." });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setStatus({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    setLoading(true);
    try {
      await sendContactMessage({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });
      setStatus({ type: "success", text: "Message sent successfully! We'll get back to you soon." });
      setFormData(emptyForm);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus({
        type: "error",
        text: `We couldn't send your message. Please try again or email ${STORE_CONTACT.email}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <PageHeader
        crumbs={[{ label: "Contact" }]}
        title={
          <>
            Let's get in <span className="font-display font-normal italic text-primary">touch</span>
          </>
        }
        description="Not sure what you need? The team at my.LIGHTSTORE will be happy to listen and suggest the setup that best matches your needs."
      />

      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Channels */}
        <Reveal className="min-w-0 lg:col-span-5">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {channels.map(({ icon: Icon, label, value, href, note }) => (
              <li key={label} className="min-w-0">
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="surface-card group flex items-center gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-card sm:p-5"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </span>
                    <span className="block truncate font-semibold text-foreground">{value}</span>
                    <span className="block text-xs text-muted-foreground">{note}</span>
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                  />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-4 rounded-[1.25rem] border border-dashed p-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground/70">
              <MapPin size={20} />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</span>
              <span className="block font-semibold text-foreground">{STORE_CONTACT.location}</span>
              <span className="block text-xs text-muted-foreground">Delivering to all 36 states + FCT</span>
            </span>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal className="min-w-0 lg:col-span-7" delay={0.1}>
          <div className="surface-card p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl font-bold text-foreground">We'd love to hear from you</h2>
            <p className="mt-1.5 text-muted-foreground">Send us a message and we'll get back to you shortly.</p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="field-label">
                    Full name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="fullName"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="field-label">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-phone" className="field-label">
                  Phone <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="080X XXX XXXX"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="field-label">
                  Your message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Leave us a message here…"
                  required
                  rows={6}
                  className="input min-h-[160px]"
                />
              </div>

              <AnimatePresence>
                {status && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role={status.type === "error" ? "alert" : "status"}
                    className={cn(
                      "flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium",
                      status.type === "success" ? "bg-primary-soft text-primary" : "bg-danger/10 text-danger",
                    )}
                  >
                    {status.type === "success" ? (
                      <CheckCircle2 size={18} className="mt-px shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="mt-px shrink-0" />
                    )}
                    {status.text}
                  </motion.p>
                )}
              </AnimatePresence>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? (
                  <>
                    <Spinner size={18} /> Sending…
                  </>
                ) : (
                  <>
                    <Send size={17} /> Send message
                  </>
                )}
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
