import type { Token } from "@/di";
import type { Constructable } from "@/types/common";

/**
 * Configuration for the injectable class.
 *
 * @author Muhammad Waqar
 */
export interface InjectableConfig {
	/**
	 * Container name where the dependency should be registered
	 *
	 * @type {symbol}
	 * @author Muhammad Waqar
	 */
	readonly containerName: symbol;
	/**
	 * Dependency resolution type. Can be either “singleton” or “transient”
	 *
	 * @type {DependencyResolutionType}
	 * @author Muhammad Waqar
	 */
	readonly dependencyResolution: DependencyResolutionType;
}

export type DependencyResolutionType = "singleton" | "transient";

export interface IDependencyRegisterOptions {
	/**
	 * What to do if try to register an already registered dependency
	 *
	 * Default: throw
	 */
	onDuplicate?: "ignore" | "throw";
}

/**
 * Registered dependency type
 *
 * @author Muhammad Waqar
 */
export interface IRegisteredDependency<T> {
	/**
	 * Dependency constructor
	 *
	 * @template T
	 * @type {Constructable<T>}
	 * @author Muhammad Waqar
	 */
	readonly dependency: Constructable<T>;
	/**
	 * Dependency resolution type. Can be either "singleton" or "transient"
	 *
	 * @type {DependencyResolutionType}
	 * @author Muhammad Waqar
	 */
	readonly resolution: DependencyResolutionType;
}

export interface IResolvedContainerName {
	readonly containerName: symbol;
}

export type DependencyMap = Map<Token<unknown>, IRegisteredDependency<unknown>>;

export type RequiredDependencyMap = Map<number, Token<unknown>>;

export type SingletonDependencyMap = Map<Token<unknown>, unknown>;
