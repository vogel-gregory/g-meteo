/* =========================================
   SÉLECTEURS ET CONSTANTES
========================================= */

// Récupération des éléments HTML utilisés dans l'application
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const errorMsg = document.querySelector(".messages");
const currentWeatherCard = document.querySelector(".current-weather");
const weeklyBlock = document.querySelector(".weekly-block");

// Tableau permettant de retrouver le nom du jour grâce à getDay()
// qui retourne un indice de 0 à 6 : 0 = dimanche, 1 = lundi, etc.
const dayArray = [
   "Dimanche",
   "Lundi",
   "Mardi",
   "Mercredi",
   "Jeudi",
   "Vendredi",
   "Samedi",
];

/* =========================================
   TRAITEMENT DES DONNÉES MÉTÉO
========================================= */

// Détermine le type de météo à partir du code fourni par l'API
const getWeatherType = (weatherCode) => {
   if (weatherCode === 0 || weatherCode === 1) {
      return "sunny";
   } else if (
      weatherCode === 2 ||
      weatherCode === 3 ||
      weatherCode === 45 ||
      weatherCode === 48
   ) {
      return "cloudy";
   } else if (
      (weatherCode >= 51 && weatherCode <= 57) ||
      (weatherCode >= 61 && weatherCode <= 67) ||
      (weatherCode >= 80 && weatherCode <= 82)
   ) {
      return "rainy";
   } else if (
      (weatherCode >= 71 && weatherCode <= 77) ||
      weatherCode === 85 ||
      weatherCode === 86
   ) {
      return "snowy";
   } else if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
      return "stormy";
   } else {
      return "";
   }
};

// Associe au type de météo sa description, son arrière-plan et son icône
// L'icône varie selon qu'il fait jour ou nuit lorsque cela est pertinent
const getWeatherData = (weatherCode, isDay) => {
   const weatherType = getWeatherType(weatherCode);

   const weatherTypes = {
      sunny: {
         description: "Ciel clair",
         background: "weather--sunny",
         icon: isDay ? "wi wi-day-sunny" : "wi wi-night-clear",
      },
      cloudy: {
         description: "Ciel gris",
         background: "weather--cloudy",
         icon: isDay ? "wi wi-day-cloudy" : "wi wi-night-alt-cloudy",
      },
      rainy: {
         description: "Pluvieux",
         background: "weather--rainy",
         icon: "wi wi-rain",
      },
      snowy: {
         description: "Neigeux",
         background: "weather--snowy",
         icon: "wi wi-snow",
      },
      stormy: {
         description: "Orageux",
         background: "weather--stormy",
         icon: "wi wi-lightning",
      },
      default: {
         description: "Conditions inconnues",
         background: "",
         icon: "",
      },
   };

   // Utilise les données par défaut si le type de météo n'est pas reconnu
   return weatherTypes[weatherType] ?? weatherTypes.default;
};

// Convertit une chaîne de date en heure lisible (ex. 2026-08-25T12:26 → 12h26)
const formatHour = (date) => {
   const result = new Date(date);

   const hour = result.getHours();
   const minutes = String(result.getMinutes()).padStart(2, "0");

   return `${hour}h${minutes}`;
};

// Échappe les caractères HTML d'une valeur afin de l'afficher comme du texte
const escapeHTML = (value) => {
   const element = document.createElement("div");
   element.textContent = value;
   return element.innerHTML;
};

/* =========================================
   AFFICHAGE
========================================= */

// Génère et affiche la carte météo du jour ou une carte de prévision
const displayWeather = (weatherData, location, currentTemp) => {
   if (weatherData.isToday) {
      currentWeatherCard.innerHTML = `
         <article class="current-weather-card ${weatherData.background}">
            <h2 class="location">${escapeHTML(location.name)}</h2>
            <h3>Aujourd'hui</h3>
            <h4>${weatherData.date}</h4>

            <div class="main-weather">
               <dl class="temp-icon">
                  <dt class="visually-hidden">Température actuelle</dt>
                  <dd class="current-temp">
                     <i class="${weatherData.icon}" aria-hidden="true"></i>
                     ${currentTemp}
                  </dd>
               </dl>
               <p class="sky">${weatherData.description}</p>
            </div>

            <div class="weather-details row row-cols-2 g-3">
               <div class="col">
                  <div class="weather-detail">
                     <p class="weather-muted mb-2">Températures</p>
                     <dl class="forecast-temperatures py-0">
                        <div
                           class="max-temp mb-0 d-flex flex-column align-items-center gap-1"
                        >
                           <dt class="weather-muted">
                              <i class="wi wi-thermometer" aria-hidden="true"></i>
                              Max
                           </dt>
                           <dd>${weatherData.maxTemp}</dd>
                        </div>
                        <div
                           class="min-temp mb-0 d-flex flex-column align-items-center gap-1"
                        >
                           <dt class="weather-muted">
                              <i
                                 class="wi wi-thermometer-exterior"
                                 aria-hidden="true"
                              ></i>
                              Min
                           </dt>
                           <dd>${weatherData.minTemp}</dd>
                        </div>
                     </dl>
                  </div>
               </div>

               <div class="col">
                  <dl class="weather-detail">
                     <dt class="weather-muted mb-2">Vitesse du vent</dt>
                     <dd class="wind mb-0 d-flex flex-column align-items-center gap-1">
                        <i class="wi wi-strong-wind" aria-hidden="true"></i>
                        ${weatherData.wind}
                     </dd>
                  </dl>
               </div>

               <div class="col">
                  <dl class="weather-detail">
                     <dt class="weather-muted mb-2">Lever de soleil</dt>
                     <dd
                        class="sunrise mb-0 d-flex flex-column align-items-center gap-1"
                     >
                        <i class="wi wi-sunrise" aria-hidden="true"></i>
                        ${weatherData.sunrise}
                     </dd>
                  </dl>
               </div>

               <div class="col">
                  <dl class="weather-detail">
                     <dt class="weather-muted mb-2">Coucher de soleil</dt>
                     <dd class="sunset mb-0 d-flex flex-column align-items-center gap-1">
                        <i class="wi wi-sunset" aria-hidden="true"></i>
                        ${weatherData.sunset}
                     </dd>
                  </dl>
               </div>
            </div>
         </article>
      `;
   } else {
      weeklyBlock.innerHTML += `
         <div class="col">
            <article class="forecast-card ${weatherData.background}">
               <div class="forecast-date">
                  <h3>${dayArray[weatherData.dayName]}</h3>
                  <h4>${weatherData.date}</h4>
               </div>

               <i class="${weatherData.icon} forecast-icon" aria-hidden="true"></i>

               <dl class="forecast-temperatures">
                  <div class="max-temp mb-0 d-flex flex-column align-items-center gap-1">
                     <dt class="weather-muted">
                        <i class="wi wi-thermometer" aria-hidden="true"></i>
                        Max
                     </dt>
                     <dd>${weatherData.maxTemp}</dd>
                  </div>

                  <div class="min-temp mb-0 d-flex flex-column align-items-center gap-1">
                     <dt class="weather-muted">
                        <i class="wi wi-thermometer-exterior" aria-hidden="true"></i>
                        Min
                     </dt>
                     <dd>${weatherData.minTemp}</dd>
                  </div>
               </dl>
            </article>
         </div>
      `;
   }
};

// Efface les données météo affichées et réinitialise le champ de recherche
const emptyDisplay = () => {
   searchInput.value = "";
   currentWeatherCard.innerText = "";
   weeklyBlock.innerText = "";
};

/* =========================================
   REQUÊTES API ET GESTION DES DONNÉES
========================================= */

// Recherche une ville, récupère ses coordonnées puis ses prévisions météo
const apiSearch = () => {
   const inputValue = searchInput.value;

   // URL de recherche des coordonnées géographiques de la ville saisie
   const locationURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputValue)}&count=1&language=fr&format=json`;

   if (inputValue === "") {
      errorMsg.innerText = "⚠️ Veuillez saisir une ville !";
      emptyDisplay();
   } else {
      emptyDisplay();
      errorMsg.innerText = "⏳ Recherche en cours...";

      // Première requête : recherche des coordonnées de la ville
      fetch(locationURL)
         .then((res) => {
            if (!res.ok) {
               throw new Error("Erreur HTTP lors de la recherche de la ville");
            }

            return res.json();
         })
         .then((data) => {
            if (data.results && data.results.length > 0) {
               // Récupération des coordonnées de la première ville trouvée
               const location = data.results[0];

               // URL de récupération des prévisions météo à partir des coordonnées
               const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,wind_speed_10m_max&current=temperature_2m&timezone=auto&forecast_days=7`;

               // Deuxième requête : récupération des données météo
               return fetch(weatherURL)
                  .then((res) => {
                     if (!res.ok) {
                        throw new Error(
                           "Erreur HTTP lors de la récupération de la météo",
                        );
                     }

                     return res.json();
                  })
                  .then((data) => {
                     // Vérification de la présence des données de température actuelle
                     if (
                        !data.current ||
                        data.current.temperature_2m === undefined ||
                        !data.current_units ||
                        data.current_units.temperature_2m === undefined
                     ) {
                        throw new Error(
                           "Données de température actuelle manquantes",
                        );
                     }

                     // Température actuelle, déclarée hors de la boucle car elle est commune à toutes les cartes
                     const currentTempResult = `${data.current.temperature_2m} ${data.current_units.temperature_2m}`;

                     // Date et heure actuelles, utilisées pour déterminer s'il fait jour
                     const now = new Date();

                     // Vérification de la présence des données journalières
                     if (!data.daily || !data.daily_units) {
                        throw new Error("Données manquantes");
                     } else {
                        // Liste des propriétés journalières nécessaires à l'affichage
                        const dailyProperties = [
                           "time",
                           "weather_code",
                           "sunrise",
                           "sunset",
                           "wind_speed_10m_max",
                           "temperature_2m_max",
                           "temperature_2m_min",
                        ];

                        // Vérifie que chaque propriété est un tableau contenant 7 éléments
                        const validDailyData = dailyProperties.every(
                           (property) => {
                              return (
                                 Array.isArray(data.daily[property]) &&
                                 data.daily[property].length === 7
                              );
                           },
                        );

                        // Vérifie également la présence des unités nécessaires
                        if (
                           !validDailyData ||
                           !data.daily_units.temperature_2m_max ||
                           !data.daily_units.temperature_2m_min ||
                           !data.daily_units.wind_speed_10m_max
                        ) {
                           throw new Error("Données journalières invalides");
                        }
                     }

                     // Parcourt les 7 jours de prévisions pour préparer et afficher chaque carte
                     for (let i = 0; i < data.daily.time.length; i++) {
                        const time = new Date(data.daily.time[i]);

                        // Identifie la carte correspondant à la journée actuelle
                        const isToday = i === 0;

                        const weatherCode = data.daily.weather_code[i];

                        const sunrise = new Date(data.daily.sunrise[i]);
                        const sunset = new Date(data.daily.sunset[i]);

                        // Détermine s'il fait jour pour aujourd'hui
                        // Les autres journées utilisent par convention les icônes diurnes
                        const isDay = isToday
                           ? now > sunrise && now < sunset
                           : true;

                        const weatherInfo = getWeatherData(weatherCode, isDay);

                        // Regroupe les données nécessaires à l'affichage de chaque carte
                        const weatherData = {
                           maxTemp: `${data.daily.temperature_2m_max[i]}${data.daily_units.temperature_2m_max}`,
                           minTemp: `${data.daily.temperature_2m_min[i]}${data.daily_units.temperature_2m_min}`,
                           wind: `${data.daily.wind_speed_10m_max[i]} ${data.daily_units.wind_speed_10m_max}`,
                           sunrise: formatHour(data.daily.sunrise[i]),
                           sunset: formatHour(data.daily.sunset[i]),
                           date: time.toLocaleDateString("fr-FR"),
                           dayName: time.getDay(),
                           description: weatherInfo.description,
                           background: weatherInfo.background,
                           icon: weatherInfo.icon,
                           isToday,
                        };

                        // Transmet les données à la fonction chargée de générer les cartes météo
                        displayWeather(
                           weatherData,
                           location,
                           currentTempResult,
                        );
                     }

                     // Réinitialise le champ de recherche et efface le message de chargement
                     searchInput.value = "";
                     errorMsg.innerText = "";
                  });
            } else {
               // Affiche un message si aucune ville ne correspond à la recherche
               errorMsg.innerText =
                  "❌ Ville introuvable. Vérifiez votre saisie.";

               emptyDisplay();
            }
         })
         .catch((error) => {
            // Affiche l'erreur dans la console et un message générique à l'utilisateur
            console.error(error);
            errorMsg.innerText =
               "⚠️ Une erreur est survenue lors de la recherche.";
         });
   }
};

/* =========================================
   ÉCOUTEURS D'ÉVÉNEMENTS
========================================= */

// Lance la recherche lorsqu'on clique sur le bouton
searchBtn.addEventListener("click", apiSearch);

// Lance la recherche lorsqu'on appuie sur la touche Entrée dans le champ de recherche
searchInput.addEventListener("keydown", (e) => {
   if (e.key === "Enter") {
      apiSearch();
   }
});
