<template>
  <div class="markdown-content general-page">
    <Dynamic :template="content" v-if="content" />
    <Loading v-else />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { parseMarkdown } from "@/lib/parseMarkdown";
import Loading from "@/components/Loading.vue";
import me from "@/gen/me.json";

@Options({ components: { Loading } })
export default class Home extends Vue {
  content = "";

  async mounted(): void {
    if (me.content) {
      this.content = await parseMarkdown(me.content);
    }
  }
}
</script>

<style lang="sass">
.emoji
    font-weight: normal
</style>
