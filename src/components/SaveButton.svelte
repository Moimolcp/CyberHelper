<script lang="ts">
    import { saveState } from '../storage/symbols.svelte';

    function handleSave() {
        saveState();
        // Mostrar una notificación temporal
        const notification = document.createElement('div');
        notification.textContent = 'Estado guardado';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1000;
            animation: fadeOut 2s forwards;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
</script>

<button 
    class="save-button"
    on:click={handleSave}
>
    Guardar estado
</button>

<style>
    .save-button {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
    }

    .save-button:hover {
        background-color: #45a049;
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
</style> 