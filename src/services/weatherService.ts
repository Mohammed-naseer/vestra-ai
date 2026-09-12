import { WeatherData } from '../types';

// Standard WMO weather interpretation codes to English text
const WMO_CODE_MAP: Record<number, { text: string; icon: string }> = {
  0: { text: 'Clear Sky', icon: 'Sun' },
  1: { text: 'Mainly Clear', icon: 'SunMedium' },
  2: { text: 'Partly Cloudy', icon: 'CloudSun' },
  3: { text: 'Overcast', icon: 'Cloud' },
  45: { text: 'Foggy', icon: 'CloudFog' },
  48: { text: 'Rime Fog', icon: 'CloudFog' },
  51: { text: 'Light Drizzle', icon: 'CloudDrizzle' },
  53: { text: 'Moderate Drizzle', icon: 'CloudDrizzle' },
  55: { text: 'Dense Drizzle', icon: 'CloudDrizzle' },
  61: { text: 'Slight Rain', icon: 'CloudRain' },
  63: { text: 'Moderate Rain', icon: 'CloudRain' },
  65: { text: 'Heavy Rain', icon: 'CloudRainWind' },
  71: { text: 'Slight Snowfall', icon: 'CloudSnow' },
  73: { text: 'Moderate Snowfall', icon: 'CloudSnow' },
  75: { text: 'Heavy Snowfall', icon: 'Snowflake' },
  80: { text: 'Rain Showers', icon: 'CloudRain' },
  81: { text: 'Heavy Showers', icon: 'CloudRainWind' },
  82: { text: 'Violent Showers', icon: 'CloudLightning' },
  95: { text: 'Thunderstorm', icon: 'CloudLightning' },
};

export const PRESET_CITIES = [
  { city: 'Hyderabad', country: 'India', lat: 17.3850, lon: 78.4867 },
  { city: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.1900 },
  { city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { city: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
  { city: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { city: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050 },
];

export function getThermalProfile(tempC: number): {
  thermal: WeatherData['weatherThermal'];
  stylingTip: string;
} {
  if (tempC >= 28) {
    return {
      thermal: 'Hot',
      stylingTip: 'High heat: Prioritize ultra-breathable linen, airy silhouettes, and moisture-wicking weaves.'
    };
  } else if (tempC >= 21) {
    return {
      thermal: 'Warm',
      stylingTip: 'Pleasant warmth: Lightweight cotton tees, camp-collar shirts, and breathable trousers.'
    };
  } else if (tempC >= 15) {
    return {
      thermal: 'Mild',
      stylingTip: 'Transitional mild: Ideal for smart layering, light blazers, oxfords, and fine knits.'
    };
  } else if (tempC >= 8) {
    return {
      thermal: 'Cool',
      stylingTip: 'Crisp air: Pair structured suede jackets, cashmere sweaters, and selvedge denim.'
    };
  } else {
    return {
      thermal: 'Cold',
      stylingTip: 'Winter freeze: Rely on thermal base layers, heavy melton wool overcoats, and boots.'
    };
  }
}

export async function fetchLiveWeather(lat: number, lon: number, cityName: string, countryName?: string): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch from Open-Meteo');
    const data = await res.json();

    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const apparent = Math.round(current.apparent_temperature);
    const humidity = current.relative_humidity_2m;
    const wind = Math.round(current.wind_speed_10m);
    const code = current.weather_code;

    const condition = WMO_CODE_MAP[code]?.text || 'Clear';
    const { thermal, stylingTip } = getThermalProfile(temp);

    return {
      city: cityName,
      country: countryName,
      lat,
      lon,
      temperature: temp,
      apparentTemperature: apparent,
      humidity,
      windSpeed: wind,
      weatherCode: code,
      conditionText: condition,
      weatherThermal: thermal,
      stylingTip,
    };
  } catch (error) {
    console.warn('Live weather fetch fallback used:', error);
    // Graceful fallback to Milan fashion default if network is unavailable
    const { thermal, stylingTip } = getThermalProfile(22);
    return {
      city: cityName || 'Milan',
      country: countryName || 'Italy',
      lat: 45.4642,
      lon: 9.1900,
      temperature: 22,
      apparentTemperature: 21,
      humidity: 54,
      windSpeed: 11,
      weatherCode: 1,
      conditionText: 'Mainly Clear',
      weatherThermal: thermal,
      stylingTip,
    };
  }
}

export async function searchCityCoordinates(query: string): Promise<{ city: string; country: string; lat: number; lon: number } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const top = data.results[0];
      return {
        city: top.name,
        country: top.country || '',
        lat: top.latitude,
        lon: top.longitude,
      };
    }
    return null;
  } catch {
    return null;
  }
}
