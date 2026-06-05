const Product = require('../models/Product');

// @desc  Get all products (with search, filter, sort, pagination)
// @route GET /api/products
// @access Public
const getProducts = async (req, res) => {
  const { search, category, sort, page = 1, limit = 12 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  const sortMap = {
    'price-asc':  { price: 1 },
    'price-desc': { price: -1 },
    'rating':     { rating: -1 },
    'newest':     { createdAt: -1 },
    'default':    { createdAt: -1 },
  };

  const sortOpt = sortMap[sort] || sortMap['default'];

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .sort(sortOpt)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    products,
    page:       Number(page),
    pages:      Math.ceil(total / Number(limit)),
    total,
  });
};

// @desc  Get single product
// @route GET /api/products/:id
// @access Public
const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// @desc  Create product
// @route POST /api/products
// @access Admin
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Update product
// @route PUT /api/products/:id
// @access Admin
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// @desc  Delete product
// @route DELETE /api/products/:id
// @access Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
};

// @desc  Add review to product
// @route POST /api/products/:id/reviews
// @access Private
const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    return res.status(400).json({ message: 'Product already reviewed' });
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
  product.updateRating();
  await product.save();
  res.status(201).json({ message: 'Review added' });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview };
