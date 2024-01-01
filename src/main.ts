import { createApp, h } from "vue";
import App from "@/App.vue";
import router from "@/lib/router";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Fold from "@/components/Fold.vue";
import BlogIndex from "@/components/BlogIndex.vue";
import Tag from "@/components/Tag.vue";

const app = createApp(App).use(router)
  .component("Fold", Fold)
  .component("BlogIndex", BlogIndex)
  .component("Dynamic", {
    props: ["template"],
    render() {
      return h({ template: this.template });
    },
  })
  .component("Tag", Tag);

// app.config.performance = true
app.mount("#app");
