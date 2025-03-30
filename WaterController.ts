// src/lib/utils/atmosphere/WaterController.ts

export class WaterController {
    private map: maplibregl.Map;
    private animationFrame: number | null = null;
    private waterAnimOffset = 0;
    
    constructor(map: maplibregl.Map) {
      this.map = map;
      this.initializeWaterLayers();
    }
    
    private initializeWaterLayers() {
      this.map.on('style.load', () => {
        // Wasserflächen stylen
        if (this.map.getLayer('water')) {
          this.customizeWaterLayer();
        }
        
        // Flusslauf-Animation einrichten
        this.setupWaterAnimation();
      });
    }
    
    private customizeWaterLayer() {
      // Bestehenden Wasserlayer anpassen
      try {
        this.map.setPaintProperty('water', 'fill-color', '#0F5E9C');
        
        // Wasserstruktur/Reflektion hinzufügen
        this.map.addLayer({
          id: 'water-pattern',
          type: 'fill',
          source: this.map.getLayer('water').source,
          'source-layer': 'water',
          paint: {
            'fill-pattern': 'water-pattern',
            'fill-opacity': 0.08
          }
        });
        
        // Blau-Verlauf für tiefere Gewässer
        this.map.addLayer({
          id: 'deep-water',
          type: 'fill',
          source: this.map.getLayer('water').source,
          'source-layer': 'water',
          filter: ['==', ['get', 'class'], 'ocean'],
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5, '#0A3B69',
              10, '#0F5E9C'
            ]
          }
        }, 'water');
        
      } catch (error) {
        console.error('Fehler beim Anpassen des Wasserlayers:', error);
      }
    }
    
    private setupWaterAnimation() {
      // Animation für fließendes Wasser einrichten
      const animate = () => {
        this.waterAnimOffset = (this.waterAnimOffset + 0.1) % 512;
        
        if (this.map.getLayer('water-flow')) {
          try {
            this.map.setPaintProperty('water-flow', 'line-dasharray', [3, 3, 3, this.waterAnimOffset]);
          } catch (e) {
            // Ignoriere Fehler bei der Animation
          }
        }
        
        this.animationFrame = requestAnimationFrame(animate);
      };
      
      this.animationFrame = requestAnimationFrame(animate);
      
      // Cleanup bei Karten-Entfernung
      this.map.on('remove', () => {
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame);
          this.animationFrame = null;
        }
      });
    }
    
    public updateWater(waterConditions: any, lighting: any) {
      if (!this.map.loaded()) return;
      
      try {
        // Wasserfarbe basierend auf Beleuchtung anpassen
        const baseWaterColor = '#0F5E9C';
        
        // Nachtmodus für Wasser - dunkler und weniger gesättigt
        const isDaylight = lighting.intensity > 0.3;
        const waterColor = isDaylight 
          ? this.adjustColorBrightness(baseWaterColor, lighting.intensity)
          : this.adjustColorBrightness(this.desaturateColor(baseWaterColor, 0.5), lighting.intensity);
        
        // Wasserfarbe anpassen
        this.map.setPaintProperty('water', 'fill-color', waterColor);
        
        // Reflektionen basierend auf Wetterbedingungen anpassen
        const reflectionOpacity = Math.min(0.15, 
          0.08 + (1 - (waterConditions.turbidity || 0.3)) * 0.07);
        
        this.map.setPaintProperty('water-pattern', 'fill-opacity', reflectionOpacity);
        
        // Wasseranimation basierend auf Fließgeschwindigkeit anpassen
        if (this.map.getLayer('water-flow')) {
          const flowSpeed = Math.max(0.05, Math.min(0.3, waterConditions.flowRate || 0.1));
          this.waterAnimOffset = (this.waterAnimOffset + flowSpeed) % 512;
        }
        
        // Wellenhöhe für Ozean/Seen anpassen (falls vorhanden)
        if (this.map.getLayer('water-waves')) {
          const waveHeight = Math.max(0.2, Math.min(1.0, waterConditions.waveHeight || 0.3));
          this.map.setPaintProperty('water-waves', 'line-width', waveHeight * 1.5);
          this.map.setPaintProperty('water-waves', 'line-opacity', waveHeight * 0.4);
        }
        
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Wassers:', error);
      }
    }
    
    /**
     * Passt die Helligkeit einer Farbe an
     */
    private adjustColorBrightness(color: string, factor: number): string {
      // Konvertiere Farbe in RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Passe Helligkeit an (zwischen 0.2 und 1.2)
      const adjustedFactor = 0.2 + factor;
      
      // Werte anpassen und begrenzen
      const adjustColor = (c: number) => Math.min(255, Math.max(0, Math.round(c * adjustedFactor)));
      
      // Zu Hex konvertieren
      const adjustedR = adjustColor(r).toString(16).padStart(2, '0');
      const adjustedG = adjustColor(g).toString(16).padStart(2, '0');
      const adjustedB = adjustColor(b).toString(16).padStart(2, '0');
      
      return `#${adjustedR}${adjustedG}${adjustedB}`;
    }
    
    /**
     * Reduziert die Sättigung einer Farbe
     */
    private desaturateColor(color: string, factor: number): string {
      // Konvertiere Farbe in RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Durchschnitt berechnen (Grau)
      const avg = Math.round((r + g + b) / 3);
      
      // Mischen zwischen Original und Grau
      const desaturate = (c: number) => Math.round(c * (1 - factor) + avg * factor);
      
      // Zu Hex konvertieren
      const desaturatedR = desaturate(r).toString(16).padStart(2, '0');
      const desaturatedG = desaturate(g).toString(16).padStart(2, '0');
      const desaturatedB = desaturate(b).toString(16).padStart(2, '0');
      
      return `#${desaturatedR}${desaturatedG}${desaturatedB}`;
    }
  }