import { Container } from "@/di";
import { ContainerFactory } from "@/di/container-factory";
import { MissingResolutionException } from "@/exceptions";
import type { IContainer } from "@/interfaces";
import type { Constructable, InjectableConfig } from "@/types";

function Injectable(config: Partial<InjectableConfig>): <T>(target: Constructable<T>) => Constructable<T> {
	return <T>(target: Constructable<T>): Constructable<T> => {
		const container: IContainer = ContainerFactory.getInstance(Container).of(config.containerName);

		if (config.dependencyResolution === "singleton") {
			container.registerSingleton(target);

			return target;
		}

		if (config.dependencyResolution === "transient") {
			container.registerTransient(target);

			return target;
		}

		throw new MissingResolutionException(target.name);
	};
}

/**
 * Registers the singleton dependency in the container with the provided name
 *
 * @param {string} containerName Container name to use or "Default" if no name is provided
 * @return {<T>(target: Constructable<T>) => Constructable<T>} Class decorator for the injected singleton dependency
 * @author Muhammad Waqar
 */
export function Singleton(containerName?: symbol): <T>(target: Constructable<T>) => Constructable<T> {
	return <T>(target: Constructable<T>): Constructable<T> => {
		return Injectable({
			containerName,
			dependencyResolution: "singleton",
		})(target);
	};
}

/**
 * Registers the transient dependency in the container with the provided name
 *
 * @param {string} containerName Container name to use or "Default" if no name is provided
 * @return {<T>(target: Constructable<T>) => Constructable<T>} Class decorator for the injected transient dependency
 * @author Muhammad Waqar
 */
export function Transient(containerName?: symbol): <T>(target: Constructable<T>) => Constructable<T> {
	return <T>(target: Constructable<T>): Constructable<T> => {
		return Injectable({
			containerName,
			dependencyResolution: "transient",
		})(target);
	};
}
