

function createAllRoutes(...routeCreators){

    const{route, getDefinedRoutes, clearRoutes} = require('./routes');
    const{err_catcher} = require('@MongooseAPI');

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

            async json(status, object){
                let success = true;
                if(typeof object === 'function'){
                    const [s2, result] = await err_catcher(
                        object,
                        {oldName:"failed: name: username", rename:"username can't be blank!"}
                    );
                    success = s2; object = result;
                }
                if(!success){
                    if(typeof result === 'object' && result.code !== undefined){
                        status = result.code;
                    }else{
                        status = 500;
                    }
                }
                res.status(status).json(object);
            },
            page(status, file, args = {}) {
                const redirect = args.redirect;
                if(redirect){
                    delete args.redirect;
                    return res.redirect(redirect);
                }

                const pageMessage = req.session.message || null;
                delete req.session.message;

                const pageArgs = {};

                // Copy only what you need for the frontend
                for (const [key, value] of Object.entries({...args, message: pageMessage})) {
                    if(['req', 'res'].includes(key)){continue}
                    if (typeof value === 'object') {
                        try {
                            pageArgs[key] = JSON.parse(JSON.stringify(value));
                        } catch (e) {
                            console.warn("FAILED TO JSON", key, e)
                            pageArgs[key] = null;
                        }
                    } else {
                    pageArgs[key] = value;
                    }
                }

                // if test mode, args and file should be directly accessible, and not an actual page returning!
                // this is because the route testers don't simulate the dom!
                const testMode = process.env.NODE_ENV === 'test';
                if(testMode){return res.status(status).json(pageArgs)} // (directly return the args in test mode)
                else{return res.status(status).render(file, {...pageArgs, allArgs: pageArgs})} // (the format ejs expects for the args)
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