import * as localforage from 'localforage';

/**
 * Verwaltet Offline-Kacheln und Kartenstile
 */
export class OfflineManager {
  private static instance: OfflineManager;
  private offlineTiles: Map<string, ArrayBuffer> = new Map();
  private offlineAreas: any[] = [];
  private tileStore: LocalForage;
  private metaStore: LocalForage;
  
  private constructor() {
    // Speicher für Kacheln initialisieren
    this.tileStore = localforage.createInstance({
      name: 'velonomad',
      storeName: 'offlineTiles'
    });
    
    // Speicher für Metadaten initialisieren
    this.metaStore = localforage.createInstance({
      name: 'velonomad',
      storeName: 'offlineMeta'
    });
    
    // Gespeicherte Bereiche laden
    this.loadSavedAreas();
  }
  
  /**
   * Singleton-Instanz abrufen
   */
  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }
  
  /**
   * Lädt gespeicherte Bereiche aus dem Speicher
   */
  private async loadSavedAreas() {
    try {
      const areas = await this.metaStore.getItem('offlineAreas');
      if (areas) {
        this.offlineAreas = areas as any[];
        console.log(`${this.offlineAreas.length} Offline-Bereiche geladen`);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Offline-Bereiche:', error);
    }
  }
  
  /**
   * Speichert einen Bereich für Offline-Nutzung
   */
  public async saveArea(bounds: [number, number, number, number], name: string, zoom: [number, number] = [10, 14]): Promise<boolean> {
    try {
      const area = {
        id: `area_${Date.now()}`,
        name,
        bounds,
        zoom,
        timestamp: Date.now(),
        tileCount: 0
      };
      
      // Bereich speichern
      this.offlineAreas.push(area);
      await this.metaStore.setItem('offlineAreas', this.offlineAreas);
      
      // Kacheln für diesen Bereich herunterladen
      this.downloadTilesForArea(area);
      
      return true;
    } catch (error) {
      console.error('Fehler beim Speichern des Offline-Bereichs:', error);
      return false;
    }
  }
  
  /**
   * Lädt Kacheln für den angegebenen Bereich vor
   */
  public async preloadArea(center: [number, number], radiusKm: number, zoom: [number, number] = [10, 14]): Promise<void> {
    // Bounds aus Zentrum und Radius berechnen
    const bounds = this.getBoundsFromCenterRadius(center[0], center[1], radiusKm);
    
    const area = {
      id: `preload_${Date.now()}`,
      name: 'Aktueller Bereich',
      bounds,
      zoom,
      timestamp: Date.now(),
      tileCount: 0
    };
    
    // Kacheln für diesen Bereich herunterladen (im Hintergrund)
    this.downloadTilesForArea(area, true);
  }
  
  /**
   * Berechnet Bounds aus Zentrum und Radius
   */
  private getBoundsFromCenterRadius(lon: number, lat: number, radiusKm: number): [number, number, number, number] {
    // Grobe Näherung: 1 Grad ≈ 111km am Äquator
    const latDiff = radiusKm / 111;
    const lonDiff = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
    
    return [
      lon - lonDiff, // minLon
      lat - latDiff, // minLat
      lon + lonDiff, // maxLon
      lat + latDiff  // maxLat
    ];
  }
  
  /**
   * Lädt Kacheln für einen Bereich herunter
   */
  private async downloadTilesForArea(area: any, background: boolean = false): Promise<void> {
    // Liste aller benötigten Kacheln erstellen
    const tiles = this.getTilesInBounds(
      area.bounds,
      area.zoom[0],
      area.zoom[1]
    );
    
    console.log(`Herunterladen von ${tiles.length} Kacheln für Bereich ${area.name}`);
    
    // Counters für Fortschrittsanzeige
    let completed = 0;
    let total = tiles.length;
    area.tileCount = total;
    
    // Observer für Fortschrittsanzeige
    const progressObserver = new Observable<number>(subscriber => {
      const intervalId = setInterval(() => {
        const progress = (completed / total) * 100;
        subscriber.next(progress);
        
        if (completed >= total) {
          subscriber.complete();
          clearInterval(intervalId);
        }
      }, 500);
      
      return () => clearInterval(intervalId);
    });
    
    // Fortschritt überwachen, wenn nicht im Hintergrund
    if (!background) {
      progressObserver.subscribe(progress => {
        // Fortschritt anzeigen (z.B. in UI)
        console.log(`Download-Fortschritt: ${progress.toFixed(1)}%`);
      });
    }
    
    // Kacheln in Chunks herunterladen, um Browser nicht zu überlasten
    const chunks = this.chunkArray(tiles, 10);
    
    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (tile) => {
        try {
          // Kachel herunterladen
          const tileKey = `${tile.z}/${tile.x}/${tile.y}`;
          
          // Prüfen, ob Kachel bereits vorhanden
          const existingTile = await this.tileStore.getItem(tileKey);
          if (!existingTile) {
            // Kachel herunterladen
            const response = await fetch(this.getTileUrl(tile.z, tile.x, tile.y));
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              
              // Kachel im Speicher ablegen
              await this.tileStore.setItem(tileKey, buffer);
            }
          }
        } catch (error) {
          console.warn(`Fehler beim Herunterladen von Kachel ${tile.z}/${tile.x}/${tile.y}:`, error);
        } finally {
          completed++;
        }
      }));
      
      // Kurze Pause zwischen Chunks, um Browser zu entlasten
      if (!background) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Aktualisierte Metadaten speichern
    await this.metaStore.setItem('offlineAreas', this.offlineAreas);
    
    console.log(`Download abgeschlossen für Bereich ${area.name}`);
  }
  
  /**
   * Berechnet alle Kacheln in einem bestimmten Bereich
   */
  private getTilesInBounds(bounds: [number, number, number, number], minZoom: number, maxZoom: number): Tile[] {
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const tiles: Tile[] = [];
    
    for (let z = minZoom; z <= maxZoom; z++) {
      // Berechne Kachelgrenzen für den Zoom-Level
      const minX = Math.floor((minLon + 180) / 360 * Math.pow(2, z));
      const maxX = Math.floor((maxLon + 180) / 360 * Math.pow(2, z));
      
      const minY = Math.floor((1 - Math.log(Math.tan(maxLat * Math.PI / 180) + 1 / Math.cos(maxLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
      const maxY = Math.floor((1 - Math.log(Math.tan(minLat * Math.PI / 180) + 1 / Math.cos(minLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
      
      // Kacheln für diesen Zoom-Level hinzufügen
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          tiles.push({ x, y, z });
        }
      }
    }
    
    return tiles;
  }
  
  /**
   * Liefert die URL für eine Kachel
   */
  private getTileUrl(z: number, x: number, y: number): string {
    // OSM Kachel-Server abwechselnd verwenden
    const server = String.fromCharCode(97 + Math.floor(Math.random() * 3)); // a, b oder c
    return `https://${server}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }
  
  /**
   * Liefert den Offline-Kartenstil
   */
  public getOfflineStyle(): any {
    return {
      version: 8,
      sources: {
        'offline-tiles': {
          type: 'raster',
          tiles: ['offline-tile:///{z}/{x}/{y}'],
          tileSize: 256
        }
      },
      layers: [{
        id: 'offline-layer',
        type: 'raster',
        source: 'offline-tiles',
        minzoom: 0,
        maxzoom: 19
      }]
    };
  }
  
  /**
   * Liefert eine Offline-Kachel, falls verfügbar
   */
  public async getOfflineTile(z: number, x: number, y: number): Promise<ArrayBuffer | null> {
    const key = `${z}/${x}/${y}`;
    try {
      return await this.tileStore.getItem(key) as ArrayBuffer;
    } catch {
      return null;
    }
  }
  
  /**
   * Hilfsfunktion: Array in Chunks aufteilen
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from(
      { length: Math.ceil(array.length / size) },
      (_, i) => array.slice(i * size, i * size + size)
    );
  }
}

// Tile-Definition
interface Tile {
  x: number;
  y: number;
  z: number;
}

// Observable-Implementierung für die Fortschrittsüberwachung
class Observable<T> {
  constructor(private executor: (subscriber: Observer<T>) => void | (() => void)) {}
  
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription {
    const subscriber = new Observer<T>(next, error, complete);
    const teardown = this.executor(subscriber) || (() => {});
    
    return {
      unsubscribe: () => {
        subscriber.closed = true;
        teardown();
      }
    };
  }
}

class Observer<T> {
  closed = false;
  
  constructor(
    public next?: (value: T) => void,
    public error?: (error: any) => void,
    public complete?: () => void
  ) {}
}

interface Subscription {
  unsubscribe: () => void;
}

export const offlineManager = OfflineManager.getInstance();