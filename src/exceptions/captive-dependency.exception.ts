import { BaseException } from "@/exceptions/base.exception";

/**
 * Thrown when a transient dependency is kept captive by a singleton dependency
 *
 * @extends BaseException
 * @author Muhammad Waqar
 */
export class CaptiveDependencyException extends BaseException {
	public constructor(captorDependencyName: string, captiveDependencyName: string) {
		super(`Captive dependency detected: Singleton[${captorDependencyName}] -> Transient[${captiveDependencyName}]`);
	}
}
