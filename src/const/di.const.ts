import type { IDependencyRegisterOptions } from "@/types";

export class DIConst {
	public static readonly DI_PARAMS: symbol = Symbol("DI_PARAMS");

	public static readonly DEFAULT_CONTAINER_NAME: symbol = Symbol("DEFAULT");

	public static readonly DEFAULT_DEPENDENCY_REGISTER_OPTIONS: Required<IDependencyRegisterOptions> = {
		onDuplicate: "throw",
	};
}
