const express = require('express');
const path = require('path');
var DOMParser = require('dom-parser');
const { isMainThread } = require('worker_threads');
const app = express();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var fs = require('fs');


var nodemailer = require('nodemailer');

var cors = require('cors');
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    "preflightContinue": true,
}
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))

//DB
const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const uri = "mongodb+srv://Emanuele:h297k1fklCm2SMfp@animedata.dsmjr.mongodb.net/test?authSource=admin&replicaSet=atlas-mud1pv-shard-0&readPreference=primary&ssl=true";

//mail di benvenuto
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'animecrowdinfo@gmail.com',
        pass: 'tiuxjtzynjiycmrt'
    },
    tls: {
        rejectUnauthorized: false
    }
});
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}




app.get('/', (request, response) => {
    const head = request.headers;
    const string = toString(head)
    console.log(request.headers["X-API-Key"])
    return response.send(request.headers["X-API-Key"]);
});

app.get('/allanime', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    
    //db
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("animeDB");
        dbo.collection("Anime").find({}).toArray(function(err, result) {
            if (err) throw err;
                return response.send(result);
            db.close();
        });
    });

});

app.get('/nuovianime', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    
    //db
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("animeDB");
        dbo.collection("Anime").find({}).sort({_id:-1}).limit(6).toArray(function(err, result) {
            if (err) throw err;
                return response.send(result);
            db.close();
        });
    });

});

app.get('/riprendi', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    
    //db
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("animeDB");
        dbo.collection("Anime").find({}).sort({_id:-1}).limit(4).toArray(function(err, result) {
            if (err) throw err;
                return response.send(result);
            db.close();
        });
    });

});

app.get('/animeid/:idanime', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');


    var idanime = request.params.idanime;
    var o_id = new ObjectId(idanime);

    
    //db
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("animeDB");
    dbo.collection("Anime").find({"_id" : o_id}).toArray(function(err, result) {
            if (err) throw err;
                return response.send(result);
            db.close();
        });
    });

});

app.get('/nuoviepisodi', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    var dati;
    var primoDaultimo;
    var secondoDaultimo;
    var terzoDaultimo;
    var quartoDaultimo;
    var quintoDaultimo;
    var sestoDaultimo;
    var settimoDaultimo;
    var finale = [];
    var risultatofiltrato = [];
    
    //db
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("animeDB");
        dbo.collection("NuoviEpisodi").find({}).toArray(function(err, result) {
            if (err) throw err;
                dati = result.slice(-6)
                primoDaultimo = dati[dati.length -1]
                secondoDaultimo = dati[dati.length - 2]
                terzoDaultimo = dati[dati.length - 3]
                quartoDaultimo = dati[dati.length - 4]
                quintoDaultimo = dati[dati.length - 5]
                sestoDaultimo = dati[dati.length - 6]
                finale.push({Nome: primoDaultimo.Nome}, {Nome: secondoDaultimo.Nome}, {Nome: terzoDaultimo.Nome}, {Nome: quartoDaultimo.Nome}, {Nome: quintoDaultimo.Nome}, {Nome: sestoDaultimo.Nome});
                cercaManda()
        });

        function cercaManda(){

                finale.map(function(element){
                    dbo.collection("Anime").find({"Nome" : element.Nome}).toArray(function(err, result) {
                        if (err) throw err;

                        risultatofiltrato.push({Nome: result[0].Nome, Copertina: result[0].Copertina, _id: result[0]._id, Ep: result[0].Episodi.length-1 });

                        if(finale.length === risultatofiltrato.length+1){
                            risultatofiltrato.push({Nome: result[0].Nome, Copertina: result[0].Copertina, _id: result[0]._id, Ep: result[0].Episodi.length-1  });
                            return response.send(risultatofiltrato);
                        }
                    });
                });                
                
        }
        
    });

    
    

});


app.get('/cercaanimuser/:nomeanimeutente', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){

        var animedacercare = request.params.nomeanimeutente;

        
        //db
        MongoClient.connect(uri, function(err, db) {
            if (err) throw err;
            var dbo = db.db("animeDB");
            var totalresult;
            dbo.collection("Anime").find({"Nome" : {$regex : animedacercare, $options: 'i'}}).toArray(function(err, result) {
                    if (err) throw err;

                    totalresult = result

                    dbo.collection("Users").find({"NomeUtente" : {$regex : animedacercare, $options: 'i'}}).toArray(function(err, results) {
                        if (err) throw err;
                            totalresult = totalresult.concat(results)
                            return response.send(totalresult);
                        db.close();
                    });

                });
            });

    }else{
        return response.send('non sei autorizato');
    }

});

app.get('/notizie', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){

        fetch('https://anime.everyeye.it/notizie/')
        .then(res => res.text())
        .then(text => {
            var parser = new DOMParser();
	        var doc = parser.parseFromString(text, 'text/html');
            var newsRow = parser.parseFromString(doc.getElementsByClassName('contenuti')[0].innerHTML, 'text/html');
            return response.send(newsRow);
            //notizieRow = .getElementsByClassName('col-news');;
            //return response.send(notizieRow);
        });

        //let boxNotizie = doc.getElementById('news-row');
    }else{
        return response.send('non sei autorizato');
    }

    
});

app.get('/account/:datiaccount1/:datiaccount2', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        //email
        var datiaccount1 = request.params.datiaccount1;
        //pass
        var datiaccount2 = request.params.datiaccount2;
        
        //db
        MongoClient.connect(uri, function(err, db) {
            if (err) throw err;
            var dbo = db.db("animeDB");
            dbo.collection("Users").find({Email: datiaccount1, Password: datiaccount2}).toArray(function(err, result) {
                if (err) throw err;
                    return response.send(result);

                    
                db.close();
            });
        });
    }else{
        return response.send('non sei autorizato');
    }

});

app.get('/register/:datiaccount1/:datiaccount2/:datiaccount3', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        //username
        var datiaccount1 = request.params.datiaccount1;
        //email
        var datiaccount2 = request.params.datiaccount2;
        //pass
        var datiaccount3 = request.params.datiaccount3;

        // current timestamp in milliseconds
        let ts = Date.now();

        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();

        let finalDate = year + "-" + month + "-" + date;

        let codiceSegretogenerato = generateString(20)

        //db
        MongoClient.connect(uri, function(err, db) {
            if (err) throw err;
            var dbo = db.db("animeDB");
            dbo.collection("Users").insertOne({NomeUtente: datiaccount1, Email: datiaccount2, Password: datiaccount3, Avatar: "https://i.imgur.com/WMw4pS1.png", DataAccount: finalDate, CodiceRipristino:  codiceSegretogenerato, Amici: [{Amico: ""}]}, function(err, res) {
                if (err) throw err;
                console.log("registato")


                var mailOptions = {
                    from: ' "AnimeCrowd" <animecrowdinfo@gmail.com>',
                    to: datiaccount2,
                    subject: 'Benvenuto su AnimeCrowd!',
                    text: 'Ciao '+ datiaccount1 +'! Benvenuto su AnimeCrowd.it 😄,\nda adesso in poi puoi accedere a tutti i servizi presenti sul sito.\nNon riceverai più email, quindi per restare aggiornato seguici sul nostro canale Telegram: https://t.me/+Bosmk92oY_AzYzM0.\nCodice ripristino password: '+ codiceSegretogenerato +'\nAttenzione! Se non ricordi più la tua password o hai qualunque altro problema contatta https://t.me/emaaahhh e fornisci questo codice.\nA presto👋\nIl team di AnimeCrowd.it.'
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email inviata a '+ datiaccount2 +': ' + info.response);
                    }
                });

                return response.send("registato");
                db.close();
            });
        });
    }else{
        return response.send('non sei autorizato');
    }

});
app.get('/check/:datiaccount1', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        //email
        var datiaccount1 = request.params.datiaccount1;
        
        //db
        MongoClient.connect(uri, function(err, db) {
            if (err) throw err;
            var dbo = db.db("animeDB");
            dbo.collection("Users").find({Email: datiaccount1}).toArray(function(err, result) {
                if (err) throw err;
                    return response.send(result);

                    
                db.close();
            });
        });
    }else{
        return response.send('non sei autorizato');
    }

});


app.get('/background/:link/:email/:pass', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        var link = request.params.link;
        var email = request.params.email;
        var pass = request.params.pass;

        console.log(request.headers["X-API-Key"])

        //db
        MongoClient.connect(uri, function(err, db) {
            if (err) throw err;
            var dbo = db.db("animeDB");
            dbo.collection("Users").updateOne({Email: email, Password: pass}, {$set: {Sfondo: link}})

        });
    }else{
        return response.send('non sei autorizato');
    }

});


app.get('/trovautente/:tag', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        var tag = ObjectId(request.params.tag)

        if(tag != undefined) {
            //db
            MongoClient.connect(uri, function(err, db) {
                if (err) throw err;
                var dbo = db.db("animeDB");
                dbo.collection("Users").find({_id : ObjectId(tag)}).toArray(function(err, result) {
                    if (err) throw err;

                        return response.send([{Tag: tag, NomeUtente: result[0].NomeUtente, Avatar: result[0].Avatar, DataAccount: result[0].DataAccount, Amici: result[0].Amici, MiSeguono: result[0].MiSeguono, AnimeVisti: result[0].AnimeVisti, Badge: result[0].Badge}]);
                        
                    db.close();
                });
            });
        }else{
            return
        }
    }else{
        return response.send('non sei autorizato');
    }

});


app.get('/pinUser/:myemail/:mypass/:userid', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        var myemail = request.params.myemail;
        var mypass = request.params.mypass;
        var userid = request.params.userid;
        
        //db
        MongoClient.connect(uri, function(err, db) {
            
            if (err) throw err;
            var dbo = db.db("animeDB");
                    
            dbo.collection("Users").find({Email: myemail, Password: mypass}).toArray(function(err, result) {
                if (err) throw err;
                var myid = ObjectId(result[0]._id)
                var oldPinUserArr = result[0].Amici
                

                dbo.collection("Users").find({_id : ObjectId(userid)}).toArray(function(err, resultuser) {
                    oldPinUserArr.push({_id: userid});
                    var oldMiSeguono;
                    var newMiSeguono;

                    console.log(resultuser[0].MiSeguono)
                    if(resultuser[0].MiSeguono) {
                        oldMiSeguono = resultuser[0].MiSeguono
                        newMiSeguono = oldMiSeguono.push({_id: myid})

                        dbo.collection("Users").updateOne({_id : ObjectId(userid)}, {$set: {MiSeguono: oldMiSeguono}})
                        dbo.collection("Users").updateOne({Email: myemail, Password: mypass}, {$set: {Amici: oldPinUserArr}})

                        return response.send(resultuser[0].NomeUtente);
                    }
                    else{
                        oldMiSeguono = [{_id:'no'},{_id: myid}]
                        newMiSeguono = oldMiSeguono

                        dbo.collection("Users").updateOne({_id : ObjectId(userid)}, {$set: {MiSeguono: newMiSeguono}})
                        dbo.collection("Users").updateOne({Email: myemail, Password: mypass}, {$set: {Amici: oldPinUserArr}})

                        return response.send(resultuser[0].NomeUtente);
                    }

                    /*dbo.collection("Users").updateOne({_id : ObjectId(userid)}, {$set: {MiSeguono: newMiSeguono}})
                    dbo.collection("Users").updateOne({Email: myemail, Password: mypass}, {$set: {Amici: oldPinUserArr}})*/

                });
                            
            });
        });
    }else{
        return response.send('non sei autorizato');
    }

});

app.get('/removepinUser/:myemail/:mypass/:userid', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        var myemail = request.params.myemail;
        var mypass = request.params.mypass;
        var userid = request.params.userid;
        
        //db
        MongoClient.connect(uri, function(err, db) {
            
            if (err) throw err;
            var dbo = db.db("animeDB");
                    
            dbo.collection("Users").find({Email: myemail, Password: mypass}).toArray(function(err, result) {
                if (err) throw err;

                var oldPinUserArr = result[0].Amici
                var myId = result[0]._id;
                

                dbo.collection("Users").find({_id : ObjectId(userid)}).toArray(function(err, resultuser) {

                    function arrayRemove(arr, value) { 
        
                        return arr.filter(function(ele){ 
                            return ele._id != value; 
                        });
                    }

                    function arrayRemovebuhhh(arre, valuee) { 
        
                        return arre.filter(function(ele){ 
                            if(ele._id != undefined){
                                return ele._id.toString() != valuee.toString(); 
                            }
                            
                        });
                    }

                    var result = arrayRemove(oldPinUserArr, userid);


                    var oldMiSeguono;
                    var newMiSeguono;
                    
                    oldMiSeguono = resultuser[0].MiSeguono

                    newMiSeguono = arrayRemovebuhhh(oldMiSeguono, myId);


                    dbo.collection("Users").updateOne({_id : ObjectId(userid)}, {$set: {MiSeguono: newMiSeguono}})
                    dbo.collection("Users").updateOne({Email: myemail, Password: mypass}, {$set: {Amici: result}})
                    

                    return response.send(resultuser[0].NomeUtente);
                    db.close();
                });
                            
            });
        });
    }else{
        return response.send('non sei autorizato');
    }

});

app.get('/serchFollow/:myemail/:mypass/', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        var myemail = request.params.myemail;
        var mypass = request.params.mypass;


        //db
        MongoClient.connect(uri, function(err, db) {
            
            if (err) throw err;
            var dbo = db.db("animeDB");
                    
            dbo.collection("Users").find({Email: myemail, Password: mypass}).toArray(function(err, result) {
                if (err) throw err;
            
                    var listaFolow = result[0].Amici;
                    console.log(listaFolow.length)
                    if(listaFolow.length == 1){
                        response.send([]);
                    }
                    var newlistaFolow = []

                    /*function finito(){
                        return response.send(newlistaFolow);
                    }*/
                    

                    result[0].Amici.forEach((element, index, array) => {

                        
                        
                        if(element._id != undefined){
                            
                            dbo.collection("Users").find({_id : ObjectId(element._id)}).toArray(function(err, results) {
                                if (err) throw err;
                                newlistaFolow.push({Tag: results[0]._id, NomeUtente: results[0].NomeUtente, Avatar: results[0].Avatar, DataAccount: results[0].DataAccount})
                                console.log(newlistaFolow.length)
                                if (newlistaFolow.length == listaFolow.length-1) {response.send(newlistaFolow);}
                            });
                        }

                    });

                    

                            
            });
        });
    }else{
        return response.send('non sei autorizato');
    }

});

app.get('/avatar/:link/:email/:pass', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        var link = request.params.link;
        var email = request.params.email;
        var pass = request.params.pass;


        //db
        MongoClient.connect(uri, function(err, db) {
            if (err) throw err;
            var dbo = db.db("animeDB");
            dbo.collection("Users").updateOne({Email: email, Password: pass}, {$set: {Avatar: link}})

        });
    }else{
        return response.send('non sei autorizato');
    }

});


app.get('/test1/:id', (request, response) => {

    
        if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
            
            var id = request.params.id;

            var baseurl = 'https://www.animeworld.tv'

            let PreLink = []

            fetch(baseurl + '/play/' + id)
                .then(res => res.text())
                .then(text => {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(text, 'text/html');
                    var newsRow = parser.parseFromString(doc.getElementsByClassName('server active')[0].innerHTML, 'text/html');

                    const docs = parser.parseFromString(newsRow.getElementsByTagName("a")[0].getAttribute('href'), 'text/html');

                    newsRow.getElementsByTagName("a").forEach((element, index) => {

                        let d = element.getAttribute('href').replace('/play/'+id+'/', '')
                        
                            /*fetch(baseurl + '/play/'+ id + '/' + d)
                                .then(res => res.text())
                                .then(async textt => {
                                    
                                            delay(2000);

                                            var doci = parser.parseFromString(textt, 'text/html');

                                            var newsRoww = parser.parseFromString(doci.getElementById('download').innerHTML, 'text/html');
        
                                            const vid = parser.parseFromString(newsRoww.getElementsByTagName("a")[1].getAttribute('href'), 'text/html');
        
                                            videoLink.push(vid.rawHTML)
                                            console.log(videoLink.length)
                                            if(videoLink.length == newsRow.getElementsByTagName("a").length){
                                                return response.send(videoLink);
                                            }
        
                                });*/

                                PreLink.push(d)
                        
                    })
                    

                    return response.send(PreLink);
                        
                });

        }else{
            return response.send('non sei autorizato');
        }

});


app.get('/test/:base/:link', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        var base = request.params.base;
        var link = request.params.link;
        
        var baseurl = 'https://www.animeworld.tv'


        fetch(baseurl + '/play/'+ base + '/' + link)
            .then(res => res.text())
            .then(text => {
                var parser = new DOMParser();
                var doc = parser.parseFromString(text, 'text/html');
                var newsRow = parser.parseFromString(doc.getElementById('download').innerHTML, 'text/html');

                var d = newsRow.rawHTML

                return response.send(newsRow);
                    
            });

    }else{
        return response.send('non sei autorizato');
    }

});

app.get('/segnaanimevisto/:id/:email/:pass', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        var id = request.params.id;
        var email = request.params.email;
        var pass = request.params.pass;

        //db
        MongoClient.connect(uri, function(err, db) {
            if (err) throw err;
            var dbo = db.db("animeDB");
            
            dbo.collection("Users").find({Email: email, Password: pass}).toArray(function(err, result) {
                if (err) throw err;

                    
                    if(result[0].AnimeVisti) {
                        oldAnimeVisti = result[0].AnimeVisti
                        newAnimeVisti = oldAnimeVisti.push({_id: id})

                        dbo.collection("Users").updateOne({Email: email, Password: pass}, {$set: {AnimeVisti: oldAnimeVisti}})

                        return response.send(result[0].NomeUtente);
                    }
                    else{
                        oldAnimeVisti = [{_id:'no'},{_id: id}]
                        newAnimeVisti = oldAnimeVisti

                        dbo.collection("Users").updateOne({Email: email, Password: pass}, {$set: {AnimeVisti: oldAnimeVisti}})

                        return response.send(result[0].NomeUtente);
                    }

                    /*dbo.collection("Users").updateOne({_id : ObjectId(userid)}, {$set: {MiSeguono: newMiSeguono}})
                    dbo.collection("Users").updateOne({Email: myemail, Password: mypass}, {$set: {Amici: oldPinUserArr}})*/

                
                            
            });

        });
    }else{
        return response.send('non sei autorizato');
    }

});

app.get('/removeanimevisto/:myemail/:mypass/:id', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    
    if(request.headers.ciao == 'Basic ZW1hYWhoOjghUlEyeCUkJFU2Y05wdQ=='){
        var myemail = request.params.myemail;
        var mypass = request.params.mypass;
        var id = request.params.id;
        
        //db
        MongoClient.connect(uri, function(err, db) {
            
            if (err) throw err;
            var dbo = db.db("animeDB");
                    
            dbo.collection("Users").find({Email: myemail, Password: mypass}).toArray(function(err, result) {
                if (err) throw err;

                var oldPinUserArr = result[0].AnimeVisti
                var myId = result[0]._id;
                
                    function arrayRemove(arr, value) { 
        
                        return arr.filter(function(ele){ 
                            return ele._id != value; 
                        });
                    }


                    var result = arrayRemove(oldPinUserArr, id);

                    

                    dbo.collection("Users").updateOne({Email: myemail, Password: mypass}, {$set: {AnimeVisti: result}})
                    

                    return response.send(result[0].NomeUtente);
                    db.close();
                            
            });
        });
    }else{
        return response.send('non sei autorizato');
    }

});

app.listen(process.env.PORT || 5000, () => {
    console.log('App is listening on port 5000');
});
