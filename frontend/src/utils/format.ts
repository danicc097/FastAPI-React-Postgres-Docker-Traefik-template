import { capitalize } from 'lodash'
import { UserAvatarProps } from 'src/components/UserAvatar/UserAvatar'

export const getAvatarName = ({ user }: UserAvatarProps) =>
  capitalize(user?.profile?.full_name ?? user?.username ?? 'Anonymous')

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatPrice = (price: number) => (price ? currencyFormatter.format(price) : price)

/**
 * Take the first n characters of a string and add an ellipses at the end
 * if the string is longer than n characters. Option to cut off at nearest
 * word using the `useWordBoundary` flag
 *
 * @param str - the string to truncate
 * @param n - the max number of characters
 * @param useWordBoundary - whether or not to cut off at the nearest word
 */
export const truncate = (str: string, n = 200, useWordBoundary = false) => {
  if (!str || str?.length <= n) return str
  const subString = str.substr(0, n - 1)
  return `${useWordBoundary ? subString.substr(0, subString.lastIndexOf(' ')) : subString}&hellip;`
}

/**
 * Join strings with commas and an 'and' before the last item
 */
export const joinWithAnd = (arr: string[]) => {
  if (arr.length === 1) return arr[0]
  return `${arr.slice(0, -1).join(', ')} and ${arr.slice(-1)[0]}`
}
