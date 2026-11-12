import { N as NuxtLink } from './nuxt-link-CBY6fJQO.mjs';
import { _ as _plugin_vue_export_helper_default, g as useRoute$1, S as SUPPORT_EMAIL, h as saveLocaleChoice } from '../virtual/entry.mjs';
import { b as big_logo_default } from './big-logo-IvaRNDL_.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { useI18n } from 'vue-i18n';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'nostics';
import 'nostics/formatters/ansi';
import '../routes/renderer.mjs';
import 'unhead/server';
import 'unhead/legacy';
import 'unhead/plugins';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import 'vue-router';
import 'unhead/utils';

// app/assets/big-logo-dark.webp
var big_logo_dark_default = __buildAssetsURL("big-logo-dark.DaWjB8CF.webp");
// app/layouts/landing.vue?vue&type=script&setup=true&lang.ts
var landing_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "landing",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useI18n();
		const route = useRoute$1();
		const selectLocale = (locale) => {
			saveLocaleChoice(locale);
		};
		const mobileMenuOpen = ref(false);
		const navLinks = computed(() => [
			{
				label: t("nav.devices"),
				to: "#devices"
			},
			{
				label: t("nav.pricing"),
				to: "#pricing"
			},
			{
				label: t("nav.support"),
				to: "#lead-form"
			}
		]);
		return (_ctx, _push, _parent, _attrs) => {
			const _component_NuxtLink = NuxtLink;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-cotton text-moonless-night selection:bg-moonless-night selection:text-cotton" }, _attrs))} data-v-e7041ae3><header class="fixed top-0 left-0 right-0 z-50 bg-cotton border-b border-moonless-night/10" data-v-e7041ae3><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-v-e7041ae3><div class="flex justify-between items-center py-3 sm:py-4" data-v-e7041ae3><div class="flex items-center" data-v-e7041ae3><div class="w-24 h-24 sm:w-32 sm:h-12 shrink-0" data-v-e7041ae3><img${ssrRenderAttr("src", unref(big_logo_default))} alt="ШиП-монитор" class="w-full h-full object-contain" data-v-e7041ae3></div></div><nav class="hidden md:flex gap-10" data-v-e7041ae3><!--[-->`);
			ssrRenderList(navLinks.value, (link) => {
				_push(`<a${ssrRenderAttr("href", link.to)} class="hover:text-electric-blue text-center transition-all duration-300 text-lg cursor-pointer" data-v-e7041ae3>${ssrInterpolate(link.label)}</a>`);
			});
			_push(`<!--]--></nav><div class="flex items-center gap-2" data-v-e7041ae3><nav class="hidden md:flex gap-1 rounded-full border border-moonless-night/15 p-1 text-sm" data-v-e7041ae3>`);
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/",
				class: ["rounded-full px-3 py-1 transition-colors", unref(route).path === "/" ? "bg-electric-blue text-cotton" : "hover:text-electric-blue"],
				onClick: ($event) => selectLocale("ru")
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(` RU `);
					else return [createTextVNode(" RU ")];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/en",
				class: ["rounded-full px-3 py-1 transition-colors", unref(route).path === "/en" ? "bg-electric-blue text-cotton" : "hover:text-electric-blue"],
				onClick: ($event) => selectLocale("en")
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(` EN `);
					else return [createTextVNode(" EN ")];
				}),
				_: 1
			}, _parent));
			_push(`</nav><button class="md:hidden p-2 -mr-2 text-moonless-night"${ssrRenderAttr("aria-label", _ctx.$t("layout.menu"))}${ssrRenderAttr("aria-expanded", mobileMenuOpen.value)} aria-controls="mobile-menu" data-v-e7041ae3>`);
			if (!mobileMenuOpen.value) _push(`<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-e7041ae3><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" data-v-e7041ae3></path></svg>`);
			else _push(`<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-e7041ae3><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-e7041ae3></path></svg>`);
			_push(`</button></div></div></div>`);
			if (mobileMenuOpen.value) {
				_push(`<nav id="mobile-menu" class="md:hidden bg-white border-t border-moonless-night/10" data-v-e7041ae3><div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1" data-v-e7041ae3><!--[-->`);
				ssrRenderList(navLinks.value, (link) => {
					_push(`<a${ssrRenderAttr("href", link.to)} class="block px-4 py-3 rounded-xl text-lg hover:bg-cotton hover:text-electric-blue transition-colors cursor-pointer" data-v-e7041ae3>${ssrInterpolate(link.label)}</a>`);
				});
				_push(`<!--]--><div class="flex gap-2 px-4 pt-3 text-lg" data-v-e7041ae3>`);
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: "/",
					class: ["rounded-full border border-moonless-night/15 px-4 py-2", unref(route).path === "/" ? "bg-electric-blue text-cotton border-electric-blue" : ""],
					onClick: ($event) => selectLocale("ru")
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(` RU `);
						else return [createTextVNode(" RU ")];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: "/en",
					class: ["rounded-full border border-moonless-night/15 px-4 py-2", unref(route).path === "/en" ? "bg-electric-blue text-cotton border-electric-blue" : ""],
					onClick: ($event) => selectLocale("en")
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(` EN `);
						else return [createTextVNode(" EN ")];
					}),
					_: 1
				}, _parent));
				_push(`</div></div></nav>`);
			} else _push(`<!---->`);
			_push(`</header><main class="pt-16 md:pt-20" data-v-e7041ae3>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</main><footer class="bg-moonless-night text-cotton/50" data-v-e7041ae3><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-v-e7041ae3><div class="flex flex-col md:flex-row justify-between items-center gap-4" data-v-e7041ae3><div class="w-24 h-24 sm:w-32 sm:h-12 shrink-0" data-v-e7041ae3><img${ssrRenderAttr("src", unref(big_logo_dark_default))} alt="ШиП-монитор" class="w-full h-full object-contain" data-v-e7041ae3></div><p class="text-xs sm:text-sm text-center" data-v-e7041ae3> © ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} ШиП-монитор · ${ssrInterpolate(_ctx.$t("layout.footerNote"))}</p><a${ssrRenderAttr("href", `mailto:${unref(SUPPORT_EMAIL)}`)} class="text-xs sm:text-sm text-electric-blue hover:text-electric-blue/80 transition-colors" data-v-e7041ae3>${ssrInterpolate(unref(SUPPORT_EMAIL))}</a></div></div></footer></div>`);
		};
	}
});
// app/layouts/landing.vue
var _sfc_setup = landing_vue_vue_type_script_setup_true_lang_default.setup;
landing_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/landing.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var landing_default = /*#__PURE__*/ _plugin_vue_export_helper_default(landing_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-e7041ae3"]]);

export { landing_default as default };
//# sourceMappingURL=landing-ZsthXdmz.mjs.map
