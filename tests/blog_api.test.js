const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')


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


describe('update of a blog', () => {
    test('succeeds with statuscode 201 if likes property is updated', async () => {
        const blogsAtStart = await helper.blogsInDB();
        const blogToUpdate = blogsAtStart[0];

        const newBlog = {
            ...blogToUpdate,
            likes: blogToUpdate.likes + 1
        };

        const updatedBlog = await api
          .put(`/api/blogs/${blogToUpdate.id}`)
          .send(newBlog)
          .expect(201)
          .expect("Content-Type", /application\/json/);

        const blogsToEnd = await helper.blogsInDB();
        expect(blogsToEnd).toHaveLength(helper.listWithManyBlogs.length);

        expect(updatedBlog.body.likes).toBe(blogToUpdate.likes + 1)
    })
})


describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDB()

    const newUser = {
      username: 'Solo',
      name: 'Chisom Solomon',
      password: 'srivanan',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await helper.usersInDB()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDB()

    const newUser = {
      username: 'root',
      name: 'SuperUser',
      password: 'salainen'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDB()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test("creation fails with proper statuscode and message if username is less than 3 characters", async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: "ro",
      name: "SuperUser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "username should be of length 3 or more"
    );

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test("creation fails with proper statuscode and message if username is not entered", async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      // username: "ro",
      name: "SuperUser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("username required");

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test("creation fails with proper statuscode and message if password is not entered", async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: "rocco",
      name: "SuperUser",
      // password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("password required");

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test("creation fails with proper statuscode and message if password is less than 3 characters", async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: "ro",
      name: "SuperUser",
      password: "sa",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("password should be 3 letters or more");

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toEqual(usersAtStart);
  });
})





afterAll(async () => {
    await mongoose.connection.close()
})