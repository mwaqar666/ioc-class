# Project Title

Simple dependency injection library for Typescript

## Features

- Dependency injection using type hinting
- Support for singleton and transient dependencies
- Support to run on both browser and server
- No dependencies except `reflect-metadata`

## Installation

This library uses `reflect-metadata` for dependency resolution, so you have to install it also.

```bash
npm install reflect-metadata
npm install ioc-class
```

## Usage/Examples

Import the `reflect-metadata` library on the project entry point.

```typescript
// index.ts

import "reflect-metadata";
```

Declare some dependencies

```typescript
class BookService {
}

interface IShelfService {
}

class ShelfService implements IShelfService {
	public constructor(
		private readonly bookService: BookService,
	) {
	}
}

const ShelfServiceToken = new Token<IShelfService>("ShelfService");

class LibraryService {
	public constructor(
		@Inject(ShelfServiceToken) private readonly shelfService: IShelfService,
	) {
	}
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

## API Reference

#### Initialize container

```typescript
import { Container, IContainer } from "ioc-class";

const container: IContainer = new Container();
```

#### Register a singleton dependency

```typescript
class UserService {
}

container.registerSingleton(UserService);

container.resolve(UserService) // UserService
```

#### Register a singleton dependency using the resolution token

```typescript
import { Token } from "ioc-class";

interface IUserService {
}

class UserService implements IUserService {
}

const UserServiceToken = new Token<IUserService>("UserService");
container.registerSingleton(UserServiceToken, UserService);

container.resolve(UserServiceToken); // UserService
```

#### Register a transient dependency

```typescript
class UserService {
}

container.registerTransient(UserService);

container.resolve(UserService) // UserService
```

#### Register a transient dependency using the resolution token

```typescript
import { Token } from "ioc-class";

interface IUserService {
}

class UserService implements IUserService {
}

const UserServiceToken = new Token<IUserService>("UserService");
container.registerTransient(UserServiceToken, UserService);

container.resolve(UserService) // UserService
```

#### Inject a dependency using the resolution token

```typescript
import { Inject, Token } from "ioc-class";

interface IBookService {
}

class BookService implements IBookService {
}

const BookServiceToken = new Token<IBookService>("BookServiceToken");

class UserService {
	public constructor(
		@Inject(BookServiceToken) private readonly bookService: IBookService,
	) {
	}
}

container.registerSingleton(BookServiceToken, BookService);
container.registerSingleton(UserService);

container.resolve(UserService); // UserService
```

## FAQ

#### Can it resolve type hinted dependency when used as typed imports?

No

#### Can I add a proxy instance on a dependency?

Yes, but there is a catch. Consider an example where the constructor initialization is trapped using proxies:

```typescript
const Decorator = <T>(target: Constructable<T>): Constructable<T> => {
	return new Proxy(target, {
		construct(concrete: Constructable<T>, args: Array<any>) {
			//
		}
	})
}

class DemoService {
}

@Decorator
class UserService {
	public constructor(
		private readonly demoService: DemoService,
	) {
	}
}

const container = new Container();

container.registerSingleton(UserService);
container.registerSingleton(DemoService);

const userService = container.resolve(UserService);
```

Here the `UserService` instance will be created, but `demoService` will be undefined inside of `userService`. That is because when we returned the proxified constructor from the `Decorator` function, the metadata properties from `UserService` are lost.

To work around this issue, use the helper function `copyMetadata` like this:

```typescript
import { copyMetadata } from "ioc-class";

const Decorator = <T>(target: Constructable<T>): Constructable<T> => {
	const proxifiedTarget = new Proxy(target, {
		construct(concrete: Constructable<T>, args: Array<any>) {
			//
		}
	});

	// This will copy the metadata properties from the original class constructor to the proxified one.
	copyMetadata(target, proxifiedTarget);

	return proxifiedTarget;
}
```

## Authors

- [@mwaqar666](https://www.github.com/mwaqar666)

## License

MIT License

Copyright (c) 2023 Muhammad Waqar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
