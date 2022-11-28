const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_KEY);
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;
const app = express()
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('full stack is going on')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3v10x4o.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('unauthorized access')
  }
  const token = authHeader.split(' ')[1]

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbide access' })
    }
    req.decoded = decoded
    next()
  })
}


async function run() {

  try {
    const categoryCollection = client.db('full-stack-project-1').collection('Category');
    const bookingsCollection = client.db('full-stack-project-1').collection('bookings');
    const categoryDetailsCollection = client.db('full-stack-project-1').collection('Category-details')
    const usersCollection = client.db('full-stack-project-1').collection('users')
    const advertisedProductColletion = client.db('full-stack-project-1').collection('advertised-product')
    const paymentsColletion = client.db('full-stack-project-1').collection('payments')


    app.get('/category', async (req, res) => {
      const query = {};
      const category = await categoryCollection.find(query).toArray();
      res.send(category)
    })
    app.get('/category/:id', async (req, res) => {
      const id = req.params.id;
      const query = { category_id: id }

      const result = await categoryDetailsCollection.find(query).toArray()

      res.send(result)
    })
    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await categoryDetailsCollection.insertOne(product)
      res.send(result)
    })
    app.get('/products', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const result = await categoryDetailsCollection.find(query).toArray();
      res.send(result)
    })
    app.post('/orders', async (req, res) => {
      const bookings = req.body;
      const result = await bookingsCollection.insertOne(bookings)
      res.send(result)
    })
    app.get('/orders', verifyJWT, async (req, res) => {
      const email = req.query.email;

      const decodedEmail = req.decoded.email
      console.log(decodedEmail, email)
      if (email !== decodedEmail) {
        return res.status(403).send({ message: 'forbidden access' })
      }

      const query = { email: email }
      const bookings = await bookingsCollection.find(query).toArray()
      res.send(bookings)
    })
    app.get('/orders/payment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.findOne(query)
      res.send(result)
    })
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user)
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })
    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query)
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '12h' });
        return res.send({ accessToken: token })
      }
      res.status(403).send({ accessToken: '' })
    })
    app.get('/users', async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users)
    })
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter)
      res.send(result)
    })
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      console.log(query)
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'admin' })
    })
    app.get('/users/seller/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === 'Seller' })
    })
    app.get('/sellers', async (req, res) => {
      const query = { role: 'Seller' }
      const sellers = await usersCollection.find(query).toArray()
      res.send(sellers)
    })
    app.delete('/sellers/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter)
      res.send(result)
    })
    
    app.get('/advertisedproducts', async (req, res) => {
      const query = {};
      const result = await advertisedProductColletion.find(query).toArray();
      res.send(result)
    })
    app.post('/create/payment/intent', async (req, res) => {
      const order = req.body;
      const price = order.resel_price;
      const amount = price * 100;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        "payment_method_types": [
          "card"
        ]
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    })
    app.post('/payments', async(req,res)=>{
      const payment = req.body;
      const id= payment.orderId;
      const filter= {_id:ObjectId(id)}
      const updatedDoc={
        $set:{paid:true}
      }
      const bookimgUpdate= await categoryDetailsCollection.updateOne(filter,updatedDoc)
      const updatedReslt= await bookingsCollection.updateOne(filter,updatedDoc)
      const result= await paymentsColletion.insertOne(payment)
      res.send(result)
    })
    app.post('/advertisedproducts', async (req, res) => {
      const advertised = req.body
      
      const result = await advertisedProductColletion.insertOne(advertised)
      res.send(result)
    })
    app.put('/advertisedproducts/:id', async(req,res)=>{
      const id= req.params.id;
      const filter={_id:ObjectId(id)}
      const updateAdvertise= req.body.update
      console.log(updateAdvertise)
      const updatedReslt= await advertisedProductColletion.updateOne(filter,updateAdvertise)
      res.send(updatedReslt)
    })
    
   
  }
  finally {

  }
}
run().catch(er => console.log(er))


app.listen(port, () => { })