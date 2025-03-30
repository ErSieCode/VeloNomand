/**
 * System für Partikel-basierte Wettereffekte
 */
export class ParticleSystem {
    private map: maplibregl.Map;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: Particle[] = [];
    private animationFrame: number | null = null;
    private lastFrameTime: number = 0;
    private isActive: boolean = false;
    private currentEffect: string | null = null;
    private deviceCapabilities: any;
    
    constructor(map: maplibregl.Map, deviceCapabilities: any) {
      this.map = map;
      this.deviceCapabilities = deviceCapabilities;
      
      // Canvas erstellen und konfigurieren
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'particle-canvas';
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '150';
      
      // Canvas zum Map-Container hinzufügen
      this.map.getContainer().appendChild(this.canvas);
      
      // Context abrufen
      const ctx = this.canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context nicht verfügbar');
      }
      this.ctx = ctx;
      
      // Canvas-Größe an Container anpassen
      this.resizeCanvas();
      
      // Resize-Listener einrichten
      window.addEventListener('resize', this.resizeCanvas.bind(this));
      
      // Kacheln-Move-End-Event für Partikelposition
      this.map.on('moveend', this.updateParticles.bind(this));
      
      // Battery-Aware Rendering einrichten
      this.setupBatteryAwareRender();
    }
    
    /**
     * Canvas-Größe an Container anpassen
     */
    private resizeCanvas(): void {
      const container = this.map.getContainer();
      const { width, height } = container.getBoundingClientRect();
      
      // Pixeldichte berücksichtigen für scharfe Darstellung
      const pixelRatio = window.devicePixelRatio || 1;
      this.canvas.width = width * pixelRatio;
      this.canvas.height = height * pixelRatio;
      
      // Context-Skalierung für Pixeldichte anpassen
      this.ctx.scale(pixelRatio, pixelRatio);
    }
    
    /**
     * Batterie-bewusstes Rendering einrichten
     */
    private setupBatteryAwareRender(): void {
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          // Partikelanzahl basierend auf Batteriestand anpassen
          battery.addEventListener('levelchange', () => {
            this.adjustParticleCountForBattery(battery.level);
          });
          
          // Initial anpassen
          this.adjustParticleCountForBattery(battery.level);
        });
      }
    }
    
    /**
     * Partikelanzahl basierend auf Batteriestand anpassen
     */
    private adjustParticleCountForBattery(level: number): void {
      if (!this.currentEffect || !this.isActive) return;
      
      // Bei niedrigem Batteriestand Partikelanzahl reduzieren
      const batteryFactor = level < 0.3 ? 0.5 : 
                           level < 0.5 ? 0.75 : 1;
      
      const currentCount = this.particles.length;
      const targetCount = Math.floor(this.getBaseParticleCount(this.currentEffect) * batteryFactor);
      
      if (currentCount > targetCount) {
        // Partikel reduzieren
        this.particles = this.particles.slice(0, targetCount);
      } else if (currentCount < targetCount) {
        // Partikel hinzufügen
        this.addParticles(this.currentEffect, targetCount - currentCount);
      }
    }
    
    /**
     * Setzt den aktuellen Wettereffekt
     */
    public setEffect(type: string, options: any = {}): void {
      // Aktuellen Effekt stoppen, falls vorhanden
      this.clearEffects();
      
      this.currentEffect = type;
      
      // Partikelanzahl basierend auf Gerätefähigkeiten
      const count = this.getBaseParticleCount(type);
      
      switch (type) {
        case 'rain':
          this.createRainParticles(count, options);
          break;
        case 'snow':
          this.createSnowParticles(count, options);
          break;
        case 'mist':
          this.createMistParticles(count, options);
          break;
        default:
          return;
      }
      
      // Animation starten, falls noch nicht aktiv
      if (!this.isActive) {
        this.start();
      }
    }
    
    /**
     * Basisanzahl von Partikeln basierend auf Effekttyp und Gerätefähigkeiten
     */
    private getBaseParticleCount(type: string): number {
      const deviceFactor = this.deviceCapabilities.performanceTier === 'high' ? 1 :
                          this.deviceCapabilities.performanceTier === 'medium' ? 0.7 : 0.3;
      
      switch (type) {
        case 'rain':
          return Math.floor(300 * deviceFactor);
        case 'snow':
          return Math.floor(150 * deviceFactor);
        case 'mist':
          return Math.floor(50 * deviceFactor);
        default:
          return 0;
      }
    }
    
    /**
     * Erstellt Regenpartikel
     */
    private createRainParticles(count: number, options: any): void {
      const { intensity = 0.5, speed = 15, windDirection = 0, windSpeed = 0 } = options;
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      
      // Winkel berechnen (0° = Nord, 90° = Ost, usw.)
      const windAngle = (windDirection + 180) * Math.PI / 180;
      const windXFactor = Math.sin(windAngle) * windSpeed * 0.1;
      const windYFactor = Math.cos(windAngle) * windSpeed * 0.1;
      
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1 + Math.random() * 2,
          speedX: windXFactor,
          speedY: 10 + Math.random() * 10 * intensity,
          opacity: 0.6 + Math.random() * 0.4,
          type: 'rain'
        });
      }
    }
    
    /**
     * Erstellt Schneepartikel
     */
    private createSnowParticles(count: number, options: any): void {
      const { intensity = 0.5, speed = 5, windDirection = 0, windSpeed = 0 } = options;
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      
      // Winkel berechnen
      const windAngle = (windDirection + 180) * Math.PI / 180;
      const windXFactor = Math.sin(windAngle) * windSpeed * 0.1;
      
      for (let i = 0; i < count; i++) {
        // Zufällige Sinuswellendaten für schwingende Bewegung
        const amplitude = 0.5 + Math.random() * 2;
        const period = 100 + Math.random() * 100;
        
        this.particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1 + Math.random() * 3,
          speedX: windXFactor,
          speedY: 1 + Math.random() * 3 * intensity,
          opacity: 0.7 + Math.random() * 0.3,
          type: 'snow',
          // Spezifische Schnee-Eigenschaften
          amplitude,
          period,
          tick: Math.random() * 100  // Zufälliger Startpunkt in der Sinus-Welle
        });
      }
    }
    
    /**
     * Erstellt Nebelpartikel
     */
    private createMistParticles(count: number, options: any): void {
      const { intensity = 0.5 } = options;
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 20 + Math.random() * 50,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: 0.1 + Math.random() * 0.2 * intensity,
          type: 'mist'
        });
      }
    }
    
    /**
     * Startet die Partikelanimation
     */
    public start(): void {
      if (this.isActive) return;
      
      this.isActive = true;
      this.lastFrameTime = performance.now();
      this.animate();
    }
    
    /**
     * Stoppt die Partikelanimation
     */
    public stop(): void {
      this.isActive = false;
      
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    }
    
    /**
     * Löscht alle Partikel und stoppt Effekte
     */
    public clearEffects(): void {
      this.stop();
      this.particles = [];
      this.currentEffect = null;
      this.clearCanvas();
    }
    
    /**
     * Löscht den Canvas
     */
    private clearCanvas(): void {
      this.ctx.clearRect(
        0, 0, 
        this.canvas.width / (window.devicePixelRatio || 1), 
        this.canvas.height / (window.devicePixelRatio || 1)
      );
    }
    
    /**
     * Animationsschleife
     */
    private animate(): void {
      if (!this.isActive) return;
      
      const now = performance.now();
      const deltaTime = (now - this.lastFrameTime) / 16.67; // Normalisiert auf 60fps
      this.lastFrameTime = now;
      
      this.update(deltaTime);
      this.render();
      
      this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    }
    
    /**
     * Aktualisiert Partikel basierend auf verstrichener Zeit
     */
    private update(deltaTime: number): void {
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        
        // Typ-spezifische Updates
        switch (p.type) {
          case 'rain':
            // Regen fällt gerade nach unten mit etwas Wind
            p.x += p.speedX * deltaTime;
            p.y += p.speedY * deltaTime;
            
            // Wenn Partikel außerhalb, zurücksetzen
            if (p.y > height) {
              p.y = -10;
              p.x = Math.random() * width;
            }
            
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            break;
            
          case 'snow':
            // Schnee fällt langsamer und bewegt sich in Sinus-Wellen
            p.tick! += deltaTime;
            p.x += p.speedX * deltaTime + Math.sin(p.tick! / p.period!) * p.amplitude! * deltaTime;
            p.y += p.speedY * deltaTime;
            
            // Wenn Partikel außerhalb, zurücksetzen
            if (p.y > height) {
              p.y = -10;
              p.x = Math.random() * width;
              p.tick = 0;
            }
            
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            break;
            
          case 'mist':
            // Nebel schwebt langsam
            p.x += p.speedX * deltaTime;
            p.y += p.speedY * deltaTime;
            
            // Wrap-Around für Nebel
            if (p.x < -p.size) p.x = width + p.size;
            if (p.x > width + p.size) p.x = -p.size;
            if (p.y < -p.size) p.y = height + p.size;
            if (p.y > height + p.size) p.y = -p.size;
            break;
        }
      }
    }
    
    /**
     * Rendert alle Partikel
     */
    private render(): void {
      this.clearCanvas();
      
      for (const p of this.particles) {
        this.ctx.save();
        
        switch (p.type) {
          case 'rain':
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(200, 200, 255, ${p.opacity})`;
            this.ctx.lineWidth = p.size * 0.5;
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x + p.speedX * 0.5, p.y + p.speedY * 0.5);
            this.ctx.stroke();
            break;
            
          case 'snow':
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            break;
            
          case 'mist':
            const gradient = this.ctx.createRadialGradient(
              p.x, p.y, 0,
              p.x, p.y, p.size
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            break;
        }
        
        this.ctx.restore();
      }
    }
    
    /**
     * Aktualisiert Partikelposition nach Kartenbewegung
     */
    private updateParticles(): void {
      // Nur aktualisieren, wenn aktiv
      if (!this.isActive || !this.currentEffect) return;
      
      // Alle Partikel neu erstellen, um Konzentration in bestimmten Bereichen zu vermeiden
      const effect = this.currentEffect;
      const count = this.particles.length;
      
      this.particles = [];
      this.addParticles(effect, count);
    }
    
    /**
     * Fügt Partikel zum aktuellen Effekt hinzu
     */
    private addParticles(type: string, count: number): void {
      switch (type) {
        case 'rain':
          this.createRainParticles(count, { intensity: 0.5 });
          break;
        case 'snow':
          this.createSnowParticles(count, { intensity: 0.5 });
          break;
        case 'mist':
          this.createMistParticles(count, { intensity: 0.5 });
          break;
      }
    }
    
    /**
     * Bereinigt Ressourcen
     */
    public destroy(): void {
      this.stop();
      window.removeEventListener('resize', this.resizeCanvas.bind(this));
      
      if (this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }
  
  // Partikeldefinition
  interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    type: string;
    // Spezifische Eigenschaften für bestimmte Partikeltypen
    amplitude?: number;
    period?: number;
    tick?: number;
  }