export * from './utils'

export interface Memento {
    get<T>(key: string, defaultValue: T): T;
    update<T>(key: string, value: T): Thenable<void>;
}

export class Cancelled {
    private readonly name = 'Cancelled'
    static cancelled = new Cancelled()
    static from<T>(v: T | undefined | null) {
        return v ?? this.cancelled
    }
    static is<T>(v: T | Cancelled): v is Cancelled {
        return v instanceof Cancelled
    }
}
