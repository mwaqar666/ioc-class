import { DIConst } from "@/const";
import { ContainerFactory } from "@/di/container-factory";
import { ResolutionType } from "@/enums";
import { MissingResolutionException } from "@/exceptions";
import type { IContainer } from "@/interfaces";
import type { Constructable, InjectableConfig } from "@/types";

function Injectable(config: InjectableConfig): <T>(target: Constructable<T>) => Constructable<T> {
	return <T>(target: Constructable<T>): Constructable<T> => {
		const container: IContainer = ContainerFactory.getContainer(config.containerName);

		if (config.dependencyResolution === ResolutionType.SINGLETON) {
			container.registerSingleton(target);

			return target;
		}

		if (config.dependencyResolution === ResolutionType.SCOPED) {
			container.registerScoped(target);

			return target;
		}

		if (config.dependencyResolution === ResolutionType.TRANSIENT) {
			container.registerTransient(target);

			return target;
		}

		throw new MissingResolutionException(target.name);
	};
}

/**
 * Registers the singleton dependency in the container with the provided name
 *
 * @return {<T>(target: Constructable<T>) => Constructable<T>} Class decorator for the injected singleton dependency
 * @author Muhammad Waqar
 */
export function Singleton(): <T>(target: Constructable<T>) => Constructable<T>;
/**
 * Registers the singleton dependency in the container with the provided name
 *
 * @param {string} containerName Container name to use or "Default" if no name is provided
 * @return {<T>(target: Constructable<T>) => Constructable<T>} Class decorator for the injected singleton dependency
 * @author Muhammad Waqar
 */
export function Singleton(containerName: symbol): <T>(target: Constructable<T>) => Constructable<T>;
export function Singleton(containerName?: symbol): <T>(target: Constructable<T>) => Constructable<T> {
	return <T>(target: Constructable<T>): Constructable<T> => {
		return Injectable({
			containerName: containerName ?? DIConst.DEFAULT_CONTAINER_NAME,
			dependencyResolution: ResolutionType.SINGLETON,
		})(target);
	};
}

/**
 * Registers the scoped dependency in the container with the provided name
 *
 * @return {<T>(target: Constructable<T>) => Constructable<T>} Class decorator for the injected scoped dependency
 * @author Muhammad Waqar
 */
export function Scoped(): <T>(target: Constructable<T>) => Constructable<T>;
/**
 * Registers the scoped dependency in the container with the provided name
 *
 * @param {string} containerName Container name to use or "Default" if no name is provided
 * @return {<T>(target: Constructable<T>) => Constructable<T>} Class decorator for the injected scoped dependency
 * @author Muhammad Waqar
 */
export function Scoped(containerName: symbol): <T>(target: Constructable<T>) => Constructable<T>;
export function Scoped(containerName?: symbol): <T>(target: Constructable<T>) => Constructable<T> {
	return <T>(target: Constructable<T>): Constructable<T> => {
		return Injectable({
			containerName: containerName ?? DIConst.DEFAULT_CONTAINER_NAME,
			dependencyResolution: ResolutionType.SCOPED,
		})(target);
	};
}

/**
 * Registers the transient dependency in the container with the provided name
 *
 * @return {<T>(target: Constructable<T>) => Constructable<T>} Class decorator for the injected transient dependency
 * @author Muhammad Waqar
 */
export function Transient(): <T>(target: Constructable<T>) => Constructable<T>;
/**
 * Registers the transient dependency in the container with the provided name
 *
 * @param {string} containerName Container name to use or "Default" if no name is provided
 * @return {<T>(target: Constructable<T>) => Constructable<T>} Class decorator for the injected transient dependency
 * @author Muhammad Waqar
 */
export function Transient(containerName: symbol): <T>(target: Constructable<T>) => Constructable<T>;
export function Transient(containerName?: symbol): <T>(target: Constructable<T>) => Constructable<T> {
	return <T>(target: Constructable<T>): Constructable<T> => {
		return Injectable({
			containerName: containerName ?? DIConst.DEFAULT_CONTAINER_NAME,
			dependencyResolution: ResolutionType.TRANSIENT,
		})(target);
	};
}
