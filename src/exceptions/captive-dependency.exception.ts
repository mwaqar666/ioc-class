import { createResolutionTypeName } from "@/enums";
import { BaseException } from "@/exceptions/base.exception";
import type { IRegisteredDependency } from "@/types";

/**
 * Thrown when a transient dependency is kept captive by a singleton dependency
 *
 * @extends BaseException
 * @author Muhammad Waqar
 */
export class CaptiveDependencyException<T, P> extends BaseException {
	public constructor(captorDependency: IRegisteredDependency<T>, captiveDependency: IRegisteredDependency<P>) {
		const captorResolution: string = createResolutionTypeName(captorDependency.resolution);
		const captiveResolution: string = createResolutionTypeName(captiveDependency.resolution);

		super(`Captive dependency detected: ${captorResolution}[${captorDependency.dependency.name}] -> ${captiveResolution}[${captiveDependency.dependency.name}]`);
	}
}
