import type { Constructable } from "@/types";

export const copyMetadata = <T, TArgs extends Array<unknown>>(targetFrom: Constructable<T, TArgs>, targetTo: Constructable<T, TArgs>): Constructable<T, TArgs> => {
	const originalMetadataKeys: Array<any> = Reflect.getMetadataKeys(targetFrom);

	for (const metadataKey of originalMetadataKeys) {
		const originalMetadata = Reflect.getMetadata(metadataKey, targetFrom);

		Reflect.defineMetadata(metadataKey, originalMetadata, targetTo);
	}

	return targetTo;
};
