var googleTranslate = {
    /**
     * Config vars
     */
    apiProxy: "",
    translationNode: document.body,
    observeMutationsOn: [],
    nodeListSourceLanguage: [],
    nodeListTextLanguage: [],
    excludeElements: [],
    sourceLanguage: "",
    targetLanguage: "",

    nodeList: [],
    nodeTextList: [],
    mutationNodeList: [],
    mutationTextList: [],

    /**
     * Recursively traverse though DOM using a start node
     * @param {object} el - start traversing at DOM node
     * @param {arr} nodeList - array of DOM nodes
     * @param {arr} nodeTextList - array of DOM node text
     */
    traverseTextNodes: function(
        el,
        nodeList = this.nodeList,
        nodeTextList = this.nodeTextList
    ) {
        el.childNodes.forEach(
            function(el) {
                if (
                    !this.excludeElements.includes(el) &&
                    el.tagName !== "SCRIPT"
                ) {
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

    /**
     * Translate nodes (calls Google Translate API )
     * @param {arr} nodeList - array containing list of nodes to be translated
     * @param {arr} nodeTextList - array of text that requires translation
     * @return {promise} - return a promise (resolve to a boolean value)
     */

    translate: function(
        nodeList = this.nodeList,
        nodeTextList = this.nodeTextList
    ) {
        var request = new XMLHttpRequest();
        request.open("POST", this.apiProxy, true);
        request.setRequestHeader(
            "Content-Type",
            "application/json;charset=UTF-8"
        );

        return new Promise(
            function(resolve, reject) {
                request.onload = function() {
                    if (this.status >= 200 && this.status < 400) {
                        var resp = JSON.parse(this.response);

                        if (resp.error) {
                            console.log(resp.error);
                            resolve(false);
                        } else {
                            resp.translations.forEach(function(
                                translation,
                                index
                            ) {
                                nodeList[index].nodeValue =
                                    translation.translatedText;
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

    /**
     * Observe mutations on a node & its children
     * @param {object} targetNode - source node object
     */

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
                    this.translate(
                        this.mutationNodeList,
                        this.mutationTextListList
                    );
                }
            }
        }.bind(this);

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    },

    /**
     * Set target language by triggering translation API call
     * Persist language preference to localStorage
     * @param {string} langCode -  language code in ISO format
     * @return {promise} - return a promise (resolve to a boolean value)
     */

    setTargetLanguage: function(langCode) {
        localStorage.setItem("gTranslate_lang", langCode);

        if (
            langCode === this.sourceLanguage ||
            this.mutationNodeList.length > 0
        ) {
            location.reload();
            return new Promise(function(resolve, reject) {
                resolve(true);
            });
        }

        this.targetLanguage = langCode;

        return this.translate();
    },

    /**
     * Initialize Google Translate
     * @param {object} config - init config object
     * @return {promise} - return a promise (resolve to a boolean value)
     */

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

        //check lang pref. and set if different from src lang
        if (targetLanguage !== null && targetLanguage !== this.sourceLanguage) {
            $("#google_translate_popup").fadeIn();
            return this.setTargetLanguage(targetLanguage);
        } else {
            return new Promise(function(resolve, reject) {
                resolve(true);
            });
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
