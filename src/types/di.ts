import type { Token } from "@/di";
import type { Constructable } from "@/types/common";

export type Injectable = <T>(identifier: Token<T>) => ParameterDecorator;

export interface IRegisteredDependency<T, TArgs extends Array<unknown> = Array<unknown>> {
	dependency: Constructable<T, TArgs>;
	resolution: "singleton" | "transient";
}

export type DependencyMap = Map<Token<unknown>, IRegisteredDependency<unknown>>;

export type RequiredDependencyMap = Map<number, Token<unknown>>;

export type SingletonDependencyMap = Map<Token<unknown>, unknown>;
