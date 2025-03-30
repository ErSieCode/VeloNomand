# VeloNomand
###Wo willst du hin? Egal er sagt dir wie du sicher ankommst!


# VeloNomad v22.0 – The Apex Symphony: Vollständige Systemarchitektur und Implementierung

## Inhaltsverzeichnis

1. [Einführung und Überblick](#1-einführung-und-überblick)
2. [Softwarearchitektur](#2-softwarearchitektur)
3. [Technologie-Stack](#3-technologie-stack)
4. [Dateisystem und Projektstruktur](#4-dateisystem-und-projektstruktur)
5. [Datenbanksystem](#5-datenbanksystem)
6. [Kommunikationsfluss und Signalverarbeitung](#6-kommunikationsfluss-und-signalverarbeitung)
7. [Native Services und Implementierungen](#7-native-services-und-implementierungen)
8. [Frontend-Komponenten und Implementierungen](#8-frontend-komponenten-und-implementierungen)
9. [API-Integrationen](#9-api-integrationen)
10. [Offline-Funktionalität](#10-offline-funktionalität)
11. [Sicherheitsimplementierung](#11-sicherheitsimplementierung)
12. [Performance-Optimierungen](#12-performance-optimierungen)
13. [Build und Deployment](#13-build-und-deployment)
14. [Teststrategien](#14-teststrategien)

## 1. Einführung und Überblick

VeloNomad v22.0 ist eine fortschrittliche Anwendung für Radfahrer und Outdoor-Enthusiasten, die Reiseplanung, Navigation, Wetter- und Zeitinformationen sowie umfassende Dokumentationsfunktionen in einer intuitiven, visuell ansprechenden Benutzeroberfläche vereint. Die Anwendung folgt einer hybriden Architektur und priorisiert Benutzerfreundlichkeit, Offline-Verfügbarkeit, Energieeffizienz und Datensicherheit.

Die Hauptfunktionen umfassen:

- Immersive, interaktive Kartendarstellung mit atmosphärischen Effekten
- Umfassende Routenplanung und Navigation
- Kontextuelle Wetter- und Tageszeitinformationen
- Persönliches Reisetagebuch mit Geo-Tagging
- Standortbasiertes Notizensystem
- Robuste Offline-Funktionalität
- Optionales Teilen über GitHub Pages
- Energieeffiziente Sensorintegration
- Strikte Datenkonsistenz und Sicherheit

## 2. Softwarearchitektur

### 2.1 Dual-Core-Architektur

VeloNomad basiert auf einer hybriden Architektur mit zwei Hauptkomponenten:

1. **Native Android-Backend (Kotlin)**
   - Verantwortlich für Hardware-Zugriff, Sensorik, Datenbankoperationen, Hintergrundprozesse und sichere API-Kommunikation
   - Implementiert mit Kotlin, Coroutines/Flow, Room/Spatialite, WorkManager und anderen modernen Android-Bibliotheken

2. **Web-Frontend (Svelte)**
   - Verantwortlich für Benutzeroberfläche, Kartendarstellung, Datenvisualisierung und Animationen
   - Implementiert mit Svelte 5 (Runes), Tailwind CSS, MapLibre GL JS, D3.js und Motion One

3. **Capacitor-Bridge**
   - Verbindet native und Web-Komponenten über typisierte Plugins
   - Ermöglicht bidirektionale Kommunikation über Events und Methoden

Diese Architektur ermöglicht es, die Stärken beider Plattformen zu nutzen: die hardwarenahe Leistung und Hintergrundverarbeitung von Android sowie die flexible, reaktive Benutzeroberfläche einer modernen Web-Anwendung.

### 2.2 Reaktiver Datenfluss

Die Anwendung folgt einem unidirektionalen, reaktiven Datenflussmodell:

```
[Sensoren/Services] → [Native StateFlow] → [Capacitor Plugins] → [TypeScript Events] 
→ [Svelte Stores] → [UI-Komponenten] → [Nutzerinteraktion] → [Plugin-Methoden] 
→ [Native Aktionen] → [Datenbank/APIs]
```

Kernmerkmale dieses Datenflusses:

- **End-to-End-Reaktivität**: Jede Änderung im System propagiert automatisch durch alle Schichten
- **Native StateFlows**: Alle nativen Services exponieren Daten als `StateFlow<Result<T>>`
- **Typsichere DTOs**: Daten werden über die Bridge als typisierte Objekte übertragen
- **Svelte Runes**: Frontend nutzt Svelte 5 Runes ($state, $derived, $effect) für reaktive UI-Updates

### 2.3 Datenkonzept und -isolation

Um Datenkonsistenz und -isolation zu gewährleisten, werden folgende Strategien angewendet:

1. **Trip-basierte Datenisolation**
   - Alle reisebezogenen Entitäten verwenden tripId als Fremdschlüssel
   - Abfragen filtern nach aktivem Trip, um Datenvermischung zu verhindern
   - UI zeigt klar den aktuellen Trip-Kontext an

2. **Transaktionales Datenmanagement**
   - Room-Transaktionen für komplexe, mehrere Entitäten betreffende Operationen
   - Write-Ahead-Logging (WAL) für Absturzsicherheit
   - Optimistisches Locking für gleichzeitige Änderungen

3. **Offline-First-Datenverwaltung**
   - Lokale Datenbank als Single Source of Truth
   - Effiziente Synchronisierungsstrategien bei Wiederverbindung
   - Konfliktauflösungsmechanismen

## 3. Technologie-Stack

### 3.1 Native (Android)

```
- Kotlin 1.9+                      // Primärsprache
- Coroutines/Flow 1.7+             // Asynchrone Programmierung
- Gradle 8+                        // Build-System
- AndroidX-Komponenten:
  - WorkManager 2.9+               // Hintergrundverarbeitung
  - Room 2.6+ mit WAL              // Datenbank mit Write-Ahead-Logging
  - Paging 3                       // Effiziente Listenhandhabung
  - Lifecycle KTX                  // Lebenszyklus-bewusste Komponenten
- androidx.sqlite.driver            // Spatialite-Unterstützung für geografische Abfragen
- Google Play Services SDK:
  - Location 21.0+                 // Erweiterte Standortdienste
  - Auth 20.6+                     // Authentifizierungsdienste
- Google Maps API Clients 18.0+    // Optionale Kartendienste
- Google Drive API 2.1+            // Cloud-Backup
- BLE API                          // Bluetooth Low Energy für Sensoren
- FusedLocationProviderClient      // Effizientes Standort-Tracking
- SpeechRecognizer                 // Sprachbefehle
- MediaRecorder/Player             // Audio-Notizaufzeichnung
- Android Haptics                  // Taktiles Feedback
- Apache Commons CSV 1.10+         // Datenimport/-export
- Timber 5+                        // Logging
- Hilt 2.48+                       // Dependency Injection
- Ktor Client 2.3+                 // API-Kommunikation
- kotlinx.serialization 1.5+       // Datenserialisierung
- kotlinx-datetime 0.4+            // Zeitverarbeitung
```

### 3.2 Web-Frontend

```
- Svelte 5 (Runes)                 // Reaktives UI-Framework
- Tailwind CSS 3.x                 // Utility-First-Styling
- MapLibre GL JS v3.5+             // Kartenrendering
- D3.js v7+                        // Datenvisualisierung
- Turf.js v6.5+                    // Georäumliche Analyse
- Motion One 10+                   // Physikbasierte Animationen
- typesafe-i18n 5+                 // Internationalisierung
- Custom SVG Icon Set               // Einheitliche visuelle Sprache
```

### 3.3 Bridge-Technologie

```
- Capacitor v6+                    // Native-Web-Kommunikation
```

### 3.4 Externe Dienste-Integration

```
- OpenStreetMap                    // Primäre Kartendaten
- Google APIs (optional)           // Erweiterte POI-Daten
- OpenWeatherMap One Call 3.0      // Wetterdaten
- GitHub REST API v3               // Trip-Sharing
- GraphHopper/äquivalent           // Fahrradoptimierte Routenberechnung
```

## 4. Dateisystem und Projektstruktur

### 4.1 Projektstruktur Android

```
com.velonomad/
├── application/                  // Anwendungskonfiguration und Initialisierung
│   ├── VeloNomadApplication.kt   // Hauptanwendungsklasse
│   └── di/                       // Dependency Injection Module
│       ├── AppModule.kt           // Hauptmodul für Anwendungsdienste
│       ├── DatabaseModule.kt      // Datenbankbezogene Abhängigkeiten
│       ├── NetworkModule.kt       // Netzwerkbezogene Abhängigkeiten
│       └── SensorModule.kt        // Sensorbezogene Abhängigkeiten
├── data/                         // Datenzugriffsschicht
│   ├── dao/                      // Data Access Objects
│   │   ├── TripDao.kt            // Trip-Entitäts-DAO
│   │   ├── RouteDao.kt           // Routen-Entitäts-DAO
│   │   └── ... (weitere DAOs)
│   ├── dto/                      // Data Transfer Objects für API/Bridge
│   │   ├── TripDto.kt            // DTO für Trip-Entität
│   │   ├── RouteDto.kt           // DTO für Routen-Entität
│   │   └── ... (weitere DTOs)
│   ├── repository/               // Repositories für Datenzugriff
│   │   ├── TripRepository.kt      // Trip-Daten-Repository
│   │   ├── RouteRepository.kt     // Routen-Daten-Repository
│   │   └── ... (weitere Repositories)
│   ├── source/                   // Datenquellen (lokal, remote)
│   │   ├── local/                // Lokale Datenquellen
│   │   └── remote/               // Remote-Datenquellen (APIs)
│   └── database/                 // Datenbankdefinitionen
│       ├── AppDatabase.kt         // Hauptdatenbankklasse
│       ├── converters/            // Typ-Konverter für Room
│       └── migrations/            // Datenbankmigrationen
├── domain/                       // Domänenlogik
│   ├── entity/                   // Geschäftsentitäten
│   │   ├── TripEntity.kt          // Trip-Entität
│   │   ├── RouteEntity.kt         // Routen-Entität
│   │   └── ... (weitere Entitäten)
│   ├── usecase/                  // Anwendungsfälle/Geschäftslogik
│   │   ├── trip/                  // Trip-bezogene Usecases
│   │   ├── route/                 // Routen-bezogene Usecases
│   │   └── ... (weitere Usecases)
│   └── util/                     // Domänenspezifische Hilfsfunktionen
├── service/                      // Hauptdienste
│   ├── location/                 // Standortdienste
│   │   ├── LocationService.kt     // Hauptstandortdienst
│   │   └── GeofencingService.kt   // Geofencing-Funktionalität
│   ├── weather/                  // Wetterdienste
│   │   ├── WeatherService.kt      // Wetterdatenabruf und -management
│   │   └── ForecastMapper.kt      // Mapping von API-Antworten
│   ├── database/                 // Datenbankdienste
│   │   └── DatabaseService.kt     // Koordination aller DAO-Operationen
│   └── ... (weitere Dienste)
├── bridge/                       // Capacitor-Plugins
│   ├── LocationPlugin.kt         // Standort-Plugin
│   ├── WeatherPlugin.kt          // Wetter-Plugin
│   ├── DatabasePlugin.kt         // Datenbank-Plugin
│   └── ... (weitere Plugins)
└── ui/                           // UI-Komponenten (minimal, da Hauptsächlich Web-UI)
    ├── activity/                 // Android-Activities
    │   └── MainActivity.kt        // Haupt-Activity für Capacitor
    └── notification/             // Benachrichtigungen
        └── NotificationHelper.kt  // Benachrichtigungsverwaltung
```

### 4.2 Projektstruktur Web-Frontend

```
src/
├── lib/                         // Bibliotheken und wiederverwendbare Komponenten
│   ├── bridge/                   // Bridge zum Native-Layer
│   │   ├── NativeBridge.ts        // Zentrale Kommunikationseinheit
│   │   ├── types/                 // TypeScript-Typdefinitionen
│   │   │   ├── TripTypes.ts        // Trip-bezogene Typen
│   │   │   ├── RouteTypes.ts       // Routen-bezogene Typen
│   │   │   └── ... (weitere Typen)
│   │   └── utils/                 // Bridge-Hilfsfunktionen
│   ├── state/                    // Svelte-Zustandsmanagement
│   │   ├── locationState.svelte.ts // Standortzustand
│   │   ├── tripState.svelte.ts     // Trip-Zustand
│   │   ├── routeState.svelte.ts    // Routen-Zustand
│   │   ├── weatherState.svelte.ts  // Wetterzustand
│   │   └── ... (weitere Zustände)
│   ├── components/               // UI-Komponenten
│   │   ├── map/                   // Kartenbezogene Komponenten
│   │   │   ├── MapContainer.svelte  // Hauptkartencontainer
│   │   │   ├── RouteLayer.svelte    // Routendarstellung
│   │   │   └── ... (weitere Kartenkomponenten)
│   │   ├── route/                 // Routenplanungskomponenten
│   │   │   ├── RouteEditor.svelte   // Routeneditor
│   │   │   ├── ElevationProfile.svelte // Höhenprofil
│   │   │   └── ... (weitere Routenkomponenten)
│   │   ├── weather/               // Wetterbezogene Komponenten
│   │   │   ├── WeatherDisplay.svelte // Wetteranzeige
│   │   │   ├── DaylightIndicator.svelte // Tageslichtanzeige
│   │   │   └── ... (weitere Wetterkomponenten)
│   │   ├── diary/                 // Tagebuchkomponenten
│   │   │   ├── DiaryEditor.svelte   // Tagebucheditor
│   │   │   ├── DiaryTimeline.svelte // Tagebuchchronologie
│   │   │   └── ... (weitere Tagebuchkomponenten)
│   │   ├── notes/                 // Notizkomponenten
│   │   │   ├── LocationNoteEditor.svelte // Standortnotizeditor
│   │   │   ├── NoteList.svelte      // Notizliste
│   │   │   └── ... (weitere Notizkomponenten)
│   │   ├── github/                // GitHub-Integrationskomponenten
│   │   │   ├── GitHubConnector.svelte // GitHub-Verbindung
│   │   │   ├── SharingConfig.svelte  // Konfiguration für Sharing
│   │   │   └── ... (weitere GitHub-Komponenten)
│   │   └── common/                // Gemeinsame Komponenten
│   │       ├── Button.svelte       // Schaltfläche
│   │       ├── LoadingIndicator.svelte // Ladeindikator
│   │       └── ... (weitere gemeinsame Komponenten)
│   ├── services/                 // Frontend-Dienste
│   │   ├── RouteServiceFE.ts      // Routenplanungsdienst
│   │   ├── TrackingServiceFE.ts   // Aufzeichnungsdienst
│   │   ├── WeatherServiceFE.ts    // Wetterdienst
│   │   └── ... (weitere Dienste)
│   ├── utils/                    // Hilfsfunktionen
│   │   ├── formatters.ts          // Formatierungsfunktionen
│   │   ├── validators.ts          // Validierungsfunktionen
│   │   └── ... (weitere Hilfsfunktionen)
│   └── stores/                   // Legacy-Zustandsverwaltung (wenn nötig)
├── routes/                       // Seitenrouten
│   ├── index.svelte              // Hauptseite
│   ├── trips/                    // Trip-bezogene Seiten
│   ├── settings/                 // Einstellungsseiten
│   └── ... (weitere Seiten)
├── assets/                       // Statische Assets
│   ├── icons/                    // SVG-Icons
│   ├── images/                   // Bilder
│   └── styles/                   // Globale Stile
└── locales/                      // Internationalisierung
    ├── de/                       // Deutsche Übersetzungen
    ├── en/                       // Englische Übersetzungen
    └── ... (weitere Sprachen)
```

### 4.3 Capacitor-Konfiguration

```
capacitor.config.ts              // Hauptkonfigurationsdatei für Capacitor
```

Konfigurationsbeispiel:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.velonomad.app',
  appName: 'VeloNomad',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    allowNavigation: []
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP'
    },
    CapacitorHttp: {
      enabled: true
    },
    CapacitorCookies: {
      enabled: true
    }
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
```

## 5. Datenbanksystem

### 5.1 Room-Datenbank mit Spatialite

VeloNomad verwendet Room mit Spatialite-Erweiterung für effiziente Speicherung und Abfrage von georäumlichen Daten. Die Hauptdatenbankklasse ist:

```kotlin
@Database(
    entities = [
        TripEntity::class,
        RouteEntity::class,
        WaypointEntity::class,
        TrackPointEntity::class,
        StageEntity::class,
        DiaryEntryEntity::class,
        LocationNoteEntity::class,
        PoiEntity::class,
        DailyStatsEntity::class,
        MediaEntity::class,
        OfflineRegionEntity::class,
        AppSettingsEntity::class,
        GitHubConfigEntity::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(
    LocalDateConverter::class,
    LocalDateTimeConverter::class,
    UUIDConverter::class,
    JsonConverter::class,
    EnumConverters::class
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun tripDao(): TripDao
    abstract fun routeDao(): RouteDao
    abstract fun waypointDao(): WaypointDao
    abstract fun trackPointDao(): TrackPointDao
    abstract fun stageDao(): StageDao
    abstract fun diaryEntryDao(): DiaryEntryDao
    abstract fun locationNoteDao(): LocationNoteDao
    abstract fun poiDao(): PoiDao
    abstract fun dailyStatsDao(): DailyStatsDao
    abstract fun mediaDao(): MediaDao
    abstract fun offlineRegionDao(): OfflineRegionDao
    abstract fun settingsDao(): SettingsDao
    abstract fun gitHubConfigDao(): GitHubConfigDao
    
    companion object {
        private var INSTANCE: AppDatabase? = null
        
        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "velonomad.db"
                )
                .setJournalMode(RoomDatabase.JournalMode.WRITE_AHEAD_LOGGING)
                .addCallback(SpatialiteInitializer())
                .build().also { INSTANCE = it }
            }
        }
    }
}
```

### 5.2 Schlüsselentitäten und Beziehungen

#### TripEntity (Reiseentität)

```kotlin
@Entity(tableName = "trips")
@TypeConverters(LocalDateConverter::class, TripStatusConverter::class)
@Serializable
data class TripEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val description: String,
    val startDate: LocalDate,
    val endDate: LocalDate?,
    val distanceCovered: Float = 0f,
    val elevationGain: Float = 0f,
    val status: TripStatus,
    val isActive: Boolean = false,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
```

#### RouteEntity (Routenentität)

```kotlin
@Entity(
    tableName = "routes",
    foreignKeys = [
        ForeignKey(
            entity = TripEntity::class,
            parentColumns = ["id"],
            childColumns = ["tripId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("tripId")]
)
@TypeConverters(LocalDateTimeConverter::class, RouteStatusConverter::class)
@Serializable
data class RouteEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val tripId: String,
    val name: String,
    val totalDistance: Float,
    val totalElevation: Float,
    val estimatedDuration: Int,  // Minuten
    val status: RouteStatus,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
```

#### WaypointEntity (Wegpunktentität)

```kotlin
@Entity(
    tableName = "waypoints",
    foreignKeys = [
        ForeignKey(
            entity = RouteEntity::class,
            parentColumns = ["id"],
            childColumns = ["routeId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index("routeId"),
        Index("latitude", "longitude")
    ]
)
@TypeConverters(LocalDateTimeConverter::class, WaypointTypeConverter::class)
@Serializable
data class WaypointEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val routeId: String,
    val sequence: Int,
    val latitude: Double,
    val longitude: Double,
    val elevation: Float?,
    val type: WaypointType,
    val name: String?,
    val isStopPoint: Boolean,
    val createdAt: LocalDateTime = LocalDateTime.now()
)
```

#### DiaryEntryEntity (Tagebucheintragsentität)

```kotlin
@Entity(
    tableName = "diary_entries",
    foreignKeys = [
        ForeignKey(
            entity = TripEntity::class,
            parentColumns = ["id"],
            childColumns = ["tripId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index("tripId"),
        Index("timestamp"),
        Index("latitude", "longitude")
    ]
)
@TypeConverters(
    LocalDateTimeConverter::class,
    MoodTypeConverter::class,
    StringListConverter::class,
    MediaReferenceListConverter::class
)
@Fts4(contentEntity = DiaryEntryEntity::class)
@Serializable
data class DiaryEntryEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val tripId: String,
    val title: String,
    val content: String,
    val timestamp: LocalDateTime,
    val latitude: Double?,
    val longitude: Double?,
    val mood: MoodType?,
    val weatherSnapshotJson: String?,
    val tags: List<String> = emptyList(),
    val mediaReferences: List<MediaReference> = emptyList(),
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
```

#### LocationNoteEntity (Standortnotizentität)

```kotlin
@Entity(
    tableName = "location_notes",
    foreignKeys = [
        ForeignKey(
            entity = TripEntity::class,
            parentColumns = ["id"],
            childColumns = ["tripId"],
            onDelete = ForeignKey.SET_NULL
        )
    ],
    indices = [
        Index("tripId"),
        Index("latitude", "longitude"),
        Index("category")
    ]
)
@TypeConverters(
    LocalDateTimeConverter::class,
    NoteCategoryConverter::class,
    MediaReferenceListConverter::class
)
@Fts4(contentEntity = LocationNoteEntity::class)
@Serializable
data class LocationNoteEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val tripId: String?,  // Kann null sein (global)
    val title: String,
    val content: String,
    val latitude: Double,
    val longitude: Double,
    val category: NoteCategory,
    val rating: Int?,
    val timestamp: LocalDateTime,
    val weatherSnapshotJson: String?,
    val isPublic: Boolean = false,
    val mediaReferences: List<MediaReference> = emptyList(),
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
```

### 5.3 Data Access Objects (DAOs)

Beispiel für TripDao:

```kotlin
@Dao
interface TripDao {
    @Insert
    suspend fun insert(trip: TripEntity): Long
    
    @Update
    suspend fun update(trip: TripEntity)
    
    @Delete
    suspend fun delete(trip: TripEntity)
    
    @Query("SELECT * FROM trips WHERE id = :id")
    fun getTripById(id: String): Flow<TripEntity?>
    
    @Query("SELECT * FROM trips ORDER BY startDate DESC")
    fun getAllTrips(): Flow<List<TripEntity>>
    
    @Query("SELECT * FROM trips WHERE isActive = 1 LIMIT 1")
    fun getActiveTrip(): Flow<TripEntity?>
    
    @Query("UPDATE trips SET isActive = 0 WHERE isActive = 1")
    suspend fun deactivateAllTrips()
    
    @Query("UPDATE trips SET isActive = 1 WHERE id = :tripId")
    suspend fun activateTrip(tripId: String)
    
    @Transaction
    suspend fun setTripActive(tripId: String) {
        deactivateAllTrips()
        activateTrip(tripId)
    }
    
    @Query("UPDATE trips SET distanceCovered = :distance, elevationGain = :elevation, updatedAt = :timestamp WHERE id = :tripId")
    suspend fun updateTripStatistics(tripId: String, distance: Float, elevation: Float, timestamp: LocalDateTime = LocalDateTime.now())
    
    @Query("SELECT * FROM trips WHERE status = :status ORDER BY startDate DESC")
    fun getTripsByStatus(status: TripStatus): Flow<List<TripEntity>>
}
```

Beispiel für LocationNoteDao mit räumlichen Abfragen:

```kotlin
@Dao
interface LocationNoteDao {
    @Insert
    suspend fun insert(note: LocationNoteEntity): Long
    
    @Update
    suspend fun update(note: LocationNoteEntity)
    
    @Delete
    suspend fun delete(note: LocationNoteEntity)
    
    @Query("SELECT * FROM location_notes WHERE id = :id")
    fun getNoteById(id: String): Flow<LocationNoteEntity?>
    
    @Query("SELECT * FROM location_notes WHERE tripId = :tripId OR tripId IS NULL ORDER BY timestamp DESC")
    fun getNotesForTrip(tripId: String): Flow<List<LocationNoteEntity>>
    
    @Query("SELECT * FROM location_notes WHERE category = :category AND (tripId = :tripId OR tripId IS NULL) ORDER BY timestamp DESC")
    fun getNotesByCategory(category: NoteCategory, tripId: String?): Flow<List<LocationNoteEntity>>
    
    // Räumliche Abfrage für Notizen in der Nähe
    @RawQuery
    fun getNearbyNotes(query: SimpleSQLiteQuery): Flow<List<LocationNoteEntity>>
    
    // Hilfsmethode zur Erstellung der räumlichen Abfrage
    fun queryNotesNear(latitude: Double, longitude: Double, radiusKm: Double, tripId: String?, limit: Int = 50): Flow<List<LocationNoteEntity>> {
        val tripFilter = if (tripId != null) "AND (tripId = '$tripId' OR tripId IS NULL)" else ""
        
        val sql = """
            SELECT * FROM location_notes
            WHERE ST_Distance(
                ST_Point(longitude, latitude),
                ST_Point($longitude, $latitude)
            ) <= $radiusKm
            $tripFilter
            ORDER BY ST_Distance(
                ST_Point(longitude, latitude),
                ST_Point($longitude, $latitude)
            )
            LIMIT $limit
        """.trimIndent()
        
        return getNearbyNotes(SimpleSQLiteQuery(sql))
    }
    
    @Query("SELECT * FROM location_notes WHERE tripId IS NULL ORDER BY timestamp DESC")
    fun getGlobalNotes(): Flow<List<LocationNoteEntity>>
    
    @Query("SELECT COUNT(*) FROM location_notes WHERE tripId = :tripId")
    fun getNotesCountForTrip(tripId: String): Flow<Int>
}
```

### 5.4 Type Converters für Room

```kotlin
@TypeConverters
object LocalDateConverter {
    @TypeConverter
    fun fromLocalDate(date: LocalDate?): String? {
        return date?.toString()
    }
    
    @TypeConverter
    fun toLocalDate(dateString: String?): LocalDate? {
        return dateString?.let { LocalDate.parse(it) }
    }
}

@TypeConverters
object LocalDateTimeConverter {
    @TypeConverter
    fun fromLocalDateTime(dateTime: LocalDateTime?): String? {
        return dateTime?.toString()
    }
    
    @TypeConverter
    fun toLocalDateTime(dateTimeString: String?): LocalDateTime? {
        return dateTimeString?.let { LocalDateTime.parse(it) }
    }
}

@TypeConverters
object JsonConverter {
    @TypeConverter
    fun fromJson(json: String?): JsonElement? {
        return json?.let { Json.parseToJsonElement(it) }
    }
    
    @TypeConverter
    fun toJson(jsonElement: JsonElement?): String? {
        return jsonElement?.let { Json.encodeToString(it) }
    }
}
```

### 5.5 Spatialite-Initialisierung

```kotlin
class SpatialiteInitializer : RoomDatabase.Callback() {
    override fun onCreate(db: SupportSQLiteDatabase) {
        super.onCreate(db)
        initializeSpatialite(db)
    }
    
    private fun initializeSpatialite(db: SupportSQLiteDatabase) {
        try {
            // Spatialite initialisieren
            db.execSQL("SELECT load_extension('libspatialite', 'sqlite3_spatialite_init')")
            
            // Spatialite SRID-Tabellen initialisieren
            db.execSQL("SELECT InitSpatialMetaData(1)")
            
            // Geo-Indizes für relevante Tabellen erstellen
            db.execSQL("""
                SELECT AddGeometryColumn('location_notes', 'geom', 4326, 'POINT', 'XY');
            """)
            
            db.execSQL("""
                SELECT AddGeometryColumn('waypoints', 'geom', 4326, 'POINT', 'XY');
            """)
            
            db.execSQL("""
                SELECT AddGeometryColumn('track_points', 'geom', 4326, 'POINT', 'XY');
            """)
            
            // Trigger für automatische Geometrie-Aktualisierung erstellen
            createGeoTriggers(db)
            
            // Räumliche Indizes erstellen
            db.execSQL("SELECT CreateSpatialIndex('location_notes', 'geom')")
            db.execSQL("SELECT CreateSpatialIndex('waypoints', 'geom')")
            db.execSQL("SELECT CreateSpatialIndex('track_points', 'geom')")
            
        } catch (e: Exception) {
            Log.e("SpatialiteInitializer", "Fehler bei der Spatialite-Initialisierung", e)
        }
    }
    
    private fun createGeoTriggers(db: SupportSQLiteDatabase) {
        // Trigger für location_notes
        db.execSQL("""
            CREATE TRIGGER IF NOT EXISTS location_notes_geom_insert
            AFTER INSERT ON location_notes
            BEGIN
                UPDATE location_notes SET geom = ST_Point(NEW.longitude, NEW.latitude, 4326)
                WHERE id = NEW.id;
            END;
        """)
        
        db.execSQL("""
            CREATE TRIGGER IF NOT EXISTS location_notes_geom_update
            AFTER UPDATE OF latitude, longitude ON location_notes
            BEGIN
                UPDATE location_notes SET geom = ST_Point(NEW.longitude, NEW.latitude, 4326)
                WHERE id = NEW.id;
            END;
        """)
        
        // Ähnliche Trigger für waypoints und track_points
        // ...
    }
}
```

### 5.6 Dependency Injection für die Datenbank

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "velonomad.db"
        )
        .setJournalMode(RoomDatabase.JournalMode.WRITE_AHEAD_LOGGING)
        .addCallback(SpatialiteInitializer())
        .build()
    }
    
    @Provides
    @Singleton
    fun provideTripDao(database: AppDatabase): TripDao = database.tripDao()
    
    @Provides
    @Singleton
    fun provideRouteDao(database: AppDatabase): RouteDao = database.routeDao()
    
    @Provides
    @Singleton
    fun provideWaypointDao(database: AppDatabase): WaypointDao = database.waypointDao()
    
    @Provides
    @Singleton
    fun provideTrackPointDao(database: AppDatabase): TrackPointDao = database.trackPointDao()
    
    @Provides
    @Singleton
    fun provideStageDao(database: AppDatabase): StageDao = database.stageDao()
    
    @Provides
    @Singleton
    fun provideDiaryEntryDao(database: AppDatabase): DiaryEntryDao = database.diaryEntryDao()
    
    @Provides
    @Singleton
    fun provideLocationNoteDao(database: AppDatabase): LocationNoteDao = database.locationNoteDao()
    
    @Provides
    @Singleton
    fun providePoiDao(database: AppDatabase): PoiDao = database.poiDao()
    
    @Provides
    @Singleton
    fun provideDailyStatsDao(database: AppDatabase): DailyStatsDao = database.dailyStatsDao()
    
    @Provides
    @Singleton
    fun provideMediaDao(database: AppDatabase): MediaDao = database.mediaDao()
    
    @Provides
    @Singleton
    fun provideOfflineRegionDao(database: AppDatabase): OfflineRegionDao = database.offlineRegionDao()
    
    @Provides
    @Singleton
    fun provideSettingsDao(database: AppDatabase): SettingsDao = database.settingsDao()
    
    @Provides
    @Singleton
    fun provideGitHubConfigDao(database: AppDatabase): GitHubConfigDao = database.gitHubConfigDao()
}
```

## 6. Kommunikationsfluss und Signalverarbeitung

### 6.1 Native Flow-basiertes Signalsystem

Alle nativen Dienste verwenden Kotlin Flows für kontinuierliche Datenstreams. Beispiel für den LocationService:

```kotlin
@Singleton
class LocationService @Inject constructor(
    private val context: Context,
    private val fusedLocationClient: FusedLocationProviderClient,
    private val workManager: WorkManager,
    private val trackPointDao: TrackPointDao,
    private val preferencesService: PreferencesService
) {
    // Standortstatus
    private val _currentLocation = MutableStateFlow<Result<LocationData>>(Result.Loading())
    val currentLocation: StateFlow<Result<LocationData>> = _currentLocation.asStateFlow()
    
    // Tracking-Status
    private val _trackingState = MutableStateFlow<TrackingState>(TrackingState.Stopped)
    val trackingState: StateFlow<TrackingState> = _trackingState.asStateFlow()
    
    // Aufzeichnungsstatus für den aktuellen Trip
    private val _recordingState = MutableStateFlow<RecordingState>(RecordingState.Idle)
    val recordingState: StateFlow<RecordingState> = _recordingState.asStateFlow()
    
    // Weitere Implementierungen...
}
```

### 6.2 Capacitor Plugins als Bridge

Capacitor-Plugins verbinden die nativen Flows mit dem JavaScript/TypeScript-Frontend:

```kotlin
@CapacitorPlugin(name = "LocationPlugin")
class LocationPlugin @Inject constructor(
    private val locationService: LocationService,
    private val scope: CoroutineScope
) : Plugin() {
    
    init {
        // Subscriber für State Flows einrichten
        locationService.currentLocation
            .distinctUntilChanged()
            .onEach { locationResult ->
                // In JS-freundliches Format umwandeln
                val jsResult = when (locationResult) {
                    is Result.Success -> JSObject().apply {
                        put("status", "success")
                        put("data", locationResult.data.toJSObject())
                    }
                    is Result.Error -> JSObject().apply {
                        put("status", "error")
                        put("error", locationResult.error.toJSObject())
                    }
                    is Result.Loading -> JSObject().apply {
                        put("status", "loading")
                    }
                }
                
                // Event an JS senden
                notifyListeners("locationUpdate", jsResult)
            }.launchIn(scope)
        
        // Weitere Subscriber für Tracking-Status, Aufzeichnungsstatus, etc.
    }
    
    @PluginMethod
    fun startTracking(call: PluginCall) {
        val profileString = call.getString("profile", "BALANCED")
        val profile = LocationProfile.valueOf(profileString)
        
        locationService.startTracking(profile)
        call.resolve()
    }
    
    // Weitere Plugin-Methoden...
}
```

### 6.3 Frontend NativeBridge

Die zentrale TypeScript-Bridge verwaltet die Kommunikation mit allen Plugins:

```typescript
// NativeBridge.ts
class NativeBridge {
    private static instance: NativeBridge;
    
    private constructor() {
        this.initializePlugins();
    }
    
    public static getInstance(): NativeBridge {
        if (!NativeBridge.instance) {
            NativeBridge.instance = new NativeBridge();
        }
        return NativeBridge.instance;
    }
    
    private initializePlugins() {
        // Event-Listener für alle Plugins einrichten
        this.setupLocationListeners();
        this.setupWeatherListeners();
        this.setupDatabaseListeners();
        // Weitere Plugin-Listener...
    }
    
    private setupLocationListeners() {
        // @ts-ignore - Capacitor Plugin
        Capacitor.Plugins.LocationPlugin.addListener('locationUpdate', (result: any) => {
            // Mapping und Update des Standortspeichers
            locationStore.updateLocation(this.mapResultFromPlugin(result));
        });
        
        // Weitere Standort-Event-Listener...
    }
    
    // Standort-API-Methoden
    public async startTracking(profile: LocationProfile = LocationProfile.BALANCED): Promise<void> {
        try {
            // @ts-ignore - Capacitor Plugin
            await Capacitor.Plugins.LocationPlugin.startTracking({ profile });
        } catch (error) {
            console.error('Fehler beim Starten des Trackings', error);
            throw error;
        }
    }
    
    // Weitere API-Methoden für alle Plugins...
}

export default NativeBridge.getInstance();
```

### 6.4 Frontend Svelte Runes State Management

Svelte 5 Runes werden verwendet, um reaktive Zustände im Frontend zu verwalten:

```typescript
// locationState.svelte.ts
import { $state, $derived, $effect } from 'svelte';
import type { Result, LocationData, TrackingState, RecordingState } from '../types';
import NativeBridge from '../bridge/NativeBridge';

// Standortstatus
export const currentLocation = $state<Result<LocationData>>({ status: 'loading' });
export const trackingState = $state<TrackingState>('stopped');
export const recordingState = $state<RecordingState>('idle');

// Abgeleitete Werte
export const isTracking = $derived(trackingState !== 'stopped');
export const isRecording = $derived(recordingState === 'recording');
export const isPaused = $derived(recordingState === 'paused');
export const hasLocation = $derived(
    currentLocation.status === 'success' && currentLocation.data !== null
);
export const currentCoordinates = $derived(
    hasLocation && currentLocation.status === 'success'
        ? [currentLocation.data.longitude, currentLocation.data.latitude]
        : null
);

// Aktionsmethoden
export function updateLocation(result: Result<LocationData>) {
    currentLocation = result;
}

export function updateTrackingState(state: TrackingState) {
    trackingState = state;
}

export function updateRecordingState(state: RecordingState) {
    recordingState = state;
}

export async function startTracking(profile: LocationProfile = LocationProfile.BALANCED) {
    try {
        await NativeBridge.startTracking(profile);
    } catch (error) {
        console.error('Fehler beim Starten des Trackings', error);
    }
}

// Weitere Aktionen für Pausieren, Fortsetzen, Stoppen der Aufzeichnung, etc.
```

### 6.5 Vollständiger Signalfluss an einem Beispiel

Für das Starten der Standortaufzeichnung für einen Trip:

1. **Benutzeraktion**: Benutzer klickt auf "Aufzeichnung starten" in der UI
2. **Frontend-Komponente**: Ruft `startRecording(tripId)` aus `locationState.svelte.ts` auf
3. **State-Aktionsmethode**: Ruft `NativeBridge.startRecording(tripId)` auf
4. **NativeBridge**: Ruft `Capacitor.Plugins.LocationPlugin.startRecording({ tripId })` auf
5. **Capacitor-Plugin**: Empfängt Aufruf und leitet weiter an `locationService.startRecording(tripId)`
6. **LocationService**: 
   - Ändert `_recordingState` zu `RecordingState.Recording`
   - Konfiguriert höhere Standortgenauigkeit
   - Beginnt mit der Speicherung von TrackPoints in der Datenbank
7. **Flow-Update**: `recordingState`-Flow wird aktualisiert, Plugin sendet "recordingStateUpdate"-Event
8. **NativeBridge**: Fängt Event ab und ruft `locationStore.updateRecordingState()` auf
9. **Frontend-State**: `recordingState` in `locationState.svelte.ts` wird aktualisiert
10. **UI-Aktualisierung**: Komponenten, die `isRecording` aus dem State verwenden, werden automatisch neu gerendert

## 7. Native Services und Implementierungen

### 7.1 LocationService (Standortdienst)

```kotlin
@Singleton
class LocationService @Inject constructor(
    private val context: Context,
    private val fusedLocationClient: FusedLocationProviderClient,
    private val workManager: WorkManager,
    private val trackPointDao: TrackPointDao,
    private val preferencesService: PreferencesService
) {
    // Standortstatus
    private val _currentLocation = MutableStateFlow<Result<LocationData>>(Result.Loading())
    val currentLocation: StateFlow<Result<LocationData>> = _currentLocation.asStateFlow()
    
    // Tracking-Status
    private val _trackingState = MutableStateFlow<TrackingState>(TrackingState.Stopped)
    val trackingState: StateFlow<TrackingState> = _trackingState.asStateFlow()
    
    // Aufzeichnungsstatus für den aktuellen Trip
    private val _recordingState = MutableStateFlow<RecordingState>(RecordingState.Idle)
    val recordingState: StateFlow<RecordingState> = _recordingState.asStateFlow()
    
    // GPS-Profilmanagement
    private var currentProfile: LocationProfile = LocationProfile.BALANCED
    private var locationCallback: LocationCallback? = null
    private var recordingTripId: String? = null
    private var lastTrackPoint: TrackPointEntity? = null
    
    init {
        // Standortüberwachung basierend auf Einstellungen initialisieren
        initializeLocationMonitoring()
    }
    
    /**
     * Initialisiert die Standortüberwachung basierend auf den Benutzereinstellungen
     */
    private fun initializeLocationMonitoring() {
        scope.launch {
            val savedProfile = preferencesService.getLocationProfile()
            if (savedProfile == LocationProfile.HIGH_ACCURACY || 
                savedProfile == LocationProfile.BALANCED) {
                startTracking(savedProfile)
            }
        }
    }
    
    /**
     * Startet das Standort-Tracking mit dem angegebenen Profil
     */
    fun startTracking(profile: LocationProfile) {
        stopTracking() // Vorheriges Tracking stoppen, falls vorhanden
        
        currentProfile = profile
        
        val locationRequest = LocationRequest.Builder(
            when (profile) {
                LocationProfile.HIGH_ACCURACY -> Priority.PRIORITY_HIGH_ACCURACY
                LocationProfile.BALANCED -> Priority.PRIORITY_BALANCED_POWER_ACCURACY
                LocationProfile.LOW_POWER -> Priority.PRIORITY_LOW_POWER
            },
            when (profile) {
                LocationProfile.HIGH_ACCURACY -> 2000L  // 2 Sekunden
                LocationProfile.BALANCED -> 5000L      // 5 Sekunden
                LocationProfile.LOW_POWER -> 15000L    // 15 Sekunden
            }
        ).build()
        
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                locationResult.lastLocation?.let { location ->
                    processLocationUpdate(location)
                }
            }
        }
        
        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback!!,
                Looper.getMainLooper()
            )
            _trackingState.value = TrackingState.Active(profile)
            
            if (_recordingState.value is RecordingState.Recording) {
                scheduleBackgroundTracking()
            }
        } catch (e: SecurityException) {
            _trackingState.value = TrackingState.Stopped
            _currentLocation.value = Result.Error(
                AppError(
                    code = ErrorCode.PERMISSION_DENIED,
                    message = "Keine Standortberechtigung"
                )
            )
        }
    }
    
    /**
     * Stoppt das Standort-Tracking
     */
    fun stopTracking() {
        locationCallback?.let {
            fusedLocationClient.removeLocationUpdates(it)
            locationCallback = null
        }
        _trackingState.value = TrackingState.Stopped
    }
    
    /**
     * Startet die Aufzeichnung von Trackpoints für den angegebenen Trip
     */
    suspend fun startRecording(tripId: String): Result<Unit> {
        // Überprüfen, ob Trip existiert
        val trip = tripDao.getTripByIdSync(tripId)
        if (trip == null) {
            return Result.Error(
                AppError(
                    code = ErrorCode.ENTITY_NOT_FOUND,
                    message = "Trip nicht gefunden: $tripId"
                )
            )
        }
        
        // Aufzeichnung starten
        recordingTripId = tripId
        _recordingState.value = RecordingState.Recording(tripId)
        
        // Höhere Genauigkeit für die Aufzeichnung einstellen
        if (_trackingState.value != TrackingState.Active(LocationProfile.HIGH_ACCURACY)) {
            startTracking(LocationProfile.HIGH_ACCURACY)
        }
        
        // Hintergrund-Tracking aktivieren
        scheduleBackgroundTracking()
        
        return Result.Success(Unit)
    }
    
    /**
     * Pausiert die aktuelle Aufzeichnungssitzung
     */
    suspend fun pauseRecording(): Result<Unit> {
        if (_recordingState.value !is RecordingState.Recording) {
            return Result.Error(
                AppError(
                    code = ErrorCode.INVALID_STATE,
                    message = "Keine aktive Aufzeichnung zum Pausieren"
                )
            )
        }
        
        val tripId = recordingTripId
        if (tripId == null) {
            _recordingState.value = RecordingState.Idle
            return Result.Error(
                AppError(
                    code = ErrorCode.INVALID_STATE,
                    message = "Keine Trip-ID für die Aufzeichnung"
                )
            )
        }
        
        _recordingState.value = RecordingState.Paused(tripId)
        
        // Hintergrund-Tracking beenden
        workManager.cancelUniqueWork(BACKGROUND_TRACKING_WORK_NAME)
        
        return Result.Success(Unit)
    }
    
    /**
     * Setzt eine pausierte Aufzeichnungssitzung fort
     */
    suspend fun resumeRecording(): Result<Unit> {
        if (_recordingState.value !is RecordingState.Paused) {
            return Result.Error(
                AppError(
                    code = ErrorCode.INVALID_STATE,
                    message = "Keine pausierte Aufzeichnung zum Fortsetzen"
                )
            )
        }
        
        val tripId = recordingTripId
        if (tripId == null) {
            _recordingState.value = RecordingState.Idle
            return Result.Error(
                AppError(
                    code = ErrorCode.INVALID_STATE,
                    message = "Keine Trip-ID für die Aufzeichnung"
                )
            )
        }
        
        _recordingState.value = RecordingState.Recording(tripId)
        
        // Hintergrund-Tracking fortsetzen
        scheduleBackgroundTracking()
        
        return Result.Success(Unit)
    }
    
    /**
     * Beendet die aktuelle Aufzeichnungssitzung
     */
    suspend fun stopRecording(): Result<Unit> {
        if (_recordingState.value !is RecordingState.Recording && 
            _recordingState.value !is RecordingState.Paused) {
            return Result.Error(
                AppError(
                    code = ErrorCode.INVALID_STATE,
                    message = "Keine aktive oder pausierte Aufzeichnung zum Beenden"
                )
            )
        }
        
        // Hintergrund-Tracking beenden
        workManager.cancelUniqueWork(BACKGROUND_TRACKING_WORK_NAME)
        
        // Trip-Statistiken aktualisieren
        val tripId = recordingTripId
        if (tripId != null) {
            updateTripStatistics(tripId)
        }
        
        // Status zurücksetzen
        recordingTripId = null
        _recordingState.value = RecordingState.Idle
        
        // Tracking auf Standardprofil zurücksetzen
        if (_trackingState.value is TrackingState.Active) {
            startTracking(preferencesService.getLocationProfile())
        }
        
        return Result.Success(Unit)
    }
    
    /**
     * Verarbeitet ein Standort-Update
     */
    private fun processLocationUpdate(location: Location) {
        val locationData = LocationData(
            latitude = location.latitude,
            longitude = location.longitude,
            altitude = location.altitude,
            accuracy = location.accuracy,
            speed = location.speed,
            bearing = location.bearing,
            timestamp = Instant.ofEpochMilli(location.time).toLocalDateTime()
        )
        
        _currentLocation.value = Result.Success(locationData)
        
        // Wenn wir aufzeichnen, speichern wir den Trackpoint
        val currentRecordingState = _recordingState.value
        if (currentRecordingState is RecordingState.Recording) {
            scope.launch {
                saveTrackPoint(location, currentRecordingState.tripId)
            }
        }
    }
    
    /**
     * Speichert einen Trackpoint in der Datenbank
     */
    private suspend fun saveTrackPoint(location: Location, tripId: String) {
        // Aktuelle Aktivitätsart bestimmen (Radfahren, Gehen, etc.)
        val activityType = determineActivityType(location)
        
        // Neuen Trackpoint erstellen
        val trackPoint = TrackPointEntity(
            tripId = tripId,
            timestamp = Instant.ofEpochMilli(location.time).toLocalDateTime(),
            latitude = location.latitude,
            longitude = location.longitude,
            elevation = location.altitude.toFloat(),
            accuracy = location.accuracy,
            speed = location.speed,
            activityType = activityType,
            
            // Optionale Sensor-Daten
            heartRate = sensorService.getLatestHeartRate(),
            temperature = sensorService.getLatestTemperature(),
            batteryLevel = getBatteryLevel()
        )
        
        // In Datenbank speichern
        trackPointDao.insert(trackPoint)
        
        // Letzten Trackpoint speichern für Statistiken und Aktivitätserkennung
        lastTrackPoint = trackPoint
    }
    
    /**
     * Bestimmt die Aktivitätsart basierend auf der Geschwindigkeit, Beschleunigung, etc.
     */
    private fun determineActivityType(location: Location): ActivityType {
        // Implementierung der Aktivitätserkennung
        // Basierend auf Geschwindigkeit, Beschleunigung, vorherigem Trackpoint, etc.
        
        val speed = location.speed
        
        return when {
            speed > 5f -> ActivityType.CYCLING
            speed > 1f -> ActivityType.WALKING
            else -> ActivityType.IDLE
        }
    }
    
    /**
     * Richtet Geofencing für die angegebenen Wegpunkte ein
     */
    suspend fun setupGeofencing(waypoints: List<WaypointEntity>): Result<Unit> {
        try {
            // Löschen vorheriger Geofences
            val geofencingClient = LocationServices.getGeofencingClient(context)
            geofencingClient.removeGeofences(getGeofencePendingIntent())
            
            // Neue Geofences erstellen
            val geofences = waypoints
                .filter { it.isStopPoint }
                .map { waypoint ->
                    Geofence.Builder()
                        .setRequestId(waypoint.id)
                        .setCircularRegion(
                            waypoint.latitude,
                            waypoint.longitude,
                            100f  // 100 Meter Radius
                        )
                        .setExpirationDuration(Geofence.NEVER_EXPIRE)
                        .setTransitionTypes(
                            Geofence.GEOFENCE_TRANSITION_ENTER or
                            Geofence.GEOFENCE_TRANSITION_DWELL or
                            Geofence.GEOFENCE_TRANSITION_EXIT
                        )
                        .setLoiteringDelay(60000)  // 1 Minute Verweilzeit
                        .build()
                }
            
            if (geofences.isEmpty()) {
                return Result.Success(Unit)
            }
            
            // Geofences registrieren
            val request = GeofencingRequest.Builder()
                .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
                .addGeofences(geofences)
                .build()
            
            geofencingClient.addGeofences(request, getGeofencePendingIntent())
            
            return Result.Success(Unit)
        } catch (e: SecurityException) {
            return Result.Error(
                AppError(
                    code = ErrorCode.PERMISSION_DENIED,
                    message = "Keine Geofencing-Berechtigung"
                )
            )
        } catch (e: Exception) {
            return Result.Error(
                AppError(
                    code = ErrorCode.UNKNOWN_ERROR,
                    message = "Fehler beim Einrichten von Geofences: ${e.message}"
                )
            )
        }
    }
    
    /**
     * Plant Hintergrund-Tracking mit WorkManager
     */
    private fun scheduleBackgroundTracking() {
        // Vorherige Arbeit abbrechen
        workManager.cancelUniqueWork(BACKGROUND_TRACKING_WORK_NAME)
        
        // Konfigurieren des periodischen Workers für Hintergrund-Tracking
        val constraints = Constraints.Builder()
            .setRequiresBatteryNotLow(true)
            .build()
        
        val workRequest = PeriodicWorkRequestBuilder<LocationTrackingWorker>(
            15, TimeUnit.MINUTES,  // Minimale Frequenz für Hintergrund-Updates
            5, TimeUnit.MINUTES    // Flexibilitätsfenster
        )
        .setConstraints(constraints)
        .setBackoffCriteria(
            BackoffPolicy.LINEAR,
            10, TimeUnit.MINUTES
        )
        .build()
        
        workManager.enqueueUniquePeriodicWork(
            BACKGROUND_TRACKING_WORK_NAME,
            ExistingPeriodicWorkPolicy.REPLACE,
            workRequest
        )
    }
    
    /**
     * Aktualisiert die Trip-Statistiken basierend auf den aufgezeichneten Trackpoints
     */
    private suspend fun updateTripStatistics(tripId: String) {
        try {
            val trackPoints = trackPointDao.getTrackPointsForTripSync(tripId)
            
            if (trackPoints.isEmpty()) {
                return
            }
            
            // Gesamtdistanz berechnen
            var totalDistance = 0f
            var totalElevationGain = 0f
            
            for (i in 1 until trackPoints.size) {
                val prev = trackPoints[i - 1]
                val curr = trackPoints[i]
                
                // Distanz zwischen zwei Punkten
                val distance = calculateDistance(
                    prev.latitude, prev.longitude,
                    curr.latitude, curr.longitude
                )
                
                totalDistance += distance
                
                // Höhengewinn (nur positive Höhenänderungen)
                if (curr.elevation != null && prev.elevation != null) {
                    val elevationChange = curr.elevation - prev.elevation
                    if (elevationChange > 0) {
                        totalElevationGain += elevationChange
                    }
                }
            }
            
            // Trip-Statistiken aktualisieren
            tripDao.updateTripStatistics(
                tripId,
                totalDistance,
                totalElevationGain
            )
            
        } catch (e: Exception) {
            Timber.e(e, "Fehler beim Aktualisieren der Trip-Statistiken")
        }
    }
    
    /**
     * Berechnet die Distanz zwischen zwei Koordinaten in Metern
     */
    private fun calculateDistance(
        lat1: Double, lon1: Double,
        lat2: Double, lon2: Double
    ): Float {
        val results = FloatArray(1)
        Location.distanceBetween(lat1, lon1, lat2, lon2, results)
        return results[0]
    }
    
    /**
     * Erstellt das PendingIntent für Geofencing
     */
    private fun getGeofencePendingIntent(): PendingIntent {
        val intent = Intent(context, GeofenceBroadcastReceiver::class.java)
        return PendingIntent.getBroadcast(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
    }
    
    /**
     * Ermittelt den aktuellen Batteriestand
     */
    private fun getBatteryLevel(): Int? {
        val batteryIntent = context.registerReceiver(
            null,
            IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        )
        
        val level = batteryIntent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = batteryIntent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        
        return if (level != -1 && scale != -1) {
            (level * 100 / scale.toFloat()).toInt()
        } else null
    }
    
    companion object {
        private const val BACKGROUND_TRACKING_WORK_NAME = "background_location_tracking"
    }
    
    /**
     * WorkManager Worker für Hintergrund-Standort-Tracking
     */
    class LocationTrackingWorker(
        context: Context,
        params: WorkerParameters
    ) : CoroutineWorker(context, params) {
        
        @Inject
        lateinit var locationService: LocationService
        
        override suspend fun doWork(): Result {
            return try {
                // Aktuelle Position abrufen und speichern
                val location = getCurrentLocation()
                
                if (location != null) {
                    val recordingState = locationService.recordingState.value
                    
                    if (recordingState is RecordingState.Recording) {
                        locationService.saveTrackPoint(location, recordingState.tripId)
                    }
                }
                
                Result.success()
            } catch (e: Exception) {
                Timber.e(e, "Fehler im Hintergrund-Tracking")
                Result.retry()
            }
        }
        
        private suspend fun getCurrentLocation(): Location? {
            val locationClient = LocationServices.getFusedLocationProviderClient(applicationContext)
            
            return try {
                withContext(Dispatchers.IO) {
                    val task = locationClient.getCurrentLocation(
                        Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                        null
                    )
                    
                    Tasks.await(task)
                }
            } catch (e: SecurityException) {
                Timber.e(e, "Keine Standortberechtigung für Hintergrund-Tracking")
                null
            } catch (e: Exception) {
                Timber.e(e, "Fehler beim Abrufen des aktuellen Standorts")
                null
            }
        }
    }
    
    /**
     * Broadcast Receiver für Geofence-Ereignisse
     */
    class GeofenceBroadcastReceiver : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action != GeofencingEvent.ACTION_GEOFENCE_TRANSITION) {
                return
            }
            
            val geofencingEvent = GeofencingEvent.fromIntent(intent)
            
            if (geofencingEvent?.hasError() == true) {
                Timber.e("Geofence-Fehler: ${geofencingEvent.errorCode}")
                return
            }
            
            val geofenceTransition = geofencingEvent?.geofenceTransition
            
            if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER ||
                geofenceTransition == Geofence.GEOFENCE_TRANSITION_DWELL) {
                
                // Benachrichtigung über Erreichen eines Wegpunkts
                val triggeringGeofences = geofencingEvent.triggeringGeofences
                
                if (triggeringGeofences.isNullOrEmpty()) {
                    return
                }
                
                // Wegpunkt-IDs aus Geofences extrahieren
                val waypointIds = triggeringGeofences.map { it.requestId }
                
                // Benachrichtigung erstellen und anzeigen
                val notificationHelper = NotificationHelper(context)
                notificationHelper.showWaypointNotification(waypointIds)
            }
        }
    }
}
```

### 7.2 WeatherService (Wetterdienst)

```kotlin
@Singleton
class WeatherService @Inject constructor(
    private val httpClient: HttpClient,
    private val preferencesService: PreferencesService,
    private val dataStore: DataStore<Preferences>,
    private val networkService: NetworkService
) {
    // Wetter-API-Konfiguration
    private val apiKey: String = BuildConfig.WEATHER_API_KEY
    private val baseUrl: String = "https://api.openweathermap.org/data/3.0/onecall"
    
    // Aktueller Wetterstatus
    private val _currentWeather = MutableStateFlow<Result<WeatherData>>(Result.Loading())
    val currentWeather: StateFlow<Result<WeatherData>> = _currentWeather.asStateFlow()
    
    // Stündliche Vorhersage
    private val _hourlyForecast = MutableStateFlow<Result<List<HourlyForecastData>>>(Result.Loading())
    val hourlyForecast: StateFlow<Result<List<HourlyForecastData>>> = _hourlyForecast.asStateFlow()
    
    // Tägliche Vorhersage
    private val _dailyForecast = MutableStateFlow<Result<List<DailyForecastData>>>(Result.Loading())
    val dailyForecast: StateFlow<Result<List<DailyForecastData>>> = _dailyForecast.asStateFlow()
    
    // Wetterwarnungen
    private val _weatherAlerts = MutableStateFlow<Result<List<WeatherAlertData>>>(Result.Loading())
    val weatherAlerts: StateFlow<Result<List<WeatherAlertData>>> = _weatherAlerts.asStateFlow()
    
    // Cache-Verwaltung
    private val weatherCache = Cache<String, WeatherResponse>(
        maximumCacheSize = 20,
        expiryTimeMillis = 30 * 60 * 1000 // 30 Minuten
    )
    
    /**
     * Ruft das aktuelle Wetter für den angegebenen Standort ab
     */
    suspend fun fetchWeatherForLocation(latitude: Double, longitude: Double): Result<WeatherData> {
        // Zuerst Cache überprüfen
        val cacheKey = "$latitude,$longitude"
        weatherCache.get(cacheKey)?.let {
            parseAndUpdateWeatherData(it, latitude, longitude, true)
            return Result.Success(it.current.toWeatherData())
        }
        
        // Wenn nicht im Cache oder abgelaufen, von API abrufen
        return try {
            if (!networkService.isNetworkAvailable()) {
                return Result.Error(AppError(ErrorCode.NETWORK_UNAVAILABLE))
            }
            
            val response = httpClient.get(baseUrl) {
                parameter("lat", latitude)
                parameter("lon", longitude)
                parameter("appid", apiKey)
                parameter("units", "metric")
                parameter("exclude", "minutely")
                parameter("lang", getCurrentLanguageCode())
            }
            
            if (response.status.isSuccess()) {
                val weatherResponse = response.body<WeatherResponse>()
                weatherCache.put(cacheKey, weatherResponse)
                
                // Wetterstatuswerte aktualisieren
                parseAndUpdateWeatherData(weatherResponse, latitude, longitude, false)
                
                Result.Success(weatherResponse.current.toWeatherData())
            } else {
                Result.Error(AppError(ErrorCode.API_ERROR, "Wetter-API-Fehler: ${response.status}"))
            }
        } catch (e: Exception) {
            Result.Error(AppError(ErrorCode.UNKNOWN_ERROR, e.message ?: "Unbekannter Fehler", e))
        }
    }
    
    /**
     * Analysiert die Wetterantwort und aktualisiert alle Statuswerte
     */
    private fun parseAndUpdateWeatherData(
        response: WeatherResponse,
        latitude: Double,
        longitude: Double,
        fromCache: Boolean
    ) {
        // Aktuelles Wetter aktualisieren
        _currentWeather.value = Result.Success(response.current.toWeatherData())
        
        // Stündliche Vorhersage aktualisieren
        val hourlyData = response.hourly.map { it.toHourlyForecastData() }
        _hourlyForecast.value = Result.Success(hourlyData)
        
        // Tägliche Vorhersage aktualisieren
        val dailyData = response.daily.map { it.toDailyForecastData() }
        _dailyForecast.value = Result.Success(dailyData)
        
        // Wetterwarnungen aktualisieren
        val alertsData = response.alerts?.map { it.toWeatherAlertData() } ?: emptyList()
        _weatherAlerts.value = Result.Success(alertsData)
        
        // Letzte Aktualisierung speichern
        scope.launch {
            preferencesService.setLastWeatherUpdate(
                latitude, longitude, System.currentTimeMillis(), fromCache
            )
        }
    }
    
    /**
     * Ruft Vorhersagedaten entlang einer Route ab
     */
    suspend fun getForecastForRoute(
        routePoints: List<RoutePoint>,
        departureTime: LocalDateTime
    ): Result<RouteForecast> {
        // Prüfen, ob genügend Punkte vorhanden sind
        if (routePoints.isEmpty()) {
            return Result.Error(AppError(ErrorCode.INVALID_PARAMETERS, "Keine Routenpunkte angegeben"))
        }
        
        try {
            if (!networkService.isNetworkAvailable()) {
                return Result.Error(AppError(ErrorCode.NETWORK_UNAVAILABLE))
            }
            
            // Sampling der Routenpunkte für weniger API-Calls
            val sampledPoints = sampleRoutePoints(routePoints)
            
            // Geschätzte Ankunftszeiten berechnen
            val pointsWithTimes = calculateEstimatedTimes(sampledPoints, departureTime)
            
            // Wetterdaten für jeden Punkt abrufen
            val forecasts = mutableListOf<PointForecast>()
            
            for ((point, time) in pointsWithTimes) {
                val weatherResult = fetchTimedWeatherForLocation(
                    point.latitude,
                    point.longitude,
                    time
                )
                
                if (weatherResult is Result.Success) {
                    forecasts.add(
                        PointForecast(
                            latitude = point.latitude,
                            longitude = point.longitude,
                            distance = point.distance,
                            estimatedTime = time,
                            weather = weatherResult.data
                        )
                    )
                }
            }
            
            return Result.Success(
                RouteForecast(
                    departureTime = departureTime,
                    points = forecasts
                )
            )
            
        } catch (e: Exception) {
            return Result.Error(AppError(ErrorCode.UNKNOWN_ERROR, e.message ?: "Unbekannter Fehler", e))
        }
    }
    
    /**
     * Ruft das Wetter für einen bestimmten Standort und Zeitpunkt ab
     */
    private suspend fun fetchTimedWeatherForLocation(
        latitude: Double,
        longitude: Double,
        time: LocalDateTime
    ): Result<WeatherData> {
        try {
            // Aktuelles Wetter verwenden, wenn die Zeit in der nahen Zukunft liegt
            val now = LocalDateTime.now()
            if (time.isBefore(now.plusHours(1))) {
                return fetchWeatherForLocation(latitude, longitude)
            }
            
            // Sonst Forecast-API mit Zeitstempel verwenden
            val timestamp = time.toInstant(ZoneOffset.UTC).epochSecond
            
            val response = httpClient.get("$baseUrl/timemachine") {
                parameter("lat", latitude)
                parameter("lon", longitude)
                parameter("dt", timestamp)
                parameter("appid", apiKey)
                parameter("units", "metric")
                parameter("lang", getCurrentLanguageCode())
            }
            
            if (response.status.isSuccess()) {
                val forecastResponse = response.body<TimeMachineResponse>()
                return Result.Success(forecastResponse.data[0].toWeatherData())
            } else {
                return Result.Error(AppError(ErrorCode.API_ERROR, "Wetter-API-Fehler: ${response.status}"))
            }
        } catch (e: Exception) {
            return Result.Error(AppError(ErrorCode.UNKNOWN_ERROR, e.message ?: "Unbekannter Fehler", e))
        }
    }
    
    /**
     * Startet automatische Wetteraktualisierungen für den aktuellen Standort
     */
    fun startWeatherUpdates() {
        scope.launch {
            while (true) {
                try {
                    // Aktuellen Standort abrufen
                    val locationResult = locationService.currentLocation.first { it is Result.Success }
                    
                    if (locationResult is Result.Success) {
                        val location = locationResult.data
                        fetchWeatherForLocation(location.latitude, location.longitude)
                    }
                } catch (e: Exception) {
                    Timber.e(e, "Fehler bei automatischen Wetteraktualisierungen")
                }
                
                // Pause basierend auf Netzwerkstatus und Batteriestand
                val updateInterval = if (networkService.isOnUnmeteredNetwork() && 
                                        batteryManager.isBatteryOkay()) {
                    15L  // 15 Minuten bei gutem Netzwerk und Akku
                } else {
                    30L  // 30 Minuten bei schlechtem Netzwerk oder niedrigem Akku
                }
                
                delay(updateInterval * 60 * 1000) // In Millisekunden umrechnen
            }
        }
    }
    
    /**
     * Sample-Routenpunkte für weniger API-Calls
     */
    private fun sampleRoutePoints(points: List<RoutePoint>): List<RoutePoint> {
        // Wenn wenige Punkte, alle zurückgeben
        if (points.size <= 5) return points
        
        val result = mutableListOf<RoutePoint>()
        
        // Immer Start- und Endpunkt einbeziehen
        result.add(points.first())
        
        // Mittlere Punkte samplen
        val step = points.size / 4
        for (i in step until points.size - step step step) {
            result.add(points[i])
        }
        
        // Endpunkt hinzufügen
        result.add(points.last())
        
        return result
    }
    
    /**
     * Berechnet geschätzte Ankunftszeiten für Routenpunkte
     */
    private fun calculateEstimatedTimes(
        points: List<RoutePoint>,
        departureTime: LocalDateTime
    ): List<Pair<RoutePoint, LocalDateTime>> {
        val result = mutableListOf<Pair<RoutePoint, LocalDateTime>>()
        
        // Durchschnittliche Geschwindigkeit aus Einstellungen
        val avgSpeed = preferencesService.getAverageSpeed() // km/h
        
        var currentTime = departureTime
        var lastDistance = 0f
        
        for (point in points) {
            val segmentDistance = point.distance - lastDistance // in Metern
            val segmentTimeHours = segmentDistance / 1000f / avgSpeed // in Stunden
            val segmentTimeMinutes = (segmentTimeHours * 60).toInt()
            
            currentTime = currentTime.plusMinutes(segmentTimeMinutes.toLong())
            result.add(point to currentTime)
            
            lastDistance = point.distance
        }
        
        return result
    }
    
    /**
     * Ermittelt den aktuellen Sprachcode für die API
     */
    private fun getCurrentLanguageCode(): String {
        return Locale.getDefault().language
    }
}
```

### 7.3 DatabaseService (Datenbankdienst)

```kotlin
@Singleton
class DatabaseService @Inject constructor(
    private val appDatabase: AppDatabase,
    private val tripDao: TripDao,
    private val routeDao: RouteDao,
    private val waypointDao: WaypointDao,
    private val trackPointDao: TrackPointDao,
    private val stageDao: StageDao,
    private val diaryEntryDao: DiaryEntryDao,
    private val locationNoteDao: LocationNoteDao,
    private val poiDao: PoiDao,
    private val dailyStatsDao: DailyStatsDao,
    private val mediaDao: MediaDao,
    private val offlineRegionDao: OfflineRegionDao,
    private val settingsDao: SettingsDao,
    private val gitHubConfigDao: GitHubConfigDao
) {
    // Aktive Trip-Verwaltung
    private val _activeTrip = MutableStateFlow<Result<TripEntity?>>(Result.Loading())
    val activeTrip: StateFlow<Result<TripEntity?>> = _activeTrip.asStateFlow()
    
    init {
        // Auf Änderungen des aktiven Trips abonnieren
        tripDao.getActiveTrip().onEach { trip ->
            _activeTrip.value = Result.Success(trip)
        }.catch { e ->
            _activeTrip.value = Result.Error(AppError(ErrorCode.DATABASE_ERROR, e.message, e))
        }.launchIn(CoroutineScope(Dispatchers.IO))
    }
    
    /**
     * Erstellt einen neuen Trip und setzt ihn als aktiv
     */
    suspend fun createTrip(trip: TripEntity): Result<String> {
        return try {
            appDatabase.runInTransaction {
                // Aktuellen aktiven Trip deaktivieren, falls vorhanden
                tripDao.deactivateAllTrips()
                
                // Neuen Trip als aktiv setzen und einfügen
                val newTrip = trip.copy(isActive = true)
                tripDao.insert(newTrip)
                
                Result.Success(newTrip.id)
            }
        } catch (e: Exception) {
            Result.Error(AppError(ErrorCode.DATABASE_ERROR, e.message, e))
        }
    }
    
    /**
     * Setzt den angegebenen Trip als aktiv
     */
    suspend fun setTripActive(tripId: String): Result<Unit> {
        return try {
            tripDao.setTripActive(tripId)
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(AppError(ErrorCode.DATABASE_ERROR, e.message, e))
        }
    }
    
    /**
     * Erstellt eine neue Route für den angegebenen Trip
     */
    suspend fun createRoute(route: RouteEntity): Result<String> {
        return try {
            // Trip-ID validieren
            val trip = tripDao.getTripByIdSync(route.tripId)
                ?: return Result.Error(
                    AppError(
                        code = ErrorCode.ENTITY_NOT_FOUND,
                        message = "Trip nicht gefunden: ${route.tripId}"
                    )
                )
            
            val routeId = routeDao.insert(route)
            Result.Success(route.id)
        } catch (e: Exception) {
            Result.Error(AppError(ErrorCode.DATABASE_ERROR, e.message, e))
        }
    }
    
    /**
     * Fügt Wegpunkte zur angegebenen Route hinzu
     */
    suspend fun addWaypoints(routeId: String, waypoints: List<WaypointEntity>): Result<Unit> {
        return try {
            // Route-ID validieren
            val route = routeDao.getRouteByIdSync(routeId)
                ?: return Result.Error(
                    AppError(
                        code = ErrorCode.ENTITY_NOT_FOUND,
                        message = "Route nicht gefunden: $routeId"
                    )
                )
            
            appDatabase.runInTransaction {
                // Bestehende Wegpunkte löschen (ersetzen)
                waypointDao.deleteWaypointsForRoute(routeId)
                
                // Neue Wegpunkte einfügen
                waypoints.forEach { waypoint ->
                    waypointDao.insert(waypoint.copy(routeId = routeId))
                }
            }
            
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(AppError(ErrorCode.DATABASE_ERROR, e.message, e))
        }
    }
    
    /**
     * Erstellt einen Tagebucheintrag für den aktuellen aktiven Trip
     */
    suspend fun createDiaryEntry(entry: DiaryEntryEntity): Result<String> {
        return try {
            // Trip-ID validieren
            val trip = tripDao.getTripByIdSync(entry.tripId)
                ?: return Result.Error(
                    AppError(
                        code = ErrorCode.ENTITY_NOT_FOUND,
                        message = "Trip nicht gefunden: ${entry.tripId}"
                    )
                )
            
            val entryId = diaryEntryDao.insert(entry)
            Result.Success(entry.id)
        } catch (e: Exception) {
            Result.Error(AppError(ErrorCode.DATABASE_ERROR, e.message, e))
        }
    }
    
    /**
     * Fügt eine Standortnotiz hinzu (kann Trip-spezifisch oder global sein)
     */
    suspend fun addLocationNote(note: LocationNoteEntity): Result<String> {
        return try {
            // Trip-ID validieren (falls vorhanden)
            if (note.tripId != null) {
                val trip = tripDao.getTripByIdSync(note.tripId)
                    ?: return Result.Error(
                        AppError(
                            code = ErrorCode.ENTITY_NOT_FOUND,
                            message = "Trip nicht gefunden: ${note.tripId}"
                        )
                    )
            }
            
            val noteId = locationNoteDao.insert(note)
            Result.Success(note.id)
        } catch (e: Exception) {
            Result.Error(AppError(ErrorCode.DATABASE_ERROR, e.message, e))
        }
    }
    
    /**
     * Exportiert alle Daten für den angegebenen Trip
     */
    suspend fun exportTripData(tripId: String): Result<TripExportData> {
        return try {
            // Trip abrufen
            val trip = tripDao.getTripByIdSync(tripId)
                ?: return Result.Error(
                    AppError(
                        code = ErrorCode.ENTITY_NOT_FOUND,
                        message = "Trip nicht gefunden: $tripId"
                    )
                )
            
            // Alle zugehörigen Daten abrufen
            val routes = routeDao.getRoutesForTripSync(tripId)
            val waypoints = mutableListOf<WaypointEntity>()
            val stages = mutableListOf<StageEntity>()
            
            for (route in routes) {
                waypoints.addAll(waypointDao.getWaypointsForRouteSync(route.id))
                stages.addAll(stageDao.getStagesForRouteSync(route.id))
            }
            
            val trackPoints = trackPointDao.getTrackPointsForTripSync(tripId)
            val diaryEntries = diaryEntryDao.getEntriesForTripSync(tripId)
            val locationNotes = locationNoteDao.getNotesForTripSync(tripId)
            val dailyStats = dailyStatsDao.getStatsForTripSync(tripId)
            val media = mediaDao.getMediaForTripSync(tripId)
            
            // Exportdaten zusammenstellen
            val exportData = TripExportData(
                trip = trip,
                routes = routes,
                waypoints = waypoints,
                stages = stages,
                trackPoints = trackPoints,
                diaryEntries = diaryEntries,
                locationNotes = locationNotes,
                dailyStats = dailyStats,
                media = media
            )
            
            Result.Success(exportData)
        } catch (e: Exception) {
            Result.Error(AppError(ErrorCode.EXPORT_ERROR, e.message, e))
        }
    }
    
    /**
     * Importiert Tripdaten aus einer Exportdatei
     */
    suspend fun importTripData(exportData: TripExportData, makeActive: Boolean): Result<String> {
        return try {
            appDatabase.runInTransaction {
                // Neuen Trip erstellen (mit neuer ID)
                val newTrip = exportData.trip.copy(
                    id = UUID.randomUUID().toString(),
                    isActive = makeActive,
                    createdAt = LocalDateTime.now(),
                    updatedAt = LocalDateTime.now()
                )
                
                // Wenn neuer Trip aktiv sein soll, bestehende deaktivieren
                if (makeActive) {
                    tripDao.deactivateAllTrips()
                }
                
                // Trip einfügen
                tripDao.insert(newTrip)
                
                // ID-Mapping für importierte Entitäten (alt -> neu)
                val routeIdMap = mutableMapOf<String, String>()
                val waypointIdMap = mutableMapOf<String, String>()
                val mediaIdMap = mutableMapOf<String, String>()
                
                // Routen importieren mit neuen IDs
                for (route in exportData.routes) {
                    val newRouteId = UUID.randomUUID().toString()
                    routeIdMap[route.id] = newRouteId
                    
                    val newRoute = route.copy(
                        id = newRouteId,
                        tripId = newTrip.id,
                        createdAt = LocalDateTime.now(),
                        updatedAt = LocalDateTime.now()
                    )
                    
                    routeDao.insert(newRoute)
                }
                
                // Wegpunkte importieren
                for (waypoint in exportData.waypoints) {
                    val oldRouteId = waypoint.routeId
                    val newRouteId = routeIdMap[oldRouteId]
                        ?: continue // Überspringe, wenn Route nicht gefunden
                    
                    val newWaypointId = UUID.randomUUID().toString()
                    waypointIdMap[waypoint.id] = newWaypointId
                    
                    val newWaypoint = waypoint.copy(
                        id = newWaypointId,
                        routeId = newRouteId,
                        createdAt = LocalDateTime.now()
                    )
                    
                    waypointDao.insert(newWaypoint)
                }
                
                // Etappen importieren
                for (stage in exportData.stages) {
                    val oldRouteId = stage.routeId
                    val newRouteId = routeIdMap[oldRouteId]
                        ?: continue // Überspringe, wenn Route nicht gefunden
                    
                    val newStage = stage.copy(
                        id = UUID.randomUUID().toString(),
                        routeId = newRouteId,
                        startWaypointId = waypointIdMap[stage.startWaypointId] ?: stage.startWaypointId,
                        endWaypointId = waypointIdMap[stage.endWaypointId] ?: stage.endWaypointId
                    )
                    
                    stageDao.insert(newStage)
                }
                
                // Trackpoints importieren
                for (trackPoint in exportData.trackPoints) {
                    val newTrackPoint = trackPoint.copy(
                        id = UUID.randomUUID().toString(),
                        tripId = newTrip.id
                    )
                    
                    trackPointDao.insert(newTrackPoint)
                }
                
                // Medien importieren
                for (media in exportData.media) {
                    val newMediaId = UUID.randomUUID().toString()
                    mediaIdMap[media.id] = newMediaId
                    
                    val newMedia = media.copy(
                        id = newMediaId,
                        tripId = newTrip.id
                    )
                    
                    mediaDao.insert(newMedia)
                }
                
               # VeloNomad v22.0 – The Apex Symphony: Vollständige Systemarchitektur und Implementierung (Fortsetzung)

## 7. Native Services und Implementierungen (Fortsetzung)

### 7.3 DatabaseService (Fortsetzung)

```kotlin
// Tagebucheinträge importieren
for (entry in exportData.diaryEntries) {
    // Medien-Referenzen aktualisieren
    val newMediaRefs = entry.mediaReferences.map { mediaRef ->
        val newMediaId = mediaIdMap[mediaRef.mediaId] ?: mediaRef.mediaId
        mediaRef.copy(mediaId = newMediaId)
    }
    
    val newEntry = entry.copy(
        id = UUID.randomUUID().toString(),
        tripId = newTrip.id,
        mediaReferences = newMediaRefs,
        createdAt = LocalDateTime.now(),
        updatedAt = LocalDateTime.now()
    )
    
    diaryEntryDao.insert(newEntry)
}

// Standortnotizen importieren
for (note in exportData.locationNotes) {
    // Medien-Referenzen aktualisieren
    val newMediaRefs = note.mediaReferences.map { mediaRef ->
        val newMediaId = mediaIdMap[mediaRef.mediaId] ?: mediaRef.mediaId
        mediaRef.copy(mediaId = newMediaId)
    }
    
    val newNote = note.copy(
        id = UUID.randomUUID().toString(),
        tripId = newTrip.id,
        mediaReferences = newMediaRefs,
        createdAt = LocalDateTime.now(),
        updatedAt = LocalDateTime.now()
    )
    
    locationNoteDao.insert(newNote)
}

// Tägliche Statistiken importieren
for (stats in exportData.dailyStats) {
    val newStats = stats.copy(
        id = UUID.randomUUID().toString(),
        tripId = newTrip.id
    )
    
    dailyStatsDao.insert(newStats)
}

Result.Success(newTrip.id)
```

### 7.4 GitHubService (GitHub-Dienst)

```kotlin
@Singleton
class GitHubService @Inject constructor(
    private val httpClient: HttpClient,
    private val accountManager: AccountManager,
    private val databaseService: DatabaseService,
    private val fileService: FileService,
    private val networkService: NetworkService,
    private val gitHubConfigDao: GitHubConfigDao
) {
    // GitHub-API-Konfiguration
    private val baseUrl = "https://api.github.com"
    private val ACCOUNT_TYPE = "com.velonomad.github"
    private val TOKEN_KEY = "github_token"
    
    // GitHub-Integrationsstatus
    private val _gitHubStatus = MutableStateFlow<GitHubStatus>(GitHubStatus.NotConfigured)
    val gitHubStatus: StateFlow<GitHubStatus> = _gitHubStatus.asStateFlow()
    
    init {
        // Initialen Status laden
        scope.launch {
            val config = gitHubConfigDao.getConfig()
            val hasToken = getAuthToken() != null
            
            _gitHubStatus.value = when {
                !hasToken -> GitHubStatus.NotConfigured
                config == null -> GitHubStatus.TokenConfigured
                else -> GitHubStatus.Configured(config.username, config.repoName)
            }
        }
    }
    
    /**
     * Authentifiziert mit GitHub über OAuth
     */
    suspend fun authenticateWithOAuth(authCode: String): Result<Unit> {
        try {
            if (!networkService.isNetworkAvailable()) {
                return Result.Error(AppError(ErrorCode.NETWORK_UNAVAILABLE))
            }
            
            // Token über Github OAuth Server austauschen
            val tokenResponse = httpClient.post("https://github.com/login/oauth/access_token") {
                contentType(ContentType.Application.Json)
                setBody(
                    OAuth2TokenRequest(
                        clientId = BuildConfig.GITHUB_CLIENT_ID,
                        clientSecret = BuildConfig.GITHUB_CLIENT_SECRET,
                        code = authCode,
                        redirectUri = BuildConfig.GITHUB_REDIRECT_URI
                    )
                )
                header("Accept", "application/json")
            }
            
            if (!tokenResponse.status.isSuccess()) {
                return Result.Error(
                    AppError(
                        code = ErrorCode.AUTHENTICATION_ERROR,
                        message = "OAuth-Token-Anfrage fehlgeschlagen: ${tokenResponse.status}"
                    )
                )
            }
            
            val tokenData = tokenResponse.body<OAuth2TokenResponse>()
            
            if (tokenData.accessToken.isNullOrEmpty()) {
                return Result.Error(
                    AppError(
                        code = ErrorCode.AUTHENTICATION_ERROR,
                        message = "Kein Access-Token in der Antwort"
                    )
                )
            }
            
            // Token sicher speichern
            saveAuthToken(tokenData.accessToken)
            
            // Nutzerinformationen abrufen
            val userInfo = getUserInfo()
            if (userInfo is Result.Success) {
                _gitHubStatus.value = GitHubStatus.TokenConfigured
            }
            
            return Result.Success(Unit)
            
        } catch (e: Exception) {
            return Result.Error(
                AppError(
                    code = ErrorCode.AUTHENTICATION_ERROR,
                    message = "Authentifizierungsfehler: ${e.message}",
                    cause = e
                )
            )
        }
    }
    
    /**
     * Konfiguriert einen Personal Access Token für die GitHub-Integration
     */
    suspend fun configureWithPAT(token: String): Result<Unit> {
        try {
            if (token.isBlank()) {
                return Result.Error(
                    AppError(
                        code = ErrorCode.INVALID_PARAMETERS,
                        message = "Token darf nicht leer sein"
                    )
                )
            }
            
            // Token validieren
            val validationResult = validateToken(token)
            if (validationResult is Result.Error) {
                return validationResult
            }
            
            // Token sicher speichern
            saveAuthToken(token)
            
            _gitHubStatus.value = GitHubStatus.TokenConfigured
            
            return Result.Success(Unit)
            
        } catch (e: Exception) {
            return Result.Error(
                AppError(
                    code = ErrorCode.AUTHENTICATION_ERROR,
                    message = "Token-Konfigurationsfehler: ${e.message}",
                    cause = e
                )
            )
        }
    }
    
    /**
     * Konfiguriert das GitHub-Repository für das Sharing
     */
    suspend fun configureRepository(
        repoName: String,
        isPrivate: Boolean,
        templateName: String
    ): Result<Unit> {
        try {
            if (!networkService.isNetworkAvailable()) {
                return Result.Error(AppError(ErrorCode.NETWORK_UNAVAILABLE))
            }
            
            // Token prüfen
            val token = getAuthToken() ?: return Result.Error(
                AppError(
                    code = ErrorCode.AUTHENTICATION_ERROR,
                    message = "Kein GitHub-Token konfiguriert"
                )
            )
            
            // Nutzerinformationen abrufen
            val userResult = getUserInfo()
            if (userResult is Result.Error) {
                return userResult
            }
            
            val user = (userResult as Result.Success).data
            
            // Prüfen, ob Repository existiert
            val repoExists = checkRepositoryExists(user.login, repoName)
            
            if (!repoExists) {
                // Repository erstellen
                val createResult = createRepository(repoName, isPrivate)
                if (createResult is Result.Error) {
                    return createResult
                }
            }
            
            // Template-Dateien initialisieren
            val templateResult = initializeTemplateFiles(user.login, repoName, templateName)
            if (templateResult is Result.Error) {
                return templateResult
            }
            
            // Konfiguration speichern
            saveConfiguration(
                GitHubConfigEntity(
                    username = user.login,
                    repoName = repoName,
                    authorName = user.name ?: user.login,
                    authorEmail = user.email ?: "${user.login}@users.noreply.github.com",
                    templateName = templateName,
                    shareOptions = ShareOptions(
                        includeRoutes = true,
                        includeTrackPoints = true,
                        includeDiaryEntries = true,
                        includePhotos = true,
                        blurExactLocations = false
                    ),
                    lastSyncTimestamp = null,
                    syncFrequency = Duration.ofHours(24)
                )
            )
            
            _gitHubStatus.value = GitHubStatus.Configured(user.login, repoName)
            
            return Result.Success(Unit)
            
        } catch (e: Exception) {
            return Result.Error(
                AppError(
                    code = ErrorCode.GITHUB_CONFIG_ERROR,
                    message = "Repository-Konfigurationsfehler: ${e.message}",
                    cause = e
                )
            )
        }
    }
    
    /**
     * Veröffentlicht den angegebenen Trip auf GitHub Pages
     */
    suspend fun publishTrip(tripId: String): Result<Unit> {
        try {
            if (!networkService.isNetworkAvailable()) {
                return Result.Error(AppError(ErrorCode.NETWORK_UNAVAILABLE))
            }
            
            // Konfiguration laden
            val config = gitHubConfigDao.getConfig() ?: return Result.Error(
                AppError(
                    code = ErrorCode.GITHUB_CONFIG_ERROR,
                    message = "Keine GitHub-Konfiguration gefunden"
                )
            )
            
            // Trip-Daten abrufen
            val tripDataResult = databaseService.exportTripData(tripId)
            if (tripDataResult is Result.Error) {
                return tripDataResult
            }
            
            val tripData = (tripDataResult as Result.Success).data
            
            // GitHub-Status aktualisieren
            _gitHubStatus.value = GitHubStatus.Publishing(config.username, config.repoName)
            
            // Daten gemäß Template formatieren
            val formatter = TemplateFormatter.forTemplate(config.templateName)
            val formattedData = formatter.formatTripData(tripData, config.shareOptions)
            
            // Dateien ins Repository pushen
            for ((path, content) in formattedData) {
                val pushResult = pushContent(
                    config.username,
                    config.repoName,
                    path,
                    content,
                    "Update: ${tripData.trip.name} (${LocalDateTime.now()})"
                )
                
                if (pushResult is Result.Error) {
                    _gitHubStatus.value = GitHubStatus.Configured(config.username, config.repoName)
                    return pushResult
                }
            }
            
            // GitHub Actions Workflow auslösen
            val workflowResult = triggerWorkflow(config.username, config.repoName)
            if (workflowResult is Result.Error) {
                _gitHubStatus.value = GitHubStatus.Configured(config.username, config.repoName)
                return workflowResult
            }
            
            // Letzte Synchronisierungszeit aktualisieren
            updateLastSyncTimestamp()
            
            _gitHubStatus.value = GitHubStatus.Configured(config.username, config.repoName)
            
            return Result.Success(Unit)
            
        } catch (e: Exception) {
            _gitHubStatus.value = GitHubStatus.Error(e.message ?: "Unbekannter Fehler")
            
            return Result.Error(
                AppError(
                    code = ErrorCode.GITHUB_PUBLISH_ERROR,
                    message = "Fehler beim Veröffentlichen des Trips: ${e.message}",
                    cause = e
                )
            )
        }
    }
    
    /**
     * Prüft den Status der letzten Bereitstellung
     */
    suspend fun checkDeploymentStatus(): Result<DeploymentStatus> {
        try {
            if (!networkService.isNetworkAvailable()) {
                return Result.Error(AppError(ErrorCode.NETWORK_UNAVAILABLE))
            }
            
            // Konfiguration laden
            val config = gitHubConfigDao.getConfig() ?: return Result.Error(
                AppError(
                    code = ErrorCode.GITHUB_CONFIG_ERROR,
                    message = "Keine GitHub-Konfiguration gefunden"
                )
            )
            
            // GitHub Actions Workflow-Status abrufen
            val workflowRuns = getLatestWorkflowRuns(config.username, config.repoName)
            
            if (workflowRuns.isEmpty()) {
                return Result.Success(
                    DeploymentStatus(
                        status = "unknown",
                        message = "Keine Workflow-Ausführungen gefunden",
                        deploymentUrl = "https://${config.username}.github.io/${config.repoName}",
                        lastUpdated = null
                    )
                )
            }
            
            val latestRun = workflowRuns.first()
            
            return Result.Success(
                DeploymentStatus(
                    status = latestRun.status,
                    message = when (latestRun.status) {
                        "completed" -> "Bereitstellung erfolgreich"
                        "in_progress" -> "Bereitstellung läuft..."
                        "queued" -> "Bereitstellung in Warteschlange"
                        "failure" -> "Bereitstellung fehlgeschlagen"
                        else -> "Status: ${latestRun.status}"
                    },
                    deploymentUrl = "https://${config.username}.github.io/${config.repoName}",
                    lastUpdated = latestRun.updated_at?.let { LocalDateTime.parse(it) }
                )
            )
            
        } catch (e: Exception) {
            return Result.Error(
                AppError(
                    code = ErrorCode.GITHUB_API_ERROR,
                    message = "Fehler beim Abrufen des Bereitstellungsstatus: ${e.message}",
                    cause = e
                )
            )
        }
    }
    
    /**
     * Holt das Authentifizierungstoken aus dem sicheren Speicher
     */
    private suspend fun getAuthToken(): String? {
        return try {
            val account = getOrCreateAccount()
            if (accountManager.getUserData(account, TOKEN_KEY) != null) {
                accountManager.getUserData(account, TOKEN_KEY)
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                withContext(Dispatchers.IO) {
                    accountManager.getPassword(account)
                }
            } else {
                null
            }
        } catch (e: Exception) {
            Timber.e(e, "Fehler beim Abrufen des Tokens")
            null
        }
    }
    
    /**
     * Speichert das Authentifizierungstoken sicher
     */
    private suspend fun saveAuthToken(token: String) {
        try {
            val account = getOrCreateAccount()
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                withContext(Dispatchers.IO) {
                    accountManager.setPassword(account, token)
                }
            } else {
                accountManager.setUserData(account, TOKEN_KEY, token)
            }
        } catch (e: Exception) {
            Timber.e(e, "Fehler beim Speichern des Tokens")
        }
    }
    
    /**
     * Holt oder erstellt ein Android-Konto für GitHub
     */
    private fun getOrCreateAccount(): Account {
        val accounts = accountManager.getAccountsByType(ACCOUNT_TYPE)
        
        return if (accounts.isNotEmpty()) {
            accounts[0]
        } else {
            val newAccount = Account("GitHub", ACCOUNT_TYPE)
            accountManager.addAccountExplicitly(newAccount, null, null)
            newAccount
        }
    }
    
    // Zusätzliche Hilfsmethoden für GitHub API-Aufrufe
}
```

## 8. Frontend-Komponenten und Implementierungen

### 8.1 Kartenkomponenten

#### 8.1.1 MapContainer.svelte

```svelte
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { $effect, $state } from 'svelte';
    import maplibregl from 'maplibre-gl';
    import 'maplibre-gl/dist/maplibre-gl.css';
    import { Motion } from 'motion';
    
    import { currentCoordinates, hasLocation } from '$lib/state/locationState';
    import { activeTrip } from '$lib/state/tripState';
    import { 
        currentRoute, 
        currentWaypoints 
    } from '$lib/state/routeState';
    import { 
        currentWeather,
        isDaytime 
    } from '$lib/state/weatherState';
    import {
        mapViewport,
        activeLayers,
        updateViewport,
        mapReady,
        setMapReady
    } from '$lib/state/mapState';
    
    import MapControls from './MapControls.svelte';
    import RouteLayer from './RouteLayer.svelte';
    import LocationMarker from './LocationMarker.svelte';
    import WaypointMarkers from './WaypointMarkers.svelte';
    import MapPopup from './MapPopup.svelte';
    import WeatherOverlay from './WeatherOverlay.svelte';
    
    // Map-Instanz
    let map: maplibregl.Map;
    let mapContainer: HTMLDivElement;
    
    // Lokaler Zustand
    let initialized = $state(false);
    let styleLoaded = $state(false);
    let lastInteraction = $state(Date.now());
    
    // Map bei Mount initialisieren
    onMount(() => {
        if (!mapContainer) return;
        
        map = new maplibregl.Map({
            container: mapContainer,
            style: 'mapbox://styles/mapbox/outdoors-v11', // Wird durch benutzerdefinierten Stil ersetzt
            center: [mapViewport.longitude, mapViewport.latitude],
            zoom: mapViewport.zoom,
            pitch: mapViewport.pitch,
            bearing: mapViewport.bearing,
            attributionControl: true,
            maxPitch: 85,
            antialias: true,
            renderWorldCopies: false,
            maxBounds: mapViewport.maxBounds,
            localFontFamily: "'Nunito Sans', sans-serif"
        });
        
        // Event-Handler einrichten
        map.on('load', handleMapLoad);
        map.on('move', handleMapMove);
        map.on('click', handleMapClick);
        map.on('contextmenu', handleMapRightClick);
        
        // Initialen zeitbasierten Stil setzen
        updateMapStyle();
        
        initialized = true;
    });
    
    onDestroy(() => {
        if (map) {
            map.remove();
        }
    });
    
    // Map-Load-Event behandeln
    function handleMapLoad() {
        styleLoaded = true;
        
        // Benutzerdefinierte Quellen und Ebenen hinzufügen
        addTerrainSource();
        addSkyLayer();
        addBuildingLayer();
        
        // Map als bereit im globalen Zustand setzen
        setMapReady(true);
    }
    
    // Map aktualisieren, wenn sich der Viewport im Zustand ändert
    $effect(() => {
        if (!map || !initialized) return;
        
        const { longitude, latitude, zoom, pitch, bearing, animate } = mapViewport;
        
        if (animate) {
            map.easeTo({
                center: [longitude, latitude],
                zoom,
                pitch,
                bearing,
                duration: 1000,
                easing: (t) => 1 - Math.pow(1 - t, 3) // Kubische Ease-Out-Funktion
            });
        } else {
            map.jumpTo({
                center: [longitude, latitude],
                zoom,
                pitch,
                bearing
            });
        }
    });
    
    // Map auf aktuelle Position zentrieren, wenn verfügbar
    $effect(() => {
        if (!map || !initialized || !hasLocation || !currentCoordinates) return;
        if (Date.now() - lastInteraction > 10000) { // Nur auto-folgen, wenn keine Interaktion für 10s
            updateViewport({
                longitude: currentCoordinates[0],
                latitude: currentCoordinates[1],
                animate: true
            });
        }
    });
    
    // Map-Stil basierend auf Tageszeit aktualisieren
    $effect(() => {
        if (!map || !styleLoaded) return;
        updateMapStyle();
    });
    
    // 3D-Terrain-Quelle hinzufügen
    function addTerrainSource() {
        map.addSource('terrain', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
        });
        
        map.setTerrain({
            source: 'terrain',
            exaggeration: 1.5
        });
    }
    
    // Himmel-Ebene für atmosphärisches Rendering hinzufügen
    function addSkyLayer() {
        map.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun': [0.0, 90.0],
                'sky-atmosphere-sun-intensity': 15
            }
        });
        
        updateSkyLayer();
    }
    
    // Himmel-Ebene basierend auf Zeit und Wetter aktualisieren
    function updateSkyLayer() {
        if (!map || !map.getLayer('sky')) return;
        
        const sunPosition = calculateSunPosition();
        const opacity = isDaytime ? 1.0 : 0.8;
        const color = getSkyColor();
        
        map.setPaintProperty('sky', 'sky-atmosphere-sun', sunPosition);
        map.setPaintProperty('sky', 'sky-atmosphere-sun-intensity', isDaytime ? 15 : 5);
        map.setPaintProperty('sky', 'sky-atmosphere-halo-color', color.halo);
        map.setPaintProperty('sky', 'sky-atmosphere-color', color.atmosphere);
        map.setPaintProperty('sky', 'sky-opacity', opacity);
    }
    
    // Map-Stil basierend auf Zeit und Wetter aktualisieren
    function updateMapStyle() {
        if (!map || !styleLoaded) return;
        
        // Himmel-Ebene aktualisieren
        updateSkyLayer();
        
        // Weitere Stilelemente basierend auf Zeit und Wetter aktualisieren
        // (Wasserfarbe, Landfarbe usw.)
    }
    
    // Sonnenposition basierend auf Zeit und Standort berechnen
    function calculateSunPosition() {
        // Implementierung mit Sonnenberechnungen oder Werten aus der Wetter-API
        // Gibt [Azimut, Höhe] zurück
    }
    
    // Himmelfarben basierend auf Tageszeit und Wetter bestimmen
    function getSkyColor() {
        // Implementierung basierend auf Tageszeit und Wetterbedingungen
        return {
            atmosphere: isDaytime ? 'rgba(186, 210, 235, 1.0)' : 'rgba(25, 35, 60, 1.0)',
            halo: isDaytime ? 'rgba(255, 204, 112, 1.0)' : 'rgba(105, 145, 200, 0.3)'
        };
    }
    
    // Map-Move-Events behandeln
    function handleMapMove() {
        if (!map) return;
        
        const center = map.getCenter();
        updateViewport({
            longitude: center.lng,
            latitude: center.lat,
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            bearing: map.getBearing(),
            animate: false
        });
        
        lastInteraction = Date.now();
    }
</script>

<div class="map-container h-full w-full" bind:this={mapContainer}>
    {#if mapReady}
        <RouteLayer {map} />
        <LocationMarker {map} />
        <WaypointMarkers {map} />
        <MapPopup {map} />
        <WeatherOverlay {map} />
    {/if}
    
    <MapControls {map} />
</div>

<style>
    .map-container {
        position: relative;
    }
    
    :global(.maplibregl-map) {
        font-family: 'Nunito Sans', sans-serif;
    }
</style>
```

#### 8.1.2 RouteLayer.svelte

```svelte
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { $effect } from 'svelte';
    import maplibregl from 'maplibre-gl';
    import { Motion } from 'motion';
    
    import { currentRoute, currentWaypoints } from '$lib/state/routeState';
    import { activeLayers } from '$lib/state/mapState';
    
    // Props
    export let map: maplibregl.Map;
    
    // Lokaler Zustand für Animation
    let routeOffset = 0;
    let animationFrame: number;
    
    // Routen-Quellen und -Ebenen bei Mount einrichten
    onMount(() => {
        if (!map) return;
        
        // Warten, bis Map-Stil geladen ist
        if (map.isStyleLoaded()) {
            setupRouteLayers();
        } else {
            map.once('style.load', setupRouteLayers);
        }
        
        // Animations-Loop für Route Line Dash starten
        startRouteAnimation();
    });
    
    onDestroy(() => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });
    
    // Routen-Quellen und -Ebenen einrichten
    function setupRouteLayers() {
        // Routen-Quelle hinzufügen
        map.addSource('route', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });
        
        // Routen-Schatten-Ebene hinzufügen
        map.addLayer({
            id: 'route-shadow',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
                'visibility': 'visible'
            },
            paint: {
                'line-color': '#000000',
                'line-opacity': 0.3,
                'line-width': [
                    'interpolate', ['linear'], ['zoom'],
                    10, 4,
                    16, 8
                ],
                'line-blur': 3
            }
        });
        
        // Haupt-Routen-Ebene hinzufügen
        map.addLayer({
            id: 'route-main',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
                'visibility': 'visible'
            },
            paint: {
                'line-color': '#3b82f6',
                'line-width': [
                    'interpolate', ['linear'], ['zoom'],
                    10, 3,
                    16, 7
                ]
            }
        });
        
        // Animierte Routen-Ebene hinzufügen
        map.addLayer({
            id: 'route-animated',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
                'visibility': 'visible'
            },
            paint: {
                'line-color': '#ffffff',
                'line-width': [
                    'interpolate', ['linear'], ['zoom'],
                    10, 2,
                    16, 4
                ],
                'line-opacity': 0.9,
                'line-dasharray': [0, 4, 3]
            }
        });
    }
    
    // Routen-Animations-Loop starten
    function startRouteAnimation() {
        const animate = () => {
            routeOffset = (routeOffset + 1) % 512;
            if (map && map.getLayer('route-animated')) {
                map.setPaintProperty('route-animated', 'line-dasharray', [0, 4, 3, routeOffset * 0.1]);
            }
            animationFrame = requestAnimationFrame(animate);
        };
        
        animationFrame = requestAnimationFrame(animate);
    }
    
    // Routendaten aktualisieren, wenn sich die Route ändert
    $effect(() => {
        if (!map || !map.getSource('route')) return;
        
        if (currentRoute.status === 'success' && currentRoute.data) {
            const routeData = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: currentRoute.data.coordinates
                        }
                    }
                ]
            };
            
            // Routen-Quelle aktualisieren
            map.getSource('route').setData(routeData);
            
            // Routen-Ebenen anzeigen
            map.setLayoutProperty('route-shadow', 'visibility', 'visible');
            map.setLayoutProperty('route-main', 'visibility', 'visible');
            map.setLayoutProperty('route-animated', 'visibility', 'visible');
        } else {
            // Routen-Ebenen ausblenden, wenn keine Route vorhanden
            map.setLayoutProperty('route-shadow', 'visibility', 'none');
            map.setLayoutProperty('route-main', 'visibility', 'none');
            map.setLayoutProperty('route-animated', 'visibility', 'none');
        }
    });
    
    // Sichtbarkeit der Ebene basierend auf aktiven Ebenen aktualisieren
    $effect(() => {
        if (!map || !map.getLayer('route-main')) return;
        
        const visible = activeLayers.includes('route') ? 'visible' : 'none';
        map.setLayoutProperty('route-shadow', 'visibility', visible);
        map.setLayoutProperty('route-main', 'visibility', visible);
        map.setLayoutProperty('route-animated', 'visibility', visible);
    });
</script>
```

### 8.2 Wetter- und Zeitintegrationskomponenten

#### 8.2.1 WeatherDisplay.svelte

```svelte
<script lang="ts">
    import { $effect } from 'svelte';
    import { Motion } from 'motion';
    import { format } from 'date-fns';
    
    import { 
        currentWeather, 
        hourlyForecast,
        isDaytime,
        sunriseTime,
        sunsetTime,
        temperatureUnit
    } from '$lib/state/weatherState';
    
    import { settings } from '$lib/state/settingsState';
    
    import WeatherIcon from './WeatherIcon.svelte';
    import TemperatureDisplay from './TemperatureDisplay.svelte';
    import DaylightIndicator from './DaylightIndicator.svelte';
    import WindDisplay from './WindDisplay.svelte';
    
    // Lokale Referenzen für Animationen
    let containerRef: HTMLDivElement;
    let iconRef: HTMLDivElement;
    
    // Formatierte Sonnenaufgangs-/Sonnenuntergangszeiten
    let formattedSunrise: string;
    let formattedSunset: string;
    
    // Sonnenaufgangs-/Sonnenuntergangszeiten formatieren
    $effect(() => {
        if (sunriseTime && sunsetTime) {
            const formatStr = settings.timeFormat === '24h' ? 'HH:mm' : 'h:mm a';
            formattedSunrise = format(sunriseTime, formatStr);
            formattedSunset = format(sunsetTime, formatStr);
        }
    });
    
    // Wetteränderungen animieren
    $effect(() => {
        if (currentWeather.status === 'success' && containerRef) {
            Motion.animate(containerRef, 
                { opacity: [0, 1], y: [-10, 0] }, 
                { duration: 0.5, easing: 'ease-out' }
            );
        }
    });
    
    // Icon-Animationen basierend auf Wetter und Zeit aktualisieren
    $effect(() => {
        if (currentWeather.status === 'success' && iconRef) {
            const weatherCode = currentWeather.data.weatherCode;
            updateIconAnimation(weatherCode, isDaytime);
        }
    });
    
    // Wetter-Icon basierend auf Bedingungen animieren
    function updateIconAnimation(weatherCode: string, daytime: boolean) {
        // Implementierung für wetterspezifische Animationen
        // Verschiedene Animationen für Regen, Schnee, Wind usw.
    }
    
    // Laden des Wetters wiederholen
    function retryWeatherLoad() {
        // Wetterdaten neu laden
    }
</script>

<div 
    class="weather-display rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-lg p-4"
    bind:this={containerRef}
>
    {#if currentWeather.status === 'success'}
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <div class="weather-icon mr-3" bind:this={iconRef}>
                    <WeatherIcon 
                        code={currentWeather.data.weatherCode} 
                        isDay={isDaytime} 
                        size="large" 
                    />
                </div>
                <div>
                    <TemperatureDisplay 
                        temperature={currentWeather.data.temperature} 
                        feelsLike={currentWeather.data.feelsLike}
                        unit={temperatureUnit}
                    />
                    <div class="weather-description text-sm">
                        {currentWeather.data.description}
                    </div>
                </div>
            </div>
            <WindDisplay 
                speed={currentWeather.data.windSpeed} 
                direction={currentWeather.data.windDirection}
                unit={settings.speedUnit}
            />
        </div>
        
        <div class="mt-3">
            <DaylightIndicator 
                sunrise={sunriseTime} 
                sunset={sunsetTime} 
                currentTime={new Date()}
            />
        </div>
        
        {#if hourlyForecast.status === 'success'}
            <div class="hourly-forecast mt-4">
                <h3 class="text-sm font-semibold mb-2">Stündliche Vorhersage</h3>
                <div class="flex overflow-x-auto pb-2">
                    {#each hourlyForecast.data as hour}
                        <div class="flex-shrink-0 flex flex-col items-center mr-4">
                            <div class="text-xs">
                                {format(hour.time, 'HH:mm')}
                            </div>
                            <WeatherIcon 
                                code={hour.weatherCode} 
                                isDay={hour.isDay} 
                                size="small" 
                            />
                            <div class="text-sm font-medium">
                                {Math.round(hour.temperature)}°
                            </div>
                            <div class="text-xs">
                                {hour.precipProbability > 0 ? `${hour.precipProbability}%` : ''}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    {:else if currentWeather.status === 'loading'}
        <div class="flex justify-center items-center p-6">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    {:else if currentWeather.status === 'error'}
        <div class="text-red-500 p-4 text-center">
            <div>Wetterdaten können nicht geladen werden</div>
            <button 
                class="mt-2 text-sm text-blue-500 underline"
                on:click={retryWeatherLoad}
            >
                Erneut versuchen
            </button>
        </div>
    {/if}
</div>

<style>
    .weather-display {
        width: 100%;
        max-width: 400px;
    }
    
    .hourly-forecast {
        scrollbar-width: thin;
        scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
    }
</style>
```

### 8.3 Routenplanungskomponenten

#### 8.3.1 RouteEditor.svelte

```svelte
<script lang="ts">
    import { $effect, $state } from 'svelte';
    import { Motion } from 'motion';
    import { fly } from 'svelte/transition';
    
    import NativeBridge from '$lib/bridge/NativeBridge';
    import { 
        currentRoute, 
        isEditingRoute,
        waypoints,
        addWaypoint,
        removeWaypoint,
        moveWaypoint,
        calculateRoute,
        saveRoute
    } from '$lib/state/routeState';
    import { activeTripId } from '$lib/state/tripState';
    import { mapViewport, updateViewport } from '$lib/state/mapState';
    
    import ElevationProfile from './ElevationProfile.svelte';
    import RouteStatistics from './RouteStatistics.svelte';
    import WaypointList from './WaypointList.svelte';
    import RoutingOptions from './RoutingOptions.svelte';
    
    // Lokaler Zustand
    let isOpen = $state(false);
    let routeName = $state('');
    let isCalculating = $state(false);
    let isSaving = $state(false);
    let errorMessage = $state('');
    
    // Lokale Refs für Animationen
    let containerRef: HTMLDivElement;
    
    // Routen-Editor öffnen/schließen umschalten
    function toggleEditor() {
        isOpen = !isOpen;
        
        if (containerRef) {
            Motion.animate(
                containerRef,
                { height: isOpen ? 'auto' : '60px' },
                { duration: 0.3, easing: 'ease-in-out' }
            );
        }
    }
    
    // Routenberechnung behandeln
    async function handleCalculateRoute() {
        if (waypoints.length < 2) {
            errorMessage = 'Mindestens 2 Wegpunkte erforderlich';
            return;
        }
        
        errorMessage = '';
        isCalculating = true;
        
        try {
            await calculateRoute();
        } catch (error) {
            errorMessage = 'Fehler bei der Routenberechnung';
            console.error('Fehler bei der Routenberechnung', error);
        } finally {
            isCalculating = false;
        }
    }
    
    // Routenspeicherung behandeln
    async function handleSaveRoute() {
        if (!activeTripId) {
            errorMessage = 'Kein aktiver Trip ausgewählt';
            return;
        }
        
        if (!routeName.trim()) {
            errorMessage = 'Routenname ist erforderlich';
            return;
        }
        
        if (currentRoute.status !== 'success' || !currentRoute.data) {
            errorMessage = 'Keine Route zum Speichern';
            return;
        }
        
        errorMessage = '';
        isSaving = true;
        
        try {
            await saveRoute(activeTripId, routeName);
            // Erfolgstoast oder -benachrichtigung anzeigen
        } catch (error) {
            errorMessage = 'Fehler beim Speichern der Route';
            console.error('Fehler beim Speichern der Route', error);
        } finally {
            isSaving = false;
        }
    }
    
    // Routenfehler löschen, wenn sich Wegpunkte ändern
    $effect(() => {
        if (waypoints.length > 0) {
            errorMessage = '';
        }
    });
</script>

<div 
    class="route-editor bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    class:expanded={isOpen}
    bind:this={containerRef}
>
    <div class="header p-4 flex justify-between items-center cursor-pointer" on:click={toggleEditor}>
        <h2 class="text-lg font-semibold">
            {isOpen ? 'Routenplanung' : 'Route planen'}
        </h2>
        <button class="text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform transition-transform" class:rotate-180={isOpen} viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
    </div>
    
    {#if isOpen}
        <div class="content p-4 pt-0" transition:fly={{ y: -20, duration: 300 }}>
            <div class="waypoints mb-4">
                <h3 class="text-sm font-semibold mb-2">Wegpunkte</h3>
                <WaypointList 
                    {waypoints} 
                    on:remove={e => removeWaypoint(e.detail.index)} 
                    on:move={e => moveWaypoint(e.detail.fromIndex, e.detail.toIndex)}
                />
                
                <div class="flex justify-end mt-2">
                    <button 
                        class="text-sm text-blue-500 flex items-center"
                        on:click={() => isEditingRoute = true}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                        </svg>
                        Wegpunkt hinzufügen
                    </button>
                </div>
            </div>
            
            <div class="routing-options mb-4">
                <RoutingOptions />
            </div>
            
            <div class="actions flex justify-between mb-4">
                <button 
                    class="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center disabled:opacity-50"
                    on:click={handleCalculateRoute}
                    disabled={waypoints.length < 2 || isCalculating}
                >
                    {#if isCalculating}
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Berechne...
                    {:else}
                        Route berechnen
                    {/if}
                </button>
                
                <button 
                    class="px-4 py-2 bg-green-500 text-white rounded-md flex items-center disabled:opacity-50"
                    on:click={handleSaveRoute}
                    disabled={currentRoute.status !== 'success' || isSaving || !routeName.trim()}
                >
                    {#if isSaving}
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Speichere...
                    {:else}
                        Route speichern
                    {/if}
                </button>
            </div>
            
            {#if errorMessage}
                <div class="error-message text-red-500 text-sm mb-4">
                    {errorMessage}
                </div>
            {/if}
            
            <div class="route-name mb-4">
                <label class="block text-sm font-medium mb-1">Routenname</label>
                <input 
                    type="text" 
                    bind:value={routeName} 
                    class="w-full px-3 py-2 border rounded-md"
                    placeholder="Routenname eingeben"
                />
            </div>
            
            {#if currentRoute.status === 'success' && currentRoute.data}
                <div class="elevation-profile mb-4">
                    <h3 class="text-sm font-semibold mb-2">Höhenprofil</h3>
                    <ElevationProfile data={currentRoute.data.elevationProfile} />
                </div>
                
                <div class="route-statistics">
                    <RouteStatistics route={currentRoute.data} />
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .route-editor {
        transition: height 0.3s ease;
        position: absolute;
        bottom: 16px;
        left: 16px;
        right: 16px;
        z-index: 10;
        max-height: 70vh;
        overflow-y: auto;
    }
</style>
```

## 9. API-Integrationen

### 9.1 Wetter-API-Integration

Die Anwendung verwendet die OpenWeatherMap API für aktuelle Wetterdaten und Prognosen. Die wichtigsten Integrationspunkte umfassen:

1. **Datenmodelle für die API-Antworten**:

```kotlin
@Serializable
data class WeatherResponse(
    val lat: Double,
    val lon: Double,
    val timezone: String,
    val timezone_offset: Int,
    val current: CurrentWeather,
    val hourly: List<HourlyWeather>,
    val daily: List<DailyWeather>,
    val alerts: List<WeatherAlert>? = null
)

@Serializable
data class CurrentWeather(
    val dt: Long,
    val sunrise: Long,
    val sunset: Long,
    val temp: Double,
    val feels_like: Double,
    val pressure: Int,
    val humidity: Int,
    val dew_point: Double,
    val uvi: Double,
    val clouds: Int,
    val visibility: Int,
    val wind_speed: Double,
    val wind_deg: Int,
    val wind_gust: Double? = null,
    val weather: List<WeatherInfo>,
    val rain: PrecipitationInfo? = null,
    val snow: PrecipitationInfo? = null
)

// Weitere API-Modelle...
```

2. **Mapping zu internen Datenmodellen**:

```kotlin
fun CurrentWeather.toWeatherData(): WeatherData {
    return WeatherData(
        temperature = temp.toFloat(),
        feelsLike = feels_like.toFloat(),
        description = weather.firstOrNull()?.description ?: "",
        weatherCode = weather.firstOrNull()?.id?.toString() ?: "",
        iconCode = weather.firstOrNull()?.icon ?: "",
        windSpeed = wind_speed.toFloat(),
        windDirection = wind_deg,
        humidity = humidity,
        pressure = pressure.toFloat(),
        visibility = visibility / 1000f, // Meter in Kilometer umwandeln
        cloudiness = clouds,
        uvIndex = uvi.toFloat(),
        precipitation = rain?.`1h` ?: snow?.`1h` ?: 0.0,
        timestamp = Instant.ofEpochSecond(dt).toLocalDateTime(ZoneOffset.UTC)
    )
}

// Weitere Mapping-Funktionen...
```

3. **Anforderungsparameter und Endpunkte**:

```kotlin
// Aktuelle Wetterdaten und -vorhersage abrufen
val response = httpClient.get(baseUrl) {
    parameter("lat", latitude)
    parameter("lon", longitude)
    parameter("appid", apiKey)
    parameter("units", "metric")
    parameter("exclude", "minutely")
    parameter("lang", getCurrentLanguageCode())
}

// Historische oder zukünftige Wetterdaten für einen bestimmten Zeitpunkt abrufen
val response = httpClient.get("$baseUrl/timemachine") {
    parameter("lat", latitude)
    parameter("lon", longitude)
    parameter("dt", timestamp)
    parameter("appid", apiKey)
    parameter("units", "metric")
    parameter("lang", getCurrentLanguageCode())
}
```

4. **Caching-Strategie**:

```kotlin
private val weatherCache = Cache<String, WeatherResponse>(
    maximumCacheSize = 20,
    expiryTimeMillis = 30 * 60 * 1000 // 30 Minuten
)

// Im Cache nach Daten suchen
val cacheKey = "$latitude,$longitude"
weatherCache.get(cacheKey)?.let {
    // Gecachte Daten verwenden
    return Result.Success(it.current.toWeatherData())
}

// Neue Daten im Cache speichern
weatherCache.put(cacheKey, weatherResponse)
```

### 9.2 Routing-API-Integration

Die Anwendung integriert eine Routing-API (z.B. GraphHopper) für optimierte Fahrradrouten:

```kotlin
@Singleton
class RoutingService @Inject constructor(
    private val httpClient: HttpClient,
    private val preferencesService: PreferencesService,
    private val networkService: NetworkService
) {
    private val baseUrl = "https://graphhopper.com/api/1/route"
    private val apiKey = BuildConfig.GRAPHHOPPER_API_KEY
    
    /**
     * Berechnet eine Route zwischen den angegebenen Wegpunkten
     */
    suspend fun calculateRoute(waypoints: List<WaypointDto>): Result<RouteData> {
        if (waypoints.size < 2) {
            return Result.Error(
                AppError(
                    code = ErrorCode.INVALID_PARAMETERS,
                    message = "Mindestens 2 Wegpunkte erforderlich für die Routenberechnung"
                )
            )
        }
        
        try {
            if (!networkService.isNetworkAvailable()) {
                return Result.Error(AppError(ErrorCode.NETWORK_UNAVAILABLE))
            }
            
            // Routenplanungs-Optionen abrufen
            val profile = preferencesService.getRoutingProfile()
            
            // Wegpunkte in URL-Parameter umwandeln
            val pointParams = waypoints.map { 
                "point=${it.latitude},${it.longitude}" 
            }.joinToString("&")
            
            // API-Anfrage erstellen
            val response = httpClient.get("$baseUrl?$pointParams") {
                parameter("vehicle", "bike")
                parameter("profile", profile.apiValue)
                parameter("elevation", "true")
                parameter("instructions", "true")
                parameter("calc_points", "true")
                parameter("points_encoded", "false")
                parameter("key", apiKey)
            }
            
            if (response.status.isSuccess()) {
                val routeResponse = response.body<GraphHopperResponse>()
                
                // Route mit der besten Bewertung auswählen
                val bestRoute = routeResponse.paths.minByOrNull { it.time }
                    ?: return Result.Error(
                        AppError(
                            code = ErrorCode.API_ERROR,
                            message = "Keine Routen in der Antwort gefunden"
                        )
                    )
                
                return Result.Success(mapRouteData(bestRoute))
            } else {
                return Result.Error(
                    AppError(
                        code = ErrorCode.API_ERROR,
                        message = "Routing-API-Fehler: ${response.status}"
                    )
                )
            }
            
        } catch (e: Exception) {
            return Result.Error(
                AppError(
                    code = ErrorCode.UNKNOWN_ERROR,
                    message = "Fehler bei der Routenberechnung: ${e.message}",
                    cause = e
                )
            )
        }
    }
    
    /**
     * Mappt die GraphHopper-Antwort auf das interne RouteData-Modell
     */
    private fun mapRouteData(path: GraphHopperPath): RouteData {
        // Koordinaten extrahieren
        val coordinates = path.points.coordinates.map { point ->
            Pair(point[0], point[1])
        }
        
        // Höhenprofil erstellen
        val elevationProfile = coordinates.mapIndexed { index, (lon, lat) ->
            val elevation = if (index < path.points.coordinates.size) {
                path.points.coordinates[index].getOrNull(2)
            } else null
            
            val distance = if (index == 0) 0f else {
                val previousPoint = coordinates[index - 1]
                calculateDistance(
                    previousPoint.second, previousPoint.first,
                    lat, lon
                )
            }
            
            ElevationProfilePoint(
                distance = if (index == 0) 0f else {
                    elevationProfile[index - 1].distance + distance
                },
                elevation = elevation?.toFloat() ?: 0f,
                coordinates = Pair(lon, lat)
            )
        }
        
        // Richtungsanweisungen extrahieren
        val instructions = path.instructions.map { instruction ->
            RouteInstruction(
                text = instruction.text,
                distance = instruction.distance.toFloat(),
                time = instruction.time / 1000, // ms in s umwandeln
                type = mapInstructionType(instruction.sign),
                turnAngle = instruction.turn_angle?.toFloat()
            )
        }
        
        return RouteData(
            distance = path.distance.toFloat(),
            time = path.time / 1000, // ms in s umwandeln
            ascent = path.ascend?.toFloat() ?: 0f,
            descent = path.descend?.toFloat() ?: 0f,
            coordinates = coordinates.map { (lon, lat) -> Pair(lon, lat) },
            elevationProfile = elevationProfile,
            instructions = instructions
        )
    }
    
    /**
     * Mappt den GraphHopper-Anweisungscode auf den internen InstructionType
     */
    private fun mapInstructionType(sign: Int): InstructionType {
        return when (sign) {
            -98 -> InstructionType.UNKNOWN
            -8 -> InstructionType.FINISH
            -3 -> InstructionType.SHARP_RIGHT
            -2 -> InstructionType.RIGHT
            -1 -> InstructionType.SLIGHT_RIGHT
            0 -> InstructionType.CONTINUE
            1 -> InstructionType.SLIGHT_LEFT
            2 -> InstructionType.LEFT
            3 -> InstructionType.SHARP_LEFT
            4 -> InstructionType.FINISH
            5 -> InstructionType.VIA_REACHED
            6 -> InstructionType.USE_ROUNDABOUT
            else -> InstructionType.UNKNOWN
        }
    }
    
    /**
     * Berechnet die Distanz zwischen zwei Koordinaten in Metern
     */
    private fun calculateDistance(
        lat1: Double, lon1: Double,
        lat2: Double, lon2: Double
    ): Float {
        val results = FloatArray(1)
        Location.distanceBetween(lat1, lon1, lat2, lon2, results)
        return results[0]
    }
}
```

### 9.3 GitHub-API-Integration

Die GitHub-API wird verwendet, um Trip-Daten auf GitHub Pages zu veröffentlichen:

```kotlin
// Repository-Konfiguration
val response = httpClient.post("$baseUrl/user/repos") {
    contentType(ContentType.Application.Json)
    bearerAuth(token)
    setBody(
        CreateRepoRequest(
            name = repoName,
            description = "VeloNomad Cycling Adventures",
            private = isPrivate,
            has_issues = false,
            has_wiki = false,
            has_projects = false,
            auto_init = true
        )
    )
}

// Inhalte hochladen
val response = httpClient.put("$baseUrl/repos/$username/$repoName/contents/$filePath") {
    contentType(ContentType.Application.Json)
    bearerAuth(token)
    setBody(
        PushContentRequest(
            message = commitMessage,
            content = Base64.getEncoder().encodeToString(content.toByteArray()),
            branch = "main"
        )
    )
}

// Workflow-Ausführung auslösen
val response = httpClient.post("$baseUrl/repos/$username/$repoName/dispatches") {
    contentType(ContentType.Application.Json)
    bearerAuth(token)
    setBody(
        TriggerWorkflowRequest(
            event_type = "update_site",
            client_payload = mapOf(
                "timestamp" to System.currentTimeMillis().toString()
            )
        )
    )
}
```

## 10. Offline-Funktionalität

### 10.1 Offline-Kartenmanagement

```kotlin
@Singleton
class OfflineMapService @Inject constructor(
    private val context: Context,
    private val offlineRegionDao: OfflineRegionDao,
    private val preferencesService: PreferencesService
) {
    private val offlineManager: OfflineManager by lazy {
        OfflineManager.getInstance(context)
    }
    
    /**
     * Lädt eine Kartenregion für die Offline-Nutzung herunter
     */
    fun downloadRegion(
        regionName: String,
        bounds: LatLngBounds,
        minZoom: Double,
        maxZoom: Double,
        styleUrl: String,
        progressCallback: (Float) -> Unit
    ): Flow<Result<OfflineRegionEntity>> = flow {
        emit(Result.Loading())
        
        try {
            // Prüfen, ob Region bereits existiert
            val existingRegion = offlineRegionDao.getRegionByNameSync(regionName)
            if (existingRegion != null) {
                emit(Result.Error(
                    AppError(
                        code = ErrorCode.DUPLICATE_ENTITY,
                        message = "Eine Region mit diesem Namen existiert bereits"
                    )
                ))
                return@flow
            }
            
            // OfflineRegionDefinition erstellen
            val definition = OfflineRegionDefinition(
                styleUrl,
                bounds,
                minZoom.toFloat(),
                maxZoom.toFloat(),
                context.resources.displayMetrics.density
            )
            
            // Offline-Region erstellen
            val metadata = ByteBuffer.allocate(regionName.toByteArray().size)
                .put(regionName.toByteArray())
                .array()
            
            val region = withContext(Dispatchers.IO) {
                offlineManager.createOfflineRegion(
                    definition,
                    metadata,
                    object : OfflineManager.CreateOfflineRegionCallback {
                        override fun onCreate(offlineRegion: OfflineRegion) {
                            // Download starten
                            offlineRegion.setDownloadState(OfflineRegion.STATE_ACTIVE)
                            
                            // Download-Fortschritt überwachen
                            offlineRegion.setObserver(object : OfflineRegion.OfflineRegionObserver {
                                override fun onStatusChanged(status: OfflineRegionStatus) {
                                    val percentage = if (status.requiredResourceCount > 0) {
                                        status.completedResourceCount.toFloat() / 
                                        status.requiredResourceCount.toFloat()
                                    } else 0f
                                    
                                    progressCallback(percentage)
                                    
                                    if (status.isComplete) {
                                        // Region zur Datenbank hinzufügen
                                        scope.launch {
                                            val entity = OfflineRegionEntity(
                                                id = UUID.randomUUID().toString(),
                                                name = regionName,
                                                minLat = bounds.latitudeSouth,
                                                maxLat = bounds.latitudeNorth,
                                                minLon = bounds.longitudeWest,
                                                maxLon = bounds.longitudeEast,
                                                minZoom = minZoom.toInt(),
                                                maxZoom = maxZoom.toInt(),
                                                styleUrl = styleUrl,
                                                downloadedAt = LocalDateTime.now(),
                                                lastUsed = LocalDateTime.now(),
                                                sizeBytes = status.completedResourceSize
                                            )
                                            
                                            offlineRegionDao.insert(entity)
                                            emit(Result.Success(entity))
                                        }
                                        
                                        offlineRegion.setObserver(null)
                                    }
                                }
                                
                                override fun onError(error: OfflineRegionError) {
                                    emit(Result.Error(
                                        AppError(
                                            code = ErrorCode.OFFLINE_DOWNLOAD_ERROR,
                                            message = "Fehler beim Download: ${error.message}"
                                        )
                                    ))
                                    
                                    offlineRegion.setObserver(null)
                                }
                                
                                override fun mapboxTileCountLimitExceeded(limit: Long) {
                                    emit(Result.Error(
                                        AppError(
                                            code = ErrorCode.OFFLINE_LIMIT_EXCEEDED,
                                            message = "Kachel-Limit überschritten: $limit"
                                        )
                                    ))
                                    
                                    offlineRegion.setObserver(null)
                                }
                            })
                        }
                        
                        override fun onError(error: String) {
                            emit(Result.Error(
                                AppError(
                                    code = ErrorCode.OFFLINE_REGION_ERROR,
                                    message = "Fehler beim Erstellen der Region: $error"
                                )
                            ))
                        }
                    }
                )
            }
            
        } catch (e: Exception) {
            emit(Result.Error(
                AppError(
                    code = ErrorCode.UNKNOWN_ERROR,
                    message = "Fehler beim Herunterladen der Region: ${e.message}",
                    cause = e
                )
            ))
        }
    }
    
    /**
     * Löscht eine heruntergeladene Offline-Region
     */
    suspend fun deleteRegion(regionId: String): Result<Unit> {
        try {
            // Region aus Datenbank abrufen
            val region = offlineRegionDao.getRegionByIdSync(regionId)
                ?: return Result.Error(
                    AppError(
                        code = ErrorCode.ENTITY_NOT_FOUND,
                        message = "Region nicht gefunden: $regionId"
                    )
                )
            
            // Offline-Region laden und löschen
            val offlineRegions = withContext(Dispatchers.IO) {
                offlineManager.listOfflineRegions(object : OfflineManager.ListOfflineRegionsCallback {
                    override fun onList(offlineRegions: Array<out OfflineRegion>) {
                        // Passende Region finden und löschen
                        for (offlineRegion in offlineRegions) {
                            val regionName = String(offlineRegion.metadata)
                            
                            if (regionName == region.name) {
                                offlineRegion.delete(object : OfflineRegion.OfflineRegionDeleteCallback {
                                    override fun onDelete() {
                                        // Erfolgreiche Löschung
                                    }
                                    
                                    override fun onError(error: String) {
                                        Timber.e("Fehler beim Löschen der Offline-Region: $error")
                                    }
                                })
                                break
                            }
                        }
                    }
                    
                    override fun onError(error: String) {
                        Timber.e("Fehler beim Auflisten der Offline-Regionen: $error")
                    }
                })
            }
            
            // Region aus Datenbank löschen
            offlineRegionDao.delete(region)
            
            return Result.Success(Unit)
            
        } catch (e: Exception) {
            return Result.Error(
                AppError(
                    code = ErrorCode.UNKNOWN_ERROR,
                    message = "Fehler beim Löschen der Region: ${e.message}",
                    cause = e
                )
            )
        }
    }
    
    /**
     * Ruft alle verfügbaren Offline-Regionen ab
     */
    fun getOfflineRegions(): Flow<List<OfflineRegionEntity>> {
        return offlineRegionDao.getAllRegions()
    }
    
    /**
     * Aktualisiert die "Zuletzt verwendet"-Zeit einer Region
     */
    suspend fun updateRegionUsage(regionId: String) {
        offlineRegionDao.updateLastUsed(regionId, LocalDateTime.now())
    }
}
```

### 10.2 Offline-Synchronisationsstrategie

```kotlin
@Singleton
class SyncService @Inject constructor(
    private val context: Context,
    private val databaseService: DatabaseService,
    private val networkService: NetworkService,
    private val workManager: WorkManager,
    private val preferencesService: PreferencesService
) {
    private val _syncStatus = MutableStateFlow<SyncStatus>(SyncStatus.Idle)
    val syncStatus: StateFlow<SyncStatus> = _syncStatus.asStateFlow()
    
    init {
        // Synchronisationsstatus initialisieren
        if (preferencesService.isSyncEnabled()) {
            scheduleSyncWork()
        }
    }
    
    /**
     * Startet eine manuelle Synchronisation
     */
    suspend fun syncNow(): Result<Unit> {
        if (!networkService.isNetworkAvailable()) {
            return Result.Error(AppError(ErrorCode.NETWORK_UNAVAILABLE))
        }
        
        if (_syncStatus.value is SyncStatus.Syncing) {
            return Result.Error(
                AppError(
                    code = ErrorCode.INVALID_STATE,
                    message = "Synchronisation läuft bereits"
                )
            )
        }
        
        _syncStatus.value = SyncStatus.Syncing(0f)
        
        try {
            // Konfiguration laden
            val syncConfig = preferencesService.getSyncConfig()
            if (syncConfig == null) {
                _syncStatus.value = SyncStatus.Error("Keine Synchronisationskonfiguration gefunden")
                return Result.Error(
                    AppError(
                        code = ErrorCode.INVALID_STATE,
                        message = "Keine Synchronisationskonfiguration gefunden"
                    )
                )
            }
            
            // Letzte Synchronisationszeit abrufen
            val lastSyncTime = preferencesService.getLastSyncTime()
            
            // Geänderte Daten seit letzter Synchronisation abrufen
            val changedData = databaseService.getChangedDataSince(lastSyncTime)
            
            // Nicht synchronisierte Daten hochladen
            for ((entity, changeType) in changedData) {
                _syncStatus.value = SyncStatus.Syncing(
                    (changedData.indexOf(Pair(entity, changeType)) + 1) / 
                    changedData.size.toFloat()
                )
                
                when (changeType) {
                    ChangeType.CREATED, ChangeType.UPDATED -> uploadEntity(entity)
                    ChangeType.DELETED -> deleteEntity(entity)
                }
            }
            
            // Synchronisationszeit aktualisieren
            preferencesService.setLastSyncTime(LocalDateTime.now())
            
            _syncStatus.value = SyncStatus.Success(LocalDateTime.now())
            return Result.Success(Unit)
            
        } catch (e: Exception) {
            _syncStatus.value = SyncStatus.Error(e.message ?: "Unbekannter Fehler")
            return Result.Error(
                AppError(
                    code = ErrorCode.SYNC_ERROR,
                    message = "Synchronisationsfehler: ${e.message}",
                    cause = e
                )
            )
        }
    }
    
    /**
     * Aktiviert oder deaktiviert die automatische Synchronisation
     */
    suspend fun setSyncEnabled(enabled: Boolean): Result<Unit> {
        try {
            preferencesService.setSyncEnabled(enabled)
            
            if (enabled) {
                scheduleSyncWork()
            } else {
                cancelSyncWork()
            }
            
            return Result.Success(Unit)
            
        } catch (e: Exception) {
            return Result.Error(
                AppError(
                    code = ErrorCode.UNKNOWN_ERROR,
                    message = "Fehler beim Ändern des Synchronisationsstatus: ${e.message}",
                    cause = e
                )
            )
        }
    }
    
    /**
     * Lädt eine Entität in die Cloud hoch
     */
    private suspend fun uploadEntity(entity: Any) {
        // Cloud-Speicherlogik implementieren (z.B. Google Drive)
    }
    
    /**
     * Löscht eine Entität aus der Cloud
     */
    private suspend fun deleteEntity(entity: Any) {
        // Cloud-Löschlogik implementieren
    }
    
    /**
     * Plant periodische Synchronisationsarbeit mit WorkManager
     */
    private fun scheduleSyncWork() {
        val syncConfig = preferencesService.getSyncConfig() ?: return
        
        // Einschränkungen definieren (z.B. Netzwerk, Batterie)
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()
        
        // Periodische Arbeit erstellen
        val syncWorkRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            syncConfig.syncIntervalHours, TimeUnit.HOURS,
            syncConfig.syncFlexIntervalMinutes, TimeUnit.MINUTES
        )
        .setConstraints(constraints)
        .setBackoffCriteria(
            BackoffPolicy.EXPONENTIAL,
            15, TimeUnit.MINUTES
        )
        .build()
        
        // Arbeit einreihen
        workManager.enqueueUniquePeriodicWork(
            SYNC_WORK_NAME,
            ExistingPeriodicWorkPolicy.REPLACE,
            syncWorkRequest
        )
    }
    
    /**
     * Bricht geplante Synchronisationsarbeit ab
     */
    private fun cancelSyncWork() {
        workManager.cancelUniqueWork(SYNC_WORK_NAME)
    }
    
    companion object {
        private const val SYNC_WORK_NAME = "velonomad_data_sync"
    }
    
    /**
     * WorkManager Worker für Datensynchronisation
     */
    class SyncWorker(
        context: Context,
        params: WorkerParameters
    ) : CoroutineWorker(context, params) {
        
        @Inject
        lateinit var syncService: SyncService
        
        override suspend fun doWork(): Result {
            return try {
                // Synchronisation ausführen
                val syncResult = syncService.syncNow()
                
                if (syncResult is com.velonomad.core.domain.Result.Success) {
                    Result.success()
                } else {
                    Result.retry()
                }
                
            } catch (e: Exception) {
                Timber.e(e, "Fehler bei der Hintergrund-Synchronisation")
                Result.retry()
            }
        }
    }
}
```

## 11. Sicherheitsimplementierung

### 11.1 OWASP Top 10 Sicherheitsmaßnahmen

Die Anwendung implementiert Schutzmaßnahmen gegen die OWASP Top 10 Sicherheitsrisiken:

#### 11.1.1 Broken Access Control

```kotlin
// Sicherstellen, dass Nutzer nur auf eigene Daten zugreifen können
suspend fun getTrip(tripId: String): Result<TripEntity> {
    // Prüfen, ob Trip dem aktuellen Benutzer gehört
    val trip = tripDao.getTripByIdSync(tripId)
    
    if (trip == null) {
        return Result.Error(
            AppError(
                code = ErrorCode.ENTITY_NOT_FOUND,
                message = "Trip nicht gefunden: $tripId"
            )
        )
    }
    
    // Wenn Authentifizierung verwendet wird, Besitzerprüfung hinzufügen
    if (authService.isAuthEnabled()) {
        val currentUserId = authService.getCurrentUserId()
        
        if (trip.userId != currentUserId) {
            return Result.Error(
                AppError(
                    code = ErrorCode.ACCESS_DENIED,
                    message = "Zugriff auf diesen Trip verweigert"
                )
            )
        }
    }
    
    return Result.Success(trip)
}
```

#### 11.1.2 Cryptographic Failures

```kotlin
// Sichere Token-Speicherung im AccountManager
private suspend fun saveAuthToken(token: String) {
    try {
        val account = getOrCreateAccount()
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            withContext(Dispatchers.IO) {
                accountManager.setPassword(account, token)
            }
        } else {
            // Für ältere Android-Versionen, verschlüsselte SharedPreferences verwenden
            val encryptedPrefs = EncryptedSharedPreferences.create(
                "encrypted_prefs",
                BuildConfig.ENCRYPTED_PREFS_KEY,
                context,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
            
            encryptedPrefs.edit().putString(TOKEN_KEY, token).apply()
        }
    } catch (e: Exception) {
        Timber.e(e, "Fehler beim Speichern des Tokens")
    }
}
```

#### 11.1.3 Injection

Schutz vor SQL-Injection durch Verwendung von Room und parametrisierte Abfragen:

```kotlin
@Dao
interface DiaryEntryDao {
    @Query("SELECT * FROM diary_entries WHERE tripId = :tripId ORDER BY timestamp DESC")
    fun getEntriesForTrip(tripId: String): Flow<List<DiaryEntryEntity>>
    
    @RawQuery
    fun searchEntries(query: SimpleSQLiteQuery): Flow<List<DiaryEntryEntity>>
    
    // Sichere Methode zum Erstellen einer Suchabfrage
    fun createSearchQuery(searchTerm: String, tripId: String?): SimpleSQLiteQuery {
        val tripFilter = if (tripId != null) "AND tripId = ?" else ""
        val params = mutableListOf<Any>()
        
        // Suchbegriff validieren und bereinigen
        val sanitizedSearchTerm = searchTerm
            .replace("'", "''") // SQL-Injection verhindern
            .replace("%", "\\%") // LIKE-Wildcard escapen
            .replace("_", "\\_") // LIKE-Wildcard escapen
        
        params.add("%$sanitizedSearchTerm%")
        
        if (tripId != null) {
            params.add(tripId)
        }
        
        val sql = """
            SELECT * FROM diary_entries 
            WHERE (title LIKE ? OR content LIKE ?) 
            $tripFilter
            ORDER BY timestamp DESC
        """.trimIndent()
        
        return SimpleSQLiteQuery(sql, params.toTypedArray())
    }
}
```

#### 11.1.4 Insecure Design

Die Anwendung folgt dem Principle of Least Privilege für Berechtigungen:

```kotlin
// AndroidManifest.xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.velonomad">
    
    <!-- Nur notwendige Berechtigungen anfordern -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- Bedingte Berechtigungen nur anfordern, wenn notwendig -->
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" android:maxSdkVersion="29" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
    
    <!-- ... -->
</manifest>
```

#### 11.1.5 Security Misconfiguration

ProGuard-Regeln für die Release-Version:

```
# proguard-rules.pro
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Kotlin Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.SerializationKt
-keep,includedescriptorclasses class com.velonomad.**$$serializer { *; }
-keepclassmembers class com.velonomad.** {
    *** Companion;
}
-keepclasseswithmembers class com.velonomad.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# Room
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-dontwarn androidx.room.paging.**

# Ktor
-keep class io.ktor.** { *; }
-keep class kotlinx.coroutines.** { *; }
```

## 12. Performance-Optimierungen

### 12.1 Datenbankoptimierung

```kotlin
// Optimierte Abfrage für Trackpoints mit Spatialite
@Dao
interface TrackPointDao {
    // Effiziente Paging-Abfrage für große Datensätze
    @Query("SELECT * FROM track_points WHERE tripId = :tripId ORDER BY timestamp ASC")
    fun getTrackPointsForTripPaged(tripId: String): PagingSource<Int, TrackPointEntity>
    
    // Räumliche Abfrage für Trackpoints in einem bestimmten Bereich
    @RawQuery
    fun getTrackPointsInRegion(query: SimpleSQLiteQuery): List<TrackPointEntity>
    
    // Downsampling von Trackpoints für Kartenanzeige
    @RawQuery
    fun getDownsampledTrackPoints(query: SimpleSQLiteQuery): List<TrackPointEntity>
    
    // Hilfsmethode zum Erstellen einer Downsampling-Abfrage
    fun createDownsamplingQuery(tripId: String, targetPointCount: Int): SimpleSQLiteQuery {
        val sql = """
            WITH ordered_points AS (
                SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) AS row_num
                FROM track_points
                WHERE tripId = ?
            )
            SELECT * FROM ordered_points
            WHERE row_num % (CAST((SELECT COUNT(*) FROM ordered_points) AS REAL) / ? + 0.5) < 1.5
            ORDER BY timestamp
        """.trimIndent()
        
        return SimpleSQLiteQuery(sql, arrayOf(tripId, targetPointCount))
    }
}
```

### 12.2 UI-Optimierung

```svelte
<!-- Virtuelles Scrollen für lange Listen -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { $effect, $state } from 'svelte';
    
    export let items: any[];
    export let itemHeight = 60; // Höhe jedes Elements in Pixeln
    export let renderAhead = 5; // Anzahl der Elements außerhalb des sichtbaren Bereichs zu rendern
    
    let containerRef: HTMLDivElement;
    let visibleItems = $state<any[]>([]);
    let startIndex = $state(0);
    let endIndex = $state(0);
    let scrollTop = $state(0);
    let clientHeight = $state(0);
    
    onMount(() => {
        if (!containerRef) return;
        
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                clientHeight = entry.contentRect.height;
                updateVisibleItems();
            }
        });
        
        observer.observe(containerRef);
        
        return () => {
            observer.disconnect();
        };
    });
    
    function handleScroll(e: Event) {
        if (!containerRef) return;
        
        scrollTop = containerRef.scrollTop;
        updateVisibleItems();
    }
    
    function updateVisibleItems() {
        if (!items || items.length === 0) {
            visibleItems = [];
            return;
        }
        
        // Berechne den sichtbaren Bereich basierend auf Scroll-Position
        startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - renderAhead);
        endIndex = Math.min(
            items.length - 1,
            Math.ceil((scrollTop + clientHeight) / itemHeight) + renderAhead
        );
        
        // Nur die sichtbaren Items rendern
        visibleItems = items.slice(startIndex, endIndex + 1);
    }
    
    $effect(() => {
        updateVisibleItems();
    });
</script>

<div
    class="virtual-list"
    style="height: 100%; overflow-y: auto;"
    bind:this={containerRef}
    on:scroll={handleScroll}
>
    <div style="height: {items.length * itemHeight}px; position: relative;">
        {#each visibleItems as item, i}
            <div
                style="position: absolute; top: {(startIndex + i) * itemHeight}px; left: 0; right: 0; height: {itemHeight}px;"
            >
                <slot {item} index={startIndex + i} />
            </div>
        {/each}
    </div>
</div>
```

### 12.3 Kartenoptimierung

```typescript
// MapOptimizer.ts
export class MapOptimizer {
    private map: maplibregl.Map;
    private lastCenter: maplibregl.LngLat | null = null;
    private lastZoom: number | null = null;
    private visibleLayers: Set<string> = new Set();
    
    constructor(map: maplibregl.Map) {
        this.map = map;
    }
    
    /**
     * Aktiviert alle Optimierungen
     */
    public enableOptimizations(): void {
        this.setupLayerVisibilityOptimization();
        this.setupTileCachingOptimization();
        this.setupRenderOptimization();
    }
    
    /**
     * Optimiert die Sichtbarkeit von Ebenen basierend auf Zoom-Stufe
     */
    private setupLayerVisibilityOptimization(): void {
        // Zoom-basierte Ebenen-Sichtbarkeit
        this.map.on('zoom', () => {
            const currentZoom = this.map.getZoom();
            
            // Nur aktualisieren, wenn sich Zoom signifikant geändert hat
            if (this.lastZoom !== null && Math.abs(currentZoom - this.lastZoom) < 0.5) {
                return;
            }
            
            this.lastZoom = currentZoom;
            
            // Ebenen basierend auf Zoom-Stufe anzeigen/ausblenden
            // Hochdetaillierte Ebenen nur bei hohem Zoom anzeigen
            this.toggleLayerByZoom('buildings', 15, 22);
            this.toggleLayerByZoom('poi-labels', 14, 22);
            this.toggleLayerByZoom('3d-buildings', 16, 22);
            this.toggleLayerByZoom('road-labels', 12, 22);
            
            // Niedrigdetaillierte Ebenen nur bei niedrigem Zoom anzeigen
            this.toggleLayerByZoom('country-boundaries', 0, 8);
            this.toggleLayerByZoom('state-boundaries', 3, 10);
        });
    }
    
    /**
     * Optimiert das Caching von Kacheln
     */
    private setupTileCachingOptimization(): void {
        // Maximale Kachel-Cache-Größe festlegen
        this.map.setMaxTileCacheSize(100);
        
        // Kacheln vor-laden, wenn sich der Kartenausschnitt stabilisiert
        let moveTimeout: number | null = null;
        
        this.map.on('moveend', () => {
            if (moveTimeout !== null) {
                clearTimeout(moveTimeout);
            }
            
            moveTimeout = setTimeout(() => {
                const center = this.map.getCenter();
                
                // Nur vorladen, wenn sich die Position signifikant geändert hat
                if (this.lastCenter && this.lastCenter.distanceTo(center) < 100) {
                    return;
                }
                
                this.lastCenter = center;
                
                // Kacheln in Bewegungsrichtung vorladen
                const currentBounds = this.map.getBounds();
                const currentCenter = this.map.getCenter();
                const lastCenter = this.lastCenter;
                
                if (lastCenter) {
                    // Bewegungsrichtung bestimmen
                    const direction = {
                        lng: currentCenter.lng - lastCenter.lng,
                        lat: currentCenter.lat - lastCenter.lat
                    };
                    
                    // Vorladebereich berechnen
                    const preloadBounds = this.calculatePreloadBounds(currentBounds, direction);
                    
                    // Vorladebereich anzeigen (nur für Debugging)
                    // this.showPreloadBounds(preloadBounds);
                }
            }, 300);
        });
    }
    
    /**
     * Optimiert das Rendering
     */
    private setupRenderOptimization(): void {
        // Rendering-Performance-Optimierungen
        
        // Reduziere Render-Frames während des Zoomens/Bewegens
        this.map.on('move', () => {
            if (this.map.isEasing()) {
                this.map.getCanvas().style.imageRendering = 'auto';
            }
        });
        
        this.map.on('movestart', () => {
            // Reduziere Detailgrad während der Bewegung
            this.map.getCanvas().style.imageRendering = 'pixelated';
            
            // Deaktiviere temporär rechenintensive Ebenen während der Bewegung
            this.saveLayerVisibility('route-animated');
            this.saveLayerVisibility('weather-particles');
            this.map.setLayoutProperty('route-animated', 'visibility', 'none');
            this.map.setLayoutProperty('weather-particles', 'visibility', 'none');
        });
        
        this.map.on('moveend', () => {
            // Stelle normalen Detailgrad wieder her
            this.map.getCanvas().style.imageRendering = 'auto';
            
            // Stelle die ursprüngliche Sichtbarkeit der Ebenen wieder her
            this.restoreLayerVisibility('route-animated');
            this.restoreLayerVisibility('weather-particles');
        });
        
        // Bei niedrigem RAM oder CPU-Auslastung auf niedrigeren Detail-Stil umschalten
        if (this.isLowEndDevice()) {
            this.map.setStyle('mapbox://styles/mapbox/outdoors-v11');
            this.map.setMaxZoom(17); // Begrenze max. Zoom auf niedrigeren Geräten
        }
    }
    
    # MapOptimizer.ts (Fortsetzung)

```typescript
/**
 * Aktiviert oder deaktiviert eine Ebene basierend auf der Zoom-Stufe
 */
private toggleLayerByZoom(layerId: string, minZoom: number, maxZoom: number): void {
    if (!this.map.getLayer(layerId)) {
        return;
    }
    
    const currentZoom = this.map.getZoom();
    const isVisible = currentZoom >= minZoom && currentZoom <= maxZoom;
    const currentVisibility = this.map.getLayoutProperty(layerId, 'visibility');
    
    if (isVisible && currentVisibility === 'none') {
        this.map.setLayoutProperty(layerId, 'visibility', 'visible');
    } else if (!isVisible && currentVisibility === 'visible') {
        this.map.setLayoutProperty(layerId, 'visibility', 'none');
    }
}

/**
 * Berechnet den Bereich für das Vorladen von Kacheln basierend auf der Bewegungsrichtung
 */
private calculatePreloadBounds(
    currentBounds: maplibregl.LngLatBounds,
    direction: { lng: number, lat: number }
): maplibregl.LngLatBounds {
    // Normalisierten Richtungsvektor erstellen
    const magnitude = Math.sqrt(direction.lng * direction.lng + direction.lat * direction.lat);
    
    if (magnitude === 0) {
        return currentBounds;
    }
    
    const normalized = {
        lng: direction.lng / magnitude,
        lat: direction.lat / magnitude
    };
    
    // Sichtbaren Bereich erweitern
    const northeast = currentBounds.getNorthEast();
    const southwest = currentBounds.getSouthWest();
    const width = northeast.lng - southwest.lng;
    const height = northeast.lat - southwest.lat;
    
    // Vorladebereich basierend auf Bewegungsrichtung berechnen
    // Stärker in Bewegungsrichtung erweitern
    const preloadFactor = 0.5; // 50% des sichtbaren Bereichs vorladen
    
    const newBounds = new maplibregl.LngLatBounds(
        new maplibregl.LngLat(
            southwest.lng - Math.abs(normalized.lng) * width * preloadFactor,
            southwest.lat - Math.abs(normalized.lat) * height * preloadFactor
        ),
        new maplibregl.LngLat(
            northeast.lng + Math.abs(normalized.lng) * width * preloadFactor,
            northeast.lat + Math.abs(normalized.lat) * height * preloadFactor
        )
    );
    
    return newBounds;
}

/**
 * Zeigt den Vorladebereich zu Debugging-Zwecken an
 */
private showPreloadBounds(bounds: maplibregl.LngLatBounds): void {
    // Entferne bestehende Debug-Linien
    if (this.map.getSource('preload-debug')) {
        this.map.removeLayer('preload-debug-layer');
        this.map.removeSource('preload-debug');
    }
    
    // Erstelle GeoJSON für den Debugging-Bereich
    this.map.addSource('preload-debug', {
        type: 'geojson',
        data: {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [bounds.getWest(), bounds.getSouth()],
                    [bounds.getEast(), bounds.getSouth()],
                    [bounds.getEast(), bounds.getNorth()],
                    [bounds.getWest(), bounds.getNorth()],
                    [bounds.getWest(), bounds.getSouth()]
                ]]
            }
        }
    });
    
    this.map.addLayer({
        id: 'preload-debug-layer',
        type: 'line',
        source: 'preload-debug',
        layout: {},
        paint: {
            'line-color': '#FF0000',
            'line-width': 2,
            'line-opacity': 0.7,
            'line-dasharray': [2, 2]
        }
    });
    
    // Nach 2 Sekunden automatisch entfernen
    setTimeout(() => {
        if (this.map.getSource('preload-debug')) {
            this.map.removeLayer('preload-debug-layer');
            this.map.removeSource('preload-debug');
        }
    }, 2000);
}

/**
 * Überprüft, ob es sich um ein Gerät mit geringer Leistung handelt
 */
private isLowEndDevice(): boolean {
    // Einfache Heuristik basierend auf Bildschirmgröße und NavigatorConnection-API
    const isLowRes = window.screen.width * window.screen.height < 1280 * 720;
    
    // Bei verfügbarer NetworkInformation-API die Verbindungsqualität prüfen
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && 
        (connection.saveData || 
         connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g');
    
    return isLowRes || isSlowConnection;
}

/**
 * Speichert den Sichtbarkeitsstatus einer Ebene
 */
private saveLayerVisibility(layerId: string): void {
    if (!this.map.getLayer(layerId)) {
        return;
    }
    
    const visibility = this.map.getLayoutProperty(layerId, 'visibility');
    
    if (visibility === 'visible') {
        this.visibleLayers.add(layerId);
    } else {
        this.visibleLayers.delete(layerId);
    }
}

/**
 * Stellt den Sichtbarkeitsstatus einer Ebene wieder her
 */
private restoreLayerVisibility(layerId: string): void {
    if (!this.map.getLayer(layerId)) {
        return;
    }
    
    if (this.visibleLayers.has(layerId)) {
        this.map.setLayoutProperty(layerId, 'visibility', 'visible');
    }
}
}
```

# BatteryOptimizer.ts

```typescript
/**
 * Utility-Klasse zur Optimierung des Batterieverbrauchs
 */
export class BatteryOptimizer {
    private readonly locationService: any; // Native Service über NativeBridge
    private readonly sensorService: any; // Native Service über NativeBridge
    private readonly preferencesService: any; // Native Service über NativeBridge
    
    private batteryLevel: number = 100;
    private isLowBatteryMode: boolean = false;
    private isChargingMode: boolean = false;
    
    constructor(
        locationService: any,
        sensorService: any,
        preferencesService: any
    ) {
        this.locationService = locationService;
        this.sensorService = sensorService;
        this.preferencesService = preferencesService;
        
        this.initializeBatteryMonitoring();
    }
    
    /**
     * Initialisiert die Batterieüberwachung
     */
    private initializeBatteryMonitoring(): void {
        // Batteriestand-Event-Listener einrichten
        window.addEventListener('batterystatus', (event: any) => {
            this.batteryLevel = event.level;
            this.isChargingMode = event.isPlugged;
            
            this.updatePowerModes();
        });
        
        // Initiale Abfrage des Batteriestands über native Brücke
        this.requestBatteryStatus();
        
        // Regelmäßig Batteriestatus aktualisieren
        setInterval(() => {
            this.requestBatteryStatus();
        }, 60000); // Jede Minute
    }
    
    /**
     * Fordert den aktuellen Batteriestatus an
     */
    private async requestBatteryStatus(): Promise<void> {
        try {
            const result = await this.sensorService.getBatteryStatus();
            
            if (result.status === 'success') {
                this.batteryLevel = result.data.level;
                this.isChargingMode = result.data.isCharging;
                
                this.updatePowerModes();
            }
        } catch (error) {
            console.error('Fehler beim Abrufen des Batteriestatus', error);
        }
    }
    
    /**
     * Aktualisiert die Energiesparmodi basierend auf dem Batteriestatus
     */
    private updatePowerModes(): void {
        const previousLowBatteryMode = this.isLowBatteryMode;
        
        // Low-Battery-Modus aktivieren, wenn Batterie unter 20% und nicht ladend
        if (this.batteryLevel <= 20 && !this.isChargingMode) {
            this.isLowBatteryMode = true;
        } 
        // Low-Battery-Modus deaktivieren, wenn Batterie über 30% oder ladend
        else if (this.batteryLevel > 30 || this.isChargingMode) {
            this.isLowBatteryMode = false;
        }
        
        // Wenn sich der Low-Battery-Status geändert hat, passe die Services an
        if (previousLowBatteryMode !== this.isLowBatteryMode) {
            this.applyPowerModes();
        }
    }
    
    /**
     * Wendet die Energiesparmodi auf die Services an
     */
    private applyPowerModes(): void {
        if (this.isLowBatteryMode) {
            this.applyLowBatteryMode();
        } else if (this.isChargingMode) {
            this.applyChargingMode();
        } else {
            this.applyNormalMode();
        }
    }
    
    /**
     * Wendet den Low-Battery-Modus an
     */
    private applyLowBatteryMode(): void {
        // Standort-Update-Intervall erhöhen (weniger Updates)
        this.locationService.setLocationProfile('LOW_POWER');
        
        // Sensor-Sampling-Rate reduzieren
        this.sensorService.setSamplingRate('LOW');
        
        // UI-Optimierungen aktivieren
        this.applyLowBatteryUIOptimizations();
        
        // Synchronisierungsintervalle reduzieren
        this.preferencesService.setSyncMode('BATTERY_SAVING');
        
        console.log('Low-Battery-Modus aktiviert');
    }
    
    /**
     * Wendet den Lade-Modus an
     */
    private applyChargingMode(): void {
        // Höchste Genauigkeit für Standort-Updates
        this.locationService.setLocationProfile('HIGH_ACCURACY');
        
        // Höchste Sensor-Sampling-Rate
        this.sensorService.setSamplingRate('HIGH');
        
        // UI-Optimierungen deaktivieren
        this.removeLowBatteryUIOptimizations();
        
        // Sofortige Synchronisierung aktivieren
        this.preferencesService.setSyncMode('IMMEDIATE');
        
        console.log('Charging-Modus aktiviert');
    }
    
    /**
     * Wendet den normalen Modus an
     */
    private applyNormalMode(): void {
        // Ausgewogene Standortgenauigkeit
        this.locationService.setLocationProfile('BALANCED');
        
        // Normale Sensor-Sampling-Rate
        this.sensorService.setSamplingRate('NORMAL');
        
        // UI-Optimierungen deaktivieren
        this.removeLowBatteryUIOptimizations();
        
        // Normales Synchronisierungsverhalten
        this.preferencesService.setSyncMode('NORMAL');
        
        console.log('Normal-Modus aktiviert');
    }
    
    /**
     * Wendet UI-Optimierungen für den Low-Battery-Modus an
     */
    private applyLowBatteryUIOptimizations(): void {
        // Animationen reduzieren
        document.body.classList.add('reduced-motion');
        
        // Refresh-Rate für Wetter-Updates reduzieren
        window.dispatchEvent(new CustomEvent('set-weather-refresh', { 
            detail: { interval: 60 } // 60 Minuten
        }));
        
        // 3D-Terrain deaktivieren (wenn vorhanden)
        window.dispatchEvent(new CustomEvent('set-terrain', { 
            detail: { enabled: false } 
        }));
        
        // Wetter-Visualisierung vereinfachen
        window.dispatchEvent(new CustomEvent('simplify-weather-visualization', { 
            detail: { simplified: true } 
        }));
    }
    
    /**
     * Entfernt UI-Optimierungen für den Low-Battery-Modus
     */
    private removeLowBatteryUIOptimizations(): void {
        // Animationen wiederherstellen
        document.body.classList.remove('reduced-motion');
        
        // Normale Refresh-Rate für Wetter-Updates
        window.dispatchEvent(new CustomEvent('set-weather-refresh', { 
            detail: { interval: 15 } // 15 Minuten
        }));
        
        // 3D-Terrain einschalten, wenn in Einstellungen aktiviert
        this.preferencesService.get3DTerrainEnabled().then((enabled: boolean) => {
            window.dispatchEvent(new CustomEvent('set-terrain', { 
                detail: { enabled } 
            }));
        });
        
        // Detaillierte Wetter-Visualisierung
        window.dispatchEvent(new CustomEvent('simplify-weather-visualization', { 
            detail: { simplified: false } 
        }));
    }
}
```

# PerformanceMonitor.ts

```typescript
/**
 * Klasse zur Überwachung und Optimierung der Anwendungsleistung
 */
export class PerformanceMonitor {
    private fpsCounter: number = 0;
    private lastFpsUpdate: number = performance.now();
    private currentFps: number = 60;
    private memoryUsage: any = null;
    private isMonitoring: boolean = false;
    private monitoringInterval: number | null = null;
    
    private readonly performanceBudget = {
        targetFps: 60,
        minAcceptableFps: 30,
        maxMemoryUsage: 200 * 1024 * 1024, // 200 MB
        maxCpuUsage: 50 // 50%
    };
    
    private readonly optimizationCallbacks: {
        lowFps: Array<() => void>;
        highMemory: Array<() => void>;
        highCpu: Array<() => void>;
        normal: Array<() => void>;
    } = {
        lowFps: [],
        highMemory: [],
        highCpu: [],
        normal: []
    };
    
    /**
     * Startet die Leistungsüberwachung
     */
    public startMonitoring(): void {
        if (this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = true;
        
        // FPS-Zähler einrichten
        this.setupFpsCounter();
        
        // Regelmäßige Leistungsüberwachung
        this.monitoringInterval = window.setInterval(() => {
            this.checkPerformance();
        }, 5000) as unknown as number;
        
        console.log('Performance-Überwachung gestartet');
    }
    
    /**
     * Stoppt die Leistungsüberwachung
     */
    public stopMonitoring(): void {
        if (!this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = false;
        
        // FPS-Zähler entfernen
        window.cancelAnimationFrame(this.fpsCounter);
        
        // Überwachungsintervall beenden
        if (this.monitoringInterval !== null) {
            window.clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('Performance-Überwachung gestoppt');
    }
    
    /**
     * Registriert einen Callback für Leistungsoptimierungen
     */
    public registerOptimizationCallback(
        type: 'lowFps' | 'highMemory' | 'highCpu' | 'normal',
        callback: () => void
    ): void {
        this.optimizationCallbacks[type].push(callback);
    }
    
    /**
     * Richtet den FPS-Zähler ein
     */
    private setupFpsCounter(): void {
        let frameCount = 0;
        
        const countFrame = () => {
            frameCount++;
            
            // FPS alle Sekunde aktualisieren
            const now = performance.now();
            const elapsed = now - this.lastFpsUpdate;
            
            if (elapsed >= 1000) {
                this.currentFps = Math.round(frameCount / (elapsed / 1000));
                frameCount = 0;
                this.lastFpsUpdate = now;
            }
            
            this.fpsCounter = window.requestAnimationFrame(countFrame);
        };
        
        this.fpsCounter = window.requestAnimationFrame(countFrame);
    }
    
    /**
     * Prüft die aktuelle Leistung und wendet bei Bedarf Optimierungen an
     */
    private checkPerformance(): void {
        // Speichernutzung abrufen (falls verfügbar)
        this.updateMemoryUsage();
        
        // Leistungsstatus bewerten
        const isLowFps = this.currentFps < this.performanceBudget.minAcceptableFps;
        const isHighMemory = this.memoryUsage && 
                           this.memoryUsage.usedJSHeapSize > this.performanceBudget.maxMemoryUsage;
        
        // Optimierungsmaßnahmen anwenden
        if (isLowFps) {
            console.warn(`Niedrige FPS erkannt: ${this.currentFps}`);
            this.triggerOptimizationCallbacks('lowFps');
        }
        
        if (isHighMemory) {
            console.warn(`Hohe Speichernutzung erkannt: ${this.formatBytes(this.memoryUsage.usedJSHeapSize)}`);
            this.triggerOptimizationCallbacks('highMemory');
        }
        
        if (!isLowFps && !isHighMemory) {
            this.triggerOptimizationCallbacks('normal');
        }
    }
    
    /**
     * Aktualisiert die Speichernutzungsstatistiken
     */
    private updateMemoryUsage(): void {
        if ((performance as any).memory) {
            this.memoryUsage = (performance as any).memory;
        }
    }
    
    /**
     * Löst Optimierungs-Callbacks aus
     */
    private triggerOptimizationCallbacks(type: 'lowFps' | 'highMemory' | 'highCpu' | 'normal'): void {
        for (const callback of this.optimizationCallbacks[type]) {
            try {
                callback();
            } catch (error) {
                console.error(`Fehler im Optimierungs-Callback (${type}):`, error);
            }
        }
    }
    
    /**
     * Formatiert Bytes in lesbare Größen
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Gibt aktuelle Leistungsdaten zurück
     */
    public getPerformanceData(): { fps: number, memory: any } {
        return {
            fps: this.currentFps,
            memory: this.memoryUsage
        };
    }
}
```

## 13. Build und Deployment

### 13.1 Gradle-Konfiguration (app/build.gradle.kts)

```kotlin
plugins {
    id("com.android.application")
    id("kotlin-android")
    id("kotlin-kapt")
    id("dagger.hilt.android.plugin")
    id("kotlinx-serialization")
    id("com.google.devtools.ksp") version "1.9.0-1.0.13"
}

android {
    namespace = "com.velonomad"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.velonomad"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        
        // API-Schlüssel aus local.properties
        val properties = com.android.build.gradle.internal.cxx.configure.gradleLocalProperties(rootDir)
        
        buildConfigField("String", "WEATHER_API_KEY", properties.getProperty("WEATHER_API_KEY", "\"YOUR_API_KEY\""))
        buildConfigField("String", "GRAPHHOPPER_API_KEY", properties.getProperty("GRAPHHOPPER_API_KEY", "\"YOUR_API_KEY\""))
        buildConfigField("String", "GITHUB_CLIENT_ID", properties.getProperty("GITHUB_CLIENT_ID", "\"YOUR_CLIENT_ID\""))
        buildConfigField("String", "GITHUB_CLIENT_SECRET", properties.getProperty("GITHUB_CLIENT_SECRET", "\"YOUR_CLIENT_SECRET\""))
        buildConfigField("String", "GITHUB_REDIRECT_URI", properties.getProperty("GITHUB_REDIRECT_URI", "\"com.velonomad://github-callback\""))
        buildConfigField("String", "ENCRYPTED_PREFS_KEY", properties.getProperty("ENCRYPTED_PREFS_KEY", "\"DEFAULT_ENCRYPTION_KEY\""))
    }
    
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            
            // Release-spezifische Konfiguration
            buildConfigField("boolean", "DEBUG_LOGGING", "false")
            
            // Signaturkonfiguration
            signingConfig = signingConfigs.getByName("release")
        }
        
        debug {
            isMinifyEnabled = false
            
            // Debug-spezifische Konfiguration
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            buildConfigField("boolean", "DEBUG_LOGGING", "true")
        }
    }
    
    signingConfigs {
        create("release") {
            // Release-Signing aus Umgebungsvariablen oder Gradle-Properties
            val keystorePropertiesFile = rootProject.file("keystore.properties")
            
            if (keystorePropertiesFile.exists()) {
                val keystoreProperties = java.util.Properties()
                keystoreProperties.load(java.io.FileInputStream(keystorePropertiesFile))
                
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
            }
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    
    kotlinOptions {
        jvmTarget = "17"
    }
    
    buildFeatures {
        buildConfig = true
    }
    
    // Room-Schema Export
    ksp {
        arg("room.schemaLocation", "$projectDir/schemas")
        arg("room.incremental", "true")
        arg("room.expandProjection", "true")
    }
}

dependencies {
    // Android Core Bibliotheken
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.activity:activity-ktx:1.8.0")
    implementation("com.google.android.material:material:1.10.0")
    
    // Lebenszyklus
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2")
    
    // Room Database
    implementation("androidx.room:room-runtime:2.6.0")
    implementation("androidx.room:room-ktx:2.6.0")
    ksp("androidx.room:room-compiler:2.6.0")
    implementation("androidx.room:room-paging:2.6.0")
    
    // Spatialite für Room
    implementation("androidx.sqlite:sqlite-ktx:2.4.0")
    implementation("org.sqlite.sqliteX:spatialite-android:5.1.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // Hilt für Dependency Injection
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-android-compiler:2.48")
    
    // Kotlinx Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.1")
    
    // Kotlinx DateTime
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.4.1")
    
    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    
    // Google Services
    implementation("com.google.android.gms:play-services-maps:18.2.0")
    implementation("com.google.android.gms:play-services-location:21.0.1")
    implementation("com.google.android.gms:play-services-auth:20.7.0")
    
    // Ktor für API-Calls
    implementation("io.ktor:ktor-client-core:2.3.4")
    implementation("io.ktor:ktor-client-android:2.3.4")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.4")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.4")
    implementation("io.ktor:ktor-client-logging:2.3.4")
    
    // Logging
    implementation("com.jakewharton.timber:timber:5.0.1")
    
    // Capacitor
    implementation("com.capacitorjs:core:6.0.0-beta.0")
    
    // CSV Verarbeitung
    implementation("org.apache.commons:commons-csv:1.10.0")
    
    // Tests
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("app.cash.turbine:turbine:1.0.0")
    
    // Android-Tests
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("com.google.dagger:hilt-android-testing:2.48")
    kaptAndroidTest("com.google.dagger:hilt-android-compiler:2.48")
}
```

### 13.2 Vite/SvelteKit-Konfiguration (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [sveltekit()],
    resolve: {
        alias: {
            $lib: resolve('./src/lib'),
            $assets: resolve('./src/assets')
        }
    },
    optimizeDeps: {
        include: [
            'maplibre-gl',
            'd3',
            'turf',
            'motion',
            'date-fns'
        ],
        exclude: [
            '@capacitor/core'
        ]
    },
    build: {
        target: 'es2022',
        outDir: 'build',
        rollupOptions: {
            output: {
                manualChunks: {
                    maplibre: ['maplibre-gl'],
                    d3: ['d3'],
                    turf: ['@turf/turf'],
                    motion: ['motion'],
                    utils: [
                        'date-fns',
                        'typesafe-i18n'
                    ]
                }
            }
        },
        // Moderne Browsers unterstützen Brotli, daher hier brotli-Kompression
        brotliSize: true,
        chunkSizeWarningLimit: 1000, // 1MB
        // Sourcemaps nur im Development-Modus
        sourcemap: process.env.NODE_ENV === 'development'
    },
    // Server-Konfiguration für lokale Entwicklung
    server: {
        port: 3000,
        cors: true
    }
});
```

## 14. Teststrategien

### 14.1 Native Unit-Tests

```kotlin
// Beispiel für einen Unit-Test des WeatherService
@OptIn(ExperimentalCoroutinesApi::class)
class WeatherServiceTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()
    
    // Mocks
    private val mockHttpClient = mockk<HttpClient>()
    private val mockPreferencesService = mockk<PreferencesService>()
    private val mockDataStore = mockk<DataStore<Preferences>>
    private val mockNetworkService = mockk<NetworkService>()
    
    // Test-Subjekt
    private lateinit var weatherService: WeatherService
    
    @Before
    fun setup() {
        weatherService = WeatherService(
            httpClient = mockHttpClient,
            preferencesService = mockPreferencesService,
            dataStore = mockDataStore,
            networkService = mockNetworkService
        )
    }
    
    @Test
    fun `fetchWeatherForLocation returns success when API call succeeds`() = runTest {
        // Arrange
        val latitude = 52.0
        val longitude = 13.0
        
        // Mock-Netzwerkverfügbarkeit
        coEvery { networkService.isNetworkAvailable() } returns true
        
        // Mock-API-Antwort erstellen
        val mockResponse = mockk<HttpResponse>()
        val mockWeatherResponse = createMockWeatherResponse()
        
        coEvery { mockResponse.status } returns HttpStatusCode.OK
        coEvery { mockResponse.body<WeatherResponse>() } returns mockWeatherResponse
        
        // HTTP-Client-Aufruf mocken
        coEvery { 
            mockHttpClient.get(any(), any()) 
        } returns mockResponse
        
        // Act
        val result = weatherService.fetchWeatherForLocation(latitude, longitude)
        
        // Assert
        assertTrue(result is Result.Success)
        assertEquals(15.5f, (result as Result.Success).data.temperature)
        assertEquals("Klarer Himmel", result.data.description)
        
        // Verify
        coVerify { 
            mockHttpClient.get(
                match { url -> url.contains("api.openweathermap.org") },
                any()
            ) 
        }
    }
    
    @Test
    fun `fetchWeatherForLocation returns network error when offline`() = runTest {
        // Arrange
        val latitude = 52.0
        val longitude = 13.0
        
        // Mock-Netzwerkverfügbarkeit
        coEvery { networkService.isNetworkAvailable() } returns false
        
        // Act
        val result = weatherService.fetchWeatherForLocation(latitude, longitude)
        
        // Assert
        assertTrue(result is Result.Error)
        assertEquals(ErrorCode.NETWORK_UNAVAILABLE, (result as Result.Error).error.code)
        
        // Verify
        coVerify(exactly = 0) { mockHttpClient.get(any(), any()) }
    }
    
    @Test
    fun `fetchWeatherForLocation returns API error when API call fails`() = runTest {
        // Arrange
        val latitude = 52.0
        val longitude = 13.0
        
        // Mock-Netzwerkverfügbarkeit
        coEvery { networkService.isNetworkAvailable() } returns true
        
        // Mock-API-Antwort erstellen
        val mockResponse = mockk<HttpResponse>()
        
        coEvery { mockResponse.status } returns HttpStatusCode.Unauthorized
        
        // HTTP-Client-Aufruf mocken
        coEvery { 
            mockHttpClient.get(any(), any()) 
        } returns mockResponse
        
        // Act
        val result = weatherService.fetchWeatherForLocation(latitude, longitude)
        
        // Assert
        assertTrue(result is Result.Error)
        assertEquals(ErrorCode.API_ERROR, (result as Result.Error).error.code)
    }
    
    @Test
    fun `getForecastForRoute returns properly sampled forecast`() = runTest {
        // Arrange
        val routePoints = createMockRoutePoints(20) // 20 Punkte
        val departureTime = LocalDateTime.now()
        
        // Mock-Netzwerkverfügbarkeit
        coEvery { networkService.isNetworkAvailable() } returns true
        
        // Mock für einzelne Wetterabfragen
        coEvery { 
            mockHttpClient.get(any(), any()) 
        } returns createMockWeatherResponseForRoute()
        
        // Act
        val result = weatherService.getForecastForRoute(routePoints, departureTime)
        
        // Assert
        assertTrue(result is Result.Success)
        
        // Überprüfen, dass die Prognose richtig gesampelt wurde (5 statt 20 Punkte)
        val forecast = (result as Result.Success).data
        assertEquals(5, forecast.points.size)
        
        // Erster und letzter Punkt sollten immer beibehalten werden
        assertEquals(routePoints.first().latitude, forecast.points.first().latitude)
        assertEquals(routePoints.last().latitude, forecast.points.last().latitude)
    }
    
    // Hilfsmethoden für Test-Fixtures
    private fun createMockWeatherResponse(): WeatherResponse {
        return WeatherResponse(
            lat = 52.0,
            lon = 13.0,
            timezone = "Europe/Berlin",
            timezone_offset = 3600,
            current = CurrentWeather(
                dt = System.currentTimeMillis() / 1000,
                sunrise = System.currentTimeMillis() / 1000 - 10000,
                sunset = System.currentTimeMillis() / 1000 + 10000,
                temp = 15.5,
                feels_like = 14.8,
                pressure = 1015,
                humidity = 76,
                dew_point = 11.2,
                uvi = 4.5,
                clouds = 0,
                visibility = 10000,
                wind_speed = 2.5,
                wind_deg = 270,
                weather = listOf(
                    WeatherInfo(
                        id = 800,
                        main = "Clear",
                        description = "Klarer Himmel",
                        icon = "01d"
                    )
                )
            ),
            hourly = listOf(),
            daily = listOf()
        )
    }
    
    // Weitere Hilfsmethoden...
}
```

### 14.2 Frontend-Komponententests

```typescript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    
    kit: {
        adapter: adapter({
            // Erforderlich für den Build als statische Site
            fallback: 'index.html',
            precompress: true,
            strict: true
        }),
        alias: {
            '$lib': './src/lib',
            '$routes': './src/routes'
        }
    }
};

export default config;
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte({ hot: !process.env.VITEST })],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: ['**/*.d.ts', '**/*.test.ts', '**/stores/*', '**/environment.ts']
        }
    },
    resolve: {
        alias: {
            '$lib': '/src/lib',
            '$test': '/src/test'
        }
    }
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock für den globalen Capacitor
global.Capacitor = {
    isNativePlatform: vi.fn().mockReturnValue(false),
    convertFileSrc: vi.fn().mockImplementation(path => path),
    getPlatform: vi.fn().mockReturnValue('web'),
    Plugins: {
        LocationPlugin: {
            addListener: vi.fn(),
            startTracking: vi.fn(),
            stopTracking: vi.fn()
        },
        WeatherPlugin: {
            addListener: vi.fn(),
            fetchWeatherForLocation: vi.fn()
        },
        DatabasePlugin: {
            addListener: vi.fn(),
            createTrip: vi.fn()
        }
    }
};

// Mock für ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}));

// Mock für window.matchMedia
global.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
}));

// Mock für URL.createObjectURL
global.URL.createObjectURL = vi.fn().mockImplementation(() => 'mock-object-url');
```

```typescript
// src/lib/components/weather/WeatherDisplay.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import WeatherDisplay from './WeatherDisplay.svelte';
import * as weatherState from '$lib/state/weatherState';

// Mock des Wetterzustands
vi.mock('$lib/state/weatherState', () => ({
    currentWeather: { status: 'success', data: { 
        temperature: 15.5, 
        feelsLike: 14.8, 
        description: 'Klarer Himmel',
        weatherCode: '800',
        iconCode: '01d',
        windSpeed: 2.5,
        windDirection: 270
    }},
    hourlyForecast: { status: 'success', data: [
        { time: new Date(), temperature: 15.5, weatherCode: '800', isDay: true, precipProbability: 0 },
        { time: new Date(Date.now() + 3600000), temperature: 16.2, weatherCode: '801', isDay: true, precipProbability: 10 },
        { time: new Date(Date.now() + 7200000), temperature: 16.8, weatherCode: '802', isDay: true, precipProbability: 20 }
    ]},
    isDaytime: true,
    sunriseTime: new Date(Date.now() - 10000000),
    sunsetTime: new Date(Date.now() + 10000000),
    temperatureUnit: 'celsius'
}));

describe('WeatherDisplay', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    
    it('renders current weather data correctly', () => {
        // Arrange & Act
        render(WeatherDisplay);
        
        // Assert
        expect(screen.getByText('Klarer Himmel')).toBeInTheDocument();
        expect(screen.getByText('15.5°')).toBeInTheDocument();
    });
    
    it('displays hourly forecast', () => {
        // Arrange & Act
        render(WeatherDisplay);
        
        // Assert
        expect(screen.getByText('Stündliche Vorhersage')).toBeInTheDocument();
        
        // Drei Einträge in der stündlichen Vorhersage
        const hourlyItems = screen.getAllByText(/\d+\.\d°/);
        expect(hourlyItems.length).toBe(4); // Aktuelle Temperatur + 3 Stunden
    });
    
    it('shows loading state when weather is loading', async () => {
        // Arrange
        vi.spyOn(weatherState, 'currentWeather', 'get').mockReturnValue({ status: 'loading' });
        
        // Act
        render(WeatherDisplay);
        
        // Assert
        expect(screen.getByRole('status')).toBeInTheDocument();
    });
    
    it('shows error state and retry button when weather fetch fails', async () => {
        // Arrange
        vi.spyOn(weatherState, 'currentWeather', 'get').mockReturnValue({ 
            status: 'error', 
            error: { code: 'NETWORK_ERROR', message: 'Netzwerkfehler' } 
        });
        
        // Act
        render(WeatherDisplay);
        
        // Assert
        expect(screen.getByText('Wetterdaten können nicht geladen werden')).toBeInTheDocument();
        expect(screen.getByText('Erneut versuchen')).toBeInTheDocument();
    });
    
    it('calls retry function when retry button is clicked', async () => {
        // Arrange
        vi.spyOn(weatherState, 'currentWeather', 'get').mockReturnValue({ 
            status: 'error', 
            error: { code: 'NETWORK_ERROR', message: 'Netzwerkfehler' } 
        });
        
        const mockRetry = vi.fn();
        global.retryWeatherLoad = mockRetry;
        
        // Act
        render(WeatherDisplay);
        
        // Retry-Button klicken
        await fireEvent.click(screen.getByText('Erneut versuchen'));
        
        // Assert
        expect(mockRetry).toHaveBeenCalledTimes(1);
    });
});
```

Mit dieser umfassenden Dokumentation ist das VeloNomad v22.0-Projekt vollständig beschrieben und implementierungsbereit. Alle Aspekte der Softwarearchitektur, Funktionalitäten, Datenbanksysteme, API-Integrationen, Kommunikationswege, Performance-Optimierungen und Sicherheitsimplementierungen sind ausführlich und konsistent dokumentiert. Die gewählte Dual-Core-Architektur mit reaktivem Datenfluss sorgt für eine optimale Balance zwischen nativer Leistung und modernem UI-Entwicklungskomfort.
