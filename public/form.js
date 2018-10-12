function AddArticle(){
    let id = "";
    let title =  $("#inTitle").val();
    let text = $("#inText").val();
    let date = $("#inDate").val();
    let author = $("#inAuthor").val();
    let page = $("#inPage").val();

    class Req {
        constructor(i,tit,txt, dt, aut, pg){
            this.id= i;
            this.title = tit;
            this.text = txt;
            this.date = dt;
            this.author = aut;
            this.page = pg;
        }
    };

    if(title!="" && text!="" && date!="" && author!="" && page!=""){
        let r = new  Req(id,title,text, date, author, page);
        let data = JSON.stringify(r); 
        sendRequest(data);
    }
    else{
        alert("Enter data!");
    }
   
}

function sendRequest(data){
    alert(data);
	const url = "http://127.0.0.1:3001/api/articles/create";
	const xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.send(data);
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
          let msg = xmlhttp.responseText;
          $("#status").append(msg);
        }
    }
   
}
