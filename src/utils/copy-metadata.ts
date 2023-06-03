import type { Constructable } from "@/types";

/**
 * Copies the metadata from one constructor to another. Useful in the context where the injectable class
 * is wrapped inside the Proxy instance, as currently, metadata is not copied over to the Proxied constructor.
 *
 * @template T
 * @param {Constructable<T>} targetFrom Metadata to copy from
 * @param {Constructable<T>} targetTo Metadata to copy to
 * @return {Constructable<T>} Constructor with the copied metadata
 * @author Muhammad Waqar
 */
export function copyMetadata<T>(targetFrom: Constructable<T>, targetTo: Constructable<T>): Constructable<T> {
	const originalMetadataKeys: Array<any> = Reflect.getMetadataKeys(targetFrom);

	for (const metadataKey of originalMetadataKeys) {
		const originalMetadata = Reflect.getMetadata(metadataKey, targetFrom);

		Reflect.defineMetadata(metadataKey, originalMetadata, targetTo);
	}

	return targetTo;
}
