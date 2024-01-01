<template>
  <div id="index" class="index index-tags card">
    <div id="titles" class="unselectable">
      <div id="title">Index</div>
      <div id="subtitle">Quickly search for posts by tag</div>
    </div>

    <div id="content">
      <div class="tags">
        <Tag
          v-for="t in tags"
          :key="t"
          :tag-name="t[0]"
          direction="right"
          @click="(e: MouseEvent) => clickTag(e, t)"
        >
          {{ t[0] }} ({{ t[1] }})
        </Tag>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import Tag from "@/components/Tag.vue";
import { pushQuery } from "@/lib/router";

@Options({ components: { Tag } })
export default class BlogIndexLinks extends Vue {
  @Prop({ default: "tag" }) tags!: [string, number][];

  clickTag(e: MouseEvent, tag: any): void {
    e.stopPropagation();
    pushQuery({ tag: tag[0] });
  }
}
</script>

<style lang="sass" scoped>
@import "src/sass/colors"

#index
    text-align: left
    display: flex
    flex-direction: column
    overflow: hidden

    > * + *, #content > * + *
        padding-top: 10px

    #titles
        // Position patch
        margin: -15px -20px
        padding: 15px 20px

        position: relative

        #title
            font-size: 1.2em
            font-weight: bold

        #subtitle
            font-size: 0.8em
            color: $color-text-light

    .tags
        font-size: 0.7em
        z-index: 50
        display: inline-block

    .tag-wrap + .tag-wrap
        margin-left: 5px
</style>
