import { DIConst } from "@/const";
import type { Token } from "@/di/token";
import type { IContainer, IDependencyResolver } from "@/interfaces";
import type { Constructable, IRegisteredDependency, Optional, RequiredDependencyMap } from "@/types";

/**
 * Each container instance has its own IDependencyResolver. Dependency resolver resolves the dependencies
 * from the associated container class
 *
 * @implements IDependencyResolver
 * @author Muhammad Waqar
 */
export class DependencyResolver implements IDependencyResolver {
	private readonly container: IContainer;

	public constructor(container: IContainer) {
		this.container = container;
	}

	/**
	 * Resolves a dependency by the provided dependency token
	 *
	 * @template T
	 * @param {Token<T>} token Dependency token
	 * @return {T} Resolved dependency
	 * @author Muhammad Waqar
	 */
	public resolveDependency<T>(token: Token<T>): T;
	/**
	 * Resolves a dependency by the provided dependency token.
	 * Also checks for the captive dependency constraint
	 *
	 * @template T
	 * @template P
	 * @param {Token<T>} token Dependency token
	 * @param {IRegisteredDependency<P>} parentDependency Dependency token
	 * @return {T} Resolved dependency
	 * @author Muhammad Waqar
	 */
	public resolveDependency<T, P>(token: Token<T>, parentDependency: IRegisteredDependency<P>): T;
	public resolveDependency<T, P>(token: Token<T>, parentDependency?: IRegisteredDependency<P>): T {
		const registeredDependency: IRegisteredDependency<T> = this.verifyDependencyPresenceInContainer(token);

		if (parentDependency) this.checkForCaptiveDependency(registeredDependency, parentDependency);

		return registeredDependency.resolution === "singleton" ? this.resolveSingletonDependency(token, registeredDependency) : this.resolveDependencyChain(registeredDependency);
	}

	private resolveSingletonDependency<T>(token: Token<T>, registeredDependency: IRegisteredDependency<T>): T {
		const singletonDependency: Optional<T> = <Optional<T>>this.container.getResolvedSingletonDependencies().get(token);
		if (singletonDependency) return singletonDependency;

		const resolvedDependency: T = this.resolveDependencyChain(registeredDependency);
		this.container.getResolvedSingletonDependencies().set(token, resolvedDependency);

		return resolvedDependency;
	}

	private resolveDependencyChain<T>(registeredDependency: IRegisteredDependency<T>): T {
		const injectedDependencies: RequiredDependencyMap = this.resolveDependencyCustomMetadata(registeredDependency.dependency);
		const paramTypesDependencies: Array<Constructable<unknown>> = this.resolveDependencyParamTypesMetadata(registeredDependency.dependency);

		const resolvedDependencies: Array<unknown> = paramTypesDependencies.map((paramTypeDependency: Constructable<unknown>, index: number): unknown => {
			const injectedDependencyToken: Optional<Token<unknown>> = injectedDependencies.get(index);
			if (injectedDependencyToken) return this.resolveDependency(injectedDependencyToken, registeredDependency);

			if (paramTypeDependency.name !== "Object") {
				const dependencyToken: Token<unknown> = this.container.createDependencyToken(paramTypeDependency);

				return this.resolveDependency(dependencyToken, registeredDependency);
			}

			throw new Error(`Cannot resolve dependency of type "${paramTypeDependency.name}"`);
		});

		return Reflect.construct(registeredDependency.dependency, resolvedDependencies);
	}

	private verifyDependencyPresenceInContainer<T>(token: Token<T>): IRegisteredDependency<T> {
		const registeredDependency: Optional<IRegisteredDependency<T>> = <Optional<IRegisteredDependency<T>>>this.container.getRegisteredDependencies().get(token);
		if (registeredDependency) return registeredDependency;

		throw new Error(`Dependency token "${token.name}" not registered with the container`);
	}

	private checkForCaptiveDependency<T, P>(dependency: IRegisteredDependency<T>, dependent: IRegisteredDependency<P>): void {
		if (dependent.resolution === "transient") return;

		if (dependency.resolution === "singleton") return;

		throw new Error(`Captive dependency detected: Singleton[${dependent.dependency.name}] -> Transient[${dependency.dependency.name}]`);
	}

	private resolveDependencyCustomMetadata<T>(dependency: Constructable<T>): RequiredDependencyMap {
		const dependencies: Optional<RequiredDependencyMap> = Reflect.getMetadata(DIConst.DI_PARAMS, dependency);

		return dependencies ?? new Map<number, Token<unknown>>();
	}

	private resolveDependencyParamTypesMetadata<T>(dependency: Constructable<T>): Array<Constructable<unknown>> {
		const dependencies = Reflect.getMetadata("design:paramtypes", dependency);

		return dependencies ?? [];
	}
}
