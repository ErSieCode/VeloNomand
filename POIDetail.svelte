<!-- src/lib/components/poi/POIDetail.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { formatDistance, formatRelative } from 'date-fns';
    import { de } from 'date-fns/locale';
    import Carousel from '$lib/components/common/Carousel.svelte';
    import { currentWeather } from '$lib/state/weatherState';
    
    // Props
    export let poi;
    export let currentLocation = null;
    
    // Event-Dispatcher
    const dispatch = createEventDispatcher();
    
    // Formatiere POI-Eigenschaften für die Anzeige
    function formatProperty(key, value) {
      switch (key) {
        case 'seasonStart':
        case 'seasonEnd':
          return getMonthName(value);
        case 'lastVerified':
          return formatRelative(new Date(value), new Date(), { locale: de });
        default:
          return value;
      }
    }
    
    // Berechne Entfernung vom aktuellen Standort
    function getDistance() {
      if (!currentLocation) return null;
      
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        poi.latitude,
        poi.longitude
      );
      
      if (distance < 1000) {
        return `${Math.round(distance)} m`;
      } else {
        return `${(distance/1000).toFixed(1)} km`;
      }
    }
    
    // Bestimme, ob ein saisonales POI aktuell verfügbar ist
    function isInSeason() {
      if (!poi.properties.seasonStart || !poi.properties.seasonEnd) return true;
      
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const start = poi.properties.seasonStart;
      const end = poi.properties.seasonEnd;
      
      if (start <= end) {
        return currentMonth >= start && currentMonth <= end;
      } else {
        // Jahresübergreifende Saison (z.B. Nov-Feb)
        return currentMonth >= start || currentMonth <= end;
      }
    }
    
    // Wetterbedingungen am POI-Standort
    function getWeatherAtPOI() {
      if (!$currentWeather || $currentWeather.status !== 'success') return null;
      
      // Einfache Approximation - in einer echten App würde man hier
      // spezifische Wetterdaten für den POI-Standort abfragen
      return $currentWeather.data;
    }
    
    // Berechne eine Route zum POI
    function navigateToPOI() {
      // Hier würde die Route zum POI berechnet und angezeigt werden
      // In einer realen Implementierung würde diese Funktion den Router-Service aufrufen
      console.log(`Navigation zu ${poi.name} gestartet`);
      dispatch('navigate', poi);
    }
  </script>
  
  <div 
    class="poi-detail" 
    transition:fly={{ y: 20, duration: 300 }}
  >
    <div class="detail-header" style="background-color: {getCategoryColor(poi.category)}">
      <button class="close-btn" on:click={() => dispatch('close')}>×</button>
      <h2>{poi.name}</h2>
      <div class="category-badge">
        <img src="/icons/poi/{getCategoryIcon(poi.category, poi.subcategory)}.svg" alt="" />
        <span>{getCategoryName(poi.category, poi.subcategory)}</span>
      </div>
    </div>
    
    <div class="detail-content">
      {#if poi.images && poi.images.length > 0}
        <Carousel images={poi.images} />
      {/if}
      
      <div class="description">
        <p>{poi.description}</p>
      </div>
      
      <div class="info-grid">
        {#if getDistance()}
          <div class="info-item">
            <div class="info-icon">📍</div>
            <div class="info-text">
              <span class="info-label">Entfernung</span>
              <span class="info-value">{getDistance()}</span>
            </div>
          </div>
        {/if}
        
        {#if poi.elevation}
          <div class="info-item">
            <div class="info-icon">⛰️</div>
            <div class="info-text">
              <span class="info-label">Höhe</span>
              <span class="info-value">{poi.elevation} m</span>
            </div>
          </div>
        {/if}
        
        {#if poi.properties.seasonStart && poi.properties.seasonEnd}
          <div class="info-item">
            <div class="info-icon">🗓️</div>
            <div class="info-text">
              <span class="info-label">Saison</span>
              <span class="info-value" class:active={isInSeason()}>
                {formatProperty('seasonStart', poi.properties.seasonStart)} - 
                {formatProperty('seasonEnd', poi.properties.seasonEnd)}
                {#if isInSeason()}
                  <span class="in-season-badge">Aktuell</span>
                {/if}
              </span>
            </div>
          </div>
        {/if}
        
        {#if poi.temporaryEvent && poi.eventStart}
          <div class="info-item">
            <div class="info-icon">🎭</div>
            <div class="info-text">
              <span class="info-label">Veranstaltung</span>
              <span class="info-value">{formatEventDate(poi.eventStart, poi.eventEnd)}</span>
            </div>
          </div>
        {/if}
        
        {#if poi.properties.openingHours}
          <div class="info-item">
            <div class="info-icon">🕒</div>
            <div class="info-text">
              <span class="info-label">Öffnungszeiten</span>
              <span class="info-value">{poi.properties.openingHours}</span>
            </div>
          </div>
        {/if}
        
        {#if poi.properties.lastVerified}
          <div class="info-item">
            <div class="info-icon">✓</div>
            <div class="info-text">
              <span class="info-label">Verifiziert</span>
              <span class="info-value">
                {formatProperty('lastVerified', poi.properties.lastVerified)}
                {#if poi.properties.verifiedBy}
                  von {poi.properties.verifiedBy}
                {/if}
              </span>
            </div>
          </div>
        {/if}
      </div>
      
      {#if getWeatherAtPOI()}
        <div class="weather-section">
          <h3>Aktuelle Bedingungen</h3>
          <div class="weather-info">
            <div class="weather-icon">
              <img src="/icons/weather/{getWeatherAtPOI().iconCode}.svg" alt="Wetter" />
            </div>
            <div class="weather-details">
              <div class="temperature">{Math.round(getWeatherAtPOI().temperature)}°C</div>
              <div class="description">{getWeatherAtPOI().description}</div>
            </div>
          </div>
        </div>
      {/if}
      
      {#if poi.properties.website || poi.properties.contactInfo}
        <div class="contact-section">
          <h3>Kontakt & Info</h3>
          {#if poi.properties.website}
            <a href={poi.properties.website} target="_blank" rel="noopener noreferrer" class="website-link">
              <span class="link-icon">🌐</span>
              <span class="link-text">Website besuchen</span>
            </a>
          {/if}
          {#if poi.properties.contactInfo}
            <div class="contact-info">
              <span class="contact-icon">📞</span>
              <span class="contact-text">{poi.properties.contactInfo}</span>
            </div>
          {/if}
        </div>
      {/if}
      
      {#if poi.properties.reviews && poi.properties.reviews.length > 0}
        <div class="reviews-section">
          <h3>Bewertungen</h3>
          <div class="rating-summary">
            <div class="stars">
              {#each Array(5) as _, i}
                <span class="star" class:filled={i < poi.properties.ratings}>★</span>
              {/each}
            </div>
            <span class="rating-value">{poi.properties.ratings.toFixed(1)}</span>
            <span class="review-count">({poi.properties.reviews.length} Bewertungen)</span>
          </div>
          
          <div class="reviews-list">
            {#each poi.properties.reviews.slice(0, 3) as review}
              <div class="review-item">
                <div class="review-header">
                  <span class="reviewer">{review.user}</span>
                  <span class="review-date">{formatDate(review.date)}</span>
                  <div class="review-stars">
                    {#each Array(5) as _, i}
                      <span class="star small" class:filled={i < review.rating}>★</span>
                    {/each}
                  </div>
                </div>
                <p class="review-text">{review.comment}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
      
      <div class="action-buttons">
        <button class="primary-btn" on:click={navigateToPOI}>
          <span class="btn-icon">🧭</span>
          <span class="btn-text">Hierhin navigieren</span>
        </button>
        
        <button class="secondary-btn" on:click={() => dispatch('save', poi)}>
          <span class="btn-icon">🔖</span>
          <span class="btn-text">Speichern</span>
        </button>
        
        <button class="secondary-btn" on:click={() => dispatch('share', poi)}>
          <span class="btn-icon">📤</span>
          <span class="btn-text">Teilen</span>
        </button>
      </div>
    </div>
  </div>
  
  <style>
    .poi-detail {
      position: absolute;
      bottom: 16px;
      left: 16px;
      right: 16px;
      max-height: 80vh;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      z-index: 1000;
    }
    
    .detail-header {
      padding: 16px;
      color: white;
      position: relative;
    }
    
    .close-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    
    h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: bold;
    }
    
    .category-badge {
      display: inline-flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 4px 10px;
      font-size: 12px;
    }
    
    .category-badge img {
      width: 16px;
      height: 16px;
      margin-right: 6px;
    }
    
    .detail-content {
      padding: 16px;
      overflow-y: auto;
    }
    
    .description {
      margin-bottom: 16px;
      line-height: 1.5;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 8px;
    }
    
    .info-icon {
      margin-right: 8px;
      font-size: 18px;
    }
    
    .info-text {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 11px;
      color: #666;
    }
    
    .info-value {
      font-size: 14px;
      font-weight: 500;
    }
    
    .in-season-badge {
      background-color: #4CAF50;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: 6px;
    }
    
    .weather-section, .contact-section, .reviews-section {
      margin-bottom: 20px;
    }
    
    h3 {
      font-size: 16px;
      margin: 0 0 10px 0;
      padding-bottom: 6px;
      border-bottom: 1px solid #eee;
    }
    
    .weather-info {
      display: flex;
      align-items: center;
      background-color: #f5f7fa;
      border-radius: 8px;
      padding: 12px;
    }
    
    .weather-icon {
      margin-right: 12px;
    }
    
    .weather-icon img {
      width: 40px;
      height: 40px;
    }
    
    .temperature {
      font-size: 18px;
      font-weight: bold;
    }
    
    .website-link, .contact-info {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      text-decoration: none;
      color: #333;
    }
    
    .link-icon, .contact-icon {
      margin-right: 8px;
      font-size: 16px;
    }
    
    .rating-summary {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .stars {
      margin-right: 6px;
    }
    
    .star {
      color: #ddd;
      font-size: 18px;
    }
    
    .star.filled {
      color: #FFC107;
    }
    
    .star.small {
      font-size: 14px;
    }
    
    .rating-value {
      font-weight: bold;
      margin-right: 4px;
    }
    
    .review-count {
      color: #666;
      font-size: 12px;
    }
    
    .reviews-list {
      max-height: 200px;
      overflow-y: auto;
    }
    
    .review-item {
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .review-header {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }
    
    .reviewer {
      font-weight: 500;
      margin-right: 8px;
    }
    
    .review-date {
      color: #666;
      font-size: 12px;
      margin-right: 8px;
    }
    
    .review-text {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
    }
    
    .action-buttons {
      display: flex;
      gap: 10px;
    }
    
    .primary-btn, .secondary-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      border-radius: 8px;
      border: none;
      font-weight: 500;
      cursor: pointer;
    }
    
    .primary-btn {
      background-color: #4285F4;
      color: white;
    }
    
    .secondary-btn {
      background-color: #f0f0f0;
      color: #333;
    }
    
    .btn-icon {
      margin-right: 6px;
    }
    
    @media (max-width: 480px) {
      .info-grid {
        grid-template-columns: 1fr 1fr;
      }
      
      .action-buttons {
        flex-direction: column;
      }
    }
  </style>