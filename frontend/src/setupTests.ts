import { configure } from '@testing-library/react'
import 'regenerator-runtime/runtime'

configure({ testIdAttribute: 'data-test-subj' })

// eslint-disable-next-line @typescript-eslint/no-empty-function
window.URL.createObjectURL = (() => {}) as any

export default class EventSourceSetup {
  eventSource
  constructor() {
    const eventSource = new EventSource('http://localhost')
    this.eventSource = eventSource

    eventSource.addEventListener('loading', function (event) {
      console.log('loading')
    })

    eventSource.addEventListener('loaded', function (event) {
      console.log('loaded')
    })

    eventSource.addEventListener('error', function (event) {
      console.log('error')
    })

    eventSource.onerror = (error) => {
      console.error('EventSource failed: ', error)
    }
  }
}
