<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { $effect, $state } from 'svelte';
    import maplibregl from 'maplibre-gl';
    import 'maplibre-gl/dist/maplibre-gl.css';
    import { Motion } from 'motion';
    
    import { currentCoordinates, hasLocation } from '$lib/state/locationState';
    import { activeTrip } from '$lib/state/tripState';
    import { 
        currentRoute, 
        currentWaypoints 
    } from '$lib/state/routeState';
    import { 
        currentWeather,
        isDaytime,
        weatherCode,
        temperature,
        windSpeed,
        windDirection,
        isRaining,
        sunrise,
        sunset 
    } from '$lib/state/weatherState';
    import {
        mapViewport,
        activeLayers,
        updateViewport,
        mapReady,
        setMapReady
    } from '$lib/state/mapState';
    import {
        filteredPOIs,
        warningPOIs
    } from '$lib/utils/POIManager';
    
    import MapControls from './MapControls.svelte';
    import RouteLayer from './RouteLayer.svelte';
    import LocationMarker from './LocationMarker.svelte';
    import POIMarkers from './POIMarkers.svelte';
    import InfoWidget from './InfoWidget.svelte';
    import AtmosphereManager from '$lib/utils/AtmosphereManager';
    import { ParticleSystem } from '$lib/utils/ParticelSystem';
    
    // Map-Instanz
    let map: maplibregl.Map;
    let mapContainer: HTMLDivElement;
    let atmosphereManager: AtmosphereManager;
    let particleSystem: ParticleSystem;
    
    // Geräteleistung erkennen
    let deviceCapabilities = $state({
        supportsSkyLayer: true,
        supportsTerrain: true,
        supportsParticles: true,
        performanceTier: 'high' // 'high', 'medium', 'low'
    });
    
    // Lokaler Zustand
    let initialized = $state(false);
    let styleLoaded = $state(false);
    let lastInteraction = $state(Date.now());
    let showSkyLayer = $state(true);
    let show3DTerrain = $state(true);
    let isSettingsOpen = $state(false);
    
    // Map bei Mount initialisieren
    onMount(() => {
        if (!mapContainer) return;
        
        // Gerätefähigkeiten prüfen
        checkDeviceCapabilities();
        
        map = new maplibregl.Map({
            container: mapContainer,
            style: 'mapbox://styles/mapbox/outdoors-v11', // Wird durch benutzerdefinierten Stil ersetzt
            center: [mapViewport.longitude, mapViewport.latitude],
            zoom: mapViewport.zoom,
            pitch: mapViewport.pitch,
            bearing: mapViewport.bearing,
            attributionControl: true,
            maxPitch: 85,
            antialias: true,
            renderWorldCopies: false,
            maxBounds: mapViewport.maxBounds,
            localFontFamily: "'Nunito Sans', sans-serif"
        });
        
        // Event-Handler einrichten
        map.on('load', handleMapLoad);
        map.on('style.load', handleStyleLoad);
        map.on('move', handleMapMove);
        map.on('click', handleMapClick);
        map.on('contextmenu', handleMapRightClick);
        
        // Initialen zeitbasierten Stil setzen
        initialized = true;
    });
    
    onDestroy(() => {
        if (map) {
            map.remove();
        }
        
        if (particleSystem) {
            particleSystem.destroy();
        }
    });
    
    // Gerätefähigkeiten prüfen
    function checkDeviceCapabilities() {
        // Geräteleistung basierend auf Bildschirmgröße und Geräte-Memory schätzen
        const screenSize = window.screen.width * window.screen.height;
        const isLowRes = screenSize < 1280 * 720;
        
        // Performancelevel bestimmen
        let performanceTier = 'high';
        
        if (isLowRes) {
            performanceTier = 'low';
        } else if (navigator.deviceMemory && navigator.deviceMemory < 4) {
            performanceTier = 'medium';
        }
        
        // Native Geräteinformationen abrufen, falls verfügbar
        if (window.capacitor && window.capacitor.Plugins.DeviceInfo) {
            window.capacitor.Plugins.DeviceInfo.getInfo().then((info: any) => {
                if (info.memTotal && info.memTotal < 4000) {
                    performanceTier = 'medium';
                }
                if (info.memTotal && info.memTotal < 2000) {
                    performanceTier = 'low';
                }
            });
        }
        
        // Fähigkeiten basierend auf Leistung setzen
        deviceCapabilities = {
            supportsSkyLayer: performanceTier !== 'low',
            supportsTerrain: performanceTier !== 'low',
            supportsParticles: performanceTier === 'high',
            performanceTier
        };
        
        // UI-Optionen entsprechend anpassen
        showSkyLayer = deviceCapabilities.supportsSkyLayer;
        show3DTerrain = deviceCapabilities.supportsTerrain;
    }
    
    // Map-Load-Event behandeln
    function handleMapLoad() {
        // Map als bereit im globalen Zustand setzen
        setMapReady(true);
    }
    
    // Map-Style-Load-Event behandeln
    function handleStyleLoad() {
        styleLoaded = true;
        
        // Benutzerdefinierte Quellen und Ebenen hinzufügen
        if (show3DTerrain) {
            addTerrainSource();
        }
        
        if (showSkyLayer) {
            addSkyLayer();
        }
        
        addCustomLayers();
        
        // Atmosphäre-Manager initialisieren
        atmosphereManager = new AtmosphereManager(map, deviceCapabilities);
        
        // Wetter-Partikel-System initialisieren, wenn unterstützt
        if (deviceCapabilities.supportsParticles) {
            particleSystem = new ParticleSystem(map, deviceCapabilities);
        }
        
        // Atmosphäre basierend auf Wetter und Zeit aktualisieren
        updateAtmosphere();
    }
    
    // Map aktualisieren, wenn sich der Viewport im Zustand ändert
    $effect(() => {
        if (!map || !initialized) return;
        
        const { longitude, latitude, zoom, pitch, bearing, animate } = mapViewport;
        
        if (animate) {
            map.easeTo({
                center: [longitude, latitude],
                zoom,
                pitch,
                bearing,
                duration: 1000,
                easing: (t) => 1 - Math.pow(1 - t, 3) // Kubische Ease-Out-Funktion
            });
        } else {
            map.jumpTo({
                center: [longitude, latitude],
                zoom,
                pitch,
                bearing
            });
        }
    });
    
    // Map auf aktuelle Position zentrieren, wenn verfügbar
    $effect(() => {
        if (!map || !initialized || !hasLocation || !currentCoordinates) return;
        if (Date.now() - lastInteraction > 10000) { // Nur auto-folgen, wenn keine Interaktion für 10s
            updateViewport({
                longitude: currentCoordinates[0],
                latitude: currentCoordinates[1],
                animate: true
            });
        }
    });
    
    // Atmosphäre basierend auf Wetter und Tageszeit aktualisieren
    $effect(() => {
        if (!map || !styleLoaded || !atmosphereManager) return;
        updateAtmosphere();
    });
    
    // Niederschlagseffekte basierend auf Wetter aktualisieren
    $effect(() => {
        if (!particleSystem || !currentWeather) return;
        
        // Wettereffekte basierend auf Wettercode setzen
        if ($weatherCode) {
            const isRainy = $weatherCode.includes('rain') || $weatherCode.includes('drizzle');
            const isSnowing = $weatherCode.includes('snow');
            const isFoggy = $weatherCode.includes('fog') || $weatherCode.includes('mist');
            
            if (isRainy) {
                particleSystem.setEffect('rain', { 
                    intensity: $weatherCode.includes('heavy') ? 0.8 : 
                              $weatherCode.includes('light') ? 0.3 : 0.5,
                    windDirection: $windDirection,
                    windSpeed: $windSpeed
                });
            } else if (isSnowing) {
                particleSystem.setEffect('snow', { 
                    intensity: $weatherCode.includes('heavy') ? 0.8 : 
                              $weatherCode.includes('light') ? 0.3 : 0.5,
                    windDirection: $windDirection,
                    windSpeed: $windSpeed * 0.5 // Schnee wird weniger vom Wind beeinflusst
                });
            } else if (isFoggy) {
                particleSystem.setEffect('mist', {
                    intensity: $weatherCode.includes('heavy') ? 0.8 : 
                              $weatherCode.includes('light') ? 0.3 : 0.5
                });
            } else {
                particleSystem.clearEffects();
            }
        } else {
            particleSystem.clearEffects();
        }
    });
    
    // Atmosphäre aktualisieren
    function updateAtmosphere() {
        if (!atmosphereManager || !currentWeather) return;
        
        const timeData = {
            timestamp: new Date().getTime(),
            latitude: currentCoordinates ? currentCoordinates[1] : mapViewport.latitude,
            longitude: currentCoordinates ? currentCoordinates[0] : mapViewport.longitude,
            isDaytime: $isDaytime,
            sunrise: $sunrise?.getTime() || new Date().setHours(6, 0, 0, 0),
            sunset: $sunset?.getTime() || new Date().setHours(20, 0, 0, 0)
        };
        
        const weatherData = {
            temperature: $temperature || 15,
            windSpeed: $windSpeed || 0,
            windDirection: $windDirection || 0,
            cloudCover: currentWeather.status === 'success' ? currentWeather.data.cloudiness || 0 : 0,
            weatherCode: $weatherCode || 'clear',
            isRaining: $isRaining || false,
            visibility: currentWeather.status === 'success' ? currentWeather.data.visibility || 10000 : 10000,
            humidity: currentWeather.status === 'success' ? currentWeather.data.humidity || 50 : 50
        };
        
        atmosphereManager.updateAtmosphere(weatherData, timeData);
    }
    
    // 3D-Terrain-Quelle hinzufügen
    function addTerrainSource() {
        try {
            map.addSource('terrain', {
                type: 'raster-dem',
                url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                tileSize: 512,
                maxzoom: 14
            });
            
            map.setTerrain({
                source: 'terrain',
                exaggeration: 1.5
            });
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Terrain-Quelle:', error);
        }
    }
    
    // Himmel-Ebene für atmosphärisches Rendering hinzufügen
    function addSkyLayer() {
        try {
            map.addLayer({
                id: 'sky',
                type: 'sky',
                paint: {
                    'sky-type': 'atmosphere',
                    'sky-atmosphere-sun': [0.0, 90.0],
                    'sky-atmosphere-sun-intensity': $isDaytime ? 15 : 5,
                    'sky-atmosphere-halo-color': $isDaytime ? 'rgba(255, 204, 112, 1.0)' : 'rgba(105, 145, 200, 0.3)',
                    'sky-atmosphere-color': $isDaytime ? 'rgba(186, 210, 235, 1.0)' : 'rgba(25, 35, 60, 1.0)',
                    'sky-opacity': $isDaytime ? 1.0 : 0.8
                }
            });
        } catch (error) {
            console.error('Fehler beim Hinzufügen des Sky-Layers:', error);
        }
    }
    
    // Benutzerdefinierte Ebenen hinzufügen
    function addCustomLayers() {
        try {
            // Gebäudeumrisse hervorheben
            if (map.getLayer('building')) {
                map.setPaintProperty('building', 'fill-extrusion-height', [
                    'interpolate', ['linear'], ['zoom'],
                    15, 0,
                    16, ['get', 'height']
                ]);
                
                map.setPaintProperty('building', 'fill-extrusion-color', [
                    'interpolate', ['linear'], ['zoom'],
                    15, 'transparent',
                    16, '#aaa'
                ]);
            }
            
            // Wege hervorheben
            if (map.getLayer('path')) {
                map.setPaintProperty('path', 'line-color', '#d17a22');
                map.setPaintProperty('path', 'line-width', [
                    'interpolate', ['linear'], ['zoom'],
                    10, 1,
                    16, 3
                ]);
            }
            
            // Fahrradwege hervorheben
            if (map.getLayer('cycleway')) {
                map.setPaintProperty('cycleway', 'line-color', '#4CAF50');
                map.setPaintProperty('cycleway', 'line-width', [
                    'interpolate', ['linear'], ['zoom'],
                    10, 2,
                    16, 4
                ]);
            }
        } catch (error) {
            console.error('Fehler beim Anpassen der Ebenen:', error);
        }
    }
    
    // Map-Move-Events behandeln
    function handleMapMove() {
        if (!map) return;
        
        const center = map.getCenter();
        updateViewport({
            longitude: center.lng,
            latitude: center.lat,
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            bearing: map.getBearing(),
            animate: false
        });
        
        lastInteraction = Date.now();
    }
    
    // Map-Click-Event behandeln
    function handleMapClick(event: maplibregl.MapMouseEvent) {
        // POIs in der Nähe des Klicks prüfen
        checkForPOIs(event.lngLat);
    }
    
    // Map-Rechtsklick-Event behandeln
    function handleMapRightClick(event: maplibregl.MapMouseEvent) {
        // Erweiterte Optionen anzeigen (Kontextmenü)
    }
    
    // Prüft, ob POIs im Bereich des Klicks liegen
    function checkForPOIs(lngLat: maplibregl.LngLat) {
        const pixelRadius = 25; // Klickradius in Pixeln
        
        // POIs durchgehen und Entfernung prüfen
        for (const poi of $filteredPOIs) {
            const poiPoint = map.project([poi.longitude, poi.latitude]);
            const clickPoint = map.project([lngLat.lng, lngLat.lat]);
            
            const dx = poiPoint.x - clickPoint.x;
            const dy = poiPoint.y - clickPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= pixelRadius) {
                // POI auswählen und anzeigen
                showPOI(poi);
                return;
            }
        }
    }
    
    // POI anzeigen (zur POI-Komponente kommunizieren)
    function showPOI(poi: any) {
        // Event an POI-Display-Komponente senden
        window.dispatchEvent(new CustomEvent('show-poi', { detail: poi }));
    }
    
    // Toggle für 3D-Terrain
    function toggleTerrain() {
        show3DTerrain = !show3DTerrain;
        
        if (show3DTerrain) {
            addTerrainSource();
        } else {
            map.setTerrain(null);
        }
    }
    
    // Toggle für Himmel-Ebene
    function toggleSkyLayer() {
        showSkyLayer = !showSkyLayer;
        
        if (showSkyLayer) {
            addSkyLayer();
        } else {
            if (map.getLayer('sky')) {
                map.removeLayer('sky');
            }
        }
    }
    
    // Einstellungen ein-/ausblenden
    function toggleSettings() {
        isSettingsOpen = !isSettingsOpen;
    }
</script>

<div class="map-container h-full w-full" bind:this={mapContainer}>
    <!-- Info-Widget für aktuelle Daten -->
    <InfoWidget />
    
    {#if map && mapReady}
        <RouteLayer {map} />
        <LocationMarker {map} />
        <POIMarkers {map} pois={$filteredPOIs} />
        <MapControls 
            {map} 
            showTerrain={show3DTerrain} 
            showSky={showSkyLayer}
            on:toggleTerrain={toggleTerrain}
            on:toggleSky={toggleSkyLayer}
            on:toggleSettings={toggleSettings}
        />
    {/if}
    
    <!-- Einstellungen-Panel -->
    {#if isSettingsOpen}
        <div class="settings-panel" transition:slide={{ duration: 300 }}>
            <h3>Karteneinstellungen</h3>
            
            <div class="settings-group">
                <h4>Darstellung</h4>
                <label class="setting-item">
                    <span>3D-Terrain</span>
                    <input type="checkbox" bind:checked={show3DTerrain} on:change={toggleTerrain} />
                    <div class="toggle-switch"></div>
                </label>
                
                <label class="setting-item">
                    <span>Himmel-Effekte</span>
                    <input type="checkbox" bind:checked={showSkyLayer} on:change={toggleSkyLayer} />
                    <div class="toggle-switch"></div>
                </label>
                
                <label class="setting-item">
                    <span>Wetter-Partikel</span>
                    <input type="checkbox" checked={deviceCapabilities.supportsParticles} disabled={!deviceCapabilities.supportsParticles} />
                    <div class="toggle-switch {!deviceCapabilities.supportsParticles ? 'disabled' : ''}"></div>
                </label>
                
                <label class="setting-item">
                    <span>Kartenstil</span>
                    <select>
                        <option>Outdoor</option>
                        <option>Satellit</option>
                        <option>Straßen</option>
                        <option>Dunkel</option>
                    </select>
                </label>
            </div>
            
            <div class="settings-group">
                <h4>Navigation</h4>
                <label class="setting-item">
                    <span>Automatisches Folgen</span>
                    <input type="checkbox" checked={true} />
                    <div class="toggle-switch"></div>
                </label>
                
                <label class="setting-item">
                    <span>Nord ausrichten</span>
                    <button class="action-button" on:click={() => updateViewport({ bearing: 0, animate: true })}>
                        Ausrichten
                    </button>
                </label>
            </div>
            
            <div class="settings-group">
                <h4>Leistung</h4>
                <div class="setting-item">
                    <span>Leistungsmodus</span>
                    <select>
                        <option selected={deviceCapabilities.performanceTier === 'high'}>Hoch</option>
                        <option selected={deviceCapabilities.performanceTier === 'medium'}>Mittel</option>
                        <option selected={deviceCapabilities.performanceTier === 'low'}>Niedrig</option>
                    </select>
                </div>
                
                <div class="device-info">
                    <p>Geräteleistung: {deviceCapabilities.performanceTier.toUpperCase()}</p>
                    <p>Optimierte Features wurden automatisch angepasst.</p>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .map-container {
        position: relative;
    }
    
    :global(.maplibregl-map) {
        font-family: 'Nunito Sans', sans-serif;
    }
    
    .settings-panel {
        position: absolute;
        top: 0;
        right: 0;
        width: 300px;
        max-width: 90vw;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        color: white;
        padding: 20px;
        z-index: 20;
        overflow-y: auto;
    }
    
    .settings-group {
        margin-bottom: 24px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
    }
    
    .settings-group h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        opacity: 0.9;
    }
    
    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .setting-item:last-child {
        border-bottom: none;
    }
    
    .toggle-switch {
        position: relative;
        width: 44px;
        height: 22px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .toggle-switch::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        background: white;
        border-radius: 50%;
        transition: transform 0.3s ease;
    }
    
    .toggle-switch.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    input[type="checkbox"] {
        display: none;
    }
    
    input[type="checkbox"]:checked + .toggle-switch {
        background: #4CAF50;
    }
    
    input[type="checkbox"]:checked + .toggle-switch::after {
        transform: translateX(22px);
    }
    
    select, .action-button {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
    }
    
    .action-button {
        cursor: pointer;
        transition: background 0.2s ease;
    }
    
    .action-button:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    .device-info {
        margin-top: 12px;
        font-size: 12px;
        opacity: 0.7;
    }
    
    .device-info p {
        margin: 4px 0;
    }
</style>