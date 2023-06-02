import type { Constructable } from "@/types";

export const copyMetadata = <T>(targetFrom: Constructable<T>, targetTo: Constructable<T>): Constructable<T> => {
	const originalMetadataKeys: Array<any> = Reflect.getMetadataKeys(targetFrom);

	for (const metadataKey of originalMetadataKeys) {
		const originalMetadata = Reflect.getMetadata(metadataKey, targetFrom);

		Reflect.defineMetadata(metadataKey, originalMetadata, targetTo);
	}

	return targetTo;
};
