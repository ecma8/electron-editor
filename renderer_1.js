let express = require('express');
let router = express.Router();
let app = express();
let multiparty = require('multiparty');
let util = require('util');
let fs = require('fs');
let path = require('path');
let bodyParser = require('body-parser');
let publicPath = '';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', function (req, res) {
    publicPath = filePath;
    res.sendFile(publicPath + "index.html");
    app.use('/static', express.static(publicPath + 'static/'));

});
app.get('/edit', function (req, res) {
    res.sendFile(__dirname.replace(/\\/g,'/')+ "/json.html");
    app.use('/assets', express.static(__dirname.replace(/\\/g,'/') + '/assets/'));
    app.use('/dist', express.static(__dirname.replace(/\\/g,'/') + '/dist/'));
});
app.get('/getEditData',function (req,res) {
    Origin(res);
    if(editFilePath.split('.')[editFilePath.split('.').length-1] === 'js'){
        fs.readFile(editFilePath,{encoding:"utf-8"}, function (err, fr) {
            if (err) {
                console.log(err);
            }else {
                res.send({
                    data:`<script type="text/javascript">${fr}<\/script>`,
                    type:'success',
                    ext:'js'
                });
                fs.exists(editFilePath.replace('content.js','content_1.js'),function(exists){
                    if(exists){
                    }
                    if(!exists){
                        fs.writeFile(editFilePath.replace('content.js','content_1.js'), fr,function () {

                        });
                    }
                });

            }
        });
    }else{
        fs.readFile(editFilePath,{encoding:"utf-8"}, function (err, fr) {
            if (err) {
                console.log(err);
            }else {
                res.send({
                    data:JSON.parse(fr),
                    type:'success',
                    ext:'json'
                });

            }
        });
    }

});

app.post('/writeEditData', function (req, res, next) {
    Origin(res);
    console.log(req.body);
    if(req.body.ext === 'json'){
        fs.writeFile(editFilePath, req.body.dataList,function () {
            res.send({type: 'success'});
        });
    }else{
        fs.writeFile(editFilePath, 'let '+req.body.name+'='+req.body.dataList,function () {
            res.send({type: 'success'});
        });
    }

});

app.post('/writeJSON', function (req, res, next) {
    Origin(res);
    fs.writeFile(publicPath+'static/content.json', req.body.dataList,function () {
        delResource('animation',function () {
            // console.log('这是删除动画文件后的回调');
            delResource('image',function () {
                // console.log('这是删除图片文件后的回调');
                delResource('audio',function () {
                    // console.log('这是删除音频文件后的回调')
                });
            });
        });
        res.send({type: 'success'});
    });
});
app.get('/getJSON', function (req, res, next) {
    Origin(res);
    let str;
    publicPath = filePath;
    // console.log(publicPath);
    if(req.query.publicPath){
        publicPath = req.query.publicPath;
        app.use('static', express.static(publicPath + 'static/'));
    }else{
        publicPath = filePath;
    }
    // console.log(publicPath);
    fs.readFile(publicPath+'static/content.json',{encoding:"utf-8"}, function (err, fr) {
        if (err) {
            console.log(err);
        }else {
            str = fr;
            res.send(str)
        }
    });
});
app.get('/getResourceJSON', function (req, res, next) {
    Origin(res);
    fs.readFile(publicPath+'static/resource.json',{encoding:"utf-8"}, function (err, fr) {
        if (err) {
            console.log(err);
        }else {
            let arr = JSON.parse(fr);
            let resourceObject = {};
            arr.forEach((item,index)=>{
                resourceObject[item.key] = item.path;
            });
            res.send(JSON.stringify(resourceObject));
        }
    });
});
app.get('/get', function (req, res, next) {
    Origin(res);
    res.send(req.query);
});
app.post('/uploadingImage', function (req, res, next) {
    Origin(res);
    let form = new multiparty.Form({uploadDir: publicPath+'static/assets/images/'});
    form.parse(req, function (err, fields, files) {
        let filesTmp = JSON.stringify(files, null, 2);
        let filesJSON = JSON.parse(filesTmp).image[0];
        if (err) {
            console.log('parse error: ' + err);
        } else {
            fs.renameSync(filesJSON.path, publicPath+'static/assets/images/' + filesJSON.originalFilename);
        }
        filesJSON.path = './static/assets/images/' + filesJSON.originalFilename;
        writeResourceJSON(filesJSON.originalFilename,filesJSON.path,'image',function (name) {
            filesJSON.resourceName = name;
            res.end(JSON.stringify(filesJSON));
        });
    });
});
app.post('/uploadingAudio', function (req, res, next) {
    Origin(res);
    let form = new multiparty.Form({uploadDir: publicPath+'static/assets/audios/'});
    form.parse(req, function (err, fields, files) {
        let filesTmp = JSON.stringify(files, null, 2);
        let filesJSON = JSON.parse(filesTmp).audio[0];
        if (err) {
            console.log('parse error: ' + err);
        } else {
            fs.renameSync(filesJSON.path, publicPath+'static/assets/audios/' + filesJSON.originalFilename);
        }
        filesJSON.path = './static/assets/audios/' + filesJSON.originalFilename;
        writeResourceJSON(filesJSON.originalFilename,filesJSON.path,'audio',function (name) {
            filesJSON.resourceName = name;
            res.end(JSON.stringify(filesJSON));
        });
    });
});
app.post('/uploadingAnimation',function(req,res){
    Origin(res);
    let form = new multiparty.Form({uploadDir: publicPath+'static/animation/'});
    form.parse(req, function (err, fields, files) {
        let filesTmp = JSON.stringify(files, null, 2);
        let animationArr = Object.values(JSON.parse(filesTmp)).map((item)=>item[0]);
        let animationObject;
        animationArr.forEach((item,index)=>{
            let filesJSON = item;
            if (err) {
                console.log('parse error: ' + err);
            } else {
                fs.renameSync(filesJSON.path, publicPath+'static/animation/' + filesJSON.originalFilename);
            }
            filesJSON.path = './static/animation/' + filesJSON.originalFilename;
            if(item.originalFilename.split('.')[item.originalFilename.split('.').length-1] === 'json'){
                animationObject = item;
            }
        });
        writeResourceJSON(animationObject.originalFilename,animationObject.path,'animation',function (name) {
            animationObject.resourceName = name;
            res.end(JSON.stringify(animationObject));
        });
    });
});
let resourceNameData = [];
let resourceNameArr = ['name','audio_name','animate_name','image_name','audio'];
function getResourceName(data){
    //data.replace(/"name":([^]*?)[,}]/g,(_,s)=>resourceNameArr.push(s));
    // data.replace(/"name":"?([^]*?)[",}]/g,(_,s)=>resourceNameArr.push(s));
    // data.replace(/"audio":"?([^]*?)[",}]/g,(_,s)=>resourceNameArr.push(s));
    // data.replace(/"audio_name":"?([^]*?)[",}]/g,(_,s)=>resourceNameArr.push(s));
    // data.replace(/"image_name":"?([^]*?)[",}]/g,(_,s)=>resourceNameArr.push(s));
    // data.replace(/"animate_name":"?([^]*?)[",}]/g,(_,s)=>resourceNameArr.push(s));
    // callback(resourceNameArr);
    Object.keys(data).forEach((item,index)=>{
        let values =  Object.values(data)[index];
        if(Object.prototype.toString.call(values) === "[object Object]"){
            getResourceName(values)
        }else if(Object.prototype.toString.call(values) === "[object String]" && resourceNameArr.indexOf(item)>-1){
            resourceNameData.push(values)
        }else if(Object.prototype.toString.call(values) === '[object Array]')
        {
            if(Object.prototype.toString.call(values[0]) === "[object Object]")
            {
                getResourceName(values)
            }else if(Object.prototype.toString.call(values[0]) === "[object String]" && values[0].indexOf('audio_')>-1){
                resourceNameData.push(...values)
            }
        }
    });
}
function readContentJSON(callback){
    fs.readFile(publicPath+'static/content.json',{encoding:"utf-8"}, function (err, fr) {
        if (err) {
            console.log(err);
        }else {
            getResourceName(JSON.parse(fr));
            setTimeout(()=>{
                callback(resourceNameData);
                console.log(resourceNameData)
            },300);
        }
    });
}
function writeResourceJSON(name='',filePath='',type='image',callback){
    name = type+'_'+name.split('.')[0];
    fs.readFile(publicPath+'static/resource.json',{encoding:"utf-8"}, function (err, fr) {
        if (err) {
            console.log(err);
        }else {
            let allData = JSON.parse(fr);
            let keyArr = allData.map((item,index)=>{
                return item.key
            });
            let keyIndex = keyArr.indexOf(name);
            if(keyIndex>-1){
                allData[keyIndex].path = filePath;
            }else{
                allData.push({
                    key:name,
                    path:filePath,
                    edit:true
                })
            }
            fs.writeFile(publicPath+'static/resource.json', JSON.stringify(allData),function () {
                callback(name);
            });
        }
    });
}
function delResource(type ='image',callback){
    let resourceData = [];
    let resourcePath = '';
    let replacePath = '';
    let resourceArr = [];
    if(type === 'image'){
        replacePath = './static/assets/images/';
        resourcePath = publicPath+'static/assets/images/';
    }else if(type === 'audio'){
        replacePath = './static/assets/audios/';
        resourcePath = publicPath+'static/assets/audios/';
    }else if(type === 'animation'){
        replacePath = './static/animation/';
        resourcePath = publicPath+'static/animation/';
    }
    let newResourceData = [];
    readContentJSON(function(res){
        // console.log(res);
        let resData = new Map();
        let newResArr = res.filter((a) => !resData.has(a) && resData.set(a, 1));
        // console.log(newResArr);
        fs.readFile(publicPath+'static/resource.json',{encoding:"utf-8"}, function (err, fr) {
            if (err) {
                console.log(err);
            }else {
                resourceData = JSON.parse(fr);
                resourceData.forEach((item,index)=>{
                    if((item.edit && newResArr.indexOf(item.key)!==-1)||(!item.edit)){
                        newResourceData.push(item);
                    }
                });
                fs.writeFile(publicPath+'static/resource.json', JSON.stringify(newResourceData),function () {
                    newResourceData.forEach((item,index)=>{
                        if(type !== 'animation'){
                            if(item.key.indexOf(type+'_')>-1){
                                resourceArr.push(item.path.replace(replacePath,''));
                            }
                        }else{
                            if(item.key.indexOf(type+'_')>-1){
                                resourceArr.push(item.path.replace(replacePath,''));
                                resourceArr.push(item.path.replace(replacePath,'').replace('json','')+'png');
                                resourceArr.push(item.path.replace(replacePath,'').replace('json','')+'atlas');
                            }
                        }
                    });
                    // console.log(resourceArr);
                    let files = [];
                    if(fs.existsSync(resourcePath)){
                        files = fs.readdirSync(resourcePath);
                        files.forEach((item,index)=>{
                            if(resourceArr.indexOf(item)===-1){
                                fs.unlinkSync(resourcePath+item);
                            }else{

                            }
                        })
                    }
                    resourceNameData = [];
                    callback();
                });
            }
        });
    });
}
function Origin(res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
}



let server = app.listen(8888, function () {

    let host = server.address().address;

    let port = server.address().port;
});
module.exports = router;