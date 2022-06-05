import React from 'react'
import { useState } from 'react'
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EuiIcon } from '@elastic/eui'
import { EuiIconType } from '@elastic/eui/src/components/icon/icon'
import { Object } from 'lodash'

type StarRatingProps = {
  className: string
  initialRating: number
}

export default function StarRating({ className, initialRating }: StarRatingProps) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(initialRating)

  type starType = {
    color: string
    type: EuiIconType
  }

  const stars: Record<string, starType> = {
    starFilled: { color: '#e0dd1a', type: 'starFilled' },
    starEmpty: { color: '#e0dd1a', type: 'starEmpty' },
    starPlusFilled: { color: '#e0dd1a', type: 'starPlusFilled' },
    starMinusEmpty: { color: '#9b613f', type: 'starMinusEmpty' },
  }

  function getStar({ index, prop }: { index: number; prop: keyof starType }): string {
    if (index <= rating && index <= hover) {
      return stars['starFilled'][prop]
    } else if (index <= rating && hover < index) {
      return stars['starMinusEmpty'][prop]
    } else if (index > rating && hover >= index) {
      return stars['starPlusFilled'][prop]
    } else {
      return stars['starEmpty'][prop]
    }
  }

  return (
    <div className={className}>
      {[...Array(5)].map((star, index) => {
        index += 1
        return (
          <button
            type="button"
            key={index}
            className={index <= (hover || rating) ? 'on' : 'off'}
            style={{
              cursor: 'pointer',
              color: index <= (hover || rating) ? '#ffd700' : '#d3d3d3',
            }}
            onClick={() => {
              setRating(index)
              console.log(`onClick ${className}-${index}: hover=${hover} rating=${rating}`)
            }}
            onMouseEnter={() => {
              setHover(index)
              console.log(`onMouseEnter ${className}-${index}: hover=${hover} rating=${rating}`)
            }}
            onMouseLeave={() => {
              setHover(rating)
              console.log(`onMouseLeave ${className}-${index}: hover=${hover} rating=${rating}`)
            }}
            id={`star-${className}-${index}`}
          >
            {/* <FontAwesomeIcon icon={fasStar} /> */}
            <EuiIcon
              key={`icon-${className}-${index}`}
              type={getStar({ index, prop: 'type' })}
              color={getStar({ index, prop: 'color' })}
            />
          </button>
        )
      })}
    </div>
  )
}
