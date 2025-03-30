<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { $effect, $state } from 'svelte';
    import { fly } from 'svelte/transition';
    import { Motion } from 'motion';
    
    import { mapViewport, updateViewport } from '$lib/state/mapState';
    import { currentCoordinates, hasLocation } from '$lib/state/locationState';
    
    // Props
    export let map: maplibregl.Map;
    export let showTerrain: boolean = true;
    export let showSky: boolean = true;
    
    // Event-Dispatcher für Kommunikation mit Elternkomponente
    const dispatch = createEventDispatcher();
    
    // Lokaler Zustand
    let isControlsExpanded = $state(false);
    let controlsTimeout: number | null = $state(null);
    let compassVisible = $state(false);
    let scaleVisible = $state(true);
    let compassElement: HTMLDivElement;
    
    // Compass-Rotation basierend auf Map-Bearing aktualisieren
    $effect(() => {
        if (!map || !compassElement) return;
        
        compassElement.style.transform = `rotate(${-mapViewport.bearing}deg)`;
    });
    
    // Steuerungen ein-/ausklappen
    function toggleControls() {
        isControlsExpanded = !isControlsExpanded;
        
        // Auto-Collapse nach 5 Sekunden, wenn nicht interagiert
        if (isControlsExpanded) {
            if (controlsTimeout) {
                clearTimeout(controlsTimeout);
            }
            
            controlsTimeout = setTimeout(() => {
                isControlsExpanded = false;
            }, 5000);
        }
    }
    
    // Event-Handler für die Zoom-Buttons
    function handleZoomIn() {
        updateViewport({
            zoom: Math.min(mapViewport.zoom + 1, 20),
            animate: true
        });
    }
    
    function handleZoomOut() {
        updateViewport({
            zoom: Math.max(mapViewport.zoom - 1, 0),
            animate: true
        });
    }
    
    // Event-Handler für die Pitch-Buttons (3D-Perspektive)
    function handlePitchUp() {
        updateViewport({
            pitch: Math.min(mapViewport.pitch + 15, 85),
            animate: true
        });
    }
    
    function handlePitchDown() {
        updateViewport({
            pitch: Math.max(mapViewport.pitch - 15, 0),
            animate: true
        });
    }
    
    // Event-Handler für die Bearing-Buttons (Rotation)
    function handleRotateLeft() {
        updateViewport({
            bearing: (mapViewport.bearing - 30) % 360,
            animate: true
        });
    }
    
    function handleRotateRight() {
        updateViewport({
            bearing: (mapViewport.bearing + 30) % 360,
            animate: true
        });
    }
    
    // Karte nach Norden ausrichten
    function handleResetNorth() {
        updateViewport({
            bearing: 0,
            animate: true
        });
    }
    
    // Karte zurücksetzen (Neigung und Rotation)
    function handleResetView() {
        updateViewport({
            pitch: 0,
            bearing: 0,
            animate: true
        });
    }
    
    // Zum aktuellen Standort zentrieren
    function handleCenterLocation() {
        if (!hasLocation || !currentCoordinates) return;
        
        updateViewport({
            longitude: currentCoordinates[0],
            latitude: currentCoordinates[1],
            zoom: 16,
            animate: true
        });
    }
    
    // 3D-Terrain ein-/ausschalten
    function handleToggleTerrain() {
        dispatch('toggleTerrain');
    }
    
    // Himmel-Ebene ein-/ausschalten
    function handleToggleSky() {
        dispatch('toggleSky');
    }
    
    // Einstellungen öffnen
    function handleOpenSettings() {
        dispatch('toggleSettings');
    }
    
    // Kompass ein-/ausblenden
    function toggleCompass() {
        compassVisible = !compassVisible;
    }
    
    // Scale ein-/ausblenden
    function toggleScale() {
        scaleVisible = !scaleVisible;
        
        if (scaleVisible) {
            if (!map.hasControl(scale)) {
                map.addControl(scale, 'bottom-left');
            }
        } else {
            if (map.hasControl(scale)) {
                map.removeControl(scale);
            }
        }
    }
    
    // MapLibre-Steuerelemente einstellen
    onMount(() => {
        // Scale-Control hinzufügen
        if (scaleVisible) {
            map.addControl(scale, 'bottom-left');
        }
    });
</script>

<!-- Haupt-Steuerungsbereich -->
<div class="map-controls">
    <!-- Kompass (wenn sichtbar) -->
    {#if compassVisible}
        <div class="compass-container" transition:fly={{ y: -20, duration: 300 }}>
            <div class="compass" bind:this={compassElement}>
                <div class="compass-north">N</div>
                <div class="compass-east">O</div>
                <div class="compass-south">S</div>
                <div class="compass-west">W</div>
                <div class="compass-needle"></div>
            </div>
        </div>
    {/if}
    
    <!-- Hauptsteuerung -->
    <div class="control-panel">
        <!-- Toggle-Button für erweiterte Steuerungen -->
        <button class="control-button toggle-button" on:click={toggleControls}>
            <i class="control-icon icon-{isControlsExpanded ? 'collapse' : 'expand'}"></i>
        </button>
        
        <!-- Erweiterte Steuerungen -->
        {#if isControlsExpanded}
            <div class="expanded-controls" transition:fly={{ y: 20, duration: 300 }}>
                <!-- Zoom-Steuerung -->
                <div class="control-group">
                    <button class="control-button" on:click={handleZoomIn}>
                        <i class="control-icon icon-plus"></i>
                    </button>
                    <button class="control-button" on:click={handleZoomOut}>
                        <i class="control-icon icon-minus"></i>
                    </button>
                </div>
                
                <!-- Pitch-Steuerung (3D-Perspektive) -->
                <div class="control-group">
                    <button class="control-button" on:click={handlePitchUp}>
                        <i class="control-icon icon-pitch-up"></i>
                    </button>
                    <button class="control-button" on:click={handlePitchDown}>
                        <i class="control-icon icon-pitch-down"></i>
                    </button>
                </div>
                
                <!-- Rotations-Steuerung -->
                <div class="control-group">
                    <button class="control-button" on:click={handleRotateLeft}>
                        <i class="control-icon icon-rotate-left"></i>
                    </button>
                    <button class="control-button" on:click={handleRotateRight}>
                        <i class="control-icon icon-rotate-right"></i>
                    </button>
                </div>
                
                <!-- Ansicht zurücksetzen -->
                <div class="control-group">
                    <button class="control-button" on:click={handleResetNorth}>
                        <i class="control-icon icon-north"></i>
                    </button>
                    <button class="control-button" on:click={handleResetView}>
                        <i class="control-icon icon-reset"></i>
                    </button>
                </div>
                
                <!-- Ansichtseinstellungen -->
                <div class="control-group">
                    <button class="control-button {showTerrain ? 'active' : ''}" on:click={handleToggleTerrain}>
                        <i class="control-icon icon-terrain"></i>
                    </button>
                    <button class="control-button {showSky ? 'active' : ''}" on:click={handleToggleSky}>
                        <i class="control-icon icon-sky"></i>
                    </button>
                </div>
                
                <!-- Hilfselemente ein-/ausblenden -->
                <div class="control-group">
                    <button class="control-button {compassVisible ? 'active' : ''}" on:click={toggleCompass}>
                        <i class="control-icon icon-compass"></i>
                    </button>
                    <button class="control-button {scaleVisible ? 'active' : ''}" on:click={toggleScale}>
                        <i class="control-icon icon-scale"></i>
                    </button>
                </div>
                
                <!-- Einstellungen öffnen -->
                <div class="control-group">
                    <button class="control-button settings-button" on:click={handleOpenSettings}>
                        <i class="control-icon icon-settings"></i>
                    </button>
                </div>
            </div>
        {/if}
        
        <!-- Zum Standort zentrieren -->
        <button 
            class="control-button location-button {!hasLocation ? 'disabled' : ''}" 
            on:click={handleCenterLocation}
            disabled={!hasLocation}
        >
            <i class="control-icon icon-location"></i>
        </button>
    </div>
</div>

<style>
    .map-controls {
        position: absolute;
        bottom: 20px;
        right: 20px;
        z-index: 10;
    }
    
    .control-panel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }
    
    .control-button {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        border: none;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
    }
    
    .control-button:hover {
        background: rgba(0, 0, 0, 0.85);
        transform: translateY(-2px);
    }
    
    .control-button.active {
        background: rgba(52, 152, 219, 0.8);
    }
    
    .control-button.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .control-button.disabled:hover {
        transform: none;
    }
    
    .toggle-button {
        margin-bottom: 5px;
    }
    
    .location-button {
        margin-top: 5px;
        background: rgba(52, 152, 219, 0.8);
    }
    
    .location-button:hover {
        background: rgba(52, 152, 219, 1);
    }
    
    .settings-button {
        background: rgba(149, 165, 166, 0.8);
    }
    
    .settings-button:hover {
        background: rgba(149, 165, 166, 1);
    }
    
    .expanded-controls {
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
        padding: 10px;
        border-radius: 25px;
    }
    
    .control-group {
        display: flex;
        gap: 8px;
        justify-content: center;
    }
    
    .control-group .control-button {
        width: 40px;
        height: 40px;
    }
    
    .control-icon {
        width: 20px;
        height: 20px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }
    
    .compass-container {
        position: absolute;
        top: -80px;
        right: 0;
        left: 0;
        display: flex;
        justify-content: center;
    }
    
    .compass {
        width: 80px;
        height: 80px;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        border-radius: 50%;
        position: relative;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease;
    }
    
    .compass-north,
    .compass-east,
    .compass-south,
    .compass-west {
        position: absolute;
        font-size: 14px;
        font-weight: 600;
        color: white;
        text-align: center;
        width: 20px;
        height: 20px;
    }
    
    .compass-north {
        top: 5px;
        left: 50%;
        transform: translateX(-50%);
        color: #e74c3c;
    }
    
    .compass-east {
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
    }
    
    .compass-south {
        bottom: 5px;
        left: 50%;
        transform: translateX(-50%);
    }
    
    .compass-west {
        left: 5px;
        top: 50%;
        transform: translateY(-50%);
    }
    
    .compass-needle {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: 40px;
        background: linear-gradient(to bottom, #e74c3c 0%, #e74c3c 50%, white 50%, white 100%);
        transform: translate(-50%, -50%);
        transform-origin: center;
        border-radius: 2px;
    }
    
    /* Platzhalter für Control-Icons */
    .icon-expand { background-image: url('/icons/expand.svg'); }
    .icon-collapse { background-image: url('/icons/collapse.svg'); }
    .icon-plus { background-image: url('/icons/plus.svg'); }
    .icon-minus { background-image: url('/icons/minus.svg'); }
    .icon-pitch-up { background-image: url('/icons/pitch-up.svg'); }
    .icon-pitch-down { background-image: url('/icons/pitch-down.svg'); }
    .icon-rotate-left { background-image: url('/icons/rotate-left.svg'); }
    .icon-rotate-right { background-image: url('/icons/rotate-right.svg'); }
    .icon-north { background-image: url('/icons/north.svg'); }
    .icon-reset { background-image: url('/icons/reset.svg'); }
    .icon-terrain { background-image: url('/icons/terrain.svg'); }
    .icon-sky { background-image: url('/icons/sky.svg'); }
    .icon-compass { background-image: url('/icons/compass.svg'); }
    .icon-scale { background-image: url('/icons/scale.svg'); }
    .icon-settings { background-image: url('/icons/settings.svg'); }
    .icon-location { background-image: url('/icons/location.svg'); }
</style>