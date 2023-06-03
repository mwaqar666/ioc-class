export type Constructable<T> = new (...args: Array<any>) => T;

export type Optional<T> = undefined | T;
