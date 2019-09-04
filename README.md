# gTranslate

gTranslate is a JavaScript library to use with Google Cloud Translation API (v3beta1) for webpages. It is meant to provide a replacement for now deprecated Google Translate for websites: https://translate.google.com/intl/en/about/website. 

## Usage

1. Include the script

Include gTranslate on your website (ideally in the `<HEAD>` section) using a script tag:

```
<script type="text/javascript src="path_to_file/gTranslate.js"></script>
```

2. Initialize gTranslate

Call the `init` method and pass the configuration:

``` Javascript
gTranslate.init({
    apiProxy: "URL_to_authenticated_API_endpoint",
    sourceLanguage: "en",
});

```

To change the language, call `gTranslate.setTargetLanguage` method with the target language code. E.g. for French:

```Javascript
gTranslate.setTargetLanguage('fr');
```



