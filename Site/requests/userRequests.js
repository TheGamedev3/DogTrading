


const {Owner} = require('@Chemicals');

module.exports = function createRoutes({route}){
    route.preVerified('POST /signup', async({inputs, req, json})=>{
        // replace this with an err catcher forum thingy

        const result = await Owner.signup(inputs.email, inputs.password);
        if(result && result.err !== true){
            const user = result;
            req.verifyUser(user);
            return json(200, user);
        }else{
            return json(500, result);
        }
    });
    route.preVerified('POST /login', async({inputs, req, res, json})=>{
        try{
            const user = await Owner.login(inputs.email, inputs.password);
            await req.verifyUser(user);
            req.session.justLoggedIn = true;
            return res.redirect(`/UserProfile/${user._id}`);
        }catch(err){
            console.log(err.message)
            json(500, err.message);
        }
    });

    route('POST /logout', async({req, res})=>{
        await req.removeSession();
        return res.redirect(`/home`);
    });

    route('PATCH /editMyProfile', async({json, userId, inputs})=>{
        // use an error catcher thing here later
        return json(200, await Owner.modify(userId, inputs));
    });

    route('DELETE /deleteAccount', async({userId})=>{
        // use an error catcher thing here later
        req.removeSession(); // remove their session first
        return json(200, await Owner.delete(userId));
    });
};
