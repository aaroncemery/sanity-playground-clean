/**
 * Merges menuItem documents (customercontent) with their resolved product data
 * (productcatalog). Required because cross-dataset references cannot be resolved
 * in a single GROQ query — two fetches are always needed.
 */
import type {MenuItemWithProduct, CatalogProduct} from './types/menuItem'

export function resolveMenuItemsWithProducts(
  menuItems: Array<{_id: string; productRef?: string; [key: string]: unknown}>,
  products: CatalogProduct[],
): MenuItemWithProduct[] {
  const productMap = new Map(products.map((p) => [p._id, p]))

  return menuItems.map((item) => ({
    ...item,
    product: item.productRef ? (productMap.get(item.productRef) ?? null) : null,
  })) as MenuItemWithProduct[]
}
