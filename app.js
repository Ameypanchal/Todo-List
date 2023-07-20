const express = require('express');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const  _ = require('lodash')
const app = express();
//const date = require(__dirname  + '/date.js');
//let items = ["buy food", "cook food", "eat food"]
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb+srv://admin-amey:17032003@cluster0.gkgf8po.mongodb.net/todolistDB")
//Creating A schems for the db
const itemSchema = {
  name: String
};

//creeating a model
const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "welcome to  your todolist!!"
});

const item2 = new Item({
  name: "Hit + button to add items to your todolist."
});

const item3 = new Item({
  name: "<-- Hit this button to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = new mongoose.model("List", listSchema)

app.get("/", function(req, res) {
  Item.find().then(function(foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
      res.redirect("/")
    } else {
      res.render("list", {
        listTitle: "Today",
        newListitems: foundItems
      });
    }
  });
  //let day = date.getDate();

});


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }).then(function(foundList) {

    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName)
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListitems: foundList.items
      });
    }

  });

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }).then(function(foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    });
  }

});

app.post("/delete", function(req, res) {
  const checkedItemid = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemid).then(function(err) {
      res.redirect('/')
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemid}}}).then(function(err){
      res.redirect('/' + listName)
    });
  }

});

app.listen(3000, function() {
  console.log("Server is running at port 3000");
});
