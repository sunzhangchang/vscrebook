export * from './shared'
export { detect, readFileToUTF8Sync, copyFileToUTF8Sync, setExtTo, readBookFile } from './utils'

export interface Memento {
    get<T>(key: string, defaultValue: T): T;
    update<T>(key: string, value: T): PromiseLike<void>;
}
