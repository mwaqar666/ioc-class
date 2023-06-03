import { BaseException } from "@/exceptions/base.exception";

/**
 * Thrown when a dependency is trying to be resolved that hadn't been
 * registered with the container
 *
 * @extends BaseException
 * @author Muhammad Waqar
 */
export class MissingDependencyException extends BaseException {
	public constructor(tokenName: string) {
		super(`Dependency token "${tokenName}" not registered with the container`);
	}
}
