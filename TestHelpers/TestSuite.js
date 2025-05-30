

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

before(async () => {
    server = await getServer();
});

after(async() => {
    if (server && server.close) {
        await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
});

module.exports={
    siteEnvironment(label, func){
        describe(label,function(){
            func({
                link,
                expect,

                // agents let chai save cookies
                mainAgent: chai.request.agent(app),
                createAgent:()=>chai.request.agent(app),

                MongooseAPI
            });
        });
    }
}
