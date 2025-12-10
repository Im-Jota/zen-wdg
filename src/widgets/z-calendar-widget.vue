<template>
  <div class="calendar-container" :class="theme === 'dark' ? 'dark' : 'light'">
    <!-- Header con filtros -->
    <div class="calendar-header">
      <div class="view-selector">
        <button 
          v-for="view in ['day', 'week', 'month']" 
          :key="view"
          :class="['view-btn', { active: currentView === view }]"
          @click="currentView = view"
        >
          {{ viewLabels[view] }}
        </button>
      </div>
      <div class="navigation">
        <button @click="previousPeriod" class="nav-btn">‹</button>
        <span class="current-date">{{ currentDateLabel }}</span>
        <button @click="nextPeriod" class="nav-btn">›</button>
        <button @click="goToToday" class="today-btn">Hoy</button>
      </div>
      <button @click="showEventModal = true" class="add-event-btn">+ Evento</button>
    </div>

    <!-- Vista del calendario -->
    <div class="calendar-view">
      <!-- Vista de Día -->
      <div v-show="currentView === 'day'" class="zcal-day-view">
        <div class="time-grid">
          <div v-for="hour in 24" :key="hour" class="hour-slot">
            <div class="hour-label">{{ formatHour(hour - 1) }}</div>
            <div class="hour-content">
              <div 
                v-for="event in getEventsForHour(formatDate(currentDate), hour - 1)" 
                :key="event.id"
                class="event-card"
                :style="{ backgroundColor: event.color }"
                @click="editEvent(event)"
              >
                <div class="event-title">{{ event.name }}</div>
                <div class="event-time">{{ event.startTime }} - {{ event.endTime }}</div>
                <div v-if="event.isRecurring" class="event-recurring">🔁</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de Semana -->
      <div v-show="currentView === 'week'" class="zcal-week-view">
        <div class="week-header">
          <div class="week-time-label"></div>
          <div v-for="day in weekDays" :key="day.date" class="week-day-header">
            <div class="day-name">{{ day.name }}</div>
            <div class="day-number" :class="{ today: isToday(day.date) }">{{ day.number }}</div>
          </div>
        </div>
        <div class="week-grid">
          <div v-for="hour in 24" :key="hour" class="week-hour-row">
            <div class="week-hour-label">{{ formatHour(hour - 1) }}</div>
            <div v-for="day in weekDays" :key="day.date" class="week-hour-cell">
              <div 
                v-for="event in getEventsForHour(day.date, hour - 1)" 
                :key="event.id"
                class="event-card small"
                :style="{ backgroundColor: event.color }"
                @click="editEvent(event)"
              >
                <div class="event-title">{{ event.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de Mes -->
      <div v-show="currentView === 'month'" class="zcal-month-view">
        <div class="month-header">
          <div v-for="day in dayNames" :key="day" class="month-day-name">{{ day }}</div>
        </div>
        <div class="month-grid">
          <div 
            v-for="day in monthDays" 
            :key="day.date"
            class="month-day"
            :class="{ 
              'other-month': !day.isCurrentMonth,
              'today': isToday(day.date)
            }"
            @click="selectDay(day.date)"
          >
            <div class="day-number">{{ day.number }}</div>
            <div class="day-events">
              <div 
                v-for="event in getEventsForDay(day.date).slice(0, 3)" 
                :key="event.id"
                class="event-dot"
                :style="{ backgroundColor: event.color }"
                :title="event.name"
              ></div>
              <div v-if="getEventsForDay(day.date).length > 3" class="more-events">
                +{{ getEventsForDay(day.date).length - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para añadir/editar evento -->
    <div v-if="showEventModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingEvent ? 'Editar Evento' : 'Nuevo Evento' }}</h3>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre del evento</label>
            <input v-model="eventForm.name" type="text" placeholder="Ej: Reunión con el equipo">
          </div>
          <div class="form-group">
            <label>Fecha</label>
            <input v-model="eventForm.date" type="date">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Hora de inicio</label>
              <input v-model="eventForm.startTime" type="time">
            </div>
            <div class="form-group">
              <label>Hora de fin</label>
              <input v-model="eventForm.endTime" type="time">
            </div>
          </div>
          <div class="form-group">
            <label>Color</label>
            <div class="color-picker">
              <div 
                v-for="color in colors" 
                :key="color"
                class="color-option"
                :style="{ backgroundColor: color }"
                :class="{ selected: eventForm.color === color }"
                @click="eventForm.color = color"
              ></div>
            </div>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="eventForm.isRecurring" type="checkbox">
              Evento repetitivo
            </label>
          </div>
          <div v-if="eventForm.isRecurring" class="form-group">
            <label>Frecuencia</label>
            <select v-model="eventForm.recurringType">
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="editingEvent" @click="deleteEvent" class="delete-btn">Eliminar</button>
          <button @click="closeModal" class="cancel-btn">Cancelar</button>
          <button @click="saveEvent" class="save-btn">{{ editingEvent ? 'Guardar' : 'Crear' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZCalendarWidget',
  props: {
    theme: {
      type: String,
      default: 'light'
    },
    useStorage: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const STORAGE_KEY = 'calendar_widget_events';
    
    // Cargar eventos del localStorage si está habilitado
    let events = [];
    if (this.useStorage) {
      const stored = localStorage.getItem(STORAGE_KEY);
      events = stored ? JSON.parse(stored) : [];
    }
    
    // Formulario vacío por defecto
    const emptyForm = {
      name: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      color: '#066D5A',
      isRecurring: false,
      recurringType: 'daily'
    };
    
    return {
      STORAGE_KEY,
      currentView: 'month', // day, week, month
      currentDate: new Date(),
      showEventModal: false,
      editingEvent: null,
      events: events,
      eventForm: emptyForm,
      viewLabels: {
        day: 'Día',
        week: 'Semana',
        month: 'Mes'
      },
      dayNames: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      colors: ['#066D5A', '#0891b2', '#7c3aed', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#ec4899']
    };
  },
  computed: {
    currentDateLabel() {
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      if (this.currentView === 'day') {
        return `${this.currentDate.getDate()} de ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
      } else if (this.currentView === 'week') {
        const weekStart = this.getWeekStart(this.currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.getDate()} - ${weekEnd.getDate()} ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
      } else {
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
      }
    },
    weekDays() {
      const start = this.getWeekStart(this.currentDate);
      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        days.push({
          date: this.formatDate(date),
          name: this.dayNames[date.getDay()],
          number: date.getDate()
        });
      }
      return days;
    },
    monthDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const days = [];
      const currentDay = new Date(startDate);
      
      for (let i = 0; i < 42; i++) {
        days.push({
          date: this.formatDate(currentDay),
          number: currentDay.getDate(),
          isCurrentMonth: currentDay.getMonth() === month
        });
        currentDay.setDate(currentDay.getDate() + 1);
      }
      
      return days;
    }
  },
  methods: {
    loadEvents() {
      if (!this.useStorage) return [];
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    },
    saveEvents() {
      if (this.useStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
      }
    },
    getEmptyForm() {
      return {
        name: '',
        date: this.formatDate(new Date()),
        startTime: '09:00',
        endTime: '10:00',
        color: '#066D5A',
        isRecurring: false,
        recurringType: 'daily'
      };
    },
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    formatHour(hour) {
      return `${String(hour).padStart(2, '0')}:00`;
    },
    isToday(dateString) {
      return dateString === this.formatDate(new Date());
    },
    getWeekStart(date) {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day;
      return new Date(d.setDate(diff));
    },
    previousPeriod() {
      const d = new Date(this.currentDate);
      if (this.currentView === 'day') {
        d.setDate(d.getDate() - 1);
      } else if (this.currentView === 'week') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setMonth(d.getMonth() - 1);
      }
      this.currentDate = d;
    },
    nextPeriod() {
      const d = new Date(this.currentDate);
      if (this.currentView === 'day') {
        d.setDate(d.getDate() + 1);
      } else if (this.currentView === 'week') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      this.currentDate = d;
    },
    goToToday() {
      this.currentDate = new Date();
    },
    selectDay(dateString) {
      this.currentDate = new Date(dateString);
      this.currentView = 'day';
    },
    getEventsForDay(dateString) {
      return this.events.filter(event => {
        if (event.date === dateString) return true;
        
        if (event.isRecurring) {
          const eventDate = new Date(event.date);
          const checkDate = new Date(dateString);
          
          if (checkDate < eventDate) return false;
          
          if (event.recurringType === 'daily') return true;
          
          if (event.recurringType === 'weekly') {
            return eventDate.getDay() === checkDate.getDay();
          }
          
          if (event.recurringType === 'monthly') {
            return eventDate.getDate() === checkDate.getDate();
          }
        }
        
        return false;
      });
    },
    getEventsForHour(dateString, hour) {
      return this.getEventsForDay(dateString).filter(event => {
        const startHour = parseInt(event.startTime.split(':')[0]);
        const endHour = parseInt(event.endTime.split(':')[0]);
        return hour >= startHour && hour < endHour;
      });
    },
    async saveEvent() {
      if (!this.eventForm.name) {
        await window.ZenModals.showWarning({
          title: 'Nombre requerido',
          message: 'Por favor, ingresa un nombre para el evento'
        });
        return;
      }
      
      if (this.editingEvent) {
        const index = this.events.findIndex(e => e.id === this.editingEvent.id);
        this.events[index] = { ...this.eventForm, id: this.editingEvent.id };
      } else {
        this.events.push({
          ...this.eventForm,
          id: Date.now() + Math.random()
        });
      }
      
      this.saveEvents();
      this.closeModal();
    },
    editEvent(event) {
      this.editingEvent = event;
      this.eventForm = { ...event };
      this.showEventModal = true;
    },
    async deleteEvent() {
      const confirmed = await window.ZenModals.showDeleteConfirm('este evento');
      if (confirmed) {
        this.events = this.events.filter(e => e.id !== this.editingEvent.id);
        this.saveEvents();
        this.closeModal();
      }
    },
    closeModal() {
      this.showEventModal = false;
      this.editingEvent = null;
      this.eventForm = this.getEmptyForm();
    }
  }
};
</script>

<style scoped>
.calendar-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #202020;
  isolation: isolate;
}

.calendar-container.dark {
  background: rgba(20, 20, 20, 0.85);
  color: #dfdfdf;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.view-selector {
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.1);
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0.4rem;
  font-weight: 500;
  color: inherit;
  transition: all 0.2s;
}

.view-btn.active {
  background: #066D5A;
  color: white;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 1.5rem;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

.current-date {
  font-weight: 600;
  min-width: 200px;
  text-align: center;
}

.today-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0.4rem;
  cursor: pointer;
  font-weight: 500;
  color: inherit;
}

.today-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

.add-event-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: #066D5A;
  color: white;
  border-radius: 0.4rem;
  cursor: pointer;
  font-weight: 600;
}

.add-event-btn:hover {
  background: #055a4a;
}

.calendar-view {
  flex: 1;
  overflow-y: auto;
  min-height: 400px;
}

/* Vista de Día */
.zcal-day-view {
  height: 100%;
  display: none;
}

.zcal-day-view[style*="display: block"],
.zcal-day-view:not([style*="display: none"]) {
  display: flex;
  flex-direction: column;
}

.time-grid {
  display: flex;
  flex-direction: column;
}

.hour-slot {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  min-height: 60px;
}

.hour-label {
  width: 60px;
  padding: 0.5rem;
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
}

.dark .hour-label {
  color: rgba(255, 255, 255, 0.6);
}

.hour-content {
  flex: 1;
  padding: 0.25rem;
  position: relative;
}

/* Vista de Semana */
.zcal-week-view {
  height: 100%;
  display: none;
  flex-direction: column;
}

.zcal-week-view[style*="display: block"],
.zcal-week-view:not([style*="display: none"]) {
  display: flex;
}

.week-header {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  margin-bottom: 0.5rem;
}

.week-time-label {
  width: 60px;
}

.week-day-header {
  text-align: center;
  padding: 0.5rem;
}

.day-name {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
}

.dark .day-name {
  color: rgba(255, 255, 255, 0.6);
}

.day-number {
  font-weight: 600;
  font-size: 1.2rem;
  margin-top: 0.25rem;
}

.day-number.today {
  background: #066D5A;
  color: white;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.week-grid {
  flex: 1;
  overflow-y: auto;
}

.week-hour-row {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  min-height: 60px;
}

.week-hour-label {
  padding: 0.5rem;
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
}

.dark .week-hour-label {
  color: rgba(255, 255, 255, 0.6);
}

.week-hour-cell {
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.25rem;
  position: relative;
}

/* Vista de Mes */
.zcal-month-view {
  height: 100%;
  display: none;
  flex-direction: column;
}

.zcal-month-view[style*="display: block"],
.zcal-month-view:not([style*="display: none"]) {
  display: flex;
}

.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.month-day-name {
  text-align: center;
  font-weight: 600;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  flex: 1;
}

.month-day {
  aspect-ratio: 1;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.4rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
}

.month-day:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark .month-day:hover {
  background: rgba(255, 255, 255, 0.05);
}

.month-day.other-month {
  opacity: 0.3;
}

.month-day.today {
  background: rgba(6, 109, 90, 0.2);
  border-color: #066D5A;
}

.month-day .day-number {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.day-events {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.more-events {
  font-size: 0.7rem;
  color: rgba(0, 0, 0, 0.6);
}

.dark .more-events {
  color: rgba(255, 255, 255, 0.6);
}

/* Eventos */
.event-card {
  padding: 0.5rem;
  border-radius: 0.4rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
  color: white;
  position: relative;
}

.event-card:hover {
  opacity: 0.9;
}

.event-card.small {
  padding: 0.25rem;
  font-size: 0.75rem;
}

.event-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.event-time {
  font-size: 0.85rem;
  opacity: 0.9;
}

.event-recurring {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  font-size: 0.75rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  isolation: isolate;
}

.dark .modal-content {
  background: #2a2a2a;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .modal-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 0.4rem;
  color: inherit;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.dark .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group input[type="time"],
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.4rem;
  font-size: 1rem;
  background: white;
  color: #202020;
}

.dark .form-group input[type="text"],
.dark .form-group input[type="date"],
.dark .form-group input[type="time"],
.dark .form-group select {
  background: #1a1a1a;
  border-color: rgba(255, 255, 255, 0.2);
  color: #dfdfdf;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.color-picker {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-option {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.4rem;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: white;
  box-shadow: 0 0 0 2px #066D5A;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .modal-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.modal-footer button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(0, 0, 0, 0.1);
  color: inherit;
}

.cancel-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

.save-btn {
  background: #066D5A;
  color: white;
}

.save-btn:hover {
  background: #055a4a;
}

.delete-btn {
  background: #dc2626;
  color: white;
  margin-right: auto;
}

.delete-btn:hover {
  background: #b91c1c;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .navigation {
    justify-content: center;
  }
  
  .current-date {
    min-width: auto;
  }
  
  .week-header,
  .week-hour-row {
    grid-template-columns: 40px repeat(7, 1fr);
  }
  
  .hour-label,
  .week-hour-label,
  .week-time-label {
    width: 40px;
    font-size: 0.7rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
