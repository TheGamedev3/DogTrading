
const{route} = require('./routes');
module.exports = function Webpage(name, file, args={}){
    const fullRoute = `GET ${name}`;
    async function pageRoute(routeArgs){
        const pageArgs={
            justLoggedIn:false,
            ...routeArgs,
            ...args
        }
        delete pageArgs.injectInfo;
        const injectInfo = args.injectInfo;
        if(injectInfo){Object.assign(pageArgs, await injectInfo(pageArgs))}
        return routeArgs.page(pageArgs.errCode || 200, file, pageArgs);
    }
    if(args.preVerified){
        route.preVerified(fullRoute, pageRoute);
    }else{
        route.either(fullRoute, pageRoute);
    }
}
