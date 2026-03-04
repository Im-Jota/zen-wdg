<template>
  <div class="clock-container">
    <div class="clock">
      <!-- Reloj digital -->
      <div class="time">
        <span>{{ hours }}</span>:<span>{{ minutes }}</span><!--:<span>{{ seconds }}</span>-->
      </div>
      <!-- Fecha -->
      <div class="date">
        <span>{{ dayOfWeek }}, {{ day }} {{ month }} {{ year }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getWidgetLocale } from '../i18n/widget-locales'

export default {
  name: 'ZClockWidget',
  props: {
    locale: {
      type: String,
      default: 'es'
    }
  },
  data() {
    return {
      hours: '00',
      minutes: '00',
      seconds: '00',
      dayOfWeek: '',
      day: '',
      month: '',
      year: '',
      _intervalId: null,
    };
  },
  mounted() {
    this.updateClock();
    this._intervalId = setInterval(this.updateClock, 1000);
  },
  beforeUnmount() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },
  methods: {
    updateClock() {
      const now = new Date();

      // Formatear la hora
      this.hours = now.getHours().toString().padStart(2, '0');
      this.minutes = now.getMinutes().toString().padStart(2, '0');
      this.seconds = now.getSeconds().toString().padStart(2, '0');

      // Formatear la fecha
      this.dayOfWeek = this.getDayOfWeek(now.getDay());
      this.day = now.getDate();
      this.month = this.getMonthName(now.getMonth());
      this.year = now.getFullYear();
    },
    getDayOfWeek(dayIndex) {
      const i = getWidgetLocale('clock', this.locale);
      return i.days[dayIndex];
    },
    getMonthName(monthIndex) {
      const i = getWidgetLocale('clock', this.locale);
      return i.months[monthIndex];
    },
  },
};
</script>

<style scoped>
.clock-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* Centra el reloj verticalmente */
  width: 100%;
}

.clock {
  text-align: center;
  font-family: 'Arial', sans-serif;
  color: var(--zen-text);
  background-color: var(--zen-bg);
  backdrop-filter: blur(var(--zen-blur));
  border-radius: var(--zen-radius);
  padding: 20px;
  width: 100%;
}

.time {
  font-size: 4em;
  font-weight: bold;
  color: var(--zen-text);
  display: flex;
  justify-content: center;
}

.date {
  font-size: 1.2em;
  color: var(--zen-text);
  margin-top: 10px;
}

@media (max-width: 500px) {
  .time {
    font-size: 3em;
  }
  
  .date {
    font-size: 1em;
  }
}
</style>

