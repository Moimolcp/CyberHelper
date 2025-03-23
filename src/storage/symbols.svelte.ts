export interface Symbol {
    id: string;
    imageUrl: string;
    char: string;
    groupId?: string;
}


export interface Tool {
    type: 'grid' | 'select' | 'link' | 'delete';
    charCount: number;
}

export interface SymbolGroup {
    id: string;
    symbols: string[]; // Array of symbol IDs
    char: string;
    isCollapsed?: boolean;
}

export const toolManager = $state({
    tool: <Tool>({
        type: 'select',
        charCount: 0
    })
})

export const symbolManager = $state({
    symbols: <Symbol[]>([]),
    groups: <SymbolGroup[]>([])
})

export function handleCreateSymbol(event: CustomEvent) {
    const { id, imageUrl, char } = event.detail;
    symbolManager.symbols = [...symbolManager.symbols, { id, imageUrl, char }];
}


export function addSymbol(symbol: Symbol): string {
    symbolManager.symbols = [...symbolManager.symbols, symbol];
    return symbol.id;
}

export function updateSymbol(id: string, updates: Partial<Symbol>) {
    symbolManager.symbols = symbolManager.symbols.map(symbol => 
        symbol.id === id ? { ...symbol, ...updates } : symbol
    );
}

export function deleteSymbol(id: string) {
    symbolManager.symbols = symbolManager.symbols.filter(s => s.id !== id);
}

export function updateTool(updates: Partial<Tool>) {
    toolManager.tool = { ...toolManager.tool, ...updates };
}
