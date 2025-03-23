<script lang="ts">
  import ImageViewer from './components/ImageViewer.svelte';
  import SymbolList from './components/SymbolList.svelte';
  import ToolPanel from './components/ToolPanel.svelte';
</script>

<div class="app">
  <ImageViewer>    
    <div slot="tools">
      <ToolPanel />
    </div>
    <div slot="symbols">
      <SymbolList />
    </div>
  </ImageViewer>
</div>

<style>
  .app {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
</style>
