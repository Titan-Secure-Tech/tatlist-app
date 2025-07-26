import { Product, InventoryList } from './index'

export interface InventoryListWithItems extends InventoryList {
  inventory_list_items: InventoryListItemWithProduct[]
}

export interface InventoryListItemWithProduct {
  id: string
  quantity: number
  product: Product
}