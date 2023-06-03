import type { Token } from "@/di";
import type { IRegisteredDependency } from "@/types";

export interface IDependencyResolver {
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
	resolveDependency<T>(token: Token<T>): T;

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
	resolveDependency<T, P>(token: Token<T>, parentDependency: IRegisteredDependency<P>): T;
}
