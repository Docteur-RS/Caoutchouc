/* 
 * Cette oeuvre, création, site ou texte est sous licence Creative Commons  Attribution - Pas de Modification 4.0 International. Pour accéder à une copie de cette licence, merci de vous rendre à l'adresse suivante http://creativecommons.org/licenses/by-nd/4.0/ ou envoyez un courrier à Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 */

var fs = require('fs');

var Caoutchouc = function (importType, importMetadata) {

    this.tree = null;
    this.sectionsStartPoint = [];
    this.aCursors = {};

    if (typeof (importMetadata) === "array")
    {
        console.log("[Info]: Array form not suported yet");
		return;
    }
	else if (importType === "json" && typeof(importMetadata) === "string")
	{
		try {
			this.tree = JSON.parse(importMetadata);
		}
		catch(e)
		{
			console.log("JSON parse error while parsing given data at init : ", e.message);
		}
	}
	else if (importType === "json" && typeof(importMetadata) === "object")
	{
		console.log(this.tree);
		this.tree = importMetadata;
		console.log(this.tree);
	}
	else
	{
		console.log("[Warning]: Importing failed because given import type was wrong or the data type was not something expected. The possible import types are 'path' or 'json'.");
		return;
	}

    this.goThroughObj(this.tree);
};

/*
 * Ajoute le contenu d'un fichier à une section de l'arbre. Doit être un fichier d'interaction valide.
 * @param {string} sPath
 * @param {string} sSectionName
 * @param {boolean} bReParseTree
 * @returns {undefined}
 */
Caoutchouc.prototype.addTreeFromFile = function (sPath, sSectionName, bReParseTree, endCallback)
{
    try {
        fs.readFile(sPath, 'utf8', function (err, content) {
            try {
                if (err !== null)
                    throw(err);
                var extensionTree = JSON.parse(content);
                this.addTree(extensionTree, sSectionName, bReParseTree);
            } catch (e) {
                console.log("%c[Error]:", "color: red", " Caoutouc.addTreeFromFile = ", e);
            }
            endCallback();
        }.bind(this));

    } catch (e) {
        console.log("%c[Error]:", "color: red", " Caoutouc.addTreeFromFile = ", e);
        return;
    }
};

/*
 * Adds a json object interacton to the given section
 * @jTree : arbre à ajouté à la section @sSectionName
 * @sSectionName : section dans laquelle sera ajouté les interactions de @jTree
 * @bReparseTree : Si true alors l'arbre est parsé à nouveau. Sinon il faudra appeler la méthode reParseTree();
 */
Caoutchouc.prototype.addTree = function (jTree, sSectionName, bReParseTree)
{
    var jTargetSection = this.tree["S|" + sSectionName];
    var jNewTargetSection = Object.assign(jTree, jTargetSection);
    this.tree["S|" + sSectionName] = jNewTargetSection;
    if (bReParseTree === true)
    {
        this.sectionsStartPoint = [];
        this.goThroughObj(this.tree);
    }
};

/*
 * Triggers the parsing of the tree
 */
Caoutchouc.prototype.reParseTree = function ()
{
    this.sectionsStartPoint = [];
    this.goThroughObj(this.tree);
};

Caoutchouc.prototype.goThroughObj = function (cur)
{
    for (var obj in cur)
    {
        if (obj === "S|main_section")
            console.log("mainSection detected");
        if (typeof (cur[obj]) === "string")
        {
            if (obj === "_label")
            {
                this.sectionsStartPoint.push({"name": cur[obj], "level": cur});
            }
            continue;
        } else
        {

            if (obj.split("|")[0] === "S")
                this.sectionsStartPoint.push({"name": obj.split("|")[1], "level": cur[obj]});
        }
        this.goThroughObj(cur[obj]);
    }
};


Caoutchouc.prototype.changeToSentenceMatchingRegex = function (key)
{
    var aKey = key.split(" ");
    var sFinal = ".*(";
    var len = aKey.length;
    aKey.forEach(function (element, index, array) {
        if (index === (len - 1))
            sFinal = sFinal + element + ").*";
        else
            sFinal = sFinal + element + ")*(";
    });
};

Caoutchouc.prototype.checkMatchLiteral = function (self, key, searchValue, cursorName)
{
    if (searchValue === key)
    {
        self.aCursors[cursorName] = self.aCursors[cursorName]["L|" + key];
        return true;
    }

};

Caoutchouc.prototype.checkMatchRegex = function (self, key, searchValue, cursorName)
{
    if (searchValue.match(key) !== null)
    {
        self.aCursors[cursorName] = self.aCursors[cursorName]["R|" + key];
        return true;
    }
};

Caoutchouc.prototype.jumpToSection = function (self, key, searchValue, cursorName)
{
    console.log("searchVale = ", searchValue);
};

Caoutchouc.prototype.matchFactory = function (sRef)
{
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
        return ([true, this.checkMatchRegex]);
    }
    if (sRef.charAt(0) === 'L')
    {
        return ([true, this.checkMatchLiteral]);
    }
    return [false, false];
};

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
};

Caoutchouc.prototype.searchInTree = function (searchValue, cursorName)
{
    for (var key in this.aCursors[cursorName])
    {
        if (this.aCursors[cursorName].hasOwnProperty(key))
        {

            var tuple = this.matchFactory(key);
            if (tuple[0] === true)
            {
                if (tuple[1](this, key.substr(2), searchValue, cursorName))
                {
                    var response = this.aCursors[cursorName]["_response"];
                    //jumps the cursor to an other section //need better check for if key exist ?
                    if (typeof (this.aCursors[cursorName]["_jump"]) !== "undefined")
                    {
                        this.aCursors[cursorName] = this.findLevelInSections(this.aCursors[cursorName]["_jump"]);
                    }
                    return response;
                }
            }
        }
    }
};

//public
Caoutchouc.prototype.showCurrentLevel = function (cursorName)
{
    console.log("[Info - level]: ", this.aCursors[cursorName]);
};

//public
Caoutchouc.prototype.createCursor = function (cursorName, sectionName)
{
    this.aCursors[cursorName] = this.findLevelInSections(sectionName);
};

//public
Caoutchouc.prototype.deleteCursor = function (cursorName)
{
    delete(this.aCursors[cursorName]);
};

//public
Caoutchouc.prototype.moveCursor = function (cursorName, sectionName)
{
    this.aCursors[cursorName] = this.findLevelInSections(sectionName);
};

//public
Caoutchouc.prototype.searchInSection = function (cursorName, searchValue)
{
    return this.searchInTree(searchValue, cursorName);
};


module.exports = Caoutchouc;
