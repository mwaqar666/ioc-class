import { DIConst } from "@/const";
import type { Token } from "@/di/token";
import { CaptiveDependencyException, InvalidDependencyException, MissingDependencyException } from "@/exceptions";
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
	 * @throws MissingDependencyException
	 * @throws CaptiveDependencyException
	 * @throws InvalidDependencyException
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
	 * @throws MissingDependencyException
	 * @throws CaptiveDependencyException
	 * @throws InvalidDependencyException
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
		const dependenciesByToken: RequiredDependencyMap = this.resolveDependencyCustomMetadata(registeredDependency.dependency);
		const dependenciesByReflection: Array<Constructable<unknown>> = this.resolveDependencyParamTypesMetadata(registeredDependency.dependency);

		// If there are not any dependencies either by token or through reflection, then we just construct the dependency
		if (dependenciesByReflection.length === 0 && dependenciesByToken.size === 0) {
			return Reflect.construct(registeredDependency.dependency, []);
		}

		const dependenciesTokenList: Array<Token<unknown>> = this.prepareDependencyTokenList(dependenciesByToken, dependenciesByReflection, registeredDependency);

		return Reflect.construct(
			registeredDependency.dependency,
			dependenciesTokenList.map((dependencyToken: Token<unknown>): unknown => this.resolveDependency(dependencyToken, registeredDependency)),
		);
	}

	private prepareDependencyTokenList<T>(dependenciesByToken: RequiredDependencyMap, dependenciesByReflection: Array<Constructable<unknown>>, registeredDependency: IRegisteredDependency<T>): Array<Token<unknown>> {
		const dependenciesTokenList: Array<Token<unknown>> = [];
		const dependenciesByTokenIndices: Array<number> = Array.from(dependenciesByToken.keys());

		// We check what is the biggest index on which the dependency is injected through token,
		// and then we add 1 to it because length is always 1 greater than the index
		const dependenciesLengthByToken: number = Math.max(...dependenciesByTokenIndices) + 1;
		const dependenciesLengthByReflection: number = dependenciesByReflection.length;

		const dependenciesLength: number = dependenciesLengthByToken > dependenciesLengthByReflection ? dependenciesLengthByToken : dependenciesLengthByReflection;

		for (let dependencyIndex = 0; dependencyIndex < dependenciesLength; dependencyIndex++) {
			const dependencyByToken: Optional<Token<unknown>> = dependenciesByToken.get(dependencyIndex);
			// Dependency found in manual injection
			if (dependencyByToken) {
				dependenciesTokenList.push(dependencyByToken);
				continue;
			}

			const dependencyByReflection: Optional<Constructable<unknown>> = dependenciesByReflection[dependencyIndex];
			if (this.isValidDependency(dependencyByReflection)) {
				dependenciesTokenList.push(this.container.createDependencyToken(dependencyByReflection));
				continue;
			}

			throw new InvalidDependencyException(dependencyIndex.toString(), registeredDependency.dependency.name);
		}

		return dependenciesTokenList;
	}

	private verifyDependencyPresenceInContainer<T>(token: Token<T>): IRegisteredDependency<T> {
		const registeredDependency: Optional<IRegisteredDependency<T>> = <Optional<IRegisteredDependency<T>>>this.container.getRegisteredDependencies().get(token);
		if (registeredDependency) return registeredDependency;

		throw new MissingDependencyException(token.name);
	}

	private checkForCaptiveDependency<T, P>(dependency: IRegisteredDependency<T>, dependent: IRegisteredDependency<P>): void {
		if (dependent.resolution === "transient") return;

		if (dependency.resolution === "singleton") return;

		throw new CaptiveDependencyException(dependent.dependency.name, dependency.dependency.name);
	}

	private resolveDependencyCustomMetadata<T>(dependency: Constructable<T>): RequiredDependencyMap {
		const dependencies: Optional<RequiredDependencyMap> = Reflect.getMetadata(DIConst.DI_PARAMS, dependency);

		return dependencies ?? new Map<number, Token<unknown>>();
	}

	private resolveDependencyParamTypesMetadata<T>(dependency: Constructable<T>): Array<Constructable<unknown>> {
		const dependencies = Reflect.getMetadata("design:paramtypes", dependency);

		return dependencies ?? [];
	}

	private isValidDependency(dependency: Optional<Constructable<unknown>>): dependency is Constructable<unknown> {
		if (!dependency) return false;

		return ![Object.name, Function.name].includes(dependency.name);
	}
}
