/*
 * Polyfills (.forEach & .includes for older IE versions)
 */

if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function(callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        value: function(searchElement, fromIndex) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return (
                    x === y ||
                    (typeof x === "number" &&
                        typeof y === "number" &&
                        isNaN(x) &&
                        isNaN(y))
                );
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                // c. Increase k by 1.
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}

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
    mutatationIds: [],
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
    traverseTextNodes: function traverseTextNodes(el) {
        var nodeList =
            arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : this.nodeList;
        var nodeTextList =
            arguments.length > 2 && arguments[2] !== undefined
                ? arguments[2]
                : this.nodeTextList;
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
    translate: function translate() {
        var nodeList =
            arguments.length > 0 && arguments[0] !== undefined
                ? arguments[0]
                : this.nodeList;
        var nodeTextList =
            arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : this.nodeTextList;
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
    mutationListener: function mutationListener(targetNode) {
        var config = {
            childList: true,
            subtree: true
        };

        var callback = function(mutationsList, observer) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (
                    var _iterator = mutationsList[Symbol.iterator](), _step;
                    !(_iteratorNormalCompletion = (_step = _iterator.next())
                        .done);
                    _iteratorNormalCompletion = true
                ) {
                    var mutation = _step.value;

                    if (mutation.type === "childList") {
                        var element = document.getElementById(
                            mutation.target.id
                        );
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
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (
                        !_iteratorNormalCompletion &&
                        _iterator.return != null
                    ) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }.bind(this);

        var observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    },

    /**
     * Set target language by triggering translation API call
     * Persist language preference to localStorage
     * @param {string} langCode -  language code in ISO format
     * @return {promise} - return a promise (resolve to a boolean value)
     */
    setTargetLanguage: function setTargetLanguage(langCode) {
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
    init: function init(config) {
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
        var targetLanguage = localStorage.getItem("gTranslate_lang"); //check lang pref. and set if different from src lang

        if (targetLanguage !== null && targetLanguage !== this.sourceLanguage) {
            $("#google_translate_popup").fadeIn();
            return this.setTargetLanguage(targetLanguage);
        } else {
            return new Promise(function(resolve, reject) {
                resolve(true);
            });
        } //attach events

        if (config.observeMutationsOn.length > 0) {
            config.observeMutationsOn.forEach(
                function(el) {
                    this.mutationListener(el);
                }.bind(this)
            );
        }
    }
};
