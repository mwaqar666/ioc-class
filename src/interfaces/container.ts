import type { Token } from "@/di";
import type { Constructable } from "@/types";

export interface IContainer {
	resolve<T>(dependency: Token<T>): T;

	resolve<T, TArgs extends Array<unknown>>(dependency: Constructable<T, TArgs>): T;

	registerSingleton<T, TArgs extends Array<unknown>>(token: Constructable<T, TArgs>): void;

	registerSingleton<T, TArgs extends Array<unknown>>(token: Token<T>, dependency: Constructable<T, TArgs>): void;

	registerTransient<T, TArgs extends Array<unknown>>(token: Constructable<T, TArgs>): void;

	registerTransient<T, TArgs extends Array<unknown>>(token: Token<T>, dependency: Constructable<T, TArgs>): void;
}
