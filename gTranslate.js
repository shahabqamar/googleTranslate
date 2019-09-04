var gTranslate = {
  //config & defaults
  apiProxy: "",
  translationNode: document.body,
  observeMutationsOn: [],
  nodeListSourceLanguage: [],
  nodeListTextLanguage: [],
  excludeElements: [],

  //load time nodes
  nodeList: [],
  nodeTextList: [],

  //traversedNodes
  mutationNodeList: [],
  mutationTextList: [],

  //mutations
  mutatationIds: [],
  mutationNodeList: [],
  mutationTextList: [],

  sourceLanguage: "",
  targetLanguage: "",

  //events
  onTranslating: null,
  onTranslationComplete: null,

  traverseTextNodes: function(
    el,
    nodeList = this.nodeList,
    nodeTextList = this.nodeTextList
  ) {
    el.childNodes.forEach(
      function(el) {
        if (!this.excludeElements.includes(el)) {
          // If this is a text node, replace the text
          if (el.nodeType === 3 && el.nodeValue.trim() !== "") {
            nodeList.push(el);
            nodeTextList.push(el.nodeValue.trim());
          } else {
            this.traverseTextNodes(el, nodeList, nodeTextList);
          }
        }
      }.bind(this)
    );
  },

  translate: function(
    nodeList = this.nodeList,
    nodeTextList = this.nodeTextList
  ) {
    var request = new XMLHttpRequest();
    request.open("POST", this.apiProxy, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    return new Promise(
      function(resolve, reject) {
        request.onload = function() {
          if (this.status >= 200 && this.status < 400) {
            var resp = JSON.parse(this.response);

            if (resp.error) {
              console.log(resp.error);
              resolve(false);
            } else {
              resp.translations.forEach(function(translation, index) {
                nodeList[index].nodeValue = translation.translatedText;
              });
              resolve(true);
            }
          } else {
            console.error("API Error: " + this.status);
            resolve(false);
          }
        };

        request.onerror = function() {
          console.error("Could not connect to API.");
        };

        request.send(
          JSON.stringify({
            sourceLanguageCode: this.sourceLanguage,
            targetLanguageCode: this.targetLanguage,
            mimeType: "text/plain",
            contents: nodeTextList
          })
        );
      }.bind(this)
    );
  },

  mutationListener: function(targetNode) {
    const config = {
      childList: true,
      subtree: true
    };

    const callback = function(mutationsList, observer) {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          var element = document.getElementById(mutation.target.id);
          this.mutationNodeList = [];
          this.mutationTextListList = [];

          this.traverseTextNodes(
            element,
            this.mutationNodeList,
            this.mutationTextListList
          );
          this.translate(this.mutationNodeList, this.mutationTextListList);
        }
      }
    }.bind(this);

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  },

  setTargetLanguage: function(langCode) {
    localStorage.setItem("gTranslate_lang", langCode);

    if (langCode === this.sourceLanguage) {
      location.reload();
      return new Promise(function(resolve, reject) {
        resolve(true);
      });
    }

    this.targetLanguage = langCode;

    return this.translate();
  },

  init: function(config) {
    //required
    this.apiProxy = config.apiProxy;
    this.sourceLanguage = config.sourceLanguage;

    if (config.node !== undefined) {
      this.translationNode = document.body;
    }

    if (config.excludeElements !== undefined) {
      this.excludeElements = config.excludeElements;
    }

    this.traverseTextNodes(this.translationNode);

    var targetLanguage = localStorage.getItem("gTranslate_lang");

    if (targetLanguage !== null && targetLanguage !== this.sourceLanguage) {
      this.setTargetLanguage(targetLanguage);
    }

    //attach events
    if (config.observeMutationsOn.length > 0) {
      config.observeMutationsOn.forEach(
        function(el) {
          this.mutationListener(el);
        }.bind(this)
      );
    }
  }
};
