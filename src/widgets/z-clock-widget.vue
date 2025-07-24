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
export default {
  name: 'ZClockWidget',
  data() {
    return {
      hours: '00',
      minutes: '00',
      seconds: '00',
      dayOfWeek: '',
      day: '',
      month: '',
      year: '',
    };
  },
  mounted() {
    this.updateClock();
    setInterval(this.updateClock, 1000); // Actualizar la hora cada segundo
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
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return days[dayIndex];
    },
    getMonthName(monthIndex) {
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return months[monthIndex];
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
  color: #333;
  background-color: rgba(20, 20, 20, .4);
  backdrop-filter: blur(.2rem);
  border-radius: 15px;
  padding: 20px;
  width: 100%;
}

.time {
  font-size: 4em;
  font-weight: bold;
  color: #fff;
  display: flex;
  justify-content: center;
}

.date {
  font-size: 1.2em;
  color: #fff;
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

