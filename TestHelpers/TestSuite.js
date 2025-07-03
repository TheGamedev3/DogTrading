

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

require('@Site/app')
const { app, link, getServer } = require('@Site/launcher');
const mongoose = require('mongoose');

chai.use(chaiHttp);

const MongooseAPI = require('@MongooseAPI');

// all tests share the same connection/instance of the server
let server;

before(async () => {server = await getServer()});

after(async() => {
    if (server && server.close) {
        await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
});

function parseRoute(routeStr) {
    const [method, ...rest] = routeStr.trim().split(' ');
    const route = rest.join(' ').trim();
    return {
        method: method.toLowerCase(), // Express uses lowercase (e.g., app.post)
        route
    };
}

module.exports={
    siteEnvironment(label, func){
        describe(label,function(){
            func({
                link,
                expect,

                // agents let chai save/use cookies
                mainAgent: chai.request.agent(app),
                createAgent:()=>chai.request.agent(app),

                // agents let chai save/use cookies
                Agent(){
                    const agent = chai.request.agent(app);
                    return{
                        agent,
                        async requester(fullRoute, argsStruct={}){
                            let{
                                query, body,
                                assume, assumeCode
                            } = argsStruct;

                            if(assume===undefined)assume='success';

                            // make request sender
                            const{method, route} = parseRoute(fullRoute);

                            let chain = agent[method](route)
                                // allow it to follow redirects!
                                .redirects(2);

                                // send args
                                if(query){chain = chain.query(query)}
                                if(body){chain = chain.send(body)}

                            // send request & await result
                            const[success, result, response] = await (async()=>{
                                try {
                                    const res = await chain;
                                    const result = res.body;
                                    if((result && typeof result === 'object' && result.err === true) || !res.ok){return[false, result, res]}
                                    return[true, result, res];
                                } catch (err) {
                                    console.error('Request failed:', err);
                                    return[false, { error: err.message }, null];
                                }
                            })();

                            // check response status
                            if(assume==='any'){}
                            else if(assume==='success'){
                                if(!success){console.log(`unsuccessful request! (${fullRoute})`, result)}
                                expect(success).to.equal(true);
                            }
                            else if(assume==='fail'){
                                if(success){console.log(`unintended successful request! (${fullRoute})`, result)}
                                expect(success).to.equal(false);
                            }

                            if(assumeCode){expect(response).to.have.status(assumeCode)}

                            // 🏁 return final result
                            return result;
                        }
                    }
                },

                MongooseAPI,
                async resetDB(){
                    const {clearAll, seedDatabase} = MongooseAPI;
                    await clearAll();
                    await seedDatabase();
                }
            });
        });
    }
}
