
type SizedStringHelper<S extends string, Size extends number, Character extends string = string, Counter extends unknown[] = []> = 
	`${Size}` extends `-${number}` ? never : 
	S extends "" ? "" : 
	Counter["length"] extends Size ? never : 
	S extends `${infer C extends Character}${infer Rest extends string}` ? 
		`${C}${SizedStringHelper<Rest,Size,Character,[1,...Counter]>}` : 
	never
export type SizedString<S extends string, Size extends number, Character extends string = string> = 
	SizedStringHelper<S,Size,Character>

