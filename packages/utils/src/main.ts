import _ from 'lodash';

export * from './utils'

export interface Memento {
    get<T>(key: string, defaultValue: T): T;
    update<T>(key: string, value: T): Thenable<void>;
}

export class Cancelled {
    private readonly name = 'Cancelled'
    static cancelled = new Cancelled()
    static from<T>(v: T | undefined | null) {
        return v ?? Cancelled.cancelled
    }
    static is<T>(v: T | Cancelled): v is Cancelled {
        return v instanceof Cancelled
    }
}

export class BookIsNull {
    private readonly name = 'BookIsNull'
    static yes = new BookIsNull()
    static is<T>(v: T | BookIsNull): v is BookIsNull {
        return v instanceof BookIsNull
    }
}

export class Inteval {
    private inteval: NodeJS.Timeout | null = null

    has(): boolean { return !_.isNull(this.inteval) }

    set(callback: () => void, ms: number) {
        this.inteval = setInterval(callback, ms)
    }

    clear() {
        if (!_.isNull(this.inteval)) {
            clearInterval(this.inteval)
            this.inteval = null
        }
    }
}
