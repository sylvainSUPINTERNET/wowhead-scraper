'use strict';



class DbClient {
    private MongoClient = require('mongodb').MongoClient;
    private url = process.env.DB_URL || 'mongodb://localhost:27017';
    private dbName = process.env.DB_NAME || 'bot';
    DbClient:any;

    LinkedinMessagesCollection: any;

    
    constructor(){
        this.initConnection();
    }

    initConnection(){
        this.MongoClient.connect(this.url,  {useNewUrlParser: true, useUnifiedTopology: true}, (err:any, client:any) => {
            if ( !err ) {
                this.DbClient = client.db(this.dbName);
                
                // Init models
                this.LinkedinMessagesCollection = client.collection("linkedinMessages");

                console.log("MongoDB client created successfully")
            }  else {
                console.log(err)
            }
          });          
    }
    

    getConnection() {
        return this.DbClient;
    }
}

export default new DbClient();