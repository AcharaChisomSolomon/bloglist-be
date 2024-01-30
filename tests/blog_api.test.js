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


describe('when there is initially some blogs saved', () => {
    test("all blogs are returned", async () => {
      const response = await api.get("/api/blogs");
      expect(response.body).toHaveLength(helper.listWithManyBlogs.length);
    });

    test("all blogs have an id property", async () => {
      const blogs = await helper.blogsInDB();
      const blogToTest = blogs[0];

      expect(blogToTest.id).toBeDefined();
    });
})


describe('addition of a new blog', () => {
    test("succeeds with valid data", async () => {
      const blogToAdd = {
        title: "Type warlords",
        author: "Robert C. Martins",
        url: "https://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 20,
      };

      await api
        .post("/api/blogs")
        .send(blogToAdd)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsToEnd = await helper.blogsInDB();
      expect(blogsToEnd).toHaveLength(helper.listWithManyBlogs.length + 1);

      const titles = blogsToEnd.map((b) => b.title);
      expect(titles).toContain("Type warlords");
    });

    test("makes likes property 0 if not given explicitly", async () => {
      const blogToAdd = {
        title: "Type warlords",
        author: "Robert C. Martins",
        url: "https://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      };

      const response = await api
        .post("/api/blogs")
        .send(blogToAdd)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsToEnd = await helper.blogsInDB();
      expect(blogsToEnd).toHaveLength(helper.listWithManyBlogs.length + 1);

      expect(response.body.likes).toBe(0);
    });

    test('does not add blog if "title" or "url" properties are missing', async () => {
      const blogToAdd = {
        //   title: "",
        author: "Robert C. Martins",
        //   url: "",
        likes: 20,
      };

      await api.post("/api/blogs").send(blogToAdd).expect(400);

      const blogsToEnd = await helper.blogsInDB();
      expect(blogsToEnd).toHaveLength(helper.listWithManyBlogs.length);
    });
})


describe('deletion of a blog', () => {
    test('succeeds with statuscode 204 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDB()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)
        
        const blogsAtEnd = await helper.blogsInDB()
        expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length - 1)

        const titles = blogsAtEnd.map(b => b.title)
        expect(titles).not.toContain(blogToDelete.title)
    })
})





afterAll(async () => {
    await mongoose.connection.close()
})