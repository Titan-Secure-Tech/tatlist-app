// Square API Types based on Square SDK v43
export interface SquareOrderLineItem {
  quantity: string
  catalogObjectId?: string
  basePriceMoney: {
    amount: bigint
    currency: string
  }
  name?: string
  variationName?: string
}

export interface SquareOrderFulfillment {
  type: 'DELIVERY' | 'PICKUP'
  state: 'PROPOSED' | 'RESERVED' | 'PREPARED' | 'COMPLETED' | 'CANCELED'
  deliveryDetails?: {
    recipient?: {
      displayName?: string
      phoneNumber?: string
      email?: string
    }
    deliverAt?: string
    scheduleType?: 'ASAP' | 'SCHEDULED'
    recipientAddress?: {
      addressLine1?: string
      addressLine2?: string
      locality?: string
      administrativeDistrictLevel1?: string
      postalCode?: string
      country?: string
    }
  }
}

export interface SquareOrderServiceCharge {
  name?: string
  amountMoney: {
    amount: bigint
    currency: string
  }
  calculationPhase: 'SUBTOTAL_PHASE' | 'TOTAL_PHASE'
}

export interface SquareOrder {
  locationId: string
  lineItems: SquareOrderLineItem[]
  fulfillments?: SquareOrderFulfillment[]
  serviceCharges?: SquareOrderServiceCharge[]
}

export interface SquareCreateOrderRequest {
  order: SquareOrder
  idempotencyKey: string
}

export interface SquareOrderResult {
  order: {
    id: string
    locationId: string
    lineItems?: SquareOrderLineItem[]
    fulfillments?: SquareOrderFulfillment[]
    serviceCharges?: SquareOrderServiceCharge[]
    totalMoney?: {
      amount: bigint
      currency: string
    }
  }
}

export interface SquareOrderResponse {
  statusCode: number
  result?: SquareOrderResult
}

// Payment Link Types
export interface SquarePaymentLinkRequest {
  order: {
    locationId: string
  }
  checkoutOptions: {
    allowTipping?: boolean
    customFields?: Array<{
      title: string
      required?: boolean
    }>
    subscriptionPlanId?: string
    redirectUrl?: string
    merchantSupportEmail?: string
    askForShippingAddress?: boolean
  }
  prePopulatedData?: {
    buyerEmail?: string
    buyerPhoneNumber?: string
    buyerAddress?: {
      addressLine1?: string
      addressLine2?: string
      locality?: string
      administrativeDistrictLevel1?: string
      postalCode?: string
      country?: string
    }
  }
  description?: string
  note?: string
  idempotencyKey: string
}

export interface SquarePaymentLinkResult {
  paymentLink: {
    id: string
    url: string
    version?: number
    description?: string
    orderId?: string
    checkoutOptions?: SquareCheckoutOptions
    prePopulatedData?: SquarePrePopulatedData
  }
}

export interface SquarePaymentLinkResponse {
  statusCode: number
  result?: SquarePaymentLinkResult
}

// Payment Types
export interface SquareCreatePaymentRequest {
  sourceId: string
  idempotencyKey: string
  amountMoney: {
    amount: bigint
    currency: string
  }
  locationId: string
  buyerEmailAddress?: string
  billingAddress?: {
    addressLine1?: string
    addressLine2?: string
    locality?: string
    administrativeDistrictLevel1?: string
    postalCode?: string
    country?: string
  }
  note?: string
}

export interface SquarePaymentResult {
  payment: {
    id: string
    status: 'APPROVED' | 'PENDING' | 'COMPLETED' | 'CANCELED' | 'FAILED'
    amountMoney?: {
      amount: bigint
      currency: string
    }
    sourceType?: string
    cardDetails?: SquareCardDetails
    locationId?: string
    orderId?: string
    createdAt?: string
    updatedAt?: string
  }
}

export interface SquarePaymentResponse {
  statusCode: number
  result?: SquarePaymentResult
}

// Inventory Types
export interface SquareBatchRetrieveInventoryCountsRequest {
  catalogObjectIds?: string[]
  locationIds?: string[]
  updatedAfter?: string
  cursor?: string
  states?: string[]
  limit?: number
}

export interface SquareInventoryCount {
  catalogObjectId?: string
  catalogObjectType?: string
  state?:
    | 'IN_STOCK'
    | 'SOLD'
    | 'RETURNED_BY_CUSTOMER'
    | 'RESERVED_FOR_SALE'
    | 'COMPOSED'
    | 'DECOMPOSED'
    | 'SUPPLIER_ORDER'
    | 'OTHER'
  locationId?: string
  quantity?: string
  calculatedAt?: string
}

export interface SquareInventoryResult {
  counts?: SquareInventoryCount[]
  cursor?: string
}

export interface SquareInventoryResponse {
  statusCode: number
  result?: SquareInventoryResult
}

// Catalog Types
export interface SquareCatalogQuery {
  sortedAttributeQuery?: SquareSortedAttributeQuery
  exactQuery?: SquareExactQuery
  setQuery?: SquareSetQuery
  prefixQuery?: SquarePrefixQuery
  rangeQuery?: SquareRangeQuery
  textQuery?: SquareTextQuery
  itemsForTaxQuery?: SquareItemsForTaxQuery
  itemsForModifierListQuery?: SquareItemsForModifierListQuery
  itemsForItemOptionQuery?: SquareItemsForItemOptionQuery
  itemVariationsForItemOptionValuesQuery?: SquareItemVariationsForItemOptionValuesQuery
}

export interface SquareListCatalogRequest {
  cursor?: string
  types?: string
  catalogVersion?: bigint
}

export interface SquareCatalogObject {
  id?: string
  type?: string
  updatedAt?: string
  version?: bigint
  isDeleted?: boolean
  customAttributeValues?: Record<string, SquareCustomAttributeValue>
  catalogV1Ids?: SquareCatalogV1Id[]
  presentAtAllLocations?: boolean
  presentAtLocationIds?: string[]
  itemData?: {
    name?: string
    description?: string
    abbreviation?: string
    labelColor?: string
    availableOnline?: boolean
    availableForPickup?: boolean
    availableElectronically?: boolean
    categoryId?: string
    taxIds?: string[]
    modifierListInfo?: SquareModifierListInfo[]
    variations?: SquareCatalogItemVariation[]
    productType?: string
    skipModifierScreen?: boolean
    itemOptions?: SquareItemOption[]
    imageIds?: string[]
    sortName?: string
    descriptionHtml?: string
    descriptionPlaintext?: string
  }
  imageData?: {
    url?: string
    name?: string
    caption?: string
  }
}

export interface SquareCatalogItemVariation {
  id?: string
  type?: string
  updatedAt?: string
  version?: bigint
  isDeleted?: boolean
  presentAtAllLocations?: boolean
  presentAtLocationIds?: string[]
  itemVariationData?: {
    itemId?: string
    name?: string
    sku?: string
    upc?: string
    ordinal?: number
    pricingType?: string
    priceMoney?: {
      amount?: bigint
      currency?: string
    }
    locationOverrides?: SquareLocationOverride[]
    trackInventory?: boolean
    inventoryAlertType?: string
    inventoryAlertThreshold?: bigint
    userData?: string
    serviceDuration?: bigint
    availableForBooking?: boolean
    itemOptionValues?: SquareItemOptionValue[]
    measurementUnitId?: string
    sellable?: boolean
    stockable?: boolean
    imageIds?: string[]
    teamMemberIds?: string[]
    stockableConversion?: SquareStockableConversion
    availableForSale?: boolean
  }
}

export interface SquareCatalogResult {
  objects?: SquareCatalogObject[]
  cursor?: string
}

export interface SquareCatalogResponse {
  statusCode: number
  result?: SquareCatalogResult
  objects?: SquareCatalogObject[] // For direct access
  cursor?: string
}

export interface SquareRetrieveCatalogObjectRequest {
  objectId: string
  includeRelatedObjects?: boolean
  catalogVersion?: bigint
  includeCategoryPathToRoot?: boolean
}

export interface SquareRetrieveCatalogObjectResult {
  object?: SquareCatalogObject
  relatedObjects?: SquareCatalogObject[]
}

export interface SquareRetrieveCatalogObjectResponse {
  statusCode: number
  result?: SquareRetrieveCatalogObjectResult
  object?: SquareCatalogObject // For direct access
  relatedObjects?: SquareCatalogObject[]
}

// Additional Square Types for proper type safety
export interface SquareCheckoutOptions {
  allowTipping?: boolean
  customFields?: Array<{
    title: string
    required?: boolean
  }>
  subscriptionPlanId?: string
  redirectUrl?: string
  merchantSupportEmail?: string
  askForShippingAddress?: boolean
}

export interface SquarePrePopulatedData {
  buyerEmail?: string
  buyerPhoneNumber?: string
  buyerAddress?: {
    addressLine1?: string
    addressLine2?: string
    locality?: string
    administrativeDistrictLevel1?: string
    postalCode?: string
    country?: string
  }
}

export interface SquareCardDetails {
  status?: string
  card?: {
    cardBrand?: string
    last4?: string
    expMonth?: number
    expYear?: number
    fingerprint?: string
    cardType?: string
    prepaidType?: string
    bin?: string
  }
  entryMethod?: string
  cvvStatus?: string
  avsStatus?: string
  authResultCode?: string
  applicationIdentifier?: string
  applicationName?: string
  applicationCryptogram?: string
  verificationMethod?: string
  verificationResults?: string
  statementDescription?: string
  deviceDetails?: {
    deviceId?: string
    deviceInstallationId?: string
    deviceName?: string
  }
}

export interface SquareSortedAttributeQuery {
  attributeName: string
  initialAttributeValue?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface SquareExactQuery {
  attributeName: string
  attributeValue: string
}

export interface SquareSetQuery {
  attributeName: string
  attributeValues: string[]
}

export interface SquarePrefixQuery {
  attributeName: string
  attributePrefix: string
}

export interface SquareRangeQuery {
  attributeName: string
  attributeMinValue?: string
  attributeMaxValue?: string
}

export interface SquareTextQuery {
  filter: string[]
}

export interface SquareItemsForTaxQuery {
  taxIds: string[]
}

export interface SquareItemsForModifierListQuery {
  modifierListIds: string[]
}

export interface SquareItemsForItemOptionQuery {
  itemOptionIds: string[]
}

export interface SquareItemVariationsForItemOptionValuesQuery {
  itemOptionValueIds: string[]
}

export interface SquareCustomAttributeValue {
  name?: string
  stringValue?: string
  numberValue?: string
  booleanValue?: boolean
  selectionUidValue?: string
  customAttributeDefinitionId?: string
  type?: string
  keyValue?: string
}

export interface SquareCatalogV1Id {
  catalogV1Id?: string
  locationId?: string
}

export interface SquareModifierListInfo {
  modifierListId: string
  minSelectedModifiers?: number
  maxSelectedModifiers?: number
  enabled?: boolean
}

export interface SquareItemOption {
  itemOptionId?: string
}

export interface SquareLocationOverride {
  locationId?: string
  priceMoney?: {
    amount?: bigint
    currency?: string
  }
  pricingType?: string
  trackInventory?: boolean
  inventoryAlertType?: string
  inventoryAlertThreshold?: bigint
  soldOut?: boolean
  soldOutValidUntil?: string
}

export interface SquareItemOptionValue {
  itemOptionValueId?: string
}

export interface SquareStockableConversion {
  stockableItemVariationId: string
  stockableQuantity: string
  nonstockableQuantity: string
}

// Extended SquareClient interface with proper types
export interface TypedSquareClient {
  orders: {
    createOrder(request: SquareCreateOrderRequest): Promise<SquareOrderResponse>
  }
  checkout: {
    createPaymentLink(request: SquarePaymentLinkRequest): Promise<SquarePaymentLinkResponse>
  }
  payments: {
    createPayment(request: SquareCreatePaymentRequest): Promise<SquarePaymentResponse>
  }
  inventory: {
    batchRetrieveInventoryCounts(
      request: SquareBatchRetrieveInventoryCountsRequest
    ): Promise<SquareInventoryResponse>
  }
  catalog: {
    listCatalog(request?: SquareListCatalogRequest): Promise<SquareCatalogResponse>
    retrieveCatalogObject(
      request: SquareRetrieveCatalogObjectRequest
    ): Promise<SquareRetrieveCatalogObjectResponse>
  }
}
