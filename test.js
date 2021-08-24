var axios= require('axios').default;
var log= require('noogger');

var languageServers= [
    "https://libretranslate.de",
    "https://translate.mentality.rip",
    "https://translate.argosopentech.com",
    "https://translate.astian.org"
];

let activeLangServers= [];

function updateLanguageServers() {
    languageServers.forEach(server => {
        axios.post(server+"/detect", {q: "Hello"})
        .then( function (resp) {
            if(resp.data[0].language) {
                log.notice(server+" is available");
                activeLangServers.push(server);
            }
        })
        .catch(function (err) {
            console.log(err);
        });
    });
}

// updateLanguageServers();

/*

const res = axios.post("https://translate.astian.org/translate", {
    q: "Hello",
    source: "en",
    target: "fr"
})
.then( function (resp) {
    console.log(resp.data);
})
.catch(function (err) {
    console.log(err);
});

*/

const greeting = `Hello, ${options.name}!`;
console.log(options);