// src/lib/utils/api/hazardousTerrainApi.ts

import type { POI } from '$lib/types/POITypes';

/**
 * Fetches hazardous terrain features including:
 * - Quicksand areas
 * - Swamps and bogs
 * - Steep cliffs and rockfall zones
 * - Avalanche-prone slopes
 * - Unstable ice
 * - Lava fields
 * - Active geothermal areas
 * - Areas with dangerous wildlife
 */
export async function fetchHazardousTerrain(
    bounds: [number, number, number, number],
    options: { seasonAdjusted?: boolean } = {}
): Promise<POI[]> {
    try {
        // Query different terrain hazard types in parallel
        const [quicksandAreas, swampAreas, steepCliffs, iceAreas, geothermalAreas] = await Promise.all([
            fetchQuicksandAreas(bounds),
            fetchSwampAreas(bounds),
            fetchSteepCliffs(bounds),
            fetchUnstableIceAreas(bounds, options),
            fetchGeothermalAreas(bounds)
        ]);
        
        // Combine all hazards
        return [...quicksandAreas, ...swampAreas, ...steepCliffs, ...iceAreas, ...geothermalAreas];
        
    } catch (error) {
        console.error('Error fetching hazardous terrain:', error);
        return [];
    }
}

/**
 * Fetches quicksand and sinking sand areas
 */
async function fetchQuicksandAreas(bounds: [number, number, number, number]): Promise<POI[]> {
    // In a complete implementation, this would make an API call
    // For demo purposes, we use sample data
    
    // Simulated request delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Random position within bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Only return quicksand in specific regions (very rare)
    const hasQuicksand = Math.random() > 0.9;
    
    if (!hasQuicksand) {
        return [];
    }
    
    // Create sample quicksand hazard
    return [
        {
            id: `hazard-quicksand-1-${bounds[0]}-${bounds[1]}`,
            name: 'Treibsandgebiet',
            description: 'Gefährliche Treibsandzonen entlang des Flussufers. Besondere Vorsicht bei weichem, feuchtem Untergrund.',
            category: 'warning',
            subcategory: 'terrain',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 80,
            source: 'official',
            icon: 'quicksand',
            properties: {
                safetyWarning: {
                    type: 'terrain',
                    severity: 'high',
                    terrainHazard: 'quicksand',
                    description: 'Treibsandzonen in Flussnähe. Nach Hochwasser besonders gefährlich und schwer erkennbar.',
                    active: true,
                    reportDate: new Date().toISOString(),
                    reportedBy: 'Ranger-Station',
                    mitigation: 'Flussufer meiden. Bei Einsinken flach machen und langsam zum festen Untergrund zurückbewegen. Nicht aufrecht stehen oder kämpfen.'
                },
                naturalHazard: {
                    type: 'other',
                    risk: 'high',
                    frequency: 'common',
                    lastOccurrence: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    safetyInstructions: 'Bleiben Sie auf markierten Pfaden. Bei Einsinken: Ruhig bleiben, flach machen, langsam zum festen Grund zurück. Rucksack abnehmen, wenn möglich.'
                },
                lastVerified: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
            }
        }
    ];
}

/**
 * Fetches swamp and bog areas
 */
async function fetchSwampAreas(bounds: [number, number, number, number]): Promise<POI[]> {
    // In a complete implementation, this would make an API call
    // For demo purposes, we use sample data
    
    // Simulated request delay
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Random positions within bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat1 = minLat + Math.random() * (maxLat - minLat);
    const randomLon1 = minLon + Math.random() * (maxLon - minLon);
    const randomLat2 = minLat + Math.random() * (maxLat - minLat);
    const randomLon2 = minLon + Math.random() * (maxLon - minLon);
    
    // Check if the area typically has swamps (based on random chance for demo)
    const hasSwamps = Math.random() > 0.7;
    
    if (!hasSwamps) {
        return [];
    }
    
    // Create sample swamp hazards
    return [
        {
            id: `hazard-swamp-1-${bounds[0]}-${bounds[1]}`,
            name: 'Sumpfgebiet',
            description: 'Ausgedehntes Sumpfgebiet mit tiefem Schlamm. Nur auf markierten Pfaden und Stegen passierbar.',
            category: 'warning',
            subcategory: 'terrain',
            latitude: randomLat1,
            longitude: randomLon1,
            elevation: 120,
            source: 'official',
            icon: 'swamp',
            properties: {
                safetyWarning: {
                    type: 'terrain',
                    severity: 'moderate',
                    terrainHazard: 'swamp',
                    description: 'Großes Sumpfgebiet mit stellenweise tiefem Morast. Nach Regenfällen besonders gefährlich.',
                    active: true,
                    reportDate: new Date().toISOString(),
                    reportedBy: 'Forstamt',
                    mitigation: 'Nur markierte Wege und Holzstege benutzen. Bei Nebel besondere Vorsicht.'
                },
                naturalHazard: {
                    type: 'other',
                    risk: 'moderate',
                    frequency: 'common',
                    season: {
                        from: 3, // March
                        to: 11  // November
                    },
                    safetyInstructions: 'Wasserresistente Stiefel empfohlen. Holzstege benutzen, wo vorhanden. Bei Einsinken langsam herausziehen.'
                },
                lastVerified: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
            }
        },
        {
            id: `hazard-bog-1-${bounds[0]}-${bounds[1]}`,
            name: 'Hochmoor',
            description: 'Gefährliches Hochmoor mit schwimmender Pflanzendecke. Stellenweise tiefe Wasserlöcher unter der Vegetation.',
            category: 'warning',
            subcategory: 'terrain',
            latitude: randomLat2,
            longitude: randomLon2,
            elevation: 160,
            source: 'official',
            icon: 'bog',
            properties: {
                safetyWarning: {
                    type: 'terrain',
                    severity: 'high',
                    terrainHazard: 'bog',
                    description: 'Hochmoor mit trügerischer Oberfläche. Unter der Pflanzendecke befinden sich tiefe Wasserlöcher.',
                    active: true,
                    reportDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                    reportedBy: 'Naturschutzamt',
                    mitigation: 'Ausschließlich auf dem ausgewiesenen Moorlehrpfad bleiben. Bei verfärbter oder abgesackter Vegetation äußerste Vorsicht.'
                },
                naturalHazard: {
                    type: 'other',
                    risk: 'high',
                    frequency: 'common',
                    safetyInstructions: 'Niemals den markierten Pfad verlassen. Führungen nur mit erfahrenem Guide. Rettungsstangen alle 100m entlang des Pfades.'
                },
                droneRestriction: {
                    droneFlyingAllowed: false,
                    restrictionType: 'permanent',
                    restrictionReason: 'nature',
                    maxAltitude: 0,
                    permitPossible: false
                },
                lastVerified: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
            }
        }
    ];
}

/**
 * Fetches steep cliffs and rockfall zones
 */
async function fetchSteepCliffs(bounds: [number, number, number, number]): Promise<POI[]> {
    // In a complete implementation, this would make an API call
    // For demo purposes, we use sample data
    
    // Simulated request delay
    await new Promise(resolve => setTimeout(resolve, 220));
    
    // Random position within bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Only return cliffs in specific regions
    const hasCliffs = Math.random() > 0.6;
    
    if (!hasCliffs) {
        return [];
    }
    
    // Create sample cliff hazard
    return [
        {
            id: `hazard-cliff-1-${bounds[0]}-${bounds[1]}`,
            name: 'Steinschlagzone',
            description: 'Gefährliches Gebiet mit regelmäßigem Steinschlag. Besondere Vorsicht bei und nach Regenfällen.',
            category: 'warning',
            subcategory: 'terrain',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 650,
            source: 'official',
            icon: 'rockfall',
            properties: {
                safetyWarning: {
                    type: 'terrain',
                    severity: 'high',
                    terrainHazard: 'rockfall',
                    description: 'Instabile Felswand mit regelmäßigem Steinschlag, besonders nach Regenfällen und im Frühjahr nach Frost-Tau-Zyklen.',
                    active: true,
                    reportDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    reportedBy: 'Alpenverein',
                    mitigation: 'Zone zügig durchqueren. Auf Anzeichen von Steinschlag achten (Geräusche). Helm tragen wenn möglich.'
                },
                naturalHazard: {
                    type: 'rockfall',
                    risk: 'high',
                    frequency: 'common',
                    season: {
                        from: 3, // March
                        to: 5   // May
                    },
                    lastOccurrence: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                    safetyInstructions: 'Helm wird dringend empfohlen. Bei Anzeichen von Steinschlag sofort schützen oder flüchten. Nach Regenfällen meiden.'
                },
                droneRestriction: {
                    droneFlyingAllowed: true,
                    restrictionType: 'advisory',
                    restrictionReason: 'safety',
                    specialConditions: 'Starke Aufwinde können Drohnen destabilisieren. Bei Wind nicht empfohlen.'
                },
                lastVerified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }
        }
    ];
}

/**
 * Fetches unstable ice areas (seasonal)
 */
async function fetchUnstableIceAreas(
    bounds: [number, number, number, number], 
    options: { seasonAdjusted?: boolean } = {}
): Promise<POI[]> {
    // In a complete implementation, this would make an API call
    // For demo purposes, we use sample data
    
    // Simulated request delay
    await new Promise(resolve => setTimeout(resolve, 280));
    
    // Check current season
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const isWinterSeason = currentMonth >= 11 || currentMonth <= 3;
    
    // If season-adjusted and not winter, don't return ice hazards
    if (options.seasonAdjusted && !isWinterSeason) {
        return [];
    }
    
    // Random position within bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Only return ice areas in specific regions
    const hasIceAreas = Math.random() > 0.7;
    
    if (!hasIceAreas) {
        return [];
    }
    
    // Create sample ice hazard
    return [
        {
            id: `hazard-ice-1-${bounds[0]}-${bounds[1]}`,
            name: 'Dünnes Eis',
            description: 'Gefährlich dünne Eisdecke auf dem See. Betreten verboten.',
            category: 'warning',
            subcategory: 'terrain',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 420,
            source: 'official',
            icon: 'thin-ice',
            properties: {
                safetyWarning: {
                    type: 'terrain',
                    severity: 'extreme',
                    terrainHazard: 'thin_ice',
                    description: 'Lebensgefahr! Unzureichend dicke Eisdecke auf dem See. Absolutes Betretungsverbot.',
                    seasonality: {
                        from: 11, // November
                        to: 3     // March
                    },
                    active: isWinterSeason,
                    reportDate: new Date().toISOString(),
                    reportedBy: 'Wasserschutzpolizei',
                    mitigation: 'See nicht betreten. Mindestabstand von 5m zum Ufer einhalten. Bei Einbruch anderer: Notruf wählen, nicht selbst aufs Eis gehen.'
                },
                naturalHazard: {
                    type: 'other',
                    risk: 'extreme',
                    frequency: 'seasonal',
                    season: {
                        from: 11, // November
                        to: 3     // March
                    },
                    safetyInstructions: 'Eisdicke unter 15cm - absolutes Betretungsverbot. Uferbereiche besonders gefährlich. Kinder beaufsichtigen.'
                },
                droneRestriction: {
                    droneFlyingAllowed: true,
                    restrictionType: 'none',
                    restrictionReason: 'none'
                },
                lastVerified: new Date().toISOString(),
                isActive: isWinterSeason
            }
        }
    ];
}

/**
 * Fetches geothermal hazard areas
 */
async function fetchGeothermalAreas(bounds: [number, number, number, number]): Promise<POI[]> {
    // In a complete implementation, this would make an API call
    // For demo purposes, we use sample data
    
    // Simulated request delay
    await new Promise(resolve => setTimeout(resolve, 230));
    
    // Random position within bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Geothermal areas are extremely rare
    const hasGeothermalArea = Math.random() > 0.95;
    
    if (!hasGeothermalArea) {
        return [];
    }
    
    // Create sample geothermal hazard
    return [
        {
            id: `hazard-geothermal-1-${bounds[0]}-${bounds[1]}`,
            name: 'Heiße Quellen',
            description: 'Heißes Quellgebiet mit kochendem Wasser und instabilem Untergrund. Nur markierte Wege benutzen.',
            category: 'warning',
            subcategory: 'terrain',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 320,
            source: 'official',
            icon: 'hot-springs',
            properties: {
                safetyWarning: {
                    type: 'terrain',
                    severity: 'high',
                    terrainHazard: 'hot_springs',
                    description: 'Aktives geothermales Gebiet mit kochendem Wasser und gefährlichen Dämpfen. Dünne Bodenkruste kann einbrechen.',
                    active: true,
                    reportDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                    reportedBy: 'Geologische Behörde',
                    mitigation: 'Ausschließlich auf markierten Holzstegen bleiben. Berührung mit Wasser und Dampf vermeiden. Tiere anleinen.'
                },
                naturalHazard: {
                    type: 'other',
                    risk: 'high',
                    frequency: 'common',
                    safetyInstructions: 'Verwenden Sie ausschließlich die Holzstege. Berühren Sie kein Wasser. Bei Verbrühungen sofort mit kaltem Wasser kühlen und medizinische Hilfe holen.'
                },
                droneRestriction: {
                    droneFlyingAllowed: true,
                    restrictionType: 'advisory',
                    restrictionReason: 'safety',
                    specialConditions: 'Thermik und Dampf können die Flugeigenschaften von Drohnen beeinträchtigen.'
                },
                lastVerified: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
            }
        }
    ];
}