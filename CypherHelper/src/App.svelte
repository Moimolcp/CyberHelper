<script lang="ts">
  import SymbolList from './components/SymbolList.svelte';
  import ImageViewer from './components/ImageViewer.svelte';
  import ToolPanel from './components/ToolPanel.svelte';

  let symbolListComponent: SymbolList;
  let imageViewerComponent: ImageViewer;

  interface Symbol {
    id: string;
    imageUrl: string;
    char: string;
  }

  let symbols: Symbol[] = [];

  function handleToolEvent(event: CustomEvent) {
    if (imageViewerComponent) {
      imageViewerComponent.handleToolEvent(event);
    }
  }

  function handleSymbolEvent(event: CustomEvent) {
    const { type, id, imageUrl, char } = event.detail;
    
    if (type === 'create') {
      const newSymbol = { id, imageUrl, char };
      symbols = [...symbols, newSymbol];
    } else if (type === 'update') {
      symbols = symbols.map((s: Symbol) => 
        s.id === id ? { ...s, imageUrl } : s
      );
    } else if (type === 'delete') {
      symbols = symbols.filter((s: Symbol) => s.id !== id);
      // Notificar al ImageViewer para que elimine la selección asociada
      if (imageViewerComponent) {
        imageViewerComponent.handleSymbolDelete(id);
      }
    }
  }
</script>

<ImageViewer 
  bind:this={imageViewerComponent}
  on:createSymbol={handleSymbolEvent}
  on:updateSymbol={handleSymbolEvent}
  on:deleteSymbol={handleSymbolEvent}
>
  <div slot="symbols">
    <SymbolList 
      bind:this={symbolListComponent} 
      bind:symbols
      on:deleteSymbol={handleSymbolEvent}
    />
  </div>
  <div slot="tools">
    <ToolPanel on:tool={handleToolEvent} />
  </div>
</ImageViewer>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #f5f5f5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
</style>
