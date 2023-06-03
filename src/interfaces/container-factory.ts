import type { IContainer } from "@/interfaces/container";
import type { Optional } from "@/types";

export interface IContainerFactory {
	/**
	 * Retrieves the container instance with the provided name, or default name, if none is provided.
	 * If the container with the provided name is present, returns the same instance, otherwise,
	 * create, store and return the new container instance.
	 *
	 * @param {Optional<symbol>} name Container name to retrieve
	 * @return {IContainer} Container instance
	 * @author Muhammad Waqar
	 */
	of(name: Optional<symbol>): IContainer;
}
