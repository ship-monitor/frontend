import { u as useAsyncData, a as useFaq, b as useRoadmap, g as getRawRoadmapItems, c as getRawFaqItems, h as hydrateFaqItems, d as hydrateRoadmapItems, e as useLandingSeo, L as LandingPage_default } from './useLandingSeo-Dq6rQxY5.mjs';
import { defineComponent, withAsyncContext, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import '../virtual/entry.mjs';
import 'nostics';
import 'nostics/formatters/ansi';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'unhead/server';
import 'unhead/legacy';
import 'unhead/plugins';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import 'vue-router';
import 'vue-i18n';
import 'unhead/utils';
import './big-logo-IvaRNDL_.mjs';
import 'axios';

// app/pages/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	async setup(__props) {
		let __temp, __restore;
		const { data } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("landing-content", async () => {
			await Promise.allSettled([useFaq().fetchFaq(), useRoadmap().fetchRoadmap()]);
			return {
				faq: getRawFaqItems(),
				roadmap: getRawRoadmapItems()
			};
		})), __temp = await __temp, __restore(), __temp);
		if (data.value) {
			hydrateFaqItems(data.value.faq);
			hydrateRoadmapItems(data.value.roadmap);
		}
		useLandingSeo("ru");
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(LandingPage_default, _attrs, null, _parent));
		};
	}
});
// app/pages/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var pages_default = index_vue_vue_type_script_setup_true_lang_default;

export { pages_default as default };
//# sourceMappingURL=pages-bUE_GGmL.mjs.map
