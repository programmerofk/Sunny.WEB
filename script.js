document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle.querySelector(".theme-icon");
  const body = document.body;

  const searchInput = document.getElementById("searchInput");
  const locationBtn = document.getElementById("locationBtn");

  const savedTheme = localStorage.getItem("weatherTheme");
  if (savedTheme === "dark") {
    body.classList.add("dark-theme");
    themeIcon.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-theme");
    if (body.classList.contains("dark-theme")) {
      themeIcon.textContent = "☀️";
      localStorage.setItem("weatherTheme", "dark");
    } else {
      themeIcon.textContent = "🌙";
      localStorage.setItem("weatherTheme", "light");
    }
  });

  const hourlyScroll = document.getElementById("hourlyScroll");
  const prevHourBtn = document.getElementById("prevHour");
  const nextHourBtn = document.getElementById("nextHour");
  const dailyList = document.getElementById("dailyList");
  const prevDayBtn = document.getElementById("prevDay");
  const nextDayBtn = document.getElementById("nextDay");

  nextHourBtn.addEventListener("click", () =>
    hourlyScroll.scrollBy({ left: 200, behavior: "smooth" })
  );
  prevHourBtn.addEventListener("click", () =>
    hourlyScroll.scrollBy({ left: -200, behavior: "smooth" })
  );

  nextDayBtn.addEventListener("click", () =>
    dailyList.scrollBy({ top: 60, behavior: "smooth" })
  );
  prevDayBtn.addEventListener("click", () =>
    dailyList.scrollBy({ top: -60, behavior: "smooth" })
  );

  function getWeatherInfo(code) {
    if (code === 0)
      return {
        text: "Ясно",
        icon: "https://openweathermap.org/img/wn/01d@2x.png",
      };
    if (code >= 1 && code <= 3)
      return {
        text: "Переменная облачность",
        icon: "https://openweathermap.org/img/wn/02d@2x.png",
      };
    if (code >= 45 && code <= 48)
      return {
        text: "Туман",
        icon: "https://openweathermap.org/img/wn/50d@2x.png",
      };
    if (code >= 51 && code <= 67)
      return {
        text: "Дождь",
        icon: "https://openweathermap.org/img/wn/10d@2x.png",
      };
    if (code >= 71 && code <= 77)
      return {
        text: "Снег",
        icon: "https://openweathermap.org/img/wn/13d@2x.png",
      };
    if (code >= 80 && code <= 82)
      return {
        text: "Ливень",
        icon: "https://openweathermap.org/img/wn/09d@2x.png",
      };
    if (code >= 95 && code <= 99)
      return {
        text: "Гроза",
        icon: "https://openweathermap.org/img/wn/11d@2x.png",
      };
    return {
      text: "Облачно",
      icon: "https://openweathermap.org/img/wn/03d@2x.png",
    };
  }

  function formatDate(date) {
    const options = { weekday: "long", day: "numeric", month: "long" };
    return date.toLocaleDateString("ru-RU", options);
  }

  async function getWeather(lat, lon, cityName) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
      const response = await fetch(url);
      const data = await response.json();

      const current = data.current;
      const daily = data.daily;
      const hourly = data.hourly;

      const weatherInfo = getWeatherInfo(current.weather_code);

      document.getElementById("cityName").textContent = cityName;
      document.getElementById("currentDate").textContent = formatDate(
        new Date()
      );
      document.getElementById("currentTemp").textContent =
        Math.round(current.temperature_2m) + "°";
      document.getElementById("weatherDesc").textContent = weatherInfo.text;
      document.getElementById("feelsLike").textContent =
        "Ощущается как " + Math.round(current.apparent_temperature) + "°";
      document.getElementById("tempMax").textContent =
        "↑ " + Math.round(daily.temperature_2m_max[0]) + "°";
      document.getElementById("tempMin").textContent =
        "↓ " + Math.round(daily.temperature_2m_min[0]) + "°";
      document.getElementById("mainIcon").src = weatherInfo.icon;

      document.getElementById("humidity").textContent =
        current.relative_humidity_2m + "%";
      document.getElementById("wind").textContent =
        current.wind_speed_10m + " м/с";
      document.getElementById("pressure").textContent = Math.round(
        current.surface_pressure
      );
      document.getElementById("uvIndex").textContent = Math.round(
        daily.uv_index_max[0]
      );

      const sunrise = new Date(daily.sunrise[0]).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const sunset = new Date(daily.sunset[0]).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
      document.getElementById("sunTimes").textContent =
        sunrise + " → " + sunset;

      document.getElementById("footerCity").textContent =
        cityName + " · Обновлено сейчас";

      hourlyScroll.innerHTML = "";
      document.getElementById("chartTimes").innerHTML = "";

      const now = new Date();
      let startIndex = 0;
      for (let i = 0; i < hourly.time.length; i++) {
        if (new Date(hourly.time[i]) >= now) {
          startIndex = i;
          break;
        }
      }

      const tempsForChart = [];
      const timesForChart = [];

      for (let i = startIndex; i < startIndex + 24; i++) {
        if (!hourly.time[i]) break;

        const timeDate = new Date(hourly.time[i]);
        const timeStr = timeDate.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const temp = Math.round(hourly.temperature_2m[i]);

        tempsForChart.push(temp);
        timesForChart.push(timeStr);

        const hInfo = getWeatherInfo(hourly.weather_code[i]);

        const card = document.createElement("div");
        card.className = "hour-card" + (i === startIndex ? " active" : "");
        card.innerHTML = `
                  <span>${timeStr}</span>
                  <img src="${hInfo.icon}" alt="Погода">
                  <strong>${temp}°</strong>
              `;
        hourlyScroll.appendChild(card);
      }

      const minTemp = Math.min(...tempsForChart);
      const maxTemp = Math.max(...tempsForChart);
      const tempRange = maxTemp - minTemp || 1;

      let pathData = `M 0,${
        90 - ((tempsForChart[0] - minTemp) / tempRange) * 70
      } `;

      for (let i = 1; i < tempsForChart.length; i++) {
        const x = (i / (tempsForChart.length - 1)) * 400;
        const y = 90 - ((tempsForChart[i] - minTemp) / tempRange) * 70;
        pathData += `L ${x},${y} `;
      }

      document.getElementById("tempChartPath").setAttribute("d", pathData);

      document.getElementById("chartTimes").innerHTML = `
              <span>${timesForChart[0]}</span>
              <span>${
                timesForChart[Math.floor(timesForChart.length / 2)]
              }</span>
              <span>${timesForChart[timesForChart.length - 1]}</span>
          `;

      dailyList.innerHTML = "";
      const daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(daily.time[i]);
        const dayName = daysOfWeek[dayDate.getDay()];
        const dayNum = dayDate.getDate();
        const monthNames = [
          "янв",
          "фев",
          "мар",
          "апр",
          "мая",
          "июн",
          "июл",
          "авг",
          "сен",
          "окт",
          "ноя",
          "дек",
        ];
        const monthName = monthNames[dayDate.getMonth()];
        const dInfo = getWeatherInfo(daily.weather_code[i]);

        let precip = 0;
        if (daily.weather_code[i] >= 51 && daily.weather_code[i] <= 67)
          precip = 60;
        if (daily.weather_code[i] >= 80 && daily.weather_code[i] <= 82)
          precip = 80;
        if (daily.weather_code[i] >= 95) precip = 90;

        const row = document.createElement("div");
        row.className = "day-row";
        row.innerHTML = `
                  <span class="day-name">${dayName} <small>${dayNum} ${monthName}</small></span>
                  <img src="${dInfo.icon}" alt="Погода">
                  <span class="temp-high">${Math.round(
                    daily.temperature_2m_max[i]
                  )}°</span>
                  <span class="temp-low">${Math.round(
                    daily.temperature_2m_min[i]
                  )}°</span>
                  <div class="precip-bar"><div class="fill" style="width: ${precip}%"></div></div>
                  <span class="precip-val">${precip}%</span>
              `;
        dailyList.appendChild(row);
      }
    } catch (error) {
      console.error(error);
      alert("Не удалось загрузить данные о погоде.");
    }
  }

  async function getCityCoords(city) {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=ru&format=json`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const displayName = result.name;
        getWeather(result.latitude, result.longitude, displayName);
        localStorage.setItem("lastLat", result.latitude);
        localStorage.setItem("lastLon", result.longitude);
        localStorage.setItem("lastCityName", displayName);
      } else {
        alert("Город не найден");
      }
    } catch (error) {
      alert("Ошибка при поиске города");
    }
  }

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchInput.value.trim() !== "") {
      getCityCoords(searchInput.value.trim());
      searchInput.value = "";
    }
  });

  locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          getWeather(
            position.coords.latitude,
            position.coords.longitude,
            "Моё местоположение"
          );
        },
        () => {
          alert("Не удалось получить геолокацию. Разрешите доступ в браузере.");
        }
      );
    } else {
      alert("Геолокация не поддерживается вашим браузером.");
    }
  });

  const savedLat = localStorage.getItem("lastLat");
  const savedLon = localStorage.getItem("lastLon");
  const savedCityName = localStorage.getItem("lastCityName");

  if (savedLat && savedLon && savedCityName) {
    getWeather(savedLat, savedLon, savedCityName);
  } else {
    getCityCoords("Бишкек");
  }
});
