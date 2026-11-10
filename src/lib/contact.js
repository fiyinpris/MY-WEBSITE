import emailjs from "@emailjs/browser";

// EmailJS credentials already used by the store's contact form.
export const EMAILJS_SERVICE_ID = "service_f8jpcjv";
export const EMAILJS_CONTACT_TEMPLATE_ID = "template_2dmkkl9";
export const EMAILJS_PUBLIC_KEY = "aYMxHd4D49CBiJT-X";

export const STORE_CONTACT = {
  email: "support@mylightstore.com",
  phoneDisplay: "+234 813 542 4926",
  phoneHref: "tel:+2348135424926",
  whatsappDisplay: "+234 905 841 9783",
  whatsappHref: "https://wa.me/+2349058419783",
  instagramHandle: "@cillas_light",
  instagramHref: "https://www.instagram.com/cillas_light",
  location: "Osogbo, Osun State, Nigeria",
};

/**
 * Send a message to the store owner via EmailJS (same template as the
 * original home-page contact form).
 */
export const sendContactMessage = ({ name, email, phone, message }) =>
  emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_CONTACT_TEMPLATE_ID,
    {
      to_name: "Fiyinfoluwa",
      name,
      email,
      time: new Date().toLocaleString(),
      message,
      contactnumber: phone || "Not provided",
    },
    EMAILJS_PUBLIC_KEY,
  );
