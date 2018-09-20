/// <reference path="node_modules/@types/jquery/index.d.ts" />


// TODO: Use DefinitelyTyped rather than ad-hoc definition here
declare module Backbone {
	export class Model {
		constructor (attr? , opts? );
		get(name: string): any;
		set(name: string, val: any): void;
		set(obj: any): void;
		save(attr? , opts? ): void;
		destroy(): void;
		bind(ev: string, f: Function, ctx?: any): void;
		toJSON(): any;
		trigger(eventName: string, ...args: any[]): any;
	}
	export class Collection {
		constructor (models? , opts? );
		bind(ev: string, f: Function, ctx?: any): void;
		collection: Model;
		length: number;
		create(attrs, opts? ): Collection;
		each(f: (elem: any) => void ): void;
		fetch(opts?: any): void;
		last(): any;
		last(n: number): any[];
		filter(f: (elem: any) => any): Collection;
		without(...values: any[]): Collection;
		trigger(eventName: string, ...args: any[]): any;
	}
	export class View {
		constructor (options? );
		$: JQueryStatic;
		el: HTMLElement;
		$el: JQuery<HTMLElement>;
		model: Model;
		remove(): void;
		delegateEvents: any;
		make(tagName: string, attrs? , opts? ): View;
		setElement(element: HTMLElement, delegate?: boolean): void;
		tagName: string;
		events: any;

		static extend: any;
	}
	export class Router {
		constructor (routes?: any );
		routes: any;
	}
	export class History {
		start(options?: any);
		navigate(fragment: string, options: any);
		pushState();
	}
	export var history: History;
}