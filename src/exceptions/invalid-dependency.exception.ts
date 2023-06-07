import { BaseException } from "@/exceptions/base.exception";

/**
 * Thrown when the dependency being resolved is not a valid dependency
 *
 * @extends BaseException
 * @author Muhammad Waqar
 */
export class InvalidDependencyException extends BaseException {
	public constructor(dependencyIndex: string, dependantName: string) {
		super(`Invalid dependency at index "${dependencyIndex}" while resolving ${dependantName}`);
	}
}
