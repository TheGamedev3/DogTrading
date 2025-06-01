

function createAllRoutes(...routeCreators){

    const{route, getDefinedRoutes, clearRoutes} = require('./routes');

    const Webpage = require('./webpage');
    const PagerPage = require('./pagnator');

    routeCreators.forEach(create=>create({route, Webpage, PagerPage}));

    const { link, app } = require('@Site/launcher');

    function routeMethods(req, res, next){
        return{
            req, res, link, app,

            // gives session info
            user: req.user || null,
            userId: req.userId || 0,

            // JSON/body args (from POST, PATCH, etc.)
            inputs: req.body || {},

            // URL query args (e.g., ?page=2&limit=10)
            queries: req.query || {},

            // (Optional) route params (e.g., /user/:id)
            params: req.params || {},

            json(status, object){res.status(status).json(object)},
            page(status, file, args={}){
                return res.status(status).render(file, args);
            },
            skip:next
        }
    }
    let definedRoutes = getDefinedRoutes();

    definedRoutes.preVerified?.forEach(({method, route, func})=>{
        app[method](route, async(req, res, next) => {
            if(req.verificationStatus){return next()}
            await func(routeMethods(req, res, next));
        });
    });

    definedRoutes.either?.forEach(({method, route, func})=>{
        app[method](route, async(req, res, next) => {
            await func(routeMethods(req, res, next));
        });
    });

    definedRoutes.onVerified?.forEach(({method, route, func})=>{
        app[method](route, async(req, res, next) => {
            if(!req.verificationStatus){return req.verificationFail(req.unverified.err)}
            await func(routeMethods(req, res, next));
        });
    });

    definedRoutes = null;

    clearRoutes();
}

module.exports = {createAllRoutes}