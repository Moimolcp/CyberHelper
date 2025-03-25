export interface Symbol {
    id: string;
    imageUrl: string;
    char: string;
    groupId?: string;
}


export interface Tool {
    type: 'grid' | 'select' | 'link' | 'delete' | 'search';
    charCount: number;
}

export interface SymbolGroup {
    id: string;
    symbols: string[]; // Array of symbol IDs
    char: string;
    isCollapsed?: boolean;
}

export interface ImageTab {
    id: string;
    name: string;
    imageUrl: string;
}

export interface GridCell {
    startPercent: number;
    widthPercent: number;
}

export interface Selection {
    id: string;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
    symbolIds?: string[];
    isPermanent: boolean;
    gridCells?: GridCell[];
}

export const toolManager = $state({
    tool: <Tool>({
        type: 'select',
        charCount: 0
    })
})



export const symbolManager = $state({
    symbols: <Symbol[]>([]),
    groups: <SymbolGroup[]>([]),
    imageTabs: <ImageTab[]>([]),
    selections: <Selection[]>([])
})

const STORAGE_KEY = 'cypherHelperState';

export function saveState() {
    const state = {
        symbols: symbolManager.symbols,
        groups: symbolManager.groups,
        tool: toolManager.tool,
        imageTabs: symbolManager.imageTabs,
        selections: symbolManager.selections
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
        const state = JSON.parse(savedState);
        symbolManager.symbols = state.symbols || [];
        symbolManager.groups = state.groups || [];
        symbolManager.imageTabs = state.imageTabs || [];
        symbolManager.selections = state.selections || [];
        toolManager.tool = state.tool || { type: 'select', charCount: 0 };
    }
}

export function clearState() {
    localStorage.removeItem(STORAGE_KEY);
    symbolManager.symbols = [];
    symbolManager.groups = [];
    symbolManager.imageTabs = [];
    symbolManager.selections = [];
    toolManager.tool = {
        type: 'select',
        charCount: 0
    };
}

export function handleCreateSymbol(event: CustomEvent) {
    const { id, imageUrl, char } = event.detail;
    symbolManager.symbols = [...symbolManager.symbols, { id, imageUrl, char }];
    saveState();
}


export function addSymbol(symbol: Symbol): string {
    symbolManager.symbols = [...symbolManager.symbols, symbol];
    saveState();
    return symbol.id;
}

export function updateSymbol(id: string, updates: Partial<Symbol>) {
    symbolManager.symbols = symbolManager.symbols.map(symbol => 
        symbol.id === id ? { ...symbol, ...updates } : symbol
    );
    saveState();
}

export function deleteSymbol(id: string) {
    symbolManager.symbols = symbolManager.symbols.filter(s => s.id !== id);
    saveState();
}

export function updateTool(updates: Partial<Tool>) {
    toolManager.tool = { ...toolManager.tool, ...updates };
    saveState();
}

export function addSymbolGroup(group: SymbolGroup) {
    symbolManager.groups = [...symbolManager.groups, group];
    saveState();
}

export function deleteSymbolGroup(id: string) {
    symbolManager.groups = symbolManager.groups.filter(g => g.id !== id);
    saveState();
}

function getNextAvailableChar(): string {
    const usedChars = new Set(symbolManager.groups.map(g => g.char));
    for (let i = 97; i <= 122; i++) { // 97 es 'a' en ASCII, 122 es 'z'
        const char = String.fromCharCode(i);
        if (!usedChars.has(char)) {
            return char;
        }
    }
    return '_'; // Si todos los caracteres están usados
}

export function createGroup(symbolsIds: string[]) : SymbolGroup {
    const group: SymbolGroup = {
        id: crypto.randomUUID(),
        symbols: symbolsIds,
        char: getNextAvailableChar()
    }
    addSymbolGroup(group);

    // Actualizar el groupId y el char de los símbolos
    symbolManager.symbols = symbolManager.symbols.map(symbol => 
        symbolsIds.includes(symbol.id) ? { ...symbol, groupId: group.id, char: group.char } : symbol
    );

    saveState();
    return group;
}

export function addSymbolToGroup(groupId: string, symbolId: string) {
    const group = symbolManager.groups.find(g => g.id === groupId);
    if (group) {
        group.symbols.push(symbolId);
    }
    //update symbolgroup id
    symbolManager.symbols = symbolManager.symbols.map(symbol => 
        symbol.id === symbolId ? { ...symbol, groupId: groupId } : symbol
    );
    saveState();
}

export function deleteGroup(groupId: string) {
    symbolManager.groups = symbolManager.groups.filter(g => g.id !== groupId);
    saveState();
}

export function updateGroup(groupId: string, updates: Partial<SymbolGroup>) {
    
    console.log("updategroup maybe?");

    symbolManager.groups = symbolManager.groups.map(group => 
        group.id === groupId ? { ...group, ...updates } : group
    );

    let charValue = updates.char? updates.char : "_";

    symbolManager.symbols = symbolManager.symbols.map(symbol => 
        symbol.groupId === groupId ? { ...symbol, char: charValue } : symbol
    );

    saveState();
}

export function isSymbolInAnyGroup(symbolId1: string) {
    console.log(symbolId1);
    for (const group of symbolManager.groups) {
        for (const symbolId of group.symbols) {
            if (symbolId === symbolId1) {
                return true;
            }
        }
    }
    return false;
}

export function addImageTab(tab: ImageTab) {
    symbolManager.imageTabs = [...symbolManager.imageTabs, tab];
    saveState();
}

export function removeImageTab(id: string) {
    symbolManager.imageTabs = symbolManager.imageTabs.filter(tab => tab.id !== id);
    saveState();
}

export function addSelection(selection: Selection) {
    symbolManager.selections = [...symbolManager.selections, selection];
    saveState();
}

export function updateSelection(id: string, updates: Partial<Selection>) {
    symbolManager.selections = symbolManager.selections.map(selection =>
        selection.id === id ? { ...selection, ...updates } : selection
    );
    saveState();
}

export function removeSelection(id: string) {
    symbolManager.selections = symbolManager.selections.filter(s => s.id !== id);
    saveState();
}

// Cargar el estado al iniciar
loadState();
