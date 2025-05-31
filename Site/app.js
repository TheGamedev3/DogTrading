
// The Entry Point of the Site Project

require('module-alias/register');



const routeCreators = [
    require('./routes/userRequests'),
    require('./routes/dogRequests'),
    require('./routes/tradeRequests'),
    require('./routes/dataRequests'),
    require('./routes/webpages'),
    require('./routes/pagnator')
];

function parseRoute(routeStr) {
    const [method, ...rest] = routeStr.trim().split(' ');
    const route = rest.join(' ').trim();
    return {
        method: method.toLowerCase(), // Express uses lowercase (e.g., app.post)
        route
    };
}

const preVerified = [];
const onVerified = [];
const either = [];

function routeFunction(routeStr, func) {
    const { method, route } = parseRoute(routeStr);
    onVerified.push({ method, route, func });
}

routeFunction.preVerified = function(routeStr, func) {
    const { method, route } = parseRoute(routeStr);
    preVerified.push({ method, route, func });
};
routeFunction.either = function(routeStr, func) {
    const { method, route } = parseRoute(routeStr);
    either.push({ method, route, func });
};

routeCreators.forEach(create=>create(routeFunction));

const { link, app } = require('./launcher');

function routeMethods(req, res, next){
    return{
        req, res, link, app,

        // gives session info
        user: req.user,
        userId: req.userId,

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




const{createVerifier} = require('@Middlewares/UserVerifying');
const CORS = require('@Middlewares/CORS');

app.use(CORS);

app.use(
    createVerifier({
        tokenName: 'JWT-Id',
        secretName: process.env.JWT_SECRET,
        rerouteTo: '/home'
    })
);

preVerified.forEach(({method, route, func})=>{
    app[method](route, async(req, res, next) => {
        if(req.verificationStatus){return next()}
        await func(routeMethods(req, res, next));
    });
});

either.forEach(({method, route, func})=>{
    app[method](route, async(req, res, next) => {
        await func(routeMethods(req, res, next));
    });
});

onVerified.forEach(({method, route, func})=>{
    app[method](route, async(req, res, next) => {
        if(!req.verificationStatus){return req.verificationFail(req.unverified.err)}
        await func(routeMethods(req, res, next));
    });
});

app.use((req, res, next)=>{
    return res.status(404).send('page not found');
});
