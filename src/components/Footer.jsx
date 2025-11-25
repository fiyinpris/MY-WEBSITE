import { Instagram } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export const Footer = ({ formData, setFormData }) => {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="flex justify-between p-8 flex-wrap gap-8">
        {/* Customer Services */}
        <div className="space-y-3">
          <h4 className="font-bold text-lg">Customer Services</h4>
          <p className="text-sm">Customer Care</p>
          <p className="text-sm">FAQ</p>
          <p className="text-sm">My Account</p>
        </div>

        {/* Company */}
        <div className="space-y-3">
          <h4 className="font-bold text-lg">Company</h4>
          <p className="text-sm">About Us</p>
          <p className="text-sm">Contact Us</p>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="font-bold text-lg">Categories</h4>
          <p className="text-sm">Ringlight</p>
          <p className="text-sm">Led light</p>
          <p className="text-sm">Tripod</p>
          <p className="text-sm">Accessories</p>
        </div>

        {/* Newsletter */}
        <div className="space-y-3 max-w-sm">
          <p className="text-sm leading-relaxed">
            Receive updates on our latest products, new releases <br />
            and special discount offers.
          </p>

          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Your Email"
            required
            className="w-full px-5 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/40"
          />

          <a
            href="#contact"
            className="bg-white text-black px-6 py-3 rounded-3xl mt-2 inline-block text-sm"
          >
            SUBSCRIBE
          </a>

          <div className="flex items-center gap-4 mt-3">
            <a
              href="https://www.instagram.com/cillas_light"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="cursor-pointer hover:text-gray-300" />
            </a>

            <a
              href="https://wa.me/+2349058419783"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="text-xl cursor-pointer hover:text-gray-300" />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 w-full"></div>

      {/* Copyright */}
      <div className="text-center pb-10 py-4 text-gray-400 text-sm">
        © {new Date().getFullYear()} my.LIGHTSTORE. All rights reserved.
      </div>
    </footer>
  );
};
