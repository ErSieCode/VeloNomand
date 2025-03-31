// src/lib/utils/api/campingSpotsApi.ts

import type { POI } from '$lib/types/POITypes';

/**
 * Abrufen von Camping- und Wildcamping-Spots aus verschiedenen Quellen
 * - Offizielle Campingplätze
 * - Community-gemeldete Wildcamping-Spots
 * - Trekkingplätze und Biwakplätze
 */
export async function fetchCampingSpots(bounds: [number, number, number, number]): Promise<POI[]> {
    try {
        // Verschiedene Datenquellen abfragen (parallel)
        const [officialCampgrounds, wildCampingSpots, trekShelters] = await Promise.all([
            fetchOfficialCampgrounds(bounds),
            fetchWildCampingSpots(bounds),
            fetchTrekkingShelters(bounds)
        ]);
        
        // Alle Camping-Spots zusammenführen
        return [...officialCampgrounds, ...wildCampingSpots, ...trekShelters];
        
    } catch (error) {
        console.error('Fehler beim Abrufen von Camping-Spots:', error);
        return [];
    }
}

/**
 * Abrufen offizieller Campingplätze
 */
async function fetchOfficialCampgrounds(bounds: [number, number, number, number]): Promise<POI[]> {
    // In einer vollständigen Implementierung würde hier ein API-Aufruf erfolgen
    // Für Demo-Zwecke verwenden wir Beispieldaten
    
    // Simulierte Anfrage-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Zufällige Position innerhalb der Bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Beispiel-Campingplätze
    return [
        {
            id: `camping-official-1-${bounds[0]}-${bounds[1]}`,
            name: 'Waldcamping Sonnental',
            description: 'Offizieller Campingplatz am Waldrand mit Sanitäranlagen und Stromanschluss.',
            category: 'survival',
            subcategory: 'shelter',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 320,
            source: 'official',
            icon: 'campsite',
            images: [
                '/images/demo/camp1.jpg',
                '/images/demo/camp2.jpg'
            ],
            properties: {
                campingAttributes: {
                    groundType: 'grass',
                    shelter: 'partial',
                    capacity: 50,
                    sunExposure: 'partial',
                    windProtection: 'sheltered',
                    facilities: ['fireplace', 'table', 'trash', 'toilet'],
                    mobileSignal: 'good',
                    noiseLevel: 'moderate',
                    privacyLevel: 'moderate',
                    legalStatus: 'legal',
                    nearbyWater: true
                },
                lastVerified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                ratings: 4.2,
                contactInfo: 'Tel: +49 123 4567890',
                website: 'https://waldcamping-sonnental.example.com',
                openingHours: 'Apr-Okt: 8:00-20:00, Anreise bis 18:00 Uhr',
                reviews: [
                    {
                        user: 'CampingFan',
                        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                        rating: 5,
                        comment: 'Schöner, gepflegter Platz mit freundlichem Personal. Sanitäranlagen sehr sauber.'
                    },
                    {
                        user: 'NaturFreund',
                        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                        rating: 4,
                        comment: 'Guter Platz, aber am Wochenende etwas überfüllt. Tolle Lage am Waldrand.'
                    }
                ]
            }
        }
    ];
}

/**
 * Abrufen von Community-gemeldeten Wildcamping-Spots
 */
async function fetchWildCampingSpots(bounds: [number, number, number, number]): Promise<POI[]> {
    // In einer vollständigen Implementierung würde hier ein API-Aufruf erfolgen
    // Für Demo-Zwecke verwenden wir Beispieldaten
    
    // Simulierte Anfrage-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Zufällige Positionen innerhalb der Bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat1 = minLat + Math.random() * (maxLat - minLat);
    const randomLon1 = minLon + Math.random() * (maxLon - minLon);
    const randomLat2 = minLat + Math.random() * (maxLat - minLat);
    const randomLon2 = minLon + Math.random() * (maxLon - minLon);
    
    // Beispiel-Wildcamping-Spots
    return [
        {
            id: `camping-wild-1-${bounds[0]}-${bounds[1]}`,
            name: 'Versteckte Lichtung',
            description: 'Ruhige Lichtung abseits der Wege, gut versteckt hinter Felsen. Flache Fläche für 1-2 Zelte.',
            category: 'survival',
            subcategory: 'wildcamp',
            latitude: randomLat1,
            longitude: randomLon1,
            elevation: 560,
            source: 'community',
            icon: 'tent',
            properties: {
                campingAttributes: {
                    groundType: 'grass',
                    shelter: 'partial',
                    capacity: 2,
                    sunExposure: 'partial',
                    windProtection: 'sheltered',
                    facilities: [],
                    mobileSignal: 'weak',
                    noiseLevel: 'silent',
                    privacyLevel: 'isolated',
                    legalStatus: 'tolerated',
                    nearbyWater: true,
                    notes: 'Kleine Quelle 100m östlich. Sehr diskret campen und keine Spuren hinterlassen.'
                },
                lastVerified: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                verifiedBy: 'WildernessHiker',
                ratings: 4.8,
                reviews: [
                    {
                        user: 'SoloTrekker',
                        date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
                        rating: 5,
                        comment: 'Perfekter Platz für eine ruhige Nacht. Hatte die ganze Gegend für mich allein.'
                    }
                ]
            }
        },
        {
            id: `camping-wild-2-${bounds[0]}-${bounds[1]}`,
            name: 'Aussichtspunkt Adlerhorst',
            description: 'Erhöhter Platz mit atemberaubender Aussicht über das Tal. Exponiert, aber einzigartig.',
            category: 'survival',
            subcategory: 'wildcamp',
            latitude: randomLat2,
            longitude: randomLon2,
            elevation: 980,
            source: 'community',
            icon: 'tent',
            properties: {
                campingAttributes: {
                    groundType: 'rock',
                    shelter: 'none',
                    capacity: 1,
                    sunExposure: 'full',
                    windProtection: 'exposed',
                    facilities: [],
                    mobileSignal: 'moderate',
                    noiseLevel: 'quiet',
                    privacyLevel: 'secluded',
                    legalStatus: 'unclear',
                    nearbyWater: false,
                    notes: 'Bei Wind gefährlich exponiert. Wasser mitnehmen, keine Quelle in der Nähe.'
                },
                lastVerified: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
                verifiedBy: 'MountainClimber',
                ratings: 4.3,
                reviews: [
                    {
                        user: 'AdventureSeeker',
                        date: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000).toISOString(),
                        rating: 5,
                        comment: 'Unglaublicher Sonnenaufgang! Aber bei Wind ist es sehr exponiert.'
                    },
                    {
                        user: 'NaturPhilosoph',
                        date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
                        rating: 3,
                        comment: 'Beeindruckende Aussicht, aber der Boden ist sehr hart und uneben. Gut für eine Nacht.'
                    }
                ]
            }
        }
    ];
}

/**
 * Abrufen von Trekking-Unterkünften und Biwakplätzen
 */
async function fetchTrekkingShelters(bounds: [number, number, number, number]): Promise<POI[]> {
    // In einer vollständigen Implementierung würde hier ein API-Aufruf erfolgen
    // Für Demo-Zwecke verwenden wir Beispieldaten
    
    // Simulierte Anfrage-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Zufällige Position innerhalb der Bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Beispiel-Unterkunft
    return [
        {
            id: `camping-shelter-1-${bounds[0]}-${bounds[1]}`,
            name: 'Wanderer-Schutzhütte',
            description: 'Einfache Holzhütte als Notunterkunft für Wanderer. Keine Reservierung möglich.',
            category: 'survival',
            subcategory: 'shelter',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 720,
            source: 'official',
            icon: 'shelter',
            properties: {
                campingAttributes: {
                    groundType: 'wood',
                    shelter: 'good',
                    capacity: 6,
                    sunExposure: 'shaded',
                    windProtection: 'sheltered',
                    facilities: [],
                    mobileSignal: 'none',
                    noiseLevel: 'quiet',
                    privacyLevel: 'moderate',
                    legalStatus: 'legal',
                    nearbyWater: true,
                    notes: 'Einfache Unterkunft ohne Services. Quelle 200m entfernt.'
                },
                lastVerified: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                verifiedBy: 'Alpenverein',
                ratings: 4.0,
                reviews: [
                    {
                        user: 'Berggänger',
                        date: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
                        rating: 4,
                        comment: 'Einfache, aber saubere Unterkunft. Hat mich vor einem Gewitter gerettet.'
                    }
                ]
            }
        }
    ];
}