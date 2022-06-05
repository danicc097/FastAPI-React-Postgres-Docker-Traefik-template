import { truncate } from 'lodash'

export async function convertBlobToText(blobURI: string) {
  try {
    const blob = await fetch(blobURI).then((res) => res.blob())
    return await blob.text()
  } catch (error) {
    console.log('ERROR in convertBlobToText: ', truncate(error.message, { length: 100 }))
    return ''
  }
}
