// src/lib/utils/atmosphere/SkyController.ts

export class SkyController {
    private map: maplibregl.Map;
    private isSkyLayerAdded: boolean = false;
    
    constructor(map: maplibregl.Map) {
      this.map = map;
      this.initializeSkyLayer();
    }
    
    private initializeSkyLayer() {
      this.map.on('style.load', () => {
        if (this.map.getLayer('sky')) {
          this.isSkyLayerAdded = true;
          return;
        }
        
        // Himmel-Layer hinzufügen
        try {
          this.map.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 90.0],
              'sky-atmosphere-sun-intensity': 15,
              'sky-atmosphere-halo-color': 'rgba(255, 255, 255, 0.5)',
              'sky-atmosphere-color': 'rgba(186, 210, 235, 1.0)',
              'sky-opacity': 1.0
            }
          });
          
          this.isSkyLayerAdded = true;
        } catch (error) {
          console.error('Fehler beim Hinzufügen des Himmel-Layers:', error);
          this.isSkyLayerAdded = false;
        }
      });
    }
    
    public updateSky(sunPosition: { azimuth: number, altitude: number }, colors: any, isDaylight: boolean) {
      if (!this.map.loaded() || !this.isSkyLayerAdded) return;
      
      try {
        // Sonnenposition aktualisieren
        this.map.setPaintProperty('sky', 'sky-atmosphere-sun', [
          sunPosition.azimuth,
          Math.max(-10, sunPosition.altitude)  // Min. -10 Grad, um Übergangseffekte zu verbessern
        ]);
        
        // Sonnenintensität basierend auf Höhe über dem Horizont
        const sunIntensity = isDaylight ? 15 : Math.max(0, 5 + sunPosition.altitude);
        this.map.setPaintProperty('sky', 'sky-atmosphere-sun-intensity', sunIntensity);
        
        // Himmelfarben
        this.map.setPaintProperty('sky', 'sky-atmosphere-color', colors.zenith);
        this.map.setPaintProperty('sky', 'sky-atmosphere-halo-color', colors.horizon);
        
        // Transparenz für Nacht verringern, um Sterne sichtbar zu machen
        const skyOpacity = isDaylight ? 1.0 : 0.7;
        this.map.setPaintProperty('sky', 'sky-opacity', skyOpacity);
        
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Himmel-Layers:', error);
      }
    }
  }