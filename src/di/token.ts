// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Token<T> {
	public constructor(private readonly _name: string) {}

	public get name(): string {
		return this._name;
	}
}
