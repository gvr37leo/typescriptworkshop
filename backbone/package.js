class Hello extends Backbone.View {
    constructor(name) {
        super();
        this.name = name;
    }
    render() {
        this.$el.append(`<h1>Hello ${this.name}</h1>`);
        return this;
    }
}
/// <reference path="backbone.d.ts" />
/// <reference path="Hello.ts" />
var view = new Hello('world!');
view.render();
var app = $('#app');
app.append(view.$el);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkhlbGxvLnRzIiwibWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFZLFNBQVEsUUFBUSxDQUFDLElBQUk7SUFFaEMsWUFBbUIsSUFBVztRQUM3QixLQUFLLEVBQUUsQ0FBQTtRQURXLFNBQUksR0FBSixJQUFJLENBQU87SUFFOUIsQ0FBQztJQUVELE1BQU07UUFDTCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFBO1FBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUE7SUFDWixDQUFDO0NBRUQ7QUNYRCxzQ0FBc0M7QUFDdEMsaUNBQWlDO0FBR2pDLElBQUksSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUViLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNuQixHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSJ9