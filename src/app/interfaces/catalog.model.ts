export interface CatalogItem {
  id: string;
  nombre: string;
}

export interface Period extends CatalogItem {
  activo: boolean;
}
