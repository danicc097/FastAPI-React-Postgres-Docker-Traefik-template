import { UserAvatarPropTypes } from 'src/components/UserAvatar/UserAvatar'

export const capitalize = (str: string) => (str ? str[0].toUpperCase() + str.slice(1) : str)

export const getAvatarName = ({ user }: UserAvatarPropTypes) =>
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
