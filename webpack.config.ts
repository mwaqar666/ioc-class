import { join, resolve } from "path";
import type { Configuration } from "webpack";

type TWebpackMode = "development" | "production";

interface TWebpackEnvironment {
	mode: TWebpackMode;
}

export default async (environment: TWebpackEnvironment): Promise<Configuration> => {
	return {
		mode: environment.mode,
		entry: join(__dirname, "src/index.ts"),
		devtool: environment.mode === "development" ? "source-map" : false,
		output: {
			filename: "index.js",
			path: join(__dirname, "dist"),
			globalObject: "this",
			library: {
				name: "DI",
				type: "umd",
			},
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: "ts-loader",
					exclude: /node_modules/,
				},
			],
		},
		resolve: {
			extensions: [".ts"],
			alias: {
				"@": resolve(__dirname, "src"),
			},
		},
	};
};
