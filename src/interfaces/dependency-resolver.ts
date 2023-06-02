import type { Token } from "@/di";
import type { IRegisteredDependency } from "@/types";

export interface IDependencyResolver {
	resolveDependency<T>(token: Token<T>): T;

	resolveDependency<T, P>(token: Token<T>, parentDependency: IRegisteredDependency<P>): T;
}
