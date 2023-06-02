import { DIConst } from "@/const";
import { DependencyResolver } from "@/di/dependency-resolver";
import { Token } from "@/di/token";
import type { IContainer, IDependencyResolver } from "@/interfaces";
import type { Constructable, DependencyMap, IContainerConfig, IRegisteredDependency, Optional, SingletonDependencyMap } from "@/types";

export class Container implements IContainer {
	private readonly containerConfig: IContainerConfig;

	private readonly dependencyResolver: IDependencyResolver;

	private readonly registeredDependencies: DependencyMap = new Map();
	private readonly resolvedSingletonDependencies: SingletonDependencyMap = new Map();
	private readonly selfCreatedDependencyTokens: Map<string, Token<unknown>> = new Map<string, Token<unknown>>();

	public constructor(containerConfig?: Partial<IContainerConfig>) {
		this.containerConfig = this.createContainerConfig(containerConfig);

		this.dependencyResolver = new DependencyResolver(this);
	}

	public resolve<T>(dependency: Token<T>): T;
	public resolve<T>(dependency: Constructable<T>): T;
	public resolve<T>(dependency: Token<T> | Constructable<T>): T {
		if (dependency instanceof Token) return this.dependencyResolver.resolveDependency(dependency);

		const token: Token<T> = this.createDependencyToken(dependency);
		return this.dependencyResolver.resolveDependency(token);
	}

	public registerSingleton<T>(token: Constructable<T>): void;
	public registerSingleton<T>(token: Token<T>, dependency: Constructable<T>): void;
	public registerSingleton<T>(token: Token<T> | Constructable<T>, dependency?: Constructable<T>): void {
		if (token instanceof Token) {
			this.registerDependencyOnce("singleton", token, <Constructable<T>>dependency);
			return;
		}

		const dependencyToken: Token<T> = this.createDependencyToken(token);
		this.registerDependencyOnce("singleton", dependencyToken, token);
	}

	public registerTransient<T>(token: Constructable<T>): void;
	public registerTransient<T>(token: Token<T>, dependency: Constructable<T>): void;
	public registerTransient<T>(token: Token<T> | Constructable<T>, dependency?: Constructable<T>): void {
		if (token instanceof Token) {
			this.registerDependencyOnce("transient", token, <Constructable<T>>dependency);
			return;
		}

		const dependencyToken: Token<T> = this.createDependencyToken(token);
		this.registerDependencyOnce("transient", dependencyToken, token);
	}

	public getContainerConfig(): IContainerConfig {
		return this.containerConfig;
	}

	public getResolvedSingletonDependencies(): SingletonDependencyMap {
		return this.resolvedSingletonDependencies;
	}

	public getRegisteredDependencies(): DependencyMap {
		return this.registeredDependencies;
	}

	public createDependencyToken<T>(dependency: Constructable<T>): Token<T> {
		const tokenFromCache: Optional<Token<T>> = this.selfCreatedDependencyTokens.get(dependency.name);
		if (tokenFromCache) return tokenFromCache;

		const newDependencyToken: Token<T> = new Token<T>(dependency.name);
		this.selfCreatedDependencyTokens.set(dependency.name, newDependencyToken);

		return newDependencyToken;
	}

	private registerDependencyOnce<T>(resolution: "singleton" | "transient", token: Token<T>, dependency: Constructable<T>): void {
		const dependencyAlreadyRegistered: boolean = this.registeredDependencies.has(token);
		if (dependencyAlreadyRegistered) return;

		const registeredDependency: IRegisteredDependency<T> = {
			dependency,
			resolution,
		};
		this.registeredDependencies.set(token, <IRegisteredDependency<unknown>>registeredDependency);
	}

	private createContainerConfig(config?: Partial<IContainerConfig>): IContainerConfig {
		if (config) {
			return {
				...DIConst.DI_CONTAINER_DEFAULT_CONFIG,
				...config,
			};
		}

		return DIConst.DI_CONTAINER_DEFAULT_CONFIG;
	}
}
