var Doo = require('./main.js');

var doo = new Doo("./interactionsTree/tree2.json", true);

//console.log(doo.searchInLevel("Do you like cats ?"));

doo.createCursor("test1", "section_pouette");
console.log(doo.searchInSection("test1", "hello"))
console.log(doo.searchInSection("test1", "how"))
//doo.moveCursor("test1", "fuckyou")
console.log(doo.searchInSection("test1", "you"));

return

doo.createCursor("test1", "section_pouette");
console.log(doo.searchInSection("test1", "hello"));
console.log(doo.searchInSection("test1", "how"));
console.log(doo.searchInSection("test1", "are"));
console.log(doo.searchInSection("test1", "you"));

console.log(doo.searchInSection("test1", "Do you like cats ?"));



return

doo.createCursor("test2", "main_section");
console.log(doo.searchInSection("test2", "Do you like dogs ?"));

console.log(doo.searchInSection("test1", "you"));

console.log(doo.searchInSection("test2", "the first one"));




//console.log(doo.searchInSection("section_pouette", "how"));

//console.log(doo.searchInSection("section_pouette", "are"));

//console.log(doo.searchInSection("section_pouette", "you"));