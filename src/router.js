
import { createRouter, createWebHistory } from "vue-router";
import PresentationList from "./components/PresentationList.vue";
import Workspace from "./components/Workspace.vue";

const routes = [
  { path: "/", name: "PresentationList", component: PresentationList },
  {
    path: "/workspace/:id/:nickname",
    name: "Workspace",
    component: Workspace,
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
