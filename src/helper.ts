
type SizedStringHelper<S extends string, Size extends number, Character extends string = string, Counter extends unknown[] = []> = 
	`${Size}` extends `-${number}` ? never : 
	S extends "" ? "" : 
	Counter["length"] extends Size ? never : 
	S extends `${infer C extends Character}${infer Rest extends string}` ? 
		`${C}${SizedStringHelper<Rest,Size,Character,[1,...Counter]>}` : 
	never
export type SizedString<S extends string, Size extends number, Character extends string = string> = 
	SizedStringHelper<S,Size,Character>

export function splitByFilter<T, FullfillsFilter extends T>(arr : T[], filter : (t : T) => t is FullfillsFilter) : [FullfillsFilter[], Exclude<T,FullfillsFilter>[]]{
	return arr.reduce<[FullfillsFilter[], Exclude<T,FullfillsFilter>[]]>(([l1,l2],cur) => filter(cur) ? [l1.concat(cur),l2] : [l1,l2.concat(cur as Exclude<T,FullfillsFilter>)],[[],[]])
}
