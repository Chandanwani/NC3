import { ShieldCheck, FlaskConical, Sprout, Leaf, Lightbulb, ShoppingCart, Droplets } from "lucide-react";

const CHIPS = {
  en: [
    { text: "Show spray dosage per acre", icon: Droplets, color: "#2D6A4F" },
    { text: "Effect on soil health", icon: Sprout, color: "#4CAF50" },
    { text: "Suggest best brands to buy", icon: ShoppingCart, color: "#E07A5F" },
    { text: "Organic alternatives with dosage", icon: Leaf, color: "#1B4332" },
    { text: "Fertilizer recommendation", icon: FlaskConical, color: "#D35400" },
    { text: "Show precautions", icon: ShieldCheck, color: "#5C5C5C" },
  ],
  hi: [
    { text: "प्रति एकड़ छिड़काव खुराक बताएं", icon: Droplets, color: "#2D6A4F" },
    { text: "मिट्टी के स्वास्थ्य पर प्रभाव", icon: Sprout, color: "#4CAF50" },
    { text: "खरीदने के लिए सर्वोत्तम ब्रांड सुझाएं", icon: ShoppingCart, color: "#E07A5F" },
    { text: "जैविक विकल्प खुराक सहित", icon: Leaf, color: "#1B4332" },
    { text: "उर्वरक सिफारिश", icon: FlaskConical, color: "#D35400" },
    { text: "सावधानियां दिखाएं", icon: ShieldCheck, color: "#5C5C5C" },
  ],
};

export default function QuickReplyChips({ language, onChipClick }) {
  const chips = CHIPS[language] || CHIPS.en;

  return (
    <div className="flex flex-wrap gap-2 mt-2 ml-11" data-testid="quick-reply-chips">
      {chips.map((chip, idx) => {
        const Icon = chip.icon;
        return (
          <button
            key={idx}
            onClick={() => onChipClick(chip.text)}
            className="chip-hover flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:shadow-sm"
            style={{
              borderColor: "#E5E3DB",
              background: chip.color + "08",
              color: chip.color,
            }}
            data-testid={`quick-chip-${idx}`}
          >
            <Icon className="h-3 w-3" />
            {chip.text}
          </button>
        );
      })}
    </div>
  );
}
