<script lang="ts">
  import Layout from './components/Layout.svelte';
  import ImageViewer from './components/ImageViewer.svelte';
  import SymbolList from './components/SymbolList.svelte';
  import ToolPanel from './components/ToolPanel.svelte';
  import Toolbar from './components/Toolbar.svelte';
  import type { ImageTab } from './types/image';
  import { symbolManager } from './storage/symbols.svelte';

  function handleNewTab(tab: ImageTab) {
    symbolManager.imageTabs = [...symbolManager.imageTabs, tab];
  }
</script>

<Layout>
  <svelte:fragment slot="toolbar">
    <Toolbar callbackFileUpload={handleNewTab} />
  </svelte:fragment>
  <ImageViewer imageTabs={symbolManager.imageTabs} />
  <svelte:fragment slot="symbols">
    <SymbolList />
  </svelte:fragment>
  <svelte:fragment slot="tools">
    <ToolPanel />
  </svelte:fragment>
</Layout>

<style>
  .app {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
</style>
