import { DIConst } from "@/const";
import type { IContainer, IContainerFactory } from "@/interfaces";
import type { Constructable, IResolvedContainerName, Optional } from "@/types";

/**
 * Container factory creates the instances of the container when requested,
 * and keeps track of all the created container instances
 *
 * @implements IContainerFactory
 * @author Muhammad Waqar
 */
export class ContainerFactory implements IContainerFactory {
	private static _instance: ContainerFactory;
	private readonly container: Constructable<IContainer>;
	private readonly containerInstances: Map<symbol, IContainer>;

	private constructor(container: Constructable<IContainer>) {
		this.container = container;
		this.containerInstances = new Map<symbol, IContainer>();
	}

	public static getInstance(container: Constructable<IContainer>): ContainerFactory {
		if (ContainerFactory._instance) return ContainerFactory._instance;

		ContainerFactory._instance = new ContainerFactory(container);

		return ContainerFactory._instance;
	}

	/**
	 * Retrieves the container instance with the provided name, or default name, if none is provided.
	 * If the container with the provided name is present, returns the same instance, otherwise,
	 * create, store and return the new container instance.
	 *
	 * @param {Optional<string>} name Container name to retrieve
	 * @return {IContainer} Container instance
	 * @author Muhammad Waqar
	 */
	public of(name: Optional<string>): IContainer {
		const { containerName }: IResolvedContainerName = this.resolveContainerName(name);

		const containerInstance: Optional<IContainer> = this.containerInstances.get(containerName);
		if (containerInstance) return containerInstance;

		const newContainerInstance: IContainer = new this.container();
		this.containerInstances.set(containerName, newContainerInstance);

		return newContainerInstance;
	}

	private resolveContainerName(containerName: Optional<string>): IResolvedContainerName {
		if (!containerName) {
			return {
				containerName: Symbol(DIConst.DEFAULT_CONTAINER_NAME),
			};
		}

		return {
			containerName: Symbol(containerName),
		};
	}
}
