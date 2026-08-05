import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'List inquiries' });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create inquiry' });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Get inquiry ${id}` });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Update inquiry ${id}` });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Delete inquiry ${id}` });
});

export default router;
