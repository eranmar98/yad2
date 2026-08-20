import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

// Windows can hand Node's DNS resolver a link-local IPv6 nameserver that
// it fails to query (ECONNREFUSED) even though the OS resolver works fine.
// Forcing public resolvers fixes SRV lookups for mongodb+srv:// URIs.
dns.setServers(['8.8.8.8', '1.1.1.1']);

//////////// Route imports ///////////
import usersRouter from './routes/users';
import categoriesRouter from './routes/categories';
import itemsRouter from './routes/items';
import inquiriesRouter from './routes/inquiries';
import favoriteItemsRouter from './routes/favoriteItems';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/////////// Routes ///////////
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/favorites', favoriteItemsRouter);
////////////////////

mongoose
  .connect(process.env.MONGODB_CONNECTION as string)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));
