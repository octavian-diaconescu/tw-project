const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");
const pg = require("pg");

const Client=pg.Client;

client=new Client({
    database:"proiect",
    user:"doctavian",
    password:"parola",
    host:"localhost",
    port:5432,
})

client.connect()
client.query("select * from produse", function(err, rezultat){
    console.log(err)    
    console.log("Rezultat query:", rezultat)
})
client.query("select * from unnest(enum_range(null::categorie_mare))", function(err, rezultat ){
    console.log(err)    
    console.log(rezultat)
})

app = express();

v = [10, 27, 23, 44, 15]

nrImpar = v.find(function (elem) { return elem % 100 == 1 })
console.log(nrImpar)

console.log("Folderul proiectului: ", __dirname)
console.log("Calea fisierului index.js: ", __filename)
console.log("Folderul curent de lucru: ", process.cwd())

app.set("view engine", "ejs");

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu: null
}

client.query("select * from unnest(enum_range(null::categorie_mare))", function(err, rezultat ){
    console.log(err)    
    console.log("Tipuri produse:", rezultat)
    obGlobal.optiuniMeniu=rezultat.rows
})

vect_foldere = ["temp", "backup", "temp1"]
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

function compileazaScss(caleScss, caleCss) {
    console.log("cale:", caleCss);
    if (!caleCss) {

        let numeFisExt = path.basename(caleScss); // "folder1/folder2/ceva.txt" -> "ceva.txt"
        let numeFis = numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss = numeFis + ".css"; // output: a.css
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss)


    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true })
    }

    // la acest punct avem cai absolute in caleScss si  caleCss

    // let numeFisCss = path.basename(caleCss);
    // if (fs.existsSync(caleCss)) {
    //     let timestamp = Date.now();
    //     let numeFisCssBackup = numeFisCss.replace(".css",  `_${timestamp}.css`);
    //     fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisCssBackup))// +(new Date()).getTime()
    // }

    rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css)
    // console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");

//la pornirea serverului
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    console.log(eveniment, numeFis);
    if (eveniment == "change" || eveniment == "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
})




function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    console.log(continut)
    obGlobal.obErori = JSON.parse(continut)
    console.log(obGlobal.obErori)

    obGlobal.obErori.eroare_default.imagine = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori)

}
initErori()

function initImagini() {
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini) {
        [numeFis, ext] = imag.fisier.split(".");
        let caleFisAbs = path.join(caleAbs, imag.fisier);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu = path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp")
        imag.fisier = path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier)

    }
    console.log(obGlobal.obImagini)
}
initImagini();


function initImagini() {
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini) {
        [numeFis, ext] = imag.fisier.split(".");
        let caleFisAbs = path.join(caleAbs, imag.fisier);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu = path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp")
        imag.fisier = path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier)

    }
    console.log(obGlobal.obImagini)
}
initImagini();

function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.info_erori.find(function (elem) {
        return elem.identificator == identificator
    });
    if (eroare) {
        if (eroare.status)
            res.status(identificator)
        var titluCustom = titlu || eroare.titlu;
        var textCustom = text || eroare.text;
        var imagineCustom = imagine || eroare.imagine;


    }
    else {
        var err = obGlobal.obErori.eroare_default
        var titluCustom = titlu || err.titlu;
        var textCustom = text || err.text;
        var imagineCustom = imagine || err.imagine;


    }
    res.render("pagini/eroare", { //transmit obiectul locals
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
    })

}

app.use("/*", function(req, res, next){
    res.locals.optiuniMeniu=obGlobal.optiuniMeniu;
    next();
})

app.use("/resurse", express.static(path.join(__dirname, "resurse")))
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")))

app.get("/favicon.ico", function (req, res) {
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"))
})

app.get(["/", "/index", "/home"], function (req, res) {
    res.render("pagini/index", { ip: req.ip, imagini: obGlobal.obImagini.imagini });
})
app.get("/pagina_galerie", function (req, res) {
    res.render("pagini/pagina_galerie", { ip: req.ip, imagini: obGlobal.obImagini.imagini });
})

// app.get("/despre", function(req, res){
//     res.render("pagini/despre");
// })

app.get("/index/a", function (req, res) {
    res.render("pagini/index");
})


app.get("/cerere", function (req, res) {
    res.send("<p style='color:blue'>Buna ziua</p>")
})


app.get("/fisier", function (req, res, next) {
    res.sendfile(path.join(__dirname, "package.json"));
})


app.get("/abc", function (req, res, next) {
    res.write("Data curenta: ")
    next()
})

app.get("/abc", function (req, res, next) {
    res.write((new Date()) + "")
    res.end()
    next()
})


app.get("/abc", function (req, res, next) {
    console.log("------------")
})


app.get("/produse", function(req, res){
    console.log(req.query)
    var conditieQuery=""; // TO DO where din parametri
    if (req.query.tip){
        conditieQuery=` where categorie='${req.query.tip}'`
    }

    // Query for categorie (main category)
    let queryOptiuni = "select * from unnest(enum_range(null::categorie_mare))";
    // Query for subcategorie (distinct subcategorie from produse)
    let queryOptiuniSubcategorie = "select distinct subcategorie from produse order by subcategorie";

    client.query(queryOptiuni, function(err, rezOptiuni){
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
            return;
        }
        client.query(queryOptiuniSubcategorie, function(err, rezOptiuniSubcategorie){
            if (err) {
                console.log(err);
                afisareEroare(res, 2);
                return;
            }
            let queryProduse = "select * from produse" + conditieQuery;
            client.query(queryProduse, function(err, rez){
                if (err){
                    console.log(err);
                    afisareEroare(res, 2);
                }
                else{
                    res.render("pagini/produse", {
                        produse: rez.rows,
                        optiuni: rezOptiuni.rows,
                        optiuniSubcategorie: rezOptiuniSubcategorie.rows 
                    })
                }
            })
        });
    });
});

app.get("/produs/:id", function(req, res){
    console.log(req.params)
    client.query(`select * from produse where id=${req.params.id}`, function(err, rez){
        if (err){
            console.log(err);
            afisareEroare(res, 2);
        }
        else{
            if (rez.rowCount==0){
                afisareEroare(res, 404);
            }
            else{
                res.render("pagini/produs", {prod: rez.rows[0]})
            }
        }
    })
})

app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function (req, res, next) {
    afisareEroare(res, 403);
})


app.get("/*.ejs", function (req, res, next) {
    afisareEroare(res, 400);
})


app.get("/*", function (req, res, next) {
    try {
        res.render("pagini" + req.url, function (err, rezultatRandare) {
            if (err) {
                if (err.message.startsWith("Failed to lookup view")) {
                    afisareEroare(res, 404);
                }
                else {
                    afisareEroare(res);
                }
            }
            else {
                console.log(rezultatRandare);
                res.send(rezultatRandare)
            }
        });
    }
    catch (errRandare) {
        if (errRandare.message.startsWith("Cannot find module")) {
            afisareEroare(res, 404);
        }
        else {
            afisareEroare(res);
        }
    }
})



app.listen(8080);

console.log("Serverul a pornit")


