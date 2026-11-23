import _ from 'lodash'
export * from './utils/error'

export class Cancelled {
    readonly name = 'Cancelled'
    static cancelled = new Cancelled()
    static from<T>(value: T | undefined | null) {
        return value ?? Cancelled.cancelled
    }
    static is<T>(value: T | Cancelled): value is Cancelled {
        return value instanceof Cancelled
    }
}

export class BookIsNull {
    readonly name = 'BookIsNull'
    static yes = new BookIsNull()
    static is<T>(value: T | BookIsNull): value is BookIsNull {
        return value instanceof BookIsNull
    }
}

export class Interval {
    private cancelInterval: (() => void) | null = null

    has(): boolean { return !_.isNull(this.cancelInterval) }

    set(callback: () => void, ms: number) {
        const interval = setInterval(callback, ms)
        this.cancelInterval = () => clearInterval(interval)
    }

    clear() {
        if (!_.isNull(this.cancelInterval)) {
            this.cancelInterval()
            this.cancelInterval = null
        }
    }
}
