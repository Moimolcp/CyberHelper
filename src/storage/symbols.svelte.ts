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
}

export function deleteGroup(groupId: string) {
    symbolManager.groups = symbolManager.groups.filter(g => g.id !== groupId);
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
