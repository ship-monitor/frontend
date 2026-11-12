import { l as localeRef, u as useSeoMeta$2, a as useHead$2, _ as _plugin_vue_export_helper_default, b as appDiagnostics, s as sanitizeTag, c as useNuxtApp, d as asyncDataDefaults, p as prodReporters, e as docsBase, f as createError$2 } from '../virtual/entry.mjs';
import { b as big_logo_default } from './big-logo-IvaRNDL_.mjs';
import { defineProdDiagnostics } from 'nostics';
import { computed, ref, defineComponent, reactive, withCtx, createTextVNode, toDisplayString, unref, openBlock, createBlock, createVNode, mergeProps, resolveDynamicComponent, createElementBlock, shallowRef, getCurrentInstance, provide, cloneVNode, h, isRef, toValue, onServerPrefetch, useSSRContext, nextTick, toRef, queuePostFlushCb } from 'vue';
import { useI18n } from 'vue-i18n';
import { ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderAttrs, ssrRenderSlot, ssrRenderVNode } from 'vue/server-renderer';
import axios from 'axios';

// node_modules/nuxt/dist/app/utils/debounce-tick.js
/**
* Debounce an async function so that repeated calls within the same tick are
* collapsed into a single call (plus a trailing call if arguments arrived
* while the debounced call was still pending).
*
* Adapted from https://github.com/unjs/perfect-debounce with the timeout
* replaced by Vue's post-flush callback queue.
*/
function debounceTick(fn, options = {}) {
	let leadingValue;
	let active = false;
	let resolveList = [];
	let currentPromise;
	let trailingArgs;
	const applyFn = (_this, args) => {
		const promise = _applyPromised(fn, _this, args);
		currentPromise = promise;
		promise.finally(() => {
			currentPromise = void 0;
			if (trailingArgs && !active) {
				const args = trailingArgs;
				trailingArgs = void 0;
				applyFn(_this, args);
			}
		});
		return promise;
	};
	return function(...args) {
		trailingArgs = args;
		if (currentPromise) return currentPromise;
		return new Promise((resolve) => {
			const shouldCallNow = options.leading && !active;
			if (!active) {
				active = true;
				queuePostFlushCb(() => {
					active = false;
					const flushArgs = trailingArgs ?? args;
					trailingArgs = void 0;
					const promise = options.leading ? leadingValue : applyFn(this, flushArgs);
					for (const _resolve of resolveList) _resolve(promise);
					resolveList = [];
				});
			}
			if (shouldCallNow) {
				leadingValue = applyFn(this, args);
				resolve(leadingValue);
			} else resolveList.push(resolve);
		});
	};
}
async function _applyPromised(fn, _this, args) {
	return await fn.apply(_this, args);
}
defineComponent({
	name: "ServerPlaceholder",
	render() {
		return createElementBlock("div");
	}
});
// node_modules/nuxt/dist/app/components/client-only.js
var clientOnlySymbol = Symbol.for("nuxt:client-only");
defineComponent({
	name: "ClientOnly",
	inheritAttrs: false,
	props: [
		"fallback",
		"placeholder",
		"placeholderTag",
		"fallbackTag"
	],
	setup(props, { slots, attrs }) {
		const mounted = shallowRef(false);
		const vm = getCurrentInstance();
		if (vm) vm._nuxtClientOnly = true;
		provide(clientOnlySymbol, true);
		return () => {
			if (mounted.value) {
				const vnodes = slots.default?.();
				if (vnodes && vnodes.length === 1) return [cloneVNode(vnodes[0], attrs)];
				return vnodes;
			}
			const slot = slots.fallback || slots.placeholder;
			if (slot) return h(slot);
			const fallbackStr = props.fallback || props.placeholder || "";
			const fallbackTag = sanitizeTag(props.fallbackTag || props.placeholderTag, "span");
			return createElementBlock(fallbackTag, attrs, fallbackStr);
		};
	}
});
// node_modules/nuxt/dist/compiler/runtime/index.js
/**
* Define a factory for a function that should be registered for automatic key injection.
* @since 4.2.0
* @param factory
*/
function defineKeyedFunctionFactory(factory) {
	const placeholder = function() {
		throw appDiagnostics.NUXT_E1007({ name: factory.name });
	};
	return Object.defineProperty(placeholder, "__nuxt_factory", {
		enumerable: false,
		get: () => factory.factory
	});
}
// node_modules/nuxt/dist/app/diagnostics/data.js
/**
* E3xxx
* Data fetching (useFetch / useAsyncData) runtime diagnostics.
*/
var dataDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
// node_modules/nuxt/dist/app/composables/asyncData.js
var createUseAsyncData = defineKeyedFunctionFactory({
	name: "createUseAsyncData",
	factory(options = {}) {
		function useAsyncData(...args) {
			const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
			if (_isAutoKeyNeeded(args[0], args[1])) args.unshift(autoKey);
			let [_key, _handler, opts = {}] = args;
			const key = isRef(_key) || typeof _key === "function" ? computed(() => toValue(_key)) : { value: _key };
			if (!key.value || typeof key.value !== "string") throw dataDiagnostics.NUXT_E3008();
			if (typeof _handler !== "function") throw dataDiagnostics.NUXT_E3009();
			const shouldFactoryOptionsOverride = typeof options === "function";
			const nuxtApp = useNuxtApp();
			const factoryOptions = shouldFactoryOptionsOverride ? options(opts) : options;
			if (!shouldFactoryOptionsOverride) for (const key in factoryOptions) {
				if (factoryOptions[key] === void 0) continue;
				if (opts[key] !== void 0) continue;
				opts[key] = factoryOptions[key];
			}
			opts.server ??= true;
			opts.default ??= getDefault;
			opts.getCachedData ??= getDefaultCachedData;
			opts.lazy ??= false;
			opts.immediate ??= true;
			opts.deep ??= asyncDataDefaults.deep;
			opts.dedupe ??= "cancel";
			opts.enabled ??= true;
			if (shouldFactoryOptionsOverride) for (const key in factoryOptions) {
				if (factoryOptions[key] === void 0) continue;
				opts[key] = factoryOptions[key];
			}
			nuxtApp._asyncData[key.value];
			function createInitialFetch() {
				const initialFetchOptions = {
					cause: "initial",
					dedupe: opts.dedupe
				};
				const existing = nuxtApp._asyncData[key.value];
				if (!existing?._init) {
					initialFetchOptions.cachedData = opts.getCachedData(key.value, nuxtApp, { cause: "initial" });
					nuxtApp._asyncData[key.value] = buildAsyncData(nuxtApp, key.value, _handler, opts, initialFetchOptions.cachedData);
					nuxtApp._asyncData[key.value]._initialCachedData = initialFetchOptions.cachedData;
				} else if (nuxtApp._asyncDataPromises[key.value]) initialFetchOptions.cachedData = existing._initialCachedData;
				return () => nuxtApp._asyncData[key.value].execute(initialFetchOptions);
			}
			const initialFetch = createInitialFetch();
			const asyncData = nuxtApp._asyncData[key.value];
			asyncData._deps++;
			if (opts.server !== false && nuxtApp.payload.serverRendered && opts.immediate) {
				const promise = initialFetch();
				if (getCurrentInstance()) onServerPrefetch(() => promise);
				else nuxtApp.hook("app:created", async () => {
					await promise;
				});
			}
			const asyncReturn = {
				data: writableComputedRef(() => nuxtApp._asyncData[key.value]?.data),
				pending: writableComputedRef(() => nuxtApp._asyncData[key.value]?.pending),
				status: writableComputedRef(() => nuxtApp._asyncData[key.value]?.status),
				error: writableComputedRef(() => nuxtApp._asyncData[key.value]?.error),
				refresh: (...args) => {
					if (!nuxtApp._asyncData[key.value]?._init) return createInitialFetch()();
					return nuxtApp._asyncData[key.value].execute(...args);
				},
				execute: (...args) => asyncReturn.refresh(...args),
				clear: () => {
					const entry = nuxtApp._asyncData[key.value];
					if (entry?._abortController) try {
						entry._abortController.abort(new DOMException("AsyncData aborted by user.", "AbortError"));
					} finally {
						entry._abortController = void 0;
					}
					clearNuxtDataByKey(nuxtApp, key.value);
				}
			};
			const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key.value]).then(() => asyncReturn);
			Object.assign(asyncDataPromise, asyncReturn);
			Object.defineProperties(asyncDataPromise, {
				then: {
					enumerable: true,
					value: asyncDataPromise.then.bind(asyncDataPromise)
				},
				catch: {
					enumerable: true,
					value: asyncDataPromise.catch.bind(asyncDataPromise)
				},
				finally: {
					enumerable: true,
					value: asyncDataPromise.finally.bind(asyncDataPromise)
				}
			});
			return asyncDataPromise;
		}
		return useAsyncData;
	}
});
var useAsyncData = createUseAsyncData.__nuxt_factory();
createUseAsyncData.__nuxt_factory({
	lazy: true,
	_functionName: "useLazyAsyncData"
});
function writableComputedRef(getter) {
	return computed({
		get() {
			return getter()?.value;
		},
		set(value) {
			const ref = getter();
			if (ref) ref.value = value;
		}
	});
}
function _isAutoKeyNeeded(keyOrFetcher, fetcher) {
	if (typeof keyOrFetcher === "string") return false;
	if (typeof keyOrFetcher === "object" && keyOrFetcher !== null) return false;
	if (typeof keyOrFetcher === "function" && typeof fetcher === "function") return false;
	return true;
}
function clearNuxtDataByKey(nuxtApp, key) {
	delete nuxtApp.payload.data[key];
	delete nuxtApp.payload._errors[key];
	if (nuxtApp._asyncData[key]) {
		nuxtApp._asyncData[key].data.value = unref(nuxtApp._asyncData[key]._default());
		nuxtApp._asyncData[key].error.value = void 0;
		nuxtApp._asyncData[key].status.value = "idle";
		nuxtApp._asyncData[key]._initialCachedData = void 0;
	}
	delete nuxtApp._asyncDataPromises[key];
}
function pick(obj, keys) {
	const newObj = {};
	for (const key of keys) newObj[key] = obj[key];
	return newObj;
}
function buildAsyncData(nuxtApp, key, _handler, options, initialCachedData) {
	nuxtApp.payload._errors[key] ??= void 0;
	const hasCustomGetCachedData = options.getCachedData !== getDefaultCachedData;
	const handler = _handler ;
	const _ref = options.deep ? ref : shallowRef;
	const hasCachedData = initialCachedData !== void 0;
	const unsubRefreshAsyncData = nuxtApp.hook("app:data:refresh", async (keys) => {
		if (!keys || keys.includes(key)) await asyncData.execute({ cause: "refresh:hook" });
	});
	const asyncData = {
		data: _ref(hasCachedData ? initialCachedData : options.default()),
		pending: computed(() => asyncData.status.value === "pending"),
		error: toRef(nuxtApp.payload._errors, key),
		status: shallowRef("idle"),
		execute: (...args) => {
			const [_opts, newValue = void 0] = args;
			const opts = _opts && newValue === void 0 && typeof _opts === "object" ? _opts : {};
			if (nuxtApp._asyncDataPromises[key]) {
				if ((opts.dedupe ?? options.dedupe) === "defer") return nuxtApp._asyncDataPromises[key];
			}
			{
				const cachedData = "cachedData" in opts ? opts.cachedData : options.getCachedData(key, nuxtApp, { cause: opts.cause ?? "refresh:manual" });
				if (cachedData !== void 0) {
					nuxtApp.payload.data[key] = asyncData.data.value = cachedData;
					asyncData.error.value = void 0;
					asyncData.status.value = "success";
					return Promise.resolve(cachedData);
				}
			}
			if (toValue(options.enabled) === false) return Promise.resolve(asyncData.data.value);
			if (asyncData._abortController) asyncData._abortController.abort(new DOMException("AsyncData request cancelled by deduplication", "AbortError"));
			asyncData._abortController = new AbortController();
			asyncData.status.value = "pending";
			const cleanupController = new AbortController();
			const promise = new Promise((resolve, reject) => {
				try {
					const timeout = opts.timeout ?? options.timeout;
					const mergedSignal = mergeAbortSignals([asyncData._abortController?.signal, opts?.signal], cleanupController.signal, timeout);
					if (mergedSignal.aborted) {
						const reason = mergedSignal.reason;
						reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
						return;
					}
					mergedSignal.addEventListener("abort", () => {
						const reason = mergedSignal.reason;
						reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
					}, {
						once: true,
						signal: cleanupController.signal
					});
					return Promise.resolve(handler(nuxtApp, { signal: mergedSignal })).then(resolve, reject);
				} catch (err) {
					reject(err);
				}
			}).then(async (_result) => {
				if (nuxtApp._asyncDataPromises[key] !== promise) return;
				let result = _result;
				if (options.transform) result = await options.transform(_result);
				if (options.pick) result = pick(result, options.pick);
				nuxtApp.payload.data[key] = result;
				asyncData.data.value = result;
				asyncData.error.value = void 0;
				asyncData.status.value = "success";
			}).catch((error) => {
				if (nuxtApp._asyncDataPromises[key] !== promise) return nuxtApp._asyncDataPromises[key];
				if (asyncData._abortController?.signal.aborted) return nuxtApp._asyncDataPromises[key];
				if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") {
					asyncData.status.value = "idle";
					return nuxtApp._asyncDataPromises[key];
				}
				asyncData.error.value = createError$2(error);
				asyncData.data.value = unref(options.default());
				asyncData.status.value = "error";
			}).finally(() => {
				cleanupController.abort();
				if (nuxtApp._asyncDataPromises[key] === promise) delete nuxtApp._asyncDataPromises[key];
			});
			nuxtApp._asyncDataPromises[key] = promise;
			return nuxtApp._asyncDataPromises[key];
		},
		_execute: debounceTick((...args) => asyncData.execute(...args)),
		_default: options.default,
		_deps: 0,
		_init: true,
		_hash: void 0,
		_off: () => {
			unsubRefreshAsyncData();
			if (nuxtApp._asyncData[key]?._init) nuxtApp._asyncData[key]._init = false;
			if (nuxtApp._asyncDataPromises[key]) {
				asyncData._abortController?.abort(new DOMException("AsyncData request cancelled by unmount", "AbortError"));
				delete nuxtApp._asyncDataPromises[key];
				if (asyncData.status.value === "pending") asyncData.status.value = "idle";
			}
			if (!hasCustomGetCachedData) nextTick(() => {
				if (!nuxtApp._asyncData[key]?._init) {
					clearNuxtDataByKey(nuxtApp, key);
					asyncData.execute = () => Promise.resolve();
				}
			});
		}
	};
	return asyncData;
}
var getDefault = () => void 0;
var getDefaultCachedData = (key, nuxtApp, ctx) => {
	if (nuxtApp.isHydrating) return nuxtApp.payload.data[key];
	if (ctx.cause !== "refresh:manual" && ctx.cause !== "refresh:hook") return nuxtApp.static.data[key];
};
function mergeAbortSignals(signals, cleanupSignal, timeout) {
	const list = signals.filter((s) => !!s);
	if (typeof timeout === "number" && timeout >= 0) {
		const timeoutSignal = AbortSignal.timeout?.(timeout);
		if (timeoutSignal) list.push(timeoutSignal);
	}
	if (AbortSignal.any) return AbortSignal.any(list);
	const controller = new AbortController();
	for (const sig of list) if (sig.aborted) {
		const reason = sig.reason ?? new DOMException("Aborted", "AbortError");
		try {
			controller.abort(reason);
		} catch {
			controller.abort();
		}
		return controller.signal;
	}
	const onAbort = () => {
		const reason = list.find((s) => s.aborted)?.reason ?? new DOMException("Aborted", "AbortError");
		try {
			controller.abort(reason);
		} catch {
			controller.abort();
		}
	};
	for (const sig of list) sig.addEventListener?.("abort", onAbort, {
		once: true,
		signal: cleanupSignal
	});
	return controller.signal;
}
// app/composables/api_cms.ts
var cmsApi = axios.create({
	baseURL: "https://cms.ship-monitor.ru",
	timeout: 1e4
});
// app/utils/cms_locale.ts
function pickTranslation(translations, locale, field) {
	const value = (translations ?? []).find((item) => String(item.languages_code ?? "").toLowerCase().slice(0, 2) === locale)?.[field];
	return typeof value === "string" ? value : null;
}
// app/composables/useRoadmap.ts
var rawItems$1 = ref([]);
var isLoading$2 = ref(false);
var error$2 = ref(null);
var translationsSupported$1 = true;
var inflight$1 = null;
var sortItems = (items) => items.sort((a, b) => {
	return new Date(a.stage_date).getTime() - new Date(b.stage_date).getTime();
});
function localize$1(item, locale) {
	return {
		...item,
		stage_name: pickTranslation(item.translations, locale, "stage_name") ?? item.stage_name,
		stage_description: pickTranslation(item.translations, locale, "stage_description") ?? item.stage_description
	};
}
async function doFetch$1() {
	error$2.value = null;
	try {
		let response = translationsSupported$1 ? await cmsApi.get("/items/roadmap_items?fields=*,translations.*") : null;
		if (response && response.status !== 200) {
			translationsSupported$1 = false;
			response = null;
		}
		if (!response) response = await cmsApi.get("/items/roadmap_items");
		if (response.status === 200 && response.data) rawItems$1.value = sortItems(response.data.data);
		else error$2.value = "Failed to fetch roadmap data";
	} catch (err) {
		error$2.value = "Error fetching roadmap data";
		console.error(err);
	} finally {
		isLoading$2.value = false;
	}
}
var useRoadmap = () => {
	const locale = localeRef();
	const fetchRoadmap = () => {
		if (rawItems$1.value.length > 0) return Promise.resolve();
		if (!inflight$1) {
			isLoading$2.value = true;
			inflight$1 = doFetch$1().finally(() => {
				inflight$1 = null;
			});
		}
		return inflight$1;
	};
	return {
		roadmapItems: computed(() => rawItems$1.value.map((item) => localize$1(item, locale.value))),
		isLoading: isLoading$2,
		error: error$2,
		fetchRoadmap
	};
};
function getRawRoadmapItems() {
	return rawItems$1.value;
}
function hydrateRoadmapItems(items) {
	if (rawItems$1.value.length === 0 && items.length > 0) rawItems$1.value = items;
}
// app/composables/useLeads.ts
ref(false);
ref(null);
// app/components/ShipHeading.vue?vue&type=script&setup=true&lang.ts
var ShipHeading_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ShipHeading",
	__ssrInlineRender: true,
	props: {
		heading: {},
		headingAlt: { default: "" },
		description: { default: "" },
		level: { default: 2 }
	},
	setup(__props) {
		const props = __props;
		const headingTag = computed(() => `h${props.level}`);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "mb-12 grid gap-6 md:mb-16 md:grid-cols-[0.8fr_1fr] md:items-end" }, _attrs))}><div>`);
			if (__props.headingAlt) _push(`<p class="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-electric-blue">${ssrInterpolate(__props.headingAlt)}</p>`);
			else _push(`<!---->`);
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(headingTag.value), { class: "text-5xl font-bold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(__props.heading)}`);
					else return [createTextVNode(toDisplayString(__props.heading), 1)];
				}),
				_: 1
			}), _parent);
			_push(`</div>`);
			if (__props.description) _push(`<p class="max-w-xl text-base leading-7 text-moonless-night/50 md:justify-self-end md:text-lg">${ssrInterpolate(__props.description)}</p>`);
			else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
// app/components/ShipHeading.vue
var _sfc_setup$5 = ShipHeading_vue_vue_type_script_setup_true_lang_default.setup;
ShipHeading_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ShipHeading.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var ShipHeading_default = Object.assign(ShipHeading_vue_vue_type_script_setup_true_lang_default, { __name: "ShipHeading" });
// app/composables/useFaq.ts
var rawItems = ref([]);
var isLoading = ref(false);
var error = ref(null);
var translationsSupported = true;
var inflight = null;
function localize(item, locale) {
	return {
		...item,
		title: pickTranslation(item.translations, locale, "title") ?? item.title,
		answer: pickTranslation(item.translations, locale, "answer") ?? item.answer
	};
}
async function doFetch() {
	error.value = null;
	try {
		let response = translationsSupported ? await cmsApi.get("/items/faq?fields=*,translations.*") : null;
		if (response && response.status !== 200) {
			translationsSupported = false;
			response = null;
		}
		if (!response) response = await cmsApi.get("/items/faq");
		if (response.status === 200 && response.data) rawItems.value = response.data.data;
		else error.value = "Failed to fetch FAQ data";
	} catch (err) {
		error.value = "Error fetching FAQ data";
		console.error(err);
	} finally {
		isLoading.value = false;
	}
}
var useFaq = () => {
	const locale = localeRef();
	const fetchFaq = () => {
		if (rawItems.value.length > 0) return Promise.resolve();
		if (!inflight) {
			isLoading.value = true;
			inflight = doFetch().finally(() => {
				inflight = null;
			});
		}
		return inflight;
	};
	return {
		faqItems: computed(() => rawItems.value.map((item) => localize(item, locale.value))),
		isLoading,
		error,
		fetchFaq
	};
};
function getRawFaqItems() {
	return rawItems.value;
}
function hydrateFaqItems(items) {
	if (rawItems.value.length === 0 && items.length > 0) rawItems.value = items;
}
// app/components/AISection.vue?vue&type=script&setup=true&lang.ts
var AISection_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AISection",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useI18n();
		const { faqItems, isLoading, error} = useFaq();
		const standardFeatures = computed(() => [
			t("pricing.standardF1"),
			t("pricing.standardF2"),
			t("pricing.standardF3"),
			t("pricing.standardF4"),
			t("pricing.standardF5")
		]);
		const corporateFeatures = computed(() => [
			t("pricing.corporateF1"),
			t("pricing.corporateF2"),
			t("pricing.corporateF3"),
			t("pricing.corporateF4"),
			t("pricing.corporateF5")
		]);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[--><section id="devices" class="py-20 md:py-28 lg:py-32 bg-white"><div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">`);
			_push(ssrRenderComponent(ShipHeading_default, {
				heading: _ctx.$t("devices.heading"),
				"heading-alt": _ctx.$t("devices.headingAlt"),
				description: _ctx.$t("devices.description")
			}, null, _parent));
			_push(`<div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"><article class="bg-cotton overflow-hidden rounded-[26px] border border-moonless-night/10"><div class="grid min-h-[310px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(52,120,212,0.14),transparent_58%)]"><div class="relative h-[145px] w-[110px] rotate-[-5deg] rounded-3xl border-[7px] border-[#252525] bg-white px-4 py-6 shadow-2xl"><span class="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-electric-blue"></span><div class="mt-9 grid h-14 place-items-center rounded-lg bg-[#1e2633] font-mono text-lg text-[#9ec5ff]"> +4.2° </div><span class="absolute bottom-5 left-5 font-extrabold">ШиП</span></div></div><div class="p-6 sm:p-8"><p class="mb-2 text-xs font-bold uppercase tracking-wide text-electric-blue">${ssrInterpolate(_ctx.$t("devices.sensorCategory"))}</p><h3 class="text-3xl font-bold"> ШиП T1 </h3><p class="mt-4 leading-7 text-moonless-night/50">${ssrInterpolate(_ctx.$t("devices.sensorDescription"))}</p><dl class="mt-7 grid grid-cols-3 gap-3"><div><dt class="mb-1 text-xs text-moonless-night/50">${ssrInterpolate(_ctx.$t("devices.range"))}</dt><dd class="text-sm font-semibold"> −40…+85 °C </dd></div><div><dt class="mb-1 text-xs text-moonless-night/50">${ssrInterpolate(_ctx.$t("devices.link"))}</dt><dd class="text-sm font-semibold">${ssrInterpolate(_ctx.$t("devices.radio"))}</dd></div><div><dt class="mb-1 text-xs text-moonless-night/50">${ssrInterpolate(_ctx.$t("devices.power"))}</dt><dd class="text-sm font-semibold">${ssrInterpolate(_ctx.$t("devices.battery"))}</dd></div></dl><div class="mt-8 flex items-center justify-between border-t border-moonless-night/10 pt-6"><strong class="text-xl">${ssrInterpolate(_ctx.$t("devices.sensorPrice"))}</strong><a href="#lead-form" class="group inline-flex items-center gap-2 font-semibold text-electric-blue">${ssrInterpolate(_ctx.$t("devices.request"))}<span class="transition-transform group-hover:translate-x-1">→</span></a></div></div></article><article class="bg-cotton overflow-hidden rounded-[26px] border border-moonless-night/10"><div class="grid min-h-[310px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(52,120,212,0.14),transparent_58%)]"><div class="relative h-[160px] w-[210px] rotate-3 rounded-3xl border-[7px] border-[#252525] bg-white px-4 py-6 shadow-2xl"><span class="absolute -top-12 right-6 h-12 w-2 rounded-t-full bg-[#252525]"></span><span class="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-electric-blue"></span><div class="mt-8 grid h-12 place-items-center rounded-lg bg-[#1e2633] font-mono text-sm text-[#9ec5ff]"> ONLINE </div><span class="absolute bottom-4 left-5 font-extrabold">ШиП</span></div></div><div class="p-6 sm:p-8"><p class="mb-2 text-xs font-bold uppercase tracking-wide text-electric-blue">${ssrInterpolate(_ctx.$t("devices.hubCategory"))}</p><h3 class="text-3xl font-bold"> ШиП Hub </h3><p class="mt-4 leading-7 text-moonless-night/50">${ssrInterpolate(_ctx.$t("devices.hubDescription"))}</p><dl class="mt-7 grid grid-cols-3 gap-3"><div><dt class="mb-1 text-xs text-moonless-night/50">${ssrInterpolate(_ctx.$t("devices.channels"))}</dt><dd class="text-sm font-semibold"> Wi-Fi + GSM </dd></div><div><dt class="mb-1 text-xs text-moonless-night/50">${ssrInterpolate(_ctx.$t("devices.sensors"))}</dt><dd class="text-sm font-semibold">${ssrInterpolate(_ctx.$t("devices.upTo32"))}</dd></div><div><dt class="mb-1 text-xs text-moonless-night/50">${ssrInterpolate(_ctx.$t("devices.backup"))}</dt><dd class="text-sm font-semibold">${ssrInterpolate(_ctx.$t("devices.backupTime"))}</dd></div></dl><div class="mt-8 flex items-center justify-between border-t border-moonless-night/10 pt-6"><strong class="text-xl">${ssrInterpolate(_ctx.$t("devices.hubPrice"))}</strong><a href="#lead-form" class="group inline-flex items-center gap-2 font-semibold text-electric-blue">${ssrInterpolate(_ctx.$t("devices.request"))}<span class="transition-transform group-hover:translate-x-1">→</span></a></div></div></article></div></div></section><section id="pricing" class="py-20 md:py-28 lg:py-32"><div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">`);
			_push(ssrRenderComponent(ShipHeading_default, {
				heading: _ctx.$t("pricing.heading"),
				"heading-alt": _ctx.$t("pricing.headingAlt"),
				description: _ctx.$t("pricing.description")
			}, null, _parent));
			_push(`<div class="grid gap-5 md:grid-cols-2 max-w-4xl mx-auto"><article class="flex min-h-[570px] flex-col justify-between rounded-[26px] border border-moonless-night/10 bg-white/40 p-7 sm:p-9"><div><p class="mb-3 text-sm text-moonless-night/50">${ssrInterpolate(_ctx.$t("pricing.standardSubtitle"))}</p><h3 class="text-3xl font-bold">${ssrInterpolate(_ctx.$t("pricing.standardTitle"))}</h3><div class="my-8 min-h-[70px]"><span class="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">${ssrInterpolate(_ctx.$t("pricing.standardPrice"))}</span><span class="text-moonless-night/50">${ssrInterpolate(_ctx.$t("pricing.perMonth"))}</span></div><ul class="space-y-4"><!--[-->`);
			ssrRenderList(standardFeatures.value, (feature) => {
				_push(`<li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-[&#39;✓&#39;]">${ssrInterpolate(feature)}</li>`);
			});
			_push(`<!--]--></ul></div><a href="#lead-form" class="mt-10 inline-flex min-h-13 items-center justify-center rounded-full border border-moonless-night/15 px-6 font-semibold transition hover:-translate-y-0.5 hover:border-moonless-night">${ssrInterpolate(_ctx.$t("pricing.connect"))}</a></article><article class="flex min-h-[570px] flex-col justify-between rounded-[26px] border border-moonless-night/10 bg-white/40 p-7 sm:p-9"><div><p class="mb-3 text-sm text-moonless-night/50">${ssrInterpolate(_ctx.$t("pricing.corporateSubtitle"))}</p><h3 class="text-3xl font-bold">${ssrInterpolate(_ctx.$t("pricing.corporateTitle"))}</h3><div class="my-8 min-h-[70px]"><span class="text-4xl font-bold tracking-[-0.04em]">${ssrInterpolate(_ctx.$t("pricing.corporatePrice"))}</span></div><ul class="space-y-4"><!--[-->`);
			ssrRenderList(corporateFeatures.value, (feature) => {
				_push(`<li class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-[&#39;✓&#39;]">${ssrInterpolate(feature)}</li>`);
			});
			_push(`<!--]--></ul></div><a href="#lead-form" class="mt-10 inline-flex min-h-13 items-center justify-center rounded-full border border-moonless-night/15 px-6 font-semibold transition hover:-translate-y-0.5 hover:border-moonless-night">${ssrInterpolate(_ctx.$t("pricing.discuss"))}</a></article></div><p class="mt-6 text-center text-sm text-moonless-night/50">${ssrInterpolate(_ctx.$t("pricing.equipmentNote"))}</p></div></section><section id="faq" class="py-20 md:py-28 lg:py-32"><div class="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-[0.65fr_1fr] lg:gap-20 lg:px-8"><header class="max-w-md md:sticky md:top-10 md:self-start"><p class="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-electric-blue">${ssrInterpolate(_ctx.$t("faq.label"))}</p><h2 class="text-5xl font-bold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl"> FAQ </h2><p class="mt-5 text-base leading-7 text-moonless-night/50 md:text-lg">${ssrInterpolate(_ctx.$t("faq.description"))}</p><a href="#lead-form" class="group mt-7 inline-flex items-center gap-2 font-semibold text-electric-blue">${ssrInterpolate(_ctx.$t("faq.ask"))}<span class="transition-transform group-hover:translate-x-1">→</span></a></header>`);
			if (unref(isLoading)) _push(`<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div></div>`);
			else if (unref(error)) _push(`<div class="py-12 text-center text-red-500">${ssrInterpolate(unref(error))}</div>`);
			else {
				_push(`<div class="border-t border-moonless-night/10"><!--[-->`);
				ssrRenderList(unref(faqItems), (item, index) => {
					_push(`<details class="group border-b border-moonless-night/10"${ssrIncludeBooleanAttr(index === 0) ? " open" : ""}><summary class="relative flex min-h-24 cursor-pointer list-none items-center pr-14 text-lg font-semibold marker:hidden sm:text-xl">${ssrInterpolate(item.title)} <span class="absolute right-1 h-8 w-8 rounded-full border border-moonless-night/15 before:absolute before:left-1/2 before:top-1/2 before:h-px before:w-3 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-moonless-night after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:bg-moonless-night after:transition-transform group-open:after:rotate-90"></span></summary><div class="max-w-2xl pb-7 pr-4 leading-7 text-moonless-night/50">${ssrInterpolate(item.answer)}</div></details>`);
				});
				_push(`<!--]--></div>`);
			}
			_push(`</div></section><!--]-->`);
		};
	}
});
// app/components/AISection.vue
var _sfc_setup$4 = AISection_vue_vue_type_script_setup_true_lang_default.setup;
AISection_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AISection.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var AISection_default = Object.assign(AISection_vue_vue_type_script_setup_true_lang_default, { __name: "AISection" });
// app/components/ArchitectureSection.vue?vue&type=script&setup=true&lang.ts
var ArchitectureSection_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ArchitectureSection",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useI18n();
		const steps = computed(() => [
			{
				title: t("arch.step1Title"),
				text: t("arch.step1Text")
			},
			{
				title: t("arch.step2Title"),
				text: t("arch.step2Text")
			},
			{
				title: t("arch.step3Title"),
				text: t("arch.step3Text")
			},
			{
				title: t("arch.step4Title"),
				text: t("arch.step4Text")
			}
		]);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<section${ssrRenderAttrs(mergeProps({
				id: "architecture",
				class: "py-16 sm:py-24"
			}, _attrs))}><div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">`);
			_push(ssrRenderComponent(ShipHeading_default, {
				heading: _ctx.$t("arch.heading"),
				"heading-alt": _ctx.$t("arch.headingAlt"),
				description: _ctx.$t("arch.description")
			}, null, _parent));
			_push(`<ol class="grid gap-5 md:grid-cols-2 xl:grid-cols-4"><!--[-->`);
			ssrRenderList(steps.value, (step, index) => {
				_push(`<li class="relative rounded-[26px] border border-moonless-night/10 bg-cotton p-6 sm:p-7"><span class="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-electric-blue text-sm font-bold text-cotton">${ssrInterpolate(index + 1)}</span><h3 class="text-xl font-bold">${ssrInterpolate(step.title)}</h3><p class="mt-3 text-sm leading-6 text-moonless-night/50">${ssrInterpolate(step.text)}</p></li>`);
			});
			_push(`<!--]--></ol></div></section>`);
		};
	}
});
// app/components/ArchitectureSection.vue
var _sfc_setup$3 = ArchitectureSection_vue_vue_type_script_setup_true_lang_default.setup;
ArchitectureSection_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ArchitectureSection.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var ArchitectureSection_default = Object.assign(ArchitectureSection_vue_vue_type_script_setup_true_lang_default, { __name: "ArchitectureSection" });
// app/components/SegmentsSection.vue?vue&type=script&setup=true&lang.ts
var SegmentsSection_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SegmentsSection",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useI18n();
		const segments = computed(() => [
			{
				title: t("segments.seg1Title"),
				text: t("segments.seg1Text")
			},
			{
				title: t("segments.seg2Title"),
				text: t("segments.seg2Text")
			},
			{
				title: t("segments.seg3Title"),
				text: t("segments.seg3Text")
			},
			{
				title: t("segments.seg4Title"),
				text: t("segments.seg4Text")
			},
			{
				title: t("segments.seg5Title"),
				text: t("segments.seg5Text")
			},
			{
				title: t("segments.seg6Title"),
				text: t("segments.seg6Text")
			}
		]);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<section${ssrRenderAttrs(mergeProps({
				id: "segments",
				class: "py-16 sm:py-24 bg-white"
			}, _attrs))}><div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">`);
			_push(ssrRenderComponent(ShipHeading_default, {
				heading: _ctx.$t("segments.heading"),
				"heading-alt": _ctx.$t("segments.headingAlt"),
				description: _ctx.$t("segments.description")
			}, null, _parent));
			_push(`<div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"><!--[-->`);
			ssrRenderList(segments.value, (segment) => {
				_push(`<article class="rounded-[26px] border border-moonless-night/10 bg-cotton p-6 sm:p-7"><h3 class="text-xl font-bold">${ssrInterpolate(segment.title)}</h3><p class="mt-3 text-sm leading-6 text-moonless-night/50">${ssrInterpolate(segment.text)}</p></article>`);
			});
			_push(`<!--]--></div></div></section>`);
		};
	}
});
// app/components/SegmentsSection.vue
var _sfc_setup$2 = SegmentsSection_vue_vue_type_script_setup_true_lang_default.setup;
SegmentsSection_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SegmentsSection.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var SegmentsSection_default = Object.assign(SegmentsSection_vue_vue_type_script_setup_true_lang_default, { __name: "SegmentsSection" });
// app/components/LandingCtaButton.vue?vue&type=script&setup=true&lang.ts
var LandingCtaButton_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "LandingCtaButton",
	__ssrInlineRender: true,
	props: {
		type: { default: "button" },
		size: { default: "md" },
		disabled: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const props = __props;
		const sizeClass = computed(() => props.size === "lg" ? "px-6 py-3 text-lg sm:text-xl" : "px-8 py-3.5");
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<button${ssrRenderAttrs(mergeProps({
				type: __props.type,
				disabled: __props.disabled,
				class: ["cta-btn group inline-flex cursor-pointer items-center rounded-full bg-electric-blue font-semibold text-cotton select-none focus-visible:ring-2 focus-visible:ring-electric-blue/60 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50", sizeClass.value]
			}, _attrs))} data-v-3d8da6ee>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`<svg class="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-v-3d8da6ee><path d="M5 12h14" data-v-3d8da6ee></path><path d="M13 6l6 6-6 6" data-v-3d8da6ee></path></svg></button>`);
		};
	}
});
// app/components/LandingCtaButton.vue
var _sfc_setup$1 = LandingCtaButton_vue_vue_type_script_setup_true_lang_default.setup;
LandingCtaButton_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LandingCtaButton.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var LandingCtaButton_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(LandingCtaButton_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3d8da6ee"]]), { __name: "LandingCtaButton" });
// app/components/LandingPage.vue?vue&type=script&setup=true&lang.ts
var LandingPage_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "LandingPage",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useI18n();
		const { roadmapItems, isLoading: roadmapLoading, error: roadmapError} = useRoadmap();
		const leadForm = reactive({
			person_name: "",
			email: "",
			company_name: "",
			refrigerators_count: 1,
			phone: "",
			comment: "",
			personal_data_agreement: false
		});
		const formStatus = ref("idle");
		const formErrors = ref({});
		const formError = ref("");
		const sensorSpecs = computed(() => [
			{
				label: t("tech.sensorChipLabel"),
				value: t("tech.sensorChipValue")
			},
			{
				label: t("tech.sensorRadioLabel"),
				value: t("tech.sensorRadioValue")
			},
			{
				label: t("tech.sensorProbesLabel"),
				value: t("tech.sensorProbesValue")
			},
			{
				label: t("tech.sensorPowerLabel"),
				value: t("tech.sensorPowerValue")
			},
			{
				label: t("tech.sensorCaseLabel"),
				value: t("tech.sensorCaseValue")
			}
		]);
		const hubSpecs = computed(() => [
			{
				label: t("tech.hubTypeLabel"),
				value: t("tech.hubTypeValue")
			},
			{
				label: t("tech.hubCoreLabel"),
				value: t("tech.hubCoreValue")
			},
			{
				label: t("tech.hubCommsLabel"),
				value: t("tech.hubCommsValue")
			},
			{
				label: t("tech.hubPowerLabel"),
				value: t("tech.hubPowerValue")
			},
			{
				label: t("tech.hubCaseLabel"),
				value: t("tech.hubCaseValue")
			}
		]);
		const softwareSpecs = computed(() => [
			{
				label: t("tech.cloudVizLabel"),
				value: t("tech.cloudVizValue")
			},
			{
				label: t("tech.cloudAlertsLabel"),
				value: t("tech.cloudAlertsValue")
			},
			{
				label: t("tech.cloudReportsLabel"),
				value: t("tech.cloudReportsValue")
			},
			{
				label: t("tech.cloudGroupsLabel"),
				value: t("tech.cloudGroupsValue")
			},
			{
				label: t("tech.cloudAccessLabel"),
				value: t("tech.cloudAccessValue")
			},
			{
				label: t("tech.cloudStackLabel"),
				value: t("tech.cloudStackValue")
			}
		]);
		const leadInputClass = (field) => [
			"w-full px-4 py-3 rounded-2xl border bg-cotton outline-none transition-colors focus:border-electric-blue",
			formErrors.value[field] ? "border-red-400" : "border-moonless-night/15",
			formStatus.value === "loading" ? "opacity-50 cursor-not-allowed" : ""
		];
		const scrollToForm = () => {
			const el = (void 0).getElementById("lead-form");
			if (el) el.scrollIntoView({ behavior: "smooth" });
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[--><section class="relative overflow-hidden flex items-center min-h-[calc(100dvh-120px)] sm:min-h-[calc(100dvh-80px)]" data-v-9e8173f8><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" data-v-9e8173f8><hgroup class="flex flex-col gap-5" data-v-9e8173f8><div class="text-xl" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("hero.tagline"))}</div><h1 class="text-4xl sm:text-7xl md:text-9xl font-extrabold font-accent uppercase" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("hero.title"))}</h1><p class="mt-6 max-w-2xl text-lg text-moonless-night/70" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("hero.subtitle"))}</p></hgroup><div class="mt-40 flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 justify-center" data-v-9e8173f8>`);
			_push(ssrRenderComponent(LandingCtaButton_default, {
				size: "lg",
				onClick: scrollToForm
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(_ctx.$t("hero.cta"))}`);
					else return [createTextVNode(toDisplayString(_ctx.$t("hero.cta")), 1)];
				}),
				_: 1
			}, _parent));
			_push(`</div></div></section>`);
			_push(ssrRenderComponent(ArchitectureSection_default, null, null, _parent));
			_push(ssrRenderComponent(SegmentsSection_default, null, null, _parent));
			_push(`<section class="py-16 sm:py-24 bg-white" data-v-9e8173f8><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-v-9e8173f8>`);
			_push(ssrRenderComponent(ShipHeading_default, {
				heading: _ctx.$t("roadmap.heading"),
				"heading-alt": _ctx.$t("roadmap.headingAlt"),
				description: ""
			}, null, _parent));
			if (unref(roadmapLoading)) {
				_push(`<div class="border-t border-moonless-night/10" role="status" data-v-9e8173f8><!--[-->`);
				ssrRenderList(3, (i) => {
					_push(`<div class="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-8 py-6 border-b border-moonless-night/10 animate-pulse" data-v-9e8173f8><div class="h-4 bg-moonless-night/10 rounded" data-v-9e8173f8></div><div class="space-y-2" data-v-9e8173f8><div class="h-5 bg-moonless-night/10 rounded w-1/3" data-v-9e8173f8></div><div class="h-3 bg-moonless-night/10 rounded w-2/3" data-v-9e8173f8></div></div></div>`);
				});
				_push(`<!--]--></div>`);
			} else if (unref(roadmapError)) _push(`<div class="py-10 text-center" role="alert" data-v-9e8173f8><p class="text-moonless-night/60 mb-3" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("roadmap.unavailable"))}</p><button class="px-5 py-2.5 bg-electric-blue text-cotton rounded-full text-sm font-semibold hover:bg-electric-blue/90" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("roadmap.retry"))}</button></div>`);
			else if (unref(roadmapItems).length === 0) _push(`<p class="py-10 text-center text-moonless-night/50" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("roadmap.empty"))}</p>`);
			else {
				_push(`<div class="border-t border-moonless-night/10" data-v-9e8173f8><!--[-->`);
				ssrRenderList(unref(roadmapItems), (item) => {
					_push(`<div class="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-8 py-6 border-b border-moonless-night/10" data-v-9e8173f8><span class="text-electric-blue text-sm font-semibold pt-1" data-v-9e8173f8>${ssrInterpolate(item.stage_date)}</span><div data-v-9e8173f8><h3 class="text-lg font-bold mb-1" data-v-9e8173f8>${ssrInterpolate(item.stage_name)}</h3><p class="text-moonless-night/60 text-sm leading-relaxed" data-v-9e8173f8>${ssrInterpolate(item.stage_description)}</p></div></div>`);
				});
				_push(`<!--]--></div>`);
			}
			_push(`</div></section><section class="py-16 sm:py-24" data-v-9e8173f8><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-v-9e8173f8><div class="flex items-baseline gap-4 mb-12" data-v-9e8173f8><h2 class="text-4xl sm:text-5xl font-bold uppercase" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("tech.heading"))}</h2></div><div class="grid lg:grid-cols-2 gap-12 lg:gap-20" data-v-9e8173f8><div data-v-9e8173f8><p class="text-electric-blue font-semibold text-sm mb-4" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("tech.hardware"))}</p><h3 class="text-xl font-bold mb-4" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("tech.sensorTitle"))}</h3><dl class="space-y-0 mb-8" data-v-9e8173f8><!--[-->`);
			ssrRenderList(sensorSpecs.value, (spec) => {
				_push(`<div class="flex gap-4 sm:gap-6 py-3 border-t border-moonless-night/10 first:border-t-0" data-v-9e8173f8><dt class="w-28 sm:w-32 shrink-0 text-sm text-moonless-night/50" data-v-9e8173f8>${ssrInterpolate(spec.label)}</dt><dd class="text-sm flex-1" data-v-9e8173f8>${ssrInterpolate(spec.value)}</dd></div>`);
			});
			_push(`<!--]--></dl><h3 class="text-xl font-bold mb-4" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("tech.hubTitle"))}</h3><dl class="space-y-0" data-v-9e8173f8><!--[-->`);
			ssrRenderList(hubSpecs.value, (spec) => {
				_push(`<div class="flex gap-4 sm:gap-6 py-3 border-t border-moonless-night/10 first:border-t-0" data-v-9e8173f8><dt class="w-28 sm:w-32 shrink-0 text-sm text-moonless-night/50" data-v-9e8173f8>${ssrInterpolate(spec.label)}</dt><dd class="text-sm flex-1" data-v-9e8173f8>${ssrInterpolate(spec.value)}</dd></div>`);
			});
			_push(`<!--]--></dl></div><div data-v-9e8173f8><p class="text-electric-blue font-semibold text-sm mb-4" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("tech.software"))}</p><h3 class="text-2xl font-bold mb-6" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("tech.cloudTitle"))}</h3><dl class="space-y-0" data-v-9e8173f8><!--[-->`);
			ssrRenderList(softwareSpecs.value, (spec) => {
				_push(`<div class="flex gap-4 sm:gap-6 py-3 border-t border-moonless-night/10 first:border-t-0" data-v-9e8173f8><dt class="w-28 sm:w-32 shrink-0 text-sm text-moonless-night/50" data-v-9e8173f8>${ssrInterpolate(spec.label)}</dt><dd class="text-sm flex-1" data-v-9e8173f8>${ssrInterpolate(spec.value)}</dd></div>`);
			});
			_push(`<!--]--></dl></div></div></div></section>`);
			_push(ssrRenderComponent(AISection_default, null, null, _parent));
			_push(`<section id="lead-form" class="py-16 sm:py-24 bg-white" data-v-9e8173f8><div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" data-v-9e8173f8><div class="flex items-baseline gap-4 mb-10" data-v-9e8173f8><h2 class="text-5xl font-bold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("form.heading"))}</h2><span class="text-moonless-night/40 text-sm hidden sm:inline" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("form.note"))}</span></div><form class="space-y-4" novalidate data-v-9e8173f8><div class="grid sm:grid-cols-2 gap-4" data-v-9e8173f8><div data-v-9e8173f8><label for="person_name" class="block text-sm font-medium text-moonless-night/60 mb-1.5" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("form.nameLabel"))} *</label><input id="person_name"${ssrRenderAttr("value", leadForm.person_name)} type="text"${ssrRenderAttr("placeholder", _ctx.$t("form.namePlaceholder"))} required autocomplete="name" class="${ssrRenderClass(leadInputClass("person_name"))}"${ssrIncludeBooleanAttr(formStatus.value === "loading") ? " disabled" : ""}${ssrRenderAttr("aria-invalid", formErrors.value.person_name ? "true" : void 0)}${ssrRenderAttr("aria-describedby", formErrors.value.person_name ? "person_name-error" : void 0)} data-v-9e8173f8>`);
			if (formErrors.value.person_name) _push(`<p id="person_name-error" class="mt-1 text-xs text-red-500" data-v-9e8173f8>${ssrInterpolate(formErrors.value.person_name)}</p>`);
			else _push(`<!---->`);
			_push(`</div><div data-v-9e8173f8><label for="phone" class="block text-sm font-medium text-moonless-night/60 mb-1.5" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("form.phoneLabel"))}</label><input id="phone"${ssrRenderAttr("value", leadForm.phone)} type="tel" placeholder="+7 (999) 000-00-00" autocomplete="tel" class="${ssrRenderClass(leadInputClass("phone"))}"${ssrIncludeBooleanAttr(formStatus.value === "loading") ? " disabled" : ""}${ssrRenderAttr("aria-invalid", formErrors.value.phone ? "true" : void 0)}${ssrRenderAttr("aria-describedby", formErrors.value.phone ? "phone-error" : void 0)} data-v-9e8173f8>`);
			if (formErrors.value.phone) _push(`<p id="phone-error" class="mt-1 text-xs text-red-500" data-v-9e8173f8>${ssrInterpolate(formErrors.value.phone)}</p>`);
			else _push(`<!---->`);
			_push(`</div></div><div data-v-9e8173f8><label for="email" class="block text-sm font-medium text-moonless-night/60 mb-1.5" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("form.emailLabel"))} *</label><input id="email"${ssrRenderAttr("value", leadForm.email)} type="email" placeholder="you@company.ru" required autocomplete="email" class="${ssrRenderClass(leadInputClass("email"))}"${ssrIncludeBooleanAttr(formStatus.value === "loading") ? " disabled" : ""}${ssrRenderAttr("aria-invalid", formErrors.value.email ? "true" : void 0)}${ssrRenderAttr("aria-describedby", formErrors.value.email ? "email-error" : void 0)} data-v-9e8173f8>`);
			if (formErrors.value.email) _push(`<p id="email-error" class="mt-1 text-xs text-red-500" data-v-9e8173f8>${ssrInterpolate(formErrors.value.email)}</p>`);
			else _push(`<!---->`);
			_push(`</div><div class="grid sm:grid-cols-2 gap-4" data-v-9e8173f8><div data-v-9e8173f8><label for="company_name" class="block text-sm font-medium text-moonless-night/60 mb-1.5" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("form.companyLabel"))} *</label><input id="company_name"${ssrRenderAttr("value", leadForm.company_name)} type="text"${ssrRenderAttr("placeholder", _ctx.$t("form.companyPlaceholder"))} required autocomplete="organization" class="${ssrRenderClass(leadInputClass("company_name"))}"${ssrIncludeBooleanAttr(formStatus.value === "loading") ? " disabled" : ""}${ssrRenderAttr("aria-invalid", formErrors.value.company_name ? "true" : void 0)}${ssrRenderAttr("aria-describedby", formErrors.value.company_name ? "company_name-error" : void 0)} data-v-9e8173f8>`);
			if (formErrors.value.company_name) _push(`<p id="company_name-error" class="mt-1 text-xs text-red-500" data-v-9e8173f8>${ssrInterpolate(formErrors.value.company_name)}</p>`);
			else _push(`<!---->`);
			_push(`</div><div data-v-9e8173f8><label for="refrigerators_count" class="block text-sm font-medium text-moonless-night/60 mb-1.5" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("form.chambersLabel"))} *</label><input id="refrigerators_count"${ssrRenderAttr("value", leadForm.refrigerators_count)} type="number" min="1" placeholder="1" required class="${ssrRenderClass(leadInputClass("refrigerators_count"))}"${ssrIncludeBooleanAttr(formStatus.value === "loading") ? " disabled" : ""}${ssrRenderAttr("aria-invalid", formErrors.value.refrigerators_count ? "true" : void 0)}${ssrRenderAttr("aria-describedby", formErrors.value.refrigerators_count ? "refrigerators_count-error" : void 0)} data-v-9e8173f8>`);
			if (formErrors.value.refrigerators_count) _push(`<p id="refrigerators_count-error" class="mt-1 text-xs text-red-500" data-v-9e8173f8>${ssrInterpolate(formErrors.value.refrigerators_count)}</p>`);
			else _push(`<!---->`);
			_push(`</div></div><div data-v-9e8173f8><label for="comment" class="block text-sm font-medium text-moonless-night/60 mb-1.5" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("form.commentLabel"))}</label><textarea id="comment" rows="3"${ssrRenderAttr("placeholder", _ctx.$t("form.commentPlaceholder"))} class="${ssrRenderClass([leadInputClass("comment"), "resize-none"])}"${ssrIncludeBooleanAttr(formStatus.value === "loading") ? " disabled" : ""} data-v-9e8173f8>${ssrInterpolate(leadForm.comment)}</textarea></div><label class="flex items-start gap-3 cursor-pointer" data-v-9e8173f8><input${ssrIncludeBooleanAttr(Array.isArray(leadForm.personal_data_agreement) ? ssrLooseContain(leadForm.personal_data_agreement, null) : leadForm.personal_data_agreement) ? " checked" : ""} type="checkbox" class="mt-0.5 w-4 h-4 rounded border-moonless-night/30 text-electric-blue focus:ring-electric-blue focus:ring-offset-0"${ssrIncludeBooleanAttr(formStatus.value === "loading") ? " disabled" : ""} data-v-9e8173f8><span class="text-sm text-moonless-night/60" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("form.agreement"))} * </span></label>`);
			if (formErrors.value.personal_data_agreement) _push(`<p class="text-xs text-red-500" data-v-9e8173f8>${ssrInterpolate(formErrors.value.personal_data_agreement)}</p>`);
			else _push(`<!---->`);
			if (formStatus.value === "success") _push(`<div role="status" class="p-4 rounded-2xl bg-electric-blue/10 text-electric-blue text-sm border border-electric-blue/20" data-v-9e8173f8>${ssrInterpolate(_ctx.$t("form.success"))}</div>`);
			else if (formStatus.value === "error") _push(`<div role="alert" class="p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-200" data-v-9e8173f8>${ssrInterpolate(formError.value)}</div>`);
			else _push(`<!---->`);
			_push(ssrRenderComponent(LandingCtaButton_default, {
				type: "submit",
				disabled: formStatus.value === "loading" || formStatus.value === "success"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (formStatus.value === "loading") _push(`<span class="flex items-center gap-2" data-v-9e8173f8${_scopeId}><svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" data-v-9e8173f8${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-9e8173f8${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" data-v-9e8173f8${_scopeId}></path></svg> ${ssrInterpolate(_ctx.$t("form.sending"))}</span>`);
						else _push(`<span data-v-9e8173f8${_scopeId}>${ssrInterpolate(_ctx.$t("form.submit"))}</span>`);
					} else return [formStatus.value === "loading" ? (openBlock(), createBlock("span", {
						key: 0,
						class: "flex items-center gap-2"
					}, [(openBlock(), createBlock("svg", {
						class: "h-5 w-5 animate-spin",
						fill: "none",
						viewBox: "0 0 24 24"
					}, [createVNode("circle", {
						class: "opacity-25",
						cx: "12",
						cy: "12",
						r: "10",
						stroke: "currentColor",
						"stroke-width": "4"
					}), createVNode("path", {
						class: "opacity-75",
						fill: "currentColor",
						d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					})])), createTextVNode(" " + toDisplayString(_ctx.$t("form.sending")), 1)])) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(_ctx.$t("form.submit")), 1))];
				}),
				_: 1
			}, _parent));
			_push(`</form></div></section><!--]-->`);
		};
	}
});
// app/components/LandingPage.vue
var _sfc_setup = LandingPage_vue_vue_type_script_setup_true_lang_default.setup;
LandingPage_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LandingPage.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var LandingPage_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(LandingPage_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-9e8173f8"]]), { __name: "LandingPage" });
// app/composables/useLandingSeo.ts
var SITE_URL = "https://ship-monitor.ru";
var SEO = {
	ru: {
		title: "ШиП-Монитор — система мониторинга холодильного оборудования",
		description: "Система мониторинга холодильного оборудования: промышленные датчики температуры, онлайн-контроль 24/7, push и SMS-уведомления, автоматический журнал температуры и отчёты для складов, магазинов, аптек и пищевых производств.",
		ogDescription: "Холодильный контроллер и датчики температуры: онлайн-мониторинг 24/7, история показаний и уведомления при выходе за заданные границы — на сайте, push или SMS.",
		siteName: "ШиП-Монитор",
		ogLocale: "ru_RU"
	},
	en: {
		title: "Ship-Monitor — industrial refrigeration temperature monitoring",
		description: "Ship-Monitor — refrigeration controller and temperature sensors for automated cold chain monitoring at food production facilities, warehouses, pharmacies and retail chains.",
		ogDescription: "Refrigeration controller and temperature sensors: 24/7 online monitoring, reading history and alerts when values leave configured limits — web, push or SMS.",
		siteName: "Ship-Monitor",
		ogLocale: "en_US"
	}
};
function useLandingSeo(locale) {
	const { faqItems } = useFaq();
	const seo = SEO[locale];
	const canonical = locale === "en" ? `${SITE_URL}/en/` : `${SITE_URL}/`;
	useSeoMeta$2({
		title: seo.title,
		description: seo.description,
		ogType: "website",
		ogSiteName: seo.siteName,
		ogTitle: seo.siteName,
		ogDescription: seo.ogDescription,
		ogUrl: canonical,
		ogImage: `${SITE_URL}/logo.png`,
		ogLocale: seo.ogLocale,
		ogLocaleAlternate: locale === "en" ? "ru_RU" : "en_US",
		twitterCard: "summary"
	});
	const siteJsonLd = computed(() => ({
		"@context": "https://schema.org",
		"@graph": [{
			"@type": "Organization",
			"@id": `${SITE_URL}/#organization`,
			name: seo.siteName,
			url: `${SITE_URL}/`,
			logo: `${SITE_URL}/logo.png`,
			email: "support@ship-monitor.ru"
		}, {
			"@type": "WebSite",
			"@id": `${SITE_URL}/#website`,
			url: `${SITE_URL}/`,
			name: seo.siteName,
			inLanguage: locale,
			publisher: { "@id": `${SITE_URL}/#organization` }
		}]
	}));
	const faqJsonLd = computed(() => {
		const items = faqItems.value;
		if (items.length === 0) return null;
		return {
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: items.map((item) => ({
				"@type": "Question",
				name: item.title,
				acceptedAnswer: {
					"@type": "Answer",
					text: item.answer
				}
			}))
		};
	});
	const escapeJsonLd = (value) => value.replace(/</g, "\\u003c");
	const jsonLdScripts = computed(() => {
		const scripts = [{
			type: "application/ld+json",
			innerHTML: escapeJsonLd(JSON.stringify(siteJsonLd.value))
		}];
		if (faqJsonLd.value) scripts.push({
			type: "application/ld+json",
			innerHTML: escapeJsonLd(JSON.stringify(faqJsonLd.value))
		});
		return scripts;
	});
	useHead$2({
		link: [
			{
				rel: "canonical",
				href: canonical
			},
			{
				rel: "alternate",
				hreflang: "ru",
				href: `${SITE_URL}/`
			},
			{
				rel: "alternate",
				hreflang: "en",
				href: `${SITE_URL}/en/`
			},
			{
				rel: "alternate",
				hreflang: "x-default",
				href: `${SITE_URL}/`
			},
			{
				rel: "preload",
				as: "image",
				href: big_logo_default
			}
		],
		script: jsonLdScripts
	});
}

export { LandingPage_default as L, useFaq as a, useRoadmap as b, getRawFaqItems as c, hydrateRoadmapItems as d, useLandingSeo as e, getRawRoadmapItems as g, hydrateFaqItems as h, useAsyncData as u };
//# sourceMappingURL=useLandingSeo-Dq6rQxY5.mjs.map
