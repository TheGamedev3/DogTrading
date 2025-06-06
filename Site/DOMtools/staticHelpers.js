// Site/Tools/helpers.js

// Cycle --> GetElements

// remember not to infinitely recurse!!!!!
// things should only trigger onClick, or onClick after a delay! or just change visually!

// define the visuals statically!

// (this is heavily based on principles of the React framework)

window.StaticState=function(stateDefinition){
    let firstRun = true;
    let clickQueue = [];

    function DynamicEJSelements(...ids){
        function createInstance(id){
            return{
                set({
                    visible,
                    color, background,
                    text,
                    disabled, enabled,
                    defaultState
                }){
                    if(defaultState && !firstRun){return}
                    const el = document.getElementById(id);
                    if (!el) return;
                    if (visible !== undefined) el.style.display = visible ? "" : "none";
                    if (background) el.style.backgroundColor = background;
                    if (color) el.style.color = color;
                    if (text !== undefined) el.textContent = text;

                    let bool = undefined;
                    if(disabled !== undefined){bool = disabled;}
                    if(enabled !== undefined){bool = !enabled}
                    if(bool !== undefined){el.disabled = bool}
                },

                onClick(func){
                    const button = document.getElementById(id);
                    button.addEventListener('click', func);
                    clickQueue.push({ id, func });
                }
            }
        }
        return ids.map(createInstance);
    }

    function parseRoute(routeStr) {
        const [method, ...rest] = routeStr.trim().split(' ');
        const route = rest.join(' ').trim();
        return {
            method: method.toLowerCase(), // Express uses lowercase (e.g., app.post)
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
        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
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
            return[true, data];
        } catch (err) {
            console.error('Request failed:', err);
            return[false, { error: err.message }];
        }
    }

    const persistentObject = window.args;

    function refresh(){
        // Remove all previous click handlers
        for (const { id, func } of clickQueue) {
            const el = document.getElementById(id);
            if (el) el.removeEventListener('click', func);
        }
        clickQueue = [];

        stateDefinition({
            session:persistentObject, refresh, request,
            DynamicEJSelements
        });
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        refresh();
        firstRun = false;
    });

    // optionally, await for definitions to be established
    // then add in functions outside to change bools the states have
}

