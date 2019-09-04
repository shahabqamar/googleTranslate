# googleTranslate

googleTranslate is a JavaScript library to use with Google Cloud Translation API (v3beta1) for webpages. It is meant to provide a replacement for now deprecated Google Translate for websites: https://translate.google.com/intl/en/about/website. 

## Usage

1. **Include the script**

Include googleTranslate on your website (ideally in the `<HEAD>` section) using a script tag:

```
<script type="text/javascript src="path_to_file/googleTranslate.js"></script>
```

2. **Initialize googleTranslate**

Call the `init` method and pass the configuration:

``` Javascript
googleTranslate.init({
    apiProxy: "URL_to_authenticated_API_endpoint",
    sourceLanguage: "en",
});

```

> googleTranslate does not handle API authentication. You will need to provide googleTranslate with a proxy URL which is already authenticated with with the Google Cloud Translation API `apiProxy` over OAuth 2.0. The proxy URL should forward the incoming POST payload from googleTranslate along with the valid OAuth 2.0 headers.

To change the language, call `googleTranslate.setTargetLanguage` method with the target language code. E.g. for French:

```Javascript
googleTranslate.setTargetLanguage('fr');
```

The `googleTranslate.setTargetLanguage` method returns a promise which can be used to detect completion of page translation action. This can be useful if you want to show a loading screen or graphic as googleTranslate can take a few seconds to complete the translation process. 

Language preference is stored in `localStorage` with the key of `gTranslate_lang`. This is useful to keep the user preference persistent as they navigate from page to page on your website. To retrieve the language preference, simply run: 

``` Javascript
var langPreference = localStorage.getItem('gTranslate_lang');
```

A more complete example with a select dropdown: 

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
var langSelectField = document.getElementById('select-lang');
langSelectField.value = localStorage.getItem('googleTranslate_lang');

langSelectField.addEventListener('change', function(e) {
    var translatePromise = googleTranslate.setTargetLanguage(e.target.value);
    console.log("translating...");
    translatePromise.then(function(response) {
      if(response) {
          console.log('translation completed')
      } else {
          console.log('translation failed');
      }
    }); 
});
```


