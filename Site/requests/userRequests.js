


const {Owner} = require('@Chemicals');
const { err_catcher } = require('@MongooseAPI');

module.exports = function createRoutes({route}){
    route.either('GET /user/:userId', async({json, params})=>{
        return await json(200, async()=>await Owner.pageData(params.userId));
    });

    route.preVerified('POST /signup', async({inputs, req, json})=>{
        // replace this with an err catcher forum thingy

        const result = await Owner.signup(inputs.email, inputs.password);
        if(result && result.err !== true){
            const user = result;
            req.verifyUser(user);
            return await json(200, user);
        }else{
            return await json(500, result);
        }
    });
    route.preVerified('POST /login', async({inputs, req, res, json})=>{
        const result = await err_catcher(async()=>{
            const user = await Owner.login(inputs.email, inputs.password);
            await req.verifyUser(user);
            req.session.justLoggedIn = true;
            return user;
        });
        if(result && typeof result === 'object' && result.err === true){
            return await json(500, result);
        }else{
            const user = result;
            return res.redirect(`/UserProfile/${user._id}`);
        }
    });

    route('POST /logout', async({req, res})=>{
        await req.removeSession();
        return res.redirect(`/home`);
    });

    route('PATCH /editMyProfile', async({json, userId, inputs})=>{
        // use an error catcher thing here later
        return await json(200, async()=>await Owner.modify(userId, inputs));
    });

    route('DELETE /deleteAccount', async({req, userId, json})=>{
        // use an error catcher thing here later
        req.removeSession(); // remove their session first
        return await json(200, async()=>await Owner.delete(userId));
    });
};
