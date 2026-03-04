<template>
  <div class="weather-container">
    <div class="weather-widget">
      <!-- Loading state -->
      <div v-if="loading" class="weather-loading">
        <div class="spinner"></div>
        <p>{{ i18n.loading }}</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="weather-error">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button @click="getLocation" class="retry-btn">{{ i18n.retry }}</button>
      </div>

      <!-- Weather data -->
      <div v-else-if="weatherData" class="weather-content">
        <div class="weather-header">
          <div class="location">
            <span class="location-icon">📍</span>
            <span class="location-name">{{ locationName }}</span>
          </div>
          <button class="unit-toggle" @click="toggleUnit">
            °{{ unit === 'celsius' ? 'C' : 'F' }}
          </button>
        </div>

        <div class="weather-main">
          <div class="temperature">
            <span class="temp-value">{{ displayTemp(weatherData.current.temperature_2m) }}</span>
            <span class="temp-unit">°{{ unit === 'celsius' ? 'C' : 'F' }}</span>
          </div>
          <div class="weather-icon">
            {{ getWeatherIcon(weatherData.current.weather_code) }}
          </div>
        </div>

        <div class="weather-description">
          {{ getWeatherDescription(weatherData.current.weather_code) }}
        </div>

        <div class="weather-details">
          <div class="detail-item">
            <span class="detail-icon">💨</span>
            <span class="detail-label">{{ i18n.wind }}</span>
            <span class="detail-value">{{ Math.round(weatherData.current.wind_speed_10m) }} km/h</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">💧</span>
            <span class="detail-label">{{ i18n.humidity }}</span>
            <span class="detail-value">{{ weatherData.current.relative_humidity_2m }}%</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">🌡️</span>
            <span class="detail-label">{{ i18n.feelsLike }}</span>
            <span class="detail-value">{{ displayTemp(weatherData.current.apparent_temperature) }}°{{ unit === 'celsius' ? 'C' : 'F' }}</span>
          </div>
        </div>

        <!-- 5-Day Forecast -->
        <div v-if="forecastDays.length" class="forecast-section">
          <div class="section-title">{{ i18n.fiveDayForecast }}</div>
          <div class="forecast-list">
            <div v-for="(day, idx) in forecastDays" :key="day.date" class="forecast-day">
              <span class="forecast-day-name">{{ idx === 0 ? i18n.today : getDayName(day.date) }}</span>
              <span class="forecast-icon">{{ getWeatherIcon(day.weatherCode) }}</span>
              <span class="forecast-temps">
                <span class="forecast-max">{{ displayTemp(day.maxTemp) }}°</span>
                <span class="forecast-min">{{ displayTemp(day.minTemp) }}°</span>
              </span>
              <span class="forecast-precip" v-if="day.precipitation > 0">💧{{ day.precipitation }}mm</span>
            </div>
          </div>
        </div>

        <!-- Temperature Graph -->
        <div v-if="forecastDays.length" class="graph-section">
          <div class="section-title">{{ i18n.tempGraph }}</div>
          <svg class="temp-graph" viewBox="0 0 300 100" preserveAspectRatio="none">
            <polyline
              :points="graphMaxPoints"
              fill="none"
              stroke="#ef4444"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline
              :points="graphMinPoints"
              fill="none"
              stroke="#3b82f6"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <g v-for="(day, idx) in forecastDays" :key="'dot-max-'+idx">
              <circle :cx="idx * 75" :cy="graphMaxY(day.maxTemp)" r="3" fill="#ef4444" />
              <text :x="idx * 75" :y="graphMaxY(day.maxTemp) - 8" text-anchor="middle" class="graph-label max-label">{{ displayTemp(day.maxTemp) }}°</text>
            </g>
            <g v-for="(day, idx) in forecastDays" :key="'dot-min-'+idx">
              <circle :cx="idx * 75" :cy="graphMinY(day.minTemp)" r="3" fill="#3b82f6" />
              <text :x="idx * 75" :y="graphMinY(day.minTemp) + 14" text-anchor="middle" class="graph-label min-label">{{ displayTemp(day.minTemp) }}°</text>
            </g>
          </svg>
          <div class="graph-day-labels">
            <span v-for="(day, idx) in forecastDays" :key="'lbl-'+idx" class="graph-day-label">
              {{ idx === 0 ? i18n.today : getDayName(day.date) }}
            </span>
          </div>
        </div>

        <div class="weather-footer">
          <span class="last-update">{{ i18n.updated }}: {{ lastUpdate }}</span>
          <button @click="refreshWeather" class="refresh-btn">🔄</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getWidgetLocale } from '../i18n/widget-locales'

export default {
  name: 'ZWeatherWidget',
  props: {
    locale: {
      type: String,
      default: 'es'
    }
  },
  computed: {
    i18n() {
      return getWidgetLocale('weather', this.locale);
    },
    graphTempRange() {
      if (!this.forecastDays.length) return { min: 0, max: 1 };
      const allMax = this.forecastDays.map(d => this.toDisplayUnit(d.maxTemp));
      const allMin = this.forecastDays.map(d => this.toDisplayUnit(d.minTemp));
      const min = Math.min(...allMin) - 2;
      const max = Math.max(...allMax) + 2;
      return { min, max: max === min ? max + 1 : max };
    },
    graphMaxPoints() {
      return this.forecastDays.map((d, i) =>
        `${i * 75},${this.graphMaxY(d.maxTemp)}`
      ).join(' ');
    },
    graphMinPoints() {
      return this.forecastDays.map((d, i) =>
        `${i * 75},${this.graphMinY(d.minTemp)}`
      ).join(' ');
    }
  },
  data() {
    const savedUnit = localStorage.getItem('weather_unit') || 'celsius';
    return {
      loading: true,
      error: null,
      weatherData: null,
      locationName: '',
      latitude: null,
      longitude: null,
      lastUpdate: '',
      updateInterval: null,
      unit: savedUnit,
      forecastDays: [],
    };
  },
  mounted() {
    this.getLocation();
    // Actualizar cada 10 minutos
    this.updateInterval = setInterval(() => {
      if (this.latitude && this.longitude) {
        this.fetchWeather(this.latitude, this.longitude);
      }
    }, 600000);
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  },
  methods: {
    getLocation() {
      this.loading = true;
      this.error = null;

      if (!navigator.geolocation) {
        this.error = this.i18n.errorNoGeo;
        this.loading = false;
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.fetchWeather(this.latitude, this.longitude);
          this.fetchLocationName(this.latitude, this.longitude);
        },
        (error) => {
          this.loading = false;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              this.error = this.i18n.errorDenied;
              break;
            case error.POSITION_UNAVAILABLE:
              this.error = this.i18n.errorUnavailable;
              break;
            case error.TIMEOUT:
              this.error = this.i18n.errorTimeout;
              break;
            default:
              this.error = this.i18n.errorUnknown;
          }
        }
      );
    },

    async fetchWeather(lat, lon) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&forecast_days=5&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(this.i18n.errorFetch);
        }

        this.weatherData = await response.json();
        this.parseForecast();
        this.updateLastUpdateTime();
        this.loading = false;
      } catch (err) {
        this.error = this.i18n.errorFetch;
        this.loading = false;
      }
    },

    parseForecast() {
      const daily = this.weatherData.daily;
      if (!daily) { this.forecastDays = []; return; }
      this.forecastDays = daily.time.map((date, i) => ({
        date,
        maxTemp: daily.temperature_2m_max[i],
        minTemp: daily.temperature_2m_min[i],
        weatherCode: daily.weather_code[i],
        precipitation: daily.precipitation_sum[i],
      }));
    },

    async fetchLocationName(lat, lon) {
      try {
        // Generar clave de cache basada en coordenadas redondeadas
        const cacheKey = this.generateCacheKey(lat, lon);
        
        // Intentar obtener del cache primero
        const cachedLocation = this.getLocationFromCache(cacheKey);
        if (cachedLocation) {
          this.locationName = cachedLocation;
          return;
        }

        // Si no está en cache, hacer request a Nominatim
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'ZenWDG-WeatherWidget/1.0'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Extraer ciudad o localidad
          const cityName = data.address.city || data.address.town || data.address.village || data.address.state || this.i18n.yourLocation;
          this.locationName = cityName;
          
          // Guardar en cache
          this.saveLocationToCache(cacheKey, cityName);
        } else {
          this.locationName = this.i18n.yourLocation;
        }
      } catch (err) {
        this.locationName = this.i18n.yourLocation;
      }
    },

    generateCacheKey(lat, lon) {
      // Redondear a 2 decimales para agrupar ubicaciones cercanas (~1km de precisión)
      const roundedLat = Math.round(lat * 100) / 100;
      const roundedLon = Math.round(lon * 100) / 100;
      return `${roundedLat},${roundedLon}`;
    },

    getLocationFromCache(cacheKey) {
      try {
        const cache = localStorage.getItem('weather_location_cache');
        if (!cache) return null;
        
        const cacheData = JSON.parse(cache);
        const entry = cacheData[cacheKey];
        
        if (!entry) return null;
        
        // Verificar si el cache ha expirado (30 días)
        const now = Date.now();
        const cacheAge = now - entry.timestamp;
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días en milisegundos
        
        if (cacheAge > maxAge) {
          // Cache expirado, eliminarlo
          delete cacheData[cacheKey];
          localStorage.setItem('weather_location_cache', JSON.stringify(cacheData));
          return null;
        }
        
        return entry.name;
      } catch (err) {
        console.warn('Error al leer cache de ubicaciones:', err);
        return null;
      }
    },

    saveLocationToCache(cacheKey, locationName) {
      try {
        let cacheData = {};
        const existingCache = localStorage.getItem('weather_location_cache');
        
        if (existingCache) {
          cacheData = JSON.parse(existingCache);
        }
        
        // Guardar con timestamp
        cacheData[cacheKey] = {
          name: locationName,
          timestamp: Date.now()
        };
        
        // Limitar el tamaño del cache a 100 entradas
        const entries = Object.entries(cacheData);
        if (entries.length > 100) {
          // Ordenar por timestamp y mantener solo las 100 más recientes
          entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
          cacheData = Object.fromEntries(entries.slice(0, 100));
        }
        
        localStorage.setItem('weather_location_cache', JSON.stringify(cacheData));
      } catch (err) {
        console.warn('Error al guardar en cache de ubicaciones:', err);
      }
    },

    refreshWeather() {
      if (this.latitude && this.longitude) {
        this.loading = true;
        this.fetchWeather(this.latitude, this.longitude);
      } else {
        this.getLocation();
      }
    },

    updateLastUpdateTime() {
      const now = new Date();
      this.lastUpdate = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    },

    getWeatherIcon(code) {
      // WMO Weather interpretation codes
      const weatherIcons = {
        0: '☀️',    // Clear sky
        1: '🌤️',   // Mainly clear
        2: '⛅',   // Partly cloudy
        3: '☁️',   // Overcast
        45: '🌫️',  // Fog
        48: '🌫️',  // Depositing rime fog
        51: '🌦️',  // Light drizzle
        53: '🌦️',  // Moderate drizzle
        55: '🌧️',  // Dense drizzle
        61: '🌧️',  // Slight rain
        63: '🌧️',  // Moderate rain
        65: '🌧️',  // Heavy rain
        71: '🌨️',  // Slight snow
        73: '🌨️',  // Moderate snow
        75: '❄️',  // Heavy snow
        77: '🌨️',  // Snow grains
        80: '🌦️',  // Slight rain showers
        81: '🌧️',  // Moderate rain showers
        82: '⛈️',  // Violent rain showers
        85: '🌨️',  // Slight snow showers
        86: '❄️',  // Heavy snow showers
        95: '⛈️',  // Thunderstorm
        96: '⛈️',  // Thunderstorm with slight hail
        99: '⛈️',  // Thunderstorm with heavy hail
      };
      return weatherIcons[code] || '🌤️';
    },

    getWeatherDescription(code) {
      const desc = this.i18n.descriptions;
      return desc[code] || desc.unknown || code;
    },

    // Unit toggle
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius';
      localStorage.setItem('weather_unit', this.unit);
    },
    toDisplayUnit(tempC) {
      if (this.unit === 'fahrenheit') return Math.round(tempC * 9 / 5 + 32);
      return Math.round(tempC);
    },
    displayTemp(tempC) {
      return this.toDisplayUnit(tempC);
    },

    // Forecast helpers
    getDayName(dateStr) {
      const d = new Date(dateStr + 'T00:00:00');
      return this.i18n.dayNames[d.getDay()];
    },

    // Graph helpers
    graphMaxY(tempC) {
      const { min, max } = this.graphTempRange;
      const val = this.toDisplayUnit(tempC);
      return 85 - ((val - min) / (max - min)) * 70;
    },
    graphMinY(tempC) {
      const { min, max } = this.graphTempRange;
      const val = this.toDisplayUnit(tempC);
      return 85 - ((val - min) / (max - min)) * 70;
    },
  },
};
</script>

<style scoped>
.weather-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 10px;
}

.weather-widget {
  width: 100%;
  max-width: 400px;
  background-color: var(--zen-bg);
  backdrop-filter: blur(var(--zen-blur));
  border-radius: var(--zen-radius);
  padding: 20px;
  color: var(--zen-text);
  font-family: 'Arial', sans-serif;
}

.weather-loading,
.weather-error {
  text-align: center;
  padding: 20px;
}

.spinner {
  border: 3px solid var(--zen-border-light);
  border-top: 3px solid var(--zen-text);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.weather-error {
  color: #ffcccc;
}

.error-icon {
  font-size: 2em;
  display: block;
  margin-bottom: 10px;
}

.retry-btn,
.refresh-btn {
  background-color: var(--zen-hover);
  border: 1px solid var(--zen-border-light);
  color: var(--zen-text);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.retry-btn:hover,
.refresh-btn:hover {
  background-color: var(--zen-active);
}

.weather-header {
  margin-bottom: 15px;
}

.location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1em;
}

.location-icon {
  font-size: 1.2em;
}

.weather-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.temperature {
  display: flex;
  align-items: flex-start;
}

.temp-value {
  font-size: 4em;
  font-weight: bold;
  line-height: 1;
}

.temp-unit {
  font-size: 2em;
  margin-top: 10px;
  margin-left: 5px;
  opacity: 0.8;
}

.weather-icon {
  font-size: 4em;
}

.weather-description {
  text-align: center;
  font-size: 1.3em;
  margin-bottom: 20px;
  text-transform: capitalize;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--zen-border);
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.detail-icon {
  font-size: 1.5em;
}

.detail-label {
  font-size: 0.8em;
  opacity: 0.7;
}

.detail-value {
  font-size: 1em;
  font-weight: bold;
}

/* Unit toggle */
.unit-toggle {
  background: var(--zen-hover);
  border: 1px solid var(--zen-border-light);
  color: var(--zen-text);
  padding: 4px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: background-color 0.2s;
}

.unit-toggle:hover {
  background: var(--zen-active);
}

/* Forecast section */
.forecast-section,
.graph-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--zen-border);
}

.section-title {
  font-size: 0.9em;
  font-weight: 600;
  opacity: 0.8;
  margin-bottom: 10px;
}

.forecast-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.forecast-day {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.forecast-day:hover {
  background: var(--zen-hover);
}

.forecast-day-name {
  width: 45px;
  font-size: 0.9em;
  font-weight: 500;
  flex-shrink: 0;
}

.forecast-icon {
  font-size: 1.3em;
  flex-shrink: 0;
}

.forecast-temps {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
  font-size: 0.95em;
}

.forecast-max {
  font-weight: 600;
  color: #ef4444;
}

.forecast-min {
  opacity: 0.6;
  color: #3b82f6;
}

.forecast-precip {
  font-size: 0.8em;
  opacity: 0.7;
  flex-shrink: 0;
  width: 55px;
  text-align: right;
}

/* Temperature graph */
.temp-graph {
  width: 100%;
  height: 100px;
  margin-top: 8px;
  overflow: visible;
  padding: 0 15px;
}

.graph-label {
  font-size: 8px;
  fill: var(--zen-text);
  opacity: 0.8;
}

.max-label {
  fill: #ef4444;
}

.min-label {
  fill: #3b82f6;
}

.graph-day-labels {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.graph-day-label {
  font-size: 0.75em;
  opacity: 0.6;
  text-align: center;
  flex: 1;
}

.weather-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--zen-border);
}

.last-update {
  font-size: 0.85em;
  opacity: 0.7;
}

.refresh-btn {
  padding: 6px 12px;
  font-size: 1.2em;
  margin-top: 0;
}

@media (max-width: 500px) {
  .temp-value {
    font-size: 3em;
  }

  .temp-unit {
    font-size: 1.5em;
  }

  .weather-icon {
    font-size: 3em;
  }

  .weather-description {
    font-size: 1.1em;
  }

  .weather-details {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .detail-item {
    font-size: 0.9em;
  }
}
</style>
