// src/lib/utils/api/waterSourcesApi.ts

import type { POI } from '$lib/types/POITypes';

/**
 * Abrufen von Trinkwasserquellen aus verschiedenen Datenquellen
 * - OSM-Daten (Quellen, Brunnen, öffentliche Wasserstellen)
 * - Offizielle Stellen (Wasserkarten der Kommunen)
 * - Community-Meldungen (von anderen Nutzern gemeldete Wasserquellen)
 */
export async function getWaterSources(bounds: [number, number, number, number]): Promise<POI[]> {
    try {
        // Verschiedene Datenquellen abfragen (parallel)
        const [osmSources, officialSources, communitySources] = await Promise.all([
            fetchOSMWaterSources(bounds),
            fetchOfficialWaterSources(bounds),
            fetchCommunityWaterSources(bounds)
        ]);
        
        // Alle Wasserquellen zusammenführen
        const allSources = [...osmSources, ...officialSources, ...communitySources];
        
        // Duplikate entfernen (basierend auf Geo-Koordinaten)
        const uniqueSources = removeDuplicateWaterSources(allSources);
        
        return uniqueSources;
        
    } catch (error) {
        console.error('Fehler beim Abrufen von Wasserquellen:', error);
        return [];
    }
}

/**
 * Abrufen von Wasserquellen aus OpenStreetMap
 */
async function fetchOSMWaterSources(bounds: [number, number, number, number]): Promise<POI[]> {
    // In einer vollständigen Implementierung würde hier ein Overpass API-Aufruf erfolgen
    // Für Demo-Zwecke verwenden wir Beispieldaten
    
    // Simulierte Anfrage-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Beispielquellen basierend auf den Bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    
    // Quellen dynamisch basierend auf Position generieren
    const sources: POI[] = [];
    
    // Quelle 1: Trinkbrunnen
    sources.push({
        id: `water-osm-1-${bounds[0]}-${bounds[1]}`,
        name: 'Trinkbrunnen',
        description: 'Öffentlicher Trinkwasserbrunnen am Marktplatz',
        category: 'survival',
        subcategory: 'water',
        latitude: centerLat + 0.01,
        longitude: centerLon - 0.005,
        elevation: 320,
        source: 'osm',
        icon: 'water-tap',
        properties: {
            waterQuality: {
                type: 'tap',
                drinkable: true,
                treatmentRecommended: false,
                flowRate: 'high',
                lastTestedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                lastTestedResult: 'excellent'
            },
            lastVerified: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        }
    });
    
    // Quelle 2: Natürliche Quelle
    sources.push({
        id: `water-osm-2-${bounds[0]}-${bounds[1]}`,
        name: 'Waldquelle',
        description: 'Natürliche Quelle im Waldgebiet',
        category: 'survival',
        subcategory: 'water',
        latitude: centerLat - 0.015,
        longitude: centerLon + 0.01,
        elevation: 450,
        source: 'osm',
        icon: 'water-spring',
        properties: {
            waterQuality: {
                type: 'spring',
                drinkable: true,
                treatmentRecommended: true,
                flowRate: 'medium',
                minerals: ['calcium', 'magnesium'],
                notes: 'Klares, kaltes Wasser. Vor Verzehr Behandlung empfohlen.'
            },
            lastVerified: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        }
    });
    
    return sources;
}

/**
 * Abrufen offizieller Wasserquellen von kommunalen Stellen
 */
async function fetchOfficialWaterSources(bounds: [number, number, number, number]): Promise<POI[]> {
    // In einer vollständigen Implementierung würde hier ein API-Aufruf erfolgen
    // Für Demo-Zwecke verwenden wir Beispieldaten
    
    // Simulierte Anfrage-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Beispielquellen basierend auf den Bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    
    // Zufällige Position innerhalb der Bounds
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Offizielle Quellen
    const sources: POI[] = [];
    
    // Nur gelegentlich eine offizielle Quelle hinzufügen
    if (Math.random() > 0.5) {
        sources.push({
            id: `water-official-1-${bounds[0]}-${bounds[1]}`,
            name: 'Stadtbrunnen',
            description: 'Historischer Brunnen mit Trinkwasser, regelmäßig getestet',
            category: 'survival',
            subcategory: 'water',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 280,
            source: 'official',
            icon: 'water-fountain',
            properties: {
                waterQuality: {
                    type: 'tap',
                    drinkable: true,
                    treatmentRecommended: false,
                    flowRate: 'high',
                    lastTestedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    lastTestedResult: 'excellent',
                    temperature: 10.5
                },
                lastVerified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                verifiedBy: 'Stadtwerke',
                openingHours: '24/7'
            }
        });
    }
    
    return sources;
}

/**
 * Abrufen von durch die Community gemeldeten Wasserquellen
 */
async function fetchCommunityWaterSources(bounds: [number, number, number, number]): Promise<POI[]> {
    // In einer vollständigen Implementierung würde hier ein API-Aufruf erfolgen
    // Für Demo-Zwecke verwenden wir Beispieldaten
    
    // Simulierte Anfrage-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Beispielquellen basierend auf den Bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    
    // Zufällige Position innerhalb der Bounds
    const randomLat1 = minLat + Math.random() * (maxLat - minLat);
    const randomLon1 = minLon + Math.random() * (maxLon - minLon);
    const randomLat2 = minLat + Math.random() * (maxLat - minLat);
    const randomLon2 = minLon + Math.random() * (maxLon - minLon);
    
    // Community-Quellen
    const sources: POI[] = [];
    
    // Quelle 1: Versteckte Quelle
    sources.push({
        id: `water-community-1-${bounds[0]}-${bounds[1]}`,
        name: 'Versteckte Bergquelle',
        description: 'Kleine Quelle abseits des Hauptwegs. Gutes, kaltes Wasser.',
        category: 'survival',
        subcategory: 'water',
        latitude: randomLat1,
        longitude: randomLon1,
        elevation: 620,
        source: 'community',
        icon: 'water-spring',
        properties: {
            waterQuality: {
                type: 'spring',
                drinkable: true,
                treatmentRecommended: true,
                flowRate: 'low',
                notes: 'Versteckt hinter Felsen, 50m vom Weg entfernt. Im Sommer manchmal trocken.'
            },
            lastVerified: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            verifiedBy: 'Maria H.',
            ratings: 4.5,
            reviews: [
                {
                    user: 'Wanderer123',
                    date: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
                    rating: 5,
                    comment: 'Lebensretter an heißen Tagen! Wasser ist kalt und erfrischend.'
                },
                {
                    user: 'BergFex',
                    date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
                    rating: 4,
                    comment: 'Gute Quelle, aber manchmal schwer zu finden. Habe Wasser abgekocht, war einwandfrei.'
                }
            ]
        }
    });
    
    // Quelle 2: Bach
    sources.push({
        id: `water-community-2-${bounds[0]}-${bounds[1]}`,
        name: 'Klarer Bergbach',
        description: 'Schmaler Bach mit sauberem Wasser, gut zum Filtern geeignet.',
        category: 'survival',
        subcategory: 'water',
        latitude: randomLat2,
        longitude: randomLon2,
        elevation: 540,
        source: 'community',
        icon: 'water-stream',
        properties: {
            waterQuality: {
                type: 'river',
                drinkable: false,
                treatmentRecommended: true,
                flowRate: 'medium',
                notes: 'Wasser sollte gefiltert und abgekocht werden. Keine Siedlungen stromaufwärts.'
            },
            lastVerified: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            verifiedBy: 'Thomas K.',
            ratings: 3.8,
            reviews: [
                {
                    user: 'WildnisWanderer',
                    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                    rating: 4,
                    comment: 'Mit meinem Filter perfekt trinkbar. Guter Ort zum Wasservorräte auffüllen.'
                }
            ]
        }
    });
    
    return sources;
}

/**
 * Entfernt doppelte Wasserquellen basierend auf Koordinatennähe
 */
function removeDuplicateWaterSources(sources: POI[]): POI[] {
    const uniqueSources: POI[] = [];
    const coordinateSet = new Set<string>();
    
    // Koordinaten-Genauigkeit für Deduplizierung (5 Dezimalstellen ≈ 1m Genauigkeit)
    const precision = 5;
    
    for (const source of sources) {
        // Koordinaten mit fester Genauigkeit als String-Key
        const coordKey = `${source.latitude.toFixed(precision)},${source.longitude.toFixed(precision)}`;
        
        if (!coordinateSet.has(coordKey)) {
            coordinateSet.add(coordKey);
            uniqueSources.push(source);
        } else {
            // Bei Duplikaten priorisieren wir offizielle Quellen über OSM über Community
            const existingIndex = uniqueSources.findIndex(s => 
                s.latitude.toFixed(precision) === source.latitude.toFixed(precision) &&
                s.longitude.toFixed(precision) === source.longitude.toFixed(precision)
            );
            
            if (existingIndex >= 0) {
                const existing = uniqueSources[existingIndex];
                
                // Offizielle Quellen haben höchste Priorität
                if (source.source === 'official' && existing.source !== 'official') {
                    uniqueSources[existingIndex] = source;
                }
                // OSM-Quellen haben mittlere Priorität
                else if (source.source === 'osm' && existing.source === 'community') {
                    uniqueSources[existingIndex] = source;
                }
                // Bei gleicher Quelle die aktuellere nehmen
                else if (source.source === existing.source) {
                    const existingDate = new Date(existing.properties.lastVerified || 0);
                    const newDate = new Date(source.properties.lastVerified || 0);
                    
                    if (newDate > existingDate) {
                        uniqueSources[existingIndex] = source;
                    }
                }
            }
        }
    }
    
    return uniqueSources;
}