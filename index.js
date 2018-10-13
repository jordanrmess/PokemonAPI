var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var pokeDataUtil = require("./poke-data-util");
var _ = require("underscore");
var app = express();
var PORT = 3000;

// Restore original data into poke.json. 
// Leave this here if you want to restore the original dataset 
// and reverse the edits you made. 
// For example, if you add certain weaknesses to Squirtle, this
// will make sure Squirtle is reset back to its original state 
// after you restard your server. 
pokeDataUtil.restoreOriginalData();

// Load contents of poke.json into global variable. 
var _DATA = pokeDataUtil.loadData().pokemon;

/// Setup body-parser. No need to touch this.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function(req, res) {
    
    var contents = ""; 

    _.each(_DATA, function(i) {
        contents += `<tr><td>`+i.id+`</td><td><a href="/pokemon/`+i.id+`">`+i.name+`</a></td></tr>\n`;
    })
    var html = `<html>\n<body>\n<table>`+contents+`</table>\n</body>\n</html>`;
    res.send(html);
});

app.get("/pokemon/:pokemon_id", function(req, res) {
    var content = ""; 
    var _id = parseInt(req.params.pokemon_id);
    var result = _.findWhere(_DATA,{id: _id});
    
    var keys = _.keys(result); 
    _.each(keys,function(i){
        content += `<tr><td>`+i+`</td><td>`+JSON.stringify(result[i])+`</td></tr>\n`;
    });
    if (!result) content="Pokemon not found";

    var html = `<html>\n<body>\n<table>`+content+`</table>\n</body>\n</html>`;
    res.send(html);
});

app.get("/pokemon/image/:pokemon_id", function(req, res) {
    var _id = parseInt(req.params.pokemon_id);
    var result = _.findWhere(_DATA,{id: _id});
    var html = `<html>\n<body>\n<img src="`+result.img+`" /></table>\n</body>\n</html>`;
    res.send(html); 
});

app.get("/api/id/:pokemon_id", function(req, res) {
    // This endpoint has been completed for you.  
    var _id = parseInt(req.params.pokemon_id);
    var result = _.findWhere(_DATA, { id: _id })
    if (!result) return res.json({});
    res.json(result);
});

app.get("/api/evochain/:pokemon_name", function(req, res) {
    var _name = req.params.pokemon_name;
    var result = _.findWhere(_DATA, { name: _name });
    var final = []; 
    if(!result){return res.json([]);}


    var next =[]; 
    if (result.hasOwnProperty('next_evolution')){
        _.each(result.next_evolution,function(i){
            final.push(i.name); 
        }); 
    }
    var prev = []; 
    if(result.hasOwnProperty('prev_evolution')){
        _.each(result.prev_evolution,function(i){
           final.push(i.name); 
        }); 
    }
   
   
        //final = next.concat(prev); 
    final.push(_name); 
    
    console.log(final);
    final.sort();
    res.json(final); 
    

});


app.get("/api/type/:type", function(req, res) {
    var p = []; 
    var _type = req.params.type; 
    var result = _.each(_DATA,function(i){
        if(_.contains(i.type,_type)){
            p.push(i.name); 
        }
    })
    res.send(p);

});

app.get("/api/type/:type/heaviest", function(req, res) {
    var p=[]; 
    var _type = req.params.type; 
    var result = _.each(_DATA,function(i){
        if(_.contains(i.type,_type)){
            p.push(i); 
        }
    });
    console.log(p);
    if(p.length==0){res.json([]);
    }else{
        var max = p[0];
        _.each(p,function(i){
            if(parseInt(i.weight) > parseInt(max.weight)){
                max = i; 
            }
        });
    
        res.json({"name":max.name,"weight":parseInt(max.weight)});
    }
   


});

app.post("/api/weakness/:pokemon_name/add/:weakness_name", function(req, res) {
    //Find object
    //If null return empty object 
    var _name = req.params.pokemon_name; 
    var _w = req.params.weakness_name; 
    var p = _.findWhere(_DATA,{name: _name}); 
    if(!p){res.json([]);}
    if(!p.weaknesses.includes(_w)){
        p.weaknesses.push(_w); 
        pokeDataUtil.saveData(_DATA); 
    }
    res.json({name: _name,weaknesses:p.weaknesses});
    //push new weakness if not there
    //make new object
    // HINT: 
    // Use `pokeDataUtil.saveData(_DATA);`
});

app.delete("/api/weakness/:pokemon_name/remove/:weakness_name", function(req, res) {
    var _name = req.params.pokemon_name; 
    var _w = req.params.weakness_name; 
    var p = _.findWhere(_DATA,{name: _name}); 
    if(!p){res.json([]);}
    if(p.weaknesses.includes(_w)){
        var index = p.weaknesses.indexOf(_w);
        p.weaknesses.splice(index, 1);
        pokeDataUtil.saveData(_DATA); 
    }
    res.json({name: _name,weaknesses:p.weaknesses});
});


// Start listening on port PORT
app.listen(PORT, function() {
    console.log('Server listening on port:', PORT);
});

// DO NOT REMOVE (for testing purposes)
exports.PORT = PORT
