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
      "comments": null,
      "tags": null
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