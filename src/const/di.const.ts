import type { InjectableConfig } from "@/types";

export class DIConst {
	public static readonly DI_PARAMS: unique symbol = Symbol("DI_PARAMS");

	public static readonly DEFAULT_CONTAINER_NAME: string = "DEFAULT";

	public static readonly DEFAULT_INJECTABLE_CONFIG: InjectableConfig = {
		containerName: DIConst.DEFAULT_CONTAINER_NAME,
		dependencyResolution: "singleton",
	};
}
