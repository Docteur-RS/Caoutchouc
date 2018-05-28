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
In this example we either match the litteral strings "hello" or "goodbye".

var data = {
	"S|main_section": {
		"L|hello": {

		},
		"L|goodbye": {

		}
	}
}

Ok... But how do we know which litteral was the chosen one ?
We must use the "_response" key to get a return value. In this case we will return a message that can either be "Hi" or "bye" depending on what litteral was matched.

var data = {
	"S|main_section": {
		"L|Hello": {
			"_response":"Hi !"
		},
		"L|Goodbye": {
			"_response":"Bye !"
		}
	}
}

Now that you know the basics of creating the interaction tree we have to parse it using Caoutchouc.

//Instanciate the lib
var c = new Caoutchouc("json", data);

//We create a cursor that goes through the tree. You can create as many cursors as you want.
//the first parameter is the name of the cursor and the second parameter is a section to start from.
c.createCursor("cursor1", "main_section");

//Now we can search a string in the tree using the searchInSection method. It will return you the response from the tree (_response's value) that correspond to the path that matches the searched string.
//The first parameter is the cursor name. The second parameter is a string to search in the current step of the tree.
//Note that by doing this you change the cursor position deeper in the tree.
var response = doo.searchInSection("cursor1", "Hello");
console.log(response);//prints "Hi !"



//Lets try again with a two new instructions (_jump and _label) and a deeper tree :
var data = {
	"S|main_section": {
		"L|Hello": {
			"_response":"Hi !",
			
			"L|How are you ?": {
				"_response": "Good thanks and you ?"
			},
			"L|How's your day ?": {
				"_response": "Good thanks and you ?"
			},
			"L|Have a good day": {
				"_response": "Thanks you too !",
				"_jump": "a_root_label"
			}
		},
		"L|Goodbye": {
			"_response":"Bye !"
			"_jump": "main_section"
		},
		"_label": "a_root_label"
	}
}


//This tree is a little bit more complexe. The first step hasn't change. You weither match "Hello" or "Goodbye".
//If we choose goodby then there we get "Bye !" and then execute the "_jump" instruction. This works exactly like the goto/label that we find in some programming language.
//The instruction "_jump": "main_section" will make the cursor go back to the section "main_section" which in our case is the top of the tree.

//Now, if we had searched for "Hello" the we would have got "Hi !" and a new set of choices for an other search.
//There are 3 choices "How are you ?", "How's your day ?" or "Have a good day". For the first 2 we get the response "Good thanks and you ?" because both of them have the same answer.
//For the third one, matching "Have a good day" will return "Thanks you too !" and then execute the jump instruction which will move the cursor to a label place at the root of the tree.
//You could vahe jump to "main_section" like we did previously, the result would be the same.
//You can put label everywhere you need to jump back or jump forth.

//Lets parse the tree with the Caoutchouc.

var c = new Caoutchouc("json", data);
c.createCursor("cursor1", "main_section");


doo.searchInSection("cursor1", "Goodbye"); //"Bye !" -> then jumps back to main_section (root level of the tree)
doo.searchInSection("cursor1", "Goodbye"); //"Bye !" -> then jumps back to main_section (root level of the tree)

doo.searchInSection("cursor1", "Hello"); //"Hi !"
doo.searchInSection("cursor1", "Have a good day"); //"Thanks you too !" -> then jumps back to a label called "a_root_label"

doo.searchInSection("cursor1", "Hello"); //"Hi !"

doo.searchInSection("cursor1", "How's your day ?"); //"Good thanks and you ?" -> then stuck here because there is no jump instructions and no depper levels to explore.



//Now lets optimise the tree. Instead of matching litteral string will match with regexes:
var data = {
	"S|main_section": {
		"L|Hello": {
			"_response":"Hi !",
			
			"_comment": "Matched either howare you or how's your day with different punctuation"
			"R|((H|h)ow are you ?(\?|\!)?)|((H|h)ow\'s your day ?(\?|\!)?)": {
				"_response": "Good thanks and you ?"
			},
			"L|Have a good day": {
				"_response": "Thanks you too !",
				"_jump": "a_root_label"
			}
		},
		"L|Goodbye": {
			"_response":"Bye !"
			"_jump": "main_section"
		},
		"_label": "a_root_label"
	}
}

//As you can see instead of having twice the same instruction:
"L|How are you ?": {
	"_response": "Good thanks and you ?"
},
"L|How's your day ?": {
	"_response": "Good thanks and you ?"
},
			

//Now we only have one, regrouped in a single regex 
"R|((H|h)ow are you ?(\?|\.)?)|((H|h)ow\'s your day ?(\?|\.)?)": {
	"_response": "Good thanks and you ?"
},

//This allows you to match "how" or "How" but bot "HOW" or finishing with "?" or "." but not "!".
//The possibilities are infinites with regexe's syntaxe.



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
