import type { DetailContentProps } from "../types";
import { useTranslation } from "react-i18next";

export function ProfileContent({ details, isDark, nodeColor }: DetailContentProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. 소개 섹션 */}
      <div className="space-y-4">
        <h3
          className="text-xl font-bold"
          style={{ color: nodeColor }}
        >
          About Me
        </h3>
        <p
          className="text-base leading-relaxed"
          style={{
            color: isDark ? "rgba(255,255,255,0.9)" : "#374151",
          }}
        >
          {details?.description}
        </p>
        {details?.extendedBio && (
          <p
            className="text-base leading-relaxed opacity-90 whitespace-pre-line"
            style={{
              color: isDark ? "rgba(255,255,255,0.8)" : "#4b5563",
            }}
          >
            {details.extendedBio}
          </p>
        )}

        {/* 개인정보 테이블 (Custom Layout) */}
        {details?.personalInfo && (
          <div
            className="mt-6 rounded-xl overflow-hidden border"
            style={{
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
            }}
          >
            <table className="w-full text-sm border-collapse">
              <tbody
                style={{
                  color: isDark ? "rgba(255,255,255,0.9)" : "#374151",
                }}
              >
                {/* Row 1: 이름 | 최민석 | 생년월일 (Rowspan 2) | 날짜 (Rowspan 2) */}
                <tr
                  style={{
                    borderBottom: isDark
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <th
                    className="px-4 py-3 font-semibold text-left w-24"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                      borderRight: isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.1)",
                      color: nodeColor,
                    }}
                  >
                    {t("modal.profile.name")}
                  </th>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{
                      borderRight: isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    {
                      details.personalInfo.find(
                        (i) => i.key === "name"
                      )?.value
                    }
                  </td>
                  <th
                    className="px-4 py-3 font-semibold text-center w-24 align-middle"
                    rowSpan={2}
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                      borderRight: isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.1)",
                      color: nodeColor,
                    }}
                  >
                    {t("modal.profile.birthDate")}
                  </th>
                  <td
                    className="px-4 py-3 font-medium align-middle"
                    rowSpan={2}
                  >
                    {
                      details.personalInfo.find(
                        (i) => i.key === "birthDate"
                      )?.value
                    }
                  </td>
                </tr>

                {/* Row 2: 전공 | 소프트웨어전공 */}
                <tr
                  style={{
                    borderBottom: isDark
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <th
                    className="px-4 py-3 font-semibold text-left"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                      borderRight: isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.1)",
                      color: nodeColor,
                    }}
                  >
                    {t("modal.profile.major")}
                  </th>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{
                      borderRight: isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    {
                      details.personalInfo.find(
                        (i) => i.key === "major"
                      )?.value
                    }
                  </td>
                </tr>

                {/* Row 3: 연락처 */}
                <tr
                  style={{
                    borderBottom: isDark
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <th
                    className="px-4 py-3 font-semibold text-left"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                      borderRight: isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.1)",
                      color: nodeColor,
                    }}
                  >
                    {t("modal.profile.contact")}
                  </th>
                  <td className="px-4 py-3 font-medium" colSpan={3}>
                    {
                      details.personalInfo.find(
                        (i) => i.key === "contact"
                      )?.value
                    }
                  </td>
                </tr>

                {/* Row 4: 이메일 */}
                <tr>
                  <th
                    className="px-4 py-3 font-semibold text-left"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                      borderRight: isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.1)",
                      color: nodeColor,
                    }}
                  >
                    {t("modal.profile.email")}
                  </th>
                  <td className="px-4 py-3 font-medium" colSpan={3}>
                    {
                      details.personalInfo.find(
                        (i) => i.key === "email"
                      )?.value
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 이력서 PDF */}
        {details?.resumeLink && (
          <a
            href={details.resumeLink}
            download
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-300 hover:scale-[1.02] active:scale-95"
            style={{
              color: nodeColor,
              borderColor: `${nodeColor}66`,
              background: `${nodeColor}14`,
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" />
            </svg>
            {t("modal.profile.resume")}
          </a>
        )}
      </div>

      {/* 2. 개발 철학 */}
      {details?.philosophy && (
        <div
          className="p-6 rounded-2xl relative overflow-hidden transition-all hover:scale-[1.01]"
          style={{
            background: isDark
              ? "rgba(59, 130, 246, 0.1)"
              : "rgba(59, 130, 246, 0.05)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="text-6xl">💭</span>
          </div>
          <h3 className="text-lg font-bold mb-3 text-blue-400 flex items-center gap-2">
            {details.philosophy.title}
          </h3>
          <p
            className="text-base italic leading-relaxed"
            style={{
              color: isDark ? "rgba(255,255,255,0.9)" : "#374151",
            }}
          >
            "{details.philosophy.content}"
          </p>
        </div>
      )}

      {/* 3. 경력 & 학력 (타임라인 스타일) */}
      {(details?.profile?.career?.length ||
        details?.profile?.education?.length) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Career */}
            {details.profile?.career &&
              details.profile.career.length > 0 && (
                <div>
                  <h3
                    className="text-lg font-bold mb-4 flex items-center gap-2"
                    style={{ color: nodeColor }}
                  >
                    <span>💼</span> Career
                  </h3>
                  <div className="space-y-6 pl-2">
                    {details.profile.career.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative pl-6 border-l-2 border-cyan-400/30 group"
                      >
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20 group-hover:ring-cyan-400/40 transition-all"></div>
                        <h4 className="font-bold text-base">
                          {item.company}
                        </h4>
                        <div className="text-sm opacity-80 mb-1 font-medium">
                          {item.role} | {item.period}
                        </div>
                        {item.description && (
                          <p className="text-sm opacity-70 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {/* Education */}
            {details.profile?.education &&
              details.profile.education.length > 0 && (
                <div>
                  <h3
                    className="text-lg font-bold mb-4 flex items-center gap-2"
                    style={{ color: nodeColor }}
                  >
                    <span>🎓</span> Education
                  </h3>
                  <div className="space-y-6 pl-2">
                    {details.profile.education.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative pl-6 border-l-2 border-cyan-400/30 group"
                      >
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20 group-hover:ring-cyan-400/40 transition-all"></div>
                        <h4 className="font-bold text-base">
                          {item.school}
                        </h4>
                        <div className="text-sm opacity-80 mb-1 font-medium">
                          {item.major} {item.status}
                        </div>
                        <div className="text-xs opacity-60">
                          {item.period}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

      {/* 4. Skills */}
      {details?.profile?.skills && (
        <div>
          <h3
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ color: nodeColor }}
          >
            <span>🛠️</span> Skills
          </h3>
          <div className="space-y-6">
            {details.profile.skills.map((group, idx) => (
              <div key={idx}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60 ml-1">
                  {group.category}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 text-sm rounded-lg border transition-all hover:scale-105 cursor-default"
                      style={{
                        background: isDark
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.03)",
                        borderColor: isDark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
