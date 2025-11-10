import { Clock, Package, Truck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string
    color: string
    bgColor: string
    icon: typeof Clock
  }
> = {
  pending: {
    label: 'Pending',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: Package,
  },
  ready_for_pickup: {
    label: 'Ready for Pickup',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: AlertCircle,
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle2,
  },
  completed: {
    label: 'Completed',
    color: 'text-green-800',
    bgColor: 'bg-green-200',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: XCircle,
  },
}

const SIZE_CONFIG = {
  sm: {
    text: 'text-xs',
    padding: 'px-2 py-0.5',
    icon: 'h-3 w-3',
  },
  md: {
    text: 'text-sm',
    padding: 'px-2.5 py-1',
    icon: 'h-4 w-4',
  },
  lg: {
    text: 'text-base',
    padding: 'px-3 py-1.5',
    icon: 'h-5 w-5',
  },
}

export function OrderStatusBadge({ status, size = 'md', showIcon = true }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const sizeConfig = SIZE_CONFIG[size]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${config.bgColor} ${sizeConfig.padding} ${sizeConfig.text}`}
    >
      {showIcon && <Icon className={sizeConfig.icon} />}
      {config.label}
    </span>
  )
}
