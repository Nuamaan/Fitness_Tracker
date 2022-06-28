import barchart from './barchart.js'

barchart.init('chart-anchor', 500, 300);
//view progress Button
let viewprogbutton=document.getElementById('viewProgressButton');
viewprogbutton.addEventListener("click",onclick_progbutton);

function onclick_progbutton(){
  let today=new Date().getTime() ;
  fetch(`/week?activity=&date=${today}`).then(response=>{
    response.json().then(data=>{
      var modal = document.getElementById("mymodal");
      modal.style.display = "block";
      console.log(data);
      barchart.render(data);
      let anchor=document.getElementById('chart-anchor');
      // anchor.classList.remove('hide');
      // console.log(data);
      }
    );
  });
}


let graphsubmit=document.getElementById('go');
graphsubmit.addEventListener("click",onclick_subbutton);
//?date=${int_date}&activity=${graphact}
function onclick_subbutton(){
  let date_=document.getElementById('graphdate').value;
  let date = new Date(date_.replace('/','-')).getTime();
  // let int_date=new Date(date).getTime();
  let graphact=document.getElementById('graphform').value;
  fetch(`/week?date=${date}&activity=${graphact}`).then(response=>{
    response.json().then(data=>{
      console.log(data);
      barchart.render(data);
      let anchor=document.getElementById('chart-anchor');
      // anchor.classList.add();
      
      // console.log(data);
      }
    );
  });
}

// Get the <span> element that closes the modal
var span = document.querySelector(".close");

// When the user clicks on <span> (x), close the modal
span.onclick = function() { 
  var modal = document.getElementById("mymodal");
  modal.style.display = "none";
}

function newUTCDate() {
  let gmtDate = new Date()
  return new Date(gmtDate.toLocaleDateString())
}



