

const {Owner} = require('@Chemicals');
async function fetchUser(id) {
    return await Owner.fetchUser(id);
}

const jwt = require('jsonwebtoken');

const createVerifier = ({tokenName, secretName, rerouteTo})=> async(req, res, next)=>{
    
    req.verificationFail=(reason)=>{
        if(reason)console.warn(reason);
        return res.redirect(rerouteTo);
    }

    // check json web token exists & has a valid user Id
    req.isVerified=async()=>{
        const token = req.cookies[tokenName];
        if(!token)return req.unverified = {err: `(no session found)`, pass: false};

        if(req.user)return{pass: true}; // already logged in!

        const[err, decodedToken] = await new Promise(res=>{
            jwt.verify(token, secretName, async(err, decodedToken)=>{
                res([err, decodedToken]);
            });
        });

        if(err)return req.unverified = {err: err.message};

        const userId = decodedToken.id;

        // add userId and user Information to requests
        req.user = await fetchUser(userId);
        if(!req.user)return req.unverified = {err: `user ${userId} not found!`, pass: false};
        req.userId = userId;
        return{pass: true}
    }

    const checkVerification=async()=>{
        const{pass} = await req.isVerified();
        req.verificationStatus = pass;
        if(pass){
            req.removeSession=(rerouteTo)=>{
                req.user = undefined;
                req.userId = undefined;
                res.cookie(tokenName, '', { maxAge: 1 });
                if(rerouteTo)res.redirect(rerouteTo);
            }
        }else{
            const tokenizeId=(id, sessionLength = 24 * 60 * 60 * 1000)=>{ // 24 hr session by default
                res.cookie(tokenName,
                    jwt.sign({ id }, secretName, {
                        expiresIn: sessionLength
                    }),
                { httpOnly: true, maxAge: sessionLength });
            }
            req.verifyUser=async(user, sessionLength)=>{
                req.user = user;
                req.userId = user._id;
                tokenizeId(user._id, sessionLength);
                await checkVerification();
            }
            req.verifyId=async(userId, sessionLength)=>{
                req.user = await fetchUser(userId);
                if(!req.user)return verificationFail(`user ${userId} not found!`);
                req.userId = userId;
                tokenizeId(userId, sessionLength);
                await checkVerification();
            }
        }
    }

    await checkVerification();

    next();
}

module.exports = {createVerifier};
