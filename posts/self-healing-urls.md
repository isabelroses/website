---
title: "Self-Healing URLs"
subtitle: "Creating self-healing URLs within my Vue.js website"
date: 10/12/2023
tags: ["vue", "webdev"]
---

I have been working on the creation of this [version](https://github.com/isabelroses/website/commit/8c53b9f3576d98a2ebe71976a3f921a30e6ad052) of my website for a while and when I finally thought I was done, I was introduced to the concept of self-healing URLs.

Self-healing URLs are designed in a way that if a user was to type in a URL as long as a certain part of the URL is correct, the user will be redirected to the correct page. This is useful for when a user is trying to access a page that has been moved or deleted.

For example, if a user was to type in [`https://isabelroses.com/blog/gaoengioa-2`](https://isabelroses.com/blog/gaoengioa-2) they would be redirected to [`https://isabelroses.com/blog/self-healing-urls-2`](https://isabelroses.com/blog/self-healing-urls-2) as the only important part of the URL is the "2" in this case, which refers to the second blog post by ID.

To implement this I had to make a few changes to my code. The original way that the post data was being fetched was by using the slug of the post. This meant that if the slug was incorrect, the post would not be found and the user would be redirected to a 404 page. To fix this I had to change the way that the post was being fetched to use the ID of the post instead. This meant that if the slug was incorrect, the post would still be found and the user would be redirected to the correct page.

```js
// the old code
get post() {
    return meta.posts.find((post: any) => post.slug == this.$route.params.slug);
}

// the new code
get post() {
    // get the id from the slug
    const id = (this.$route.params.slug).toString().split("-").slice(-1)[0];
    // find the post using the id
    const post = meta.posts.find((post: any) => post.id == id);

    if (this.$route.params.slug != post?.slug) {
        // create the correct slug
        const slug = post?.slug + "-" + id;
        // redirect to the correct page
        this.$router.push({ name: "BlogPost", params: { slug: slug } });
    }

    return post;
}
```

Then all that was left was to ensure all links were using the new slug format. This was done by changing the way that the slug was being created. Instead of using the title of the post, the slug was created using the title and the id of the post. This meant that the slug would always be unique and would always be the same for the same post.

#### Credits

The original idea for this post comes from: [https://www.youtube.com/watch?v=a6lnfyES-LA](https://www.youtube.com/watch?v=a6lnfyES-LA)
