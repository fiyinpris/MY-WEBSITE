import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin, Phone, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Logo } from "./ui/Logo";
import { Spinner } from "./ui/Spinner";
import { Reveal } from "./ui/Reveal";
import { STORE_CONTACT, sendContactMessage } from "../lib/contact";
import { categoryNavLabel } from "../lib/format";

const shopLinks = ["RINGLIGHT", "LED LIGHT", "TRIPOD STAND", "MICROPHONE", "ACCESSORIES"];

const FooterHeading = ({ children }) => (
  <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ink-foreground/50">{children}</h3>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="group inline-flex items-center gap-2 text-[0.9375rem] text-ink-foreground/75 transition-colors hover:text-ink-foreground"
    >
      <span className="h-px w-0 bg-accent transition-all duration-300 group-hover:w-3" />
      {children}
    </Link>
  </li>
);

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | invalid | error

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      await sendContactMessage({
        name: "Newsletter subscriber",
        email,
        message: `Newsletter sign-up request from ${email}. Please add this address to the my.LIGHTSTORE newsletter.`,
      });
      setStatus("done");
      setEmail("");
    } catch (err) {
      console.error("Newsletter subscribe failed:", err);
      setStatus("error");
    }
  };

  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-ink-foreground">
      {/* glowing brand line + soft light */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] animate-pulse-subtle"
      />

      <div className="container-page relative">
        {/* Newsletter band */}
        <Reveal className="flex flex-col gap-8 border-b border-white/10 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Stay in the <span className="font-display font-normal italic text-accent">light</span>.
            </h2>
            <p className="mt-3 leading-relaxed text-ink-foreground/65">
              Receive updates on our latest products, new releases and special discount offers.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:max-w-md" noValidate>
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1.5 pl-5 transition-colors focus-within:border-white/40">
              <Mail size={18} className="shrink-0 text-ink-foreground/50" />
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "sending") setStatus("idle");
                }}
                placeholder="Your email address"
                autoComplete="email"
                className="h-10 min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-ink-foreground/45 focus:outline-none"
              />
              <button type="submit" disabled={status === "sending"} className="btn btn-primary btn-sm h-10">
                {status === "sending" ? <Spinner size={16} /> : status === "done" ? <Check size={16} /> : null}
                {status === "done" ? "Subscribed" : "Subscribe"}
              </button>
            </div>
            <p className="mt-3 min-h-5 pl-5 text-sm" aria-live="polite">
              {status === "done" && <span className="text-[hsl(148_55%_65%)]">Thanks! You're on the list.</span>}
              {status === "invalid" && <span className="text-[hsl(0_80%_72%)]">Please enter a valid email address.</span>}
              {status === "error" && <span className="text-[hsl(0_80%_72%)]">Something went wrong. Please try again.</span>}
            </p>
          </form>
        </Reveal>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-14 md:grid-cols-12">
          <Reveal className="col-span-2 md:col-span-4">
            <Logo tone="light" />
            <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-ink-foreground/65">
              Professional lighting and creator gear — ringlights, LED panels, tripods and microphones — delivered
              across Nigeria.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href={STORE_CONTACT.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 text-ink-foreground/80 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white"
              >
                <Instagram size={18} />
              </a>
              <a
                href={STORE_CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 text-ink-foreground/80 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-[#25d366] hover:text-white"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.06}>
            <FooterHeading>Categories</FooterHeading>
            <ul className="space-y-3">
              {shopLinks.map((c) => (
                <FooterLink key={c} to={`/shop?category=${encodeURIComponent(c)}`}>
                  {categoryNavLabel(c)}
                </FooterLink>
              ))}
            </ul>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.12}>
            <FooterHeading>Customer care</FooterHeading>
            <ul className="space-y-3">
              <FooterLink to="/signin">My account</FooterLink>
              <FooterLink to="/cart">My cart</FooterLink>
              <FooterLink to="/wishlist">Wishlist</FooterLink>
              <FooterLink to="/contact">Contact us</FooterLink>
            </ul>
          </Reveal>

          <Reveal className="col-span-2 md:col-span-4" delay={0.18}>
            <FooterHeading>Get in touch</FooterHeading>
            <ul className="space-y-3.5 text-[0.9375rem] text-ink-foreground/75">
              <li>
                <a href={`mailto:${STORE_CONTACT.email}`} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Mail size={17} className="shrink-0 text-ink-foreground/45" /> {STORE_CONTACT.email}
                </a>
              </li>
              <li>
                <a href={STORE_CONTACT.phoneHref} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Phone size={17} className="shrink-0 text-ink-foreground/45" /> {STORE_CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={17} className="shrink-0 text-ink-foreground/45" /> {STORE_CONTACT.location}
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition-all hover:gap-3"
            >
              Send us a message <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col-reverse gap-3 border-t border-white/10 py-6 text-sm text-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} my.LIGHTSTORE. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <ShieldCheck size={16} /> Secure payments by Paystack
          </p>
        </div>
      </div>
    </footer>
  );
};
