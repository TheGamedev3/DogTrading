

let mode = 'offline';
if(mode === 'offline'){
    module.exports={
        ...require('./miniMongoose'),
        ...require('./errorCatcher'),
        ...require('@Seeder')
    }
}else{
    module.exports={
        ...require('./connect_db'),
        ...require('./db_Object'),
        ...require('./errorCatcher'),
        ...require('./pagnator'),

        ...require('./clearAll'),
        ...require('@Seeder')
    }
}
