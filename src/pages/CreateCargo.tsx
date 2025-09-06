import { CreateCargoForm } from "@/components/forms/CreateCargoForm";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const CreateCargo = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("createCargo.title")}
        </h1>
        <p className="text-muted-foreground">{t("createCargo.subtitle")}</p>
      </div>
      <CreateCargoForm />
    </div>
  );
};

export default CreateCargo;
