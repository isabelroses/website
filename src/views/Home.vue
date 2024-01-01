<template>
  <div class="markdown-content general-page">
    <Dynamic :template="html"></Dynamic>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { parseMarkdown } from "@/lib/parseMarkdown";
import { hosts } from "@/lib/constants";
import Loading from "@/components/Loading.vue";
import me from "@/gen/me.json";

@Options({ components: { Loading } })
export default class Home extends Vue {
  html = "";

  mounted(): void {
    this.html = parseMarkdown(me.content);
  }
}
</script>

<style lang="sass">
.emoji
    font-weight: normal
</style>
