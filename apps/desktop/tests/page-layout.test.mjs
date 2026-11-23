import assert from 'node:assert/strict'
import test from 'node:test'
import { createLeadingTrailingTask, getPageAfterResize, getPageCount, getPageForOffset, subscribeToViewportResize } from '../src/features/reader/page-layout.ts'

test('page count follows the number of visible-width columns', () => {
    assert.equal(getPageCount(1000, 500), 2)
    assert.equal(getPageCount(1001, 500), 3)
    assert.equal(getPageCount(0, 500), 1)
    assert.equal(getPageCount(1000, 0), 1)
})

test('resizing preserves the relative reading position', () => {
    assert.equal(getPageAfterResize(5, 9, 5), 3)
    assert.equal(getPageAfterResize(9, 9, 5), 5)
    assert.equal(getPageAfterResize(4, 1, 7), 1)
})

test('saved text offsets restore to the matching visible-page proportion', () => {
    assert.equal(getPageForOffset(500, 1000, 9), 5)
    assert.equal(getPageForOffset(1000, 1000, 9), 9)
    assert.equal(getPageForOffset(-20, 1000, 9), 1)
    assert.equal(getPageForOffset(0, 0, 9), 1)
})

test('first resize lays out immediately and rapid observations collapse to one final layout', async () => {
    let layouts = 0
    const layout = createLeadingTrailingTask(() => { layouts += 1 }, 20)

    layout.schedule()
    assert.equal(layouts, 1)
    await new Promise((resolve) => setTimeout(resolve, 10))
    layout.schedule()
    layout.schedule()
    assert.equal(layouts, 1)
    await new Promise((resolve) => setTimeout(resolve, 30))

    assert.equal(layouts, 2)
})

test('unmounting cancels a pending layout measurement', async () => {
    let layouts = 0
    const layout = createLeadingTrailingTask(() => { layouts += 1 }, 10)

    layout.schedule()
    layout.cancel()
    await new Promise((resolve) => setTimeout(resolve, 20))

    assert.equal(layouts, 1)
})

test('viewport resize subscriptions handle window and visual viewport changes', () => {
    const windowTarget = new EventTarget()
    const visualViewportTarget = new EventTarget()
    let resizeEvents = 0
    const unsubscribe = subscribeToViewportResize(windowTarget, visualViewportTarget, () => { resizeEvents += 1 })

    windowTarget.dispatchEvent(new Event('resize'))
    visualViewportTarget.dispatchEvent(new Event('resize'))
    unsubscribe()
    windowTarget.dispatchEvent(new Event('resize'))

    assert.equal(resizeEvents, 2)
})
