const http = require('http');
const fs = require("fs");
let path = require("path");

const hostname = '127.0.0.1';
const port = 3001;

const handlers = {
  '/api/articles/readall': readall, //возвращает массив статей с комментариями
  '/api/articles/read': read,//возвращает статью с комментариями по переданному в теле запроса id 
  '/api/articles/create': create, //создает статью с переданными в теле запроса параметрами / id генерируется на сервере / сервер возвращает созданную статью 
  '/api/articles/update': update, //обновляет статью с переданными параметрами по переданному id
  '/api/articles/delete': deleteArticle, //удаляет комментарий по переданному id
  '/': home 

};


const server = http.createServer((req, res) => {
  const handler = getHandler(req.url);
  if(req.method == 'GET'){
    let extension = path.extname(req.url);
    let url = req.url.split('/');   // res.statusCode = 200;
   
    if(extension == '.html')
    {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        let data = fs.readFileSync(path.join("public",url[1]));
		    res.end(data);
   }
    else if(extension == '.js'){
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        let filename;
        if(req.url.indexOf('app.js')==0){
          filename = "index.js";
        }else{
          filename="form.js";
        }
		    let data = fs.readFileSync(path.join("public",filename));
		    res.end(data);
      }
      else if(extension=='.css'){
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/css");
		    let data = fs.readFileSync(path.join("public",url[1]));
		    res.end(data);
      }
      else if(extension=='.ico'){
        res.statusCode = 200;
      }
      else if(req.url.indexOf('/form.html?')==0){
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        let data = fs.readFileSync(path.join("public","form.html"));
		    res.end(data);
      }
      else{
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
		    let data = fs.readFileSync("public\\index.html");
        res.end(data);
      }
	
  }else{
    parseBodyJson(req, (err, payload) => {
      handler(req, res, payload, (err, result) => {
        if (err) {
          res.statusCode = err.code;
          res.setHeader('Content-Type', 'application/json');
          res.end( JSON.stringify(err) );
  
          return;
        }
  
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end( JSON.stringify(result) );
      });
    });
  } 
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function getHandler(url) {
  return handlers[url] || notFound;
}


///==================ОБРАБОТЧИКИ URL====================

//возвращает массив статей с комментариями
function readall(req, res, payload, cb) {

  const fileContent = getJSONContent();
  let  fileContentArray = Array.from(fileContent);

  //======СОРТИРОВКА========
  const sortType = payload.sortOrder;
  const sortField = payload.sortField;
  const flag = payload.includeDeps;
  const page = payload.page ;
  const limit = payload.limit;

  switch(sortField){
    case 'id' : {
      fileContentArray.sort(comparebyId);
      if(sortType == 'desc') fileContentArray.reverse();
      break;
    }
    case 'title' : {
      fileContentArray.sort(comparebyTitle);
      if(sortType == 'desc') fileContentArray.reverse();
      break;
    }
    case 'text' : {
      fileContentArray.sort(comparebyText);
      if(sortType == 'desc') fileContentArray.reverse();
      break;
    }
    case 'date' : {
      fileContentArray.sort(comparebyDate);
      if(sortType == 'desc') fileContentArray.reverse();
      break;
    }
    case 'author' : {
      fileContentArray.sort(comparebyAuthor);
      if(sortType == 'asc') fileContentArray.reverse();
      break;
    }
    default: {
      fileContentArray.sort(comparebyDate);
      if(sortType == 'desc') fileContentArray.reverse();
      break;
    }
  }

  let articles = [];
  let i=0;
  while(i< limit && i < fileContentArray.length){
    if(fileContentArray[i].page == page){
      let result= {};
      result.id = fileContentArray[i].id;
      result.title = fileContentArray[i].title;
      result.text = fileContentArray[i].text;
      result.date = fileContentArray[i].date;
      result.author = fileContentArray[i].author;
      result.page = fileContentArray[i].page;

      if(flag == "true"){
        result.comments = fileContentArray[i].comments;
      }

      articles.push(result);
    }
    i++;
  }
  cb(null, articles);
}


//===ФУНКЦИИ СРАВНЕНИЯ=====
function comparebyId(obj1, obj2){
  return obj1.id - obj2.id;
}

function comparebyTitle(obj1, obj2){
  return obj1.title - obj2.title;
}

function comparebyText(obj1, obj2){
  return obj1.text - obj2.text;
}

function comparebyDate(obj1, obj2){
  return obj1.date - obj2.date;
}

function comparebyAuthor(obj1, obj2){
  return obj1.author - obj2.author;
}

//возвращает статью с комментариями по переданному в теле запроса id 
function read(req, res, payload, cb) {
  
  let result;
  let id = payload.id;
  const content = getJSONContent();

  (Array.from(content)).forEach(element => {
    if(id == element.id){
      result ="Header: "+ element['title']+ "[ " + element['text'] + " ]";
      result += " Comments: " + element['comments'][0]['text'] + ', ' + element['comments'][1]['text'];
    }
  });

    if(result==null){
      result = { code: 404, message: 'Not found'};
    }
  cb(null, result);
}


//создает статью с переданными в теле запроса параметрами / id генерируется на сервере / сервер возвращает созданную статью 
function create(req, res, payload, cb) {
  const fileContent = getJSONContent();

  let id = getID();
  id++;

  let article = payload;
  article.id = id;
  fileContent.push(article);
  /*
  (Array.from(article.comments)).forEach(element => {
    element.id = Date.now();
    element.articleId = id;
  });
*/
  //fileContent[--id] = article; 

  rewriteJSON(fileContent);                          
  const result = "article created";

  cb(null, result);
}

//обновляет статью с переданными параметрами по переданному id
function update(req, res, payload, cb) {
  const fileContent = getJSONContent();

  let id = payload.id;
  let article = payload;

  fileContent[--id] = article; 
  
  rewriteJSON(fileContent);  
  const result = "Article updated";
   cb(null, result);
}

//удаляет комментарий по переданному id
function deleteArticle(req, res, payload, cb) {
  let result;

  const content = getJSONContent();;
  let id = payload.id;
  let contextArray = Array.from(content);

  for(let i =0; i<contextArray.length; i++){
    if(id == contextArray[i].id){
        delete contextArray[i];

        rewriteJSON(contextArray); 
  
      result = "Article deleted";
    }
  }
  
  if(result==null){
    result = { code: 404, message: 'Not found'};
  }

  cb(null, result);
}

function home(req, res, cb) {

}

//===================ДОП ФУНКЦИОНАЛ=================
//считывание файло json и получение id
function getID(){
  const fileContent = getJSONContent();

  let actualId;
  (Array.from(fileContent)).forEach(element => {
    actualId = element.id;
  });

  return actualId;
}

function getJSONContent(){
  const fileContent = fs.readFileSync("articles.json");
  const response = JSON.parse(fileContent);

  return response;
}

function rewriteJSON(cntnt){
  const newJson = JSON.stringify(cntnt);
  fs.writeFileSync("articles.json", newJson);
}

function notFound(req, res, payload, cb) {
  cb({ code: 404, message: 'Not found'});
}

function parseBodyJson(req, cb) {
  let body = [];

  req.on('data', function(chunk) {
    body.push(chunk);
  }).on('end', function() {
    body = Buffer.concat(body).toString();

    let params = JSON.parse(body);
    
    cb(null, params);
  });
}

