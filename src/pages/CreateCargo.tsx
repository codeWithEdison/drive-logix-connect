import { CreateCargoForm } from "@/components/forms/CreateCargoForm";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Package } from "lucide-react";
import { motion } from "framer-motion";

const CreateCargo = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-4 sm:py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {t("createCargo.title")}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {t("createCargo.subtitle")}
              </p>
            </div>
          </div>
        </motion.div>
        <CreateCargoForm />
      </div>
    </div>
  );
};

export default CreateCargo;
