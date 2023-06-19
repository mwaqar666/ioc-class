import { DependencyResolver } from "@/di/dependency-resolver";
import { Token } from "@/di/token";
import { DuplicateDependencyException } from "@/exceptions";
import type { IContainer, IDependencyResolver } from "@/interfaces";
import type { Constructable, DependencyMap, IRegisteredDependency, Optional, SingletonDependencyMap } from "@/types";

/**
 * Container class holds all the registered singleton and transient dependencies.
 * The dependencies are resolved at when requested. To create an instance of the
 * Container class, you can call the factory method, `Container.of()`
 *
 * @implements IContainer
 * @author Muhammad Waqar
 */
export class Container implements IContainer {
	private readonly dependencyResolver: IDependencyResolver;

	private readonly registeredDependencies: DependencyMap = new Map<Token<unknown>, IRegisteredDependency<unknown>>();
	private readonly resolvedSingletonDependencies: SingletonDependencyMap = new Map<Token<unknown>, unknown>();
	private readonly selfCreatedDependencyTokens: Map<string, Token<unknown>> = new Map<string, Token<unknown>>();

	/**
	 * You should not create the instance of Container class yourself.
	 * Use `ContainerFactory.getContainer` instead
	 *
	 * @author Muhammad Waqar
	 */
	public constructor() {
		this.dependencyResolver = new DependencyResolver(this);
	}

	/**
	 * Resolve dependency with the provided token
	 *
	 * @template T
	 * @param {Token<T>} dependency Dependency token
	 * @return {T} Resolved dependency
	 * @author Muhammad Waqar
	 */
	public resolve<T>(dependency: Token<T>): T;
	/**
	 * Resolve dependency with the provided constructor
	 *
	 * @template T
	 * @param {Constructable<T>} dependency Dependency constructor
	 * @return {T} Resolved dependency
	 * @author Muhammad Waqar
	 */
	public resolve<T>(dependency: Constructable<T>): T;
	public resolve<T>(dependency: Token<T> | Constructable<T>): T {
		if (dependency instanceof Token) return this.dependencyResolver.resolveDependency(dependency);

		const token: Token<T> = this.createDependencyToken(dependency);
		return this.dependencyResolver.resolveDependency(token);
	}

	/**
	 * Register a singleton dependency using the dependency constructor
	 *
	 * @template T
	 * @param {Constructable<T>} token Dependency constructor
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	public registerSingleton<T>(token: Constructable<T>): void;
	/**
	 * Register a singleton dependency using the dependency token
	 *
	 * @template T
	 * @param {Token<T>} token Dependency token
	 * @param {Constructable<T>} dependency Dependency constructor
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	public registerSingleton<T>(token: Token<T>, dependency: Constructable<T>): void;
	public registerSingleton<T>(token: Token<T> | Constructable<T>, dependency?: Constructable<T>): void {
		if (token instanceof Token) {
			this.registerDependencyOnce("singleton", token, <Constructable<T>>dependency);
			return;
		}

		const dependencyToken: Token<T> = this.createDependencyToken(token);
		this.registerDependencyOnce("singleton", dependencyToken, token);
	}

	/**
	 * Register a transient dependency using the dependency constructor
	 *
	 * @template T
	 * @param {Constructable<T>} token Dependency constructor
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	public registerTransient<T>(token: Constructable<T>): void;
	/**
	 * Register a transient dependency using the dependency token
	 *
	 * @template T
	 * @param {Token<T>} token Dependency token
	 * @param {Constructable<T>} dependency Dependency constructor
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	public registerTransient<T>(token: Token<T>, dependency: Constructable<T>): void;
	public registerTransient<T>(token: Token<T> | Constructable<T>, dependency?: Constructable<T>): void {
		if (token instanceof Token) {
			this.registerDependencyOnce("transient", token, <Constructable<T>>dependency);
			return;
		}

		const dependencyToken: Token<T> = this.createDependencyToken(token);
		this.registerDependencyOnce("transient", dependencyToken, token);
	}

	/**
	 * Retrieves the list of all singleton dependencies that have been requested from the container till yet
	 *
	 * @return {SingletonDependencyMap} Map of resolved singleton dependencies with their tokens
	 * @author Muhammad Waqar
	 */
	public getResolvedSingletonDependencies(): SingletonDependencyMap {
		return this.resolvedSingletonDependencies;
	}

	/**
	 * Retrieves the list of all registered dependencies for the container
	 *
	 * @return {DependencyMap} Map of registered dependencies with their tokens and resolution type
	 * @author Muhammad Waqar
	 */
	public getRegisteredDependencies(): DependencyMap {
		return this.registeredDependencies;
	}

	/**
	 * Creates a default token for the given dependency constructor
	 *
	 * @template T
	 * @param {Constructable<T>} dependency Dependency constructor
	 * @return {Token<T>} Default token for the dependency constructor
	 * @author Muhammad Waqar
	 */
	public createDependencyToken<T>(dependency: Constructable<T>): Token<T> {
		const tokenFromCache: Optional<Token<T>> = this.selfCreatedDependencyTokens.get(dependency.name);
		if (tokenFromCache) return tokenFromCache;

		const newDependencyToken: Token<T> = new Token<T>(dependency.name);
		this.selfCreatedDependencyTokens.set(dependency.name, newDependencyToken);

		return newDependencyToken;
	}

	private registerDependencyOnce<T>(resolution: "singleton" | "transient", token: Token<T>, dependency: Constructable<T>): void {
		const dependencyAlreadyRegistered: boolean = this.registeredDependencies.has(token);
		if (dependencyAlreadyRegistered) {
			throw new DuplicateDependencyException(dependency.name);
		}

		const registeredDependency: IRegisteredDependency<T> = {
			dependency,
			resolution,
		};
		this.registeredDependencies.set(token, <IRegisteredDependency<unknown>>registeredDependency);
	}
}
