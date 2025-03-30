<!-- src/lib/components/poi/POIMarker.svelte -->
<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { fade, scale } from 'svelte/transition';
    import { Motion } from 'motion';
    import { POI_CATEGORIES } from '$lib/utils/POIManager';
    
    // Props
    export let poi;
    export let map;
    export let highlight = false;
    export let showLabel = false;
    
    // Event-Dispatcher
    const dispatch = createEventDispatcher();
    
    // State
    let marker;
    let pixelPosition = { x: 0, y: 0 };
    let isHovered = false;
    let isVisible = false;
    
    // Kategorie-Informationen abrufen
    $: categoryInfo = getCategoryInfo(poi.category, poi.subcategory);
    
    // Positionsberechnung aktualisieren
    function updatePosition() {
      if (!map || !poi) return;
      
      const pos = map.project([poi.longitude, poi.latitude]);
      pixelPosition = { x: pos.x, y: pos.y };
      
      // Prüfen, ob im sichtbaren Bereich
      const bounds = map.getBounds();
      isVisible = poi.latitude <= bounds.getNorth() &&
                  poi.latitude >= bounds.getSouth() &&
                  poi.longitude <= bounds.getEast() &&
                  poi.longitude >= bounds.getWest();
    }
    
    // Kategorie-Informationen abrufen
    function getCategoryInfo(categoryId, subcategoryId) {
      const category = Object.values(POI_CATEGORIES).find(cat => cat.id === categoryId.split('.')[0]);
      if (!category) return { icon: 'default', color: '#777777' };
      
      const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
      return {
        icon: subcategory?.icon || category.icon,
        color: getColorForCategory(categoryId.split('.')[0])
      };
    }
    
    function getColorForCategory(categoryId) {
      const colorMap = {
        'survival': '#4CAF50',   // Grün
        'food': '#FF9800',       // Orange
        'community': '#2196F3',  // Blau
        'wellness': '#9C27B0',   // Lila
        'adventure': '#F44336',  // Rot
        'practical': '#607D8B',  // Blaugrau
        'culture': '#E91E63',    // Pink
        'warning': '#FF5722'     // Orange-Rot
      };
      
      return colorMap[categoryId] || '#777777';
    }
    
    // Event-Handler
    function handleMouseEnter() {
      isHovered = true;
      showLabel = true;
      
      // Pulsierenden Effekt hinzufügen
      Motion.animate(marker, {
        scale: [1, 1.2, 1],
      }, {
        duration: 0.8,
        repeat: Infinity
      });
    }
    
    function handleMouseLeave() {
      isHovered = false;
      if (!highlight) showLabel = false;
      
      // Animation stoppen
      Motion.stop(marker);
      Motion.animate(marker, { scale: 1 }, { duration: 0.3 });
    }
    
    function handleClick(event) {
      event.stopPropagation();
      dispatch('click', poi);
    }
    
    onMount(() => {
      updatePosition();
      
      // Kartenbereich ändern sich, Position aktualisieren
      map.on('move', updatePosition);
      
      // Wenn hervorgehoben, Pulsiereffekt hinzufügen
      if (highlight) {
        setTimeout(() => {
          Motion.animate(marker, {
            scale: [1, 1.2, 1],
          }, {
            duration: 0.8,
            repeat: 3
          });
        }, 500);
      }
    });
    
    onDestroy(() => {
      // Event-Listener entfernen
      map?.off('move', updatePosition);
      Motion.stop(marker);
    });
  </script>
  
  {#if isVisible}
    <div
      class="poi-marker"
      bind:this={marker}
      style="
        transform: translate({pixelPosition.x}px, {pixelPosition.y}px) translate(-50%, -50%);
        background-color: {categoryInfo.color};
        box-shadow: 0 0 0 2px white, 0 0 0 4px {categoryInfo.color}40;
      "
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      on:click={handleClick}
      in:scale={{duration: 300, start: 0.5}}
      out:fade={{duration: 200}}
    >
      <div class="icon">
        <img 
          src="/icons/poi/{categoryInfo.icon}.svg" 
          alt="{poi.name}" 
          width="16" 
          height="16"
        />
      </div>
      
      {#if showLabel || isHovered}
        <div 
          class="label"
          in:fade={{duration: 150}}
          out:fade={{duration: 100}}
        >
          <div class="name">{poi.name}</div>
          {#if isHovered && poi.properties?.seasonStart && poi.properties?.seasonEnd}
            <div class="season">
              Saison: {getMonthName(poi.properties.seasonStart)}-{getMonthName(poi.properties.seasonEnd)}
            </div>
          {/if}
          {#if isHovered && poi.temporaryEvent && poi.eventStart}
            <div class="event-time">
              {formatEventDate(poi.eventStart, poi.eventEnd)}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
  
  <style>
    .poi-marker {
      position: absolute;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: transform 0.2s ease;
    }
    
    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: white;
    }
    
    .label {
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      background-color: white;
      border-radius: 4px;
      padding: 4px 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      white-space: nowrap;
      z-index: 20;
      font-size: 12px;
      pointer-events: none;
    }
    
    .label::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid white;
    }
    
    .name {
      font-weight: bold;
    }
    
    .season, .event-time {
      font-size: 10px;
      opacity: 0.8;
    }
  </style>