const listHelper = require('../utils/list_helper')
const helper = require('./test_helper')


test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
})


describe('total likes', () => {
    test('of empty list is zero', () => {
        expect(listHelper.totalLikes([])).toBe(0)
    })

    test('when list has only one blog, equals the likes of that', () => {
        const result = listHelper.totalLikes(helper.listWithOneBlog)
        expect(result).toBe(5)
    })

    test('of a bigger list is calculated right', () => {
        expect(listHelper.totalLikes(helper.listWithManyBlogs)).toBe(36)
    })
})


describe('Favorite Blog', () => {
    test('when list has one blog', () => {
        expect(listHelper.favoriteBlog(helper.listWithOneBlog)).toEqual({
          title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
          likes: 5,
        });
    })

    test('when list has many blogs', () => {
        expect(listHelper.favoriteBlog(helper.listWithManyBlogs)).toEqual({
          title: "Canonical string reduction",
          author: "Edsger W. Dijkstra",
          likes: 12,
        });
    })
})


describe('Most blogs', () => {
    test('when list has one blog', () => {
        expect(listHelper.mostBlogs(helper.listWithOneBlog)).toEqual({
            author: "Edsger W. Dijkstra",
            blogs: 1
        })
    })
    test('when list has many blogs', () => {
        expect(listHelper.mostBlogs(helper.listWithManyBlogs)).toEqual({
            author: "Robert C. Martin",
            blogs: 3
        })
    })
})


describe("Most likes", () => {
    test("when list has one blog", () => {
        expect(listHelper.mostLikes(helper.listWithOneBlog)).toEqual({
            author: "Edsger W. Dijkstra",
            likes: 5,
        });
    });
    test("when list has many blogs", () => {
        expect(listHelper.mostLikes(helper.listWithManyBlogs)).toEqual({
            author: "Edsger W. Dijkstra",
            likes: 17,
        });
    });
});