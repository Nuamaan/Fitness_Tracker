'use strict'

// using a Promises-wrapped version of sqlite3
const db = require('./sqlWrap');

// SQL commands for ActivityTable
const insertDB = "insert into ActivityTable (activity, date, amount) values (?,?,?)"
const getOneDB = "select * from ActivityTable where activity = ? and date = ? and amount = ?";
const getforgraph="select amount from ActivityTable where activity = ? and date = ?";
const allDB = "select * from ActivityTable where activity = ?";
const allAmountDB = "select * from ActivityTable where amount = ?";
const delDB = "DELETE FROM ActivityTable where activity = ? and date = ? and amount = ?";
const mostRecentDB="select activity from ActivityTable order by rowIdNum desc limit 1";



async function testDB() {

  // for testing, always use today's date
  // const today = new Date().getTime();

  // all DB commands are called using await

  // empty out database - probably you don't want to do this in your program
  await db.deleteEverything();

  // await db.run(insertDB, ["running", today, 2.4]);
  // await db.run(insertDB, ["walking", today, 1.1]);
  // await db.run(insertDB, ["walking", today, 2.7]);
  // await db.run(insertDB, ["running", today, 2.4]);

  // console.log("inserted three items");

  // look at the item we just inserted
  // let result = await db.get(getOneDB, ["running", today, 2.4]);
  // console.log(result);

  // get multiple items as a list
  // result = await db.all(allDB, ["walking"]);
  // console.log(result);
}

// module.exports.testDB=testDB;





async function insertActDB(activity, date, amount) {
  let obj=await db.run(insertDB, [activity, date, amount]);
  console.log("cached the data into database");
}

async function getOneActDB(activity, date, amount) {
  let stat = await db.get(insertDB, [activity, date, amount]);
  return stat;
  console.log("took out the data from data base: ",stat);
}

async function getAllActDB(activity) {
  let stat = await db.all(allDB, [activity]);
  return stat;
}

async function getAllFutActDB() {
  let stat = await db.all(allAmountDB, [-1]);
  return stat;
}

async function deleteActDB(activity, date, amount) {
  await db.run(delDB, [activity, date, amount]);

}


//reminder DB
async function mostRecentFutDB() {
  const today = new Date();
  const futActs = await getAllFutActDB();


  let futActsGone = [];
  //getting all the activities that shouldve been done
  //i.e deadlined before today
  for (var i=0;i<futActs.length;i++) {
    let act=futActs[i];
    let actdate=new Date(act.date);
    if (actdate.getTime() < today.getTime() && actdate.getDate() < today.getDate()) {
      futActsGone.push(act);
    }
  }
  let futActMax = futActsGone[0];
  //most recent activity-to-be-done by date
  for (var i=0;i<futActsGone.length;i++) {
    let act=futActsGone[i];
    let actdate=new Date(act.date);
    if (actdate.getTime() > new Date(futActMax.date)) {
      futActMax = act;
    }
  }

  //delete rest of futactivities from database whose deadline has passed
  let promises = [];
  for (let act of futActsGone) {
    promises.push(deleteActDB(act.activity, act.date, -1));

  }
  const done = await Promise.all(promises);

  return futActMax;



}





//most recentDB for graph.
async function mostRecentActDB(){
  const act= await db.get(mostRecentDB);
  return act;

}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`
}
//get activity for a date
// async function getForGraphDB(activity,date){
//   const act=await db.get(getforgraph,[activity,formatDate(date)]);
//   return act;
// }

async function getForGraphDB(act1,date){
  const amount=await db.get(getforgraph,[act1,date]);
  return amount;
}


function newUTCDate() {
  let gmtDate = new Date()
  return new Date(gmtDate.toLocaleDateString())
}

module.exports = {
  insertActDB: insertActDB,
  getOneActDB: getOneActDB,
  getAllActDB: getAllActDB,
  getAllFutActDB: getAllFutActDB,
  deleteActDB: deleteActDB,
  mostRecentFutDB: mostRecentFutDB,
  mostRecentActDB:mostRecentActDB,
  getForGraphDB:getForGraphDB,

  testDB: testDB
}
