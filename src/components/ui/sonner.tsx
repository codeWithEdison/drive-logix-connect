import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group toast-container"
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg dark:group-[.toaster]:bg-gray-800 dark:group-[.toaster]:text-gray-100 dark:group-[.toaster]:border-gray-700",
          description:
            "group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-300",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80",
          // Success toast styling
          success:
            "group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200 group-[.toaster]:text-green-800 dark:group-[.toaster]:bg-green-900/20 dark:group-[.toaster]:border-green-800 dark:group-[.toaster]:text-green-200",
          // Error toast styling
          error:
            "group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200 group-[.toaster]:text-red-800 dark:group-[.toaster]:bg-red-900/20 dark:group-[.toaster]:border-red-800 dark:group-[.toaster]:text-red-200",
          // Warning toast styling
          warning:
            "group-[.toaster]:bg-yellow-50 group-[.toaster]:border-yellow-200 group-[.toaster]:text-yellow-800 dark:group-[.toaster]:bg-yellow-900/20 dark:group-[.toaster]:border-yellow-800 dark:group-[.toaster]:text-yellow-200",
          // Info toast styling
          info: "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-800 dark:group-[.toaster]:bg-blue-900/20 dark:group-[.toaster]:border-blue-800 dark:group-[.toaster]:text-blue-200",
        },
        duration: 4000,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
