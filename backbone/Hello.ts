class Hello extends Backbone.View {

	constructor(public name:string){
		super()
	}

	render():Hello{
		this.$el.append(`<h1>Hello ${this.name}</h1>`)
		return this
	}

}