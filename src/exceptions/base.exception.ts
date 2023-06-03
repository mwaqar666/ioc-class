/**
 * All the library exceptions extends this BaseException class
 *
 * @extends Error
 * @author Muhammad Waqar
 */
export class BaseException extends Error {
	protected constructor(message: string) {
		super();

		this.message = message;
	}
}
