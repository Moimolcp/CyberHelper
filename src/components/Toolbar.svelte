<script lang="ts">
  import ClearButton from './ClearButton.svelte';
  import SaveButton from './SaveButton.svelte';
  let {callbackFileUpload} = $props();

  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        callbackFileUpload({
          id: crypto.randomUUID(),
          name: file.name,
          imageUrl: e.target?.result as string
        })
      };
      reader.readAsDataURL(file);
    }
  }
</script>

<style>
  .toolbar {
    display: flex;
    padding: 0.5rem;
    background: #f8f8f8;
    border-bottom: 1px solid #ddd;
    z-index: 10;
    gap: 0.5rem;
  }

  .upload-container {
    display: flex;
    align-items: center;
  }

  .hidden {
    display: none;
  }

  .upload-button {
    background: #ff3e00;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .upload-button:hover {
    background: #ff2d00;
  }
</style>

<div class="toolbar">
  <div class="upload-container">
    <input
      type="file"
      accept="image/*"
      onchange={handleFileUpload}
      id="image-upload"
      class="hidden"
    />
    <label for="image-upload" class="upload-button">
      Upload Image
    </label>
  </div>
  <SaveButton />
  <ClearButton />
</div> 