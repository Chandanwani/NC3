import { Leaf, Bug, ShieldCheck, FlaskConical, Sprout } from "lucide-react";

export default function WelcomeScreen({ t, onSuggestion }) {
  const suggestions = [
    { text: t.suggestion1, icon: Bug, color: "#E07A5F" },
    { text: t.suggestion2, icon: ShieldCheck, color: "#2D6A4F" },
    { text: t.suggestion3, icon: FlaskConical, color: "#D35400" },
    { text: t.suggestion4, icon: Sprout, color: "#4CAF50" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8" data-testid="welcome-screen">
      {/* Logo */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)" }}
      >
        <Leaf className="h-8 w-8 text-white" />
      </div>

      {/* Title */}
      <h1
        className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3 text-center"
        style={{ fontFamily: "'Outfit', sans-serif", color: "#1A1A1A" }}
        data-testid="welcome-title"
      >
        {t.welcome}
      </h1>
      <p
        className="text-base max-w-xl text-center mb-10 leading-relaxed"
        style={{ color: "#5C5C5C", fontFamily: "'Manrope', sans-serif" }}
        data-testid="welcome-subtitle"
      >
        {t.welcomeSub}
      </p>

      {/* Suggestion Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full" data-testid="suggestion-chips">
        {suggestions.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              onClick={() => onSuggestion(s.text)}
              className="chip-hover flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-white text-left transition-all hover:shadow-md"
              style={{ borderColor: "#E5E3DB" }}
              data-testid={`suggestion-chip-${idx}`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: s.color + "15" }}
              >
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <span className="text-sm" style={{ color: "#1A1A1A", fontFamily: "'Manrope', sans-serif" }}>
                {s.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
