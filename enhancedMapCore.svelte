<!-- EnhancedMapCore.svelte -->
<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { $effect, $state } from 'svelte';
    import maplibregl from 'maplibre-gl';
    import 'maplibre-gl/dist/maplibre-gl.css';
    
    import { DeviceCapabilityDetector } from '$lib/utils/DeviceCapabilityDetector';
    import { updateViewport } from '$lib/state/mapState';
    import { LayerManager } from '$lib/utils/LayerManager';
    import { BatteryAwareRenderer } from '$lib/utils/BatteryAwareRenderer';
    import { MapStyleProvider } from '$lib/utils/MapStyleProvider';
    import { OfflineStorageManager } from '$lib/utils/OfflineStorageManager';
    
    // Props
    export let mapContainer: HTMLDivElement;
    export let initialViewport = {
        longitude: 0,
        latitude: 0,
        zoom: 3,
        pitch: 0,
        bearing: 0
    };
    export let enableTerrain = true;
    export let enableAtmosphericEffects = true;
    export let enableTouchOptimizations = true;
    export let mapStyle = 'outdoor'; // 'outdoor', 'satellite', 'streets', 'light', 'dark'
    
    // Event dispatcher für Kommunikation mit übergeordneten Komponenten
    const dispatch = createEventDispatcher();
    
    // Lokale Zustände
    let map: maplibregl.Map;
    let layerManager: LayerManager;
    let batteryAwareRenderer: BatteryAwareRenderer;
    let deviceDetector = new DeviceCapabilityDetector();
    let styleProvider = new MapStyleProvider();
    let offlineManager = new OfflineStorageManager();
    
    let isOnline = $state(navigator.onLine);
    let loadingProgress = $state(0);
    let mapReady = $state(false);
    let currentFps = $state(60);
    let gpsAccuracy = $state<number | null>(null);
    let resizeObserver: ResizeObserver;
    
    // Map-Mount mit optimierter Initialisierung
    onMount(async () => {
        // Online-Status überwachen
        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);
        
        // Gerätefähigkeiten erkennen
        const capabilities = deviceDetector.detectCapabilities();
        
        // Animationsframe-Management
        batteryAwareRenderer = new BatteryAwareRenderer(capabilities.batteryStatus);
        
        // Dispatch Ressourcen-Update
        dispatch('resourceupdate', {
            deviceTier: capabilities.performanceTier,
            batteryStatus: capabilities.batteryStatus,
            connectionType: capabilities.connectionType
        });
        
        // Lädt den passenden Kartenstil
        const baseStyle = await loadMapStyle(mapStyle, capabilities, isOnline);
        
        // Erstellt die Map mit optimierten Einstellungen
        try {
            map = new maplibregl.Map({
                container: mapContainer,
                style: baseStyle,
                center: [initialViewport.longitude, initialViewport.latitude],
                zoom: initialViewport.zoom,
                pitch: initialViewport.pitch,
                bearing: initialViewport.bearing,
                attributionControl: true,
                maxPitch: capabilities.performanceTier === 'low' ? 60 : 85,
                antialias: capabilities.performanceTier !== 'low',
                renderWorldCopies: true,
                localFontFamily: "'Nunito Sans', sans-serif",
                fadeDuration: capabilities.performanceTier === 'high' ? 300 : 0,
                optimizeForTerrain: enableTerrain && capabilities.supportsTerrain,
                maxTileCacheSize: determineMaxTileCacheSize(capabilities),
                preserveDrawingBuffer: true // Ermöglicht Screenshot-Funktionalität
            });
            
            // Touch-Optimierungen für mobile Geräte
            if (enableTouchOptimizations) {
                optimizeTouchInteractions(map);
            }
            
            // Map-Ereignisse einrichten
            map.on('load', handleMapLoad);
            map.on('move', handleMapMove);
            map.on('moveend', handleMapMoveEnd);
            map.on('error', handleMapError);
            map.on('data', handleDataLoading);
            
            // Progressive Loading für Tiles
            if (capabilities.performanceTier !== 'low') {
                map.once('idle', () => {
                    // Vorausladen von Tiles für bessere Offline-Fähigkeit
                    preloadSurroundingTiles(map, initialViewport);
                });
            }
            
            // FPS-Monitor für Performance-Überwachung
            startFpsMonitoring();
            
            // ResizeObserver für responsive Anpassungen
            setupResizeObserver();
            
        } catch (error) {
            console.error('Fehler bei Map-Initialisierung:', error);
            // Fallback-Styling und vereinfachte Karte
            applyFallbackMapStyle();
        }
        
        // Cleanup bei Komponenten-Zerstörung
        return () => {
            window.removeEventListener('online', handleOnlineStatusChange);
            window.removeEventListener('offline', handleOnlineStatusChange);
            batteryAwareRenderer?.dispose();
            resizeObserver?.disconnect();
            map?.remove();
        };
    });
    
    /**
     * Lädt den Kartenstil mit Offline-Fallback
     */
    async function loadMapStyle(style: string, capabilities: any, online: boolean): Promise<any> {
        try {
            // Prüft zuerst den Offline-Cache
            const cachedStyle = await offlineManager.getMapStyle(style);
            if (!online || !cachedStyle) {
                return cachedStyle || styleProvider.getFallbackStyle(style, capabilities);
            }
            
            // Lädt den Stil basierend auf Gerätefähigkeiten
            const mapStyle = await styleProvider.getMapStyle(style, capabilities);
            
            // Speichert für Offline-Nutzung
            await offlineManager.saveMapStyle(style, mapStyle);
            
            return mapStyle;
        } catch (error) {
            console.warn('Fehler beim Laden des Kartenstils:', error);
            return styleProvider.getFallbackStyle(style, capabilities);
        }
    }
    
    /**
     * Bestimmt die optimale Tile-Cache-Größe basierend auf Gerätefähigkeiten
     */
    function determineMaxTileCacheSize(capabilities: any): number {
        // Anpassung an verschiedene Geräte
        if (capabilities.performanceTier === 'low') {
            return 50; // Kleinerer Cache für leistungsschwache Geräte
        } else if (capabilities.performanceTier === 'medium') {
            return 200; // Mittlerer Cache
        } else {
            return 500; // Großer Cache für High-End-Geräte
        }
    }
    
    /**
     * Optimiert Touch-Interaktionen für mobile Geräte
     */
    function optimizeTouchInteractions(map: maplibregl.Map): void {
        // Aktiviert reibungslose Touch-Gesten
        map.touchZoomRotate.enable({ around: 'center' });
        map.touchPitch.enable();
        
        // Verbesserte Trägheit für natürlicheres Gefühl
        map.dragPan.enable({
            linearity: 0.3,
            maxSpeed: 1400,
            deceleration: 2500,
            inertia: true
        });
        
        // Besseres Zoomen auf Touch-Geräten
        const nav = new maplibregl.NavigationControl({ 
            visualizePitch: true,
            showZoom: true,
            showCompass: true
        });
        map.addControl(nav, 'top-right');
        
        // Maßstabsanzeige (wichtig für Outdoor-Navigation)
        const scale = new maplibregl.ScaleControl({
            maxWidth: 150,
            unit: 'metric'
        });
        map.addControl(scale, 'bottom-left');
        
        // Verhindert Browser-Gesten während Karteninteraktion
        mapContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    /**
     * Richtet 3D-Terrain ein, wenn unterstützt
     */
    function setupTerrain(): void {
        if (!enableTerrain) return;
        
        try {
            // DEM-Quelle hinzufügen
            map.addSource('terrain-source', {
                'type': 'raster-dem',
                'url': 'https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=get_your_own_key',
                'tileSize': 256
            });
            
            // Terrain aktivieren
            map.setTerrain({
                'source': 'terrain-source',
                'exaggeration': 1.2
            });
            
            // Hügel-Schatten für bessere Visualisierung
            map.addLayer({
                'id': 'hillshading',
                'source': 'terrain-source',
                'type': 'hillshade',
                'paint': {
                    'hillshade-illumination-direction': 335,
                    'hillshade-exaggeration': 0.6,
                    'hillshade-shadow-color': 'rgba(0, 0, 0, 0.25)'
                }
            }, 'land-structure');
            
        } catch (error) {
            console.warn('Terrain-Setup fehlgeschlagen, es wird auf 2D-Modus zurückgegriffen', error);
        }
    }
    
    /**
     * Erstellt einen Fallback-Kartenstil für Offline-/Fehler-Situationen
     */
    function applyFallbackMapStyle(): void {
        if (!map) return;
        
        const fallbackStyle = {
            version: 8,
            sources: {
                'simple-tiles': {
                    type: 'raster',
                    tiles: ['/assets/offline-tiles/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    minzoom: 0,
                    maxzoom: 16
                }
            },
            layers: [
                {
                    id: 'simple-tiles',
                    type: 'raster',
                    source: 'simple-tiles',
                    minzoom: 0,
                    maxzoom: 22
                }
            ]
        };
        
        map.setStyle(fallbackStyle);
    }
    
    /**
     * Vorlädt umliegende Tiles für besseres Offline-Erlebnis
     */
    function preloadSurroundingTiles(map: maplibregl.Map, viewport: any): void {
        // Berechnet einen erweiterten Bereich um den aktuellen Viewport
        const center = [viewport.longitude, viewport.latitude];
        const zoom = viewport.zoom;
        
        // Erweiterten Kartenbereich berechnen
        const bounds = map.getBounds();
        const extendedBounds = bounds.extend([
            bounds.getEast() + (bounds.getEast() - bounds.getWest()) * 0.2,
            bounds.getNorth() + (bounds.getNorth() - bounds.getSouth()) * 0.2
        ]).extend([
            bounds.getWest() - (bounds.getEast() - bounds.getWest()) * 0.2,
            bounds.getSouth() - (bounds.getNorth() - bounds.getSouth()) * 0.2
        ]);
        
        // Tiles vorladen (indem wir kurz dorthin bewegen und zurück)
        const originalCenter = map.getCenter();
        const originalZoom = map.getZoom();
        
        // Schnell zu den Ecken bewegen und zurück
        const preloadCorners = async () => {
            const corners = [
                extendedBounds.getNorthEast(),
                extendedBounds.getNorthWest(),
                extendedBounds.getSouthEast(),
                extendedBounds.getSouthWest()
            ];
            
            for (const corner of corners) {
                // Bewegt die Karte kurz dorthin, um Tiles zu laden
                map.jumpTo({
                    center: [corner.lng, corner.lat],
                    zoom: zoom - 1
                });
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Zurück zur ursprünglichen Position
            map.jumpTo({
                center: originalCenter,
                zoom: originalZoom
            });
        };
        
        setTimeout(preloadCorners, 1000);
    }
    
    /**
     * Startet FPS-Überwachung für Performance-Optimierungen
     */
    function startFpsMonitoring(): void {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const countFrames = () => {
            frameCount++;
            const now = performance.now();
            const elapsed = now - lastTime;
            
            if (elapsed >= 1000) {
                currentFps = Math.round(frameCount / (elapsed / 1000));
                frameCount = 0;
                lastTime = now;
                
                // Performance-basierte Anpassungen
                if (map && currentFps < 30) {
                    applyLowFpsOptimizations();
                }
            }
            
            // Verwende batterie-bewusstes Rendering
            batteryAwareRenderer.scheduleFrame(countFrames);
        };
        
        batteryAwareRenderer.scheduleFrame(countFrames);
    }
    
    /**
     * Wendet Optimierungen an, wenn die FPS niedrig ist
     */
    function applyLowFpsOptimizations(): void {
        if (!map || !layerManager) return;
        
        // Reduziere Details
        layerManager.updateLayers({
            performanceMode: 'low'
        });
        
        // Deaktiviere teure visuelle Effekte
        map.easeTo({
            pitch: Math.min(30, map.getPitch()),
            duration: 500
        });
        
        // Reduziere Animation-Framerates
        batteryAwareRenderer.setLowPerformanceMode(true);
    }
    
    /**
     * Richtet ResizeObserver für Responsive-Verhalten ein
     */
    function setupResizeObserver(): void {
        if (!mapContainer) return;
        
        resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                // Karte anpassen, wenn Container-Größe sich ändert
                if (map) {
                    map.resize();
                }
            }
        });
        
        resizeObserver.observe(mapContainer);
    }
    
    /**
     * Behandelt Online/Offline-Statusänderungen
     */
    function handleOnlineStatusChange(event: Event): void {
        isOnline = navigator.onLine;
        
        // Im Offline-Modus Warnhinweis anzeigen
        if (!isOnline && map) {
            dispatch('offline', { mapHasCachedTiles: offlineManager.hasCachedTiles() });
            
            // Offline-Banner anzeigen
            showOfflineIndicator();
        }
    }
    
    /**
     * Zeigt einen Offline-Indikator auf der Karte an
     */
    function showOfflineIndicator(): void {
        // Falls wir bereits im DOM sind
        const existingIndicator = document.getElementById('offline-map-indicator');
        if (existingIndicator) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'offline-map-indicator';
        indicator.className = 'offline-indicator';
        indicator.innerHTML = `
            <div class="offline-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                    <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                    <line x1="12" y1="20" x2="12.01" y2="20"></line>
                </svg>
                <span>Offline-Modus</span>
            </div>
        `;
        
        // Zu Container hinzufügen
        mapContainer.appendChild(indicator);
        
        // Animation hinzufügen
        setTimeout(() => {
            indicator.style.opacity = "0.8";
        }, 10);
        
        // Nach 5 Sekunden ausblenden
        setTimeout(() => {
            indicator.style.opacity = "0";
            setTimeout(() => {
                try {
                    mapContainer.removeChild(indicator);
                } catch(e) {}
            }, 300);
        }, 5000);
    }
    
    /**
     * Behandelt Map-Load-Event
     */
    function handleMapLoad(): void {
        // Layer-Manager initialisieren
        layerManager = new LayerManager(map, deviceDetector.getCapabilities());
        
        // Terrain einrichten, wenn unterstützt
        if (enableTerrain && deviceDetector.getCapabilities().supportsTerrain) {
            setupTerrain();
        }
        
        // Atmosphärische Effekte hinzufügen
        if (enableAtmosphericEffects && deviceDetector.getCapabilities().supportsAtmosphericEffects) {
            setupAtmosphericEffects();
        }
        
        // Integriert OSM-POIs
        loadPointsOfInterest();
        
        // PerformanceTier aktualisieren basierend auf FPS
        initPerformanceMonitoring();
        
        // GPS-Genauigkeitsanzeige initialisieren
        initializeGpsAccuracyIndicator();
        
        mapReady = true;
        
        // Map-Ready-Event auslösen
        dispatch('mapready', { map, layerManager });
    }
    
    /**
     * Richtet atmosphärische Effekte ein
     */
    function setupAtmosphericEffects(): void {
        try {
            // Fügt Himmel-Layer hinzu für Sonnenstand-basierte Effekte
            map.addLayer({
                'id': 'sky',
                'type': 'sky',
                'paint': {
                    'sky-type': 'atmosphere',
                    'sky-atmosphere-sun': [0.0, 90.0],
                    'sky-atmosphere-sun-intensity': 15
                }
            });
            
            // Lichtsimulation für realistischen Schattenwurf
            map.setLight({
                anchor: 'viewport',
                color: 'white',
                intensity: 0.4,
                position: [1, 90, 300]
            });
            
        } catch (error) {
            console.warn('Atmosphärische Effekte werden nicht unterstützt', error);
        }
    }
    
    /**
     * Lädt POIs aus OpenStreetMap
     */
    async function loadPointsOfInterest(): Promise<void> {
        if (!map || !isOnline) return;
        
        try {
            const bounds = map.getBounds();
            const bbox = [
                bounds.getWest(),
                bounds.getSouth(),
                bounds.getEast(),
                bounds.getNorth()
            ].join(',');
            
            // OpenStreetMap Overpass API mit begrenzter Anzahl POIs
            const query = `
                [out:json][timeout:25];
                (
                  node["amenity"="drinking_water"](${bbox});
                  node["natural"="spring"](${bbox});
                  node["amenity"="shelter"](${bbox});
                  node["tourism"="camp_site"](${bbox});
                );
                out body;
            `;
            
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodedQuery}`);
            
            if (!response.ok) throw new Error('Overpass API Fehler');
            
            const data = await response.json();
            
            // In lokalem Cache für Offline-Nutzung speichern
            await offlineManager.savePointsOfInterest(bounds, data.elements);
            
            // Zur Karte hinzufügen
            addPoisToMap(data.elements);
            
        } catch (error) {
            console.warn('Fehler beim Laden der POIs:', error);
            
            // Versuche, POIs aus Offline-Cache zu laden
            const offlinePois = await offlineManager.getPointsOfInterest(map.getBounds());
            if (offlinePois?.length) {
                addPoisToMap(offlinePois);
            }
        }
    }
    
    /**
     * Fügt POIs zur Karte hinzu
     */
    function addPoisToMap(pois: any[]): void {
        if (!map) return;
        
        // POI-Source erstellen oder aktualisieren
        let source = map.getSource('pois-source');
        
        const geojson = {
            type: 'FeatureCollection',
            features: pois.map(poi => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [poi.lon, poi.lat]
                },
                properties: {
                    id: poi.id,
                    type: poi.tags?.amenity || poi.tags?.natural || poi.tags?.tourism,
                    name: poi.tags?.name || '',
                    tags: poi.tags
                }
            }))
        };
        
        if (source) {
            // Source aktualisieren
            (source as maplibregl.GeoJSONSource).setData(geojson);
        } else {
            // Neue Source erstellen
            map.addSource('pois-source', {
                type: 'geojson',
                data: geojson,
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50
            });
            
            // Cluster-Layer hinzufügen
            map.addLayer({
                id: 'poi-clusters',
                type: 'circle',
                source: 'pois-source',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#51bbd6',
                        10,
                        '#f1f075',
                        25,
                        '#f28cb1'
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20,
                        10,
                        25,
                        25,
                        30
                    ],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                }
            });
            
            // Cluster-Texte hinzufügen
            map.addLayer({
                id: 'poi-cluster-count',
                type: 'symbol',
                source: 'pois-source',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                },
                paint: {
                    'text-color': '#ffffff'
                }
            });
            
            // POI-Symbole hinzufügen
            map.addLayer({
                id: 'poi-markers',
                type: 'symbol',
                source: 'pois-source',
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'icon-image': [
                        'match',
                        ['get', 'type'],
                        'drinking_water', 'water',
                        'spring', 'water',
                        'shelter', 'shelter',
                        'camp_site', 'campsite',
                        'marker' // default
                    ],
                    'icon-size': 0.8,
                    'icon-allow-overlap': false,
                    'text-field': ['get', 'name'],
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-offset': [0, 1.2],
                    'text-size': 12,
                    'text-max-width': 9,
                    'text-anchor': 'top'
                },
                paint: {
                    'text-color': '#333',
                    'text-halo-color': '#fff',
                    'text-halo-width': 1
                }
            });
            
            // Klick-Event für POIs
            map.on('click', 'poi-markers', handlePoiClick);
            map.on('click', 'poi-clusters', handleClusterClick);
            
            // Hover-Effekte
            map.on('mouseenter', 'poi-markers', () => {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'poi-markers', () => {
                map.getCanvas().style.cursor = '';
            });
        }
    }
    
    /**
     * Behandelt Klicks auf POIs
     */
    function handlePoiClick(e: any): void {
        if (!map || !e.features[0]) return;
        
        const feature = e.features[0];
        const coords = feature.geometry.coordinates.slice();
        
        // POI-Details abrufen
        const properties = feature.properties;
        const tags = properties.tags;
        
        // HTML für Popup erstellen
        const html = `
            <div class="poi-popup">
                <h3>${properties.name || properties.type}</h3>
                ${properties.name ? `<p><strong>Typ:</strong> ${properties.type}</p>` : ''}
                ${tags && Object.keys(tags).length > 0 ? 
                    `<div class="poi-details">
                        ${Object.entries(tags)
                            .filter(([key]) => !['name', 'type'].includes(key))
                            .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                            .join('')}
                    </div>` : ''
                }
                <div class="poi-actions">
                    <button class="navigate-btn">Navigation starten</button>
                    <button class="save-btn">Speichern</button>
                </div>
            </div>
        `;
        
        // Popup erstellen und anzeigen
        const popup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '300px',
            className: 'custom-popup'
        })
        .setLngLat(coords)
        .setHTML(html)
        .addTo(map);
        
        // Event-Listener für Popup-Buttons
        setTimeout(() => {
            const navigateBtn = document.querySelector('.navigate-btn');
            if (navigateBtn) {
                navigateBtn.addEventListener('click', () => {
                    dispatch('navigate', { coordinates: coords, name: properties.name || properties.type });
                    popup.remove();
                });
            }
            
            const saveBtn = document.querySelector('.save-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    dispatch('savepoi', { 
                        coordinates: coords, 
                        properties: properties 
                    });
                    popup.remove();
                });
            }
        }, 100);
    }
    
    /**
     * Behandelt Klicks auf Cluster
     */
    function handleClusterClick(e: any): void {
        if (!map || !e.features[0]) return;
        
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['poi-clusters']
        });
        
        const clusterId = features[0].properties.cluster_id;
        (map.getSource('pois-source') as maplibregl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;
                
                map.easeTo({
                    center: (features[0].geometry as any).coordinates,
                    zoom: zoom
                });
            }
        );
    }
    
    /**
     * Initialisiert GPS-Genauigkeitsanzeige
     */
    function initializeGpsAccuracyIndicator(): void {
        // Event-Listener für GPS-Updates hinzufügen
        document.addEventListener('gps-accuracy-update', (event: any) => {
            try {
                gpsAccuracy = event.detail.accuracy;
                updateGpsAccuracyRing();
            } catch (e) {
                console.warn('Fehler beim Aktualisieren der GPS-Genauigkeitsanzeige', e);
            }
        });
    }
    
    /**
     * Aktualisiert den GPS-Genauigkeits-Ring
     */
    function updateGpsAccuracyRing(): void {
        if (!map || gpsAccuracy === null) return;
        
        // Bestehenden Ring finden oder erstellen
        let accuracyRing = document.getElementById('gps-accuracy-ring');
        
        if (!accuracyRing) {
            accuracyRing = document.createElement('div');
            accuracyRing.id = 'gps-accuracy-ring';
            accuracyRing.className = 'gps-accuracy-ring';
            mapContainer.appendChild(accuracyRing);
        }
        
        // Pixelgröße für die Genauigkeit berechnen
        const center = map.project(map.getCenter());
        const offsetPoint = map.project([
            map.getCenter().lng + (0.001 * gpsAccuracy / 111), // 1 Grad = ca. 111km
            map.getCenter().lat
        ]);
        
        const pixelRadius = Math.abs(offsetPoint.x - center.x);
        
        // Ring aktualisieren
        accuracyRing.style.width = `${pixelRadius * 2}px`;
        accuracyRing.style.height = `${pixelRadius * 2}px`;
        accuracyRing.style.borderRadius = '50%';
        accuracyRing.style.position = 'absolute';
        accuracyRing.style.top = '50%';
        accuracyRing.style.left = '50%';
        accuracyRing.style.transform = 'translate(-50%, -50%)';
        accuracyRing.style.border = '2px solid rgba(59, 130, 246, 0.6)';
        accuracyRing.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
        accuracyRing.style.pointerEvents = 'none';
        accuracyRing.style.zIndex = '10';
    }
    
    /**
     * Initialisiert Performance-Überwachung
     */
    function initPerformanceMonitoring(): void {
        // FPS-basierte Optimierungen
        $effect(() => {
            if (currentFps < 30 && layerManager) {
                // Performance-Optimierungen
                layerManager.updateLayers({
                    performanceMode: 'low'
                });
                
                // Informiere übergeordnete Komponenten
                dispatch('performanceissue', { fps: currentFps });
            }
        });
    }
    
    /**
     * Behandelt Karten-Bewegungsereignisse
     */
    function handleMapMove(): void {
        // Globalen Zustand aktualisieren
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
    }
    
    /**
     * Behandelt Ende von Karten-Bewegungen
     */
    function handleMapMoveEnd(): void {
        // POIs für den neuen Bereich laden
        if (isOnline && map) {
            loadPointsOfInterest();
        }
        
        // Informiere übergeordnete Komponenten
        dispatch('mapmove', {
            center: map.getCenter(),
            zoom: map.getZoom(),
            bounds: map.getBounds()
        });
    }
    
    /**
     * Behandelt Karten-Fehler
     */
    function handleMapError(error: any): void {
        console.error('Map-Fehler:', error);
        
        // Auf Offline-Modus umschalten bei Netzwerkproblemen
        if (error.error?.status === 404 || error.error?.status === 503) {
            isOnline = false;
            applyFallbackMapStyle();
        }
        
        // Informiere übergeordnete Komponenten
        dispatch('maperror', { error });
    }
    
    /**
     * Aktualisiert Ladefortschritt während Daten geladen werden
     */
    function handleDataLoading(e: any): void {
        if (!map || e.dataType !== 'source') return;
        
        if (map.areTilesLoaded()) {
            loadingProgress = 100;
        } else {
            // Geschätzter Fortschritt basierend auf geladenen Quellen
            // Dies ist eine Approximation
            const sourceLen = Object.keys(map.style.sourceCaches).length;
            const loadedLen = Object.keys(map.style.sourceCaches).filter(id => {
                const source = map.style.sourceCaches[id];
                return source && source.loaded();
            }).length;
            
            loadingProgress = Math.min(100, Math.floor((loadedLen / Math.max(1, sourceLen)) * 100));
        }
    }
</script>

<!-- Map-Container mit Ladeindikator -->
<div class="map-wrapper relative w-full h-full">
    <!-- Loading-Indikator -->
    {#if loadingProgress < 100}
        <div class="loading-overlay absolute inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
            <div class="loading-container text-center">
                <div class="loading-spinner mb-2 w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div class="loading-text text-white">Karte wird geladen ({loadingProgress}%)</div>
            </div>
        </div>
    {/if}
    
    <!-- FPS-Anzeige für Debugging -->
    {#if import.meta.env.DEV}
        <div class="fps-counter absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-50">
            FPS: {currentFps}
        </div>
    {/if}
    
    <!-- GPS-Genauigkeitsanzeige wird dynamisch hinzugefügt -->
</div>

<style>
    .map-wrapper {
        -webkit-tap-highlight-color: transparent;
        overscroll-behavior: none;
        touch-action: none;
        user-select: none;
    }
    
    .loading-overlay {
        transition: opacity 0.3s ease;
    }
    
    .loading-spinner {
        animation: spin 1s linear infinite;
    }
    
    .offline-indicator {
        position: absolute;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #ef4444;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .offline-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .custom-popup .maplibregl-popup-content {
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    }
    
    .poi-popup h3 {
        margin: 0 0 8px 0;
        font-weight: 600;
        border-bottom: 1px solid #eee;
        padding-bottom: 8px;
    }
    
    .poi-details {
        margin: 8px 0;
        max-height: 150px;
        overflow-y: auto;
    }
    
    .poi-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }
    
    .poi-actions button {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        border: none;
    }
    
    .navigate-btn {
        background-color: #3b82f6;
        color: white;
    }
    
    .save-btn {
        background-color: #e5e7eb;
    }
    
    @media (max-width: 640px) {
        .custom-popup .maplibregl-popup-content {
            max-width: 80vw !important;
        }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>