/// <reference path="backbone.d.ts" />
/// <reference path="Hello.ts" />
declare var $;

var view = new Hello('world!')
view.render()

var app = $('#app')
app.append(view.$el)