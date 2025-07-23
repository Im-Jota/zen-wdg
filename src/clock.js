export class ClockWidget extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })

    // Estilos
    const style = document.createElement('style')
    style.textContent = `
      .clock-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
      }

      .clock {
        text-align: center;
        font-family: 'Arial', sans-serif;
        color: #333;
        background-color: rgba(20, 20, 20, 0.4);
        backdrop-filter: blur(0.2rem);
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
    `

    // Estructura HTML
    const wrapper = document.createElement('div')
    wrapper.innerHTML = `
      <div class="clock-container">
        <div class="clock">
          <div class="time" id="clock-time">--:--</div>
          <div class="date" id="clock-date">--</div>
        </div>
      </div>
    `

    shadow.appendChild(style)
    shadow.appendChild(wrapper)

    // Actualización del reloj
    const updateClock = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')

      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]

      const dayOfWeek = days[now.getDay()]
      const day = now.getDate()
      const month = months[now.getMonth()]
      const year = now.getFullYear()

      const timeEl = shadow.getElementById('clock-time')
      const dateEl = shadow.getElementById('clock-date')

      if (timeEl && dateEl) {
        timeEl.textContent = `${hours}:${minutes}`
        dateEl.textContent = `${dayOfWeek}, ${day} ${month} ${year}`
      }
    }

    updateClock()
    this._interval = setInterval(updateClock, 1000)
  }

  disconnectedCallback() {
    clearInterval(this._interval)
  }
}

// Registro del componente
customElements.define('clock-widget', ClockWidget)