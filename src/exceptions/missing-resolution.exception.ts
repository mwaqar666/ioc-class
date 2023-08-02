import { BaseException } from "@/exceptions/base.exception";

/**
 * Thrown when the injected dependency is neither of type "singleton"
 * nor "transient"
 *
 * @extends BaseException
 * @author Muhammad Waqar
 */
export class MissingResolutionException extends BaseException {
	public constructor(dependencyName: string) {
		super(`Dependency resolution of "${dependencyName}" must be either "SINGLETON", "SCOPED" or "TRANSIENT". None given!`);
	}
}
