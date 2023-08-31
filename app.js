//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connection Successful!");
});


const itemsSchema={
  name:String
}

const Item=mongoose.model("Item", itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist"
});

const item2= new Item({
  name:"tap + button to add the item"
});

const item3= new Item({
  name:"<-- hit this to delete the item"
});

const item4= new Item({
  name:"Type in url to create your different type list"
});

const defaultList=[item1,item2,item3,item4];


const listSchema={
  name:String,
  item:[itemsSchema]
}

const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({}).then(function(FoundItems){

    if(FoundItems.length === 0){

      Item.insertMany(defaultList)
      .then(function () {
        console.log("Successfully saved defult items to DB");
      })
      .catch(function (err) {
        console.log(err);
      }); 
     res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: FoundItems});
    } 
  })
  .catch(function (err) {
    console.log(err);
  });  

});


app.get("/:custumListName",function(req,res){
  const custumListName=_.capitalize(req.params.custumListName);

    List.findOne({name: custumListName}).then(function(Foundlist){
        if(!Foundlist){
          const list=new List({
            name:custumListName,
            item:defaultList
          }); 
          list.save();
          res.redirect("/"+custumListName);
        }
        else{
          res.render("list", {listTitle:Foundlist.name,newListItems:Foundlist.item});
        }
    })
    .catch(function (err) {
      console.log(err);
    });
  
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item= new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then(function(Foundlist){
      Foundlist.item.push(item);
      Foundlist.save();
      res.redirect("/"+ listName);
    })
    .catch(function (err) {
      console.log(err);
    });
  }

  
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(function () {
      console.log("Successfully dateled items from DB");
      
    })
    .catch(function (err) {
      console.log(err);
    });
    res.redirect("/"); 
  }else{
    List.findOneAndUpdate({name:listName}, {$pull: {item:{_id:checkedItemId}}}).then(function(foundlist){
      res.redirect("/"+ listName);
    })
    .catch(function (err) {
      console.log(err);
    });

  }
  
});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
