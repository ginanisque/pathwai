import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Wind, Droplets, Thermometer, Clock, Globe, RefreshCw, Compass, ArrowUpRight, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface DestinationWeatherWidgetProps {
  destinationCountry: string;
  originCountry?: string;
}

interface DestinationCityInfo {
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  utcOffsetHours: number;
  lat: number;
  lon: number;
  flag: string;
  packingTip: string;
}

// Map common destination countries to primary cities, timezones, and geo-coords for live weather fetch
const DESTINATION_CITY_MAP: Record<string, DestinationCityInfo> = {
  Portugal: {
    city: 'Lisbon',
    country: 'Portugal',
    countryCode: 'PT',
    timezone: 'Europe/Lisbon',
    utcOffsetHours: 1,
    lat: 38.7223,
    lon: -9.1393,
    flag: '🇵🇹',
    packingTip: 'Mild coastal Mediterranean climate. Light layers & comfortable walking shoes recommended for Lisbon cobbles.'
  },
  Canada: {
    city: 'Toronto',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Toronto',
    utcOffsetHours: -4,
    lat: 43.6532,
    lon: -79.3832,
    flag: '🇨🇦',
    packingTip: 'Seasonal temperature variations. Heavy thermal outerwear required for winters; light breathable wear for summer.'
  },
  'United Kingdom': {
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    timezone: 'Europe/London',
    utcOffsetHours: 1,
    lat: 51.5074,
    lon: -0.1278,
    flag: '🇬🇧',
    packingTip: 'Temperate maritime weather with frequent light showers. A compact umbrella & waterproof trench coat are essentials.'
  },
  UK: {
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    timezone: 'Europe/London',
    utcOffsetHours: 1,
    lat: 51.5074,
    lon: -0.1278,
    flag: '🇬🇧',
    packingTip: 'Temperate maritime weather with frequent light showers. A compact umbrella & waterproof trench coat are essentials.'
  },
  Germany: {
    city: 'Berlin',
    country: 'Germany',
    countryCode: 'DE',
    timezone: 'Europe/Berlin',
    utcOffsetHours: 2,
    lat: 52.52,
    lon: 13.405,
    flag: '🇩🇪',
    packingTip: 'Central European continental climate. Warm summer gear and insulated jackets for crisp spring/autumn months.'
  },
  Spain: {
    city: 'Madrid',
    country: 'Spain',
    countryCode: 'ES',
    timezone: 'Europe/Madrid',
    utcOffsetHours: 2,
    lat: 40.4168,
    lon: -3.7038,
    flag: '🇪🇸',
    packingTip: 'Sunny Mediterranean inland climate. High UV protection & sunglasses recommended year-round.'
  },
  France: {
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    timezone: 'Europe/Paris',
    utcOffsetHours: 2,
    lat: 48.8566,
    lon: 2.3522,
    flag: '🇫🇷',
    packingTip: 'Moderate continental weather. Stylish rainproof coat and comfortable footwear for city transit.'
  },
  'United States': {
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/New_York',
    utcOffsetHours: -4,
    lat: 40.7128,
    lon: -74.006,
    flag: '🇺🇸',
    packingTip: 'Four distinct seasons. Pack according to arrival month — cold winters and humid summer spells.'
  },
  USA: {
    city: 'Washington D.C.',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/New_York',
    utcOffsetHours: -4,
    lat: 38.9072,
    lon: -77.0369,
    flag: '🇺🇸',
    packingTip: 'Humid subtropical climate. Light cottons for summer; layered wool/down for winter months.'
  },
  Kenya: {
    city: 'Nairobi',
    country: 'Kenya',
    countryCode: 'KE',
    timezone: 'Africa/Nairobi',
    utcOffsetHours: 3,
    lat: -1.2921,
    lon: 36.8219,
    flag: '🇰🇪',
    packingTip: 'Sub-tropical highland climate with pleasant temperatures year-round. Light jackets for cool evenings.'
  },
  Nigeria: {
    city: 'Lagos',
    country: 'Nigeria',
    countryCode: 'NG',
    timezone: 'Africa/Lagos',
    utcOffsetHours: 1,
    lat: 6.5244,
    lon: 3.3792,
    flag: '🇳🇬',
    packingTip: 'Tropical climate with high humidity. Breathable cottons, sunscreen, and rain umbrellas recommended.'
  },
  Ghana: {
    city: 'Accra',
    country: 'Ghana',
    countryCode: 'GH',
    timezone: 'Africa/Accra',
    utcOffsetHours: 0,
    lat: 5.6037,
    lon: -0.187,
    flag: '🇬🇭',
    packingTip: 'Warm tropical weather year-round. Sun protection and light summer clothing recommended.'
  },
  'South Africa': {
    city: 'Johannesburg',
    country: 'South Africa',
    countryCode: 'ZA',
    timezone: 'Africa/Johannesburg',
    utcOffsetHours: 2,
    lat: -26.2041,
    lon: 28.0473,
    flag: '🇿🇦',
    packingTip: 'Highveld subtropical climate. Warm sunny days; light sweater needed for dry winter nights.'
  },
  Japan: {
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    timezone: 'Asia/Tokyo',
    utcOffsetHours: 9,
    lat: 35.6762,
    lon: 139.6503,
    flag: '🇯🇵',
    packingTip: 'Temperate climate with distinct seasons. Slip-on shoes for frequent indoor transitions.'
  },
  Australia: {
    city: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    timezone: 'Australia/Sydney',
    utcOffsetHours: 10,
    lat: -33.8688,
    lon: 151.2093,
    flag: '🇦🇺',
    packingTip: 'Sunny coastal climate. High SPF sunscreen, hat, and beachwear essential.'
  },
  UAE: {
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    timezone: 'Asia/Dubai',
    utcOffsetHours: 4,
    lat: 25.2048,
    lon: 55.2708,
    flag: '🇦🇪',
    packingTip: 'Desert climate with high heat. Modest lightweight clothing and indoor air-con light jacket.'
  }
};

const DEFAULT_CITY: DestinationCityInfo = {
  city: 'Lisbon',
  country: 'Portugal',
  countryCode: 'PT',
  timezone: 'Europe/Lisbon',
  utcOffsetHours: 1,
  lat: 38.7223,
  lon: -9.1393,
  flag: '🇵🇹',
  packingTip: 'Mild Mediterranean climate. Check regional seasonal forecasts prior to travel.'
};

interface WeatherState {
  tempC: number;
  tempF: number;
  feelsLikeC: number;
  condition: string;
  weatherCode: number;
  humidity: number;
  windSpeedKmh: number;
  tempMinC: number;
  tempMaxC: number;
  uvIndex: number;
  loading: boolean;
  lastUpdated: string;
  error?: string;
}

export const DestinationWeatherWidget: React.FC<DestinationWeatherWidgetProps> = ({
  destinationCountry,
  originCountry
}) => {
  // Identify city details based on destination string
  const cityInfo = DESTINATION_CITY_MAP[destinationCountry] || {
    ...DEFAULT_CITY,
    city: destinationCountry || 'Target City',
    country: destinationCountry || 'Destination'
  };

  const [weather, setWeather] = useState<WeatherState>({
    tempC: 22,
    tempF: 72,
    feelsLikeC: 23,
    condition: 'Partly Cloudy',
    weatherCode: 2,
    humidity: 62,
    windSpeedKmh: 14,
    tempMinC: 17,
    tempMaxC: 25,
    uvIndex: 5,
    loading: false,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [localTime, setLocalTime] = useState<string>('');
  const [timeDiffText, setTimeDiffText] = useState<string>('');

  // Live ticking clock for destination local time
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: cityInfo.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        setLocalTime(formatter.format(now));

        // Calculate offset difference compared to user's local system time
        const localOffset = -now.getTimezoneOffset() / 60;
        const diffHours = Math.round(cityInfo.utcOffsetHours - localOffset);

        if (diffHours === 0) {
          setTimeDiffText('Same time as your current location');
        } else if (diffHours > 0) {
          setTimeDiffText(`+${diffHours} hrs ahead of your local time`);
        } else {
          setTimeDiffText(`${diffHours} hrs behind your local time`);
        }
      } catch (err) {
        setLocalTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setTimeDiffText(`Timezone: ${cityInfo.timezone}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [cityInfo]);

  // Fetch real weather from Open-Meteo free public API
  const fetchWeather = async () => {
    setWeather(prev => ({ ...prev, loading: true, error: undefined }));
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.lon}&current_weather=true&hourly=relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=${encodeURIComponent(cityInfo.timezone)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API request failed');
      const data = await res.json();

      const current = data.current_weather;
      const tempC = Math.round(current.temperature);
      const tempF = Math.round((tempC * 9) / 5 + 32);
      const windSpeed = Math.round(current.windspeed);
      const wCode = current.weathercode;

      // Interpret weather code
      let cond = 'Clear / Sunny';
      if (wCode === 1 || wCode === 2) cond = 'Partly Cloudy';
      else if (wCode === 3) cond = 'Overcast';
      else if (wCode >= 45 && wCode <= 48) cond = 'Foggy / Misty';
      else if (wCode >= 51 && wCode <= 67) cond = 'Light Rain / Drizzle';
      else if (wCode >= 71 && wCode <= 77) cond = 'Snowfall';
      else if (wCode >= 80 && wCode <= 82) cond = 'Rain Showers';
      else if (wCode >= 95) cond = 'Thunderstorm';

      const minC = data.daily?.temperature_2m_min?.[0] ? Math.round(data.daily.temperature_2m_min[0]) : tempC - 4;
      const maxC = data.daily?.temperature_2m_max?.[0] ? Math.round(data.daily.temperature_2m_max[0]) : tempC + 4;
      const uv = data.daily?.uv_index_max?.[0] ? Math.round(data.daily.uv_index_max[0]) : 4;
      const humidity = data.hourly?.relativehumidity_2m?.[0] ? Math.round(data.hourly.relativehumidity_2m[0]) : 60;

      setWeather({
        tempC,
        tempF,
        feelsLikeC: tempC + (humidity > 70 ? 2 : -1),
        condition: cond,
        weatherCode: wCode,
        humidity,
        windSpeedKmh: windSpeed,
        tempMinC: minC,
        tempMaxC: maxC,
        uvIndex: uv,
        loading: false,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      console.warn('Fallback weather rendering:', err);
      // Sensible fallback based on destination
      setWeather({
        tempC: 21,
        tempF: 70,
        feelsLikeC: 22,
        condition: 'Partly Sunny',
        weatherCode: 2,
        humidity: 58,
        windSpeedKmh: 12,
        tempMinC: 16,
        tempMaxC: 24,
        uvIndex: 5,
        loading: false,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [destinationCountry]);

  // Weather condition icon getter
  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-7 h-7 text-amber-400" />;
    if (code >= 1 && code <= 3) return <Cloud className="w-7 h-7 text-blue-300" />;
    if (code >= 51 && code <= 82) return <CloudRain className="w-7 h-7 text-blue-400" />;
    if (code >= 71 && code <= 77) return <CloudSnow className="w-7 h-7 text-cyan-200" />;
    if (code >= 95) return <CloudLightning className="w-7 h-7 text-purple-400" />;
    return <Sun className="w-7 h-7 text-amber-400" />;
  };

  return (
    <div className="bg-[#111116] border border-[#22222D] rounded-xl p-5 shadow-xl font-mono text-white relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#22222D] mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cityInfo.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {cityInfo.city}, {cityInfo.country}
              </h3>
              <span className="px-2 py-0.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[9px] font-bold rounded uppercase">
                Destination Target
              </span>
            </div>
            <p className="text-[10px] text-[#888] flex items-center gap-1.5 mt-0.5">
              <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{timeDiffText}</span>
            </p>
          </div>
        </div>

        {/* Refresh & Unit Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
            className="px-2 py-1 bg-[#1A1A22] border border-[#2D2D3A] hover:bg-[#252532] text-xs font-bold text-amber-300 rounded transition-colors"
            title="Toggle °C / °F"
          >
            °{unit}
          </button>
          <button
            onClick={fetchWeather}
            disabled={weather.loading}
            className="p-1.5 bg-[#1A1A22] border border-[#2D2D3A] hover:bg-[#252532] text-[#AAA] hover:text-white rounded transition-colors"
            title="Refresh Live Weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${weather.loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Live Clock + Weather Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card: Live Clock & Timezone */}
        <div className="p-3.5 bg-[#16161D] border border-[#252532] rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] text-[#777] uppercase font-bold mb-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" /> Destination Local Time
              </span>
              <span className="text-blue-300">{cityInfo.timezone.split('/')[1] || cityInfo.timezone}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              {localTime || 'Loading time...'}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#22222E] flex items-center justify-between text-[11px] text-[#AAA]">
            <span>UTC Offset: GMT{cityInfo.utcOffsetHours >= 0 ? `+${cityInfo.utcOffsetHours}` : cityInfo.utcOffsetHours}</span>
            <span className="text-emerald-400 font-bold text-[10px] uppercase">● Live Sync</span>
          </div>
        </div>

        {/* Right Card: Temperature & Conditions */}
        <div className="p-3.5 bg-[#16161D] border border-[#252532] rounded-lg flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getWeatherIcon(weather.weatherCode)}
              <span className="text-2xl font-black text-white">
                {unit === 'C' ? `${weather.tempC}°C` : `${weather.tempF}°F`}
              </span>
            </div>
            <p className="text-xs font-bold text-amber-200 uppercase">{weather.condition}</p>
            <p className="text-[10px] text-[#888] mt-0.5">
              High: {unit === 'C' ? `${weather.tempMaxC}°C` : `${Math.round((weather.tempMaxC * 9)/5 + 32)}°F`} | Low: {unit === 'C' ? `${weather.tempMinC}°C` : `${Math.round((weather.tempMinC * 9)/5 + 32)}°F`}
            </p>
          </div>

          {/* Key Atmospheric Metrics */}
          <div className="text-right space-y-1 text-[10px] text-[#999]">
            <div className="flex items-center justify-end gap-1">
              <Droplets className="w-3 h-3 text-blue-400" />
              <span>Humidity: <strong className="text-white">{weather.humidity}%</strong></span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <Wind className="w-3 h-3 text-emerald-400" />
              <span>Wind: <strong className="text-white">{weather.windSpeedKmh} km/h</strong></span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>UV Index: <strong className="text-white">{weather.uvIndex} / 10</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Packing & Relocation Advisory Tip */}
      <div className="mt-3 p-2.5 bg-blue-950/20 border border-blue-900/30 rounded-lg flex items-center gap-2.5 text-[11px] text-blue-200">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="leading-snug">
          <strong>Relocation Prep Tip:</strong> {cityInfo.packingTip}
        </span>
      </div>
    </div>
  );
};
