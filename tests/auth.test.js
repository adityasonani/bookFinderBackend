const assert = require('assert');
const sinon = require('sinon');
const Book = require('../model/books');
const { getAllBooks } = require('../controllers/books');
const { signup } = require('../controllers/auth');

describe('BookController', () => {
  describe('#getAllBooks', () => {
    it('should call Book.find() with limit and skip parameters', () => {
      const req = { query: { limit: 10, skip: 1 } };
      const res = { json: sinon.stub() };
      const findStub = sinon.stub(Book, 'find').resolves([]);

      return getAllBooks(req, res).then(() => {
        assert.ok(findStub.calledOnce);
        assert.deepStrictEqual(findStub.args[0][0], {});
        assert.deepStrictEqual(findStub.args[0][1], { limit: 10, skip: 0 });
        findStub.restore();
      });
    });

    it('should respond with book data as JSON', () => {
      const req = { query: { limit: 10, skip: 1 } };
      const res = { json: sinon.stub() };
      const findStub = sinon.stub(Book, 'find').returns({ limit: sinon.stub().returnsThis(), skip: sinon.stub().returnsThis(), then: sinon.stub().resolves([{ title: 'Book 1' }, { title: 'Book 2' }]) });

      return getAllBooks(req, res).then(() => {
        assert.ok(res.json.calledOnce);
        assert.deepStrictEqual(res.json.args[0][0], [{ title: 'Book 1' }, { title: 'Book 2' }]);
        findStub.restore();
      });
    });

    it('should respond with 500 error on database error', () => {
      const req = { query: { limit: 10, skip: 1 } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      const findStub = sinon.stub(Book, 'find').returns({ limit: sinon.stub().returnsThis(), skip: sinon.stub().returnsThis(), then: sinon.stub().rejects('Database error') });

      return getAllBooks(req, res).then(() => {
        assert.ok(res.status.calledOnce);
        assert.ok(res.status.calledWith(500));
        assert.ok(res.json.calledOnce);
        assert.deepStrictEqual(res.json.args[0][0], { error: 'Internal server error' });
        findStub.restore();
      });
    });
  });
});

describe('Auth Controller', () => {
  describe('signup', () => {
    beforeEach(() => {
        jest.resetModules();
    });
    
    it('should save user and return a json object with user details', async () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password@123'
        },
      };
      const res = {
        json: jest.fn(),
      };
      await signup(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'John Doe',
        email: 'johndoe@example.com',
      }));
    });
  });
});
