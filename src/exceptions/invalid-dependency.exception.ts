import { BaseException } from "@/exceptions/base.exception";

/**
 * Thrown when the dependency being resolved is not a valid dependency
 *
 * @extends BaseException
 * @author Muhammad Waqar
 */
export class InvalidDependencyException extends BaseException {
	public constructor(dependencyName: string) {
		super(`Cannot resolve dependency of type "${dependencyName}"`);
	}
}
