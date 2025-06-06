

let mode = 'online';
if(mode === 'offline'){
    module.exports={
        ...require('./miniMongoose'),
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
