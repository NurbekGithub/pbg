export default {
  "Post": {
    "GET": {
      "id": false,
      "createdAt": true,
      "title": true,
      "content": true,
      "published": true,
      "authorId": true,
      "author": null,
      "comments": {
        "id": false,
        "createdAt": true,
        "comment": true,
        "writtenById": true,
        "postId": true,
        "writtenBy": null,
        "post": null
      },
      "tags": {
        "id": false,
        "tag": true,
        "type": true,
        "posts": null
      }
    },
    "GET/:id": {
      "id": false,
      "createdAt": true,
      "title": true,
      "content": true,
      "published": true,
      "authorId": true,
      "author": null,
      "comments": null,
      "tags": null
    }
  }
}