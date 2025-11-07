import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { motion } from "framer-motion";
import {
  Truck,
  MapPin,
  Shield,
  Clock,
  Headphones,
  DollarSign,
  Package,
  Calendar,
  Heart,
  FileText,
  Building,
  Smartphone,
  CreditCard,
  Banknote,
  Wifi,
  Route,
  Bell,
  Camera,
  Star,
  ChevronDown,
  Menu,
  X,
  Phone,
  Mail,
  MapPin as LocationIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Globe,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [currentAppImageIndex, setCurrentAppImageIndex] = useState(0);
  const [calculatorInputs, setCalculatorInputs] = useState({
    distance: "",
    weight: "",
    category: "standard",
  });

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Price Calculator Functions
  const calculatePrice = () => {
    const { distance, weight, category } = calculatorInputs;

    // Convert string inputs to numbers, default to 0 if empty
    const distanceNum = parseFloat(distance) || 0;
    const weightNum = parseFloat(weight) || 0;

    // If both inputs are empty, return 0
    if (distanceNum === 0 && weightNum === 0) {
      return 0;
    }

    // Base rates
    const ratePerKm = 500;
    const ratePerKg = 250;

    // Category multipliers
    const categoryMultipliers = {
      standard: 1.0,
      fragile: 1.5,
      electronics: 1.3,
      documents: 0.8,
      furniture: 1.2,
      food: 1.1,
    };

    // Calculate base price
    let totalPrice = distanceNum * ratePerKm + weightNum * ratePerKg;

    // Apply category multiplier
    const multiplier =
      categoryMultipliers[category as keyof typeof categoryMultipliers] || 1.0;
    totalPrice *= multiplier;

    return Math.max(totalPrice, 2000); // Minimum price of RWF 2,000
  };

  const handleCalculatorInputChange = (field: string, value: any) => {
    setCalculatorInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetCalculator = () => {
    setCalculatorInputs({
      distance: "",
      weight: "",
      category: "standard",
    });
  };

  const vehicles = [
    {
      id: "truck",
      name: t("landing.vehicles.truck.name"),
      capacity: t("landing.vehicles.truck.capacity"),
      description: t("landing.vehicles.truck.description"),
      weight: t("landing.vehicles.truck.weight"),
      dimensions: t("landing.vehicles.truck.dimensions"),
      image:
        "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: "van",
      name: t("landing.vehicles.van.name"),
      capacity: t("landing.vehicles.van.capacity"),
      description: t("landing.vehicles.van.description"),
      weight: t("landing.vehicles.van.weight"),
      dimensions: t("landing.vehicles.van.dimensions"),
      image:
        "https://i.pinimg.com/736x/a0/ae/63/a0ae635420788e800d0c56a36f8fd74b.jpg",
    },
    {
      id: "motorcycle",
      name: t("landing.vehicles.motorcycle.name"),
      capacity: t("landing.vehicles.motorcycle.capacity"),
      description: t("landing.vehicles.motorcycle.description"),
      weight: t("landing.vehicles.motorcycle.weight"),
      dimensions: t("landing.vehicles.motorcycle.dimensions"),
      image:
        "https://i.pinimg.com/736x/56/49/2a/56492aaa174dedfb01bb30aa50ca78ef.jpg",
    },
  ];

  const nextVehicle = () => {
    setCurrentVehicleIndex((prev) => (prev + 1) % vehicles.length);
  };

  const prevVehicle = () => {
    setCurrentVehicleIndex(
      (prev) => (prev - 1 + vehicles.length) % vehicles.length
    );
  };

  const goToVehicle = (index: number) => {
    setCurrentVehicleIndex(index);
  };

  const appImages = [
    {
      id: "details",
      name: t("landing.downloadApp.features.details"),
      description: "Cargo details",
      image: "/image/mobile/details.png",
    },
    {
      id: "client",
      name: t("landing.downloadApp.features.client"),
      description: "Client dashboard",
      image: "/image/mobile/client.png",
    },
    {
      id: "tracking",
      name: t("landing.downloadApp.features.tracking"),
      description: "Real-time tracking",
      image: "/image/mobile/image.png",
    },
  ];

  const nextAppImage = () => {
    setCurrentAppImageIndex((prev) => (prev + 1) % appImages.length);
  };

  const prevAppImage = () => {
    setCurrentAppImageIndex(
      (prev) => (prev - 1 + appImages.length) % appImages.length
    );
  };

  const goToAppImage = (index: number) => {
    setCurrentAppImageIndex(index);
  };

  // Auto-slide functionality for vehicles
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVehicleIndex((prev) => (prev + 1) % vehicles.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [vehicles.length]);

  // Auto-slide functionality for app images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAppImageIndex((prev) => (prev + 1) % appImages.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [appImages.length]);

  const benefits = [
    {
      icon: <Wifi className="w-8 h-8" />,
      title: t("landing.benefits.realTimeTracking.title"),
      description: t("landing.benefits.realTimeTracking.description"),
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t("landing.benefits.securePayments.title"),
      description: t("landing.benefits.securePayments.description"),
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: t("landing.benefits.reliableDrivers.title"),
      description: t("landing.benefits.reliableDrivers.description"),
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: t("landing.benefits.fastDelivery.title"),
      description: t("landing.benefits.fastDelivery.description"),
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: t("landing.benefits.support.title"),
      description: t("landing.benefits.support.description"),
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: t("landing.benefits.transparentPricing.title"),
      description: t("landing.benefits.transparentPricing.description"),
    },
  ];

  const steps = [
    {
      number: "01",
      title: t("landing.steps.book.title"),
      description: t("landing.steps.book.description"),
    },
    {
      number: "02",
      title: t("landing.steps.track.title"),
      description: t("landing.steps.track.description"),
    },
    {
      number: "03",
      title: t("landing.steps.receive.title"),
      description: t("landing.steps.receive.description"),
    },
  ];

  const services = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: t("landing.services.sameDay.title"),
      description: t("landing.services.sameDay.description"),
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t("landing.services.scheduled.title"),
      description: t("landing.services.scheduled.description"),
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: t("landing.services.fragile.title"),
      description: t("landing.services.fragile.description"),
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: t("landing.services.large.title"),
      description: t("landing.services.large.description"),
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t("landing.services.documents.title"),
      description: t("landing.services.documents.description"),
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: t("landing.services.business.title"),
      description: t("landing.services.business.description"),
    },
  ];

  const paymentMethods = [
    {
      image:
        "https://images.seeklogo.com/logo-png/55/1/mtn-momo-mobile-money-uganda-logo-png_seeklogo-556395.png",
      title: t("landing.payment.mobile.title"),
      description: t("landing.payment.mobile.description"),
    },
    {
      image:
        "https://eu-images.contentstack.com/v3/assets/blt7dacf616844cf077/bltdf84714343190854/6799459ee12d0ab52679d073/kigali.png?width=1280&auto=webp&quality=80&format=jpg&disable=upscale",
      title: t("landing.payment.bank.title"),
      description: t("landing.payment.bank.description"),
    },
    {
      image: "https://cdn-icons-png.flaticon.com/512/6963/6963703.png",
      title: t("landing.payment.online.title"),
      description: t("landing.payment.online.description"),
    },
  ];

  const trackingFeatures = [
    {
      icon: <Wifi className="w-6 h-6" />,
      title: t("landing.trackingFeatures.liveGps.title"),
      description: t("landing.trackingFeatures.liveGps.description"),
    },
    {
      icon: <Route className="w-6 h-6" />,
      title: t("landing.trackingFeatures.route.title"),
      description: t("landing.trackingFeatures.route.description"),
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t("landing.trackingFeatures.eta.title"),
      description: t("landing.trackingFeatures.eta.description"),
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: t("landing.trackingFeatures.notifications.title"),
      description: t("landing.trackingFeatures.notifications.description"),
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: t("landing.trackingFeatures.photos.title"),
      description: t("landing.trackingFeatures.photos.description"),
    },
  ];

  const testimonials = [
    {
      name: t("landing.testimonials.sarah.name"),
      role: t("landing.testimonials.sarah.role"),
      content: t("landing.testimonials.sarah.content"),
      rating: 5,
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocKUYbuOxTvG1g0oKt1KnzS-cgBl6t-lmb74LYeMtDwt2BiJXV1g=s96-c",
    },
    {
      name: t("landing.testimonials.michael.name"),
      role: t("landing.testimonials.michael.role"),
      content: t("landing.testimonials.michael.content"),
      rating: 5,
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocKUYbuOxTvG1g0oKt1KnzS-cgBl6t-lmb74LYeMtDwt2BiJXV1g=s96-c",
    },
    {
      name: t("landing.testimonials.emily.name"),
      role: t("landing.testimonials.emily.role"),
      content: t("landing.testimonials.emily.content"),
      rating: 5,
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocKUYbuOxTvG1g0oKt1KnzS-cgBl6t-lmb74LYeMtDwt2BiJXV1g=s96-c",
    },
  ];

  const faqs = [
    {
      question: t("landing.faq.tracking.question"),
      answer: t("landing.faq.tracking.answer"),
    },
    {
      question: t("landing.faq.payment.question"),
      answer: t("landing.faq.payment.answer"),
    },
    {
      question: t("landing.faq.delivery.question"),
      answer: t("landing.faq.delivery.answer"),
    },
    {
      question: t("landing.faq.damage.question"),
      answer: t("landing.faq.damage.answer"),
    },
    {
      question: t("landing.faq.address.question"),
      answer: t("landing.faq.address.answer"),
    },
    {
      question: t("landing.faq.weekend.question"),
      answer: t("landing.faq.weekend.answer"),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <img
                    src="/logo-text.png"
                    alt="Loveway Logistics"
                    className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a
                href="#services"
                className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm font-semibold py-2 group"
              >
                {t("landing.navigation.services")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#vehicles"
                className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm font-semibold py-2 group"
              >
                {t("landing.navigation.tracking")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#pricing"
                className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm font-semibold py-2 group"
              >
                {t("landing.navigation.pricing")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#faq"
                className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 text-sm font-semibold py-2 group"
              >
                {t("landing.navigation.faq")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#contact"
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
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-3">
              <LanguageSwitcher variant="ghost" size="sm" showLabel={false} />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-all duration-200"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Modern Mobile Navigation Card */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Navigation Section */}
                <div className="p-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Navigation
                  </h3>
                  <nav className="space-y-1">
                    <a
                      href="#services"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium px-3 py-2.5 rounded-lg group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>{t("landing.navigation.services")}</span>
                    </a>
                    <a
                      href="#vehicles"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium px-3 py-2.5 rounded-lg group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>{t("landing.navigation.tracking")}</span>
                    </a>
                    <a
                      href="#pricing"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium px-3 py-2.5 rounded-lg group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>{t("landing.navigation.pricing")}</span>
                    </a>
                    <a
                      href="#faq"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium px-3 py-2.5 rounded-lg group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <ChevronDown className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>{t("landing.navigation.faq")}</span>
                    </a>
                    <a
                      href="#contact"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium px-3 py-2.5 rounded-lg group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>{t("landing.navigation.contact")}</span>
                    </a>
                  </nav>
                </div>

                {/* Tools Section */}
                <div className="px-6 pb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Tools
                  </h3>
                  <div className="flex items-center gap-3 text-gray-700 px-3 py-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium flex-1">Language</span>
                    <LanguageSwitcher
                      variant="ghost"
                      size="sm"
                      showLabel={true}
                    />
                  </div>
                </div>

                {/* Sign In Button */}
                <div className="p-6 pt-0">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-lg shadow-blue-600/30 w-full"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modern Hero Section */}
      <section className="pt-20 relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background with Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/image/red-truck-road-with-blurred-background_470606-193.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-gray-900/90"></div>
          {/* Animated Shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8 text-white text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Truck className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold">
                  Fast & Reliable Delivery
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                {t("landing.hero.title")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  {t("landing.hero.titleHighlight")}
                </span>
              </h1>

              {/* One Sentence Description */}
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto lg:mx-0">
                Professional cargo delivery platform with real-time tracking and
                secure payment options.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/login"
                  className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center shadow-2xl shadow-blue-600/50 hover:shadow-blue-600/70 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Truck className="w-5 h-5" />
                    {t("landing.hero.ctaPrimary")}
                  </span>
                </Link>
                <a
                  href="#download"
                  className="group border-2 border-white/50 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-white hover:text-blue-900 transition-all duration-300 text-center backdrop-blur-sm hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    {t("landing.downloadApp.downloadButton")}
                  </span>
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-blue-400">
                    5K+
                  </div>
                  <div className="text-sm text-gray-300">Deliveries</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-blue-400">
                    98%
                  </div>
                  <div className="text-sm text-gray-300">On-Time</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-blue-400">
                    24/7
                  </div>
                  <div className="text-sm text-gray-300">Support</div>
                </div>
              </div>
            </div>

            {/* Right Content - App Preview */}
            <div
              id="download"
              className="relative flex justify-center lg:justify-end mt-8 lg:mt-0"
            >
              <div className="relative max-w-xs md:max-w-sm w-full px-4 md:px-0">
                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl opacity-50 animate-pulse"></div>

                {/* Simple Elegant Container */}
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentAppImageIndex * 100}%)`,
                    }}
                  >
                    {appImages.map((appImage) => (
                      <div
                        key={appImage.id}
                        className="w-full flex-shrink-0 flex items-center justify-center bg-gradient-to-b from-white/5 to-white/10"
                      >
                        <img
                          src={appImage.image}
                          alt={appImage.name}
                          className="w-full h-[450px] md:h-[550px] object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevAppImage}
                  className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-white/90 hover:bg-white text-blue-600 p-2 md:p-3 rounded-full transition-all duration-200 shadow-lg hover:scale-110 z-10"
                  aria-label="Previous app image"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                  onClick={nextAppImage}
                  className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-white/90 hover:bg-white text-blue-600 p-2 md:p-3 rounded-full transition-all duration-200 shadow-lg hover:scale-110 z-10"
                  aria-label="Next app image"
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Dots Indicator */}
                <div className="flex justify-center mt-6 space-x-2">
                  {appImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToAppImage(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentAppImageIndex
                          ? "bg-white w-8"
                          : "bg-white/40 w-2 hover:bg-white/60"
                      }`}
                      aria-label={`Go to app image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
          <ChevronDown className="w-6 h-6 text-white/60" />
        </div>
      </section>

      {/* Why Choose Us Section - Animated Design */}
      <section className="py-16 md:py-28 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 px-4 py-2 rounded-full mb-4 md:mb-6 font-semibold text-xs md:text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Star className="w-3 h-3 md:w-4 md:h-4" />
              Why Choose Us
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              {t("landing.benefits.title")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Experience excellence in every delivery
            </p>
          </motion.div>

          {/* Animated Benefits Grid */}
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 50, scale: 0.9 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 text-center">
                  {/* Animated Icon */}
                  <motion.div
                    className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 text-white shadow-lg shadow-blue-500/40"
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {benefit.icon}
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Number Badge */}
                <motion.div
                  className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-8 md:h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs md:text-sm font-bold"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                >
                  {index + 1}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - Animated Timeline */}
      <section className="py-16 md:py-28 bg-gradient-to-br from-indigo-950 via-blue-950 to-slate-950 relative overflow-hidden">
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-10 left-10 w-56 h-56 md:w-72 md:h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-72 h-72 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4 md:mb-6 font-semibold text-xs md:text-sm border border-white/20"
              whileHover={{ scale: 1.05 }}
            >
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              Simple Process
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
              Get started in three easy steps
            </p>
          </motion.div>

          {/* Animated Timeline */}
          <div className="relative">
            {/* Connection Line - Desktop */}
            <motion.div
              className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 mx-auto"
              style={{ width: "calc(100% - 200px)", left: "100px" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />

            <motion.div
              className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-12"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                  },
                },
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 60 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="relative"
                >
                  {/* Step Card */}
                  <motion.div
                    className="bg-white/10 backdrop-blur-lg rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl"
                    whileHover={{
                      y: -8,
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      transition: { duration: 0.3 },
                    }}
                  >
                    {/* Animated Number Badge */}
                    <motion.div
                      className="relative z-10 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 text-xl md:text-2xl font-bold shadow-2xl"
                      whileHover={{
                        scale: 1.15,
                        rotate: 360,
                        transition: { duration: 0.6 },
                      }}
                    >
                      {step.number}
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-base md:text-lg lg:text-2xl font-bold text-white mb-3 md:mb-4 text-center">
                      {step.title}
                    </h3>
                    <p className="text-xs md:text-sm lg:text-base text-gray-300 text-center leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="md:hidden flex justify-center my-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-blue-400 animate-bounce" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section - Animated Cards */}
      <section
        id="services"
        className="py-16 md:py-28 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden"
      >
        {/* Animated Dots Pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #3b82f6 2px, transparent 2px)",
            backgroundSize: "40px 40px",
          }}
          animate={{
            backgroundPosition: ["0px 0px", "40px 40px"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-blue-600 px-4 py-2 rounded-full mb-4 md:mb-6 font-semibold text-xs md:text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Package className="w-3 h-3 md:w-4 md:h-4" />
              Our Services
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              {t("landing.services.title")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive logistics solutions for all your needs
            </p>
          </motion.div>

          {/* Animated Services Grid */}
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, scale: 0.8, y: 40 },
                  show: { opacity: 1, scale: 1, y: 0 },
                }}
                whileHover={{
                  y: -12,
                  scale: 1.03,
                  transition: { duration: 0.4, ease: "easeOut" },
                }}
                className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-gray-100 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative z-10">
                  {/* Animated Icon */}
                  <motion.div
                    className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-blue-600 group-hover:shadow-xl transition-shadow duration-300"
                    whileHover={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.1,
                      transition: { duration: 0.5 },
                    }}
                  >
                    {service.icon}
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                    {service.title}
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Arrow with Animation */}
                  <motion.div
                    className="mt-4 md:mt-6 flex items-center text-blue-600 font-semibold text-xs md:text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                  >
                    <span>Learn more</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full transition-colors duration-300"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Payment Options Section - Animated */}
      <section className="py-16 md:py-28 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/50 relative overflow-hidden">
        {/* Animated Decorative Elements */}
        <motion.div
          className="absolute top-10 right-10 w-48 h-48 md:w-64 md:h-64 bg-green-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-64 h-64 md:w-80 md:h-80 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 via-emerald-100 to-blue-100 text-green-600 px-4 py-2 rounded-full mb-4 md:mb-6 font-semibold text-xs md:text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <CreditCard className="w-3 h-3 md:w-4 md:h-4" />
              Payment Methods
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              {t("landing.paymentOptions.title")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your preferred payment method
            </p>
          </motion.div>

          {/* Animated Payment Methods Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {paymentMethods.map((method, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 50, rotateY: -20 },
                  show: { opacity: 1, y: 0, rotateY: 0 },
                }}
                whileHover={{
                  y: -10,
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
                className="group relative bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-gray-100 hover:border-green-200 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 text-center">
                  {/* Payment Logo Image */}
                  <motion.div
                    className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg p-3 md:p-4"
                    whileHover={{
                      scale: 1.15,
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.6 },
                    }}
                  >
                    <img
                      src={method.image}
                      alt={method.title}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                    {method.title}
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed">
                    {method.description}
                  </p>

                  {/* Checkmark Badge with Animation */}
                  <motion.div
                    className="mt-4 md:mt-6 inline-flex items-center gap-2 text-green-600 text-xs md:text-sm font-semibold"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-4 h-4 md:w-5 md:h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-2 h-2 md:w-3 md:h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>Supported</span>
                  </motion.div>
                </div>

                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Animated Trust Badge */}
          <motion.div
            className="mt-12 md:mt-16 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 shadow-xl border-2 border-green-100"
              whileHover={{ scale: 1.05 }}
            >
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              <span className="text-xs md:text-sm font-semibold text-gray-700">
                All payments are secure and encrypted
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Vehicle Fleet Section - Animated Slider */}
      <section
        id="vehicles"
        className="py-16 md:py-28 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 relative overflow-hidden"
      >
        {/* Animated Background */}
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 px-4 py-2 rounded-full mb-4 md:mb-6 font-semibold text-xs md:text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Truck className="w-3 h-3 md:w-4 md:h-4" />
              Our Fleet
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              {t("landing.vehicles.title")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.vehicles.subtitle")}
            </p>
          </motion.div>

          {/* Vehicle Slider */}
          <motion.div
            className="relative max-w-5xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Main Slide Container */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl bg-gradient-to-br from-gray-900 to-slate-900">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${currentVehicleIndex * 100}%)`,
                }}
              >
                {vehicles.map((vehicle, index) => (
                  <div key={vehicle.id} className="w-full flex-shrink-0">
                    <div className="relative h-[400px] sm:h-[450px] md:h-[550px] lg:h-[600px]">
                      {/* Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                        style={{ backgroundImage: `url('${vehicle.image}')` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>
                      </div>

                      {/* Content Overlay */}
                      <div className="relative z-10 h-full flex flex-col justify-end">
                        <motion.div
                          className="p-6 sm:p-8 md:p-12 text-white w-full"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          <div className="max-w-2xl">
                            {/* Vehicle Name */}
                            <motion.h3
                              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4"
                              initial={{ opacity: 0, x: -30 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.6, delay: 0.3 }}
                            >
                              {vehicle.name}
                            </motion.h3>

                            {/* Capacity Badge */}
                            <motion.div
                              className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-full mb-4 md:mb-6"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.6, delay: 0.4 }}
                            >
                              <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
                                {vehicle.capacity}
                              </p>
                            </motion.div>

                            {/* Specs */}
                            <motion.div
                              className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-8"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: 0.5 }}
                            >
                              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                                <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-400" />
                                <span className="text-xs sm:text-sm md:text-base">
                                  {vehicle.weight}
                                </span>
                              </div>
                              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                                <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-400" />
                                <span className="text-xs sm:text-sm md:text-base">
                                  {vehicle.dimensions}
                                </span>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <motion.button
              onClick={prevVehicle}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 sm:p-3 rounded-full transition-all duration-300 backdrop-blur-sm shadow-xl z-20"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Previous vehicle"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </motion.button>
            <motion.button
              onClick={nextVehicle}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 sm:p-3 rounded-full transition-all duration-300 backdrop-blur-sm shadow-xl z-20"
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next vehicle"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 md:mt-8 space-x-2">
              {vehicles.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToVehicle(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentVehicleIndex
                      ? "bg-blue-600 w-8"
                      : "bg-gray-300 w-2 hover:bg-gray-400"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to vehicle ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.testimonials.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.testimonials.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.pricingSection.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.pricingSection.subtitle")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Standard Rates */}
            <div className="bg-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t("landing.pricingSection.standardRates")}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">
                    {t("landing.pricing.perKm")}
                  </span>
                  <span className="font-semibold text-blue-600">RWF 500</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">
                    {t("landing.pricing.perKg")}
                  </span>
                  <span className="font-semibold text-blue-600">RWF 250</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Standard Items</span>
                  <span className="font-semibold text-blue-600">1.0x</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Fragile Items</span>
                  <span className="font-semibold text-blue-600">1.5x</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Electronics</span>
                  <span className="font-semibold text-blue-600">1.3x</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Documents</span>
                  <span className="font-semibold text-green-600">0.8x</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Furniture</span>
                  <span className="font-semibold text-blue-600">1.2x</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Food Items</span>
                  <span className="font-semibold text-blue-600">1.1x</span>
                </div>
              </div>
            </div>

            {/* Interactive Price Calculator */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Price Calculator</h3>

              <div className="space-y-6">
                {/* Distance Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calculatorInputs.distance}
                    onChange={(e) =>
                      handleCalculatorInputChange("distance", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Enter distance"
                  />
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calculatorInputs.weight}
                    onChange={(e) =>
                      handleCalculatorInputChange("weight", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Enter weight"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Item Category
                  </label>
                  <select
                    value={calculatorInputs.category}
                    onChange={(e) =>
                      handleCalculatorInputChange("category", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="standard">Standard Items (1.0x)</option>
                    <option value="fragile">Fragile Items (1.5x)</option>
                    <option value="electronics">Electronics (1.3x)</option>
                    <option value="documents">Documents (0.8x)</option>
                    <option value="furniture">Furniture (1.2x)</option>
                    <option value="food">Food Items (1.1x)</option>
                  </select>
                </div>

                {/* Price Display */}
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <div className="text-sm text-blue-100 mb-1">
                    Estimated Price
                  </div>
                  <div className="text-3xl font-bold">
                    RWF {calculatePrice().toLocaleString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={resetCalculator}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition-colors"
                  >
                    Reset
                  </button>
                  <Link
                    to="/create-cargo"
                    className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors text-center"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.faq.title")}
            </h2>
            <p className="text-xl text-gray-600">{t("landing.faq.subtitle")}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <span className="font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.contact.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.contact.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("landing.contact.phone")}
              </h3>
              <p className="text-gray-600">
                {t("landing.contact.phoneNumbers.primary")}
              </p>
              <p className="text-gray-600">
                {t("landing.contact.phoneNumbers.secondary")}
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("landing.contact.email")}
              </h3>
              <p className="text-gray-600">
                {t("landing.contact.emails.info")}
              </p>
              <p className="text-gray-600">
                {t("landing.contact.emails.support")}
              </p>
            </div>

            <div className="text-center p-6 bg-orange-50 rounded-xl md:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LocationIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("landing.contact.address")}
              </h3>
              <p className="text-gray-600">
                {t("landing.contact.addressInfo.street")}
              </p>
              <p className="text-gray-600">
                {t("landing.contact.addressInfo.country")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("landing.getStarted.title")}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {t("landing.getStarted.subtitle")}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link
              to="/login"
              className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              {t("landing.getStarted.bookNow")}
            </Link>
            <Link
              to="/create-cargo"
              className="bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors"
            >
              {t("landing.getStarted.getQuote")}
            </Link>
            <a
              href="#download"
              className="bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors"
            >
              {t("landing.getStarted.downloadApp")}
            </a>
            <a
              href="#contact"
              className="bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors"
            >
              {t("landing.getStarted.contactUs")}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img
                  src="/logo-text.png"
                  alt="Loveway Logistics"
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-400 mb-4">
                {t("landing.footer.description")}
              </p>
              <div className="flex space-x-4">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                {t("landing.footer.services")}
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#services"
                    className="hover:text-white transition-colors"
                  >
                    {t("landing.footer.links.sameDay")}
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="hover:text-white transition-colors"
                  >
                    {t("landing.footer.links.scheduled")}
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="hover:text-white transition-colors"
                  >
                    {t("landing.footer.links.fragile")}
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="hover:text-white transition-colors"
                  >
                    {t("landing.footer.links.business")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                {t("landing.footer.support")}
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    {t("landing.footer.links.faq")}
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    {t("landing.footer.links.contact")}
                  </a>
                </li>
                <li>
                  <a
                    href="#tracking"
                    className="hover:text-white transition-colors"
                  >
                    {t("landing.footer.links.track")}
                  </a>
                </li>
                <li>
                  <a
                    href="#help"
                    className="hover:text-white transition-colors"
                  >
                    {t("landing.footer.links.help")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                {t("landing.footer.contactInfo")}
              </h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{t("landing.contact.phoneNumbers.primary")}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{t("landing.contact.emails.support")}</span>
                </div>
                <div className="flex items-center">
                  <LocationIcon className="w-4 h-4 mr-2" />
                  <span>
                    {t("landing.contact.addressInfo.street")},{" "}
                    {t("landing.contact.addressInfo.country")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>{t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
