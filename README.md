# Caoutchouc

*Caoutchouc is a library that allows you to parse a specific JSON architecture called an interaction tree.  
This interaction tree is made of keys and values. Each key is either a regex, a litteral string or a specific instruction that has a specific effect.  
The library allows you to search for a string that would match a regex or a literal string of the tree.
When your search matches, you get the associated data from the tree.
The results of the searches are based on the current level of search in the tree.*

This library is under active development and is only at its begining.

DOCUMENTATION IN PROGRESS

#Introduction#

This tuto/documentation/starting guide is made of 4 parts.  

1. The first part is all about general information and use of the library.  
2. In the second part we will go over all the existing JSON key/value pairs that are understood by Caoutchouc.  
3. In the third part we will discover the availble public method that developpers can use.  
4. In the last part you will see different examples of the library functionnalities.  

It is recommended to read this documentation from here to the bottom.  
Even if some sections of the documentation may not be clear to you yet, it will help you understand better the example section.  
If something in the example section is not clear go back to the documentation part.  


#Part 1: General Information#

*The goal of this library is to go through a special JSON structure like a xml parser would.*

Before you start reading all of the availble key/value pairs, you must understand the **notion of cursor**.
This library is level based. It means that when something matches it moves from one level to another.
To remember on what level you are and to access the new possibilities of the newly reached level, there are what we call cursors.

A cursor works the same way as cursors that we find in database libraries.
It points on a certain level of the tree and depending on what happens on the current level it goes up or down.
You can create multiple cursors at different locations of your tree.

###Example of levels:###
<img src="https://cloud.githubusercontent.com/assets/12821004/17913970/8e3a40c0-699e-11e6-8314-d7b7b50e0ccf.png">
This is a simple json structure. If you don't know about JSON you might want to find some tutorial about it on the internet.

On level 1 (green) you have got two keys ("something" and "something at the same level").  
Those two keys have values. And thoses values are JSON object themselves.
The JSON object that is the value of the key "something" has a key called "something else".  
This key is in level 2 (blue).  
The key "something else" has a value that is also a JSON object. This JSON object is level 3 (red).  

*If you understand that keys point to other JSON objects which themselves point to other JSON objects, then you understand the main principle of this library.*


#Part 2: Interaction tree - Availble key/value pairs for configuration#

*There are* **7** *types of JSON value/keys:*

*The first 3 have values* **that are themselves JSON objects**.
*This kind of keys always points to another level.*

-----------------------------------------------

###1) 'Section' key###

"S|sectionName": {}
```
"S" is short for "section"  
"|" is just a delimiter char  
"sectionName" is the name of the section. You can choose whatever you want as section name but it has to be unique in your tree.  
```
-> Sections are what functions are to programmation. They act like **containers**. They allow you to structure your interaction tree.

**Important:** To be valid, the hole interaction tree must be in a section itsef.

```
{
	"S|main_section": { //1
	
	}//2
}
```

It must be called ```"main_section"```. The hole tree must be within the "{}" marked as //1 and //2.

You must know that Caoutchouc's parser does not enter a section on its own.

<img src="https://cloud.githubusercontent.com/assets/12821004/17913981/a1e63a5c-699e-11e6-8ca7-20a785724a3a.png" >
Text version:
```json
{
	"S|main_section": {
		
		"R|(1) string level 1": {
			"_response": "answer_one"
		},
		
		"S|section 2": {
			"R|(2) string level 1": {
				"_response": "answer_two"
			}
		}
	}
}
```

For instance, in this tree the parser will search through the green part
but **will not enter** the red section which is proctected by a section.

To go through "section 2" you can either **create a new cursor** with the createCursor("cursorName", "sectionName") method and give it the section with which it needs to start.
Or you can **move the current cursor** with the moveCursor("cursorName", "sectionName") method to the desired section.

-----------------------------------------------

###2) 'Regex match' key###

"R|string": {}

"R": This means REGEX parsing for the string  
"|": This is only a delimiter  
"string": This string will be parsed with a regex engine. If the value matches the value given to the library, the cursor will move to its value (value of the **associated JSON key**)  

-> For example when you have this kind of level in a tree:

```json
{
	"R|(hello).*(sunshine|sun shine)" : {1},
	"R|(hello).*(world)" : {2},
	"R|(hello).*(you)" : {3}
}
```

When you use the method -> searchInSection(cursorName, "hello sunshine") this way, Caoutchouc searches for the first match (with the regex engine) 
So in this case the cursor will move the lower object marked as "1".

In this case: searchInSection(cursorName, "hello you"), the cursor will move to the object marked as "3". The cursor moves to the object that is the value of the matching key.


-----------------------------------------------

###3) 'Litteral string match' key###

"L|string": {}

This is the same exact system as for "R|string" but this time the parsing won't be done by a regex engine but the string will be matched **litteraly**.

L": This means Litteral parsing for the string  
"|": This is only a delimiter  
"string": This string will be parsed in a litteral manner. Like ```(variable == "string")```.   

```json
{
	"L|hello sunshine" : {1},
	"L|hello world" : {2},
	"L|hello you" : {3}
}
```

```searchInSection(cursorName, "hello world")``` will match litteraly this key "L|hello world". The cursor will move to the object marked as 2


-----------------------------------------------

*The last 4 types of keys have strings as values and therefore **do not point to JSON objects**.
Their purpose is to give information on the level on where they are located.*

-----------------------------------------------

###4) 'Label' key###

"_label": "labelName"  
This key acts like the programming goto/label paradigm.  
You must replace the value ("labelname") to a unique id of your choice.  

when you have this tree:

<img src="https://cloud.githubusercontent.com/assets/12821004/17913988/a8be914e-699e-11e6-9889-ea50a698a18a.png" >
Text version:
```json
{
	"L|(1)level 1": {
			"L|(1)level 2": {
					"L|(1)level 3": {}
			}
	},
	"L|(2)level 1": {
			"L|(1)level 2": {}
	},
	"_label": "labelName"
}
```

The root level has 3 keys where two of them points to two other levels and the third key has a label called "labelName".  
Wherever the cursor is, it can be moved to this label by name.

By using this method you will move the cursor to the level that has the label.
-> moveCursor(cursorName, "labelName")

This method will move the cursor to the label that is called "labelName".  
By doing this you move your cursor back to the root level and everything can start again.

-----------------------------------------------

###5) 'Jump' key###

"_jump": "sectionOrLabelName"

This key is the same as the moveCursor() method from the library.

when you have this tree:

<img src="https://cloud.githubusercontent.com/assets/12821004/17913983/a8bbf060-699e-11e6-9304-57ff9c5c604c.png" >
Text version:
```json
{
	"L|(1)level 1": {
			"L|(1)level 2": {
					"L|(1)level 3": {
							"_jump": "labelName"
					}
			}
	},
	"L|(2)level 1": {
			"L|(1)level 2": {}
	},
	"_label": "labelName"
}
```

when the key "(1)level 3" matches, **the cursor moves to its associated object**. Then it sees the jump instruction and the cursor is **moved to the indicated level**.  
You can jump to any label or to any section by name. You don't have to care about label or section positions.

-----------------------------------------------

###6) 'Response' key###

"_response": "data"

This key is **mandatory** to have the library work.  
It must be present in **each level**, except root level.

If we take this tree:

```json
{
	"L|(1)level 1": {
			"L|(1)level 2": {
					"L|(1)level 3": {
							"_jump": "labelName"
					}
			}
	},
	"L|(2)level 1": {
			"L|(1)level 2": {}
	},
	"_label": "labelName"
}
```
This is not a valid tree. The right version is:

<img src="https://cloud.githubusercontent.com/assets/12821004/17913984/a8bbc8ec-699e-11e6-86ea-2906255bf3b8.png" >
Text version:
```json
{
	"L|(1)level 1": {
			"_response": "data 1",
			"L|(1)level 2": {
					"_response": "data 2",
					"L|(1)level 3": {
							"_response": "data 3",
							"_jump": "labelName"
					}
			}
	},
	"L|(2)level 1": {
			"_response": "data 4",
			"L|(1)level 2": {
					"_response": "data 5"
			}
	},
	"_label": "labelName"
}
```

We have added a ```"_response": "data"``` to each existing level. You can put any kind of data.  
For instance you can have a function name and some extra data separated by a pipe.  
-> "_response": "functionName|extraData"

To access the data you must use the method:  
-> ```searchInSection(cursorName, "(1)level 1")```  
Caoutchouc will **search for a matching string in the tree**. It will stop at the **first key** and will enter its associated object and **return the value** of the "_response" key.  
In this case the above mentionned method will return "data 1".

Then if we executed this method again but with this value -> ```searchInSection(cursorName, "(1)level 2")```, it would return "data 2".

-----------------------------------------------

###7) 'Comment' key###

"_comment": "this is a comment"

This kind of key is ignored by Caoutchouc's parser.

For example it can be used to demistify regex paring.

```json
{
	"_comment": "this is a complicated email addrese validation regex",
	"R|/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i"
}
```

As you can see in this level, the second key starts by "R|". So this key will be matched against the search value of searchInSection() and analysed by a regex engine to see if the value matches.  
But the regex is complicated. That's why we have a comment above that explains what the regex is doing


-----------------------------------------------


#Part 3: Public methods#

Now that you know the use of all the key/value pairs of Caoutchouc, we will go over the few public methods that are availble. 

<h2>Public methods</h2>

There are only 5 public methods availble. Most of the configuration is done with the interaction tree.

Constructor:  
new Caoutchouc(path, boolean);  
-> **@path:** (String) This is the path of your interaction tree. ex: "./interactionsTree/tree.json"  
-> **@boolean** (Boolean) Will be probably removed shortly. You can pass whatever you want for now.  
-> *Allows to instanciate the library*  

**createCursor(cursorName, sectionName)**  
-> **@cursorName:** Name to give to your cursor. You can use what you want as string. It will be used to refer to this specific cursor with other methods.  
-> **@sectionName:** A cursor has to start with a section or label. This is its entry point.  
-> *Allows the creation of a cursor to move around the interaction tree.*  

**deleteCursor(cursorName)**  
-> **@cursorName:** Name of a cursor that was created with the createCursor() method.  
-> *Deletes the given cursor by name.*  

**moveCursor(cursorName, sectionName)**  
-> **@cursorName:** Name of the cursor to interact with.  
-> **@sectionName:** Name of the section which the cursor will move to. Also works with labels. 
-> *Allows to move a cursor to another section or label in the interaction tree.*  

**searchInSection(cursorName, searchValue)**  
-> **@cursorName:** Name of the cursor to interact with. 
-> **@searchValue:** This value (string) will be searched through the current level on which the cursors stays.  
-> Return value: String from the associated data from the tree.  
-> *When a string matches (regex or litteral) it enters a new level. In this level there is a key named "_response". This key contains the associated data of the match. So it is the content of the value of the "_response" key that is returned from the function.*  

**showCurrentLevel(cursorName)**  
-> **@cursorName:** Name of the cursor to interact with.  
-> Returns value: String.  
-> *This is a debugging method. It shows the current level of the cursor*  



#Part 4: Time for examples !#

This is a complete and working interaction tree.  
It is recommended to open the image in another window in order to have it and the examples shown at the same time.  
There are two sections (not counting root section: "main_section").  

The section "animal_section" alows you to have a conversation about dogs and cats.  
The section "smart_section" allows you to order a pizza.  
All "_response" values are formated the same way. They all have the string that correspond to the AI answer.  

<img src="https://cloud.githubusercontent.com/assets/12821004/17913990/a8c8c11e-699e-11e6-9227-e82701fdc3a2.png" >

Text version:  
```json
{
    "S|main_section": {
        "S|animal_section": {
            "L|Do you like dogs ?": {
		"_response": "Yes I do. What about you ?",
		"L|yes": {
                    "_response": "So now there are the two of us.",
                    "_jump": "animal_section"
		},
		"L|no": {
                    "_response": "Too bad :-(",
                    "_jump": "animal_section"
		}
            },
            "L|Do you like cats ?": {
		"_response": "It is my favourite pet. And what about you ?.",
		"L|yes": {
                    "_response": "Do you have one ?",
                    "L|yes": {
			"_response": "I don't ! Next time we meet I want to see it.",
			"_jump": "animal_section"
                    },
                    "L|no": {
			"_response": "Me neither ! Too bad... I so want one !",
			"_jump": "animal_section"
                    }
		},
		"L|no": {
                    "_response": "Too bad :-(",
                    "_jump": "animal_section"
                }
            }
	},
		
	"S|smart_section": {
            "_comment": "triggerd by 'I would like a pizza please' for example",
            "R|(I).*(pizza)": {
		"_response": "Sure ! What size ?",
		"_label": "pizzaSizeQuestion",
		"R|(.*)": {
                    "_response": "Ok... Do you want me to order it now ?",
                    "R|(yes)|(YES)": {
                        "_response": "Ordering it now... Do you want another ?",
                        "_label": "orderingNow",
                        "R|(yes)|(Yes)|(YES)": {
                            "_response": "Ok, what size ?",
                            "_jump": "pizzaSizeQuestion"
			},
			"R|(no)|(No)|(NO)": {
                            "_response": "Enjoy your meal",
                            "_jump": "smart_section"
			}
                    },
                    "R|(no)|(NO)": {
			"_response": "No probleme just let me know when you are ready",
			"_jump": "smart_section"
                    }
		}
            },
            "_comment": "triggerd by something like 'order my pizza' or 'order it'",
            "R|(Order).*(it|pizza|pizzas)": {
                "_response": "Ordering it now... Do you want another ?",
		"_jump": "orderingNow"
            }
	}
    }
}
```

To use this interaction tree we will make a simple script.

First we must define a function called print() that will display a string.

```javascript
//outputs a string to the screen
function print(sentence)
{
	console.log(sentence)
}

//Then we will create a fake function that will get the user input.
function get_input()
{
	return input;
}

//getting the library...
var Caoutchouc = require("Caoutchouc");

//instanciate an object of Caoutchouc.
var caoutchoucObj = Caoutchouc("./tree.json", true);

//then we must create a cursor that will go through the tree. We will call it "foo".

//creates a cursor name "foo" that starts into the section "animal_section"
caoutchoucObj.createCursor("foo", "animal_section");

//now we can ask the user to type something with the function get_input(). The result will be passed as parameter to the searchInSection() method.

var input = get_input(); // Do you like dogs ?
var treeOutput = caoutchoucObj.searchInSection("foo", input); //returns -> "print|Yes I do. And you ?"

//printing response from the AI
print(treeOutput); 
```


This can be done for each level of the tree. Fortunately simple programing allows you to have less code.
All the interpretation code can be resumed by this while loop.

```javascript
//turns for ever
while (true)
{
	//we get the input from the user that we pass to the searchInSection method which gives us the right response to give to the print function.
	print(caoutchoucObj.searchInSection("foo", get_input())); 
}
```

The hole script:
```javascript
var Caoutchouc = require("Caoutchouc");

function print(sentence)
{
	console.log(sentence)
}

function get_input() //fake function
{
	return input;
}

var caoutchoucObj = Caoutchouc("./tree.json" ,true);

caoutchoucObj.createCursor("foo", "animal_section");

while (true)
{
	print(caoutchoucObj.searchInSection("foo", get_input())); 
}
```

Those are the possible conversations:

##Conversation 1##
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	Do you like dogs ?  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**Yes I do. And you ?**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	yes  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**So now there is the two of us.**  
//goes back to the start  

##Conversation 2##
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	Do you like dogs ?  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**Yes I do. And you ?**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	no  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**Too bad :-(**  
//goes back to the start  

##Conversation 3##
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	Do you like cats ?  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**It is my favourite pet. And what about you ?.**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	yes  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**Do you have one ?**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	yes  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**I don't ! Next time I go to your house I want to see it.**  
//goes back to the start  


##Conversation 4##
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	Do you like cats ?  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**It is my favourite pet. And what about you ?.**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	yes  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**Do you have one ?**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	no  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**Me neither ! Too sad.... I so want one !**  
//goes back to the start  

Details:
The user inputs this string : "*Do you like cats ?*"  
-> Because our cursor is on the section "animal_section", the parsing is **contained** to the top part of the green section.  
Remember that Caoutchouc's parser won't leave a section by itself.  

The parser tries to match the first key of the tree ("*L|Do you like dogs ?*") litteraly to the user input.  

Because it does not match, Caoutchouc tries the next key. The next key is "*Do you like cats ?*" which matches the user's input.  
Because the key matches, **the cursor goes down to the corresponding level** (the blue level).  

In this blue level **the parser returns to the program the value of the key "_response"** which is "*It's my favourite pet. And what about you*".  
This string will be print to the screen as the response of the AI.  

The next time that the user inputs something, the cursor, which still is at the blue level, will have to try and match two keys ("*L|yes*" or "*L|no*").  
In this case it is a "*yes*" that was inputed. So the cursor moves to the level that corresponds to the "*yes*" (purple level) and returns the value of the key "_response" which is "*Do you have one*".  

Next the user inputs "*no*". On our current level there are again two keys which are "*L|yes*" and "*L|no*".  
It will be the "*L|no*" key that will match.  
 So the cursor will move down to the new level (light blue) and return the value of the "_response" key (which is "*Me neither ! Too sad... I so want one !*").  

There are no more levels. But on our current level we have got a jump key "_jump" that points to the section "animal_section".  
As soon as the parser bumps into this jump instruction, the cursor is moved to the green level.  
Remember that when you move to a section you will always be at the begining of it. 
If you want to move to a specific location of the tree you can use a label and jump to it by name.  

Now that we are back to the green section the conversation can start again.  

##Conversation 5##
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	Do you like cats ?  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**It is my favourite pet. And what about you ?.**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	no  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**Too bad :-)**  
//goes back to the start  


##Conversation 6##

Now, same thing for the conversations of the other section.  
Don't forget that you would need to create a new cursor to access the other section:  
```createCursor("foobar", "smart_section");```

or you could move the current cursor to this section:  
```moveCursor("foobar", "smart_section");```

or from the jump key. Like this: ```"_jump": "smart_section"```.  
But the cursor will have to go through the level containing the key for the effect to take place.  

*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	I would like to order some pizzas...  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	**Sure ! What size ?**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	Medium  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	**Ok... Do you want me to order it now ?**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	YES  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	**Ordering it now... Do you want an other ?**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; yes  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	**Ok, what size ? 	//jumps back to an upper level in the tree**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; small  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**Ok... Do you want me to order it now ?**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; No  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**No probleme just ask when you are ready**  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Order the pizzas now !  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**Ordering it now... Do you want an other ?** //jumped to an other level of the tree  
*User*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; No  
*AI*:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 	**Have a good meal**  
//jumps to "smart_section"  

There are other possible scenarios for this section.



You can have a more complicated "_response".  
For instance:  

```
"_response": "name_of_a_function|data"
```

this could be exploit like this.

```javascript
var treeOutput = Caoutchouc.searchInSection("foo", "something")

var functionName = treeOutput.splice("|")[0];
var data = treeOutput.splice("|")[1];

functionName(data); //javaScript allows you to call a function/method by name and pass it some data.
```
By saving a function/method along with some data you can create some really complex interactions.




<a rel="license" href="http://creativecommons.org/licenses/by-nd/4.0/"><img alt="Licence Creative Commons" style="border-width:0" src="https://i.creativecommons.org/l/by-nd/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/Text" property="dct:title" rel="dct:type">Caoutchouc</span> de <span xmlns:cc="http://creativecommons.org/ns#" property="cc:attributionName">Caoutchouc</span> est mis à disposition selon les termes de la <a rel="license" href="http://creativecommons.org/licenses/by-nd/4.0/">licence Creative Commons Attribution - Pas de Modification 4.0 International</a>.
<b>This is not the final liscense. This library will be open to modifications in a near future.</b>
