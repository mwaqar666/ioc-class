import { DIConst } from "@/const";
import type { Token } from "@/di";
import type { Constructable, Injectable, Optional, RequiredDependencyMap } from "@/types";

export const Inject: Injectable = <T>(identifier: Token<T>): ParameterDecorator => {
	return <ParameterDecorator>((target: Constructable<T>, _: Optional<string | symbol>, parameterIndex: number): void => {
		let requiredDependencies: Optional<RequiredDependencyMap> = Reflect.getMetadata(DIConst.DI_PARAMS, target);
		requiredDependencies ??= new Map<number, Token<unknown>>();

		requiredDependencies.set(parameterIndex, identifier);
		Reflect.defineMetadata(DIConst.DI_PARAMS, requiredDependencies, target);
	});
};
