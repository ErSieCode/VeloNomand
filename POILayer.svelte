<!-- src/lib/components/poi/POILayer.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { $effect, $state } from 'svelte';
    import { filteredPOIs, enabledCategories, POI_CATEGORIES } from '$lib/utils/POIManager';
    import POIMarker from './POIMarker.svelte';
    import POICluster from './POICluster.svelte';
    import POIDetail from './POIDetail.svelte';
    import { currentLocation } from '$lib/state/locationState';
    
    // Props
    export let map;
    
    // Status
    let selectedPOI = $state(null);
    let visiblePOIs = $state([]);
    let clusters = $state([]);
    let mapBounds = $state(null);
    
    // Clustering-Parameter
    const clusterRadius = 40; // Pixel-Radius für Clustering
    
    // POIs aktualisieren, wenn sich der Kartenbereich ändert
    function handleMapMove() {
      if (!map) return;
      
      const bounds = map.getBounds();
      mapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };
      
      updateVisiblePOIs();
    }
    
    // POIs aktualisieren, wenn gefilterte POIs oder Kartenbereich sich ändern
    $effect(() => {
      if (!mapBounds) return;
      updateVisiblePOIs();
    });
    
    function updateVisiblePOIs() {
      if (!map || !mapBounds) return;
      
      // POIs innerhalb des aktuellen Kartenbereichs filtern
      visiblePOIs = $filteredPOIs.filter(poi => {
        return poi.latitude <= mapBounds.north &&
               poi.latitude >= mapBounds.south &&
               poi.longitude <= mapBounds.east &&
               poi.longitude >= mapBounds.west;
      });
      
      // POIs clustern bei kleinen Zoom-Stufen
      const zoom = map.getZoom();
      if (zoom < 14 && visiblePOIs.length > 10) {
        clusters = createClusters(visiblePOIs);
      } else {
        clusters = [];
      }
    }
    
    function createClusters(pois) {
      const tempClusters = [];
      const processed = new Set();
      
      pois.forEach(poi => {
        if (processed.has(poi.id)) return;
        
        const pixel = map.project([poi.longitude, poi.latitude]);
        const nearbyPOIs = pois.filter(otherPoi => {
          if (otherPoi.id === poi.id || processed.has(otherPoi.id)) return false;
          
          const otherPixel = map.project([otherPoi.longitude, otherPoi.latitude]);
          const distance = Math.sqrt(
            Math.pow(pixel.x - otherPixel.x, 2) + 
            Math.pow(pixel.y - otherPixel.y, 2)
          );
          
          return distance <= clusterRadius;
        });
        
        if (nearbyPOIs.length > 0) {
          // Cluster erstellen
          const allClusterPOIs = [poi, ...nearbyPOIs];
          const centerLat = allClusterPOIs.reduce((sum, p) => sum + p.latitude, 0) / allClusterPOIs.length;
          const centerLon = allClusterPOIs.reduce((sum, p) => sum + p.longitude, 0) / allClusterPOIs.length;
          
          tempClusters.push({
            id: `cluster-${tempClusters.length}`,
            latitude: centerLat,
            longitude: centerLon,
            pois: allClusterPOIs,
            count: allClusterPOIs.length
          });
          
          // Als verarbeitet markieren
          allClusterPOIs.forEach(p => processed.add(p.id));
        } else {
          // Einzelner POI
          processed.add(poi.id);
        }
      });
      
      // Einzelne POIs hinzufügen, die nicht geclustert wurden
      pois.forEach(poi => {
        if (!processed.has(poi.id)) {
          tempClusters.push({
            id: `single-${poi.id}`,
            latitude: poi.latitude,
            longitude: poi.longitude,
            pois: [poi],
            count: 1
          });
          processed.add(poi.id);
        }
      });
      
      return tempClusters;
    }
    
    function handlePOIClick(poi) {
      selectedPOI = poi;
    }
    
    function closeDetail() {
      selectedPOI = null;
    }
    
    onMount(() => {
      if (map) {
        map.on('moveend', handleMapMove);
        // Initial POIs laden
        handleMapMove();
      }
    });
    
    onDestroy(() => {
      if (map) {
        map.off('moveend', handleMapMove);
      }
    });
  </script>
  
  <div class="poi-layer">
    {#if clusters.length > 0}
      {#each clusters as cluster (cluster.id)}
        {#if cluster.count > 1}
          <POICluster 
            cluster={cluster} 
            map={map} 
            on:click={e => {
              if (map.getZoom() >= 16) {
                // Bei hohem Zoom Details direkt anzeigen
                e.detail.pois.length === 1 
                  ? handlePOIClick(e.detail.pois[0]) 
                  : handlePOIClick(null);
              } else {
                // Bei niedrigem Zoom hineinzoomen
                map.flyTo({
                  center: [cluster.longitude, cluster.latitude],
                  zoom: Math.min(map.getZoom() + 2, 16),
                  duration: 800
                });
              }
            }} 
          />
        {:else}
          <POIMarker 
            poi={cluster.pois[0]} 
            map={map} 
            on:click={() => handlePOIClick(cluster.pois[0])} 
          />
        {/if}
      {/each}
    {:else}
      {#each visiblePOIs as poi (poi.id)}
        <POIMarker 
          {poi} 
          {map} 
          on:click={() => handlePOIClick(poi)} 
        />
      {/each}
    {/if}
    
    {#if selectedPOI}
      <POIDetail 
        poi={selectedPOI} 
        on:close={closeDetail} 
        currentLocation={$currentLocation}
      />
    {/if}
  </div>