<script lang="ts">
  import { getWordsByQuery } from '../lib/db';
  import { symbolManager, updateSymbol, deleteSymbol, createGroup, addSymbolToGroup, deleteGroup, updateGroup } from '../storage/symbols.svelte';
  import { type Symbol, type SymbolGroup } from '../storage/symbols.svelte';


  let editingSymbol: Symbol | null = $state(null);
  let isZoomed = $state(false);
  let draggedSymbol: Symbol | null = $state(null);
  let dropTarget: SymbolGroup | null = $state(null);
  let draggedOverSymbol: Symbol | null = $state(null);
  let editingGroup: SymbolGroup | null = $state(null);

  const symbols = $derived(symbolManager.symbols);
  const symbolGroups = $derived(symbolManager.groups);
  const ungroupedSymbols = $derived(
    symbols.filter(symbol => 
      !symbolGroups.some(group => 
        group.symbols.includes(symbol.id)
      )
    )
  );
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

  function handleDragStart(event: DragEvent, symbol: Symbol) {
    draggedSymbol = symbol;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', symbol.id);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(event: DragEvent, target: SymbolGroup | Symbol | null = null) {
    event.preventDefault();
    if (target && 'symbols' in target) {
      dropTarget = target;
      draggedOverSymbol = null;
    } else if (target) {
      dropTarget = null;
      draggedOverSymbol = target;
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    if (!draggedSymbol) return;

    if (dropTarget) {
      // Agregar a grupo existente
      addSymbolToGroup(dropTarget.id, draggedSymbol.id);
    } else if (draggedOverSymbol && draggedOverSymbol.id !== draggedSymbol.id) {
      // Crear nuevo grupo con ambos símbolos
      const newGroup = createGroup([draggedSymbol.id, draggedOverSymbol.id]);
      if (newGroup) {
        // No necesitamos llamar a addSymbolToGroup porque createGroup ya los incluye
        draggedSymbol = null;
        dropTarget = null;
        draggedOverSymbol = null;
      }
    }
  }

  function handleDragEnd() {
    draggedSymbol = null;
    dropTarget = null;
    draggedOverSymbol = null;
  }

  function getGroupPreviewImage(group: SymbolGroup): string | null {
    const firstSymbol = symbols.find(s => group.symbols.includes(s.id));
    return firstSymbol?.imageUrl || null;
  }

  function removeSymbolFromGroup(groupId: string, symbolId: string) {
    const group = symbolGroups.find(g => g.id === groupId);
    if (group) {
      const updatedSymbols = group.symbols.filter(id => id !== symbolId);
      if (updatedSymbols.length === 0) {
        deleteGroup(group.id);
      } else {
        updateGroup(group.id, { symbols: updatedSymbols });
      }
    }
  }

  function handleEditGroup(group: SymbolGroup) {
    editingGroup = { ...group };
  }

  function handleSaveGroup() {
    if (editingGroup) {
      updateGroup(editingGroup.id, editingGroup);
      editingGroup = null;
    }
  }

  function handleCancelEditGroup() {
    editingGroup = null;
  }
</script>

<div class="symbol-list">
  <h2>Symbols</h2>
  <section class="symbols-section">    
    {#if ungroupedSymbols.length === 0}
      <div class="empty-state">No unassigned symbols</div>
    {:else}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        {#each ungroupedSymbols as symbol (symbol.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div 
            class="symbol-item" 
            class:active={previewSymbol?.id === symbol.id}
            class:dragging={draggedSymbol?.id === symbol.id}
            class:drop-target={draggedOverSymbol?.id === symbol.id}
            draggable="true"
            ondragstart={(e) => handleDragStart(e, symbol)}
            ondragover={(e) => handleDragOver(e, symbol)}
            ondrop={handleDrop}
            ondragend={handleDragEnd}
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
      <div class="empty-state">Drag symbols together to create groups</div>
    {:else}
      <div class="groups-list">
        {#each symbolGroups as group (group.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div 
            class="group-item"
            class:active={selectedGroup?.id === group.id}
            class:drop-target={dropTarget?.id === group.id}
            ondragover={(e) => handleDragOver(e, group)}
            ondrop={handleDrop}
          >
            <div class="group-header">
              <div class="group-preview">
                <img 
                  src={getGroupPreviewImage(group)} 
                  alt="Group preview" 
                  class="group-preview-image"
                />
                <div class="group-info">
                  {#if editingGroup?.id === group.id}
                    <input
                      type="text"
                      class="group-char-input"
                      placeholder="Char"
                      maxlength="1"
                      bind:value={editingGroup.char}
                    />
                    <div class="group-actions">
                      <button 
                        class="action-btn" 
                        onclick={handleSaveGroup}
                        title="Save"
                      >
                        ✓
                      </button>
                      <button 
                        class="action-btn cancel" 
                        onclick={handleCancelEditGroup}
                        title="Cancel"
                      >
                        ×
                      </button>
                    </div>
                  {:else}
                    <span class="group-char">{group.char || '?'}</span>
                    <button 
                      class="edit-btn"
                      onclick={() => handleEditGroup(group)}
                      title="Edit character"
                    >
                      ✎
                    </button>
                  {/if}
                  <span class="group-count">{group.symbols.length}</span>
                </div>
              </div>
              <button 
                class="details-button"
                onclick={() => handleGroupClick(group)}
              >
                {selectedGroup?.id === group.id ? 'Hide' : 'Details'}
              </button>
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
                      <button 
                        class="remove-symbol-btn"
                        onclick={() => removeSymbolFromGroup(group.id, symbolId)}
                        title="Remove from group"
                      >
                        ×
                      </button>
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
    justify-content: space-between;
    background: #f8f8f8;
    border-bottom: 1px solid #ddd;
  }

  .group-preview {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .group-preview-image {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 4px;
    border: 1px solid #ddd;
    background: white;
  }

  .group-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .group-char {
    font-size: 1.2em;
    font-weight: 500;
    color: #333;
    min-width: 24px;
    height: 24px;
    text-align: center;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0 4px;
    line-height: 24px;
  }

  .group-char-input {
    width: 24px;
    height: 24px;
    text-align: center;
    font-size: 1.2em;
    padding: 0;
    border: 1px solid #ff3e00;
    border-radius: 4px;
    outline: none;
  }

  .edit-btn {
    padding: 4px;
    border: none;
    background: none;
    color: #666;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .group-info:hover .edit-btn {
    opacity: 1;
  }

  .edit-btn:hover {
    color: #ff3e00;
  }

  .group-actions {
    display: flex;
    gap: 4px;
  }

  .group-count {
    background: #ff3e00;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: 500;
  }

  .details-button {
    padding: 4px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #333;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.2s ease;
  }

  .details-button:hover {
    background: #f0f0f0;
    border-color: #ccc;
  }

  .group-symbols {
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 8px;
    background: white;
  }

  .group-symbol-item {
    position: relative;
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
    cursor: move;
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

  .symbol-item.dragging {
    opacity: 0.5;
  }

  .symbol-item.drop-target,
  .group-item.drop-target {
    border: 2px dashed #ff3e00;
    background: rgba(255, 62, 0, 0.1);
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

  .remove-symbol-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 62, 0, 0.8);
    color: white;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: all 0.2s ease;
  }

  .group-symbol-item:hover .remove-symbol-btn {
    display: flex;
  }

  .remove-symbol-btn:hover {
    background: #ff3e00;
    transform: scale(1.1);
  }
</style> 