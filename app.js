//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-akash:mongoDB@akash@123@cluster0.rjasy.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});
const itemsSchema=new mongoose.Schema({
  name: String,
});
const Item= mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to Todo list!"
});
const item2=new Item({
  name:"Hit the + button to add a new item."
});
const item3=new Item({
  name:"<-- Hit this to delete an item."
});
const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[
    itemsSchema
  ]
};
const List=mongoose.model("List",listSchema);
app.get("/", function(req, res) {
const day = date.getDate();
Item.find(function(err,items){

  if(err)
  {
    console.log(err)
  }
  else if(items.length==0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else {
        console.log("Success");
      }
    });
    res.redirect("/");
  }
  else {
   res.render("list", {listTitle:day, newListItems: items});
  }
})


});
app.post("/search", function(req, res){
  const listName = req.body.listName;

  res.redirect("/"+listName);
});

app.post("/", function(req, res){
  const customListName = req.body.list;
  const itemName = req.body.newItem;
  const day = date.getDate();

  const item=new Item({
    name:itemName,
  });
    if(customListName === day){
      item.save();
      res.redirect("/");
    }
else {
  List.findOne({name:customListName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+customListName);
  });
}
});

app.post("/delete", function(req, res){
  const checkedItemId=req.body.checkbox;
  const customListName = req.body.list;
  const day = date.getDate();
  if(customListName === day){
  Item.findByIdAndRemove(checkedItemId,function(err){
  if(!err){
    console.log("Deleted checked item Successfully");
    res.redirect("/");
  }
});
}
else {
  List.findOneAndUpdate( {name: customListName},{ $pull: {items:{_id: checkedItemId}}}  ,function(err,foundList){
    if(!err){
      console.log("Deleted checked item Successfully");
      res.redirect("/"+customListName);
    }
})
}
});
app.get("/:listType",function(req,res){
  const customListName = _.capitalize(req.params.listType);
List.findOne({name:customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      //create a new list
      const list = new List({
        name: customListName,
        items:defaultItems
      });
      list.save();
          res.redirect("/"+customListName);
    }
    else{
      //show an existing list
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items });
    }
  }
})

  // res.render("list", {listTitle: "Work List", newListItems: []});
});
// app.get("/work", function(req,res){
  // res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if(port== null || port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server has started Successfully");
});
