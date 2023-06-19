import { DIConst } from "@/const";
import { Token } from "@/di";
import { ContainerFactory } from "@/di/container-factory";
import type { Constructable, Optional, RequiredDependencyMap } from "@/types";

/**
 * Injects the dependency with the provided token
 *
 * @template T
 * @param {Token<T>} identifier Token of the dependency constructor
 * @return {ParameterDecorator} Parameter decorator for the injected dependency
 * @author Muhammad Waqar
 */
export function Inject<T>(identifier: Token<T>): ParameterDecorator;
export function Inject<T>(identifier: Constructable<T>): ParameterDecorator;
export function Inject<T>(identifier: Token<T> | Constructable<T>): ParameterDecorator {
	return <ParameterDecorator>((target: Constructable<T>, _: Optional<string | symbol>, parameterIndex: number): void => {
		let requiredDependencies: Optional<RequiredDependencyMap> = Reflect.getMetadata(DIConst.DI_PARAMS, target);
		requiredDependencies ??= new Map<number, Token<unknown>>();

		if (identifier instanceof Token) {
			requiredDependencies.set(parameterIndex, identifier);
			Reflect.defineMetadata(DIConst.DI_PARAMS, requiredDependencies, target);

			return;
		}

		identifier = ContainerFactory.getContainer().createDependencyToken(identifier);

		requiredDependencies.set(parameterIndex, identifier);
		Reflect.defineMetadata(DIConst.DI_PARAMS, requiredDependencies, target);
	});
}
