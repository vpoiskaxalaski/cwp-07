      
$(document).ready(function(){
    sendReq();
});


function sendReq(){
    let sort =  $("#sortType option:selected").text();
    let req = {};
    req.sortField = "author";
    req.sortOrder = sort;
    req.page = 1;
    req.limit = 5;
    req.includeDeps = "true";
    var data = JSON.stringify(req);
    alert(data);
	LoadContent(data);
}

function LoadContent(data) {      

    document.getElementById('articleList').innerHTML = "";
	const url = "http://127.0.0.1:3001/api/articles/readall";
	const xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(data); 

	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
            let json = JSON.parse(xhr.responseText);

			json.forEach((article) =>{
                
                let commentHTML = '<div id="comments">\n';
                if(article.comments != undefined){
                    let commentArr = Array.from(article.comments);
				    commentArr.forEach((comment) =>	{
					commentHTML += `<div class="comment-text">${comment.text}</div>\n
        						<div class="comment-date">${comment.date}</div>\n
        						<div class="comment-author">${comment.author}</div>\n
        						<div class="comment-articleid" style="display: none">${comment.articleId}</div>\n`;
                    });
                }
                commentHTML += "</div>"

				let articleHTML = '<div class="article-with-comments">' +
					'<div class="article">' +
					`<h2 class=\"title\">${article.title}</h2>\n` +
					"        <div class=\"date-author\">\n" +
					`            <div class=\"date\">${article.date}</div>\n` +
					`            <div class=\"author\">${article.author}</div>\n` +
					"        </div>\n" +
					`        <textarea class=\"articleId\" style="display: none">${article.id}</textarea>` +
					`        <div class=\"text\">${article.text}</div></div>` + commentHTML + "</div>";
				$("#articleList").append(articleHTML);
			});
		}
	}
  }