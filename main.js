/* 
 * Cette oeuvre, création, site ou texte est sous licence Creative Commons  Attribution - Pas de Modification 4.0 International. Pour accéder à une copie de cette licence, merci de vous rendre à l'adresse suivante http://creativecommons.org/licenses/by-nd/4.0/ ou envoyez un courrier à Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 */

var fs = require('fs');

//ne pas oublier d'en faire une version async pour permetre d'utiliser caoutchouc dans des callbacks
var Caoutchouc = function (filePath, searchSentence) {

    this.tree;
    //this.currentLevel;
	this.sectionsStartPoint = [];
	this.aCursors = {};

    if (searchSentence)
        this.searchSentence = true;
    else
        this.searchSentence = false;

    if (typeof (filePath) === "array")
    {

    } else
    {
        this.tree = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        //this.currentLevel = this.tree;
    }
	
	this.goThroughObj(this.tree)
	
	console.log("sections list = ", this.sectionsStartPoint)
}

Caoutchouc.prototype.goThroughObj = function (cur)
{
	for (obj in cur)
	{
		if (obj === "S|main_section")
			console.log("olol");
		if (typeof(cur[obj]) == "string")
		{
			//console.log("obj = ", obj)
			if (obj === "_label")
			{
				//console.log("obj = ", obj)
				this.sectionsStartPoint.push({"name": cur[obj], "level": cur})
			}
			continue;
		}
		else
		{
			
			if (obj.split("|")[0] === "S")
				this.sectionsStartPoint.push({"name": obj.split("|")[1], "level": cur[obj]})
		}
		this.goThroughObj(cur[obj]);
	}
}

//| #.*( va| vas| aller| allé).*( sur| à| a).*#
Caoutchouc.prototype.changeToSentenceMatchingRegex = function (key)
{
    var aKey = key.split(" ");
    var sFinal = ".*(";
    var len = aKey.length;
    aKey.forEach(function (element, index, array) {
        if (index == (len - 1))
            sFinal = sFinal + element + ").*";
        else
            sFinal = sFinal + element + ")*(";
    });
    //console.log("finale = ", sFinal)

}

Caoutchouc.prototype.checkMatchLiteral = function(self, key, searchValue, cursorName)
{
	//console.log("check match literal")
	if (searchValue === key)
    {
        //console.log("match Literal", key, searchValue);
        self.aCursors[cursorName] = self.aCursors[cursorName]["L|" + key];
		return true
    }
	
}

Caoutchouc.prototype.checkMatchRegex = function(self, key, searchValue, cursorName)
{
	if (searchValue.match(key) !== null)
    {
        //console.log("match RegExp", key, searchValue);
        self.aCursors[cursorName] = self.aCursors[cursorName]["R|" + key];
		return true
    }
}

Caoutchouc.prototype.jumpToSection = function(self, key, searchValue, cursorName)
{
	console.log("je sais plus cest quoi = ", searchValue)
}

Caoutchouc.prototype.matchFactory = function(sRef)
{
	console.log("sref =", sRef)
	if (sRef === "_comment")
	{
		return [false, false];
	}
	if (sRef === "_jump")
	{
		return ([true, this.jumpToSection]);
	}
	if (sRef.charAt(0) === "S")
	{
		return [false, false];
	}
	if (sRef.charAt(0) === 'R')
	{
		return ([true, this.checkMatchRegex])
	}	
	if (sRef.charAt(0) === 'L')
	{
		return ([true, this.checkMatchLiteral])
	}
	return [false, false];
	//return (function(){console.log("HOHO");})
}

Caoutchouc.prototype.findLevelInSections = function (sectionName)
{
	var i = 0;
	while (i < this.sectionsStartPoint.length)
	{
		if (this.sectionsStartPoint[i].name === sectionName)
		{
			return this.sectionsStartPoint[i].level;
		}
		i = i + 1;
	}
	return null;
}

Caoutchouc.prototype.searchInTree = function (searchValue, cursorName)
{
    for (var key in this.aCursors[cursorName]) {
        if (this.aCursors[cursorName].hasOwnProperty(key)) {
			
			var tuple = this.matchFactory(key);
			if (tuple[0] == true)
			{
				if (tuple[1](this, key.substr(2), searchValue, cursorName))
				{
					var response = this.aCursors[cursorName]["_response"];
					//jumps the cursor to an other section //need better check for is key exist ?
					if (typeof(this.aCursors[cursorName]["_jump"]) !== "undefined")
					{
							console.log("alors... = ", this.aCursors[cursorName]["_jump"])
							this.aCursors[cursorName] =  this.findLevelInSections(this.aCursors[cursorName]["_jump"]);
					}
					return response;
				}
			}
		}
    }
}

//public
Caoutchouc.prototype.showCurrentLevel = function (cursorName)
{
	console.log("[Info - level]: ", this.aCursors[cursorName]);
}

//public
Caoutchouc.prototype.createCursor = function (cursorName, sectionName)
{
	this.aCursors[cursorName] =  this.findLevelInSections(sectionName);
}

//public
Caoutchouc.prototype.deleteCursor = function (cursorName)
{
	delete(this.aCursors[cursorName]);
}

//public
Caoutchouc.prototype.moveCursor = function (cursorName, sectionName)
{
	this.aCursors[cursorName] =  this.findLevelInSections(sectionName);
}

//public
Caoutchouc.prototype.searchInSection = function (cursorName, searchValue)
{
	return this.searchInTree(searchValue, cursorName);
}


module.exports = Caoutchouc;