#!/usr/bin/env node

const yargs = require("yargs");
var nodeDir= require('node-dir');
var axios= require('axios').default;
var log= require('noogger');
var fs= require('fs');
const { fstat } = require('fs');
const { type } = require('os');
var fileCount=0;
var strCount= 0;
var trCount=0;
var failedTrCount=0;
var dupesCount= 0;
var tr_object= {};

const options = yargs
 .usage("Usage: lazytranslate -d <scan-directory> -o <output-file-path>")
 .option("d", { alias: "scan-directory", describe: "Directory to scan for files containing strings to be translated. the scan is recursive.", type: "string", demandOption: true })
 .option("o", { alias: "output", describe: "Ouput language file path (write full path with file name and extension). If a file already exists at the specified location, it will just be updated, and existing translation, will not be overriden", type: "string", demandOption: true })
 .option("s", { alias: "source", describe: "Source language", type: "string", demandOption: false })
 .option("t", { alias: "target", describe: "Target language", type: "string", demandOption: false })
 .option("a", { alias: "auto-translate", describe: "Activate automatic translation. This uses free API language translation service which is not very accurate, you will still need to cross check and correct things.", type: "boolean", demandOption: false })
 .option("i", { alias: "include", describe: "comma separated list of file extensions to target. If omitted, lazyTranslate will become less lazy and parse every single file under the specified scan-directory; and that recursively.", type: "array", demandOption: false })
 .argv;

console.log(options);

var languageServers= [
    "https://libretranslate.de",
    "https://translate.mentality.rip",
    "https://translate.argosopentech.com",
    "https://translate.astian.org"
];

var activeLangServers= languageServers;



const TRANSLATE_STRING_PATTERN = /__\(['"](.*?)['"]\)/g;    // Apply any REGEX here as you see fit to match different lang system
const TRANSLATE_FROM= options.source;                                 //  set to source language code eg. 'fr', 'en'
const TRANSLATE_INTO= options.target;                                 //  set to target language code eg. 'fr', 'en'.... or false to disable  translation
var directory= options.scanDirectory;
var includeFiles= options.include || [];
var outputFile=options.output;
var autoTranslate=options.autoTranslate;



if(fs.existsSync(outputFile)) {
    log.notice("A language file already exist at "+outputFile+"\n I'm gonna update it!");
    let oldFile= fs.readFileSync(outputFile,{encoding:'utf-8'});
    tr_object= JSON.parse(oldFile);
}
else
log.notice("NO language file found at "+outputFile+"\n I'm gonna create a brand new file!");

nodeDir.files(directory, function(err, filePaths) {
    if (err) throw err;
    // sort ascending
    filePaths.sort();
    
    let pattern= '(\\'+ includeFiles.join('|\\')+')$';
    var includeRE = new RegExp(pattern);
    // include only certain filenames
    filePaths = filePaths.filter(function (file) {
       return includeRE.test(file);
    });    
    // exclude some filenames
    fileCount=filePaths.length;
    log.info(filePaths);
    log.info(fileCount+" files found!\n\n Go get yoself a cup of tea or coffe, by the time you're back i'll be done! or not 😂 in that case you might as well go for lunch.\n\n Anyways gotta work now!");
    
    filePaths.forEach(path => {
        var txt= fs.readFileSync(path,{"encoding":"utf-8"});
        while(null != (result=TRANSLATE_STRING_PATTERN.exec(txt))) {
            let tr_string= result[1].trim();
            if(typeof tr_object[tr_string] !=='undefined') dupesCount++; // not very accurate but who cares? 
            else tr_object[tr_string]="";
            // log.info(result[0]+" => "+tr_string); 
            strCount++;
        }
    });

    var idx= 0;
    var serversNo= activeLangServers.length;
    var tr_strings= Object.keys(tr_object);
   
    if(autoTranslate) {
        if( !(TRANSLATE_FROM && TRANSLATE_INTO) ){
            log.error("unsufficient parameters to perform auto translation, please specify source and target language.");
            return;
        }

        log.notice("Alright! Lets now translate this mess");
        translateNextString();
    }
    else writeLangFile();
    
    function translateNextString() {
        if(trCount== tr_strings.length) {
            writeLangFile();
            return;
        }
        tr_string= tr_strings[trCount++];
        if(!tr_object[tr_string]) {
            idx= (idx < serversNo-1) ? idx : 0; 
            let url=activeLangServers[idx++];
            axios.post(url+"/translate", {
                q: tr_string,
                source: TRANSLATE_FROM,
                target: TRANSLATE_INTO
            })
            .then( function (resp) {
                log.info(tr_string +' ['+TRANSLATE_FROM+']');
                log.notice("-> "+resp.data.translatedText +' ['+TRANSLATE_INTO+']');
                tr_object[tr_string]=resp.data.translatedText;
                translateNextString();
            })
            .catch(function (err) {
                log.error(err);
                failedTrCount++;
                tr_object[tr_string]=resp.data.translatedText;
                
            });      
        }
        else translateNextString();
    }
    
});
 
function writeLangFile() {
    let output=  JSON.stringify(tr_object, null, 4);

    fs.writeFile(outputFile, output, function(err) {
        if (err) throw err;
        else{
           log.notice("Successfully generated language file at "+outputFile);
           log.notice(strCount+" strings found in "+fileCount+" files");
           log.notice(dupesCount+" duplicates "+ (strCount-dupesCount)+" unique strings");
           log.notice("Auto translated "+trCount+" strings failed to translate "+failedTrCount+"strings");
           log.info("Launch the script again to retry translating untranslated strings");
           process.exitCode =0;
        } 
    })
}



