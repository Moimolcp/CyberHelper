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

export function addSymbolGroup(group: SymbolGroup) {
    symbolManager.groups = [...symbolManager.groups, group];
}

export function deleteSymbolGroup(id: string) {
    symbolManager.groups = symbolManager.groups.filter(g => g.id !== id);
}

export function updateSymbolGroup(id: string, updates: Partial<SymbolGroup>) {
    symbolManager.groups = symbolManager.groups.map(group => 
        group.id === id ? { ...group, ...updates } : group
    );
}

export function createGroup(symbolsIds: string[]) : SymbolGroup {
    const group: SymbolGroup = {
        id: crypto.randomUUID(),
        symbols: symbolsIds,
        char: "_"
    }
    addSymbolGroup(group);
    return group;
}

export function addSymbolToGroup(groupId: string, symbolId: string) {
    const group = symbolManager.groups.find(g => g.id === groupId);
    if (group) {
        group.symbols.push(symbolId);
    }
}

export function deleteGroup(groupId: string) {
    symbolManager.groups = symbolManager.groups.filter(g => g.id !== groupId);
}

export function updateGroup(groupId: string, updates: Partial<SymbolGroup>) {
    symbolManager.groups = symbolManager.groups.map(group => 
        group.id === groupId ? { ...group, ...updates } : group
    );
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
