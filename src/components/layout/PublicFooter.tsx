import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  ArrowRight,
  MapPin as LocationIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function PublicFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Brand Section */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/lovewaylogistic.png"
                alt="Loveway Logistics"
                className="h-8 md:h-10 w-auto"
              />
              <div>
                <h3 className="text-lg md:text-xl font-bold">
                  Loveway Logistic
                </h3>
              </div>
            </div>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed">
              {t("landing.footer.description")}
            </p>
            {/* Social Media */}
            <div className="flex gap-3 pt-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <h3 className="text-base md:text-lg font-bold mb-4">
              {t("landing.footer.services")}
            </h3>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-400">
              {[
                {
                  label: t("landing.footer.links.sameDay"),
                  href: "/#services",
                },
                {
                  label: t("landing.footer.links.scheduled"),
                  href: "/#services",
                },
                {
                  label: t("landing.footer.links.fragile"),
                  href: "/#services",
                },
                {
                  label: t("landing.footer.links.business"),
                  href: "/#services",
                },
              ].map((link, i) => (
                <motion.li
                  key={i}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={link.href}
                    className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                  >
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <h3 className="text-base md:text-lg font-bold mb-4">
              {t("landing.footer.support")}
            </h3>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-400">
              {[
                { label: t("landing.footer.links.faq"), href: "/#faq" },
                {
                  label: t("landing.footer.links.contact"),
                  href: "/#contact",
                },
                { label: t("landing.footer.links.track"), href: "/#tracking" },
                { label: t("landing.footer.links.help"), href: "/#help" },
              ].map((link, i) => (
                <motion.li
                  key={i}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={link.href}
                    className="hover:text-blue-400 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <h3 className="text-base md:text-lg font-bold mb-4">
              {t("landing.footer.contactInfo")}
            </h3>
            <div className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-400">
              <motion.div
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                </div>
                <span>{t("landing.contact.phoneNumbers.primary")}</span>
              </motion.div>
              <motion.div
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 md:w-9 md:h-9 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                </div>
                <span>{t("landing.contact.emails.support")}</span>
              </motion.div>
              <motion.div
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 md:w-9 md:h-9 bg-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LocationIcon className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                </div>
                <span>
                  {t("landing.contact.addressInfo.street")},{" "}
                  {t("landing.contact.addressInfo.country")}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-gray-800 pt-6 md:pt-8 mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-gray-400">
            <p>{t("landing.footer.copyright")}</p>
            <div className="flex gap-6">
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                {t("landing.footer.policies.privacy")}
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                {t("landing.footer.policies.terms")}
              </Link>
              <Link
                to="/cookies"
                className="hover:text-white transition-colors"
              >
                {t("landing.footer.policies.cookies")}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
