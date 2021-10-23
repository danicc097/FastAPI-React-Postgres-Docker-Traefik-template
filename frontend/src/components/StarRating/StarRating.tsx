import React from 'react'
import { useState } from 'react'
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function StarRating({ className }: { className: string }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  return (
    <div className={className}>
      {[...Array(5)].map((star, index) => {
        index += 1
        return (
          <button
            type="button"
            key={index}
            className={index <= (hover || rating) ? 'on' : 'off'}
            onClick={() => setRating(index)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(rating)}
          >
            <FontAwesomeIcon icon={fasStar} />
          </button>
        )
      })}
    </div>
  )
}
