import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogIn, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export function PublicHeader() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Contact Banner */}
      <div className="bg-blue-600 text-white py-2 text-[10px] md:text-xs font-semibold shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-6">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-200" />
              <div className="flex items-center gap-2">
                <a href="tel:0793760755" className="hover:text-blue-100 transition-colors">0793760755</a>
                <span className="text-white/30">|</span>
                <a href="tel:0794581924" className="hover:text-blue-100 transition-colors">0794581924</a>
                <span className="text-white/30 hidden sm:inline">|</span>
                <a href="tel:0786238927" className="hover:text-blue-100 transition-colors hidden sm:inline">0786238927</a>
                <span className="text-white/30 hidden lg:inline">|</span>
                <a href="tel:0789013134" className="hover:text-blue-100 transition-colors hidden lg:inline">0789013134</a>
              </div>
            </div>
            <a href="mailto:info@lovewaylogistics.com" className="flex items-center gap-1.5 hover:text-blue-100 transition-colors group border-l border-white/20 pl-3 md:pl-6">
              <Mail className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:scale-110 transition-transform" />
              <span>info@lovewaylogistics.com</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span>{t("landing.getStarted.stats.support")} 24/7</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <img
                    src="/logo-text.png"
                    alt="Loveway Logistics"
                    className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a
                href="/#services"
                className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm font-semibold py-2 group"
              >
                {t("landing.navigation.services")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="/#vehicles"
                className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm font-semibold py-2 group"
              >
                {t("landing.navigation.tracking")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="/#pricing"
                className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm font-semibold py-2 group"
              >
                {t("landing.navigation.pricing")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="/#faq"
                className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm font-semibold py-2 group"
              >
                {t("landing.navigation.faq")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="/#contact"
                className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm font-semibold py-2 group"
              >
                {t("landing.navigation.contact")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <LanguageSwitcher variant="ghost" size="sm" showLabel={true} />
                <Link
                  to="/login"
                  className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5"
                >
                  <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {t("navigation.login")}
                </Link>
              </div>
            </div>

            {/* Mobile header - Logo, Language, Login, Menu */}
            <div className="lg:hidden flex items-center gap-2">
              <LanguageSwitcher variant="ghost" size="sm" showLabel={true} />
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-xs font-semibold shadow-lg shadow-blue-600/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t("navigation.login")}
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-all duration-200"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Card */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    {t("landing.mobileMenu.navigation")}
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="/#services"
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("landing.navigation.services")}
                    </a>
                    <a
                      href="/#vehicles"
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("landing.navigation.tracking")}
                    </a>
                    <a
                      href="/#pricing"
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("landing.navigation.pricing")}
                    </a>
                    <a
                      href="/#faq"
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("landing.navigation.faq")}
                    </a>
                    <a
                      href="/#contact"
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("landing.navigation.contact")}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
