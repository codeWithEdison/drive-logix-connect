import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
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
} from "lucide-react";

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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
      icon: <Smartphone className="w-8 h-8" />,
      title: t("landing.payment.mobile.title"),
      description: t("landing.payment.mobile.description"),
    },
    {
      icon: <Banknote className="w-8 h-8" />,
      title: t("landing.payment.bank.title"),
      description: t("landing.payment.bank.description"),
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
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
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: t("landing.testimonials.michael.name"),
      role: t("landing.testimonials.michael.role"),
      content: t("landing.testimonials.michael.content"),
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: t("landing.testimonials.emily.name"),
      role: t("landing.testimonials.emily.role"),
      content: t("landing.testimonials.emily.content"),
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
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
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/logo-text.png"
                alt="Loveway Logistics"
                className="h-8 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#services"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("landing.navigation.services")}
              </a>
              <a
                href="#tracking"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("landing.navigation.tracking")}
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("landing.navigation.pricing")}
              </a>
              <a
                href="#faq"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("landing.navigation.faq")}
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("landing.navigation.contact")}
              </a>
              <LanguageSwitcher variant="ghost" size="sm" showLabel={false} />
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("landing.navigation.getStarted")}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a
                  href="#services"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {t("landing.navigation.services")}
                </a>
                <a
                  href="#tracking"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {t("landing.navigation.tracking")}
                </a>
                <a
                  href="#pricing"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {t("landing.navigation.pricing")}
                </a>
                <a
                  href="#faq"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {t("landing.navigation.faq")}
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {t("landing.navigation.contact")}
                </a>
                <div className="flex justify-center">
                  <LanguageSwitcher
                    variant="outline"
                    size="sm"
                    showLabel={true}
                  />
                </div>
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  {t("landing.navigation.getStarted")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                {t("landing.hero.title")}{" "}
                <span className="text-blue-600">
                  {t("landing.hero.titleHighlight")}
                </span>
                <br />
                {t("landing.hero.subtitle")}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t("landing.hero.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                >
                  {t("landing.hero.ctaPrimary")}
                </Link>
                <Link
                  to="/tracking"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors text-center"
                >
                  {t("landing.hero.ctaSecondary")}
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {t("landing.trackingDemo.title")}
                    </h3>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm">
                        {t("landing.trackingDemo.active")}
                      </span>
                    </div>
                  </div>
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("landing.trackingDemo.eta")}
                      </span>
                      <span className="text-sm font-semibold">2:30 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("landing.trackingDemo.status")}
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {t("landing.trackingDemo.inTransit")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.benefits.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.benefits.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.services.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.services.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Options Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.paymentOptions.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.paymentOptions.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  {method.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-600 text-sm">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracking Features Section */}
      <section id="tracking" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.trackingFeatures.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.trackingFeatures.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackingFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
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

          <div className="bg-blue-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("landing.pricingSection.standardRates")}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("landing.pricing.perKm")}
                    </span>
                    <span className="font-semibold">RWF 500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("landing.pricing.perKg")}
                    </span>
                    <span className="font-semibold">RWF 250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("landing.pricing.sameDay")}
                    </span>
                    <span className="font-semibold">+RWF 5,000</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("landing.pricingSection.getQuote")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("landing.pricingSection.getQuoteDescription")}
                </p>
                <Link
                  to="/create-cargo"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                >
                  {t("landing.pricingSection.getQuoteButton")}
                </Link>
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
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {t("landing.getStarted.bookNow")}
            </Link>
            <Link
              to="/create-cargo"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              {t("landing.getStarted.getQuote")}
            </Link>
            <a
              href="#download"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              {t("landing.getStarted.downloadApp")}
            </a>
            <a
              href="#contact"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
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
