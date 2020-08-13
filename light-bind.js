
const lightBind = (function () {

    const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA']);

    /**
     * 轻量级数据绑定。
     * @param {String} attr 需要被绑定的元素的属性名
     * @param {Object} data 需要被绑定的数据
     * @returns {Proxy} 绑定完成的数据
     */
    function lightBind({data, watch = null}, attr = "lb-bind") {
        const setters = {};
        const keys = Object.keys(data);
        const keySet = new Set(keys);
        keys.forEach(key => setters[key] = []);

        function set(key, value, source = null) {
            const old = data[key];
            data[key] = value;
            setters[key].forEach(setter => setter(value, old, proxy, source));
        }

        // 创建代理
        const proxy = new Proxy(data, {
            set(target, property, value) {
                if (keySet.has(property)) {
                    set(property, value, null);
                }
            },
        });

        const elements = [...document.querySelectorAll("*[" + attr +"]")];
        elements.forEach(elem => {
            const key = elem.getAttribute(attr);
            if (keySet.has(key)) {
                if (INPUT_TAGS.has(elem.tagName)) {
                    if (elem.type === 'number') {
                        elem.addEventListener('input', () => set(key, Number(elem.value), elem));
                    } else {
                        elem.addEventListener('input', () => set(key, elem.value, elem));
                    }
                    setters[key].push((value, old, proxy, source) => {
                        if (source !== elem) {
                            elem.value = value;
                        }
                    });
                    elem.value = data[key];
                } else {
                    setters[key].push((value) => elem.innerText = value);
                    elem.innerText = data[key];
                }
            }
        });
        if (watch) {
            Object.entries(watch).forEach(([key, watcher]) => {
                if (keySet.has(key)) {
                    setters[key].push(watcher);
                }
            });
        }
        return proxy;
    }

    return lightBind;
})();