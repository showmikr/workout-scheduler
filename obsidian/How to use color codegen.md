# General Idea
- Run `npx ts-node <codegen_script_filepath>` on the terminal
	- Ex: `npx ts-node constants/color-codegen.ts`
	- We're using `ts-node` as the application instead of the usual `node <filename>` b/c our codegen script is written in typescript.
		- To run Typescript files, you gotta use `ts-node` to compile and run it all in one go
	- The output file is written in the codegen script
		- as of writing, the output file goes to `./colors.codegen.ts`