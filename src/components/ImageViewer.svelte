<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { symbolManager } from '../storage/symbols.svelte';
  import { addSymbol, deleteSymbol, updateSymbol } from '../storage/symbols.svelte';
  import { toolManager } from '../storage/symbols.svelte';
  import type { Symbol } from '../storage/symbols.svelte';
  import type { ImageTab, Grid, GridCell, Selection } from '../types/image';
  import Toolbar from './Toolbar.svelte';

  let {imageTabs} = $props();
  let activeTabId = $derived(imageTabs[0].id);
  let selectedGrid = $state<Grid | null>(null);
  let selectionStart = $state<{ x: number; y: number } | null>(null);
  let selectionEnd = $state<{ x: number; y: number } | null>(null);
  let imageContainer: HTMLElement;
  let selections = $state<Selection[]>([]);
  let imageElement = $state<HTMLImageElement | null>(null);
  let containerDimensions = $state({ width: 0, height: 0 });
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;
  let imageOffset = $state({ x: 0, y: 0 });
  let zoomLevel = $state(1);
  let isDragging = $state(false);
  let lastMousePos = $state({ x: 0, y: 0 });
  let isGridMode = $state(false);
  let isDeleteMode = $state(false);
  let gridCharCount = $state(0);
  let isAdjustingGrid = $state(false);
  let adjustingCellIndex = $state<number | null>(null);
  let initialAdjustX = $state<number | null>(null);
  let adjustingSelectionId = $state<string | null>(null);

  // Función para actualizar las dimensiones del contenedor
  function updateContainerDimensions() {
    if (imageContainer) {
      const rect = imageContainer.getBoundingClientRect();
      containerDimensions = {
        width: rect.width,
        height: rect.height
      };
    }
  }

  // Manejador del evento resize
  function handleResize() {
    updateContainerDimensions();
  }

  onMount(() => {
    window.addEventListener('resize', handleResize);
    updateContainerDimensions();
    if (canvas) {
      ctx = canvas.getContext('2d');
      window.addEventListener('resize', () => {
        requestAnimationFrame(updateCanvas);
      });
      // Si ya hay una imagen activa, cargarla
      if (activeTab?.imageUrl) {
        loadImage(activeTab.imageUrl);
      }
    }
  });

  onDestroy(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('resize', () => {
      requestAnimationFrame(updateCanvas);
    });
  });

  // Función para obtener dimensiones actuales de la imagen
  function getImageDimensions() {
    if (!imageElement || !canvas) return { width: 0, height: 0, x: 0, y: 0, scale: 1 };

    const containerRect = canvas.getBoundingClientRect();
    const imageAspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
    const containerAspectRatio = containerRect.width / containerRect.height;

    let width, height;

    if (containerAspectRatio > imageAspectRatio) {
      height = containerRect.height;
      width = height * imageAspectRatio;
    } else {
      width = containerRect.width;
      height = width / imageAspectRatio;
    }

    // Aplicar zoom
    width *= zoomLevel;
    height *= zoomLevel;

    return {
      width,
      height,
      x: imageOffset.x,
      y: imageOffset.y,
      scale: width / imageElement.naturalWidth
    };
  }

 
  function loadImage(url: string) {
    const img = new Image();
    img.onload = () => {
      imageElement = img;
      if (canvas && !ctx) {
        ctx = canvas.getContext('2d');
      }
      requestAnimationFrame(() => {
        updateCanvas();
      });
    };
    img.src = url;
  }

  $effect(() => {
    if (activeTab?.imageUrl) {
      loadImage(activeTab.imageUrl);
    }
  });

  function handleFileUpload(event: CustomEvent) {
    const { id, name, imageUrl } = event.detail;
    const newTab: ImageTab = { id, name, imageUrl };
    imageTabs = [...imageTabs, newTab];
    activeTabId = newTab.id;
  }

  function selectTab(tabId: string) {
    activeTabId = tabId;
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    
    const zoomSpeed = 0.1;
    const mousePos = getCanvasCoordinates(event);
    
    
    // Calcular el zoom anterior y nuevo
    const oldZoom = zoomLevel;
    zoomLevel = Math.min(Math.max(0.1, zoomLevel - (event.deltaY * zoomSpeed / 100)), 5);
    
    // Calcular el nuevo offset para mantener el zoom centrado en el cursor
    const zoomDiff = zoomLevel - oldZoom;
    imageOffset.x -= (mousePos.x - imageOffset.x) * (zoomDiff / oldZoom);
    imageOffset.y -= (mousePos.y - imageOffset.y) * (zoomDiff / oldZoom);
    
    updateCanvas();
  }

  function getCanvasCoordinates(event: MouseEvent): { x: number, y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function getImageCoordinates(canvasX: number, canvasY: number): { x: number, y: number } {
    const dimensions = getImageDimensions();
    
    // Convertir coordenadas del canvas a coordenadas relativas a la imagen
    const x = (canvasX - dimensions.x) / dimensions.scale;
    const y = (canvasY - dimensions.y) / dimensions.scale;
    
    return { x, y };
  }

  function handleMouseDown(event: MouseEvent) {
    if (!canvas || !ctx || !imageElement) return;

    const canvasCoords = getCanvasCoordinates(event);
    const imageCoords = getImageCoordinates(canvasCoords.x, canvasCoords.y);

    // Verificar si se está intentando ajustar una celda
    const dimensions = getImageDimensions();
    for (const selection of selections) {
      const gridCells = selection.gridCells;
      if (gridCells) {
        const x = imageOffset.x + (selection.xPercent * dimensions.width / 100);
        const y = imageOffset.y + (selection.yPercent * dimensions.height / 100);
        const width = (selection.widthPercent * dimensions.width / 100);
        const height = (selection.heightPercent * dimensions.height / 100);

        gridCells.forEach((cell, index) => {
          if (index < gridCells.length - 1) {
            const cellX = x + (width * cell.startPercent / 100) + (width * cell.widthPercent / 100);
            const cellY = y + height / 2;

            // Verificar si el clic está cerca del manipulador de redimensionamiento
            if (Math.abs(canvasCoords.x - cellX) < 5 && Math.abs(canvasCoords.y - cellY) < 5) {
              isAdjustingGrid = true;
              adjustingCellIndex = index;
              initialAdjustX = canvasCoords.x;
              adjustingSelectionId = selection.id;
              return;
            }
          }
        });
      }
    }

    // Si no estamos ajustando una celda, proceder con la selección normal
    if (!isAdjustingGrid) {
      if (event.button === 0) { // Click izquierdo: iniciar selección
        if (isInsideImage(canvasCoords.x, canvasCoords.y)) {
          selectionStart = imageCoords;
          selectionEnd = { ...imageCoords };
          updateCanvas();
        }
      } else if (event.button === 1 || event.button === 2) { // Click medio o derecho: iniciar arrastre
        isDragging = true;
        lastMousePos = canvasCoords;
        canvas.style.cursor = 'grab';
      }
    }

    if (toolManager.tool.type === 'delete') {
      const dimensions = getImageDimensions();
      // Buscar la selección que fue clickeada
      const clickedSelection = selections.find(selection => {
        const x = imageOffset.x + (selection.xPercent * dimensions.width / 100);
        const y = imageOffset.y + (selection.yPercent * dimensions.height / 100);
        const width = (selection.widthPercent * dimensions.width / 100);
        const height = (selection.heightPercent * dimensions.height / 100);

        return canvasCoords.x >= x && 
               canvasCoords.x <= x + width && 
               canvasCoords.y >= y && 
               canvasCoords.y <= y + height;
      });

      if (clickedSelection) {
        removeSelection(clickedSelection.id);
      }
      return; // Evitar crear una nueva selección mientras estamos en modo borrado
    }
  }

  function handleMouseMove(event: MouseEvent) {
    const canvasCoords = getCanvasCoordinates(event);
    
    if (isAdjustingGrid && adjustingCellIndex !== null && initialAdjustX !== null && adjustingSelectionId) {
      const deltaX = canvasCoords.x - initialAdjustX;
      
      // Encontrar la selección específica que se está ajustando
      const selection = selections.find(s => s.id === adjustingSelectionId);
      if (selection && selection.gridCells) {
        const dimensions = getImageDimensions();
        const totalWidth = (selection.widthPercent * dimensions.width / 100);
        const deltaPercent = (deltaX / totalWidth) * 100;

        // Ajustar los anchos de las celdas adyacentes
        const cells = [...selection.gridCells];
        const currentCell = cells[adjustingCellIndex];
        const nextCell = cells[adjustingCellIndex + 1];

        // Asegurarse de que ninguna celda sea más pequeña que un mínimo
        const minWidth = 1; // 10% del ancho total
        const maxAdjustment = Math.min(
          currentCell.widthPercent - minWidth,
          nextCell.widthPercent + deltaPercent - minWidth
        );

        if (maxAdjustment > 0 || deltaPercent < 0) {
          currentCell.widthPercent += deltaPercent;
          nextCell.startPercent += deltaPercent;
          nextCell.widthPercent -= deltaPercent;
        }

        selection.gridCells = cells;
        initialAdjustX = canvasCoords.x;
        updateCanvas();
        
        // Actualizar los símbolos cuando se ajusta la grid
        updateGridSymbols(selection).catch(error => {
          console.error('Error updating grid symbols:', error);
        });
      }
    } else if (isDragging) {
      imageOffset.x += canvasCoords.x - lastMousePos.x;
      imageOffset.y += canvasCoords.y - lastMousePos.y;
      lastMousePos = canvasCoords;
      updateCanvas();
    } else if (selectionStart) {
      selectionEnd = getImageCoordinates(canvasCoords.x, canvasCoords.y);
      updateCanvas();
    }
  }

  function handleMouseUp(event: MouseEvent) {
    if (isAdjustingGrid) {
      isAdjustingGrid = false;
      adjustingCellIndex = null;
      initialAdjustX = null;
      adjustingSelectionId = null; // Limpiar el ID de la selección que se estaba ajustando
      return;
    }

    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'default';
      return;
    }

    if (!selectionStart || !selectionEnd || !canvas || !imageElement) return;

    const xPercent = (Math.min(selectionStart.x, selectionEnd.x) / imageElement.naturalWidth) * 100;
    const yPercent = (Math.min(selectionStart.y, selectionEnd.y) / imageElement.naturalHeight) * 100;
    const widthPercent = (Math.abs(selectionEnd.x - selectionStart.x) / imageElement.naturalWidth) * 100;
    const heightPercent = (Math.abs(selectionEnd.y - selectionStart.y) / imageElement.naturalHeight) * 100;

    if (widthPercent > 0.1 && heightPercent > 0.1) {
      const newSelection: Selection = {
        id: crypto.randomUUID(),
        xPercent,
        yPercent,
        widthPercent,
        heightPercent,
        isPermanent: false
      };

      if (isGridMode) {
        // Crear celdas de igual tamaño inicialmente
        newSelection.gridCells = Array.from({ length: gridCharCount }, (_, i) => ({
          startPercent: (i * 100) / gridCharCount,
          widthPercent: 100 / gridCharCount
        }));
        createGridSymbols(newSelection);
      } else {
        createSymbolFromSelection(newSelection);
      }

      selections = [...selections, newSelection];
    }

    selectionStart = null;
    selectionEnd = null;
    updateCanvas();
  }

  function removeSelection(id: string): void {
    const selection = selections.find((s: Selection) => s.id === id);
    if (selection?.symbolIds) {
      selection.symbolIds.forEach((symbolId: string) => {
        deleteSymbol(symbolId);
      });
    }
    selections = selections.filter((s: Selection) => s.id !== id);
    updateCanvas();
  }

  function createSymbolFromSelection(selection: Selection): void {
    if (!activeTab) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = activeTab.imageUrl;
    
    img.onload = async () => {
      const realX = (selection.xPercent / 100) * img.naturalWidth;
      const realY = (selection.yPercent / 100) * img.naturalHeight;
      const realWidth = (selection.widthPercent / 100) * img.naturalWidth;
      const realHeight = (selection.heightPercent / 100) * img.naturalHeight;

      canvas.width = realWidth;
      canvas.height = realHeight;
      
      ctx.drawImage(
        img,
        realX,
        realY,
        realWidth,
        realHeight,
        0,
        0,
        realWidth,
        realHeight
      );

      const croppedImageUrl = canvas.toDataURL('image/png');
      
      const symbolId = addSymbol({
        id: crypto.randomUUID(),
        imageUrl: croppedImageUrl,
        char: ''
      });

      // Update the selection with the new symbol ID
      selection.symbolIds = [symbolId];
    };
  }

  function updateCanvas() {
    if (!canvas || !ctx || !imageElement) return;

    // Ajustar el canvas al tamaño del contenedor
    const containerRect = imageContainer.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Obtener las dimensiones de la imagen ajustadas
    const dimensions = getImageDimensions();

    // Dibujar la imagen
    try {
      ctx.drawImage(imageElement, dimensions.x, dimensions.y, dimensions.width, dimensions.height);

      // Dibujar la cuadrícula si está activa
      if (selectedGrid) {
        drawGrid(dimensions.width, dimensions.height);
      }

      // Dibujar las selecciones
      drawSelections(dimensions.width, dimensions.height);
    } catch (error) {
      console.error('Error dibujando en el canvas:', error);
    }
  }

  function drawGrid(drawWidth: number, drawHeight: number) {
    if (!ctx || !selectedGrid) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;

    // Dibujar líneas verticales
    for (let i = 1; i < selectedGrid.cols; i++) {
      const x = imageOffset.x + (drawWidth / selectedGrid.cols) * i;
      ctx.beginPath();
      ctx.moveTo(x, imageOffset.y);
      ctx.lineTo(x, imageOffset.y + drawHeight);
      ctx.stroke();
    }

    // Dibujar líneas horizontales
    for (let i = 1; i < selectedGrid.rows; i++) {
      const y = imageOffset.y + (drawHeight / selectedGrid.rows) * i;
      ctx.beginPath();
      ctx.moveTo(imageOffset.x, y);
      ctx.lineTo(imageOffset.x + drawWidth, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSelections(drawWidth: number, drawHeight: number) {
    if (!ctx || !imageElement) return;

    const dimensions = getImageDimensions();
    const scale = dimensions.scale;

    // Dibujar las selecciones permanentes
    selections.forEach(selection => {
      const x = imageOffset.x + (selection.xPercent * drawWidth / 100);
      const y = imageOffset.y + (selection.yPercent * drawHeight / 100);
      const width = (selection.widthPercent * drawWidth / 100);
      const height = (selection.heightPercent * drawHeight / 100);
      drawSelection(x, y, width, height, true, selection.gridCells);
    });

    // Dibujar la selección actual
    if (selectionStart && selectionEnd) {
      const x = Math.min(selectionStart.x, selectionEnd.x) * scale + imageOffset.x;
      const y = Math.min(selectionStart.y, selectionEnd.y) * scale + imageOffset.y;
      const width = Math.abs(selectionEnd.x - selectionStart.x) * scale;
      const height = Math.abs(selectionEnd.y - selectionStart.y) * scale;

      // Si estamos en modo grid, calcular las celdas temporales
      if (isGridMode && gridCharCount > 0) {
        const tempCells = Array.from({ length: gridCharCount }, (_, i) => ({
          startPercent: (i * 100) / gridCharCount,
          widthPercent: 100 / gridCharCount
        }));
        drawSelection(x, y, width, height, false, tempCells);
      } else {
        drawSelection(x, y, width, height, false);
      }
    }
  }

  function drawSelection(x: number, y: number, width: number, height: number, isPermanent: boolean, gridCells?: GridCell[]) {
    if (!ctx) return;

    ctx.save();
    
    // Dibujar el área de selección
    ctx.fillStyle = 'rgba(0, 123, 255, 0.3)';
    ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    // Dibujar las líneas de la grid si hay celdas
    if (gridCells && ctx) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      
      gridCells.forEach((cell, index) => {
        if (index < gridCells.length - 1 && ctx) {
          const cellX = x + (width * cell.startPercent / 100) + (width * cell.widthPercent / 100);
          
          // Dibujar línea divisoria
          ctx.beginPath();
          ctx.moveTo(cellX, y);
          ctx.lineTo(cellX, y + height);
          ctx.stroke();

          // Dibujar el manipulador de redimensionamiento
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(cellX, y + height / 2, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      });
    }

    ctx.restore();
  }

  function isInsideImage(x: number, y: number): boolean {
    if (!imageElement) return false;
    const dimensions = getImageDimensions();
    return x >= dimensions.x && 
           x <= dimensions.x + dimensions.width &&
           y >= dimensions.y && 
           y <= dimensions.y + dimensions.height;
  }

  $effect(() => {
    if (toolManager.tool.type === 'grid') {
      isGridMode = true;
      gridCharCount = toolManager.tool.charCount;
    } else if (toolManager.tool.type === 'delete') {
      isDeleteMode = true;
    } else {
      isGridMode = false;
    }
  });

  function createGridSymbols(selection: Selection): void {
    if (!activeTab) return;

    const img = new Image();
    img.src = activeTab.imageUrl;
    
    img.onload = async () => {
      const realX = (selection.xPercent / 100) * img.naturalWidth;
      const realY = (selection.yPercent / 100) * img.naturalHeight;
      const realWidth = (selection.widthPercent / 100) * img.naturalWidth;
      const realHeight = (selection.heightPercent / 100) * img.naturalHeight;

      // Create a symbol for each cell
      const symbolIds: string[] = [];
      for (let i = 0; i < (selection.gridCells?.length ?? 0); i++) {
        const cell = selection.gridCells?.[i];
        if (!cell) continue;

        const cellCanvas = document.createElement('canvas');
        const cellCtx = cellCanvas.getContext('2d');
        if (!cellCtx) continue;

        const cellX = realX + (realWidth * cell.startPercent / 100);
        const cellWidth = realWidth * cell.widthPercent / 100;
        
        cellCanvas.width = cellWidth;
        cellCanvas.height = realHeight;
        
        cellCtx.drawImage(
          img,
          cellX,
          realY,
          cellWidth,
          realHeight,
          0,
          0,
          cellWidth,
          realHeight
        );

        const imageUrl = cellCanvas.toDataURL('image/png');
        const symbolId = addSymbol({
          id: crypto.randomUUID(),
          imageUrl: imageUrl,
          char: String.fromCharCode(65 + i) // A, B, C, etc.
        });
        symbolIds.push(symbolId);
      }

      // Save the symbol IDs in the selection
      selection.symbolIds = symbolIds;
    };
  }

  async function updateGridSymbols(selection: Selection) {
    if (!activeTab || !selection.gridCells || !selection.symbolIds) return;

    const img = new Image();
    img.src = activeTab.imageUrl;
    
    await new Promise((resolve) => {
      img.onload = async () => {
        const realX = (selection.xPercent / 100) * img.naturalWidth;
        const realY = (selection.yPercent / 100) * img.naturalHeight;
        const realWidth = (selection.widthPercent / 100) * img.naturalWidth;
        const realHeight = (selection.heightPercent / 100) * img.naturalHeight;

        // Actualizar cada símbolo secuencialmente
        for (let i = 0; i < selection.gridCells!.length; i++) {
          const cell = selection.gridCells![i];
          const symbolId = selection.symbolIds![i];

          const cellCanvas = document.createElement('canvas');
          const cellCtx = cellCanvas.getContext('2d');
          if (!cellCtx) continue;

          const cellX = realX + (realWidth * cell.startPercent / 100);
          const cellWidth = realWidth * cell.widthPercent / 100;
          
          cellCanvas.width = cellWidth;
          cellCanvas.height = realHeight;
          
          cellCtx.drawImage(
            img,
            cellX,
            realY,
            cellWidth,
            realHeight,
            0,
            0,
            cellWidth,
            realHeight
          );

          const imageUrl = cellCanvas.toDataURL('image/png');
          updateSymbol(symbolId, {
            imageUrl: imageUrl
          });

          // Esperar un pequeño tiempo entre cada actualización
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        resolve(null);
      };
    });
  }

  const activeTab = $derived(imageTabs.find((tab: ImageTab) => tab.id === activeTabId));
</script>

<style>
  .viewer-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .tabs-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    overflow: hidden;
  }

  .tab-list {
    display: flex;
    padding: 0.5rem;
    border-bottom: 1px solid #ddd;
    background: white;
    overflow-x: auto;
  }

  .tab-button {
    border: none;
    background: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    color: #666;
    font-size: 0.9rem;
    white-space: nowrap;
    margin-right: 0.5rem;
  }

  .tab-button:hover {
    color: #ff3e00;
  }

  .tab-button.active {
    border-bottom-color: #ff3e00;
    color: #ff3e00;
  }

  .tab-content {
    flex: 1;
    position: relative;
    overflow: hidden;
    height: 100%;
  }

  .image-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f8f8;
  }

  canvas {
    max-width: 100%;
    max-height: 100%;
    display: block;
  }

  .empty-state {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    background: #f8f8f8;
    font-size: 1.1rem;
  }
</style>

<div class="viewer-container">
  {#if imageTabs.length > 0}
    <div class="tabs-container">
      <div class="tab-list">
        {#each imageTabs as tab}
          <button
            class="tab-button"
            class:active={activeTabId === tab.id}
            on:click={() => selectTab(tab.id)}
          >
            {tab.name}
          </button>
        {/each}
      </div>

      <div class="tab-content">
        {#if activeTab}
          <div class="image-container"
               bind:this={imageContainer}>
            <canvas
              bind:this={canvas}
              on:mousedown={handleMouseDown}
              on:mousemove={handleMouseMove}
              on:mouseup={handleMouseUp}
              on:mouseleave={handleMouseUp}
              on:wheel={handleWheel}
              on:contextmenu|preventDefault
            ></canvas>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="empty-state">
      Upload an image to get started
    </div>
  {/if}
</div> 