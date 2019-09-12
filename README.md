# googleTranslate

googleTranslate is a JavaScript library which uses with Google Cloud Translation API (v3beta1) to translate webpages. It is meant to provide a replacement/alternative for the now deprecated Google Translate for websites: https://translate.google.com/intl/en/about/website. 

> googleTranslate does not handle API authentication. You will need to provide googleTranslate with a proxy URL as part of configuration i.e. `apiProxy`. This URL should forward the incoming POST payload from `googleTranslate` along with the valid OAuth 2.0 headers and API key param if set to be required by Google Cloud Translation API.

An example of `POST` payload send by googleTranslate to `proxyApi` endpoint: 

``` JSON
{
    "sourceLanguageCode":"en",
    "targetLanguageCode":"fr",
    "mimeType":"text/plain",
    "contents":[
        "Hello",
        "World"
    ]
}
```

Expected response from `proxyApi`: 

``` JSON
{
  "translations": [
    {
      "translatedText": "Bonjour"
    },
    {
      "translatedText": "Monde"
    }
  ]
}
```

## Usage

1. **Include the script**

Include googleTranslate on your website (ideally in the `<HEAD>` section) using a script tag:

``` html
<script type="text/javascript" src="./path/googleTranslate.js"></script>
```

2. **Initialize googleTranslate**

Call the `init` method and pass the required configuration:

``` Javascript
googleTranslate.init({
    apiProxy: "URL_to_authenticated_API_endpoint",
    sourceLanguage: "en",
});

```

3. **Translate**

To change the language, call `googleTranslate.setTargetLanguage` method with the target language code. E.g. for French:

```Javascript
googleTranslate.setTargetLanguage('fr');
```

The `googleTranslate.setTargetLanguage` method returns a promise which can be used to detect completion of page translation action. This can be useful if you want to show a loading screen or graphic as googleTranslate can take a few seconds to complete the translation process. 

> Setting the translation back to source language after a translation triggers a page reload. 

## Persisting language preference

Language preference is stored in `localStorage` with the key of `gTranslate_lang`. This is useful to keep the user preference persistent as they navigate from page to page on your website. To retrieve the language preference, simply run: 

``` Javascript
var langPreference = localStorage.getItem('gTranslate_lang');
```

## Handling language change

The following example shows how a user can switch the language based on a `<select>` field: 

**HTML**
``` html
<select id="select-lang">
    <option value="en">English</option>
    <option value="fr">French</option>
    <option value="ru">Russian</option>
</select>
```

**JavaScript**
``` Javascript
//get <select id="select-lang"> element
var langSelectField = document.getElementById('select-lang');

//get language preference and set it as default value for language `<select>` field
langSelectField.value = localStorage.getItem('gTranslate_lang');

//listen for `<select>` change event
langSelectField.addEventListener('change', function(e) {

    //translate page
    var translatePromise = googleTranslate.setTargetLanguage(e.target.value);
    console.log("translating...");
    
    //promise returns a boolean 
    //indicating success/failure of translation
    translatePromise.then(function(response) {
      
      if(response) {
          console.log('translation completed')
      } else {
          console.log('translation failed');
      }

    }); 
});
```

## Configuration options