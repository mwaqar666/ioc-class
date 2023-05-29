import { DIConst } from "@/const";
import { Token } from "@/di/token";
import type { IContainer } from "@/interfaces";
import type { Constructable, DependencyMap, IRegisteredDependency, Optional, RequiredDependencyMap, SingletonDependencyMap } from "@/types";

export class Container implements IContainer {
	private readonly registeredDependencies: DependencyMap = new Map();
	private readonly resolvedSingletonDependencies: SingletonDependencyMap = new Map();
	private readonly selfCreatedDependencyTokens: Map<string, Token<unknown>> = new Map<string, Token<unknown>>();

	public resolve<T>(dependency: Token<T>): T;
	public resolve<T, TArgs extends Array<unknown>>(dependency: Constructable<T, TArgs>): T;
	public resolve<T, TArgs extends Array<unknown>>(dependency: Token<T> | Constructable<T, TArgs>): T {
		if (dependency instanceof Token) return this.resolveDependency(dependency);

		const token: Token<T> = this.createDependencyToken(dependency);
		return this.resolveDependency(token);
	}

	public registerSingleton<T, TArgs extends Array<unknown>>(token: Constructable<T, TArgs>): void;
	public registerSingleton<T, TArgs extends Array<unknown>>(token: Token<T>, dependency: Constructable<T, TArgs>): void;
	public registerSingleton<T, TArgs extends Array<unknown>>(token: Token<T> | Constructable<T, TArgs>, dependency?: Constructable<T, TArgs>): void {
		if (token instanceof Token) {
			this.registerDependencyOnce("singleton", token, <Constructable<T, TArgs>>dependency);
			return;
		}

		const dependencyToken: Token<T> = this.createDependencyToken(token);
		this.registerDependencyOnce("singleton", dependencyToken, token);
	}

	public registerTransient<T, TArgs extends Array<unknown>>(token: Constructable<T, TArgs>): void;
	public registerTransient<T, TArgs extends Array<unknown>>(token: Token<T>, dependency: Constructable<T, TArgs>): void;
	public registerTransient<T, TArgs extends Array<unknown>>(token: Token<T> | Constructable<T, TArgs>, dependency?: Constructable<T, TArgs>): void {
		if (token instanceof Token) {
			this.registerDependencyOnce("transient", token, <Constructable<T, TArgs>>dependency);
			return;
		}

		const dependencyToken: Token<T> = this.createDependencyToken(token);
		this.registerDependencyOnce("transient", dependencyToken, token);
	}

	private registerDependencyOnce<T, TArgs extends Array<unknown>>(resolution: "singleton" | "transient", token: Token<T>, dependency: Constructable<T, TArgs>): void {
		const dependencyAlreadyRegistered: boolean = this.registeredDependencies.has(token);
		if (dependencyAlreadyRegistered) return;

		const registeredDependency: IRegisteredDependency<T, TArgs> = {
			dependency,
			resolution,
		};
		this.registeredDependencies.set(token, <IRegisteredDependency<unknown>>registeredDependency);
	}

	private resolveDependency<T, TArgs extends Array<unknown>>(token: Token<T>): T {
		const registeredDependency: IRegisteredDependency<T, TArgs> = this.verifyDependencyPresenceInContainer(token);

		if (registeredDependency.resolution === "singleton") {
			return this.resolveSingletonDependency(token, registeredDependency.dependency);
		}

		return this.resolveDependencyChain(registeredDependency.dependency);
	}

	private resolveSingletonDependency<T, TArgs extends Array<unknown>>(token: Token<T>, dependency: Constructable<T, TArgs>): T {
		const singletonDependency: Optional<T> = <Optional<T>>this.resolvedSingletonDependencies.get(token);
		if (singletonDependency) return singletonDependency;

		const resolvedDependency: T = this.resolveDependencyChain(dependency);
		this.resolvedSingletonDependencies.set(token, resolvedDependency);

		return resolvedDependency;
	}

	private resolveDependencyChain<T, TArgs extends Array<unknown>>(dependency: Constructable<T, TArgs>): T {
		const injectedDependencies: RequiredDependencyMap = this.resolveDependencyCustomMetadata(dependency);
		const paramTypesDependencies: Array<Constructable<unknown>> = this.resolveDependencyParamTypesMetadata(dependency);

		const resolvedDependencies: Array<unknown> = paramTypesDependencies.map((paramTypeDependency: Constructable<unknown>, index: number): unknown => {
			const injectedDependencyToken: Optional<Token<unknown>> = injectedDependencies.get(index);
			if (injectedDependencyToken) return this.resolveDependency(injectedDependencyToken);

			if (paramTypeDependency.name !== "Object") {
				const dependencyToken: Token<unknown> = this.createDependencyToken(paramTypeDependency);

				return this.resolveDependency(dependencyToken);
			}

			throw new Error(`Cannot resolve dependency of type "${paramTypeDependency.name}"`);
		});

		return Reflect.construct(dependency, resolvedDependencies);
	}

	private verifyDependencyPresenceInContainer<T, TArgs extends Array<unknown>>(token: Token<T>): IRegisteredDependency<T, TArgs> {
		const registeredDependency: Optional<IRegisteredDependency<T, TArgs>> = <Optional<IRegisteredDependency<T, TArgs>>>this.registeredDependencies.get(token);
		if (registeredDependency) return registeredDependency;

		throw new Error(`Dependency token "${token.name}" not registered with the container`);
	}

	private resolveDependencyCustomMetadata<T, TArgs extends Array<unknown>>(dependency: Constructable<T, TArgs>): RequiredDependencyMap {
		const dependencies: Optional<RequiredDependencyMap> = Reflect.getMetadata(DIConst.DI_PARAMS, dependency);
		return dependencies ?? new Map<number, Token<unknown>>();
	}

	private resolveDependencyParamTypesMetadata<T, TArgs extends Array<unknown>>(dependency: Constructable<T, TArgs>): Array<Constructable<unknown>> {
		const dependencies = Reflect.getMetadata("design:paramtypes", dependency);
		return dependencies ?? [];
	}

	private createDependencyToken<T, TArgs extends Array<unknown>>(dependency: Constructable<T, TArgs>): Token<T> {
		const tokenFromCache: Optional<Token<T>> = this.selfCreatedDependencyTokens.get(dependency.name);
		if (tokenFromCache) return tokenFromCache;

		const newDependencyToken: Token<T> = new Token<T>(dependency.name);
		this.selfCreatedDependencyTokens.set(dependency.name, newDependencyToken);

		return newDependencyToken;
	}
}
