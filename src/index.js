const fs = require("fs");
let clearfunc;
let check = null
let deleteEventCheck = null
let data;
let type;

const writeFileWithDirs = ((data, path) => {
    const dirs = path.split("/").slice(1, -1);

    if (dirs.length === 0) {
        fs.writeFileSync(path, data, "utf-8");
    } else {
        const dirsLength = dirs.length;
        const processedDirs = [];
        let i = 0;

        while (i < dirsLength) {
            processedDirs.push(dirs[i]);
            const currentPath = `./${processedDirs.join("/")}`;

            if (!fs.existsSync(currentPath) || !fs.lstatSync(currentPath).isDirectory()) {
                fs.mkdirSync(currentPath);
            }

            i++;
        }

        fs.writeFileSync(path, data, "utf-8");
    }
});
const EventEmitter = require("events")
module.exports = class database extends EventEmitter{
    constructor(filePath) {
      super();
        this.jsonFilePath = filePath || "./falsisdb/database.json";
        this.data = {};

        if (!fs.existsSync(this.jsonFilePath) || !fs.lstatSync(this.jsonFilePath).isFile()) {
            writeFileWithDirs("{}", this.jsonFilePath);
        } else {
            this.fetchDataFromFile();
        }
       setInterval(() => {
          if(check != null){
        this.emit('dataSet', check)
        check = null
          } else if(deleteEventCheck != null) {
            this.emit('dataDelete', deleteEventCheck)
            deleteEventCheck = null
          }
        }, 5000)
    }
    fetchDataFromFile() {
        let savedData;

        try {
          savedData = JSON.parse(fs.readFileSync(this.jsonFilePath));
        } catch(error) {}

        this.data = savedData;
    }

    kaydet() {
        writeFileWithDirs(JSON.stringify(this.data, null, 2), this.jsonFilePath);
    }
    
    get(key) {
        if(!key) {
          throw Error("Getirilicek Veriyi Gir!")
        } else {
        return this.data[key];
     }
    }

    fetch(key) {
        if(!key) throw Error("Getirilicek Veriyi Gir!")
        return this.data[key];
    }
    has(key, returnValue=false) {
        if(!key) throw Error("Şartlanacak Veriyi Gir!")
        
        if(returnValue === false){
        return Boolean(this.data[key]);
        } else {
          let result = Boolean(this.data[key]);
          let values = Object.entries(JSON.parse(fs.readFileSync(this.jsonFilePath, "utf-8"))).filter(x=>x[0] === key).map(x=>x[1])
          
          return{
            result:result,
            values:values
          }
        }
    }

    set(key, value) {
       const old = this.data[key]
        if(!key) {
          throw Error("Değiştirilicek Veriyi Gir!")
        }
        else if(!value) {
          throw Error("Değişicek Veriyi Gir!")
        } else {
        this.data[key] = value;
        this.kaydet();
        data = value
        type = "set"
        check = {
          key: key,
          changed: old == this.data[key] ? false : true,
          oldValue: old,
          value: value
        }
        }
    }

    delete(key) {
      const val = this.data[key]
        if(!key) {
          throw Error("Silinicek Veriyi Gir!")  
        } else {
        delete this.data[key];
        this.kaydet();
        data = key
        type = "delete"
        deleteEventCheck = {
          key: key,
          value:val
        }
        }
    }

    conc(key, count) {
        if(!key) {
          throw Error("Ekleme Yapılacak Veriyi Gir!")
        }
        if(!count) {
          throw Error("Eklenecek Veriyi Gir!")
        }
        if (!this.data[key]) {
          this.data[key] = count;
        } else {
          this.data[key] += count.toString();
        }

        this.kaydet();
        data = count
        type = "conc"
    }

    multi(key, count) {
        if(!key) {
          throw Error("Silinme Yapılacak Veriyi Gir!")
        }
        if(!count) {
          throw Error("Silinecek Veriyi Gir!")
        }
        if(isNaN(this.data[key]) == true){
          throw Error("Lütfen bir sayı belirtin.")
          }
        if (!this.data[key]) {
          this.data[key] = count;
        } else {
          this.data[key] *= count;
        }
        this.kaydet();
        data = count
        type = "multi"
    }

    divide(key, count) {
        if(!key) {
          throw Error("Bölünme Yapılacak Veriyi Gir!")
        }
        if(!count) {
          throw Error("Bölünecek Veriyi Gir!")
        }
        if(isNaN(this.data[key]) == true){
            throw Error("Lütfen bir sayı belirtin.")
        }
        if (!this.data[key]) {
          this.data[key] = count;
        } else {
          this.data[key] /= count;
        }

        this.kaydet();
        data = count
        type = "divide"
    }

    sum(key, count) {
        if(!key) {
          throw Error("Ekleme Yapılacak Veriyi Gir!")
        }
        if(!count) {
          throw Error("Eklenecek Veriyi Gir!")
        }
        if(isNaN(this.data[key]) == true){
            throw Error("Lütfen bir sayı belirtin.")
        }
        if (!this.data[key]) {
          this.data[key] = +count;
          } else {
          this.data[key] += count;
        }

        this.kaydet();
        data = count
        type = "sum"
    }

    sub(key, count) {
        if(!key) {
          throw Error("Çıkarma Yapılacak Veriyi Gir!")
        }
        if(!count) {
          throw Error("Çıkarılacak Veriyi Gir!")
        }
        if(isNaN(this.data[key]) == true){
            throw Error("Lütfen bir sayı belirtin.")
        }
        if (!this.data[key]) {
          this.data[key] = -count;
        } else {
          this.data[key] -= count;
        }

        this.kaydet();
        data = count
        type = "sum"
    }
    push(key, element) {
        if(!key) {
          throw Error("Array Adını Gir!")
        }
        if(!element) {
          throw Error("Array Verisini Gir!")
        }
        if (!this.data[key]) {
          this.data[key] = [];
        }
        if(!Array.isArray(this.data[key])){
          throw Error("Girilen verinin değeri bir array değil.")
        } else {
        this.data[key].push(element)
        this.kaydet();
        data = element
        type = "push (array)"
        }
      }


    clear() {
        this.data = {};
        this.kaydet();
                if(clearfunc){ 
        eval(clearfunc)  //dataClear event created by falsis
        }
    }
    
    sqrt(sayi) {
        if(isNaN(sayi) == true) {
            return("Lütfen karekökünü bulmak istediğiniz geçerli bir sayı giriniz")}
        if(!sayi) {
            throw new TypeError("Lütfen karekökünü bulmak istediğiniz sayıyı giriniz.")
        }else{
            return Math.sqrt(sayi)}
};
    
math(key , islem , key2) {
        if(!key) throw new TypeError("Birinci Sayıyı Gir!")
        if(!key2) throw new TypeError("İkinci Sayıyı Gir!")
        if(!islem) throw new TypeError("İşlemi Gir!")
        let sayı = parseInt(key)
        let sayı2 = parseInt(key2)       
        if(islem=="+") {
        return sayı + sayı2
        }     
        if(islem=="-") {
        return sayı - sayı2
    }       
        if(islem=="*" || islem=="x"){
        return sayı * sayı2
    }
        if(islem=="/" || islem==":") {
        return sayı / sayı2}
        else {
        throw Error("Tanımsız İşlem!")}}
        random(key){
            if(!key) throw Error("Max Kaç oluşabileceğini Gir!")
            return Math.floor((Math.random() * key) + 1);
        }
    
   get info(){
        return{
            name: "falsisdb",
            type:"database",
            version: "3.0.0",
            owner: "falsisdev",
            developers: ["falsisdev", "lunexdev", "berat141"],
            github: "https://github.com/falsisdev/falsisdb",
            commands: `${Object.entries("./src/index.js").length}`,
            file: this.jsonFilePath,
            lastdata: {
            data: data || null,
            type: type || null
        }
        }
    }
     includes(key) {
        if(!key) {
            throw new TypeError("Lütfen database dosyasında aramak istediğiniz veri adını girin.") //falsis kzgın 😎
        }
        return fs.readFileSync(this.jsonFilePath).includes(key)
    }
        all() {
        if(!this.jsonFilePath) {
            throw new TypeError("Database Dosyası Ayarlanmamış, okunacak dosya bulunamadı!")
        }
         return fs.readFileSync(`${this.jsonFilePath}`, "utf8")
        }
        includesKey(key) {
          if(!key) {
            throw new Error("Veri anahtarı belirtilmemiş.")
          } else {
          return Object.entries(JSON.parse(fs.readFileSync(this.jsonFilePath, "utf-8")))
          .filter(x=>x[0].includes(key)).length === 0 ? false : true
          }
        }
        includesValue(value) {
          if(!value) {
            throw new Error("Veri değeri belirtilmemiş.")
          } else {
          return Object.entries(JSON.parse(fs.readFileSync(this.jsonFilePath, "utf-8")))
          .filter(x=>x[1].includes(value)).length === 0 ? false : true
          }
        }
        
        hasValue(value, returnKey=false){
          if(!value){
            throw new Error("Değer belirtilmemiş.")
          }
          
          if(returnKey == false){
          return Object.entries(JSON.parse(fs.readFileSync(this.jsonFilePath, "utf-8")))
          .filter(x=>x[1] === value).length === 0 ? false : true
          } else {
            let result = Object.entries(JSON.parse(fs.readFileSync(this.jsonFilePath, "utf-8")))
          .filter(x=>x[1] === value).length === 0 ? false : true
           
           let keys = Object.entries(JSON.parse(fs.readFileSync(this.jsonFilePath, "utf-8")))
          .filter(x=>x[1] === value).map(x=>x[0])
          
            return{
              result:result,
              keys: keys
            }
          }
        }
        
       keys(){
          return Object.entries(JSON.parse(fs.readFileSync(this.jsonFilePath, "utf-8"))).map(x=>x[0])
        }
        
       values(){
          return Object.entries(JSON.parse(fs.readFileSync(this.jsonFilePath, "utf-8"))).map(x=>x[1])
        }
    
    all(){
         this.fetchDataFromFile()
         return this.data
        }
        
        find(fn, thisArg) {
           this.fetchDataFromFile()
let res = {};
if(thisArg) fn = fn.bind(thisArg);
for(const [key,val] of Object.entries(this.data)){
if(fn(val,key,this.data)){
res[key] = val
break;
} else continue
}
return res
}
filter(fn, thisArg) {
  this.fetchDataFromFile()
let res = {};
if(thisArg) fn = fn.bind(thisArg);
for(const [key,val] of Object.entries(this.data)){
if(fn(val,key,this.data))
res[key] = val
}
return res
}

filterKey(fn, thisArg) {
let res = [];
if(thisArg) fn = fn.bind(thisArg);
for(const [key,val] of Object.entries(this.data)){
if(fn(key,val,this.data))
res.push(key)
}
return res
}

findKey(fn, thisArg) {
let res = [];
if(thisArg) fn = fn.bind(thisArg);
for(const [key,val] of Object.entries(this.data)){
if(fn(key,val,this.data)){
res.push(key)
break;
} else continue
}
return res
}
    }
