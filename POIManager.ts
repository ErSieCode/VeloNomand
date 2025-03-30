// src/lib/utils/POIManager.ts
import { writable, derived } from 'svelte/store';
import { fetchNominatimPOIs } from './api/nominatimApi';
import { fetchOSMPOIs } from './api/osmApi';
import { fetchMundraubPOIs } from './api/mundraubApi';
import { fetchFoodsharingPOIs } from './api/foodsharingApi';
import { fetchCommunityPOIs } from './api/communityApi';
import { fetchLocalEvents } from './api/eventsApi';
import { getWaterSources } from './api/waterSourcesApi';
import { fetchWildlifeWarnings } from './api/wildlifeWarningsApi';
import { fetchWeatherWarnings } from './api/weatherWarningsApi';
import { fetchCampingSpots } from './api/campingSpotsApi';
import { fetchNaturalHazards } from './api/naturalHazardsApi';
import { fetchAlternativeCommunities } from './api/alternativeCommunitiesApi';
import { fetchCouchsurfingSpots } from './api/couchsurfingApi';
import { fetchFoodbanks } from './api/foodbanksApi';
import { fetchBikeServices } from './api/bikeServicesApi';
import { fetchMedicalServices } from './api/medicalServicesApi';
import { fetchSpiritualPlaces } from './api/spiritualPlacesApi';
import { fetchAdventureSpots } from './api/adventureSpotsApi';
import { fetchForageableItems } from './api/forageApi';
import { fetchCrisisResources } from './api/crisisResourcesApi';
import { fetchLocalFestivals } from './api/localFestivalsApi';
import { currentLocation } from '$lib/state/locationState';
import type { POI } from '$lib/types/POITypes';

// POI-Kategorien mit Subkategorien
export const POI_CATEGORIES = {
  SURVIVAL: {
    id: 'survival',
    name: 'Survival & Ressourcen',
    icon: 'survival',
    subcategories: [
      { id: 'water', name: 'Trinkwasser', icon: 'water-drop' },
      { id: 'shelter', name: 'Unterkunft & Schutz', icon: 'shelter' },
      { id: 'wildcamp', name: 'Wild-Camping Spots', icon: 'tent' },
      { id: 'cave', name: 'Höhlen', icon: 'cave' },
      { id: 'fireplace', name: 'Feuerstellen', icon: 'fire' },
      { id: 'stream', name: 'Bäche & Flüsse', icon: 'stream' },
      { id: 'spring', name: 'Quellen', icon: 'spring' },
      { id: 'naturalShelter', name: 'Natürliche Unterstände', icon: 'natural-shelter' },
      { id: 'viewPoint', name: 'Aussichtspunkte', icon: 'binoculars' },
      { id: 'firewood', name: 'Brennholz', icon: 'wood' }
    ]
  },
  FOOD: {
    id: 'food',
    name: 'Nahrung & Verpflegung',
    icon: 'food',
    subcategories: [
      { id: 'mundraub', name: 'Mundraub / Wildobst', icon: 'apple' },
      { id: 'foodsharing', name: 'Foodsharing', icon: 'share-food' },
      { id: 'ediblePlants', name: 'Essbare Pflanzen', icon: 'herb' },
      { id: 'market', name: 'Lokale Märkte', icon: 'market' },
      { id: 'hunting', name: 'Jagd- & Angelgebiete', icon: 'fishing' },
      { id: 'berries', name: 'Beerensammelstellen', icon: 'berries' },
      { id: 'mushrooms', name: 'Pilzsammelstellen', icon: 'mushroom' },
      { id: 'wildGarlic', name: 'Bärlauch', icon: 'wild-garlic' },
      { id: 'nuts', name: 'Nüsse', icon: 'nuts' },
      { id: 'herbs', name: 'Wildkräuter', icon: 'herbs' },
      { id: 'foodbank', name: 'Tafel & Foodbanks', icon: 'foodbank' }
    ]
  },
  COMMUNITY: {
    id: 'community',
    name: 'Gemeinschaft & Unterstützung',
    icon: 'community',
    subcategories: [
      { id: 'alternativen', name: 'Alternative Gemeinschaften', icon: 'community' },
      { id: 'couchsurfing', name: 'Couchsurfing', icon: 'couch' },
      { id: 'hostel', name: 'Hostels & Herbergen', icon: 'hostel' },
      { id: 'sharing', name: 'Sharing-Angebote', icon: 'sharing' },
      { id: 'volunteering', name: 'Freiwilligen-Arbeit', icon: 'volunteer' },
      { id: 'communes', name: 'Kommunen', icon: 'commune' },
      { id: 'ecovillage', name: 'Ökodörfer', icon: 'eco-village' },
      { id: 'permaculture', name: 'Permakultur-Projekte', icon: 'permaculture' },
      { id: 'skillshare', name: 'Skill-Sharing', icon: 'skills' },
      { id: 'library', name: 'Öffentliche Bibliotheken', icon: 'book' }
    ]
  },
  WELLNESS: {
    id: 'wellness',
    name: 'Wohlbefinden & Gesundheit',
    icon: 'health',
    subcategories: [
      { id: 'yoga', name: 'Yoga & Meditation', icon: 'yoga' },
      { id: 'thermal', name: 'Thermalbäder & Quellen', icon: 'hot-spring' },
      { id: 'medical', name: 'Medizinische Versorgung', icon: 'medical' },
      { id: 'pharmacy', name: 'Apotheken', icon: 'pharmacy' },
      { id: 'herbs', name: 'Heilkräuter-Gebiete', icon: 'herbs' },
      { id: 'massage', name: 'Massage & Körperarbeit', icon: 'massage' },
      { id: 'sauna', name: 'Saunen & Schwitzhütten', icon: 'sauna' },
      { id: 'natureBathing', name: 'Waldbaden', icon: 'forest-bath' },
      { id: 'alternativeMedicine', name: 'Alternative Medizin', icon: 'alt-medicine' },
      { id: 'mentalHealth', name: 'Seelische Gesundheit', icon: 'mental-health' }
    ]
  },
  ADVENTURE: {
    id: 'adventure',
    name: 'Abenteuer & Aktivitäten',
    icon: 'adventure',
    subcategories: [
      { id: 'climbing', name: 'Klettergebiete', icon: 'climbing' },
      { id: 'viewpoint', name: 'Aussichtspunkte', icon: 'viewpoint' },
      { id: 'hiking', name: 'Besondere Wanderwege', icon: 'hiking' },
      { id: 'waterSport', name: 'Wassersport', icon: 'water-sport' },
      { id: 'natural', name: 'Naturphänomene', icon: 'natural' },
      { id: 'caving', name: 'Höhlenforschung', icon: 'caving' },
      { id: 'rockForming', name: 'Felsformationen', icon: 'rock' },
      { id: 'waterfall', name: 'Wasserfälle', icon: 'waterfall' },
      { id: 'wildlife', name: 'Wildtierbeobachtung', icon: 'wildlife-watching' },
      { id: 'stargazing', name: 'Sternenbeobachtung', icon: 'stars' }
    ]
  },
  PRACTICAL: {
    id: 'practical',
    name: 'Praktische Dienste',
    icon: 'services',
    subcategories: [
      { id: 'bikeService', name: 'Fahrrad-Service', icon: 'bike-repair' },
      { id: 'wifi', name: 'WiFi-Hotspots', icon: 'wifi' },
      { id: 'charging', name: 'Ladestationen', icon: 'charging' },
      { id: 'toilet', name: 'Öffentliche Toiletten', icon: 'toilet' },
      { id: 'shower', name: 'Duschen', icon: 'shower' },
      { id: 'laundry', name: 'Wäscherei', icon: 'laundry' },
      { id: 'repair', name: 'Reparatur-Cafés', icon: 'repair' },
      { id: 'tool', name: 'Werkzeugverleih', icon: 'tools' },
      { id: 'firstAid', name: 'Erste-Hilfe-Stationen', icon: 'first-aid' },
      { id: 'shelter', name: 'Notunterkünfte', icon: 'emergency-shelter' }
    ]
  },
  CULTURE: {
    id: 'culture',
    name: 'Kultur & Ereignisse',
    icon: 'culture',
    subcategories: [
      { id: 'festival', name: 'Festivals & Feste', icon: 'festival' },
      { id: 'historical', name: 'Historische Stätten', icon: 'historical' },
      { id: 'spiritual', name: 'Spirituelle Orte', icon: 'spiritual' },
      { id: 'seasonal', name: 'Saisonale Ereignisse', icon: 'seasonal' },
      { id: 'localCulture', name: 'Lokale Besonderheiten', icon: 'local-culture' },
      { id: 'music', name: 'Musikveranstaltungen', icon: 'music' },
      { id: 'art', name: 'Kunst & Kreativität', icon: 'art' },
      { id: 'indigenous', name: 'Traditionelles Wissen', icon: 'indigenous' },
      { id: 'ritual', name: 'Rituelle Orte', icon: 'ritual' },
      { id: 'storytelling', name: 'Geschichtenerzählen', icon: 'storytelling' }
    ]
  },
  WARNING: {
    id: 'warning',
    name: 'Warnungen & Hinweise',
    icon: 'warning',
    subcategories: [
      { id: 'wildlife', name: 'Wildtiere', icon: 'wildlife' },
      { id: 'weather', name: 'Wettergefahren', icon: 'weather-warning' },
      { id: 'terrain', name: 'Gefährliches Gelände', icon: 'terrain-warning' },
      { id: 'restricted', name: 'Verbotene Zonen', icon: 'no-entry' },
      { id: 'pollution', name: 'Schadstoffbelastung', icon: 'pollution' },
      { id: 'wildfire', name: 'Waldbrandrisiko', icon: 'wildfire' },
      { id: 'avalanche', name: 'Lawinengefahr', icon: 'avalanche' },
      { id: 'tick', name: 'Zeckengebiete', icon: 'tick' },
      { id: 'poisonPlants', name: 'Giftige Pflanzen', icon: 'poison' },
      { id: 'flood', name: 'Hochwasserrisiko', icon: 'flood' }
    ]
  },
  SEASONAL: {
    id: 'seasonal',
    name: 'Saisonale Ressourcen',
    icon: 'calendar',
    subcategories: [
      { id: 'spring', name: 'Frühlings-Ressourcen', icon: 'spring-season' },
      { id: 'summer', name: 'Sommer-Ressourcen', icon: 'summer' },
      { id: 'autumn', name: 'Herbst-Ressourcen', icon: 'autumn' },
      { id: 'winter', name: 'Winter-Ressourcen', icon: 'winter' },
      { id: 'migratingAnimals', name: 'Tiermigrationen', icon: 'migration' },
      { id: 'seasonalPlants', name: 'Saisonale Pflanzen', icon: 'seasonal-plants' },
      { id: 'harvestEvents', name: 'Erntefeste', icon: 'harvest' },
      { id: 'naturalCycles', name: 'Naturzyklen', icon: 'cycle' },
      { id: 'conservation', name: 'Schutzzonen', icon: 'protected' },
      { id: 'seasonalWater', name: 'Saisonale Gewässer', icon: 'seasonal-water' }
    ]
  }
};

// Aktivierte Kategorien und Subkategorien
export const enabledCategories = writable(Object.values(POI_CATEGORIES).map(cat => cat.id));
export const enabledSubcategories = writable(
  Object.values(POI_CATEGORIES).flatMap(cat => 
    cat.subcategories.map(sub => sub.id)
  )
);

// POI-Store mit allen geladenen POIs
export const allPOIs = writable<POI[]>([]);

// Gefilterte POIs basierend auf aktivierten Kategorien
export const filteredPOIs = derived(
  [allPOIs, enabledCategories, enabledSubcategories],
  ([$allPOIs, $enabledCategories, $enabledSubcategories]) => {
    return $allPOIs.filter(poi => {
      // Prüfen, ob die Hauptkategorie aktiviert ist
      const categoryEnabled = $enabledCategories.includes(poi.category);
      // Prüfen, ob die Subkategorie aktiviert ist
      const subcategoryEnabled = $enabledSubcategories.includes(poi.subcategory);
      return categoryEnabled && subcategoryEnabled;
    });
  }
);

// POIs in der Nähe des aktuellen Standorts
export const nearbyPOIs = derived(
  [filteredPOIs, currentLocation],
  ([$filteredPOIs, $currentLocation]) => {
    if (!$currentLocation) return [];
    
    // POIs innerhalb des Radius filtern und nach Entfernung sortieren
    return $filteredPOIs
      .map(poi => ({
        ...poi,
        distance: calculateDistance(
          $currentLocation.latitude, 
          $currentLocation.longitude,
          poi.latitude, 
          poi.longitude
        )
      }))
      .filter(poi => poi.distance <= 10000) // 10km Radius
      .sort((a, b) => a.distance - b.distance);
  }
);

// POIs mit Warnungen/Alarmen
export const warningPOIs = derived(
  filteredPOIs,
  ($filteredPOIs) => {
    return $filteredPOIs.filter(poi => 
      poi.category === 'warning' || 
      (poi.properties.safetyWarning && poi.properties.safetyWarning.active)
    );
  }
);

// Laden der POIs für einen bestimmten Bereich
export async function loadPOIsForBounds(bounds, categories = null) {
  const activeCats = categories || Object.values(enabledCategories);
  const requests = [];
  
  // Basisdaten von OSM laden
  requests.push(fetchOSMPOIs(bounds, activeCats));
  
  // Spezielle APIs basierend auf aktivierten Kategorien abfragen
  
  // Survival & Ressourcen
  if (activeCats.includes('survival.water')) {
    requests.push(getWaterSources(bounds));
  }
  
  if (activeCats.includes('survival.wildcamp')) {
    requests.push(fetchCampingSpots(bounds));
  }
  
  if (activeCats.includes('survival.cave')) {
    requests.push(fetchOSMPOIs(bounds, ['natural.cave_entrance']));
  }
  
  // Nahrung & Verpflegung
  if (activeCats.includes('food.mundraub')) {
    requests.push(fetchMundraubPOIs(bounds));
  }
  
  if (activeCats.includes('food.foodsharing')) {
    requests.push(fetchFoodsharingPOIs(bounds));
  }
  
  if (activeCats.includes('food.ediblePlants') || 
      activeCats.includes('food.berries') || 
      activeCats.includes('food.herbs') || 
      activeCats.includes('food.mushrooms')) {
    requests.push(fetchForageableItems(bounds));
  }
  
  if (activeCats.includes('food.foodbank')) {
    requests.push(fetchFoodbanks(bounds));
  }
  
  // Gemeinschaft & Unterstützung
  if (activeCats.some(cat => cat.startsWith('community'))) {
    requests.push(fetchCommunityPOIs(bounds));
  }
  
  if (activeCats.includes('community.alternativen') || 
      activeCats.includes('community.communes') || 
      activeCats.includes('community.ecovillage')) {
    requests.push(fetchAlternativeCommunities(bounds));
  }
  
  if (activeCats.includes('community.couchsurfing')) {
    requests.push(fetchCouchsurfingSpots(bounds));
  }
  
  // Wohlbefinden & Gesundheit
  if (activeCats.includes('wellness.medical') || activeCats.includes('wellness.pharmacy')) {
    requests.push(fetchMedicalServices(bounds));
  }
  
  if (activeCats.includes('wellness.spiritual') || activeCats.includes('wellness.yoga')) {
    requests.push(fetchSpiritualPlaces(bounds));
  }
  
  // Abenteuer & Aktivitäten
  if (activeCats.some(cat => cat.startsWith('adventure'))) {
    requests.push(fetchAdventureSpots(bounds));
  }
  
  // Kultur & Ereignisse
  if (activeCats.includes('culture.festival') || activeCats.includes('culture.seasonal')) {
    requests.push(fetchLocalEvents(bounds));
    requests.push(fetchLocalFestivals(bounds));
  }
  
  if (activeCats.includes('culture.spiritual')) {
    requests.push(fetchSpiritualPlaces(bounds));
  }
  
  // Warnungen & Hinweise
  if (activeCats.includes('warning.wildlife')) {
    requests.push(fetchWildlifeWarnings(bounds));
  }
  
  if (activeCats.includes('warning.weather') || activeCats.includes('warning.flood')) {
    requests.push(fetchWeatherWarnings(bounds));
  }
  
  if (activeCats.some(cat => cat.startsWith('warning'))) {
    requests.push(fetchNaturalHazards(bounds));
  }
  
  // Praktische Dienste
  if (activeCats.includes('practical.bikeService')) {
    requests.push(fetchBikeServices(bounds));
  }
  
  // Notfallressourcen
  requests.push(fetchCrisisResources(bounds));
  
  // Alle Anfragen parallel ausführen
  const results = await Promise.all(requests);
  
  // Ergebnisse zusammenführen und Duplikate entfernen
  const mergedPOIs = mergeAndDeduplicate(results.flat());
  
  // POIs im Store aktualisieren
  allPOIs.set(mergedPOIs);
  
  return mergedPOIs;
}

// Lädt POIs, die zur aktuellen Jahreszeit passen
export async function loadSeasonalPOIs(bounds) {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  // Bestimme die aktuelle Jahreszeit
  let season;
  if (currentMonth >= 3 && currentMonth <= 5) season = 'spring';
  else if (currentMonth >= 6 && currentMonth <= 8) season = 'summer';
  else if (currentMonth >= 9 && currentMonth <= 11) season = 'autumn';
  else season = 'winter';
  
  // Lade saisonspezifische POIs
  const seasonalRequests = [];
  
  // Allgemeine saisonale Ressourcen
  seasonalRequests.push(fetchOSMPOIs(bounds, [`seasonal.${season}`]));
  
  // Spezielle saisonale APIs
  if (season === 'spring') {
    seasonalRequests.push(fetchForageableItems(bounds, { season: 'spring' }));
  } else if (season === 'summer') {
    seasonalRequests.push(fetchForageableItems(bounds, { season: 'summer' }));
    seasonalRequests.push(fetchLocalFestivals(bounds, { season: 'summer' }));
  } else if (season === 'autumn') {
    seasonalRequests.push(fetchForageableItems(bounds, { season: 'autumn' }));
    seasonalRequests.push(fetchLocalFestivals(bounds, { season: 'autumn' }));
  } else if (season === 'winter') {
    seasonalRequests.push(fetchForageableItems(bounds, { season: 'winter' }));
    seasonalRequests.push(fetchLocalFestivals(bounds, { season: 'winter' }));
  }
  
  // Führe alle saisonalen Anfragen aus
  const seasonalResults = await Promise.all(seasonalRequests);
  return seasonalResults.flat();
}

// Lädt Warnmeldungen, die für den aktuellen Bereich relevant sind
export async function loadActiveWarnings(bounds) {
  const warningRequests = [
    fetchWildlifeWarnings(bounds, { activeOnly: true }),
    fetchWeatherWarnings(bounds, { activeOnly: true }),
    fetchNaturalHazards(bounds, { activeOnly: true })
  ];
  
  const warningResults = await Promise.all(warningRequests);
  return warningResults.flat();
}

function mergeAndDeduplicate(pois) {
  // POIs nach ID gruppieren und zusammenführen
  const poiMap = new Map();
  
  pois.forEach(poi => {
    const existingPoi = poiMap.get(poi.id);
    if (existingPoi) {
      // Daten aus verschiedenen Quellen zusammenführen
      poiMap.set(poi.id, { ...existingPoi, ...poi });
    } else {
      poiMap.set(poi.id, poi);
    }
  });
  
  return Array.from(poiMap.values());
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine-Formel zur Berechnung der Entfernung zwischen zwei Koordinaten
  const R = 6371000; // Erdradius in Metern
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in Metern
}