<script lang="ts">
    import { onMount } from 'svelte';
    import { $effect, $state } from 'svelte';
    import { Motion } from 'motion';
    import { format } from 'date-fns';
    import { de } from 'date-fns/locale';
    
    import { currentCoordinates, hasLocation } from '$lib/state/locationState';
    import { mapViewport, updateViewport } from '$lib/state/mapState';
    import { 
        nearbyPOIs, 
        warningPOIs,
        enabledCategories,
        enabledSubcategories,
        POI_CATEGORIES
    } from '$lib/utils/POIManager';
    import { currentWeather } from '$lib/state/weatherState';
    import type { POI } from '$lib/types/POITypes';
    
    // Status der POI-Anzeige
    let displayMode = $state<'map' | 'list'>('map');
    let selectedPOI = $state<POI | null>(null);
    let showFilters = $state(false);
    let animatingPOI = $state(false);
    let showingWarning = $state(false);
    
    // DOM-Referenzen
    let poiContainer: HTMLDivElement;
    let warningBanner: HTMLDivElement;
    
    // POI-Icons basierend auf Subkategorie abrufen
    function getIconForPOI(poi: POI): string {
        const category = Object.values(POI_CATEGORIES).find(cat => cat.id === poi.category);
        if (!category) return 'marker';
        
        const subcategory = category.subcategories.find(sub => sub.id === poi.subcategory);
        return subcategory?.icon || category.icon;
    }
    
    // Formatiert die Entfernung für die Anzeige
    function formatDistance(meters: number): string {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        } else {
            return `${(meters / 1000).toFixed(1)}km`;
        }
    }
    
    // Entfernung und Richtung zum POI ermitteln
    function getDirectionInfo(poi: POI): { distance: string, direction: string, bearing: number } {
        if (!poi.distance || !currentCoordinates) {
            return { distance: 'unbekannt', direction: 'unbekannt', bearing: 0 };
        }
        
        const distance = formatDistance(poi.distance);
        
        // Berechnung der Richtung (Peilung)
        const lat1 = currentCoordinates[1] * Math.PI / 180;
        const lon1 = currentCoordinates[0] * Math.PI / 180;
        const lat2 = poi.latitude * Math.PI / 180;
        const lon2 = poi.longitude * Math.PI / 180;
        
        const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
        
        // Richtung in Worten (N, NO, O, SO, S, SW, W, NW)
        const directions = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(bearing / 45) % 8;
        const direction = directions[index];
        
        return { distance, direction, bearing };
    }
    
    // POI anzeigen und zur Position navigieren
    function showPOI(poi: POI) {
        selectedPOI = poi;
        animatingPOI = true;
        
        // Karte zur POI-Position bewegen
        updateViewport({
            longitude: poi.longitude,
            latitude: poi.latitude,
            zoom: 15,
            animate: true
        });
        
        // POI-Infobox einblenden mit Animation
        if (poiContainer) {
            Motion.animate(poiContainer, 
                { opacity: [0, 1], y: [20, 0] }, 
                { duration: 0.3, easing: 'ease-out' }
            ).then(() => {
                animatingPOI = false;
            });
        }
    }
    
    // POI-Ansicht schließen
    function closePOI() {
        if (poiContainer && selectedPOI) {
            animatingPOI = true;
            
            Motion.animate(poiContainer, 
                { opacity: [1, 0], y: [0, 20] }, 
                { duration: 0.3, easing: 'ease-in' }
            ).then(() => {
                selectedPOI = null;
                animatingPOI = false;
            });
        } else {
            selectedPOI = null;
        }
    }
    
    // Zwischen Karten- und Listenansicht wechseln
    function toggleDisplayMode() {
        displayMode = displayMode === 'map' ? 'list' : 'map';
        
        if (displayMode === 'list') {
            closePOI();
        }
    }
    
    // Filter-Menü ein-/ausblenden
    function toggleFilters() {
        showFilters = !showFilters;
    }
    
    // Kategorie aktivieren/deaktivieren
    function toggleCategory(categoryId: string) {
        enabledCategories.update(cats => {
            if (cats.includes(categoryId)) {
                return cats.filter(id => id !== categoryId);
            } else {
                return [...cats, categoryId];
            }
        });
    }
    
    // Subkategorie aktivieren/deaktivieren
    function toggleSubcategory(subcategoryId: string) {
        enabledSubcategories.update(subs => {
            if (subs.includes(subcategoryId)) {
                return subs.filter(id => id !== subcategoryId);
            } else {
                return [...subs, subcategoryId];
            }
        });
    }
    
    // Warnmeldungen anzeigen, falls vorhanden
    $effect(() => {
        if ($warningPOIs.length > 0 && !showingWarning) {
            showWarningBanner($warningPOIs[0]);
        }
    });
    
    // Warnbanner anzeigen
    function showWarningBanner(warning: POI) {
        showingWarning = true;
        
        if (warningBanner) {
            // Banner mit Animation einblenden
            Motion.animate(warningBanner, 
                { opacity: [0, 1], y: [-100, 0] }, 
                { duration: 0.5, easing: 'spring' }
            );
            
            // Nach 10 Sekunden ausblenden, wenn nicht interagiert wurde
            setTimeout(() => {
                if (showingWarning) {
                    hideWarningBanner();
                }
            }, 10000);
        }
    }
    
    // Warnbanner ausblenden
    function hideWarningBanner() {
        if (warningBanner && showingWarning) {
            Motion.animate(warningBanner, 
                { opacity: [1, 0], y: [0, -100] }, 
                { duration: 0.5, easing: 'ease-in' }
            ).then(() => {
                showingWarning = false;
            });
        } else {
            showingWarning = false;
        }
    }
    
    // Zu Warnungsort navigieren
    function navigateToWarning(warning: POI) {
        hideWarningBanner();
        showPOI(warning);
    }
    
    // POI-Eigenschaften formatieren
    function formatPOIProperty(key: string, value: any): string {
        switch (key) {
            case 'seasonStart':
            case 'seasonEnd':
                const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                                   'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
                return monthNames[value - 1];
            case 'lastVerified':
                return format(new Date(value), 'dd.MM.yyyy', { locale: de });
            case 'ratings':
                return '★'.repeat(Math.floor(value)) + '☆'.repeat(5 - Math.floor(value));
            default:
                return String(value);
        }
    }
</script>

<!-- POI-Hauptcontainer -->
<div class="poi-display">
    <!-- Obere Menüleiste mit Buttons -->
    <div class="poi-controls">
        <button class="control-button" on:click={toggleDisplayMode}>
            <i class="icon icon-{displayMode === 'map' ? 'list' : 'map'}"></i>
            {displayMode === 'map' ? 'Liste' : 'Karte'}
        </button>
        
        <button class="control-button" on:click={toggleFilters}>
            <i class="icon icon-filter"></i>
            Filter
        </button>
    </div>
    
    <!-- Filter-Menü (ausgeklappt/eingeklappt) -->
    {#if showFilters}
        <div class="poi-filters" transition:slide={{ duration: 300 }}>
            <h3>Kategorien</h3>
            <div class="category-filters">
                {#each Object.values(POI_CATEGORIES) as category}
                    <div class="category-item">
                        <label>
                            <input 
                                type="checkbox" 
                                checked={$enabledCategories.includes(category.id)}
                                on:change={() => toggleCategory(category.id)}
                            />
                            <i class="icon icon-{category.icon}"></i>
                            {category.name}
                        </label>
                        
                        <div class="subcategory-list">
                            {#each category.subcategories as subcategory}
                                <label class="subcategory-item">
                                    <input 
                                        type="checkbox" 
                                        checked={$enabledSubcategories.includes(subcategory.id)}
                                        on:change={() => toggleSubcategory(subcategory.id)}
                                    />
                                    <i class="icon icon-{subcategory.icon}"></i>
                                    {subcategory.name}
                                </label>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
    
    <!-- POIs als Liste anzeigen -->
    {#if displayMode === 'list'}
        <div class="poi-list">
            {#each $nearbyPOIs as poi}
                <div class="poi-list-item" on:click={() => showPOI(poi)}>
                    <div class="poi-icon">
                        <i class="icon icon-{getIconForPOI(poi)}"></i>
                    </div>
                    <div class="poi-info">
                        <h3>{poi.name}</h3>
                        <p class="poi-description">{poi.description}</p>
                        <div class="poi-distance">
                            {getDirectionInfo(poi).distance} {getDirectionInfo(poi).direction}
                        </div>
                    </div>
                </div>
            {/each}
            
            {#if $nearbyPOIs.length === 0}
                <div class="empty-list">
                    <p>Keine POIs in der Nähe gefunden.</p>
                    <p>Versuche, die Filter anzupassen oder den Kartenausschnitt zu verschieben.</p>
                </div>
            {/if}
        </div>
    {/if}
    
    <!-- Detailansicht für ausgewählten POI -->
    {#if selectedPOI}
        <div class="poi-detail" bind:this={poiContainer}>
            <div class="detail-header">
                <button class="close-button" on:click={closePOI}>
                    <i class="icon icon-close"></i>
                </button>
                <h2>{selectedPOI.name}</h2>
                <div class="poi-category">
                    <i class="icon icon-{getIconForPOI(selectedPOI)}"></i>
                    {#each Object.values(POI_CATEGORIES) as category}
                        {#if category.id === selectedPOI.category}
                            {category.name} / 
                            {#each category.subcategories as subcategory}
                                {#if subcategory.id === selectedPOI.subcategory}
                                    {subcategory.name}
                                {/if}
                            {/each}
                        {/if}
                    {/each}
                </div>
            </div>
            
            <div class="detail-content">
                <p class="poi-description">{selectedPOI.description}</p>
                
                {#if selectedPOI.distance}
                    <div class="direction-info">
                        <div class="compass" 
                             style="transform: rotate({getDirectionInfo(selectedPOI).bearing}deg)">
                            <div class="compass-needle"></div>
                        </div>
                        <div class="distance-text">
                            <strong>{getDirectionInfo(selectedPOI).distance}</strong> in Richtung 
                            <strong>{getDirectionInfo(selectedPOI).direction}</strong>
                        </div>
                    </div>
                {/if}
                
                {#if selectedPOI.images && selectedPOI.images.length > 0}
                    <div class="image-gallery">
                        {#each selectedPOI.images as image}
                            <img src={image} alt={selectedPOI.name} />
                        {/each}
                    </div>
                {/if}
                
                <h3>Details</h3>
                <div class="property-list">
                    {#if selectedPOI.elevation}
                        <div class="property-item">
                            <span class="property-label">
                                <i class="icon icon-elevation"></i> Höhe
                            </span>
                            <span class="property-value">{selectedPOI.elevation}m</span>
                        </div>
                    {/if}
                    
                    {#if selectedPOI.properties.seasonStart && selectedPOI.properties.seasonEnd}
                        <div class="property-item">
                            <span class="property-label">
                                <i class="icon icon-calendar"></i> Saison
                            </span>
                            <span class="property-value">
                                {formatPOIProperty('seasonStart', selectedPOI.properties.seasonStart)} - 
                                {formatPOIProperty('seasonEnd', selectedPOI.properties.seasonEnd)}
                            </span>
                        </div>
                    {/if}
                    
                    {#if selectedPOI.properties.lastVerified}
                        <div class="property-item">
                            <span class="property-label">
                                <i class="icon icon-verified"></i> Verifiziert
                            </span>
                            <span class="property-value">
                                {formatPOIProperty('lastVerified', selectedPOI.properties.lastVerified)}
                                {#if selectedPOI.properties.verifiedBy}
                                    von {selectedPOI.properties.verifiedBy}
                                {/if}
                            </span>
                        </div>
                    {/if}
                    
                    {#if selectedPOI.properties.ratings}
                        <div class="property-item">
                            <span class="property-label">
                                <i class="icon icon-star"></i> Bewertung
                            </span>
                            <span class="property-value">
                                {formatPOIProperty('ratings', selectedPOI.properties.ratings)}
                            </span>
                        </div>
                    {/if}
                    
                    {#if selectedPOI.properties.contactInfo}
                        <div class="property-item">
                            <span class="property-label">
                                <i class="icon icon-contact"></i> Kontakt
                            </span>
                            <span class="property-value">
                                {selectedPOI.properties.contactInfo}
                            </span>
                        </div>
                    {/if}
                    
                    {#if selectedPOI.properties.website}
                        <div class="property-item">
                            <span class="property-label">
                                <i class="icon icon-web"></i> Website
                            </span>
                            <span class="property-value">
                                <a href={selectedPOI.properties.website} target="_blank">
                                    {selectedPOI.properties.website}
                                </a>
                            </span>
                        </div>
                    {/if}
                    
                    {#if selectedPOI.properties.openingHours}
                        <div class="property-item">
                            <span class="property-label">
                                <i class="icon icon-clock"></i> Öffnungszeiten
                            </span>
                            <span class="property-value">
                                {selectedPOI.properties.openingHours}
                            </span>
                        </div>
                    {/if}
                </div>
                
                <!-- POI-spezifische Komponenten je nach Kategorie -->
                {#if selectedPOI.properties.waterQuality}
                    <h3>Wasserqualität</h3>
                    <div class="water-quality-info">
                        <div class="quality-indicator 
                                   {selectedPOI.properties.waterQuality.drinkable ? 'drinkable' : 'non-drinkable'}">
                            <i class="icon icon-{selectedPOI.properties.waterQuality.drinkable ? 'check' : 'warning'}"></i>
                            {selectedPOI.properties.waterQuality.drinkable ? 'Trinkbar' : 'Nicht trinkbar'}
                        </div>
                        
                        <div class="quality-details">
                            <p>Typ: {selectedPOI.properties.waterQuality.type}</p>
                            {#if selectedPOI.properties.waterQuality.treatmentRecommended}
                                <p class="treatment-notice">
                                    <i class="icon icon-filter"></i>
                                    Behandlung vor dem Trinken empfohlen
                                </p>
                            {/if}
                            {#if selectedPOI.properties.waterQuality.flowRate}
                                <p>Durchfluss: {selectedPOI.properties.waterQuality.flowRate}</p>
                            {/if}
                            {#if selectedPOI.properties.waterQuality.lastTestedDate}
                                <p>Letzter Test: {formatPOIProperty('lastVerified', selectedPOI.properties.waterQuality.lastTestedDate)}</p>
                                <p>Ergebnis: {selectedPOI.properties.waterQuality.lastTestedResult}</p>
                            {/if}
                        </div>
                    </div>
                {/if}
                
                {#if selectedPOI.properties.campingAttributes}
                    <h3>Camping-Informationen</h3>
                    <div class="camping-info">
                        <div class="legal-status 
                                  {selectedPOI.properties.campingAttributes.legalStatus === 'legal' ? 'legal' : 
                                    selectedPOI.properties.campingAttributes.legalStatus === 'tolerated' ? 'tolerated' : 
                                    selectedPOI.properties.campingAttributes.legalStatus === 'prohibited' ? 'prohibited' : 'unclear'}">
                            {selectedPOI.properties.campingAttributes.legalStatus === 'legal' ? 'Legaler Campingplatz' : 
                              selectedPOI.properties.campingAttributes.legalStatus === 'tolerated' ? 'Geduldet' : 
                              selectedPOI.properties.campingAttributes.legalStatus === 'prohibited' ? 'Verboten' : 'Rechtlicher Status unklar'}
                        </div>
                        
                        <div class="camping-details">
                            <p>Untergrund: {selectedPOI.properties.campingAttributes.groundType}</p>
                            <p>Schutz: {selectedPOI.properties.campingAttributes.shelter}</p>
                            <p>Kapazität: {selectedPOI.properties.campingAttributes.capacity} Personen</p>
                            <p>Privatsphäre: {selectedPOI.properties.campingAttributes.privacyLevel}</p>
                            
                            {#if selectedPOI.properties.campingAttributes.facilities.length > 0}
                                <p>Einrichtungen: {selectedPOI.properties.campingAttributes.facilities.join(', ')}</p>
                            {/if}
                            
                            {#if selectedPOI.properties.campingAttributes.nearbyWater}
                                <p class="nearby-water">
                                    <i class="icon icon-water-drop"></i>
                                    Wasser in der Nähe verfügbar
                                </p>
                            {/if}
                        </div>
                    </div>
                {/if}
                
                {#if selectedPOI.properties.safetyWarning && selectedPOI.properties.safetyWarning.active}
                    <h3 class="warning-heading">Warnung</h3>
                    <div class="safety-warning">
                        <div class="warning-badge severity-{selectedPOI.properties.safetyWarning.severity}">
                            <i class="icon icon-warning"></i>
                            {selectedPOI.properties.safetyWarning.severity === 'low' ? 'Niedrige Gefahr' : 
                              selectedPOI.properties.safetyWarning.severity === 'moderate' ? 'Mäßige Gefahr' : 
                              selectedPOI.properties.safetyWarning.severity === 'high' ? 'Hohe Gefahr' : 'Extreme Gefahr'}
                        </div>
                        
                        <p class="warning-description">{selectedPOI.properties.safetyWarning.description}</p>
                        
                        {#if selectedPOI.properties.safetyWarning.mitigation}
                            <p class="mitigation-info">
                                <strong>Vorsichtsmaßnahmen:</strong> {selectedPOI.properties.safetyWarning.mitigation}
                            </p>
                        {/if}
                        
                        <p class="report-date">
                            Gemeldet am {formatPOIProperty('lastVerified', selectedPOI.properties.safetyWarning.reportDate)}
                            {#if selectedPOI.properties.safetyWarning.reportedBy}
                                von {selectedPOI.properties.safetyWarning.reportedBy}
                            {/if}
                        </p>
                    </div>
                {/if}
                
                {#if selectedPOI.properties.reviews && selectedPOI.properties.reviews.length > 0}
                    <h3>Bewertungen</h3>
                    <div class="reviews-list">
                        {#each selectedPOI.properties.reviews as review}
                            <div class="review-item">
                                <div class="review-header">
                                    <span class="reviewer-name">{review.user}</span>
                                    <span class="review-date">{formatPOIProperty('lastVerified', review.date)}</span>
                                    <span class="review-rating">{formatPOIProperty('ratings', review.rating)}</span>
                                </div>
                                <p class="review-comment">{review.comment}</p>
                            </div>
                        {/each}
                    </div>
                {/if}
                
                {#if selectedPOI.tags && selectedPOI.tags.length > 0}
                    <div class="tags-list">
                        {#each selectedPOI.tags as tag}
                            <span class="tag">{tag}</span>
                        {/each}
                    </div>
                {/if}
                
                <div class="action-buttons">
                    <button class="action-button navigate-button">
                        <i class="icon icon-directions"></i>
                        Navigation starten
                    </button>
                    
                    <button class="action-button save-button">
                        <i class="icon icon-bookmark"></i>
                        Speichern
                    </button>
                    
                    <button class="action-button share-button">
                        <i class="icon icon-share"></i>
                        Teilen
                    </button>
                </div>
            </div>
        </div>
    {/if}
    
    <!-- Warnungsbanner -->
    {#if showingWarning && $warningPOIs.length > 0}
        <div class="warning-banner" bind:this={warningBanner}>
            <div class="warning-content">
                <i class="icon icon-warning"></i>
                <div class="warning-text">
                    <h4>{$warningPOIs[0].name}</h4>
                    <p>{$warningPOIs[0].description}</p>
                </div>
            </div>
            
            <div class="warning-actions">
                <button class="warning-button details-button" on:click={() => navigateToWarning($warningPOIs[0])}>
                    Details
                </button>
                <button class="warning-button close-button" on:click={hideWarningBanner}>
                    <i class="icon icon-close"></i>
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Grundlegende Stile */
    .poi-display {
        position: relative;
        width: 100%;
        height: 100%;
        font-family: 'Nunito Sans', sans-serif;
    }
    
    /* Steuerelemente */
    .poi-controls {
        position: absolute;
        top: 16px;
        right: 16px;
        display: flex;
        gap: 8px;
        z-index: 10;
    }
    
    .control-button {
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        backdrop-filter: blur(4px);
        transition: all 0.2s ease;
    }
    
    .control-button:hover {
        background: rgba(0, 0, 0, 0.9);
    }
    
    /* Filter-Bereich */
    .poi-filters {
        position: absolute;
        top: 60px;
        right: 16px;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        color: white;
        border-radius: 12px;
        padding: 16px;
        max-width: 350px;
        max-height: 70vh;
        overflow-y: auto;
        z-index: 20;
    }
    
    .category-filters {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .category-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    
    .category-item > label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        cursor: pointer;
    }
    
    .subcategory-list {
        margin-left: 24px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
    
    .subcategory-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        cursor: pointer;
    }
    
    /* POI-Liste */
    .poi-list {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        color: white;
        overflow-y: auto;
        z-index: 5;
        padding: 70px 16px 16px 16px;
    }
    
    .poi-list-item {
        display: flex;
        gap: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 12px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    
    .poi-list-item:hover {
        transform: scale(1.02);
        background: rgba(255, 255, 255, 0.15);
    }
    
    .poi-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        flex-shrink: 0;
    }
    
    .poi-info {
        flex: 1;
    }
    
    .poi-info h3 {
        margin: 0 0 4px 0;
        font-size: 16px;
    }
    
    .poi-description {
        margin: 0 0 6px 0;
        font-size: 14px;
        opacity: 0.8;
    }
    
    .poi-distance {
        font-size: 12px;
        font-weight: 600;
        opacity: 0.9;
    }
    
    .empty-list {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 50vh;
        text-align: center;
        opacity: 0.7;
    }
    
    /* POI-Detailansicht */
    .poi-detail {
        position: absolute;
        bottom: 16px;
        left: 16px;
        right: 16px;
        max-height: 70vh;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        color: white;
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        z-index: 15;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .detail-header {
        padding: 16px;
        background: rgba(0, 0, 0, 0.3);
        position: relative;
    }
    
    .detail-header h2 {
        margin: 0 0 4px 0;
        padding-right: 30px;
    }
    
    .close-button {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        font-size: 20px;
    }
    
    .poi-category {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        opacity: 0.8;
    }
    
    .detail-content {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
    }
    
    .direction-info {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 12px;
        margin: 12px 0;
    }
    
    .compass {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.3);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .compass-needle {
        width: 2px;
        height: 40px;
        background: linear-gradient(to bottom, red 0%, red 50%, white 50%, white 100%);
        position: relative;
    }
    
    .distance-text {
        font-size: 15px;
    }
    
    .image-gallery {
        margin: 16px 0;
        display: flex;
        flex-wrap: nowrap;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 8px;
    }
    
    .image-gallery img {
        height: 120px;
        border-radius: 8px;
        object-fit: cover;
    }
    
    .property-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
    }
    
    .property-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 8px 12px;
    }
    
    .property-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
    }
    
    .property-value {
        font-size: 14px;
        font-weight: 600;
    }
    
    .water-quality-info,
    .camping-info,
    .safety-warning {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 12px;
        margin: 12px 0 20px 0;
    }
    
    .quality-indicator,
    .legal-status,
    .warning-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 6px;
        margin-bottom: 10px;
        font-weight: 600;
        font-size: 14px;
    }
    
    .quality-indicator.drinkable {
        background: rgba(0, 177, 106, 0.3);
    }
    
    .quality-indicator.non-drinkable {
        background: rgba(244, 67, 54, 0.3);
    }
    
    .legal-status.legal {
        background: rgba(0, 177, 106, 0.3);
    }
    
    .legal-status.tolerated {
        background: rgba(255, 193, 7, 0.3);
    }
    
    .legal-status.prohibited {
        background: rgba(244, 67, 54, 0.3);
    }
    
    .legal-status.unclear {
        background: rgba(156, 39, 176, 0.3);
    }
    
    .warning-badge {
        background: rgba(244, 67, 54, 0.3);
    }
    
    .warning-badge.severity-low {
        background: rgba(255, 193, 7, 0.3);
    }
    
    .warning-badge.severity-moderate {
        background: rgba(255, 152, 0, 0.3);
    }
    
    .warning-badge.severity-high {
        background: rgba(244, 67, 54, 0.3);
    }
    
    .warning-badge.severity-extreme {
        background: rgba(183, 28, 28, 0.4);
    }
    
    .treatment-notice,
    .nearby-water {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #ffeb3b;
    }
    
    .warning-heading {
        color: #f44336;
    }
    
    .reviews-list {
        margin: 12px 0 20px 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .review-item {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 12px;
    }
    
    .review-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    
    .reviewer-name {
        font-weight: 600;
    }
    
    .review-date {
        font-size: 12px;
        opacity: 0.7;
    }
    
    .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 12px 0;
    }
    
    .tag {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 16px;
        padding: 4px 10px;
        font-size: 12px;
    }
    
    .action-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    
    .action-button {
        flex: 1;
        background: rgba(33, 150, 243, 0.8);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s ease;
    }
    
    .action-button:hover {
        background: rgba(33, 150, 243, 1);
    }
    
    .save-button {
        background: rgba(0, 177, 106, 0.8);
    }
    
    .save-button:hover {
        background: rgba(0, 177, 106, 1);
    }
    
    .share-button {
        background: rgba(96, 125, 139, 0.8);
    }
    
    .share-button:hover {
        background: rgba(96, 125, 139, 1);
    }
    
    /* Warnungsbanner */
    .warning-banner {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(244, 67, 54, 0.9);
        color: white;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 30;
    }
    
    .warning-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .warning-text h4 {
        margin: 0 0 4px 0;
    }
    
    .warning-text p {
        margin: 0;
        font-size: 14px;
    }
    
    .warning-actions {
        display: flex;
        gap: 8px;
    }
    
    .warning-button {
        background: rgba(0, 0, 0, 0.3);
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        color: white;
        cursor: pointer;
    }
    
    .warning-button.details-button {
        background: rgba(255, 255, 255, 0.2);
        font-weight: 600;
    }
    
    /* Icons (Platzhalter für echte Icons) */
    .icon {
        width: 20px;
        height: 20px;
        display: inline-block;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }
</style>