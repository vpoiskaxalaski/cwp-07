const http = require('http');
const fs = require("fs");

const hostname = '127.0.0.1';
const port = 3000;

const handlers = {
  '/api/articles/readall': readall, //возвращает массив статей с комментариями
  '/api/articles/read': read,//возвращает статью с комментариями по переданному в теле запроса id 
  '/api/articles/create': create, //создает статью с переданными в теле запроса параметрами / id генерируется на сервере / сервер возвращает созданную статью 
  '/api/articles/update': update, //обновляет статью с переданными параметрами по переданному id
  '/api/articles/delete': deleteArticle //удаляет комментарий по переданному id
};

const server = http.createServer((req, res) => {
  const homePage = fs.readFileSync("./public/index.html", "utf8");
  switch(req.url){
    case '/' : {
      res.setHeader('Content-Type', 'text/html');
      res.end(homePage);
      break;
    }
    case '/index.html':{
      res.setHeader('Content-Type', 'text/html');
      res.end(homePage);
      break;
    }
    case '/form.html':{
      let formHTML = fs.readFileSync("./public/form.html", "utf8");
      res.setHeader('Content-Type', 'text/html');
      res.end(formHTML);
      break;
    }
    case '/app.js':{
      let indexJS = fs.readFileSync("./public/index.js", "utf8");
      res.setHeader('Content-Type', 'text/js');
      res.end(indexJS);
      break;
    }
    case '/form.js':{
      let formJS = fs.readFileSync("./public/form.js", "utf8");
      res.setHeader('Content-Type', 'text/js');
      res.end(formJS);
      break;
    }
    case '/site.css':{
      let siteCSS = fs.readFileSync("./public//site.css", "utf8");
      res.setHeader('Content-Type', 'text/css');
      res.end(siteCSS);
      break;
    }
    default: {
      res.setHeader('Content-Type', 'text/html');
      res.end("<h1>Error not found</h1>");
    }
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
  
  let result= {};
  const fileContent = getJSONContent();
  let  fileContentArray = Array.from(fileContent);

  //======СОРТИРОВКА========
  const sortType = payload.sortOrder;
  const sortField = payload.sortField;
  const flag = payload.includeDeps | false;
    //=========СТРАНИЦЫ И  ЗАПИСИ=========

  const page = payload.page ;
  const limit = payload.limit | 1;

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

  if(!flag){
    fileContentArray.forEach((element)=>{
      element.comments = "hiden";
    });
  } 

  fileContentArray.forEach((element) =>{
    
    if(element.page == page){
      result.id = element.id;
      result.title = element.title;
      result.text = element.text;
      result.date = element.date;
      result.author = element.author;
      result.page = element.page;

      let messages = [];
      let message = {};
      let arr = Array.from(element.comments);
      let i =0;
      
        while(i< limit && i<arr.length){
          message.id = arr[i].id;
          message.date = arr[i].date;
          message.author = arr[i].author;
          messages.push(message);
          i++;
        }
        result.comments = messages;
    }
  })
  
  
  cb(null, result);
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
  (Array.from(article.comments)).forEach(element => {
    element.articleId = id;
  });

  fileContent[--id] = article; 

  rewriteJSON(fileContent);                              
  const result = "article created";

  cb(null, result);
}

//обновляет статью с переданными параметрами по переданному id
function update(req, res, payload, cb) {
  const fileContent = getJSONContent();

  let id = payload.id;
  console.log(id);
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


//home page
function home(req, res, payload, cb) {
  let result;

  homePage = fs.readFileSync("./public/index.html", "utf8");
  res.setHeader('Content-Type', 'text/html');
  res.end(homePage);
  
  cb(null, result);
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
  fs.writeFileSync("js.json", newJson);
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


