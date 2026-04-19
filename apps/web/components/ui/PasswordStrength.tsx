"use client";

function scorePassword(pw: string): number {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  if (pw.length < 10 && !/[^a-zA-Z0-9]/.test(pw)) return 2;
  if (pw.length >= 10 && /[^a-zA-Z0-9]/.test(pw)) return 4;
  return 3;
}

const LEVELS = [
  { label: "",       text: "",               bar: "" },
  { label: "Weak",   text: "text-danger",    bar: "bg-danger" },
  { label: "Fair",   text: "text-[#C47F1A]", bar: "bg-[#C47F1A]" },
  { label: "Good",   text: "text-[#4E9A6E]", bar: "bg-[#4E9A6E]" },
  { label: "Strong", text: "text-[#3D8059]", bar: "bg-[#3D8059]" },
] as const;

export function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password);
  if (!password) return null;

  const { label, text, bar } = LEVELS[score];

  return (
    <div className="mt-[5px]">
      <div className="mb-1 flex gap-[3px]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? bar : "bg-border"
            }`}
          />
        ))}
      </div>
      <span className={`text-[11px] font-medium ${text}`}>{label}</span>
    </div>
  );
}
