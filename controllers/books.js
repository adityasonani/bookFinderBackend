const Book = require('../model/books')
const Books = require('../model/books')

exports.getAllBooks = (req,res)=>{
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;
    var skip = req.query.skip ? parseInt(req.query.page) : 0;
    Books.find()
        .limit(limit)
        .skip((skip-1)*limit)
        .then((data)=>{
            res.json(data)
        })
        .catch((err)=>{
            res.status(500).json({ error: 'Internal server error' })
        })
}

exports.getBookById = (req, res) => {
    const bookId = req.params.bookId;
  
    Books.findById(bookId)
      .then((book) => {
        if (!book) {
          return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
      });
};
  
exports.getAllBooksSortedByPrice = (req, res) => {
  const { order } = req.query;
  
  let sortOrder = 1;
  if (order === 'desc') {
    sortOrder = -1;
  }

  Book.find()
    .sort({ 'Paperback.Hardcover Price': sortOrder })
    .then((books) => {
      res.json(books);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Error getting books by price' });
    });
}  

exports.getAllBooksSortedByRating = (req, res) => {
  const { order } = req.query;
  
  let sortOrder = 1;
  if (order === 'desc') {
    sortOrder = -1;
  }

  Book.find()
  .sort({ "Rating out of 5 stars": sortOrder }) // sort by rating in descending order
  .exec((err, books) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(books);
  });
}

exports.getAllBooksSortedByNoOfReviews = (req, res) => {
  const { order } = req.query;
  
  let sortOrder = 1;
  if (order === 'desc') {
    sortOrder = -1;
  }

  Book.find()
  .sort({ "Number of ratings": sortOrder }) // sort by rating in descending order
  .then((err, books) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(books);
  });

}

exports.getFilteredBooks = (req, res) => {
  let category = req.body.category ? req.body.category : undefined;
  let author = req.body.author ? req.body.author : undefined;
  
  let filters = {
    category: category,
    author: author,
  };
  
  let order = 1;
  if (req.body.order === "dsc") order = -1;
  
  Book.find(filters)
  .sort({ price: order })
  .then((data) => {
    res.json(data);
  })
  .catch((err)=>console.log(err))
}

exports.getAllCategories = (req, res) => {
  Book.distinct('category')
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Error getting categories' });
    });
};

exports.searchBooks = (req, res) => {
  const { search } = req.query;
  
  Book.find(
      { title: { $regex: search, $options: 'i' } }
  )
  .then((data) => {
    if(!data) return res.status(404).json({ error: 'No books found' });
    res.status(200).json(data);
  }
  )
  .catch((err) => {
    console.log(err);
    res.status(500).json({ error: 'Error getting books' });
  });
}

exports.getBookByCategory = (req, res) => {
  var category = req.profile.favoriteCategory

  Book.find({category: category})
  .then((data) => {
    res.status(200).json(data);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({ error: 'Error getting books' });
  }
  )
}
