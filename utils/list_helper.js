const dummy = blogs => {
    return 1
}

const totalLikes = blogs => {
    const total = blogs.reduce((sum, c) => {
        return c.likes + sum
    }, 0)

    return blogs.length === 0
        ? 0
        : total
}

const favoriteBlog = blogs => {
    const highestLikes = Math.max(...blogs.map(blog => blog.likes))
    const fave = blogs.find(blog => blog.likes === highestLikes)

    return {
        title: fave.title,
        author: fave.author,
        likes: fave.likes
    }
}

const mostBlogs = blogs => {
    const authorNamesArr = blogs.map(b => b.author)
    const authorObj = {}

    authorNamesArr.forEach(a => {
        if (authorObj[a]) {
            authorObj[a] += 1
        } else {
            authorObj[a] = 1
        }
    })

    const highestAuthor = Math.max(...Object.values(authorObj))
    for (const a in authorObj) {
        if (authorObj[a] === highestAuthor) {
            return {
                author: a,
                blogs: authorObj[a]
            }
        }
    }
}

const mostLikes = blogs => {
    const authorObj = {}

    blogs.forEach(blog => {
        if (authorObj[blog.author]) {
            authorObj[blog.author] += blog.likes
        } else {
            authorObj[blog.author] = blog.likes
        }
    })

    const highestLikes = Math.max(...Object.values(authorObj))
    for (const a in authorObj) {
        if (authorObj[a] === highestLikes) {
            return {
                author: a,
                likes: authorObj[a]
            }
        }
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}