
// The Entry Point of the Site Project

require('module-alias/register');

const { app } = require('./launcher');

const{createVerifier} = require('@Middlewares/UserVerifying');
const CORS = require('@Middlewares/CORS');

app.use(CORS);

app.use(
    createVerifier({
        // verifies the user's session token,
        // and retrieves their information for requests
        tokenName: 'JWT-Id',
        secretName: process.env.JWT_SECRET,
        rerouteTo: '/home'
    })
);

// get route creator helpers
// then pass those to the route creators
const{createAllRoutes} = require('./routeMaker/routeMaker');
createAllRoutes(
    require('./requests/userRequests'),
    require('./requests/dogRequests'),
    require('./requests/tradeRequests'),
    require('./requests/dataRequests'),
    
    require('./pages/entry'),
    require('./pages/profiles'),
    require('./pages/data')
);

app.use((req, res, next)=>{
    return res.status(404).send('page not found');
});
