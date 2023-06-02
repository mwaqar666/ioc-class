export type Constructable<T> = new (...args: Array<unknown>) => T;

export type Optional<T> = undefined | T;
