import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ContactFallback } from "./ContactFallback";
import { MiniTooltip } from "./MiniTooltip";

interface ContactFormProps {
  isDark: boolean;
  nodeColor: string;
  isActive: boolean;
}

type FormStatus = "idle" | "sending" | "success" | "error";
type FieldName = "email" | "title" | "message";
type ContactValues = Record<FieldName, string>;
type FieldErrors = Partial<Record<FieldName, string>>;

const emptyValues: ContactValues = { email: "", title: "", message: "" };
const fields: { name: FieldName; label: string; requiredError: string }[] = [
  { name: "email", label: "email", requiredError: "emailRequired" },
  { name: "title", label: "subject", requiredError: "subjectRequired" },
  { name: "message", label: "message", requiredError: "messageRequired" },
];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm({ isDark, nodeColor, isActive }: ContactFormProps) {
  const { t } = useTranslation();
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const mountedRef = useRef(false);
  const sendingRef = useRef(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState<ContactValues>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const isConfigured = Boolean(
    import.meta.env.VITE_EMAILJS_SERVICE_ID &&
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.name as FieldName;
    const value = event.target.value;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    if (status !== "sending") setStatus("idle");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isConfigured || sendingRef.current) return;

    const values = {
      email: formData.email.trim(),
      title: formData.title.trim(),
      message: formData.message.trim(),
    };
    const nextErrors: FieldErrors = {};
    for (const field of fields) {
      if (!values[field.name]) nextErrors[field.name] = field.requiredError;
    }
    if (values.email && !emailPattern.test(values.email)) {
      nextErrors.email = "emailInvalid";
    }
    setErrors(nextErrors);
    const invalidField = fields.find((field) => nextErrors[field.name]);
    if (invalidField) {
      formRef.current?.querySelector<HTMLElement>(`[name="${invalidField.name}"]`)?.focus();
      return;
    }

    sendingRef.current = true;
    setStatus("sending");
    try {
      const { default: emailjs } = await import("@emailjs/browser");
      if (!mountedRef.current) return;
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        values,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      if (mountedRef.current) {
        setStatus("success");
        setFormData(emptyValues);
      }
    } catch {
      if (mountedRef.current) setStatus("error");
    } finally {
      sendingRef.current = false;
    }
  };

  if (!isConfigured) return <ContactFallback />;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={status === "sending"}>
      <fieldset disabled={status === "sending"} className="flex flex-col gap-4 min-w-0">
        {fields.map(({ name, label }) => {
          const id = `${formId}-${name}`;
          const error = errors[name];
          const inputProps = {
            id,
            name,
            value: formData[name],
            onChange: handleChange,
            required: true,
            "aria-invalid": Boolean(error),
            "aria-describedby": `${id}-help${error ? ` ${id}-error` : ""}`,
            placeholder: t(`contact.placeholder.${label}`),
            className: "w-full px-4 py-3 rounded-xl outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-violet-400/60 disabled:opacity-60",
            style: {
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${error ? "#ef4444" : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`,
              color: isDark ? "#f1f5f9" : "#1e293b",
            },
          };
          return (
            <div key={name} className="flex flex-col gap-1.5">
              <label htmlFor={id} className="text-sm font-medium" style={{ color: isDark ? "#cbd5e1" : "#475569" }}>
                {t(`contact.form.${label}`)}
              </label>
              <span id={`${id}-help`} className="sr-only">{t(`contact.tooltip.${label}`)}</span>
              <MiniTooltip content={t(`contact.tooltip.${label}`)} className="flex w-full" disabled={!isActive}>
                {name === "message" ? (
                  <textarea {...inputProps} rows={4} className={`${inputProps.className} resize-y`} />
                ) : (
                  <input {...inputProps} type={name === "email" ? "email" : "text"} autoComplete={name === "email" ? "email" : "off"} />
                )}
              </MiniTooltip>
              {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-500">{t(`contact.validation.${error}`)}</p>}
            </div>
          );
        })}
        <button
          type="submit"
          className="mt-2 px-6 py-3 rounded-xl font-medium text-white transition-colors active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ background: `linear-gradient(135deg, ${nodeColor}, ${nodeColor}cc)`, boxShadow: `0 4px 20px ${nodeColor}30` }}
        >
          {t(status === "sending" ? "contact.form.sending" : "contact.form.send")}
        </button>
      </fieldset>
      <div aria-live="polite" aria-atomic="true">
        {status === "success" && <p className="mt-3 text-sm text-emerald-500">{t("contact.success")}</p>}
        {status === "error" && <div className="mt-3"><ContactFallback messageKey="contact.error" /></div>}
      </div>
    </form>
  );
}
