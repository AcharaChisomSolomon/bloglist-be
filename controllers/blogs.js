const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}) 
  response.json(blogs);
});


blogsRouter.post("/", async (request, response, next) => {
  const body = request.body
  const blogToAdd = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  });

  const newBlog = await blogToAdd.save() 
  response.status(201).json(newBlog);
});


blogsRouter.delete('/:id', async (request, response) => {
  const deletedBlog = await Blog.findByIdAndDelete(request.params.id)
  response.status(204).json(deletedBlog)
})


module.exports = blogsRouter