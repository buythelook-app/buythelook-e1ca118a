
import express from 'express';
import cors from 'cors';
import { generateLooks, getProducts } from './api/routes';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for your frontend domain
app.use(cors({
  origin: 'https://your-frontend-domain.lovable.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// API routes
app.post('/api/generate-looks', generateLooks);
app.post('/api/products', getProducts);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
