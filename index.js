const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion , ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

const corsConfig = {
  origin: '*',
  credential: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}

app.use(cors(corsConfig));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lbqsrfq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    

    app.get('/brands', async (req, res) => {
      try {
        const database = client.db("TasteHaven");
        const collection = database.collection("brands");
        const brandsData = await collection.find({}).toArray();

        res.json(brandsData);
      } catch (error) {
        console.error("Error fetching brand data:", error);
        res.status(500).send("Server error");
      }
    });

    app.get('/products', async (req, res) => {
      try {
        const database = client.db("TasteHaven");
        const collection = database.collection("products");
        const productsData = await collection.find({}).toArray();

        res.json(productsData);
      } catch (error) {
        console.error("Error fetching product data:", error);
        res.status(500).send("Server error");
      }
    });

    app.get('/sliders/:brandName', async (req, res) => {
      try {
        const database = client.db('TasteHaven');
        const collection = database.collection('sliders');
        const brandName = req.params.brandName;
        const sliderData = await collection.findOne({ name: brandName });

        if (sliderData) {
          const images = sliderData.images;
          res.json(images);
        } else {
          res.status(404).send('Slider data not found for the specified brand.');
        }
      } catch (error) {
        console.error('Error fetching slider data:', error);
        res.status(500).send('Server error');
      }
    });

    app.put('/products/update/:product_id', async (req, res) => {
      try {
        const database = client.db('TasteHaven');
        const collection = database.collection('products');
        
        const product_id = req.params.product_id;
    
        const { product_name, image, brand_name, product_category, price, rating, description } = req.body;
    
        const updateFields = {
          product_name,
          image,
          brand_name,
          product_category,
          price,
          rating,
          description
        };
    
        const result = await collection.updateOne(
          { _id: new ObjectId(product_id) },
          { $set: updateFields }
        );
    
        if (result.matchedCount === 0) {
          res.status(404).send('Product not found');
        } else {
          res.status(200).send('Product updated successfully');
        }
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Server error');
      }
    });
    
    app.post('/products/add', async (req, res) => {
      try {
        const database = client.db("TasteHaven");
        const collection = database.collection("products");

        const {
          product_name,
          image,
          brand_name,
          product_category,
          price,
          rating,
          description
        } = req.body;

        const newProduct = {
          product_name,
          image,
          brand_name,
          product_category,
          price,
          rating,
          description
        };

        const result = await collection.insertOne(newProduct);
        res.send(result);

      } catch (error) {
        console.error("Error adding a product:", error);
        res.status(500).send("Server error");
      }
    });

    app.post('/cart/add', async (req, res) => {
      try {
        const database = client.db("TasteHaven");
        const collection = database.collection("cart");
    
        const { userEmail, productData } = req.body;
    
        const cartItem = {
          userEmail,
          productData,
        };
    
        const result = await collection.insertOne(cartItem);
        res.status(200).send('Product added to cart successfully');

      } catch (error) {
        console.error('Error adding a product to the cart:', error);
        res.status(500).send('Server error');
      }
    });


    app.get('/cart/items/:userEmail', async (req, res) => {
      try {
        const userEmail = req.params.userEmail; 
    
        const database = client.db('TasteHaven');
        const collection = database.collection('cart');
    
        const cartItems = await collection.find({ userEmail }).toArray();
    
        res.json(cartItems);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).send('Server error');
      }
    });
    
    app.delete('/cart/remove', async (req, res) => {
      try {
        const userEmail = req.query.userEmail;
        const itemId = req.query.itemId;
        
        if (!userEmail || !itemId) {
          return res.status(400).send('Missing required parameters (userEmail or itemId)');
        }
    
        const database = client.db('TasteHaven');
        const collection = database.collection('cart');
        const itemObjectId = new ObjectId(itemId);
        
        const deleteResult = await collection.deleteOne({ userEmail, _id: itemObjectId });
    
        if (deleteResult.deletedCount === 1) {
          res.status(204).send(); 
        } else {
          res.status(404).send('Item not found in the cart');
        }
      } catch (error) {
        console.error('Error removing item from the cart:', error);
        res.status(500).send('Server error');
      }
    });
    

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('The server is running.');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
