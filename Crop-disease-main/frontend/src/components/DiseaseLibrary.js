import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bug, ChevronRight, X, BookOpen } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DiseaseLibrary({ language, onClose, onSelectDisease }) {
  const [diseases, setDiseases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchDiseases = async () => {
    try {
      const res = await axios.get(`${API}/diseases`);
      setDiseases(res.data);
      setLoaded(true);
    } catch (e) {
      console.error("Failed to fetch diseases", e);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchDiseases();
      return;
    }
    try {
      const res = await axios.get(`${API}/diseases/search?q=${encodeURIComponent(searchQuery)}`);
      setDiseases(res.data);
      setLoaded(true);
    } catch (e) {
      console.error("Failed to search diseases", e);
    }
  };

  if (!loaded) {
    fetchDiseases();
  }

  const isHi = language === "hi";

  return (
    <div className="flex flex-col h-full" data-testid="disease-library">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: "#E5E3DB" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" style={{ color: "#2D6A4F" }} />
            <h2 className="text-base font-semibold" style={{ fontFamily: "'Outfit', sans-serif", color: "#1A1A1A" }}>
              {isHi ? "रोग पुस्तकालय" : "Disease Library"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" data-testid="close-disease-library">
            <X className="h-4 w-4" style={{ color: "#5C5C5C" }} />
          </button>
        </div>
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={isHi ? "फसल या रोग खोजें..." : "Search crop or disease..."}
            className="text-sm"
            data-testid="disease-search-input"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleSearch}
            className="flex-shrink-0"
            data-testid="disease-search-button"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Disease List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {diseases.length === 0 && loaded && (
            <p className="text-sm text-center py-8" style={{ color: "#5C5C5C" }}>
              {isHi ? "कोई रोग नहीं मिला" : "No diseases found"}
            </p>
          )}
          {diseases.map((disease) => (
            <div key={disease.id} className="rounded-lg border overflow-hidden" style={{ borderColor: "#E5E3DB" }}>
              <button
                onClick={() => setExpanded(expanded === disease.id ? null : disease.id)}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#F5F4F2] transition-colors text-left"
                data-testid={`disease-item-${disease.id}`}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#2D6A4F15" }}>
                  <Bug className="h-3.5 w-3.5" style={{ color: "#2D6A4F" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#1A1A1A" }}>
                    {isHi ? disease.name_hi : disease.name_en}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#5C5C5C" }}>
                    {disease.crop}
                  </p>
                </div>
                <ChevronRight
                  className={`h-4 w-4 flex-shrink-0 transition-transform ${expanded === disease.id ? "rotate-90" : ""}`}
                  style={{ color: "#5C5C5C" }}
                />
              </button>

              {expanded === disease.id && (
                <div className="px-3 pb-3 text-sm space-y-2" style={{ color: "#1A1A1A" }}>
                  <div>
                    <p className="font-medium text-xs mb-1" style={{ color: "#2D6A4F" }}>
                      {isHi ? "लक्षण" : "Symptoms"}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "#5C5C5C" }}>
                      {isHi ? disease.symptoms_hi : disease.symptoms_en}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-xs mb-1" style={{ color: "#2D6A4F" }}>
                      {isHi ? "उपचार" : "Treatment"}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "#5C5C5C" }}>
                      {isHi ? disease.treatment_hi : disease.treatment_en}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const name = isHi ? disease.name_hi : disease.name_en;
                      onSelectDisease(
                        isHi
                          ? `मुझे ${name} के बारे में विस्तार से बताएं - सावधानियां, उपचार और मिट्टी पर प्रभाव।`
                          : `Tell me more about ${name} - precautions, treatment, and effects on soil.`
                      );
                    }}
                    className="w-full text-white text-xs mt-1"
                    style={{ background: "#2D6A4F" }}
                    data-testid={`ask-ai-about-${disease.id}`}
                  >
                    {isHi ? "AI से पूछें" : "Ask AI about this"}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
