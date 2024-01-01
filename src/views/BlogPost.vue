<template>
  <div class="general-page" v-if="post">
    <div class="title unselectable tag-top">
      <h2>{{ post.title }}</h2>
      <div class="subtitle" v-if="post.subtitle">{{ post.subtitle }}</div>
      <div id="date">{{ post.date }}</div>
      <div class="tags">
        <Tag v-for="t in post.tags" :key="t" direction="left">{{ t }}</Tag>
      </div>
    </div>

    <div id="content" />
  </div>

  <div v-else>
    <div class="title unselectable">
      <h2>404</h2>
      <div class="subtitle">Post not found</div>
    </div>
  </div>
</template>

<script lang="ts">
import meta from "@/gen/metas.json";
import { parseMarkdown } from "@/lib/parseMarkdown";
import { Vue, Options } from "vue-property-decorator";

@Options({ components: {} })
export default class BlogPost extends Vue {
  get post() {
    const id = this.$route.params.slug.toString().split("-").slice(-1)[0];
    const post = meta.posts.find((post: any) => post.id == id);

    if (this.$route.params.slug != post?.slug) {
      const slug = post?.slug + "-" + id;
      this.$router.push({ name: "BlogPost", params: { slug: slug } });
    }

    return post;
  }

  async mounted() {
    if (this.post?.title) {
      const DEFAULT_TITLE = "Blog";
      document.title = DEFAULT_TITLE + " > " + this.post.title || DEFAULT_TITLE;
    }

    const content = document.getElementById("content");
    if (this.post?.content && content) {
      content.innerHTML = await parseMarkdown(this.post.content);
    }
  }
}
</script>

<style lang="sass" scoped>
@import "src/sass/colors"

// Fix accordion overflow: none
#content
    $padding: 20px
    margin-left: -$padding
    padding-left: $padding
    margin-right: -$padding
    padding-right: $padding

    img
        $margin: 10px
        max-width: calc(100% + 2 * $margin)
        min-width: calc(100% + 2 * $margin)
        border-radius: 10px
        margin-left: -$margin
        margin-right: -$margin

#date
    font-size: 0.7em
    color: $color-text-light

.tags
    font-size: 0.7em
    z-index: 50

    #pin
        margin-left: 10px
        transform: rotate(45deg)

.tag-wrap + .tag-wrap
    margin-left: 5px

.title
    // Position patch
    margin: 15px -20px
    padding: 15px 20px
    position: relative

#expand
    font-size: 0.8em
    padding-top: 10px
    color: $color-text-light

// Put tags on top
.tag-top
    .tags
        position: absolute
        right: 20px
        top: 40px

@media screen and (max-width: 400px)
    #post
        img
            $margin: 15px
            max-width: calc(100% + 2 * $margin)
            min-width: calc(100% + 2 * $margin)
            border-radius: 10px
            margin-left: -$margin
            margin-right: -$margin
</style>
