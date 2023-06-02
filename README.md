# IOCC

Simple class dependency injection library for Typescript

## Features

- Dependency injection using type hinting
- Support for singleton and transient dependencies
- Support to run on both browser and server
- No dependencies except `reflect-metadata`
- Protection against captive dependencies

## Installation

This library uses `reflect-metadata` for dependency resolution, so you have to install it also.

```bash
npm install reflect-metadata
npm install iocc
```

## Quick Start

Import the `reflect-metadata` library on the project entry point.

```typescript
// index.ts

import "reflect-metadata";
```

Declare some dependencies

```typescript
class BookService {}

interface IShelfService {}

class ShelfService implements IShelfService {
	public constructor(
		private readonly bookService: BookService,
	) {}
}

const ShelfServiceToken = new Token<IShelfService>("ShelfService");

class LibraryService {
	public constructor(
		@Inject(ShelfServiceToken) private readonly shelfService: IShelfService,
	) {}
}
```

Initialize the container

```typescript
const container: IContainer = new Container();
```

Register the dependencies in the container

```typescript
// Order of registration doesn't matter
container.registerSingleton(LibraryService);
container.registerSingleton(ShelfServiceToken, ShelfService);
container.registerSingleton(BookService);
```

Resolve them anywhere

```typescript
// Dependencies that are registered via token must be resolved via the same token
const shelfService: IShelfService = container.resolve(ShelfServiceToken, ShelfService);

// Dependencies that aren't registered via token must be resolved by passing themselves
const libraryService: LibraryService = container.resolve(LibraryService);
const bookService: BookService = container.resolve(BookService);
```

## Examples

#### Initialize container

```typescript
import { Container, IContainer } from "iocc";

const container: IContainer = new Container();
```

#### Initialize container (w/o captive dependency detection)

```typescript
import { Container, IContainer } from "iocc";

const container: IContainer = new Container({ checkForCaptiveDependencies: false });
```

#### Register a singleton dependency

```typescript
class UserService {}

container.registerSingleton(UserService);

container.resolve(UserService);
```

#### Register a singleton dependency using the resolution token

```typescript
import { Token } from "iocc";

interface IUserService {}

class UserService implements IUserService {}

const UserServiceToken = new Token<IUserService>("UserService");
container.registerSingleton(UserServiceToken, UserService);

container.resolve(UserServiceToken);
```

#### Register a transient dependency

```typescript
class UserService {}

container.registerTransient(UserService);

container.resolve(UserService);
```

#### Register a transient dependency using the resolution token

```typescript
import { Token } from "iocc";

interface IUserService {}

class UserService implements IUserService {}

const UserServiceToken = new Token<IUserService>("UserService");
container.registerTransient(UserServiceToken, UserService);

container.resolve(UserService);
```

#### Inject a dependency using the resolution token

```typescript
import { Inject, Token } from "iocc";

interface IBookService {}

class BookService implements IBookService {}

const BookServiceToken = new Token<IBookService>("BookServiceToken");

class UserService {
	public constructor(
		@Inject(BookServiceToken) private readonly bookService: IBookService,
	) {}
}

container.registerSingleton(BookServiceToken, BookService);
container.registerSingleton(UserService);

container.resolve(UserService);
```

## API Reference

### Container

#### Initialize container

```typescript
const container: IContainer = new Container({
	checkForCaptiveDependencies: boolean, // Throw on captive dependencies
});
```

#### Register a singleton dependency

```typescript
registerSingleton<T>(token: Constructable<T>): void;
```

#### Register a singleton dependency using the resolution token

```typescript
registerSingleton<T>(token: Token<T>, dependency: Constructable<T>): void;
```

#### Register a transient dependency

```typescript
registerTransient<T>(token: Constructable<T>): void;
```

#### Register a transient dependency using the resolution token

```typescript
registerTransient<T>(token: Token<T>, dependency: Constructable<T>): void;
```

#### Resolve a dependency

```typescript
resolve<T>(dependency: Constructable<T>): T;
```

#### Resolve a dependency using the resolution token

```typescript
resolve<T>(dependency: Token<T>): T;
```

#### Get container config

```typescript
getContainerConfig(): IContainerConfig;
```

#### Get resolved singleton dependencies

```typescript
getResolvedSingletonDependencies(): SingletonDependencyMap;
```

#### Get registered dependencies

```typescript
getRegisteredDependencies(): DependencyMap;
```

#### Create dependency token

```typescript
createDependencyToken<T>(dependency: Constructable<T>): Token<T>;
```

## FAQ

#### Can it resolve type hinted dependency when used as typed imports?

No

#### Can I add a proxy instance on a dependency?

Yes, but there is a catch. Consider an example where the constructor initialization is trapped using proxies:

```typescript
const Decorator = <T>(target: Constructable<T>): Constructable<T> => {
	return new Proxy(target, {
		construct(concrete: Constructable<T>, args: Array<any>) {}
	})
}

class DemoService {}

@Decorator
class UserService {
	public constructor(
		private readonly demoService: DemoService,
	) {}
}

const container = new Container();

container.registerSingleton(UserService);
container.registerSingleton(DemoService);

const userService = container.resolve(UserService);
```

Here the `UserService` instance will be created, but `demoService` will be undefined inside of `userService`. That is because when we returned the proxified constructor from the `Decorator` function, the metadata properties from `UserService` are lost.

To work around this issue, use the helper function `copyMetadata` like this:

```typescript
import { copyMetadata } from "iocc";

const Decorator = <T>(target: Constructable<T>): Constructable<T> => {
	const proxifiedTarget = new Proxy(target, {
		construct(concrete: Constructable<T>, args: Array<any>) {}
	});

	// This will copy the metadata properties from the original class constructor to the proxified one.
	copyMetadata(target, proxifiedTarget);

	return proxifiedTarget;
}
```
