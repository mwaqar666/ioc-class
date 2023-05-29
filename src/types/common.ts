export type Constructable<T, TArgs extends Array<unknown> = Array<void>> = new (...args: TArgs) => T;

export type Optional<T> = undefined | T;
