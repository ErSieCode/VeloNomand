// src/lib/utils/api/restrictedAreasApi.ts

import type { POI } from '$lib/types/POITypes';

/**
 * Fetches restricted access areas in the specified bounds including:
 * - Military zones and training areas
 * - Drone flight restriction zones
 * - Private property/no-trespassing areas
 * - National park restricted zones
 * - Protected wildlife habitats
 * - Temporary closures
 */
export async function fetchRestrictedAreas(
    bounds: [number, number, number, number],
    options: { categoryFilter?: string[] } = {}
): Promise<POI[]> {
    try {
        // Set up category filtering
        const categoryFilter = options.categoryFilter || [
            'military', 'drone', 'private', 'nature', 'wildlife', 'temporary'
        ];
        
        // Request arrays for enabled categories
        const requests: Promise<POI[]>[] = [];
        
        if (categoryFilter.includes('military')) {
            requests.push(fetchMilitaryAreas(bounds));
        }
        
        if (categoryFilter.includes('drone')) {
            requests.push(fetchDroneRestrictions(bounds));
        }
        
        if (categoryFilter.includes('private')) {
            requests.push(fetchPrivateProperty(bounds));
        }
        
        if (categoryFilter.includes('nature') || categoryFilter.includes('wildlife')) {
            requests.push(fetchProtectedAreas(bounds));
        }
        
        if (categoryFilter.includes('temporary')) {
            requests.push(fetchTemporaryRestrictions(bounds));
        }
        
        // Execute all requests in parallel
        const results = await Promise.all(requests);
        
        // Merge and deduplicate results
        return Array.from(new Set(results.flat()));
        
    } catch (error) {
        console.error('Error fetching restricted areas:', error);
        return [];
    }
}

/**
 * Fetches military restricted zones and training areas
 */
async function fetchMilitaryAreas(bounds: [number, number, number, number]): Promise<POI[]> {
    // In a complete implementation, this would make an API call
    // For demo purposes, we use sample data
    
    // Simulated request delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Random position within bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Only return military areas occasionally to simulate sparse distribution
    const hasMilitaryArea = Math.random() > 0.8;
    
    if (!hasMilitaryArea) {
        return [];
    }
    
    // Create sample military zone
    return [
        {
            id: `restricted-military-1-${bounds[0]}-${bounds[1]}`,
            name: 'Militärisches Sperrgebiet',
            description: 'Militärisches Übungsgelände mit strengem Betretungsverbot. Lebensgefahr durch Übungen mit scharfer Munition.',
            category: 'warning',
            subcategory: 'restricted',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 250,
            source: 'official',
            icon: 'military',
            properties: {
                safetyWarning: {
                    type: 'human',
                    severity: 'extreme',
                    humanHazard: 'military',
                    description: 'Streng bewachtes militärisches Sperrgebiet. Unbefugtes Betreten ist strafbar und lebensgefährlich.',
                    active: true,
                    reportDate: new Date().toISOString(),
                    reportedBy: 'Bundeswehr',
                    mitigation: 'Großräumig umgehen. Auf Warnschilder achten. Bei versehentlichem Betreten sofort umkehren.'
                },
                restrictedAccess: {
                    type: 'military',
                    permitRequired: false,
                    accessLevel: 'prohibited',
                    enforcement: 'high',
                    perimeterMarked: true,
                    patrolled: true,
                    scheduleInfo: 'Dauerhaft gesperrt, erhöhte Aktivität Mo-Fr',
                    contactInfo: 'Militärische Sicherheitszentrale: +49 123 456789',
                    legalConsequences: 'Strafanzeige und Geldbuße bei Zuwiderhandlung'
                },
                droneRestriction: {
                    droneFlyingAllowed: false,
                    restrictionType: 'permanent',
                    restrictionReason: 'military',
                    maxAltitude: 0, // No flight whatsoever
                    permitPossible: false
                },
                lastVerified: new Date().toISOString()
            }
        }
    ];
}

/**
 * Fetches drone flight restriction zones
 */
async function fetchDroneRestrictions(bounds: [number, number, number, number]): Promise<POI[]> {
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
    
    // Create sample drone restriction zones
    return [
        {
            id: `restricted-drone-1-${bounds[0]}-${bounds[1]}`,
            name: 'Flugplatz Sperrzone',
            description: 'Drohnen-Flugverbotszone im Umkreis von 1,5km um den Flugplatz.',
            category: 'warning',
            subcategory: 'restricted',
            latitude: randomLat1,
            longitude: randomLon1,
            elevation: 180,
            source: 'official',
            icon: 'no-drone',
            properties: {
                safetyWarning: {
                    type: 'human',
                    severity: 'high',
                    humanHazard: 'aviation',
                    description: 'Flugplatz-Sperrzone für Drohnen. Einflug verboten.',
                    active: true,
                    reportDate: new Date().toISOString(),
                    reportedBy: 'Deutsche Flugsicherung',
                    mitigation: 'Keine Drohnen starten. Bei bereits fliegenden Drohnen sofort landen und Zone verlassen.'
                },
                droneRestriction: {
                    droneFlyingAllowed: false,
                    restrictionType: 'permanent',
                    restrictionReason: 'airport',
                    maxAltitude: 0, // No flight whatsoever
                    radiusMeters: 1500,
                    permitPossible: false,
                    contactInfo: 'Flugleitung: +49 123 456789'
                },
                lastVerified: new Date().toISOString()
            }
        },
        {
            id: `restricted-drone-2-${bounds[0]}-${bounds[1]}`,
            name: 'Naturschutzgebiet - Drohnenflug eingeschränkt',
            description: 'Naturschutzgebiet mit Drohnenflugbeschränkungen zum Schutz der Vogelwelt. Flüge nur mit Sondergenehmigung.',
            category: 'warning',
            subcategory: 'restricted',
            latitude: randomLat2,
            longitude: randomLon2,
            elevation: 240,
            source: 'official',
            icon: 'limited-drone',
            properties: {
                safetyWarning: {
                    type: 'human',
                    severity: 'moderate',
                    humanHazard: 'legal',
                    description: 'Eingeschränkte Drohnenflugzone zum Schutz sensibler Ökosysteme.',
                    active: true,
                    reportDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                    reportedBy: 'Naturschutzbehörde',
                    mitigation: 'Genehmigung vor Flugbeginn einholen. Rücksicht auf Tierwelt nehmen.'
                },
                droneRestriction: {
                    droneFlyingAllowed: true, // with restrictions
                    restrictionType: 'conditional',
                    restrictionReason: 'nature',
                    maxAltitude: 50, // meters
                    permitPossible: true,
                    permitInfo: 'Genehmigung bei der zuständigen Naturschutzbehörde beantragen',
                    specialConditions: 'Keine Flüge während der Brutzeit (März-Juni)',
                    contactInfo: 'Naturschutzbehörde: +49 123 456789'
                },
                restrictedAccess: {
                    type: 'nature',
                    permitRequired: false,
                    accessLevel: 'limited',
                    enforcement: 'moderate',
                    scheduleInfo: 'Zugangsbeschränkungen während der Brutzeit',
                },
                lastVerified: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
            }
        }
    ];
}

/**
 * Fetches private property and no-trespassing areas
 */
async function fetchPrivateProperty(bounds: [number, number, number, number]): Promise<POI[]> {
    // In a complete implementation, this would make an API call
    // For demo purposes, we use sample data
    
    // Simulated request delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Random position within bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Only return private property sometimes to simulate sparse distribution
    const hasPrivateArea = Math.random() > 0.7;
    
    if (!hasPrivateArea) {
        return [];
    }
    
    // Create sample private property warning
    return [
        {
            id: `restricted-private-1-${bounds[0]}-${bounds[1]}`,
            name: 'Privatgrundstück',
            description: 'Privates Grundstück. Betreten verboten.',
            category: 'warning',
            subcategory: 'restricted',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 210,
            source: 'osm',
            icon: 'private-property',
            properties: {
                safetyWarning: {
                    type: 'human',
                    severity: 'moderate',
                    humanHazard: 'legal',
                    description: 'Privatgrundstück mit klarer Beschilderung. Durchquerung nicht gestattet.',
                    active: true,
                    reportDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
                    mitigation: 'Alternative Routen wählen. Umgehung über markierte Wege.'
                },
                restrictedAccess: {
                    type: 'private',
                    permitRequired: true,
                    accessLevel: 'prohibited',
                    enforcement: 'moderate',
                    perimeterMarked: true,
                    patrolled: false,
                    legalConsequences: 'Anzeige wegen Hausfriedensbruch möglich'
                },
                droneRestriction: {
                    droneFlyingAllowed: false,
                    restrictionType: 'privacy',
                    restrictionReason: 'private_property',
                    permitPossible: false
                },
                lastVerified: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
            }
        }
    ];
}

/**
 * Fetches protected natural areas with access restrictions
 */
async function fetchProtectedAreas(bounds: [number, number, number, number]): Promise<POI[]> {
    // In a complete implementation, this would make an API call
    // For demo purposes, we use sample data
    
    // Simulated request delay
    await new Promise(resolve => setTimeout(resolve, 280));
    
    // Random position within bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Only return protected areas sometimes to simulate sparse distribution
    const hasProtectedArea = Math.random() > 0.6;
    
    if (!hasProtectedArea) {
        return [];
    }
    
    // Create sample protected area
    return [
        {
            id: `restricted-nature-1-${bounds[0]}-${bounds[1]}`,
            name: 'Vogelschutzgebiet',
            description: 'Geschütztes Vogelreservat mit Zugangsbeschränkungen. Brutgebiet seltener Arten.',
            category: 'warning',
            subcategory: 'restricted',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 190,
            source: 'official',
            icon: 'wildlife-protection',
            properties: {
                safetyWarning: {
                    type: 'human',
                    severity: 'moderate',
                    humanHazard: 'legal',
                    description: 'Geschütztes Vogelreservat. Betreten nur auf markierten Wegen erlaubt.',
                    seasonality: {
                        from: 3, // March
                        to: 7   // July
                    },
                    active: true,
                    reportDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                    reportedBy: 'Naturschutzamt',
                    mitigation: 'Auf den markierten Wegen bleiben. Hunde anleinen. Lärm vermeiden.'
                },
                restrictedAccess: {
                    type: 'nature',
                    permitRequired: false,
                    accessLevel: 'limited',
                    enforcement: 'moderate',
                    perimeterMarked: true,
                    patrolled: true,
                    scheduleInfo: 'Verschärfte Beschränkungen während der Brutzeit (März-Juli)',
                    legalConsequences: 'Bußgelder bei Missachtung der Schutzbestimmungen'
                },
                droneRestriction: {
                    droneFlyingAllowed: false,
                    restrictionType: 'seasonal',
                    restrictionReason: 'wildlife',
                    maxAltitude: 0,
                    permitPossible: false,
                    specialConditions: 'Absolutes Flugverbot während der Brutzeit (März-Juli)'
                },
                lastVerified: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
            }
        }
    ];
}

/**
 * Fetches temporary restricted areas (construction, events, etc.)
 */
async function fetchTemporaryRestrictions(bounds: [number, number, number, number]): Promise<POI[]> {
    // In a complete implementation, this would make an API call
    // For demo purposes, we use sample data
    
    // Simulated request delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Random position within bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Only return temporary restrictions sometimes
    const hasTemporaryRestriction = Math.random() > 0.8;
    
    if (!hasTemporaryRestriction) {
        return [];
    }
    
    // Set up event dates (next weekend from current date)
    const now = new Date();
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
    const eventStart = new Date(now);
    eventStart.setDate(now.getDate() + daysUntilSaturday);
    eventStart.setHours(9, 0, 0, 0);
    
    const eventEnd = new Date(eventStart);
    eventEnd.setDate(eventStart.getDate() + 1);
    eventEnd.setHours(18, 0, 0, 0);
    
    // Create sample temporary restriction
    return [
        {
            id: `restricted-temporary-1-${bounds[0]}-${bounds[1]}`,
            name: 'Radrennen - Temporäre Sperrung',
            description: 'Wege temporär für Radrennen gesperrt. Alternative Routen nutzen.',
            category: 'warning',
            subcategory: 'restricted',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 230,
            source: 'official',
            icon: 'event',
            temporaryEvent: true,
            eventStart: eventStart.toISOString(),
            eventEnd: eventEnd.toISOString(),
            properties: {
                safetyWarning: {
                    type: 'human',
                    severity: 'moderate',
                    humanHazard: 'event',
                    description: 'Wege wegen Radrennen temporär gesperrt. Umleitungen ausgeschildert.',
                    active: true,
                    reportDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    reportedBy: 'Veranstalter',
                    mitigation: 'Ausgeschilderte Umleitungen nutzen. Betroffenen Bereich während der Veranstaltung meiden.'
                },
                restrictedAccess: {
                    type: 'event',
                    permitRequired: false,
                    accessLevel: 'prohibited',
                    enforcement: 'high',
                    perimeterMarked: true,
                    patrolled: true,
                    scheduleInfo: `${eventStart.toLocaleDateString()} 9:00 Uhr bis ${eventEnd.toLocaleDateString()} 18:00 Uhr`,
                    contactInfo: 'Veranstalter: +49 123 456789'
                },
                droneRestriction: {
                    droneFlyingAllowed: false,
                    restrictionType: 'temporary',
                    restrictionReason: 'event',
                    permitPossible: true,
                    permitInfo: 'Presseausweise bei Veranstalter für Drohnenflug beantragen',
                    specialConditions: 'Nur akkreditierte Medien mit Ausnahmegenehmigung'
                },
                lastVerified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        }
    ];
}