import type { Token } from "@/di";
import type { Constructable, DependencyMap, IContainerConfig, SingletonDependencyMap } from "@/types";

export interface IContainer {
	resolve<T>(dependency: Token<T>): T;

	resolve<T>(dependency: Constructable<T>): T;

	registerSingleton<T>(token: Constructable<T>): void;

	registerSingleton<T>(token: Token<T>, dependency: Constructable<T>): void;

	registerTransient<T>(token: Constructable<T>): void;

	registerTransient<T>(token: Token<T>, dependency: Constructable<T>): void;

	getContainerConfig(): IContainerConfig;

	getResolvedSingletonDependencies(): SingletonDependencyMap;

	getRegisteredDependencies(): DependencyMap;

	createDependencyToken<T>(dependency: Constructable<T>): Token<T>;
}
