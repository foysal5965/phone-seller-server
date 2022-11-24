const express= require('express');
const cors= require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port= process.env.PORT || 5000;
const app = express()
app.use(cors())
app.use(express.json())


app.get('/', (req,res)=>{
    res.send('full stack is going on')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3v10x4o.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run(){
   
    try{
        const categoryCollection= client.db('full-stack-project-1').collection('Category');
        const categoryDetailsCollection = client.db('full-stack-project-1').collection('Category-details')
        app.get('/category', async(req,res)=>{
            const query= {};
            const category= await categoryCollection.find(query).toArray();
            res.send(category)
        })
      app.get('/category/:id', async(req,res)=>{
        const id= req.params.id;
        const query= {category_id:id}
        
        const result= await categoryDetailsCollection.find(query).toArray()
        console.log(result)
        res.send(result)
      })
    }
    finally{        

    }
}
run().catch(er=>console.log(er))


app.listen(port,()=>{})