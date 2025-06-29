
const{route} = require('./routes');
module.exports = function Webpage(name, file, args={}){
    const fullRoute = `GET ${name}`;
    async function pageRoute(routeArgs){
        const pageArgs={
            ...routeArgs,
            ...args
        }
        delete pageArgs.injectInfo;
        const injectInfo = args.injectInfo;
        if(injectInfo){
            const extraInfo = await injectInfo({
                ...pageArgs, 
                setFile:(newFile)=>{file = newFile}
            });
            if(extraInfo)Object.assign(pageArgs, extraInfo);
        }
        return routeArgs.page(pageArgs.errCode || 200, file, pageArgs);
    }
    if(args.preVerified){
        route.preVerified(fullRoute, pageRoute);
    }else{
        route.either(fullRoute, pageRoute);
    }
}
