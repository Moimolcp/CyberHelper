<script lang="ts">
  import { getWordsByQuery } from "../lib/db";
  import {
    symbolManager,
    updateSymbol,
    deleteSymbol,
    createGroup,
    addSymbolToGroup,
    deleteGroup,
    updateGroup,
  } from "../storage/symbols.svelte";
  import { type Symbol, type SymbolGroup } from "../storage/symbols.svelte";

  let editingSymbol: Symbol | null = $state(null);
  let isZoomed = $state(false);
  let draggedSymbol: Symbol | null = $state(null);
  let dropTarget: SymbolGroup | null = $state(null);
  let draggedOverSymbol: Symbol | null = $state(null);
  let editingGroup: SymbolGroup | null = $state(null);
  let selectedSymbolIds = $state<string[]>([]);

  const symbols = $derived(symbolManager.symbols);
  const symbolGroups = $derived(symbolManager.groups);
  const ungroupedSymbols = $derived(
    symbols.filter(
      (symbol) =>
        !symbolGroups.some((group) => group.symbols.includes(symbol.id)),
    ),
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
    selectedSymbolIds = selectedSymbolIds.includes(symbol.id)
      ? selectedSymbolIds.filter((id) => id !== symbol.id)
      : [...selectedSymbolIds, symbol.id];

    //previewSymbol = previewSymbol?.id === symbol.id ? null : symbol;
    //isZoomed = false;
  }

  function handleNewEmptyGroup() {
    createGroup([]);
  }

  function toggleZoom() {
    isZoomed = !isZoomed;
  }

  function handleGroupClick(group: SymbolGroup) {
    selectedGroup = selectedGroup?.id === group.id ? null : group;
  }

  function handleAddSelectedSymbolsToGroup(group: SymbolGroup) {
    selectedSymbolIds.forEach((id) => {
      addSymbolToGroup(group.id, id);
    });
    selectedSymbolIds = [];
  }
  function handleDragStart(event: DragEvent, symbol: Symbol) {
    draggedSymbol = symbol;
    if (event.dataTransfer) {
      event.dataTransfer.setData("text/plain", symbol.id);
      event.dataTransfer.effectAllowed = "move";
    }
  }

  function handleDragOver(
    event: DragEvent,
    target: SymbolGroup | Symbol | null = null,
  ) {
    event.preventDefault();
    if (target && "symbols" in target) {
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
      if (selectedSymbolIds.includes(draggedSymbol.id)) {
        let groupId = dropTarget.id;
        selectedSymbolIds.forEach((id) => {
          addSymbolToGroup(groupId, id);
        });
        selectedSymbolIds = [];
      } else {
        addSymbolToGroup(dropTarget.id, draggedSymbol.id);
      }
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
    const firstSymbol = symbols.find((s) => group.symbols.includes(s.id));
    return firstSymbol?.imageUrl || null;
  }

  function removeSymbolFromGroup(groupId: string, symbolId: string) {
    const group = symbolGroups.find((g) => g.id === groupId);
    if (group) {
      const updatedSymbols = group.symbols.filter((id) => id !== symbolId);
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
          class:selected={selectedSymbolIds.includes(symbol.id)}
          draggable="true"
          ondragstart={(e) => handleDragStart(e, symbol)}
          ondragover={(e) => handleDragOver(e, symbol)}
          ondrop={handleDrop}
          ondragend={handleDragEnd}
          onclick={() => handleSymbolClick(symbol)}
        >
          <img src={symbol.imageUrl} alt="Symbol" class="symbol-image" />
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
                    <span class="group-char">{group.char || "?"}</span>
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
              {#if selectedSymbolIds.length > 0}
                <button
                  class="details-button"
                  onclick={() => handleAddSelectedSymbolsToGroup(group)}
                >
                  Add selected symbols
                </button>
              {/if}
              <button
                class="details-button"
                onclick={() => handleGroupClick(group)}
              >
                {selectedGroup?.id === group.id ? "Hide" : "Details"}
              </button>
            </div>

            {#if selectedGroup?.id === group.id}
              <div class="group-symbols">
                {#each group.symbols as symbolId}
                  {#if symbols.find((s) => s.id === symbolId)}
                    <div class="group-symbol-item">
                      <img
                        src={symbols.find((s) => s.id === symbolId)?.imageUrl}
                        alt="Group Symbol"
                        class="symbol-image"
                      />
                      <button
                        class="remove-symbol-btn"
                        onclick={() =>
                          removeSymbolFromGroup(group.id, symbolId)}
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
    <button class="details-button" onclick={() => handleNewEmptyGroup()}>
      Add new group
    </button>
  </section>

  {#if previewSymbol}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="preview-overlay" onclick={() => (previewSymbol = null)}>
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
    background-color: var(--clr-surface-a10);
    color: var(--clr-light-a0);

    height: 100%;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .symbols-section {
    background-color: var(--clr-surface-a10);
    color: var(--clr-light-a0);

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
    background-color: var(--clr-surface-a10);
    color: var(--clr-light-a0);

    border-radius: 4px;
    padding: 8px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  h2 {
    color: var(--clr-light-a0);
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 1rem;
    flex: 0 0 auto;
  }

  .empty-state {
    color: var(--clr-light-a0);
    text-align: center;
    padding: 1rem 0;
    font-size: 0.9rem;
  }

  .groups-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 4px; /* Space for scrollbar */
  }

  .group-header {
    background-color: var(--clr-surface-a20);
    color: var(--clr-light-a0);

    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #444; /* Borde más oscuro */
  }

  .group-item {
    background-color: var(--clr-surface-a10);
    color: var(--clr-light-a0);

    border: 1px solid #555; /* Borde más oscuro */
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: min-content;
    margin-bottom: 4px;
  }

  .group-item:hover {
    border-color: var(--clr-primary-a10);
  }

  .group-item.active {
    border-color: var(--clr-primary-a10);
    box-shadow: 0 0 0 1px var(--clr-primary-a10);
  }

  .group-preview {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .group-preview-image {
    background-color: var(--clr-surface-a10);
    color: var(--clr-light-a0);

    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  .group-info {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
  }

  .group-char {
    font-size: 1.2em;
    font-weight: 500;
    color: var(--clr-light-a0);
  }

  .group-char-input {
    width: 24px;
    height: 24px;
    text-align: center;
    font-size: 1.2em;
    padding: 0;
    border: 1px solid var(--clr-primary-a10);
    border-radius: 4px;
    outline: none;
  }

  .edit-btn {
    color: var(--clr-light-a0);
    padding: 4px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    opacity: 1;
    transition: opacity 0.2s ease;
  }

  .edit-btn:hover {
    color: var(--clr-primary-a10);
  }

  .group-actions {
    display: flex;
    gap: 8px;
  }

  .group-count {
    background-color: var(--clr-primary-a10);
    color: var(--clr-light-a0);

    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: 500;
  }

  .details-button {

    background-color: var(--clr-primary-a10);
    color: var(--clr-light-a0);
    
    padding: 4px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.2s;
    border: none;
    border-radius: 4px;
  }

  .details-button:hover {
    background-color: var(--clr-primary-a20);
  }

  .group-symbols {
    background: var(--clr-surface-a10);
    
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 8px;
  }

  .group-symbol-item {
    background: var(--clr-surface-a10);

    position: relative;
    aspect-ratio: 1;
    aspect-ratio: 1;
    border: 1px solid #ddd;
    aspect-ratio: 1;    
    border: 1px solid #ddd;
    border-radius: 2px;
    overflow: hidden;
  }

  .group-symbol-item img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .symbol-item {
    background: var(--clr-surface-a20);
    border: 1px solid var(--clr-surface-a30);
    border-radius: 4px;
    overflow: hidden;
    cursor: move;
    transition: all 0.2s ease;
    width: 50px;
    height: 50px;
    flex: 0 0 auto;
  }

  .symbol-item.active {
    border-color: var(--clr-primary-a10);
    box-shadow: 0 0 0 2px var(--clr-primary-a10);
    z-index: 2;
  }

  .symbol-item.dragging {
    opacity: 0.5;
  }

  .symbol-item.drop-target,
  .group-item.drop-target {
    border: 2px dashed var(--clr-primary-a10);    
  }

  .symbol-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .preview-overlay {
    background: var(--clr-surface-a10);   

    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .preview-content {
    background: var(--clr-surface-a10);

    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
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

  input {
    padding: 0.1rem 0.25rem;
    border: 1px solid #ddd;
    border-radius: 2px;
    font-size: 0.9rem;
    width: 25px;
    text-align: center;
  }

  input:focus {
    border-color: var(--clr-primary-a10);
    outline: none;
  }

  .action-btn {
    background: var(--clr-primary-a10);
    color: var(--clr-light-a0);

    padding: 0.1rem 0.35rem;
    padding: 0.1rem 0.35rem;
    border: 1px solid #ddd;
    padding: 0.1rem 0.35rem;    
    border: 1px solid #ddd;
    border-radius: 2px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
    min-width: 30px;
    border: none;
  }

  .action-btn:hover {
    background: var(--clr-surface-a20);    
  }

  .group-actions {
    margin-left: auto;
    display: flex;
    gap: 0.25rem;
  }

  .symbol-item {
    cursor: move;
  }

  .symbol-item:hover {
    background: var(--clr-surface-a30);
  }

  .remove-symbol-btn {
    background: none;
    color: var(--clr-primary-a0);

    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
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


  .symbol-item.selected {
    border-color: var(--clr-primary-a10);
    box-shadow: 0 0 0 1px var(--clr-primary-a10);
  }

</style>
