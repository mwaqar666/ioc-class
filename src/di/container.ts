import { DIConst } from "@/const";
import { DependencyResolver } from "@/di/dependency-resolver";
import { Token } from "@/di/token";
import { OnDuplicateRegister, ResolutionType } from "@/enums";
import { DuplicateDependencyException } from "@/exceptions";
import type { IContainer, IDependencyResolver } from "@/interfaces";
import type { CachedResolvedDependencyMap, Constructable, DependencyMap, IDependencyRegisterOptions, IRegisteredDependency, IResolvedDependency, Optional } from "@/types";

/**
 * Container class holds all the registered singleton and transient dependencies.
 * The dependencies are resolved at when requested. To create an instance of the
 * Container class, you can call the factory method, `Container.of()`
 *
 * @implements IContainer
 * @author Muhammad Waqar
 */
export class Container implements IContainer {
	private readonly _dependencyResolver: IDependencyResolver;

	private readonly _registeredDependencies: DependencyMap = new Map<Token<unknown>, IRegisteredDependency<unknown>>();
	private readonly _cachedResolvedDependencies: CachedResolvedDependencyMap = new Map<Token<unknown>, IResolvedDependency<unknown>>();
	private readonly _selfCreatedDependencyTokens: Map<string, Token<unknown>> = new Map<string, Token<unknown>>();

	/**
	 * You should not create the instance of Container class yourself.
	 * Use `ContainerFactory.getContainer` instead
	 *
	 * @author Muhammad Waqar
	 */
	public constructor() {
		this._dependencyResolver = new DependencyResolver(this);
	}

	public get registeredDependencies(): DependencyMap {
		return this._registeredDependencies;
	}

	public get cachedResolvedDependencies(): CachedResolvedDependencyMap {
		return this._cachedResolvedDependencies;
	}

	public resolve<T>(dependency: Token<T>): T;
	public resolve<T>(dependency: Constructable<T>): T;
	public resolve<T>(dependency: Token<T> | Constructable<T>): T {
		if (dependency instanceof Token) return this._dependencyResolver.resolveDependency(dependency);

		const token: Token<T> = this.createDependencyToken(dependency);
		return this._dependencyResolver.resolveDependency(token);
	}

	public registerSingleton<T>(token: Constructable<T>): void;
	public registerSingleton<T>(token: Constructable<T>, dependency: IDependencyRegisterOptions): void;
	public registerSingleton<T>(token: Token<T>, dependency: Constructable<T>): void;
	public registerSingleton<T>(token: Token<T>, dependency: Constructable<T>, registerOptions: IDependencyRegisterOptions): void;
	public registerSingleton<T>(token: Token<T> | Constructable<T>, dependency?: Constructable<T> | IDependencyRegisterOptions, registerOptions?: IDependencyRegisterOptions): void {
		if (token instanceof Token) {
			const preparedRegisterOptions: Required<IDependencyRegisterOptions> = this.prepareDependencyRegisterOptions(registerOptions ?? {});
			this.registerDependencyOnce(ResolutionType.SINGLETON, token, <Constructable<T>>dependency, preparedRegisterOptions);
			return;
		}

		const preparedRegisterOptions: Required<IDependencyRegisterOptions> = this.prepareDependencyRegisterOptions(<IDependencyRegisterOptions>dependency ?? {});
		const dependencyToken: Token<T> = this.createDependencyToken(token);
		this.registerDependencyOnce(ResolutionType.SINGLETON, dependencyToken, token, preparedRegisterOptions);
	}

	public registerTransient<T>(token: Constructable<T>): void;
	public registerTransient<T>(token: Constructable<T>, dependency: IDependencyRegisterOptions): void;
	public registerTransient<T>(token: Token<T>, dependency: Constructable<T>): void;
	public registerTransient<T>(token: Token<T>, dependency: Constructable<T>, registerOptions: IDependencyRegisterOptions): void;

	public registerTransient<T>(token: Token<T> | Constructable<T>, dependency?: Constructable<T> | IDependencyRegisterOptions, registerOptions?: IDependencyRegisterOptions): void {
		if (token instanceof Token) {
			const preparedRegisterOptions: Required<IDependencyRegisterOptions> = this.prepareDependencyRegisterOptions(registerOptions ?? {});
			this.registerDependencyOnce(ResolutionType.TRANSIENT, token, <Constructable<T>>dependency, preparedRegisterOptions);
			return;
		}

		const preparedRegisterOptions: Required<IDependencyRegisterOptions> = this.prepareDependencyRegisterOptions(<IDependencyRegisterOptions>dependency ?? {});
		const dependencyToken: Token<T> = this.createDependencyToken(token);
		this.registerDependencyOnce(ResolutionType.TRANSIENT, dependencyToken, token, preparedRegisterOptions);
	}

	public registerScoped<T>(token: Constructable<T>): void;
	public registerScoped<T>(token: Constructable<T>, dependency: IDependencyRegisterOptions): void;
	public registerScoped<T>(token: Token<T>, dependency: Constructable<T>): void;
	public registerScoped<T>(token: Token<T>, dependency: Constructable<T>, registerOptions: IDependencyRegisterOptions): void;
	public registerScoped<T>(token: Token<T> | Constructable<T>, dependency?: Constructable<T> | IDependencyRegisterOptions, registerOptions?: IDependencyRegisterOptions): void {
		if (token instanceof Token) {
			const preparedRegisterOptions: Required<IDependencyRegisterOptions> = this.prepareDependencyRegisterOptions(registerOptions ?? {});
			this.registerDependencyOnce(ResolutionType.SCOPED, token, <Constructable<T>>dependency, preparedRegisterOptions);
			return;
		}

		const preparedRegisterOptions: Required<IDependencyRegisterOptions> = this.prepareDependencyRegisterOptions(<IDependencyRegisterOptions>dependency ?? {});
		const dependencyToken: Token<T> = this.createDependencyToken(token);
		this.registerDependencyOnce(ResolutionType.SCOPED, dependencyToken, token, preparedRegisterOptions);
	}

	public createDependencyToken<T>(dependency: Constructable<T>): Token<T> {
		const tokenFromCache: Optional<Token<T>> = this._selfCreatedDependencyTokens.get(dependency.name);
		if (tokenFromCache) return tokenFromCache;

		const newDependencyToken: Token<T> = new Token<T>(dependency.name);
		this._selfCreatedDependencyTokens.set(dependency.name, newDependencyToken);

		return newDependencyToken;
	}

	public resetScopedDependencies(): void {
		for (const [token, { resolution }] of this._cachedResolvedDependencies.entries()) {
			if (resolution !== ResolutionType.SCOPED) continue;

			this._cachedResolvedDependencies.delete(token);
		}
	}

	private prepareDependencyRegisterOptions(registerOptions: IDependencyRegisterOptions): Required<IDependencyRegisterOptions> {
		return {
			...DIConst.DEFAULT_DEPENDENCY_REGISTER_OPTIONS,
			...registerOptions,
		};
	}

	private registerDependencyOnce<T>(resolution: ResolutionType, token: Token<T>, dependency: Constructable<T>, registerOptions: Required<IDependencyRegisterOptions>): void {
		const dependencyAlreadyRegistered: boolean = this._registeredDependencies.has(token);
		if (dependencyAlreadyRegistered) {
			if (registerOptions.onDuplicate === OnDuplicateRegister.IGNORE) return;

			throw new DuplicateDependencyException(dependency.name);
		}

		const registeredDependency: IRegisteredDependency<T> = {
			dependency,
			resolution,
		};
		this._registeredDependencies.set(token, <IRegisteredDependency<unknown>>registeredDependency);
	}
}
