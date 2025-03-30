// src/lib/utils/api/wildlifeWarningsApi.ts

import type { POI } from '$lib/types/POITypes';

/**
 * Abrufen von Wildtier-Warnungen aus verschiedenen Quellen
 * - Community-Berichte
 * - Offizielle Warnungen von Behörden
 * - Saisonale Warnungen (z.B. Wildschwein-Paarungszeit)
 */
export async function fetchWildlifeWarnings(
    bounds: [number, number, number, number],
    options: { activeOnly?: boolean } = {}
): Promise<POI[]> {
    try {
        // Verschiedene Datenquellen abfragen (parallel)
        const [communityReports, officialReports, seasonalWarnings] = await Promise.all([
            fetchCommunityWildlifeReports(bounds),
            fetchOfficialWildlifeReports(bounds),
            getSeasonalWildlifeWarnings(bounds)
        ]);
        
        // Alle Warnungen zusammenführen
        let allWarnings = [...communityReports, ...officialReports, ...seasonalWarnings];
        
        // Optional nach aktiven Warnungen filtern
        if (options.activeOnly) {
            allWarnings = allWarnings.filter(
                warning => warning.properties.safetyWarning && warning.properties.safetyWarning.active
            );
        }
        
        return allWarnings;
        
    } catch (error) {
        console.error('Fehler beim Abrufen von Wildtier-Warnungen:', error);
        return [];
    }
}

/**
 * Abrufen von Community-Berichten zu Wildtieren
 */
async function fetchCommunityWildlifeReports(bounds: [number, number, number, number]): Promise<POI[]> {
    // In einer vollständigen Implementierung würde hier ein API-Aufruf erfolgen
    // Für Demo-Zwecke verwenden wir Beispieldaten
    
    // Simulierte Anfrage-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Beispiel-Bericht basierend auf den Bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    
    // Zufällige Position innerhalb der Bounds
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Demo-Warnungen erstellen
    return [
        {
            id: `wildlife-community-1-${bounds[0]}-${bounds[1]}`,
            name: 'Wildschwein-Sichtung',
            description: 'Mehrere Wildschweine mit Frischlingen in der Nähe des Wanderwegs gesichtet. Bitte Abstand halten und Hunde anleinen.',
            category: 'warning',
            subcategory: 'wildlife',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 320,
            source: 'community',
            icon: 'wildlife',
            properties: {
                safetyWarning: {
                    type: 'wildlife',
                    severity: 'moderate',
                    animalSpecies: 'Wildschwein (Sus scrofa)',
                    description: 'Wildschwein-Familie mit Frischlingen. Weibchen können aggressiv sein, wenn sie Junge beschützen.',
                    seasonality: {
                        from: 3, // März
                        to: 7  // Juli
                    },
                    active: true,
                    reportDate: new Date().toISOString(),
                    reportedBy: 'Max Müller',
                    mitigation: 'Bei Sichtung nicht nähern, Abstand halten, Hunde anleinen, ruhig weitergehen.'
                },
                lastVerified: new Date().toISOString()
            }
        }
    ];
}

/**
 * Abrufen offizieller Wildtier-Warnungen von Behörden
 */
async function fetchOfficialWildlifeReports(bounds: [number, number, number, number]): Promise<POI[]> {
    // In einer vollständigen Implementierung würde hier ein API-Aufruf erfolgen
    // Für Demo-Zwecke verwenden wir Beispieldaten
    
    // Simulierte Anfrage-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Prüfen, ob überhaupt Warnungen im Bereich existieren
    const hasWarningsInArea = Math.random() > 0.7;
    
    if (!hasWarningsInArea) {
        return [];
    }
    
    // Zufällige Position innerhalb der Bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Demo-Warnungen erstellen
    return [
        {
            id: `wildlife-official-1-${bounds[0]}-${bounds[1]}`,
            name: 'Wolfsterritorium',
            description: 'Bestätigtes Wolfsrevier. Wolfsrudel mit Jungtieren in diesem Gebiet nachgewiesen.',
            category: 'warning',
            subcategory: 'wildlife',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 520,
            source: 'official',
            icon: 'wolf',
            properties: {
                safetyWarning: {
                    type: 'wildlife',
                    severity: 'moderate',
                    animalSpecies: 'Wolf (Canis lupus)',
                    description: 'Bestätigtes Wolfsrevier mit Nachwuchs. Wölfe meiden in der Regel Menschen, können aber bei Bedrohung ihrer Jungen gefährlich werden.',
                    active: true,
                    reportDate: new Date().toISOString(),
                    reportedBy: 'Forstamt',
                    mitigation: 'Abstand halten, nicht füttern, bei Sichtung ruhig bleiben und langsam zurückziehen. Hunde unbedingt anleinen.'
                },
                lastVerified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        }
    ];
}

/**
 * Generiert saisonale Warnungen basierend auf aktuellem Monat und Region
 */
async function getSeasonalWildlifeWarnings(bounds: [number, number, number, number]): Promise<POI[]> {
    // Aktuellen Monat ermitteln
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    // Prüfen, ob es saisonale Warnungen für den aktuellen Monat gibt
    const seasonalWarnings: POI[] = [];
    
    // Zufällige Position innerhalb der Bounds
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const randomLat = minLat + Math.random() * (maxLat - minLat);
    const randomLon = minLon + Math.random() * (maxLon - minLon);
    
    // Beispiel: Wildschwein-Paarungszeit (November-Januar)
    if (currentMonth >= 11 || currentMonth <= 1) {
        seasonalWarnings.push({
            id: `wildlife-seasonal-boar-${bounds[0]}-${bounds[1]}`,
            name: 'Wildschwein-Alarm',
            description: 'Paarungszeit der Wildschweine. Männliche Tiere können aggressiv sein.',
            category: 'warning',
            subcategory: 'wildlife',
            latitude: randomLat,
            longitude: randomLon,
            elevation: 380,
            source: 'seasonal',
            icon: 'wildboar',
            properties: {
                safetyWarning: {
                    type: 'wildlife',
                    severity: 'high',
                    animalSpecies: 'Wildschwein (Sus scrofa)',
                    description: 'Rauschzeit der Wildschweine. Männliche Tiere (Keiler) sind besonders territorial und können aggressiv reagieren.',
                    seasonality: {
                        from: 11, // November
                        to: 1     // Januar
                    },
                    active: true,
                    reportDate: new Date().toISOString(),
                    reportedBy: 'Saisonale Warnung',
                    mitigation: 'Besondere Vorsicht auf Waldwegen. Bei Verdacht auf Wildschweine laute Geräusche machen. Keiler nie in die Enge treiben.'
                },
                lastVerified: new Date().toISOString()
            }
        });
    }
    
    // Beispiel: Zecken-Hochsaison (Mai-September)
    if (currentMonth >= 5 && currentMonth <= 9) {
        seasonalWarnings.push({
            id: `wildlife-seasonal-ticks-${bounds[0]}-${bounds[1]}`,
            name: 'Zeckenwarnung',
            description: 'Erhöhtes Zeckenaufkommen in diesem Gebiet. FSME- und Borreliose-Risiko.',
            category: 'warning',
            subcategory: 'wildlife',
            latitude: randomLat + 0.02,
            longitude: randomLon - 0.01,
            elevation: 280,
            source: 'seasonal',
            icon: 'tick',
            properties: {
                safetyWarning: {
                    type: 'wildlife',
                    severity: 'moderate',
                    animalSpecies: 'Zecken (Ixodida)',
                    description: 'Erhöhtes Zeckenaufkommen aufgrund optimaler Witterungsbedingungen. Risiko für FSME und Borreliose.',
                    seasonality: {
                        from: 5, // Mai
                        to: 9    // September
                    },
                    active: true,
                    reportDate: new Date().toISOString(),
                    reportedBy: 'Gesundheitsamt',
                    mitigation: 'Lange Kleidung tragen, Insektenschutzmittel verwenden, nach Wanderung Körper auf Zecken untersuchen.'
                },
                lastVerified: new Date().toISOString()
            }
        });
    }
    
    // Beispiel: Hirschbrunft (September-Oktober)
    if (currentMonth >= 9 && currentMonth <= 10) {
        seasonalWarnings.push({
            id: `wildlife-seasonal-deer-${bounds[0]}-${bounds[1]}`,
            name: 'Hirschbrunft',
            description: 'Paarungszeit der Rothirsche. Männliche Tiere kämpfen um Weibchen und können Wanderwege überqueren.',
            category: 'warning',
            subcategory: 'wildlife',
            latitude: randomLat - 0.01,
            longitude: randomLon + 0.02,
            elevation: 600,
            source: 'seasonal',
            icon: 'deer',
            properties: {
                safetyWarning: {
                    type: 'wildlife',
                    severity: 'low',
                    animalSpecies: 'Rothirsch (Cervus elaphus)',
                    description: 'Brunftzeit der Rothirsche. Männchen sind territorial und können Wege kreuzen.',
                    seasonality: {
                        from: 9,  // September
                        to: 10    // Oktober
                    },
                    active: true,
                    reportDate: new Date().toISOString(),
                    reportedBy: 'Forstamt',
                    mitigation: 'Ausgewiesene Wege nicht verlassen, bei Sichtung Abstand halten und nicht stören.'
                },
                lastVerified: new Date().toISOString()
            }
        });
    }
    
    return seasonalWarnings;
}