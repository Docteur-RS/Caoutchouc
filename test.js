var Doo = require('./main.js');

For the following tutorial we want to make a robot following this simple conversation:

##Ajouter diagramme plutotque text##

User -> Hello   ||    User -> goodbye

		|					|
		V					V
		
Bot -> Hi !			 Bot -> Bye !

We'll start with something simple.
In this example we create a section called "main_section". 
Sections are like functions. They are containers that you can call whenever you want to access there content.
To achieve this we use the "S" prefix in the form "S" + pipe delimiter + "section name"

var data = {
	"S|main_section": {

		}
	}


Now lets add two sentences to match :
To do this we use the "L" prefix wich stands for "Literral". It must be use with the following form : "L" + pipe delimiter + "sentence to match"
In this example we either match the litteral string "hello" or "goodbye".

var data = {
	"S|main_section": {
		"L|hello": {

		},
		"L|goodbye": {

		}
	}
}

Ok... But how do we know which litteral was the good one ?
We must use the "_response" key to get a return value. In this case we will return a message that can either be "Hi" or "bye" depending on what litteral was matched.

var data = {
	"S|main_section": {
		"L|hello": {
			"_response":"Hi !",
		},
		"L|goodbye": {
			"_response":"Bye !",
		}
	}
}

Now that you know the basic of creating the interaction tree we have to parse it using Caoutchouc.

//Instanciate the lib
var c = new Caoutchouc("json", data);



var doo = new Doo("json", data);

//console.log(doo.searchInLevel("Do you like cats ?"));

doo.createCursor("test1", "main_section");
console.log(doo.searchInSection("test1", "I would like to hear something"))



return;
console.log(doo.searchInSection("test1", "hello"))
console.log(doo.searchInSection("test1", "how"))
//doo.moveCursor("test1", "fuckyou")
console.log(doo.searchInSection("test1", "you"));

return;

doo.createCursor("test1", "section_pouette");
console.log(doo.searchInSection("test1", "hello"));
console.log(doo.searchInSection("test1", "how"));
console.log(doo.searchInSection("test1", "are"));
console.log(doo.searchInSection("test1", "you"));

console.log(doo.searchInSection("test1", "Do you like cats ?"));



return;

doo.createCursor("test2", "main_section");
console.log(doo.searchInSection("test2", "Do you like dogs ?"));

console.log(doo.searchInSection("test1", "you"));

console.log(doo.searchInSection("test2", "the first one"));




//console.log(doo.searchInSection("section_pouette", "how"));

//console.log(doo.searchInSection("section_pouette", "are"));

//console.log(doo.searchInSection("section_pouette", "you"));
