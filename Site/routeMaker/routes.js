
function parseRoute(routeStr) {
    const [method, ...rest] = routeStr.trim().split(' ');
    const route = rest.join(' ').trim();
    return {
        method: method.toLowerCase(), // Express uses lowercase (e.g., app.post)
        route
    };
}

let definedRoutes={};
function getDefinedRoutes(){return definedRoutes}
function clearRoutes(){definedRoutes = null}

function route(routeStr, func) {
    const { method, route } = parseRoute(routeStr);
    (definedRoutes.onVerified??=[]).push({ method, route, func });
}

route.preVerified = function(routeStr, func) {
    const { method, route } = parseRoute(routeStr);
    (definedRoutes.preVerified??=[]).push({ method, route, func });
};
route.either = function(routeStr, func) {
    const { method, route } = parseRoute(routeStr);
    (definedRoutes.either??=[]).push({ method, route, func });
};

module.exports = {route, getDefinedRoutes, clearRoutes};