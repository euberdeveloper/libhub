import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import LabelsView from '@/views/labels/LabelsView.vue';
import LibrariesView from '@/views/libraries/LibrariesView.vue';
import LibrariesLidView from '@/views/libraries/lid/LibrariesLidView.vue';


Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: '/libraries'
  },
  {
    path: '/libraries',
    name: 'libraries',
    component: LibrariesView
  },
  {
    path: '/libraries/:lid',
    name: 'libraries-lid',
    props: true,
    component: LibrariesLidView
  },
  {
    path: '/labels',
    name: 'labels',
    component: LabelsView
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
