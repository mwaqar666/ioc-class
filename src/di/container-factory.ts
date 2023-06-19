import { DIConst } from "@/const";
import { Container } from "@/di/container";
import type { IContainer } from "@/interfaces";
import type { IResolvedContainerName, Optional } from "@/types";

/**
 * Container factory creates the instances of the container when requested,
 * and keeps track of all the created container instances
 *
 * @author Muhammad Waqar
 */
export class ContainerFactory {
	private static _instance: ContainerFactory;
	private readonly containerInstances: Map<symbol, IContainer>;

	private constructor() {
		this.containerInstances = new Map<symbol, IContainer>();
	}

	/**
	 * Retrieves the container instance with the provided name, or default name, if none is provided.
	 * If the container with the provided name is present, returns the same instance, otherwise,
	 * create, store and return the new container instance.
	 *
	 * @return {IContainer} Container instance
	 * @author Muhammad Waqar
	 */
	public static getContainer(): IContainer;
	/**
	 * Retrieves the container instance with the provided name, or default name, if none is provided.
	 * If the container with the provided name is present, returns the same instance, otherwise,
	 * create, store and return the new container instance.
	 *
	 * @param {Optional<symbol>} name Container name to retrieve
	 * @return {IContainer} Container instance
	 * @author Muhammad Waqar
	 */
	public static getContainer(name: symbol): IContainer;
	public static getContainer(name?: symbol): IContainer {
		if (!ContainerFactory._instance) {
			ContainerFactory._instance = new ContainerFactory();
		}

		return ContainerFactory._instance.resolveContainerInstance(name);
	}

	private resolveContainerInstance(name: Optional<symbol>): IContainer {
		const { containerName }: IResolvedContainerName = this.resolveContainerName(name);

		let containerInstance: Optional<IContainer> = this.containerInstances.get(containerName);
		if (containerInstance) return containerInstance;

		containerInstance = new Container();
		this.containerInstances.set(containerName, containerInstance);

		return containerInstance;
	}

	private resolveContainerName(containerName: Optional<symbol>): IResolvedContainerName {
		if (!containerName) {
			return {
				containerName: DIConst.DEFAULT_CONTAINER_NAME,
			};
		}

		return {
			containerName: containerName,
		};
	}
}
