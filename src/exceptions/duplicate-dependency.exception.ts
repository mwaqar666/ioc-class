import { BaseException } from "@/exceptions/base.exception";

/**
 * Thrown when a dependency is trying to register to the same container twice
 *
 * @extends BaseException
 */
export class DuplicateDependencyException extends BaseException {
	public constructor(dependencyName: string) {
		super(`"${dependencyName}" has been already registered!`);
	}
}
