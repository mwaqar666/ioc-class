import { DIConst } from "@/const";
import { Container } from "@/di";
import { ContainerFactory } from "@/di/container-factory";
import type { IContainer } from "@/interfaces";
import type { Constructable, InjectableConfig, Optional } from "@/types";

function Injectable(config?: Partial<InjectableConfig>): <T>(target: Constructable<T>) => Constructable<T> {
	const resolveInjectableConfig = (config: Optional<Partial<InjectableConfig>>): InjectableConfig => {
		if (!config) {
			return DIConst.DEFAULT_INJECTABLE_CONFIG;
		}

		return {
			...DIConst.DEFAULT_INJECTABLE_CONFIG,
			...config,
		};
	};

	return <T>(target: Constructable<T>): Constructable<T> => {
		const { containerName, dependencyResolution }: InjectableConfig = resolveInjectableConfig(config);

		const container: IContainer = ContainerFactory.getInstance(Container).of(containerName);

		container[dependencyResolution === "singleton" ? "registerSingleton" : "registerTransient"](target);

		return target;
	};
}

/**
 * Registers the singleton dependency in the container with the provided name
 *
 * @param {string} containerName Container name to use or "Default" if no name is provided
 * @return {ClassDecorator} Class decorator for the injected singleton dependency
 * @author Muhammad Waqar
 */
export function Singleton(containerName?: string): ClassDecorator {
	return <ClassDecorator>(<T>(target: Constructable<T>): Constructable<T> => {
		return Injectable({
			containerName,
			dependencyResolution: "singleton",
		})(target);
	});
}

/**
 * Registers the transient dependency in the container with the provided name
 *
 * @param {string} containerName Container name to use or "Default" if no name is provided
 * @return {ClassDecorator} Class decorator for the injected transient dependency
 * @author Muhammad Waqar
 */
export function Transient(containerName?: string): ClassDecorator {
	return <ClassDecorator>(<T>(target: Constructable<T>): Constructable<T> => {
		return Injectable({
			containerName,
			dependencyResolution: "transient",
		})(target);
	});
}
