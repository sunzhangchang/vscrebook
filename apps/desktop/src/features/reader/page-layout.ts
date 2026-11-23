export function getPageCount(scrollWidth: number, pageWidth: number): number {
    if (!Number.isFinite(scrollWidth) || !Number.isFinite(pageWidth) || pageWidth <= 0) return 1
    return Math.max(1, Math.ceil(Math.max(0, scrollWidth) / pageWidth))
}

export function getPageForOffset(offset: number, textLength: number, pageCount: number): number {
    if (pageCount <= 1 || textLength <= 0) return 1
    const ratio = Math.max(0, Math.min(1, offset / textLength))
    return Math.min(pageCount, Math.floor(ratio * pageCount) + 1)
}

export function getPageAfterResize(currentPage: number, previousPageCount: number, nextPageCount: number): number {
    if (previousPageCount <= 1 || nextPageCount <= 1) return 1
    const progress = (Math.max(1, Math.min(previousPageCount, currentPage)) - 1) / (previousPageCount - 1)
    return Math.min(nextPageCount, Math.floor(progress * (nextPageCount - 1)) + 1)
}

export function createLeadingTrailingTask(task: () => void, delayMs: number): { schedule: () => void; cancel: () => void } {
    let timer: ReturnType<typeof setTimeout> | undefined
    let pending = false

    return {
        schedule() {
            if (timer === undefined) {
                task()
            } else {
                pending = true
            }

            if (timer !== undefined) clearTimeout(timer)
            timer = setTimeout(() => {
                timer = undefined
                if (!pending) return
                pending = false
                task()
            }, delayMs)
        },
        cancel() {
            if (timer !== undefined) clearTimeout(timer)
            timer = undefined
            pending = false
        },
    }
}

export function subscribeToViewportResize(
    windowTarget: EventTarget,
    viewportTarget: EventTarget | null | undefined,
    onResize: () => void,
): () => void {
    windowTarget.addEventListener('resize', onResize)
    viewportTarget?.addEventListener('resize', onResize)

    return () => {
        windowTarget.removeEventListener('resize', onResize)
        viewportTarget?.removeEventListener('resize', onResize)
    }
}
