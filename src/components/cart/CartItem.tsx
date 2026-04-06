import { memo } from 'react'
import type { CartLine } from '../../types/domain'
import { getServiceImage } from '../../data/service-images'

interface CartItemProps {
  line: CartLine
  categoryName: string
  index: number
  onAdd: (id: number) => void
  onRemove: (id: number) => void
  onRemoveAll: (id: number) => void
}

export const CartItem = memo(({ line, categoryName, index, onAdd, onRemove, onRemoveAll }: CartItemProps) => {
  const { service, qty } = line
  const hasDiscount = service.original_price && service.original_price > service.price
  const discountPct = hasDiscount
    ? Math.round(((service.original_price! - service.price) / service.original_price!) * 100)
    : 0

  return (
    <div
      className="cart-item cart-item-enter"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Service thumbnail */}
      <img
        src={getServiceImage(service)}
        alt=""
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0"
        loading="lazy"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-brand text-[.82rem] font-semibold text-primary truncate leading-tight">
          {service.service_name}
        </p>
        <p className="text-[.65rem] text-text-muted mt-0.5 truncate">{categoryName}</p>

        {/* Price row */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="price-current text-[.82rem]">₹{service.price}</span>
          {hasDiscount && (
            <>
              <span className="price-original">₹{service.original_price}</span>
              <span className="price-discount">{discountPct}% off</span>
            </>
          )}
        </div>

        {/* Duration chip */}
        {service.estimated_duration && (
          <span className="inline-flex items-center gap-1 text-[.6rem] text-text-muted bg-muted rounded-full px-2 py-0.5 mt-1">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
            {service.estimated_duration}
          </span>
        )}
      </div>

      {/* Qty controls + remove */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="qty-control">
          <button
            type="button"
            onClick={() => onRemove(service.id)}
            className="qty-btn"
            aria-label={`Decrease quantity for ${service.service_name}`}
          >
            −
          </button>
          <span className="qty-num">{qty}</span>
          <button
            type="button"
            onClick={() => onAdd(service.id)}
            className="qty-btn"
            aria-label={`Increase quantity for ${service.service_name}`}
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => onRemoveAll(service.id)}
          className="cart-remove-btn"
          aria-label={`Remove ${service.service_name} from cart`}
        >
          Remove
        </button>
      </div>
    </div>
  )
})

CartItem.displayName = 'CartItem'
