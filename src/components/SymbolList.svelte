<script lang="ts">
  import { symbolManager, updateSymbol, deleteSymbol } from '../storage/symbols.svelte';
  import { type Symbol, type SymbolGroup } from '../storage/symbols.svelte';

  let editingSymbol: Symbol | null = null;
  let isZoomed = $state(false);

  const symbols = $derived(symbolManager.symbols);
  const symbolGroups = $derived(symbolManager.groups);
  let previewSymbol: Symbol | null = $state(null);
  let selectedGroup: SymbolGroup | null = $state(null);

  function handleSaveSymbol() {
    if (editingSymbol) {
      updateSymbol(editingSymbol.id, { char: editingSymbol.char });
      editingSymbol = null;
    }
  }

  function handleEditSymbol(symbol: Symbol) {
    editingSymbol = symbol;
  }

  function handleDeleteSymbol(id: string) {
    deleteSymbol(id);
  }

  function handleSymbolClick(symbol: Symbol) {
    previewSymbol = previewSymbol?.id === symbol.id ? null : symbol;
    isZoomed = false;
  }

  function toggleZoom() {
    isZoomed = !isZoomed;
  }

  function handleGroupClick(group: SymbolGroup) {
    selectedGroup = selectedGroup?.id === group.id ? null : group;
  }
</script>

<div class="symbol-list">
  <h2>Symbols</h2>
  <section class="symbols-section">    
    {#if symbols.length === 0}
      <div class="empty-state">No symbols created yet</div>
    {:else}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        {#each symbols as symbol (symbol.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div 
            class="symbol-item" 
            class:active={previewSymbol?.id === symbol.id}
            onclick={() => handleSymbolClick(symbol)}
          >
            <img 
              src={symbol.imageUrl} 
              alt="Symbol" 
              class="symbol-image"
            />
          </div>
        {/each}
    {/if}
  </section>

  <section class="groups-section">
    <h2>Symbol Groups</h2>
    
    {#if symbolGroups.length === 0}
      <div class="empty-state">No groups created yet</div>
    {:else}
      <div class="groups-list">
        {#each symbolGroups as group (group.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div 
            class="group-item"
            class:active={selectedGroup?.id === group.id}
            onclick={() => handleGroupClick(group)}
          >
            <div class="group-header">
              <span class="group-name">{group.id}</span>
              <span class="group-count">({group.symbols.length})</span>
            </div>
            {#if selectedGroup?.id === group.id}
              <div class="group-symbols">
                {#each group.symbols as symbolId}
                  {#if symbols.find(s => s.id === symbolId)}
                    <div class="group-symbol-item">
                      <img 
                        src={symbols.find(s => s.id === symbolId)?.imageUrl} 
                        alt="Group Symbol" 
                        class="symbol-image"
                      />
                    </div>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>

  {#if previewSymbol}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="preview-overlay" onclick={() => previewSymbol = null}>
      <div class="preview-content">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <img 
          src={previewSymbol.imageUrl} 
          alt="Symbol preview" 
          class="preview-image"
          class:zoomed={isZoomed}
          onclick={toggleZoom}
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .symbol-list {
    height: 100%;
    padding: 8px;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .symbols-section {
    background: white;
    border-radius: 4px;
    padding: 1px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-content: flex-start;
    justify-content: space-evenly;
    overflow-y: auto;
  }

  .groups-section {
    background: white;
    border-radius: 4px;
    padding: 8px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 8px;
    color: #333;
    font-size: 1rem;
    flex: 0 0 auto;
  }

  .empty-state {
    color: #666;
    text-align: center;
    padding: 1rem 0;
    font-size: 0.9rem;
  }

  .groups-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    padding-right: 4px; /* Space for scrollbar */
  }

  .group-item {
    background: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .group-item:hover {
    border-color: #ff3e00;
  }

  .group-item.active {
    border-color: #ff3e00;
    box-shadow: 0 0 0 1px #ff3e00;
  }

  .group-header {
    padding: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
  }

  .group-name {
    font-weight: 500;
    color: #333;
  }

  .group-count {
    color: #666;
    font-size: 0.9em;
  }

  .group-symbols {
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 4px;
    background: white;
    border-top: 1px solid #ddd;
  }

  .group-symbol-item {
    aspect-ratio: 1;
    border: 1px solid #ddd;
    border-radius: 2px;
    overflow: hidden;
    background: white;
  }

  .group-symbol-item img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .symbol-item {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
    background: white;
    width: 50px;
    height: 50px;
    flex: 0 0 auto;
  }

  .symbol-item:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 1;
  }

  .symbol-item.active {
    border-color: #ff3e00;
    box-shadow: 0 0 0 2px #ff3e00;
    z-index: 2;
  }

  .symbol-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .preview-content {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
    max-width: 95%;
    max-height: 95vh;
    min-width: 500px;
    min-height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .preview-image {
    min-width: 500px;
    min-height: 500px;
    max-width: 90vw;
    max-height: 90vh;
    width: auto;
    height: auto;
    object-fit: contain;
    display: block;
    cursor: zoom-in;
    transition: transform 0.3s ease;
  }

  .preview-image.zoomed {
    cursor: zoom-out;
    transform: scale(2);
  }

  .symbol-info {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-grow: 1;
    min-width: 0;
  }

  .symbol-char {
    font-size: 0.9rem;
    font-weight: bold;
    color: #333;
    min-width: 16px;
    text-align: center;
    background: white;
    border: 1px solid #ddd;
    border-radius: 2px;
    padding: 0.1rem 0.25rem;
  }

  input {
    padding: 0.1rem 0.25rem;
    border: 1px solid #ddd;
    border-radius: 2px;
    font-size: 0.9rem;
    width: 25px;
    text-align: center;
  }

  input:focus {
    border-color: #ff3e00;
    outline: none;
  }

  .action-btn {
    padding: 0.1rem 0.35rem;
    border: 1px solid #ddd;
    border-radius: 2px;
    background: white;
    color: #333;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
    min-width: 30px;
  }

  .action-btn:hover {
    background: #f0f0f0;
    border-color: #ccc;
  }

  .action-btn.delete {
    color: #ff3e00;
    border-color: #ff3e00;
  }

  .action-btn.delete:hover {
    background: #fff0ed;
  }

  .action-btn.cancel {
    color: #666;
  }

  .action-btn.cancel:hover {
    background: #f0f0f0;
  }

  .symbol-group {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 0.25rem;
    overflow: hidden;
  }

  .group-actions {
    margin-left: auto;
    display: flex;
    gap: 0.25rem;
  }

  .group-input {
    padding: 0.1rem 0.25rem;
    border: 1px solid #ddd;
    border-radius: 2px;
    font-size: 0.9rem;
    width: 25px;
    text-align: center;
    background: white;
  }

  .group-input:focus {
    border-color: #ff3e00;
    outline: none;
  }

  .collapse-btn {
    padding: 0 0.25rem;
    border: none;
    background: none;
    cursor: pointer;
    color: #666;
    font-size: 0.8rem;
    line-height: 1;
  }

  .collapse-btn:hover {
    color: #333;
  }

  .drag-target {
    border: 2px dashed #ff3e00;
  }

  .symbol-item {
    cursor: move;
  }

  .symbol-item:hover {
    background: #f5f5f5;
  }

  .symbol-item.not-draggable {
    cursor: default;
    opacity: 0.9;
  }

  .symbol-item.not-draggable:hover {
    background: #f8f8f8;
  }
</style> 