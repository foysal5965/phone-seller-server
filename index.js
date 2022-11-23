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



const uri = "mongodb+srv://<username>:<password>@cluster0.3v10x4o.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



app.listen(port,()=>{})