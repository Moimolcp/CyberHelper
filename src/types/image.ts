export interface ImageTab {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Grid {
  rows: number;
  cols: number;
}

export interface GridCell {
  startPercent: number;
  widthPercent: number;
}

export interface Selection {
  id: string;
  // Coordenadas en porcentaje (0-100)
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  isPermanent: boolean;
  gridCells?: GridCell[];
  symbolIds?: string[]; // Array de IDs de los símbolos creados por esta grid
} 