import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { MiniTooltip } from "./MiniTooltip";

interface ContactFormProps {
  isDark: boolean;
  nodeColor: string;
  isModal?: boolean;
}

type FormStatus = "idle" | "sending" | "success" | "error";

export function ContactForm({ isDark, nodeColor }: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState({
    email: "",
    title: "",
    message: "",
  });
  const [errors, setErrors] = useState<{
    email?: string;
    title?: string;
    message?: string;
  }>({});

  // 이메일 유효성 검사
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 실시간 유효성 검사
    if (name === "email") {
      if (value && !validateEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "올바른 이메일 형식이 아닙니다",
        }));
      } else {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    } else if (name === "title" && errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    } else if (name === "message" && errors.message) {
      setErrors((prev) => ({ ...prev, message: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 모든 필드 유효성 검사
    const newErrors: { email?: string; title?: string; message?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }

    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요";
    }

    if (!formData.message.trim()) {
      newErrors.message = "메시지를 입력해주세요";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus("sending");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          email: formData.email,
          title: formData.title,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      setFormData({ email: "", title: "", message: "" });
      setErrors({});
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("EmailJS Error:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(0,0,0,0.1)",
    color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)",
  };

  const focusStyle = {
    borderColor: nodeColor,
    boxShadow: `0 0 0 2px ${nodeColor}30`,
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* 이메일 */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="contact-email"
          className="text-sm font-medium"
          style={{
            color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
          }}
        >
          이메일 *
        </label>
        <MiniTooltip content="답변 받으실 이메일 주소를 입력하세요">
          <input
            type="text"
            id="contact-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            title=""
            className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
            style={{
              ...inputStyle,
              ...(errors.email
                ? {
                    borderColor: "#ef4444",
                    boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)",
                  }
                : {}),
            }}
            onFocus={(e) =>
              Object.assign(
                e.target.style,
                errors.email
                  ? {
                      borderColor: "#ef4444",
                      boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)",
                    }
                  : focusStyle
              )
            }
            onBlur={(e) =>
              Object.assign(
                e.target.style,
                errors.email
                  ? {
                      ...inputStyle,
                      borderColor: "#ef4444",
                      boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)",
                    }
                  : inputStyle
              )
            }
          />
        </MiniTooltip>
        {errors.email && (
          <p
            className="text-xs mt-1 flex items-center gap-1"
            style={{ color: "#ef4444" }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {errors.email}
          </p>
        )}
      </div>

      {/* 제목 */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="contact-title"
          className="text-sm font-medium"
          style={{
            color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
          }}
        >
          제목 *
        </label>
        <MiniTooltip content="문의 내용을 요약한 제목을 입력하세요">
          <input
            type="text"
            id="contact-title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="문의 제목을 입력하세요"
            title=""
            className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
            style={{
              ...inputStyle,
              ...(errors.title
                ? {
                    borderColor: "#ef4444",
                    boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)",
                  }
                : {}),
            }}
            onFocus={(e) =>
              Object.assign(
                e.target.style,
                errors.title
                  ? {
                      borderColor: "#ef4444",
                      boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)",
                    }
                  : focusStyle
              )
            }
            onBlur={(e) =>
              Object.assign(
                e.target.style,
                errors.title
                  ? {
                      ...inputStyle,
                      borderColor: "#ef4444",
                      boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)",
                    }
                  : inputStyle
              )
            }
          />
        </MiniTooltip>
        {errors.title && (
          <p
            className="text-xs mt-1 flex items-center gap-1"
            style={{ color: "#ef4444" }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {errors.title}
          </p>
        )}
      </div>

      {/* 메시지 */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="contact-message"
          className="text-sm font-medium"
          style={{
            color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
          }}
        >
          메시지 *
        </label>
        <MiniTooltip content="궁금한 점이나 제안을 자유롭게 작성하세요">
          <textarea
            key={`message-${isDark}`}
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="안녕하세요! 연락드립니다..."
            title=""
            rows={4}
            className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 resize-none"
            style={{
              ...inputStyle,
              ...(errors.message
                ? {
                    borderColor: "#ef4444",
                    boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)",
                  }
                : {}),
            }}
            onFocus={(e) =>
              Object.assign(
                e.target.style,
                errors.message
                  ? {
                      borderColor: "#ef4444",
                      boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)",
                    }
                  : focusStyle
              )
            }
            onBlur={(e) =>
              Object.assign(
                e.target.style,
                errors.message
                  ? {
                      ...inputStyle,
                      borderColor: "#ef4444",
                      boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)",
                    }
                  : inputStyle
              )
            }
          />
        </MiniTooltip>
        {errors.message && (
          <p
            className="text-xs mt-1 flex items-center gap-1"
            style={{ color: "#ef4444" }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {errors.message}
          </p>
        )}
      </div>

      {/* 전송 버튼 */}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
        style={{
          background:
            status === "success"
              ? "linear-gradient(135deg, #10b981, #059669)"
              : status === "error"
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : `linear-gradient(135deg, ${nodeColor}, ${nodeColor}cc)`,
          color: "white",
          opacity: status === "sending" ? 0.7 : 1,
          cursor: status === "sending" ? "not-allowed" : "pointer",
          boxShadow: `0 4px 20px ${nodeColor}40`,
        }}
      >
        {status === "idle" && (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            메시지 보내기
          </>
        )}
        {status === "sending" && (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            전송 중...
          </>
        )}
        {status === "success" && (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            전송 완료!
          </>
        )}
        {status === "error" && (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            전송 실패
          </>
        )}
      </button>

      {status === "success" && (
        <p className="text-center text-sm" style={{ color: "#10b981" }}>
          메시지가 성공적으로 전송되었습니다! 빠른 시일 내에 답변 드리겠습니다.
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-sm" style={{ color: "#ef4444" }}>
          전송에 실패했습니다. 잠시 후 다시 시도해주세요.
        </p>
      )}
    </form>
  );
}
