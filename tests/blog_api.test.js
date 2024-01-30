const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')


beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.listWithManyBlogs.map(b => new Blog(b))
    const promiseArray = blogObjects.map(b => b.save())
    await Promise.all(promiseArray)
})


test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.listWithManyBlogs.length)
})

test('all blogs have an id property', async () => {
    const blogs = await helper.blogsInDB()
    const blogToTest = blogs[0]

    expect(blogToTest.id).toBeDefined()
})

test('can add a new blog successfully', async () => {
    const blogToAdd = {
      title: "Type warlords",
      author: "Robert C. Martins",
      url: "https://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 20,
    };

    await api
        .post('/api/blogs')
        .send(blogToAdd)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const blogsToEnd = await helper.blogsInDB()
    expect(blogsToEnd).toHaveLength(helper.listWithManyBlogs.length + 1)

    const titles = blogsToEnd.map(b => b.title)
    expect(titles).toContain('Type warlords')
})



afterAll(async () => {
    await mongoose.connection.close()
})