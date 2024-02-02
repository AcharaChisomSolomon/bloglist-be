const blogsRouter = require('express').Router()
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken')


blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(blogs);
});


const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}


blogsRouter.post("/", async (request, response, next) => {
  const body = request.body
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const blogToAdd = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  });

  const newBlog = await blogToAdd.save()
  user.blogs = user.blogs.concat(newBlog._id)
  await user.save()

  response.status(201).json(newBlog);
});


blogsRouter.delete('/:id', async (request, response, next) => {
  const deletedBlog = await Blog.findByIdAndDelete(request.params.id)
  response.status(204).json(deletedBlog)
})


blogsRouter.put('/:id', async (request, response, next) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true, context: 'query' })
  response.status(201).json(updatedBlog)
})


module.exports = blogsRouter