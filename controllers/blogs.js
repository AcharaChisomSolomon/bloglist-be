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


blogsRouter.delete('/:id', async (request, response, next) => {
  const deletedBlog = await Blog.findByIdAndDelete(request.params.id)
  response.status(204).json(deletedBlog)
})


blogsRouter.put('/:id', async (request, response, next) => {
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true })
  response.status(201).json(updatedBlog)
})


module.exports = blogsRouter