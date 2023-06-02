import type { Token } from "@/di";
import type { Constructable } from "@/types/common";

export type Injectable = <T>(identifier: Token<T>) => ParameterDecorator;

export interface IContainerConfig {
	checkForCaptiveDependencies: boolean;
}

export type DependencyResolutionType = "singleton" | "transient";

export interface IRegisteredDependency<T> {
	dependency: Constructable<T>;
	resolution: DependencyResolutionType;
}

export type DependencyMap = Map<Token<unknown>, IRegisteredDependency<unknown>>;

export type RequiredDependencyMap = Map<number, Token<unknown>>;

export type SingletonDependencyMap = Map<Token<unknown>, unknown>;
