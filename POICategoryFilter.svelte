<!-- src/lib/components/poi/POICategoryFilter.svelte -->
<script lang="ts">
    import { fly, slide } from 'svelte/transition';
    import { $state } from 'svelte';
    import { enabledCategories, enabledSubcategories, POI_CATEGORIES } from '$lib/utils/POIManager';
    
    // Status
    let isOpen = $state(false);
    let expandedCategories = $state(new Set());
    
    // Kategorie umschalten
    function toggleCategory(categoryId) {
      const isEnabled = $enabledCategories.includes(categoryId);
      
      if (isEnabled) {
        enabledCategories.update(cats => cats.filter(cat => cat !== categoryId));
        
        // Auch alle Subkategorien deaktivieren
        const subCategories = POI_CATEGORIES[categoryId.toUpperCase()].subcategories.map(sub => sub.id);
        enabledSubcategories.update(subs => 
          subs.filter(sub => !subCategories.includes(sub))
        );
      } else {
        enabledCategories.update(cats => [...cats, categoryId]);
        
        // Auch alle Subkategorien aktivieren
        const subCategories = POI_CATEGORIES[categoryId.toUpperCase()].subcategories.map(sub => sub.id);
        enabledSubcategories.update(subs => 
          [...new Set([...subs, ...subCategories])]
        );
      }
    }
    
    // Subkategorie umschalten
    function toggleSubcategory(subId, categoryId) {
      const isEnabled = $enabledSubcategories.includes(subId);
      
      if (isEnabled) {
        enabledSubcategories.update(subs => subs.filter(sub => sub !== subId));
        
        // Prüfen, ob alle Subkategorien der Hauptkategorie deaktiviert sind
        const categorySubIds = POI_CATEGORIES[categoryId.toUpperCase()].subcategories.map(sub => sub.id);
        const allDisabled = categorySubIds.every(sub => 
          !$enabledSubcategories.includes(sub)
        );
        
        // Wenn alle deaktiviert sind, auch Hauptkategorie deaktivieren
        if (allDisabled) {
          enabledCategories.update(cats => cats.filter(cat => cat !== categoryId));
        }
      } else {
        enabledSubcategories.update(subs => [...subs, subId]);
        
        // Sicherstellen, dass auch die Hauptkategorie aktiviert ist
        if (!$enabledCategories.includes(categoryId)) {
          enabledCategories.update(cats => [...cats, categoryId]);
        }
      }
    }
    
    // Kategorie ein-/ausklappen
    function toggleExpanded(categoryId) {
      if (expandedCategories.has(categoryId)) {
        expandedCategories.delete(categoryId);
      } else {
        expandedCategories.add(categoryId);
      }
    }
    
    // Alle Kategorien aktivieren
    function enableAll() {
      const allCats = Object.values(POI_CATEGORIES).map(cat => cat.id);
      const allSubCats = Object.values(POI_CATEGORIES).flatMap(cat => 
        cat.subcategories.map(sub => sub.id)
      );
      
      enabledCategories.set(allCats);
      enabledSubcategories.set(allSubCats);
    }
    
    // Alle Kategorien deaktivieren
    function disableAll() {
      enabledCategories.set([]);
      enabledSubcategories.set([]);
    }
  </script>
  
  <div class="poi-filter">
    <button 
      class="filter-toggle"
      on:click={() => isOpen = !isOpen}
    >
      <div class="filter-icon">🏷️</div>
      <span>POI-Filter {isOpen ? 'schließen' : 'öffnen'}</span>
    </button>
    
    {#if isOpen}
      <div 
        class="filter-panel"
        transition:fly={{ y: -20, duration: 300 }}
      >
        <div class="filter-header">
          <h3>Points of Interest filtern</h3>
          <div class="filter-actions">
            <button class="action-btn" on:click={enableAll}>Alle aktivieren</button>
            <button class="action-btn" on:click={disableAll}>Alle deaktivieren</button>
          </div>
        </div>
        
        <div class="categories-list">
          {#each Object.values(POI_CATEGORIES) as category}
            <div class="category-item">
              <div class="category-header">
                <label class="category-checkbox">
                  <input 
                    type="checkbox" 
                    checked={$enabledCategories.includes(category.id)}
                    on:change={() => toggleCategory(category.id)}
                  />
                  <div class="category-icon" style="background-color: {getCategoryColor(category.id)}">
                    <img src="/icons/poi/{category.icon}.svg" alt="" width="16" height="16" />
                  </div>
                  <span class="category-name">{category.name}</span>
                </label>
                
                <button 
                  class="expand-btn"
                  on:click={() => toggleExpanded(category.id)}
                  aria-label={expandedCategories.has(category.id) ? "Einklappen" : "Ausklappen"}
                >
                  <span class:rotated={expandedCategories.has(category.id)}>▸</span>
                </button>
              </div>
              
              {#if expandedCategories.has(category.id)}
                <div class="subcategories" transition:slide={{ duration: 200 }}>
                  {#each category.subcategories as subcategory}
                    <label class="subcategory-checkbox">
                      <input 
                        type="checkbox" 
                        checked={$enabledSubcategories.includes(subcategory.id)}
                        on:change={() => toggleSubcategory(subcategory.id, category.id)}
                      />
                      <div class="subcategory-icon">
                        <img src="/icons/poi/{subcategory.icon}.svg" alt="" width="14" height="14" />
                      </div>
                      <span class="subcategory-name">{subcategory.name}</span>
                    </label>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    .poi-filter {
      position: absolute;
      top: 70px;
      left: 10px;
      z-index: 100;
      display: flex;
      flex-direction: column;
    }
    
    .filter-toggle {
      display: flex;
      align-items: center;
      background-color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      font-weight: 500;
    }
    
    .filter-icon {
      margin-right: 8px;
    }
    
    .filter-panel {
      margin-top: 10px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      width: 300px;
      max-height: 60vh;
      overflow-y: auto;
    }
    
    .filter-header {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      position: sticky;
      top: 0;
      background-color: white;
      z-index: 5;
    }
    
    h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
    }
    
    .filter-actions {
      display: flex;
      gap: 8px;
    }
    
    .action-btn {
      font-size: 12px;
      padding: 4px 8px;
      border: none;
      border-radius: 4px;
      background-color: #f0f0f0;
      cursor: pointer;
    }
    
    .categories-list {
      padding: 8px 0;
    }
    
    .category-item {
      margin-bottom: 4px;
    }
    
    .category-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
    }
    
    .category-checkbox {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    
    .category-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      margin-right: 10px;
    }
    
    .category-name {
      font-weight: 500;
    }
    
    .expand-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    
    .expand-btn span {
      transition: transform 0.2s ease;
    }
    
    .expand-btn span.rotated {
      transform: rotate(90deg);
    }
    
    .subcategories {
      padding: 4px 16px 8px 40px;
      background-color: #f9f9f9;
    }
    
    .subcategory-checkbox {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      cursor: pointer;
    }
    
    .subcategory-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      margin-right: 8px;
      opacity: 0.7;
    }
    
    .subcategory-name {
      font-size: 13px;
    }
  </style>