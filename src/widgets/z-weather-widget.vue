<template>
  <div class="weather-container">
    <div class="weather-widget">
      <!-- Loading state -->
      <div v-if="loading" class="weather-loading">
        <div class="spinner"></div>
        <p>Obteniendo ubicación...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="weather-error">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button @click="getLocation" class="retry-btn">Reintentar</button>
      </div>

      <!-- Weather data -->
      <div v-else-if="weatherData" class="weather-content">
        <div class="weather-header">
          <div class="location">
            <span class="location-icon">📍</span>
            <span class="location-name">{{ locationName }}</span>
          </div>
        </div>

        <div class="weather-main">
          <div class="temperature">
            <span class="temp-value">{{ Math.round(weatherData.current.temperature_2m) }}</span>
            <span class="temp-unit">°C</span>
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
            <span class="detail-label">Viento</span>
            <span class="detail-value">{{ Math.round(weatherData.current.wind_speed_10m) }} km/h</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">💧</span>
            <span class="detail-label">Humedad</span>
            <span class="detail-value">{{ weatherData.current.relative_humidity_2m }}%</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">🌡️</span>
            <span class="detail-label">Sensación</span>
            <span class="detail-value">{{ Math.round(weatherData.current.apparent_temperature) }}°C</span>
          </div>
        </div>

        <div class="weather-footer">
          <span class="last-update">Actualizado: {{ lastUpdate }}</span>
          <button @click="refreshWeather" class="refresh-btn">🔄</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZWeatherWidget',
  data() {
    return {
      loading: true,
      error: null,
      weatherData: null,
      locationName: '',
      latitude: null,
      longitude: null,
      lastUpdate: '',
      updateInterval: null,
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
        this.error = 'La geolocalización no está disponible en tu navegador';
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
              this.error = 'Permiso de ubicación denegado. Activa la ubicación para usar este widget.';
              break;
            case error.POSITION_UNAVAILABLE:
              this.error = 'Información de ubicación no disponible.';
              break;
            case error.TIMEOUT:
              this.error = 'Tiempo de espera agotado al obtener la ubicación.';
              break;
            default:
              this.error = 'Error desconocido al obtener la ubicación.';
          }
        }
      );
    },

    async fetchWeather(lat, lon) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error al obtener datos del clima');
        }

        this.weatherData = await response.json();
        this.updateLastUpdateTime();
        this.loading = false;
      } catch (err) {
        this.error = 'No se pudo obtener la información del clima';
        this.loading = false;
      }
    },

    async fetchLocationName(lat, lon) {
      try {
        // Usar Nominatim de OpenStreetMap para geocodificación inversa
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'ZenWDG-WeatherWidget/1.0'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Extraer ciudad o localidad
          this.locationName = data.address.city || data.address.town || data.address.village || data.address.state || 'Tu ubicación';
        } else {
          this.locationName = 'Tu ubicación';
        }
      } catch (err) {
        this.locationName = 'Tu ubicación';
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
      const descriptions = {
        0: 'Cielo despejado',
        1: 'Principalmente despejado',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla con escarcha',
        51: 'Llovizna ligera',
        53: 'Llovizna moderada',
        55: 'Llovizna densa',
        61: 'Lluvia ligera',
        63: 'Lluvia moderada',
        65: 'Lluvia fuerte',
        71: 'Nevada ligera',
        73: 'Nevada moderada',
        75: 'Nevada fuerte',
        77: 'Granizo',
        80: 'Chubascos ligeros',
        81: 'Chubascos moderados',
        82: 'Chubascos violentos',
        85: 'Chubascos de nieve ligeros',
        86: 'Chubascos de nieve fuertes',
        95: 'Tormenta eléctrica',
        96: 'Tormenta con granizo ligero',
        99: 'Tormenta con granizo fuerte',
      };
      return descriptions[code] || 'Condición desconocida';
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
  background-color: rgba(20, 20, 20, 0.4);
  backdrop-filter: blur(0.2rem);
  border-radius: 15px;
  padding: 20px;
  color: #fff;
  font-family: 'Arial', sans-serif;
}

.weather-loading,
.weather-error {
  text-align: center;
  padding: 20px;
}

.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #fff;
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
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.retry-btn:hover,
.refresh-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
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
  border-top: 1px solid rgba(255, 255, 255, 0.2);
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

.weather-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
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
