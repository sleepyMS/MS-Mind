import { useTranslation } from "react-i18next";
import { getNodeById } from "../../data";

interface ContactFallbackProps {
  messageKey?: "contact.unavailable" | "contact.error";
}

/** 설정·양식 로딩·전송 실패 시 같은 프로필 연락처를 안내한다. */
export function ContactFallback({ messageKey = "contact.unavailable" }: ContactFallbackProps) {
  const { t, i18n } = useTranslation();
  const email = getNodeById("me", i18n.language)?.details?.personalInfo?.find(
    (item) => item.key === "email"
  )?.value;

  return (
    <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
      <p className="text-sm leading-relaxed">{t(messageKey)}</p>
      {email && (
        <a
          href={`mailto:${email}`}
          className="break-all text-sm underline underline-offset-4 rounded focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ color: "var(--text-primary)" }}
        >
          {t("contact.emailLink")}: {email}
        </a>
      )}
    </div>
  );
}
