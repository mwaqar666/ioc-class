import type { IContainerConfig } from "@/types";

export class DIConst {
	public static readonly DI_PARAMS: unique symbol = Symbol("DI_PARAMS");

	public static readonly DI_CONTAINER_DEFAULT_CONFIG: IContainerConfig = {
		checkForCaptiveDependencies: true,
	};
}
