import type { Token } from "@/di";
import type { OnDuplicateRegister, ResolutionType } from "@/enums";
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
	 * Dependency resolution type
	 *
	 * @type {ResolutionType}
	 * @author Muhammad Waqar
	 */
	readonly dependencyResolution: ResolutionType;
}

export interface IDependencyRegisterOptions {
	/**
	 * What to do if try to register an already registered dependency
	 *
	 * @default OnDuplicateRegister.THROW
	 */
	readonly onDuplicate?: OnDuplicateRegister;
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
	 * Dependency resolution type
	 *
	 * @type {ResolutionType}
	 * @author Muhammad Waqar
	 */
	readonly resolution: ResolutionType;
}

/**
 * Resolved dependency type
 *
 * @author Muhammad Waqar
 */
export interface IResolvedDependency<T> extends Omit<IRegisteredDependency<T>, "dependency"> {
	/**
	 * Resolved dependency
	 *
	 * @template T
	 * @type {T}
	 * @author Muhammad Waqar
	 */
	readonly dependency: T;
}

export interface IResolvedContainerName {
	readonly containerName: symbol;
}

export type DependencyMap = Map<Token<unknown>, IRegisteredDependency<unknown>>;

export type RequiredDependencyMap = Map<number, Token<unknown>>;

export type CachedResolvedDependencyMap = Map<Token<unknown>, IResolvedDependency<unknown>>;
