import { SquareClient, SquareEnvironment } from 'square'
import type { TypedSquareClient } from '@/lib/types/square'

const isProduction = process.env.NODE_ENV === 'production'

export const squareClient = new SquareClient({
  token: isProduction
    ? process.env.SQUARE_PRODUCTION_ACCESS_TOKEN!
    : process.env.SQUARE_SANDBOX_ACCESS_TOKEN!,
  environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
}) as TypedSquareClient

export const SQUARE_LOCATION_ID = isProduction
  ? process.env.SQUARE_PRODUCTION_LOCATION_ID!
  : process.env.SQUARE_SANDBOX_LOCATION_ID!

export const SQUARE_APPLICATION_ID = isProduction
  ? process.env.SQUARE_PRODUCTION_APPLICATION_ID!
  : process.env.SQUARE_SANDBOX_APPLICATION_ID!
