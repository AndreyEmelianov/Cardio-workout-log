'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputTemp = document.querySelector('.form__input--temp');
const inputClimb = document.querySelector('.form__input--climb');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, temp) {
    super(coords, distance, duration);
    this.temp = temp;
    this.calculatePace();
  }

  calculatePace() {
    this.pace = this.duration / this.distance;
  }
}
class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, climb) {
    super(coords, distance, duration);
    this.climb = climb;
    this.calculateSpeed();
  }

  calculateSpeed() {
    this.speed = this.distance / this.duration / 60;
  }
}

const running = new Running([50, 39], 7, 40, 170);
const cycling = new Cycling([50, 39], 30, 80, 370);
console.log(running, cycling);
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleClimbField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Невозможно получить ваше местоположение');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.ru/maps/@${latitude},${longitude},14z`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(event) {
    this.#mapEvent = event;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleClimbField() {
    inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
    inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(event) {
    event.preventDefault();

    const areNumbers = (...numbers) =>
      numbers.every(num => Number.isFinite(num));

    const ateNumbersPositive = (...numbers) => numbers.every(num => num > 0);

    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // получить данные из формы
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    //Если тренировка - пробежка, создать обьект Running
    if (type === 'running') {
      const temp = +inputTemp.value;

      // проверка валидности данных
      if (
        !areNumbers(distance, duration, temp) ||
        !ateNumbersPositive(distance, duration, temp)
      )
        return alert('Введите положительное число');

      workout = new Running([lat, lng], distance, duration, temp);
    }

    //Если тренировка - велоезда, создать обьект Cycling
    if (type === 'cycling') {
      const climb = +inputClimb.value;

      // проверка валидности данных
      if (
        !areNumbers(distance, duration, climb) ||
        !ateNumbersPositive(distance, duration)
      )
        return alert('Введите положительное число');

      workout = new Cycling([lat, lng], distance, duration, climb);
    }

    // Добавить новый обьект в массив тренировок

    this.#workouts.push(workout);
    console.log(workout);

    // Отображение тренировки на карте

    this.displayWorkout(workout);

    // Отобразить тренировку в списке

    //спрятать форму и очистка полей ввода данных
    inputDistance.value =
      inputDuration.value =
      inputTemp.value =
      inputClimb.value =
        '';
  }

  displayWorkout(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('Тренировка')
      .openPopup();
  }
}

const app = new App();
