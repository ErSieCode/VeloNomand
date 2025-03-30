<script lang="ts">
    import { onMount, onDestroy, afterUpdate } from 'svelte';
    import { $effect, $state } from 'svelte';
    import maplibregl from 'maplibre-gl';
    import { Motion } from 'motion';
    
    import { POI_CATEGORIES } from '$lib/utils/POIManager';
    import type { POI } from '$lib/types/POITypes';
    
    // Props
    export let map: maplibregl.Map;
    export let pois: POI[] = [];
    
    // Lokaler Zustand
    let markers = $state<{ [id: string]: maplibregl.Marker }>({});
    let markerElements = $state<{ [id: string]: HTMLElement }>({});
    let popups = $state<{ [id: string]: maplibregl.Popup }>({});
    let lastUpdate = $state<number>(0);
    let animatedPOIs = $state<string[]>([]);
    
    // Sobald Map und/oder POIs aktualisiert werden
    $effect(() => {
        if (!map || !map.loaded()) return;
        
        // POIs nur aktualisieren, wenn sich die Daten geändert haben
        const currentTimestamp = Date.now();
        if (currentTimestamp - lastUpdate < 500) return;
        lastUpdate = currentTimestamp;
        
        updatePOIMarkers();
    });
    
    // Marker mit Pop-ups erzeugen oder aktualisieren
    function updatePOIMarkers() {
        // Liste der aktiven POI-IDs
        const activePOIIds = new Set(pois.map(poi => poi.id));
        
        // Nicht mehr vorhandene Marker entfernen
        Object.keys(markers).forEach(id => {
            if (!activePOIIds.has(id)) {
                if (markers[id]) markers[id].remove();
                delete markers[id];
                delete markerElements[id];
                if (popups[id]) popups[id].remove();
                delete popups[id];
            }
        });
        
        // Marker für neue POIs erstellen/aktualisieren
        pois.forEach(poi => {
            const existingMarker = markers[poi.id];
            
            if (!existingMarker) {
                // Neuen Marker erstellen
                createMarkerForPOI(poi);
            } else {
                // Bestehenden Marker aktualisieren
                existingMarker.setLngLat([poi.longitude, poi.latitude]);
                
                // Popup aktualisieren, falls vorhanden
                if (popups[poi.id]) {
                    updatePopupContent(poi);
                }
            }
        });
    }
    
    // Erstellt einen neuen Marker für ein POI
    function createMarkerForPOI(poi: POI) {
        // Marker-Element erstellen
        const el = document.createElement('div');
        el.className = `poi-marker ${getMarkerClassForPOI(poi)}`;
        
        // Icon basierend auf Kategorie/Subkategorie hinzufügen
        const iconClass = getIconClassForPOI(poi);
        el.innerHTML = `<i class="marker-icon ${iconClass}"></i>`;
        
        // POI-Namen als Titel hinzufügen
        if (poi.name) {
            el.setAttribute('title', poi.name);
        }
        
        // Marker erstellen und zur Karte hinzufügen
        const marker = new maplibregl.Marker({ 
            element: el,
            anchor: 'bottom',
            offset: [0, 0]
        })
        .setLngLat([poi.longitude, poi.latitude])
        .addTo(map);
        
        // Klick-Event für Popup
        marker.getElement().addEventListener('click', () => {
            showPopupForPOI(poi);
        });
        
        // Marker und Element speichern
        markers[poi.id] = marker;
        markerElements[poi.id] = el;
        
        // Animation für neue Marker
        if (!animatedPOIs.includes(poi.id)) {
            animateMarker(el);
            animatedPOIs.push(poi.id);
        }
    }
    
    // Marker animieren (beim Hinzufügen)
    function animateMarker(markerElement: HTMLElement) {
        Motion.animate(markerElement, 
            { 
                scale: [0, 1], 
                opacity: [0, 1],
                y: [20, 0]
            }, 
            { 
                duration: 0.5, 
                easing: [0.34, 1.56, 0.64, 1] 
            }
        );
    }
    
    // Zeigt ein Popup für ein POI an
    function showPopupForPOI(poi: POI) {
        // Bestehendes Popup entfernen, falls vorhanden
        if (popups[poi.id]) {
            popups[poi.id].remove();
            delete popups[poi.id];
            return;
        }
        
        // Popup-Inhalt erstellen
        const popupContent = createPopupContent(poi);
        
        // Neues Popup erstellen
        const popup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '300px',
            className: 'poi-popup'
        })
        .setLngLat([poi.longitude, poi.latitude])
        .setHTML(popupContent)
        .addTo(map);
        
        // Popup schließen Event
        popup.on('close', () => {
            delete popups[poi.id];
        });
        
        // Popup-Instanz speichern
        popups[poi.id] = popup;
        
        // "Zeige mehr"-Button Event hinzufügen
        setTimeout(() => {
            const showMoreBtn = document.getElementById(`show-more-${poi.id}`);
            if (showMoreBtn) {
                showMoreBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent('show-poi', { detail: poi }));
                    popup.remove();
                });
            }
        }, 0);
    }
    
    // Aktualisiert den Inhalt eines bestehenden Popups
    function updatePopupContent(poi: POI) {
        const popup = popups[poi.id];
        if (popup) {
            popup.setHTML(createPopupContent(poi));
        }
    }
    
    // Erstellt den HTML-Inhalt für ein POI-Popup
    function createPopupContent(poi: POI): string {
        // Kategorie und Subkategorie ermitteln
        const categoryInfo = getCategoryInfoForPOI(poi);
        
        // Popup-Inhalt zusammenstellen
        return `
            <div class="popup-content">
                <h3 class="popup-title">${poi.name}</h3>
                <div class="popup-category">
                    <i class="popup-icon ${getIconClassForPOI(poi)}"></i>
                    <span>${categoryInfo.categoryName} / ${categoryInfo.subcategoryName}</span>
                </div>
                <p class="popup-description">${poi.description}</p>
                
                ${poi.properties.seasonStart ? `
                    <div class="popup-season">
                        <i class="popup-icon icon-calendar"></i>
                        <span>Saison: ${getMonthName(poi.properties.seasonStart)} - ${getMonthName(poi.properties.seasonEnd || 12)}</span>
                    </div>
                ` : ''}
                
                ${poi.properties.ratings ? `
                    <div class="popup-rating">
                        <span class="stars">${'★'.repeat(Math.floor(poi.properties.ratings))}${
                            poi.properties.ratings % 1 >= 0.5 ? '★' : '☆'
                        }${'☆'.repeat(5 - Math.ceil(poi.properties.ratings))}</span>
                        <span class="rating-value">${poi.properties.ratings.toFixed(1)}</span>
                    </div>
                ` : ''}
                
                ${poi.properties.lastVerified ? `
                    <div class="popup-verified">
                        <i class="popup-icon icon-verified"></i>
                        <span>Verifiziert am ${formatDate(poi.properties.lastVerified)}</span>
                    </div>
                ` : ''}
                
                ${poi.distance ? `
                    <div class="popup-distance">
                        <i class="popup-icon icon-distance"></i>
                        <span>${formatDistance(poi.distance)}</span>
                    </div>
                ` : ''}
                
                ${createSpecialContent(poi)}
                
                <button id="show-more-${poi.id}" class="popup-button">
                    Details anzeigen
                </button>
            </div>
        `;
    }
    
    // Erstellt speziellen Inhalt basierend auf POI-Typ
    function createSpecialContent(poi: POI): string {
        // Wasserquelle
        if (poi.category === 'survival' && poi.subcategory === 'water' && poi.properties.waterQuality) {
            return `
                <div class="popup-special water-quality ${poi.properties.waterQuality.drinkable ? 'drinkable' : 'non-drinkable'}">
                    <i class="popup-icon icon-${poi.properties.waterQuality.drinkable ? 'check' : 'warning'}"></i>
                    <span>${poi.properties.waterQuality.drinkable ? 'Trinkbar' : 'Nicht trinkbar'}</span>
                </div>
            `;
        }
        
        // Camping-Spot
        if (poi.category === 'survival' && poi.subcategory === 'wildcamp' && poi.properties.campingAttributes) {
            return `
                <div class="popup-special camping-legal ${poi.properties.campingAttributes.legalStatus}">
                    <i class="popup-icon icon-${
                        poi.properties.campingAttributes.legalStatus === 'legal' ? 'check' : 
                        poi.properties.campingAttributes.legalStatus === 'tolerated' ? 'info' : 
                        poi.properties.campingAttributes.legalStatus === 'prohibited' ? 'prohibited' : 'question'
                    }"></i>
                    <span>${
                        poi.properties.campingAttributes.legalStatus === 'legal' ? 'Legaler Campingplatz' : 
                        poi.properties.campingAttributes.legalStatus === 'tolerated' ? 'Geduldet' : 
                        poi.properties.campingAttributes.legalStatus === 'prohibited' ? 'Verboten' : 'Status unklar'
                    }</span>
                </div>
            `;
        }
        
        // Warnung
        if (poi.category === 'warning' || 
            (poi.properties.safetyWarning && poi.properties.safetyWarning.active)) {
            return `
                <div class="popup-special warning severity-${
                    poi.properties.safetyWarning ? poi.properties.safetyWarning.severity : 'high'
                }">
                    <i class="popup-icon icon-warning"></i>
                    <span>${
                        poi.properties.safetyWarning ? 
                        poi.properties.safetyWarning.description : 
                        'Aktive Warnung'
                    }</span>
                </div>
            `;
        }
        
        // Kein spezieller Inhalt
        return '';
    }
    
    // Liefert die CSS-Klasse für den Marker basierend auf POI-Typ
    function getMarkerClassForPOI(poi: POI): string {
        if (poi.category === 'warning' ||
            (poi.properties.safetyWarning && poi.properties.safetyWarning.active)) {
            return 'marker-warning';
        }
        
        if (poi.category === 'survival' && poi.subcategory === 'water') {
            return 'marker-water';
        }
        
        if (poi.category === 'food') {
            return 'marker-food';
        }
        
        if (poi.category === 'survival' && 
            (poi.subcategory === 'shelter' || poi.subcategory === 'wildcamp')) {
            return 'marker-shelter';
        }
        
        if (poi.category === 'wellness' && 
            (poi.subcategory === 'medical' || poi.subcategory === 'pharmacy')) {
            return 'marker-medical';
        }
        
        if (poi.category === 'practical') {
            return 'marker-practical';
        }
        
        if (poi.category === 'community') {
            return 'marker-community';
        }
        
        if (poi.category === 'culture') {
            return 'marker-culture';
        }
        
        if (poi.category === 'adventure') {
            return 'marker-adventure';
        }
        
        return 'marker-default';
    }
    
    // Liefert die Icon-Klasse basierend auf POI-Kategorie/Subkategorie
    function getIconClassForPOI(poi: POI): string {
        // Nach passenden Icons in Kategorien/Subkategorien suchen
        const category = Object.values(POI_CATEGORIES).find(c => c.id === poi.category);
        if (!category) return 'icon-marker';
        
        const subcategory = category.subcategories.find(s => s.id === poi.subcategory);
        if (!subcategory) return `icon-${category.icon}`;
        
        return `icon-${subcategory.icon}`;
    }
    
    // Liefert Kategorie/Subkategorie-Namen für ein POI
    function getCategoryInfoForPOI(poi: POI): { categoryName: string, subcategoryName: string } {
        let categoryName = poi.category;
        let subcategoryName = poi.subcategory;
        
        // Nach passenden Namen in Kategorien/Subkategorien suchen
        const category = Object.values(POI_CATEGORIES).find(c => c.id === poi.category);
        if (category) {
            categoryName = category.name;
            
            const subcategory = category.subcategories.find(s => s.id === poi.subcategory);
            if (subcategory) {
                subcategoryName = subcategory.name;
            }
        }
        
        return { categoryName, subcategoryName };
    }
    
    // Monatsname abrufen
    function getMonthName(month: number): string {
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        return monthNames[month - 1] || '';
    }
    
    // Datum formatieren
    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    }
    
    // Entfernung formatieren
    function formatDistance(meters: number): string {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        } else {
            return `${(meters / 1000).toFixed(1)}km`;
        }
    }
    
    // Alle Marker bei Komponenten-Destroy entfernen
    onDestroy(() => {
        Object.values(markers).forEach(marker => {
            marker.remove();
        });
        
        Object.values(popups).forEach(popup => {
            popup.remove();
        });
    });
</script>

<style>
    /* Diese Styles werden im globalen DOM eingefügt, um Marker zu stylen */
    :global(.poi-marker) {
        width: 30px;
        height: 30px;
        background-color: #3498db;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        border: 2px solid white;
        transform-origin: center bottom;
    }
    
    :global(.poi-marker:hover) {
        transform: scale(1.1);
    }
    
    :global(.marker-water) {
        background-color: #3498db; /* Blau */
    }
    
    :global(.marker-food) {
        background-color: #2ecc71; /* Grün */
    }
    
    :global(.marker-shelter) {
        background-color: #f39c12; /* Orange */
    }
    
    :global(.marker-medical) {
        background-color: #e74c3c; /* Rot */
    }
    
    :global(.marker-practical) {
        background-color: #9b59b6; /* Lila */
    }
    
    :global(.marker-community) {
        background-color: #1abc9c; /* Türkis */
    }
    
    :global(.marker-culture) {
        background-color: #e67e22; /* Dunkel-Orange */
    }
    
    :global(.marker-adventure) {
        background-color: #d35400; /* Dunkel-Orange */
    }
    
    :global(.marker-warning) {
        background-color: #c0392b; /* Dunkel-Rot */
        animation: pulse 2s infinite;
    }
    
    :global(.marker-default) {
        background-color: #7f8c8d; /* Grau */
    }
    
    :global(.marker-icon) {
        width: 16px;
        height: 16px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        filter: brightness(0) invert(1); /* Weiße Icons */
    }
    
    /* Popup-Styling */
    :global(.poi-popup .maplibregl-popup-content) {
        padding: 0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 300px;
    }
    
    :global(.popup-content) {
        padding: 12px;
        font-family: 'Nunito Sans', sans-serif;
    }
    
    :global(.popup-title) {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 700;
    }
    
    :global(.popup-category) {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        font-size: 12px;
        color: #666;
    }
    
    :global(.popup-description) {
        margin: 0 0 10px 0;
        font-size: 14px;
        line-height: 1.4;
    }
    
    :global(.popup-icon) {
        width: 16px;
        height: 16px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }
    
    :global(.popup-season),
    :global(.popup-rating),
    :global(.popup-verified),
    :global(.popup-distance) {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 6px;
        font-size: 12px;
        color: #666;
    }
    
    :global(.popup-special) {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 10px 0;
        padding: 8px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
    }
    
    :global(.water-quality.drinkable) {
        background-color: rgba(46, 204, 113, 0.2);
        color: #27ae60;
    }
    
    :global(.water-quality.non-drinkable) {
        background-color: rgba(231, 76, 60, 0.2);
        color: #c0392b;
    }
    
    :global(.camping-legal.legal) {
        background-color: rgba(46, 204, 113, 0.2);
        color: #27ae60;
    }
    
    :global(.camping-legal.tolerated) {
        background-color: rgba(243, 156, 18, 0.2);
        color: #f39c12;
    }
    
    :global(.camping-legal.prohibited) {
        background-color: rgba(231, 76, 60, 0.2);
        color: #c0392b;
    }
    
    :global(.camping-legal.unclear) {
        background-color: rgba(149, 165, 166, 0.2);
        color: #7f8c8d;
    }
    
    :global(.warning) {
        background-color: rgba(231, 76, 60, 0.2);
        color: #c0392b;
    }
    
    :global(.warning.severity-low) {
        background-color: rgba(243, 156, 18, 0.2);
        color: #d35400;
    }
    
    :global(.warning.severity-extreme) {
        background-color: rgba(192, 57, 43, 0.3);
        color: #c0392b;
        animation: pulse 2s infinite;
    }
    
    :global(.popup-button) {
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        margin-top: 10px;
        transition: background-color 0.2s ease;
    }
    
    :global(.popup-button:hover) {
        background-color: #2980b9;
    }
    
    :global(.stars) {
        color: #f1c40f;
        letter-spacing: -2px;
    }
    
    /* Animationen */
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
</style>