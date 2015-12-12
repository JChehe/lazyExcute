/* 
 * @Author: ljc
 * @Date:   2015-12-10 14:19:21
 * @Last Modified by:   ljc
 * @Last Modified time: 2015-12-12 16:51:40
 */

var LazyExcute = (function() {

    function LazyExcute(elements, options) {
        this.elements = elements;
        this.tag = "data-src";
        this.handler = function() {};
        this.callback = null;
        this.distance = 0;
        this.pause = false;

        if (options && typeof options === "object") {
            for (var x in options) {
                this[x] = options[x];
            }
        }

        if (typeof elements === "string") {
            this.elements = document.querySelectorAll(elements);
        }
        var that = this;

        //  延时的目的是：当页面scrollTop 不为0时，再次刷新页面时，页面会从0开始，然后闪到当前scrollTop值，导致触发了window.scroll事件（特别是IE）
        setTimeout(function() {
            that.init();
        }, 30);
    }

    // NodeList对象转为数组
    LazyExcute.prototype.transToArray = function() {
        var resArr = [];
        for (var i = 0, len = this.elements.length; i < len; i++) {
            resArr.push(this.elements[i]);
        }
        this.elements = resArr;
    };

    LazyExcute.prototype.init = function() {
        var that = this;
        that.transToArray();

        var timer = null;
        this.handler = function scrollHandler() {
            timer && clearTimeout(timer);
            timer = setTimeout(function() {
                that.detectElementInViewport();
            }, 20);
        };

        this.detectElementInViewport();

        EventUtil.addHandler(window, "scroll", this.handler);
        EventUtil.addHandler(window, "resize", this.handler);
        return this;
    };

    LazyExcute.prototype.detectElementInViewport = function() {
        var curViewport = getViewport();
        var elements = this.elements;

        if (!elements.length || this.pause) {
            return;
        }

        for (var i = 0, len = elements.length; i < len; i++) {
            var element = elements[i];
            var elePosition = getBoundingClientRect(element);
            if ((0 <= elePosition.top && elePosition.top < curViewport.height + this.distance || elePosition.top < 0 && elePosition.bottom > 0 - this.distance) && (0 <= elePosition.left && elePosition.left < curViewport.width + this.distance || elePosition.left < 0 && elePosition.right > 0 - this.distance)) {

                this.loadOperation(element);

                elements.splice(i, 1);
                len = elements.length;
                i--;
            }
        }

        if (!elements.length) {
            EventUtil.removeHandler(window, "scroll", this.handler);
            this.callback && this.callback();
        }
    };

    LazyExcute.prototype.loadOperation = function(element) {
        var that = this;

        if (element.tagName === "IMG") {
            loadImage(element);
        } else if (element.tagName === "TEXTAREA") {
            loadScript(element);
        } else {
            var allInnerImg = element.getElementsByTagName("img");
            if (allInnerImg.length) {
                for (var i = 0, iLen = allInnerImg.length; i < iLen; i++) {
                    loadImage(allInnerImg[i]);
                }
            }

            var allInnerScript = element.getElementsByTagName("textarea");
            if (allInnerScript.length) {
                for (var j = 0, jLen = allInnerScript.length; j < jLen; j++) {
                    loadScript(allInnerScript[j]);
                }
            }
        }

        function loadImage(ele) {
            var imgSrc = ele.getAttribute(that.tag);
            if (imgSrc) { // 注意判断，就算为将 undefined 设为src，浏览器也要耗费几ms判断
                ele.src = imgSrc;
            }
        }

        function loadScript(ele) {
            var excluteStatement = ele.value;
            if (excluteStatement) {
                new Function(excluteStatement)();
            }
        }
    };

    LazyExcute.prototype.restart = function() {
        this.pause = false;
        return this;
    };

    LazyExcute.prototype.paused = function() {
        this.pause = true;
        return this;
    };

    function getViewport() {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        };
    }


    function getBoundingClientRect(element) {
        
        if (typeof arguments.callee.offset != "number") {
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var temp = document.createElement("div");
            temp.style.cssText = "position:absolute;left:0;top:0;";
            document.body.appendChild(temp);
            arguments.callee.offset = -temp.getBoundingClientRect().top - scrollTop;
            document.body.removeChild(temp);
            temp = null;
        }

        var rect = element.getBoundingClientRect();
        var offset = arguments.callee.offset;

        return {
            left: rect.left + offset,
            top: rect.top + offset,
            right: rect.right + offset,
            bottom: rect.bottom + offset
        };
    }

    var EventUtil = {
        addHandler: function(element, type, handler) {
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + type, handler);
            } else {
                element["on" + type] = handler;
            }
        },
        removeHandler: function(element, type, handler) {
            if (element.addEventListener) {
                element.removeEventListener(type, handler, false);
            } else if (element.detachEvent) {
                element.detachEvent("on" + type, handler);
            } else {
                element["on" + type] = null;
            }
        }
    };
    return LazyExcute;
})();
