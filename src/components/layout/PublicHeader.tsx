import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export function PublicHeader() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
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
  );
}
