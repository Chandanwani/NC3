import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CloudRain, Thermometer, Droplets, Wind, Search, X,
  AlertTriangle, CloudSun, MapPin, RefreshCw
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function WeatherAlerts({ language, onClose, onAskAboutDisease }) {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isHi = language === "hi";

  const fetchWeather = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/weather/alerts?city=${encodeURIComponent(city)}`);
      if (res.data.error) {
        setError(isHi ? "शहर नहीं मिला" : "City not found");
        setData(null);
      } else {
        setData(res.data);
      }
    } catch (e) {
      setError(isHi ? "मौसम डेटा लाने में विफल" : "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) =>
    severity === "HIGH" ? "#F44336" : "#FF9800";

  const getSeverityLabel = (severity) => {
    if (isHi) return severity === "HIGH" ? "उच्च जोखिम" : "मध्यम जोखिम";
    return severity === "HIGH" ? "High Risk" : "Medium Risk";
  };

  return (
    <div className="flex flex-col h-full" data-testid="weather-alerts-panel">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: "#E5E3DB" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CloudSun className="h-5 w-5" style={{ color: "#E07A5F" }} />
            <h2 className="text-base font-semibold" style={{ fontFamily: "'Outfit', sans-serif", color: "#1A1A1A" }}>
              {isHi ? "मौसम रोग चेतावनी" : "Weather Disease Alerts"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" data-testid="close-weather-panel">
            <X className="h-4 w-4" style={{ color: "#5C5C5C" }} />
          </button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5" style={{ color: "#5C5C5C" }} />
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
              placeholder={isHi ? "शहर का नाम दर्ज करें..." : "Enter city name..."}
              className="text-sm pl-8"
              data-testid="weather-city-input"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchWeather}
            disabled={loading || !city.trim()}
            className="flex-shrink-0"
            data-testid="weather-search-button"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {error && (
            <p className="text-sm text-center py-4" style={{ color: "#F44336" }} data-testid="weather-error">
              {error}
            </p>
          )}

          {!data && !error && (
            <div className="text-center py-8" data-testid="weather-empty-state">
              <CloudRain className="h-10 w-10 mx-auto mb-3" style={{ color: "#B0BEB5" }} />
              <p className="text-sm" style={{ color: "#5C5C5C" }}>
                {isHi
                  ? "अपने क्षेत्र के मौसम आधारित रोग जोखिम देखने के लिए शहर दर्ज करें"
                  : "Enter your city to see weather-based disease risks for your area"}
              </p>
            </div>
          )}

          {data && data.weather && (
            <>
              {/* Weather Card */}
              <div
                className="rounded-xl p-4 mb-3"
                style={{ background: "linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)" }}
                data-testid="weather-card"
              >
                <p className="text-white/80 text-xs mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {data.city}, {data.country}
                </p>
                <p className="text-white text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {data.weather.temperature}°C
                </p>
                <p className="text-white/90 text-sm mb-3">
                  {isHi ? data.weather.description_hi : data.weather.description_en}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5 text-white/80 text-xs">
                    <Droplets className="h-3 w-3" />
                    <span>{data.weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/80 text-xs">
                    <CloudRain className="h-3 w-3" />
                    <span>{data.weather.precipitation}mm</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/80 text-xs">
                    <Wind className="h-3 w-3" />
                    <span>{data.weather.wind_speed}km/h</span>
                  </div>
                </div>
              </div>

              {/* Alert Count */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <AlertTriangle
                  className="h-4 w-4"
                  style={{ color: data.alerts.length > 0 ? "#F44336" : "#4CAF50" }}
                />
                <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
                  {data.alerts.length > 0
                    ? isHi
                      ? `${data.alerts.length} रोग चेतावनी सक्रिय`
                      : `${data.alerts.length} Disease Alert${data.alerts.length > 1 ? "s" : ""} Active`
                    : isHi
                      ? "कोई उच्च जोखिम नहीं"
                      : "No High-Risk Conditions"}
                </p>
              </div>

              {/* Alert Cards */}
              <div className="space-y-2">
                {data.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border p-3 transition-all hover:shadow-sm"
                    style={{ borderColor: "#E5E3DB", borderLeft: `3px solid ${getSeverityColor(alert.severity)}` }}
                    data-testid={`weather-alert-${idx}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                        {isHi ? alert.disease_hi : alert.disease_en}
                      </p>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: getSeverityColor(alert.severity) + "18",
                          color: getSeverityColor(alert.severity),
                        }}
                      >
                        {getSeverityLabel(alert.severity)}
                      </span>
                    </div>
                    <p className="text-xs mb-1" style={{ color: "#5C5C5C" }}>
                      {isHi ? alert.conditions_hi : alert.conditions_en}
                    </p>
                    <p className="text-xs mb-2" style={{ color: "#2D6A4F" }}>
                      {isHi ? "प्रभावित फसलें" : "Affected crops"}: {alert.crops}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-7 hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
                      onClick={() => {
                        const name = isHi ? alert.disease_hi : alert.disease_en;
                        onAskAboutDisease(
                          isHi
                            ? `मौसम के अनुसार ${name} का खतरा है। इसकी रोकथाम, उपचार और छिड़काव खुराक बताएं।`
                            : `Weather conditions indicate risk of ${name}. What precautions, treatment, and spray dosage should I use?`
                        );
                      }}
                      data-testid={`ask-about-alert-${idx}`}
                    >
                      {isHi ? "AI से रोकथाम पूछें" : "Ask AI for prevention"}
                    </Button>
                  </div>
                ))}
              </div>

              {data.alerts.length === 0 && (
                <div className="text-center py-4 rounded-lg" style={{ background: "#4CAF5010" }}>
                  <p className="text-sm" style={{ color: "#4CAF50" }}>
                    {isHi
                      ? "वर्तमान मौसम में कोई उच्च रोग जोखिम नहीं है।"
                      : "Current weather conditions don't pose high disease risks."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
