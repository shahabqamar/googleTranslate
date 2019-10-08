# googleTranslate

googleTranslate is a JavaScript library which uses with Google Cloud Translation API (v3beta1) to translate webpages. It is meant to provide a replacement/alternative for the now deprecated Google Translate for websites: https://translate.google.com/intl/en/about/website.

> googleTranslate does not handle API authentication. You will need to provide googleTranslate with a proxy URL as part of configuration i.e. `apiProxy`. This URL should forward the incoming POST payload from `googleTranslate` along with the valid OAuth 2.0 headers and API key param if set to be required by Google Cloud Translation API.

An example of `POST` payload send by googleTranslate to `proxyApi` endpoint:

```JSON
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

```JSON
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

```html
<script type="text/javascript" src="./path/googleTranslate.js"></script>
```

2. **Initialize googleTranslate**

Call the `init` method and pass the required configuration:

```Javascript
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

```Javascript
var langPreference = localStorage.getItem('gTranslate_lang');
```

## Handling language change

The following example shows how a user can switch the language based on a `<select>` field:

**HTML**

```html
<select id="select-lang">
    <option value="en">English</option>
    <option value="fr">French</option>
    <option value="ru">Russian</option>
</select>
```

**JavaScript**

```Javascript
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

**A more complete JavaScript Example (using jQuery)**

```css
#google_translate_popup {
    position: fixed;
    z-index: 999;
    background: white;
    top: 0;
    right: 50%;
    padding: 1rem;
    border: 1px solid #fafafa;
    display: none;
}
```

```html
<script>
    window.googleTranslateApiProxy = "https://authenticated_api_endpoint";
</script>
```

```Javascript
(function ($) {

  $("body").append('<div id="google_translate_popup">Translating...</div>');

  var errorMsg = "There was a problem with translating this page. Please refresh the page and try again. If the problem persists, please contact the website administrator."

  if (document.getElementById("select-lang") !== null) {
    var gtranslateInit = googleTranslate.init({
      apiProxy: window.googleTranslateApiProxy,
      //set as a global var in Head
      excludeElements: [document.getElementById("select-lang")],
      sourceLanguage: "en"
    });
    gtranslateInit.then(function (response) {
      $("#google_translate_popup").fadeOut();

      if (!response) {
        alert(errorMsg);
      }
    });
    var langSelectField = document.getElementById("select-lang");

    if (localStorage.getItem("gTranslate_lang") !== null && localStorage.getItem("gTranslate_lang") !== "") {
      langSelectField.value = localStorage.getItem("gTranslate_lang");
    }

    langSelectField.addEventListener("change", function (e) {
      if (e.target.value !== "" && e.target.value !== "Select language") {
        var translatePromise = googleTranslate.setTargetLanguage(e.target.value);
        $("#google_translate_popup").fadeIn();
        translatePromise.then(function (response) {
          $("#google_translate_popup").fadeOut();

          if (!response) {
            alert(errorMsg);
          }
        });
      }
    });
  }
})(jQuery);

```

## Configuration options

| param                | type         | default         | description                                                                                                                                                                                                                                                                                                                                                        | Example                                                                                   |
| -------------------- | ------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `apiProxy`           | string       | `empty`         | `required` Authenticated endpoint URL: This URL should forward the incoming POST payload from googleTranslate along with the valid OAuth 2.0 headers and API key param if set to be required by Google Cloud Translation API.                                                                                                                                      | `https://www.domain.com/google-translate-api`                                             |
| `translationNode`    | object       | `document.body` | HTML element that requires translation.                                                                                                                                                                                                                                                                                                                            | `document.getElementById("#banner")`                                                      |
| `observeMutationsOn` | object array | `[]`            | An array of HTML elements that should be translated if they mutate.                                                                                                                                                                                                                                                                                                | `[document.getElementById("#banner"), document.getElementById("#main-content") ]`         |
| `excludeElements`    | object array | `[]`            | An array of element that should not be translated.                                                                                                                                                                                                                                                                                                                 | `[document.getElementById("#user-profile"), document.getElementById("#hidden-element") ]` |
| `sourceLanguage`     | string       | `empty`         | `optional but recommended`. The BCP-47 language code of the input text if known, for example, "en-US" or "sr-Latn". Supported language codes are listed in Language Support of Google Cloud Translate. If the source language isn't specified, the API attempts to identify the source language automatically and returns the source language within the response. | `en`                                                                                      |
| `targetLanguage`     | string       | `empty`         | `required` The BCP-47 language code to use for translation of the input text, set to one of the language codes listed in Language Support of Google Cloud Translate.                                                                                                                                                                                               | `fr`                                                                                      |


## Translation select field

Below is an example of a select field containing all supported languages with their codes (as of 8th Oct 2019):

```html
<select name="translate" id="select-lang">
    <option selected="selected">Select language</option>
    <option value="af">Afrikaans</option>
    <option value="sq">Albanian</option>
    <option value="am">Amharic</option>
    <option value="ar">Arabic</option>
    <option value="hy">Armenian</option>
    <option value="az">Azerbaijani</option>
    <option value="eu">Basque</option>
    <option value="be">Belarusian</option>
    <option value="bn">Bengali</option>
    <option value="bs">Bosnian</option>
    <option value="bg">Bulgarian</option>
    <option value="ca">Catalan</option>
    <option value="ceb">Cebuano</option>
    <option value="zh-CN">Chinese (Simplified)</option>
    <option value="zh-TW">Chinese (Traditional)</option>
    <option value="co">Corsican</option>
    <option value="hr">Croatian</option>
    <option value="cs">Czech</option>
    <option value="da">Danish</option>
    <option value="nl">Dutch</option>
    <option value="en">English</option>
    <option value="eo">Esperanto</option>
    <option value="et">Estonian</option>
    <option value="fi">Finnish</option>
    <option value="fr">French</option>
    <option value="fy">Frisian</option>
    <option value="gl">Galician</option>
    <option value="ka">Georgian</option>
    <option value="de">German</option>
    <option value="el">Greek</option>
    <option value="gu">Gujarati</option>
    <option value="ht">Haitian Creole</option>
    <option value="ha">Hausa</option>
    <option value="haw">Hawaiian</option>
    <option value="he">Hebrew</option>
    <option value="hi">Hindi</option>
    <option value="hmn">Hmong</option>
    <option value="hu">Hungarian</option>
    <option value="is">Icelandic</option>
    <option value="ig">Igbo</option>
    <option value="id">Indonesian</option>
    <option value="ga">Irish</option>
    <option value="it">Italian</option>
    <option value="ja">Japanese</option>
    <option value="jw">Javanese</option>
    <option value="kn">Kannada</option>
    <option value="kk">Kazakh</option>
    <option value="km">Khmer</option>
    <option value="ko">Korean</option>
    <option value="ku">Kurdish</option>
    <option value="ky">Kyrgyz</option>
    <option value="lo">Lao</option>
    <option value="la">Latin</option>
    <option value="lv">Latvian</option>
    <option value="lt">Lithuanian</option>
    <option value="lb">Luxembourgish</option>
    <option value="mk">Macedonian</option>
    <option value="mg">Malagasy</option>
    <option value="ms">Malay</option>
    <option value="ml">Malayalam</option>
    <option value="mt">Maltese</option>
    <option value="mi">Maori</option>
    <option value="mr">Marathi</option>
    <option value="mn">Mongolian</option>
    <option value="my">Myanmar (Burmese)</option>
    <option value="ne">Nepali</option>
    <option value="no">Norwegian</option>
    <option value="ny">Nyanja (Chichewa)</option>
    <option value="ps">Pashto</option>
    <option value="fa">Persian</option>
    <option value="pl">Polish</option>
    <option value="pt">Portuguese (Portugal, Brazil)</option>
    <option value="pa">Punjabi</option>
    <option value="ro">Romanian</option>
    <option value="ru">Russian</option>
    <option value="sm">Samoan</option>
    <option value="gd">Scots Gaelic</option>
    <option value="sr">Serbian</option>
    <option value="st">Sesotho</option>
    <option value="sn">Shona</option>
    <option value="sd">Sindhi</option>
    <option value="si">Sinhala (Sinhalese)</option>
    <option value="sk">Slovak</option>
    <option value="sl">Slovenian</option>
    <option value="so">Somali</option>
    <option value="es">Spanish</option>
    <option value="su">Sundanese</option>
    <option value="sw">Swahili</option>
    <option value="sv">Swedish</option>
    <option value="tl">Tagalog (Filipino)</option>
    <option value="tg">Tajik</option>
    <option value="ta">Tamil</option>
    <option value="te">Telugu</option>
    <option value="th">Thai</option>
    <option value="tr">Turkish</option>
    <option value="uk">Ukrainian</option>
    <option value="ur">Urdu</option>
    <option value="uz">Uzbek</option>
    <option value="vi">Vietnamese</option>
    <option value="cy">Welsh</option>
    <option value="xh">Xhosa</option>
    <option value="yi">Yiddish</option>
    <option value="yo">Yoruba</option>
    <option value="zu">Zulu</option>
</select>
```