// src/lib/utils/atmosphere/VegetationController.ts

export class VegetationController {
    private map: maplibregl.Map;
    private forestTypes: any = {};
    private symbolLayers: string[] = [];
    
    constructor(map: maplibregl.Map) {
      this.map = map;
      this.initializeVegetationLayers();
    }
    
    private initializeVegetationLayers() {
      this.map.on('style.load', () => {
        // Verschiedene Waldtypen definieren
        this.defineForestTypes();
        
        // Wälder aus OpenStreetMap laden, falls sie nicht bereits geladen sind
        if (!this.map.getSource('forest-areas')) {
          this.loadForestAreas();
        }
        
        // Jede Waldart spezifisch darstellen
        this.createForestLayers();
      });
    }
    
    private defineForestTypes() {
      this.forestTypes = {
        'coniferous': {
          color: '#2D3E50',
          symbol: 'pine',
          density: 0.8
        },
        'deciduous': {
          color: '#2E8B57',
          symbol: 'deciduous',
          density: 0.7
        },
        'mixed': {
          color: '#3A5F3A',
          symbol: 'mixed',
          density: 0.75
        },
        'rainforest': {
          color: '#1E793E',
          symbol: 'tropical',
          density: 1.0
        },
        'orchard': {
          color: '#AFE185',
          symbol: 'fruit',
          density: 0.4
        }
      };
    }
    
    private loadForestAreas() {
      // Forest-Daten von OSM-basierten Quellen abrufen
      this.map.addSource('forest-areas', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8',
        promoteId: 'id'
      });
    }
    
    private createForestLayers() {
      // Flächenlayer für Waldflächen hinzufügen
      this.map.addLayer({
        id: 'forest-fill',
        type: 'fill',
        source: 'forest-areas',
        'source-layer': 'landuse',
        filter: ['in', 'class', 'wood', 'forest'],
        paint: {
          'fill-color': [
            'match',
            ['get', 'type'],
            'coniferous', this.forestTypes.coniferous.color,
            'deciduous', this.forestTypes.deciduous.color,
            'mixed', this.forestTypes.mixed.color,
            'rainforest', this.forestTypes.rainforest.color,
            'orchard', this.forestTypes.orchard.color,
            // Default
            this.forestTypes.mixed.color
          ],
          'fill-opacity': 0.6
        }
      });
      
      // Waldarten klassifizieren, falls Information vorhanden
      Object.keys(this.forestTypes).forEach(forestType => {
        const symbolId = `forest-symbol-${forestType}`;
        
        this.map.addLayer({
          id: symbolId,
          type: 'symbol',
          source: 'forest-areas',
          'source-layer': 'landuse',
          filter: [
            'all',
            ['in', 'class', 'wood', 'forest'],
            ['==', 'type', forestType]
          ],
          layout: {
            'symbol-placement': 'point',
            'icon-image': `tree-${this.forestTypes[forestType].symbol}`,
            'icon-size': [
              'interpolate', ['linear'], ['zoom'],
              10, 0.3,
              16, 0.6
            ],
            'icon-allow-overlap': false,
            'symbol-spacing': 100,
            'symbol-z-order': 'source',
            'visibility': 'visible'
          },
          paint: {
            'icon-opacity': 0.9,
            'icon-color': this.forestTypes[forestType].color
          }
        });
        
        this.symbolLayers.push(symbolId);
      });
    }
    
    public updateVegetation(vegetationState: any, lighting: any, precipitation: any) {
      if (!this.map.loaded()) return;
      
      // Farbsättigung basierend auf Jahreszeit anpassen
      const saturationFactor = vegetationState.foliageDensity;
      
      // Transparenz basierend auf Beleuchtung anpassen
      const opacityFactor = Math.max(0.4, Math.min(1.0, lighting.intensity * 1.3));
      
      try {
        // Waldfarben anpassen
        this.map.setPaintProperty('forest-fill', 'fill-opacity', opacityFactor * 0.6);
        
        // Baumsymbole anpassen
        this.symbolLayers.forEach(layerId => {
          if (this.map.getLayer(layerId)) {
            // Symboldichte basierend auf Zoom und Jahreszeit anpassen
            this.map.setLayoutProperty(layerId, 'symbol-spacing', 
              100 / (vegetationState.foliageDensity * 0.8 + 0.2)
            );
            
            // Farbe anpassen (Saturation)
            this.map.setPaintProperty(layerId, 'icon-opacity', opacityFactor);
          }
        });
        
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Vegetation:', error);
      }
    }
  }