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


blogsRouter.post("/", async (request, response, next) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
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
  const tokenUser = request.user
  const blog = await Blog.findById(request.params.id)
  const blogUserId = blog.user.toString()

  if (tokenUser.id === blogUserId) {
    const deletedBlog = await Blog.findByIdAndDelete(request.params.id);

    const user = await User.findById(blogUserId)
    user.blogs = user.blogs.filter(b => {
      return b.toString() !== request.params.id;
    })
    await user.save()

    response.status(204).json(deletedBlog);
  } else {
    response
      .status(400)
      .json({ error: 'You are not the user of the blog you are about to delete' })
  }
})


blogsRouter.put('/:id', async (request, response, next) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true, context: 'query' })
  response.status(201).json(updatedBlog)
})


module.exports = blogsRouter