export enum ResolutionType {
	TRANSIENT = 2,
	SCOPED = 4,
	SINGLETON = 8,
}

export const createResolutionTypeName = (resolutionType: ResolutionType): string => {
	switch (resolutionType) {
		case ResolutionType.TRANSIENT:
			return "TRANSIENT";
		case ResolutionType.SCOPED:
			return "SCOPED";
		case ResolutionType.SINGLETON:
			return "SINGLETON";
	}
};
