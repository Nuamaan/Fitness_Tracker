'use strict'

// A server that uses a database.

// express provides basic server functions
const express = require("express");

// our database operations
const dbo = require('./databaseOps');

// object that provides interface for express
const app = express();

// use this instead of the older body-parser
app.use(express.json());

// make all the files in 'public' available on the Web
app.use(express.static('public'))

// function for cleaning up the database!!
// dbo.testDB().then(()=>{
//   console.log("deleted everything in the database!!!");
// });

// when there is nothing following the slash in the url, return the main page of the app.
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});



// This is where the server recieves and responds to POST requests
app.post('/store', function(request, response, next) {
  let data = request.body;
  console.log("Server recieved a post request at", request.url, "the data is: ", data);
  // console.log("body",request.body);
  response.send("I got your POST request");
  //send the future activity to the database.
  if (data.scalar) {
    dbo.insertActDB(data.activity, data.date, data.scalar).catch(() => {
      console.log("unsuccessfull in caching future activity");
    })
  }
  else {
    dbo.insertActDB(data.activity, data.date, -1).catch(() => {
      console.log("unsuccessfull in caching future activity");
    });
  }

});


// app.post('/storep', function(request, response, next) {
//   let data = request.body;
//   console.log("Server recieved a post request at", request.url, "the data is: ", data);
//   // console.log("body",request.body);
//   response.send("I got your POST request");
//   //send the future activity to the database.
//   dbo.insertActDB(data.activity, data.date,data.scalar ).catch(() => {
//     console.log("unsuccessfull in caching future activity");
//   });

// });

// reminder for future activities.
app.get('/reminder', (request, response,next) => {
  dbo.mostRecentFutDB().then((mostrecent) => {
    //
    console.log(mostrecent, "from app.get(/reminder)");
    response.send(mostrecent);

  })

});

app.get('/week', async function (request, response,next) {
  let queryObj = request.query;
  console.log(queryObj,"top of app.get(/week) function)");
  let arrToGraph = [];
  let promises=[];
  let dates=[];
  //if we are provided with activity from user.
  if (queryObj.activity!=="") {
    let queryWeekDate = new Date(parseInt(queryObj.date));
    let firstDayofWeek = new Date(queryWeekDate.setDate(queryWeekDate.getDate() - queryWeekDate.getDay()));
    for (let i = 0; i < 7; i++) {
      let newday = new Date(firstDayofWeek.setDate(firstDayofWeek.getDate() + 1));
      let datestr=formatDate(newday);
      //console.log(datestr);
      let act = dbo.getForGraphDB(queryObj.activity, datestr);
      promises.push(act);
      dates.push(newday);

    }
    Promise.all(promises).then((values)=>{
      console.log(values);
      values.map((value, i) => {
        let objToPush={};
        objToPush.date=dates[i];
        if(value===undefined){
          objToPush.value=0;
          arrToGraph.push(objToPush);
        }
        else{
          objToPush.value=value.amount;
          arrToGraph.push(objToPush);

          }
      });
      response.send(arrToGraph);
      console.log(arrToGraph);
    }
    );

  }
  //if we have to use the most recent activity for graphs..
  else if(queryObj.activity==="") {
    dbo.mostRecentActDB().then(act => {
      let queryWeekDate = new Date(parseInt(queryObj.date));
      let firstDayofWeek = new Date(queryWeekDate.setDate(queryWeekDate.getDate() - queryWeekDate.getDay()));
      for (let i = 0; i < 7; i++) {
        let newday = new Date(firstDayofWeek.setDate(firstDayofWeek.getDate() + 1));
        let datestr=formatDate(newday);
        //console.log(datestr);
        let amount = dbo.getForGraphDB(act, datestr);
        promises.push(amount);
        dates.push(newday);

      }
      Promise.all(promises).then(()=>{
      for(let i=0;i<7;i++){
        let objToPush={};
        objToPush.date=dates[i];
        //console.log(promises[i].amount);
        if(promises[i].amount===undefined){
          objToPush.value=0;
          arrToGraph.push(objToPush);
        }
        else{
          objToPush.value=promises[i].amount;
          arrToGraph.push(objToPush);
          }
      }
      response.send(arrToGraph);
      console.log(arrToGraph);
    }
    );
    });
  }

});





// async function arr(){
//   let toPrint =await dbo.mostRecentActDB();
//   console.log("most recent", toPrint);
// }

// arr();

// listen for requests :)
const listener = app.listen(3000, () => {
  console.log("The static server is listening on port " + listener.address().port);
});

function newUTCDate() {
  let gmtDate = new Date()
  return new Date(gmtDate.toLocaleDateString())
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`
}
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


// call the async test function for the database
// this is an example showing how the database is used
// you will eventually delete this call.
// dbo.testDB();

//   // const back=new Date(today.getDate()-4);
//   // const future=new Date(today.getDate()+4);
//   // const today = new Date().getTime();

//   dbo.insertActDB("swim", new Date(), -1)).then(
//     dbo.insertActDB("laughing", new Date(), -1)).then(
//       dbo.insertActDB("Basketball", new Date(), -1)).then(
//         dbo.insertActDB("yoga", new Date(), -1)).then(
//           dbo.insertActDB("bike", new Date(), -1)).then(
//             dbo.getAllFutActDB().then((arr) => {
//               console.log(arr);

//               // for(let act of arr){
//               //   console.log(arr.date,"  hghgh ");
//               // }
//             }));

// dbo.getAllActDB("running").then((arr)=>{
//   console.log(arr);
// });
// dbo.getAllFutActDB().catch((error)=>{console.log(error)});


