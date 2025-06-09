// Site/Tools/helpers.js

// Cycle --> GetElements

// remember not to infinitely recurse!!!!!
// things should only trigger onClick, or onClick after a delay! or just change visually!

// define the visuals statically!

// (this is heavily based on principles of the React framework)

const updateStates = [];
function refresh(){updateStates.forEach(func=>func())}

const persistentObject = window.args;
const allIds = {};

window.StaticState=function(stateDefinition){
    let firstRun = true;
    let definedEvents = [];

    function DynamicEJSelements(...ids){
        function obtainEJSinstance(id){
            let ejsInstance = allIds[id];
            if(ejsInstance){return ejsInstance}
            ejsInstance = {
                set({
                    visible,
                    color, background, border,
                    text, placeholderText, value,
                    disabled, enabled,
                    defaultState,
                    src, href
                }) {
                    if (defaultState && !firstRun) return;

                    const el = document.getElementById(id);
                    if (!el) return;

                    if (visible !== undefined) el.style.display = visible ? "" : "none";
                    if (background) el.style.backgroundColor = background;
                    if (color) el.style.color = color;
                    if (border) el.style.border = border;
                    if (ejsInstance.originalBorder === undefined || border !== undefined) ejsInstance.originalBorder = el.style.border;

                    if (text !== undefined) el.textContent = text;
                    if (placeholderText !== undefined && 'placeholder' in el) el.placeholder = placeholderText;
                    if (value !== undefined) el.value = value;

                    if (href !== undefined && el.tagName === 'A') el.href = href;
                    if (src !== undefined) el.src = src;

                    let bool = undefined;
                    if (disabled !== undefined) bool = disabled;
                    if (enabled !== undefined) bool = !enabled;
                    if (bool !== undefined) el.disabled = bool;

                },

                onClick(func){
                    const button = document.getElementById(id);
                    if(button){
                        button.addEventListener('click', func);
                        definedEvents.push(()=>{if(button)button.removeEventListener('click', func)});
                    }
                },

                onTextSubmit(func) {
                    const textInput = document.getElementById(id);
                    if (textInput) {
                        const handler = (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            textInput.blur(); // <- force blur on Enter
                        }
                        };

                        const blurHandler = () => func(textInput.value.trim());

                        textInput.addEventListener('keydown', handler);
                        textInput.addEventListener('blur', blurHandler);

                        definedEvents.push(() => {
                        if (textInput) {
                            textInput.removeEventListener('keydown', handler);
                            textInput.removeEventListener('blur', blurHandler);
                        }
                        });
                    }
                },

                onEdit(func) {
                    const textInput = document.getElementById(id);
                    if(textInput){
                        textInput.addEventListener('input', func);
                        definedEvents.push(()=>{if(textInput)textInput.removeEventListener('input', func)});
                    }
                },

                get(){ return document.getElementById(id); }
            };

            ejsInstance.displayError = (msg = "Invalid input") => {
                const el = document.getElementById(id); if (!el) return;

                el.style.border = '2px solid red';

                let errMsg = ejsInstance.errMsg;
                if (!errMsg) {
                    errMsg = document.createElement('div');
                    errMsg.style.color = 'red';
                    errMsg.style.fontSize = '0.85em';
                    errMsg.style.marginTop = '4px';
                    el.insertAdjacentElement('afterend', errMsg);
                    ejsInstance.errMsg = errMsg;
                }

                errMsg.textContent = msg;
            };
            ejsInstance.errorIf = (msg = "Invalid input", bool = true) => {
                if(bool){ejsInstance.displayError(msg)}
                else{ejsInstance.clearError()}
            };
            ejsInstance.clearError = () => {
                const el = document.getElementById(id); if (!el) return;

                el.style.border = ejsInstance.originalBorder ?? '';
                let errMsg = ejsInstance.errMsg;
                if (errMsg){
                    errMsg.parentNode?.removeChild(errMsg);
                    delete ejsInstance.errMsg;
                }
            };

            allIds[id] = ejsInstance;
            return ejsInstance;
        }
        return ids.map(obtainEJSinstance);
    }
    function parseRoute(routeStr) {
        const [method, ...rest] = routeStr.trim().split(' ');
        const route = rest.join(' ').trim();
        return {
            method: method.toUpperCase(), // Express uses lowercase (e.g., app.post)
            route
        };
    }
    async function request(routeStr, bodyArgs = {}) {
        const { method, route } = parseRoute(routeStr);

        const options = {
            method,
            credentials: 'include',
            headers: {}
        };

        // Only attach body for methods that support it
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(bodyArgs);
        }

        try {
            const res = await fetch(route, options);

            if (!res.ok) {
                const error = await res.text();
                throw new Error(`HTTP ${res.status}: ${error}`);
            }

            // Attempt to parse JSON response
            const data = await res.json().catch(() => ({})); // fallback to empty if no JSON
            if(data && typeof data === 'object' && data.err === true){return[false, data]}
            return[true, data];
        } catch (err) {
            console.error('Request failed:', err);
            return[false, { error: err.message }];
        }
    }
    async function onFirstRun(func){if(firstRun){return await func()}}

    updateStates.push(()=>{
        // Unlisten to all previous event handlers before they get redefined
        definedEvents.forEach(func=>func());
        definedEvents = [];
        stateDefinition({
            session:persistentObject, refresh, request,
            DynamicEJSelements,
            onFirstRun
        })
    });
    
    document.addEventListener('DOMContentLoaded', () => {
        refresh();
        firstRun = false;
    });

    // optionally, await for definitions to be established
    // then add in functions outside to change bools the states have
}

