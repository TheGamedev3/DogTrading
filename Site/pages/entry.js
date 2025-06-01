



module.exports = function createRoutes({route, Webpage}){

    // entry
    Webpage('/signup', 'entry/Signup', {preVerified: true});
    Webpage('/login', 'entry/Login', {preVerified: true});


    // make home the default page
    route.either('GET /', ({res})=>res.redirect('/home'));

    Webpage('/home', 'entry/Home');

};
