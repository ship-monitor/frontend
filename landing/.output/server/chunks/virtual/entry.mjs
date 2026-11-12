import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { defineProdDiagnostics } from 'nostics';
import { ansiFormatter } from 'nostics/formatters/ansi';
import { getCurrentScope, ref, watchEffect, getCurrentInstance, onBeforeUnmount, onDeactivated, onActivated, onScopeDispose, shallowReactive, reactive, effectScope, hasInjectionContext, createApp, provide, onErrorCaptured, onServerPrefetch, unref, createVNode, resolveDynamicComponent, inject, defineAsyncComponent, mergeProps, defineComponent, computed, withCtx, toRef, shallowRef, h, isVNode, createCommentVNode, isReadonly, Suspense, nextTick, Fragment, useSSRContext, isRef, isShallow, isReactive, toRaw } from 'vue';
import { f as createError, m as defu, p as parseURL, e as encodePath, n as decodePath, w as withQuery, o as hasProtocol, q as isScriptProtocol, i as joinURL, v as sanitizeStatusCode, $ as $fetch } from '../_/nitro.mjs';
import { i as injectHead$1, V as VueResolver, h as headSymbol, b as baseURL } from '../routes/renderer.mjs';
import { useRoute, RouterView, START_LOCATION, createMemoryHistory, createRouter } from 'vue-router';
import { createI18n } from 'vue-i18n';
import { ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode, ssrRenderAttrs, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { FlatMetaPlugin } from 'unhead/plugins';
import { walkResolver, hasOwn } from 'unhead/utils';

function useHead(input, options = {}) {
  const head = options.head || injectHead$1();
  return head.ssr ? head.push(input || {}, options) : clientUseHead(head, input, options);
}
function clientUseHead(head, input, options = {}) {
  const scope = getCurrentScope();
  if (scope && !scope.active) {
    return { patch() {
    }, dispose() {
    }, _i: -1 };
  }
  const deactivated = ref(false);
  if (options.onRendered && scope) {
    const _onRendered = options.onRendered;
    options = { ...options, onRendered: (ctx) => scope.run(() => _onRendered(ctx)) };
  }
  let entry;
  watchEffect(() => {
    const i = deactivated.value ? {} : walkResolver(input, VueResolver);
    if (entry) {
      entry.patch(i);
    } else {
      entry = head.push(i, options);
    }
  });
  const vm = getCurrentInstance();
  if (vm) {
    onBeforeUnmount(() => {
      entry.dispose();
    });
    onDeactivated(() => {
      deactivated.value = true;
    });
    onActivated(() => {
      deactivated.value = false;
    });
  } else if (scope) {
    onScopeDispose(() => entry.dispose());
  }
  return entry;
}
function normalizeSeoMetaInput(input) {
  if (input._flatMeta)
    return input;
  const meta = {};
  for (const key in input) {
    if (!hasOwn(input, key) || key === "title" || key === "titleTemplate")
      continue;
    meta[key] = input[key];
  }
  return {
    title: input.title,
    titleTemplate: input.titleTemplate,
    _flatMeta: meta
  };
}
function useSeoMeta(input = {}, options = {}) {
  const head = options.head || injectHead$1();
  head.use(FlatMetaPlugin);
  const entry = useHead(normalizeSeoMetaInput(input), options);
  const corePatch = entry.patch;
  if (!entry.__patched) {
    entry.patch = (input2) => corePatch(normalizeSeoMetaInput(input2));
    entry.__patched = true;
  }
  return entry;
}

function flatHooks(configHooks, hooks = {}, parentName) {
	for (const key in configHooks) {
		const subHook = configHooks[key];
		const name = parentName ? `${parentName}:${key}` : key;
		if (typeof subHook === "object" && subHook !== null) flatHooks(subHook, hooks, name);
		else if (typeof subHook === "function") hooks[name] = subHook;
	}
	return hooks;
}
const createTask = /* @__PURE__ */ (() => {
	if (console.createTask) return console.createTask;
	const defaultTask = { run: (fn) => fn() };
	return () => defaultTask;
})();
function callHooks(hooks, args, startIndex, task) {
	for (let i = startIndex; i < hooks.length; i += 1) try {
		const result = task ? task.run(() => hooks[i](...args)) : hooks[i](...args);
		if (result && typeof result.then === "function") return Promise.resolve(result).then(() => callHooks(hooks, args, i + 1, task));
	} catch (error) {
		return Promise.reject(error);
	}
}
function serialTaskCaller(hooks, args, name) {
	if (hooks.length > 0) return callHooks(hooks, args, 0, createTask(name));
}
function parallelTaskCaller(hooks, args, name) {
	if (hooks.length > 0) {
		const task = createTask(name);
		return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
	}
}
function callEachWith(callbacks, arg0) {
	for (const callback of [...callbacks]) callback(arg0);
}
var Hookable = class {
	_hooks;
	_before;
	_after;
	_deprecatedHooks;
	_deprecatedMessages;
	constructor() {
		this._hooks = {};
		this._before = void 0;
		this._after = void 0;
		this._deprecatedMessages = void 0;
		this._deprecatedHooks = {};
		this.hook = this.hook.bind(this);
		this.callHook = this.callHook.bind(this);
		this.callHookWith = this.callHookWith.bind(this);
	}
	hook(name, function_, options = {}) {
		if (!name || typeof function_ !== "function") return () => {};
		const originalName = name;
		let dep;
		while (this._deprecatedHooks[name]) {
			dep = this._deprecatedHooks[name];
			name = dep.to;
		}
		if (dep && !options.allowDeprecated) {
			let message = dep.message;
			if (!message) message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
			if (!this._deprecatedMessages) this._deprecatedMessages = /* @__PURE__ */ new Set();
			if (!this._deprecatedMessages.has(message)) {
				console.warn(message);
				this._deprecatedMessages.add(message);
			}
		}
		if (!function_.name) try {
			Object.defineProperty(function_, "name", {
				get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
				configurable: true
			});
		} catch {}
		this._hooks[name] = this._hooks[name] || [];
		this._hooks[name].push(function_);
		return () => {
			if (function_) {
				this.removeHook(name, function_);
				function_ = void 0;
			}
		};
	}
	hookOnce(name, function_) {
		let _unreg;
		let _function = (...arguments_) => {
			if (typeof _unreg === "function") _unreg();
			_unreg = void 0;
			_function = void 0;
			return function_(...arguments_);
		};
		_unreg = this.hook(name, _function);
		return _unreg;
	}
	removeHook(name, function_) {
		const hooks = this._hooks[name];
		if (hooks) {
			const index = hooks.indexOf(function_);
			if (index !== -1) hooks.splice(index, 1);
			if (hooks.length === 0) this._hooks[name] = void 0;
		}
	}
	clearHook(name) {
		this._hooks[name] = void 0;
	}
	deprecateHook(name, deprecated) {
		this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
		const _hooks = this._hooks[name] || [];
		this._hooks[name] = void 0;
		for (const hook of _hooks) this.hook(name, hook);
	}
	deprecateHooks(deprecatedHooks) {
		for (const name in deprecatedHooks) this.deprecateHook(name, deprecatedHooks[name]);
	}
	addHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		const removeFns = Object.keys(hooks).map((key) => this.hook(key, hooks[key]));
		return () => {
			for (const unreg of removeFns) unreg();
			removeFns.length = 0;
		};
	}
	removeHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		for (const key in hooks) this.removeHook(key, hooks[key]);
	}
	removeAllHooks() {
		this._hooks = {};
	}
	callHook(name, ...args) {
		return this.callHookWith(serialTaskCaller, name, args);
	}
	callHookParallel(name, ...args) {
		return this.callHookWith(parallelTaskCaller, name, args);
	}
	callHookWith(caller, name, args) {
		const event = this._before || this._after ? {
			name,
			args,
			context: {}
		} : void 0;
		if (this._before) callEachWith(this._before, event);
		const result = caller(this._hooks[name] ? [...this._hooks[name]] : [], args, name);
		if (result instanceof Promise) return result.finally(() => {
			if (this._after && event) callEachWith(this._after, event);
		});
		if (this._after && event) callEachWith(this._after, event);
		return result;
	}
	beforeEach(function_) {
		this._before = this._before || [];
		this._before.push(function_);
		return () => {
			if (this._before !== void 0) {
				const index = this._before.indexOf(function_);
				if (index !== -1) this._before.splice(index, 1);
			}
		};
	}
	afterEach(function_) {
		this._after = this._after || [];
		this._after.push(function_);
		return () => {
			if (this._after !== void 0) {
				const index = this._after.indexOf(function_);
				if (index !== -1) this._after.splice(index, 1);
			}
		};
	}
};
function createHooks() {
	return new Hookable();
}

function _getAsyncLocalStorage() {
	return globalThis.AsyncLocalStorage || globalThis.process?.getBuiltinModule?.("node:async_hooks")?.AsyncLocalStorage;
}
const _WeakRef = globalThis.WeakRef || class StrongRef {
	#value;
	constructor(value) {
		this.#value = value;
	}
	deref() {
		return this.#value;
	}
};
function createContext(opts = {}) {
	let currentInstance;
	let isSingleton = false;
	const checkConflict = (instance) => {
		if (currentInstance && currentInstance !== instance) throw new Error("Context conflict");
	};
	let als;
	if (opts.asyncContext) {
		const _AsyncLocalStorage = opts.AsyncLocalStorage || _getAsyncLocalStorage();
		if (_AsyncLocalStorage) als = new _AsyncLocalStorage();
		else console.warn("[unctx] `AsyncLocalStorage` is not provided.");
	}
	const _wrapInstance = (instance) => als && instance !== null && typeof instance === "object" ? { __unctx_weak: new _WeakRef(instance) } : instance;
	const _unwrapInstance = (store) => store && store.__unctx_weak ? store.__unctx_weak.deref() : store;
	const _getCurrentInstance = () => {
		if (als) {
			const store = als.getStore();
			if (store !== void 0) return _unwrapInstance(store);
		}
		return currentInstance;
	};
	return {
		use: () => {
			const _instance = _getCurrentInstance();
			if (_instance === void 0) throw new Error("Context is not available");
			return _instance;
		},
		tryUse: () => {
			return _getCurrentInstance() ?? null;
		},
		set: (instance, replace) => {
			if (!replace) checkConflict(instance);
			currentInstance = instance;
			isSingleton = true;
		},
		unset: () => {
			currentInstance = void 0;
			isSingleton = false;
		},
		call: (instance, callback) => {
			checkConflict(instance);
			currentInstance = instance;
			try {
				return als ? als.run(_wrapInstance(instance), callback) : callback();
			} finally {
				if (!isSingleton) currentInstance = void 0;
			}
		},
		async callAsync(instance, callback) {
			currentInstance = instance;
			const onRestore = () => {
				currentInstance = instance;
			};
			const onLeave = () => currentInstance === instance ? onRestore : void 0;
			asyncHandlers.add(onLeave);
			try {
				const r = als ? als.run(_wrapInstance(instance), callback) : callback();
				if (!isSingleton) currentInstance = void 0;
				return await r;
			} finally {
				asyncHandlers.delete(onLeave);
			}
		}
	};
}
function createNamespace(defaultOpts = {}) {
	const contexts = {};
	return { get(key, opts = {}) {
		if (!contexts[key]) contexts[key] = createContext({
			...defaultOpts,
			...opts
		});
		return contexts[key];
	} };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
	const restores = [];
	for (const leaveHandler of asyncHandlers) {
		const restore = leaveHandler();
		if (restore) restores.push(restore);
	}
	const restore = () => {
		for (const restore of restores) restore();
	};
	let awaitable = function_();
	if (awaitable && typeof awaitable === "object" && "catch" in awaitable) awaitable = awaitable.catch((error) => {
		restore();
		throw error;
	});
	return [awaitable, restore];
}

// node_modules/nuxt/dist/app/diagnostics/_shared.js
/**
* Shared configuration for the runtime (E<N>xxx) diagnostics catalogs.
*
* Catalogs are split by domain and imported directly where used (no barrel),
* so the browser bundle only pulls in the codes a module references. Pair the
* pure-call annotations on each `defineDiagnostics()` with dev-guarded,
* statement-level report calls so report-only diagnostics strip from production.
*
* Codes are stable, fully-qualified `NUXT_E<NNNN>` identifiers. Codes with a
* dedicated docs page resolve a `see:` URL via {@link docsBase}; the rest opt
* out with `docs: false`.
*/
function docsBase(code) {
	return `https://nuxt.com/docs/4.x/errors/${code.replace("NUXT_", "").toLowerCase()}`;
}
var ansi = (open, close) => (s) => `\x1B[${open}m${s}\x1B[${close}m`;
var colors = {
	red: ansi(31, 39),
	yellow: ansi(33, 39),
	cyan: ansi(36, 39),
	gray: ansi(90, 39),
	bold: ansi(1, 22),
	dim: ansi(2, 22)
};
ansiFormatter(colors);
var prodReporter = (diagnostic) => {
	console.error(`[${diagnostic.name}]`);
};
var prodReporters = [prodReporter];
// node_modules/nuxt/dist/app/diagnostics/core.js
/**
* E1xxx
* Core / Nuxt-instance / lifecycle runtime diagnostics.
*/
var appDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
// virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fnuxt.config.mjs
var nuxtLinkDefaults = {
	"componentName": "NuxtLink"};
var asyncDataDefaults = { "deep": false };
// node_modules/nuxt/dist/app/nuxt.js
function getNuxtAppCtx(id = "nuxt-app") {
	return getContext(id, { asyncContext: false });
}
var NuxtPluginIndicator = "__nuxt_plugin";
/** @since 3.0.0 */
function createNuxtApp(options) {
	let hydratingCount = 0;
	const nuxtApp = {
		_id: options.id || "nuxt-app",
		_scope: effectScope(),
		provide: void 0,
		versions: {
			get nuxt() {
				return "4.5.2";
			},
			get vue() {
				return nuxtApp.vueApp.version;
			}
		},
		payload: shallowReactive({
			...options.ssrContext?.payload || {},
			data: shallowReactive({}),
			state: reactive({}),
			once: /* @__PURE__ */ new Set(),
			_errors: shallowReactive({})
		}),
		static: { data: {} },
		runWithContext(fn) {
			if (nuxtApp._scope.active && !getCurrentScope()) return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
			return callWithNuxt(nuxtApp, fn);
		},
		isHydrating: false,
		deferHydration() {
			if (!nuxtApp.isHydrating) return () => {};
			hydratingCount++;
			let called = false;
			return () => {
				if (called) return;
				called = true;
				hydratingCount--;
				if (hydratingCount === 0) {
					nuxtApp.isHydrating = false;
					return nuxtApp.callHook("app:suspense:resolve");
				}
			};
		},
		_asyncDataPromises: {},
		_asyncData: shallowReactive({}),
		_state: shallowReactive({}),
		_payloadRevivers: {},
		...options
	};
	nuxtApp.payload.serverRendered = true;
	if (nuxtApp.ssrContext) {
		nuxtApp.payload.path = nuxtApp.ssrContext.url;
		nuxtApp.ssrContext.nuxt = nuxtApp;
		nuxtApp.ssrContext.payload = nuxtApp.payload;
		nuxtApp.ssrContext.config = {
			public: nuxtApp.ssrContext.runtimeConfig.public,
			app: nuxtApp.ssrContext.runtimeConfig.app
		};
	}
	nuxtApp.hooks = createHooks();
	nuxtApp.hook = nuxtApp.hooks.hook;
	{
		const contextCaller = async function(hooks, args) {
			for (const hook of hooks) await nuxtApp.runWithContext(() => hook(...args));
		};
		nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, args);
	}
	nuxtApp.callHook = nuxtApp.hooks.callHook;
	nuxtApp.provide = (name, value) => {
		const $name = "$" + name;
		defineGetter(nuxtApp, $name, value);
		defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
	};
	defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
	defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
	const runtimeConfig = options.ssrContext.runtimeConfig;
	nuxtApp.provide("config", runtimeConfig);
	return nuxtApp;
}
/** @since 3.0.0 */
async function applyPlugin(nuxtApp, plugin) {
	if (typeof plugin === "function") {
		const run = () => nuxtApp.runWithContext(() => plugin(nuxtApp));
		const { provide } = await run() || {};
		if (provide && typeof provide === "object") for (const key in provide) nuxtApp.provide(key, provide[key]);
	}
}
/** @since 3.0.0 */
async function applyPlugins(nuxtApp, plugins) {
	let error;
	for (const plugin of plugins) try {
		await applyPlugin(nuxtApp, plugin);
	} catch (e) {
		if (!nuxtApp.payload.error) throw e;
		error ||= e;
	}
	if (error) throw nuxtApp.payload.error || error;
}
/** @since 3.0.0 */
/* @__NO_SIDE_EFFECTS__ */
function defineNuxtPlugin(plugin) {
	if (typeof plugin === "function") return plugin;
	const _name = plugin._name || plugin.name;
	delete plugin.name;
	return Object.assign(plugin.setup || (() => {}), plugin, {
		[NuxtPluginIndicator]: true,
		_name
	});
}
/**
* Ensures that the setup function passed in has access to the Nuxt instance via `useNuxtApp`.
* @param nuxt A Nuxt instance
* @param setup The function to call
* @since 3.0.0
*/
function callWithNuxt(nuxt, setup, args) {
	const fn = () => setup();
	const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
	return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
}
function tryUseNuxtApp(id) {
	let nuxtAppInstance;
	if (hasInjectionContext()) nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
	nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
	return nuxtAppInstance || null;
}
function useNuxtApp(id) {
	const nuxtAppInstance = tryUseNuxtApp(id);
	if (!nuxtAppInstance) throw appDiagnostics.NUXT_E1001();
	return nuxtAppInstance;
}
/** @since 3.0.0 */
/* @__NO_SIDE_EFFECTS__ */
function useRuntimeConfig(_event) {
	return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
	Object.defineProperty(obj, key, { get: () => val });
}

// node_modules/nuxt/dist/app/utils.js
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
// node_modules/nuxt/dist/app/components/injections.js
var LayoutMetaSymbol = Symbol("layout-meta");
var LayoutSymbol = Symbol("layout");
var PageRouteSymbol = Symbol("route");
// node_modules/nuxt/dist/app/diagnostics/navigation.js
/**
* E2xxx
* Navigation / routing / middleware runtime diagnostics.
*/
var navigationDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
// node_modules/nuxt/dist/app/composables/router.js
/** @since 3.0.0 */
var useRouter = () => {
	return useNuxtApp()?.$router;
};
/**
* Whether the current effect scope is (a descendant of) the component instance's scope.
* A detached scope (e.g. `createSharedComposable`) outlives the component, so the
* per-page route injected there would freeze after navigation (#18903).
*/
function isScopeWithinInstance(instance) {
	const instanceScope = instance.scope;
	let scope = getCurrentScope();
	while (scope) {
		if (scope === instanceScope) return true;
		scope = scope.parent;
	}
	return false;
}
/** @since 3.0.0 */
var useRoute$1 = (() => {
	if (hasInjectionContext()) {
		const instance = getCurrentInstance();
		if (!instance || isScopeWithinInstance(instance)) return inject(PageRouteSymbol, useNuxtApp()._route);
	}
	return useNuxtApp()._route;
});
/** @since 3.0.0 */
/* @__NO_SIDE_EFFECTS__ */
function defineNuxtRouteMiddleware(middleware) {
	return middleware;
}
/** @since 3.0.0 */
var isProcessingMiddleware = () => {
	try {
		if (useNuxtApp()._processingMiddleware) return true;
	} catch {
		return false;
	}
	return false;
};
var HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
var HTML_ATTR_ENCODE_MAP = {
	"&": "&amp;",
	"\"": "&quot;",
	"'": "&#x27;",
	"<": "&lt;",
	">": "&gt;"
};
function encodeForHtmlAttr(value) {
	return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
/**
* A helper that aids in programmatic navigation within your Nuxt application.
*
* Can be called on the server and on the client, within pages, route middleware, plugins, and more.
* @param {RouteLocationRaw | undefined | null} [to] - The route to navigate to. Accepts a route object, string path, `undefined`, or `null`. Defaults to '/'.
* @param {NavigateToOptions} [options] - Optional customization for controlling the behavior of the navigation.
* @returns {Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw} The navigation result, which varies depending on context and options.
* @see https://nuxt.com/docs/4.x/api/utils/navigate-to
* @since 3.0.0
*/
var navigateTo = (to, options) => {
	to ||= "/";
	const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
	const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
	const isExternal = options?.external || isExternalHost;
	if (isExternal) {
		if (!options?.external) throw navigationDiagnostics.NUXT_E2001({ toPath });
		const { protocol } = new URL(toPath, "http://localhost");
		if (protocol && isScriptProtocol(protocol)) throw navigationDiagnostics.NUXT_E2002({
			toPath,
			protocol
		});
	}
	const inMiddleware = isProcessingMiddleware();
	const router = useRouter();
	const nuxtApp = useNuxtApp();
	if (nuxtApp.ssrContext) {
		const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
		const location = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
		const redirect = async function(response) {
			await nuxtApp.callHook("app:redirected");
			const encodedHeader = encodeURL(location, isExternalHost);
			const encodedLoc = encodeForHtmlAttr(encodedHeader);
			nuxtApp.ssrContext["~renderResponse"] = {
				statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
				body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
				headers: { location: encodedHeader }
			};
			return response;
		};
		if (!isExternal && inMiddleware) {
			router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
			return to;
		}
		return redirect(!inMiddleware ? void 0 : false);
	}
	if (isExternal) {
		nuxtApp._scope.stop();
		if (options?.replace) (void 0).replace(toPath);
		else (void 0).href = toPath;
		if (inMiddleware) {
			if (!nuxtApp.isHydrating) return false;
			return new Promise(() => {});
		}
		return Promise.resolve();
	}
	const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
	return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
/**
* @internal
*/
function resolveRouteObject(to) {
	return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
/**
* @internal
*/
function encodeURL(location, isExternalHost = false) {
	const url = new URL(location, "http://localhost");
	if (!isExternalHost) return url.pathname.replace(/^\/{2,}/, "/") + url.search + url.hash;
	if (location.startsWith("//")) return url.toString().replace(url.protocol, "");
	return url.toString();
}
/**
* Encode the pathname of a route location string. Ensures decoded paths like
* `/café` are percent-encoded to match vue-router's encoded route records.
* Already-encoded paths are not double-encoded.
* @internal
*/
function encodeRoutePath(url) {
	const parsed = parseURL(url);
	return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
// node_modules/nuxt/dist/app/composables/error.js
var NUXT_ERROR_SIGNATURE = "__nuxt_error";
/** @since 3.0.0 */
var useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
/** @since 3.0.0 */
var showError = (error) => {
	const nuxtError = createError$2(error);
	try {
		const error = /* @__PURE__ */ useError();
		error.value ||= nuxtError;
	} catch {
		throw nuxtError;
	}
	return nuxtError;
};
/**
* Show the error page unless the current client is a crawler, in which case the
* bot receives the already server-rendered HTML instead (#32137, #35338).
*
* @internal
*/
var _showErrorUnlessCrawler = async (nuxtApp, error) => {
	await nuxtApp.runWithContext(() => showError(error));
};
/** @since 3.0.0 */
var isNuxtError = (error) => !!error && typeof error === "object" && "__nuxt_error" in error;
/** @since 3.0.0 */
var createError$2 = (error) => {
	if (typeof error !== "string" && error.statusText) error.message ??= error.statusText;
	const nuxtError = createError(error);
	Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
		value: true,
		configurable: false,
		writable: false
	});
	Object.defineProperty(nuxtError, "status", {
		get: () => nuxtError.statusCode,
		configurable: true
	});
	Object.defineProperty(nuxtError, "statusText", {
		get: () => nuxtError.statusMessage,
		configurable: true
	});
	return nuxtError;
};
// virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Ffetch.mjs
if (!globalThis.$fetch) globalThis.$fetch = $fetch.create({ baseURL: baseURL() });
// virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fglobal-polyfills.mjs
if (!("global" in globalThis)) globalThis.global = globalThis;
// node_modules/nuxt/dist/head/runtime/island-head.js
/**
* No-op `head.push` until the returned `unfreeze` runs. Plugin/transformer
* augmentations on the same head are unaffected.
*/
function freezeHead(head) {
	const realPush = head.push;
	head.push = () => ({
		dispose: () => {},
		patch: () => {},
		_i: 0
	});
	return () => {
		head.push = realPush;
	};
}
// node_modules/nuxt/dist/head/runtime/plugins/unhead.server.js
var plugin$2 = defineNuxtPlugin({
	name: "nuxt:head",
	enforce: "pre",
	setup(nuxtApp) {
		const head = nuxtApp.ssrContext.head;
		if (nuxtApp.ssrContext.islandContext) {
			const unfreeze = freezeHead(head);
			nuxtApp.hooks.hookOnce("app:created", unfreeze);
		}
		nuxtApp.vueApp.use(head);
	}
});
// node_modules/nuxt/dist/pages/runtime/utils.js
var ROUTE_KEY_PARENTHESES_RE$1 = /(:\w+)\([^)]+\)/g;
var ROUTE_KEY_SYMBOLS_RE$1 = /(:\w+)[?+*]/g;
var ROUTE_KEY_NORMAL_RE$1 = /:\w+/g;
var interpolatePath = (route, match) => {
	return match.path.replace(ROUTE_KEY_PARENTHESES_RE$1, "$1").replace(ROUTE_KEY_SYMBOLS_RE$1, "$1").replace(ROUTE_KEY_NORMAL_RE$1, (r) => route.params[r.slice(1)]?.toString() || "");
};
var generateRouteKey$1 = (routeProps, override) => {
	const matchedRoute = routeProps.route.matched.find((m) => m.components?.default === routeProps.Component.type);
	const source = matchedRoute?.meta.key ?? (matchedRoute && interpolatePath(routeProps.route, matchedRoute));
	return typeof source === "function" ? source(routeProps.route) : source;
};
/** @since 3.9.0 */
function toArray$1(value) {
	return Array.isArray(value) ? value : [value];
}
// node_modules/nuxt/dist/app/components/utils.js
/**
* Internal utility
* @private
*/
var _wrapInTransition = (props, children) => {
	return { default: () => children.default?.() };
};
var ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
var ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
var ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
	const source = route?.meta.key ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
	return typeof source === "function" ? source(route) : source;
}
/**
* Utility used within router guards
* return true if the route has been changed with a page change during navigation
*/
function isChangingPage(to, from) {
	if (to === from || from === START_LOCATION) return false;
	if (generateRouteKey(to) !== generateRouteKey(from)) return true;
	if (to.matched.every((comp, index) => comp.components && comp.components.default === from.matched[index]?.components?.default)) return false;
	return true;
}
var VALID_TAG_RE = /^[a-z][a-z0-9-]*$/i;
/** Return `tag` if it is a safe HTML tag name, otherwise `fallback`. */
function sanitizeTag(tag, fallback) {
	return tag && VALID_TAG_RE.test(tag) ? tag : fallback;
}
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}
/**
* Internal utility
* @private
*/
function _mergeTransitionProps(routeProps) {
	const _props = [];
	for (const prop of routeProps) {
		if (!prop) continue;
		_props.push({
			...prop,
			onAfterLeave: prop.onAfterLeave ? toArray(prop.onAfterLeave) : void 0,
			onBeforeLeave: prop.onBeforeLeave ? toArray(prop.onBeforeLeave) : void 0
		});
	}
	return defu(..._props);
}
// node_modules/nuxt/dist/pages/runtime/router.options.js
var router_options_default = { scrollBehavior(to, from, savedPosition) {
	const nuxtApp = useNuxtApp();
	const router = useRouter();
	const hashScrollBehaviour = router.options?.scrollBehaviorType ?? "auto";
	if (to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "")) {
		if (from.hash && !to.hash) return savedPosition ?? {
			left: 0,
			top: 0
		};
		if (to.hash) return {
			el: to.hash,
			top: _getHashElementScrollMarginTop(to.hash),
			behavior: hashScrollBehaviour
		};
		return false;
	}
	if ((typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop) === false) return false;
	if (from === START_LOCATION) return _calculatePosition(to, from, savedPosition, hashScrollBehaviour);
	return new Promise((resolve) => {
		const doScroll = () => {
			requestAnimationFrame(() => {
				if (router.currentRoute.value.fullPath !== to.fullPath) {
					resolve(false);
					return;
				}
				resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour));
			});
		};
		nuxtApp.hooks.hookOnce("page:loading:end", () => {
			const transitionPromise = nuxtApp["~transitionPromise"];
			if (transitionPromise) transitionPromise.then(doScroll);
			else doScroll();
		});
	});
} };
function _getHashElementScrollMarginTop(selector) {
	try {
		const elem = (void 0).querySelector(selector);
		if (elem) return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
	} catch {}
	return 0;
}
function _calculatePosition(to, from, savedPosition, defaultHashScrollBehaviour) {
	if (savedPosition) return savedPosition;
	if (to.hash) return {
		el: to.hash,
		top: _getHashElementScrollMarginTop(to.hash),
		behavior: isChangingPage(to, from) ? defaultHashScrollBehaviour : "instant"
	};
	return {
		left: 0,
		top: 0
	};
}
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default = {
	hashMode: false,
	scrollBehaviorType: "auto",
	...router_options_default
};
Object.assign(Object.create(null), {});
var pageIslandRoutes = Object.assign(Object.create(null), {});
// node_modules/nuxt/dist/pages/runtime/validate.js
var middleware$1 = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
	let __temp, __restore;
	if (!to.meta?.validate) return;
	const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
	if (result === true) return;
	return createError$2({
		fatal: false,
		status: result && (result.status || result.statusCode) || 404,
		statusText: result && (result.statusText || result.statusMessage) || `Page Not Found: ${to.fullPath}`,
		data: { path: to.fullPath }
	});
});
// app/utils/storage.ts
var safeStorage = {
	getJson(key) {
		try {
			const stored = localStorage.getItem(key);
			if (!stored) return null;
			return JSON.parse(stored);
		} catch {
			return null;
		}
	},
	setItem(key, value) {
		try {
			localStorage.setItem(key, value);
		} catch {}
	}
};
// app/i18n/messages.ts
var messages = {
	ru: {
		nav: {
			devices: "Устройства",
			pricing: "Тарифы",
			support: "Поддержка"
		},
		layout: {
			menu: "Меню",
			footerNote: "Российское ПО"
		},
		hero: {
			tagline: "Температура холодильного оборудования под контролем 24/7",
			title: "ШиП-монитор",
			subtitle: "Промышленный холодильный контроллер и датчики температуры для автоматического контроля на пищевых производствах, складах, в аптеках и торговых сетях.",
			cta: "Подключить мониторинг"
		},
		arch: {
			heading: "Как это работает",
			headingAlt: "от камеры — до вашего телефона",
			description: "Никакой магии: щуп внутри камеры, радиоканал до хаба, сервер и личный кабинет. А дальше — главное: вы узнаёте о поломке за минуты, а не утром, когда мясо уже не спасти.",
			step1Title: "Щуп — внутри камеры",
			step1Text: "Датчик крепится снаружи морозилки, измерительный щуп заводится внутрь, к продуктам. Ни одного провода через камеру и никакого вмешательства в работу холодильника — работает даже при −30 °C. И у датчика есть своя батарея: час автономии в запасе.",
			step2Title: "Хаб — один на весь склад",
			step2Text: "LoRa-радиоканал пробивает стены и морозильные двери: 10, 15 камер — все выйдут на один хаб. Тянуть провода по складу не нужно.",
			step3Title: "Интернет пропал? Не страшно",
			step3Text: "Хаб передаёт данные на сервер, как только связь вернётся, а при серьёзной аварии отправит SMS сам. Отключили электричество — у хаба есть час автономной работы.",
			step4Title: "Телефон звенит раньше, чем испортился товар",
			step4Text: "Все камеры — на одном экране в личном кабинете. Температура вышла за порог — уведомление на сайте, push или SMS. Журналы ХАССП и отчёты для СЭС выгружаются в один клик."
		},
		segments: {
			heading: "Кому это нужно",
			headingAlt: "Система ШиП-Монитор",
			description: "Система мониторинга холодильного оборудования для бизнеса, где холод — это деньги: от одной камеры в кафе до распределённых складов и автопарка рефрижераторов. Автоматический журнал температуры вместо ручных замеров.",
			seg1Title: "Пищевые производства",
			seg1Text: "Контроль температуры в цехах, камерах охлаждения и заморозки. Автоматические журналы ХАССП вместо ручных замеров три раза в день.",
			seg2Title: "Склады и холодильные камеры",
			seg2Text: "Мониторинг температуры склада 24/7: до 15 камер на один хаб, пороги для каждого датчика, история показаний за 12 месяцев и автоматический журнал температуры.",
			seg3Title: "Магазины и торговые сети",
			seg3Text: "Все точки продаж на одном экране: витрины, бонеты, камеры. Директор видит аварию раньше, чем позвонит администратор магазина.",
			seg4Title: "Аптеки и фармацевтика",
			seg4Text: "Контроль температуры в аптеке по СанПиН: термолабильные препараты под наблюдением, отчёты для проверок выгружаются в один клик.",
			seg5Title: "Рестораны и общепит",
			seg5Text: "Журнал температур ХАССП ведётся сам, а при выходе температуры за порог приходит SMS — до того, как испортилась партия продуктов.",
			seg6Title: "Транспорт и рефрижераторы",
			seg6Text: "Мониторинг рефрижераторов в пути: работает как регистратор температуры для рефрижераторов, но с онлайн-доступом. Датчик с аварийной батареей продолжает писать температуру, даже если водитель заглушил машину."
		},
		roadmap: {
			heading: "Дорожная карта",
			headingAlt: "что сделано и что в работе",
			unavailable: "Дорожная карта временно недоступна",
			retry: "Повторить",
			empty: "Дорожная карта пока не заполнена"
		},
		tech: {
			heading: "Железо и софт",
			hardware: "Аппаратная часть",
			software: "Программная часть",
			sensorTitle: "Промышленный датчик температуры",
			hubTitle: "Промышленный холодильный контроллер (Шлюз)",
			cloudTitle: "Облачный сервис мониторинга",
			sensorChipLabel: "Чип",
			sensorChipValue: "Температурный модуль + микроконтроллер",
			sensorRadioLabel: "Радио",
			sensorRadioValue: "Встроенный LoRa-модуль для связи с хабом",
			sensorProbesLabel: "Датчики",
			sensorProbesValue: "Выносные цифровые термодатчики, кабель до 5 м",
			sensorPowerLabel: "Питание",
			sensorPowerValue: "Аварийная батарея (до 1 часа), зарядка USB-C",
			sensorCaseLabel: "Корпус",
			sensorCaseValue: "Промышленный пластик, IP54",
			hubTypeLabel: "Тип",
			hubTypeValue: "Промышленный холодильный контроллер",
			hubCoreLabel: "Ядро",
			hubCoreValue: "Промышленный микроконтроллер",
			hubCommsLabel: "Связь",
			hubCommsValue: "LoRa-приём датчиков, GSM/Wi-Fi-канал до сервера",
			hubPowerLabel: "Питание",
			hubPowerValue: "Аварийная батарея (до 1 часа), зарядка USB-C",
			hubCaseLabel: "Корпус",
			hubCaseValue: "Промышленный пластик, IP54",
			cloudVizLabel: "Визуализация",
			cloudVizValue: "Температура в реальном времени, графики, история",
			cloudAlertsLabel: "Уведомления",
			cloudAlertsValue: "Push + SMS, настройка порогов для каждого датчика",
			cloudReportsLabel: "Отчёты",
			cloudReportsValue: "Экспорт журналов для СЭС в один клик",
			cloudGroupsLabel: "Группировка",
			cloudGroupsValue: "Объединение датчиков по объектам и зонам",
			cloudAccessLabel: "Доступ",
			cloudAccessValue: "Мультипользовательский, роли: директор, менеджер",
			cloudStackLabel: "Стек",
			cloudStackValue: "Vue 3, TypeScript, Node.js, PostgreSQL"
		},
		devices: {
			heading: "Устройства",
			headingAlt: "Оборудование",
			description: "Промышленные датчики температуры и холодильные контроллеры передают показания в облачную систему и продолжают контролировать объект даже при нестабильном подключении",
			sensorCategory: "Промышленный датчик температуры",
			sensorDescription: "Компактный беспроводной термодатчик для холодильных камер, складов, аптек и производственных помещений. Только мониторинг: регистрирует температуру и не вмешивается в работу оборудования. Диапазон −40…+85 °C, связь с хабом по LoRa.",
			hubCategory: "Промышленный холодильный контроллер",
			hubDescription: "Хаб-шлюз для объекта любого размера: собирает показания датчиков по LoRa и передаёт их на сервер. Нет интернета — отправит аварийные SMS. Поддерживает до 32 датчиков.",
			range: "Диапазон",
			link: "Связь",
			radio: "LoRa",
			power: "Питание",
			battery: "Батарея",
			channels: "Каналы",
			sensors: "Датчики",
			upTo32: "До 32",
			backup: "Резерв",
			backupTime: "До 1 часа",
			sensorPrice: "от 10 000 ₽",
			hubPrice: "от 15 000 ₽",
			request: "Запросить"
		},
		pricing: {
			heading: "Тарифы",
			headingAlt: "прозрачные условия",
			description: "Начните с базового мониторинга и расширяйте систему по мере роста",
			standardSubtitle: "Для малого и среднего бизнеса",
			standardTitle: "Стандартный",
			standardPrice: "1 500 ₽",
			perMonth: "/ месяц",
			standardF1: "До 15 подключённых устройств",
			standardF2: "Хранение истории за 12 месяцев",
			standardF3: "Уведомления Push + SMS",
			standardF4: "До 5 объектов мониторинга",
			standardF5: "Экспорт отчётов для СЭС и журналов ХАССП",
			connect: "Подключить",
			corporateSubtitle: "Для распределённых систем",
			corporateTitle: "Корпоративный",
			corporatePrice: "По запросу",
			corporateF1: "Неограниченное количество объектов",
			corporateF2: "Персональные роли и права доступа",
			corporateF3: "Интеграция через API",
			corporateF4: "Настраиваемый срок хранения данных",
			corporateF5: "Индивидуальная поддержка",
			discuss: "Обсудить проект",
			equipmentNote: "Стоимость оборудования рассчитывается отдельно."
		},
		faq: {
			label: "Частые вопросы",
			description: "Основное о подключении, уведомлениях и работе холодильных контроллеров.",
			ask: "Задать свой вопрос",
			loadError: "Не удалось загрузить вопросы"
		},
		form: {
			heading: "Заявка",
			note: "ответим в течение дня",
			nameLabel: "Имя",
			namePlaceholder: "Иван",
			phoneLabel: "Телефон",
			emailLabel: "Email",
			companyLabel: "Компания",
			companyPlaceholder: "ООО Пример",
			chambersLabel: "Камер",
			commentLabel: "Комментарий",
			commentPlaceholder: "Вопросы, пожелания…",
			agreement: "Согласен на обработку персональных данных",
			success: "Заявка отправлена. Мы свяжемся с вами в ближайшее время.",
			sending: "Отправляем…",
			submit: "Отправить заявку",
			errorName: "Введите имя",
			errorEmail: "Введите email",
			errorEmailInvalid: "Некорректный email",
			errorCompany: "Введите название компании",
			errorCount: "Количество должно быть минимум 1",
			errorAgreement: "Требуется согласие на обработку данных"
		},
		cookie: {
			title: "Cookie-файлы",
			text: "Мы используем cookie-файлы для корректной работы сайта. Продолжая пользоваться сайтом, вы соглашаетесь с их использованием. По вопросам обработки персональных данных:",
			accept: "Понятно",
			aria: "Уведомление об использовании cookie-файлов"
		}
	},
	en: {
		nav: {
			devices: "Devices",
			pricing: "Pricing",
			support: "Support"
		},
		layout: {
			menu: "Menu",
			footerNote: "Russian software"
		},
		hero: {
			tagline: "Refrigeration equipment temperature under control 24/7",
			title: "Ship-Monitor",
			subtitle: "An industrial refrigeration controller and temperature sensors for automated cold chain monitoring at food production facilities, warehouses, pharmacies and retail chains.",
			cta: "Start monitoring"
		},
		arch: {
			heading: "How it works",
			headingAlt: "from the cold room — to your phone",
			description: "No magic: a probe inside the chamber, a radio link to the hub, a server and a dashboard. And then the part that matters: you learn about a breakdown in minutes — not in the morning, when the meat is already lost.",
			step1Title: "The probe goes inside the chamber",
			step1Text: "The sensor mounts outside the freezer while its measuring probe goes inside, next to the goods. Not a single cable through the chamber, zero interference with the refrigeration unit — it keeps working even at −30 °C. The sensor has its own battery: an hour of autonomy as backup.",
			step2Title: "One hub for the whole warehouse",
			step2Text: "The LoRa radio link cuts through walls and freezer doors: 10, 15 chambers — they all reach a single hub. No cables across the warehouse.",
			step3Title: "Internet down? No problem",
			step3Text: "The hub delivers data to the server as soon as the connection returns — and sends an SMS by itself if something goes seriously wrong. Power cut? The hub has an hour of battery autonomy.",
			step4Title: "Your phone rings before the goods spoil",
			step4Text: "Every chamber on one screen in your dashboard. Temperature leaves the threshold — you get a web, push or SMS notification. HACCP logs and hygiene reports export in one click."
		},
		segments: {
			heading: "Who it is for",
			headingAlt: "Ship-Monitor system",
			description: "A refrigeration equipment monitoring system for businesses where cold means money: from a single cold room in a café to distributed warehouses and a reefer fleet. An automatic temperature log instead of manual readings.",
			seg1Title: "Food production",
			seg1Text: "Temperature control in workshops, cooling and freezing rooms. Automated HACCP logs instead of manual readings three times a day.",
			seg2Title: "Warehouses and cold rooms",
			seg2Text: "24/7 warehouse temperature monitoring: up to 15 cold rooms on one hub, thresholds per sensor, 12 months of reading history and an automatic temperature log.",
			seg3Title: "Retail stores and chains",
			seg3Text: "Every store on one screen: display cases, islands, cold rooms. The director sees an alert before the store manager even calls.",
			seg4Title: "Pharmacies and pharma",
			seg4Text: "Pharmacy temperature control in line with sanitary rules: thermolabile products under watch, inspection reports in one click.",
			seg5Title: "Restaurants and food service",
			seg5Text: "The HACCP temperature log keeps itself, and an SMS arrives the moment temperature leaves the threshold — before the batch is lost.",
			seg6Title: "Transport and reefers",
			seg6Text: "Reefer monitoring on the road: it works as a temperature data logger for reefers, but with online access. The sensor's backup battery keeps recording even when the driver shuts the engine off."
		},
		roadmap: {
			heading: "Roadmap",
			headingAlt: "done and in progress",
			unavailable: "The roadmap is temporarily unavailable",
			retry: "Retry",
			empty: "The roadmap is not filled in yet"
		},
		tech: {
			heading: "Hardware & software",
			hardware: "Hardware",
			software: "Software",
			sensorTitle: "Industrial temperature sensor",
			hubTitle: "Industrial refrigeration controller (gateway)",
			cloudTitle: "Cloud monitoring service",
			sensorChipLabel: "Chip",
			sensorChipValue: "Temperature module + microcontroller",
			sensorRadioLabel: "Radio",
			sensorRadioValue: "Built-in LoRa module for hub communication",
			sensorProbesLabel: "Probes",
			sensorProbesValue: "External digital temperature probes, cable up to 5 m",
			sensorPowerLabel: "Power",
			sensorPowerValue: "Backup battery (up to 1 hour), USB-C charging",
			sensorCaseLabel: "Enclosure",
			sensorCaseValue: "Industrial plastic, IP54",
			hubTypeLabel: "Type",
			hubTypeValue: "Industrial refrigeration controller",
			hubCoreLabel: "Core",
			hubCoreValue: "Industrial microcontroller",
			hubCommsLabel: "Connectivity",
			hubCommsValue: "LoRa for probes, GSM/Wi-Fi uplink to the server",
			hubPowerLabel: "Power",
			hubPowerValue: "Backup battery (up to 1 hour), USB-C charging",
			hubCaseLabel: "Enclosure",
			hubCaseValue: "Industrial plastic, IP54",
			cloudVizLabel: "Visualization",
			cloudVizValue: "Real-time temperature, charts, history",
			cloudAlertsLabel: "Alerts",
			cloudAlertsValue: "Push + SMS, per-sensor threshold configuration",
			cloudReportsLabel: "Reports",
			cloudReportsValue: "One-click hygiene inspection log export",
			cloudGroupsLabel: "Grouping",
			cloudGroupsValue: "Group probes by sites and zones",
			cloudAccessLabel: "Access",
			cloudAccessValue: "Multi-user, roles: director, manager",
			cloudStackLabel: "Stack",
			cloudStackValue: "Vue 3, TypeScript, Node.js, PostgreSQL"
		},
		devices: {
			heading: "Devices",
			headingAlt: "Equipment",
			description: "Industrial temperature sensors and refrigeration controllers stream readings to the cloud and keep monitoring the site even on unstable connections",
			sensorCategory: "Industrial temperature sensor",
			sensorDescription: "Compact wireless temperature probe for cold rooms, warehouses, pharmacies and production areas. Monitoring only: it records temperature and never interferes with the equipment. Range −40 to +85 °C, LoRa link to the hub.",
			hubCategory: "Industrial refrigeration controller",
			hubDescription: "A gateway hub for sites of any size: collects readings from probes over LoRa and forwards them to the server. No internet? It sends emergency SMS. Supports up to 32 probes.",
			range: "Range",
			link: "Link",
			radio: "LoRa",
			power: "Power",
			battery: "Battery",
			channels: "Channels",
			sensors: "Probes",
			upTo32: "Up to 32",
			backup: "Backup",
			backupTime: "Up to 1 hour",
			sensorPrice: "from 10 000 ₽",
			hubPrice: "from 15 000 ₽",
			request: "Request"
		},
		pricing: {
			heading: "Pricing",
			headingAlt: "transparent terms",
			description: "Start with basic monitoring and scale the system as you grow",
			standardSubtitle: "For small and medium businesses",
			standardTitle: "Standard",
			standardPrice: "1 500 ₽",
			perMonth: "/ month",
			standardF1: "Up to 15 connected devices",
			standardF2: "12 months of history storage",
			standardF3: "Push + SMS notifications",
			standardF4: "Up to 5 monitored sites",
			standardF5: "HACCP and hygiene inspection report export",
			connect: "Get started",
			corporateSubtitle: "For distributed systems",
			corporateTitle: "Corporate",
			corporatePrice: "On request",
			corporateF1: "Unlimited number of sites",
			corporateF2: "Custom roles and permissions",
			corporateF3: "API integration",
			corporateF4: "Configurable data retention",
			corporateF5: "Dedicated support",
			discuss: "Discuss the project",
			equipmentNote: "Equipment is priced separately."
		},
		faq: {
			label: "FAQ",
			description: "The essentials about setup, notifications and how our refrigeration controllers work.",
			ask: "Ask your own question",
			loadError: "Failed to load questions"
		},
		form: {
			heading: "Request",
			note: "we reply within a day",
			nameLabel: "Name",
			namePlaceholder: "Ivan",
			phoneLabel: "Phone",
			emailLabel: "Email",
			companyLabel: "Company",
			companyPlaceholder: "ACME LLC",
			chambersLabel: "Cold rooms",
			commentLabel: "Comment",
			commentPlaceholder: "Questions, requests…",
			agreement: "I agree to the processing of personal data",
			success: "Request sent. We will contact you shortly.",
			sending: "Sending…",
			submit: "Send request",
			errorName: "Enter your name",
			errorEmail: "Enter your email",
			errorEmailInvalid: "Invalid email",
			errorCompany: "Enter your company name",
			errorCount: "The number must be at least 1",
			errorAgreement: "Consent to data processing is required"
		},
		cookie: {
			title: "Cookies",
			text: "We use cookies to make the site work properly. By continuing to use the site you agree to their use. For personal data processing questions:",
			accept: "Got it",
			aria: "Cookie usage notice"
		}
	}
};
// app/i18n/index.ts
var LOCALE_CHOICE_KEY = "locale-choice";
var createAppI18n = () => createI18n({
	legacy: false,
	globalInjection: true,
	locale: "ru",
	fallbackLocale: "ru",
	messages
});
function setLocale(locale) {
	useNuxtApp().$i18n.global.locale.value = locale;
}
function localeRef() {
	return useNuxtApp().$i18n.global.locale;
}
function saveLocaleChoice(locale) {
	safeStorage.setItem(LOCALE_CHOICE_KEY, JSON.stringify(locale));
}
// app/middleware/locale.global.ts
var locale_global_default = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
	setLocale(to.path === "/en" || to.path.startsWith("/en/") ? "en" : "ru");
});
// node_modules/nuxt/dist/app/diagnostics/manifest.js
/**
* E5xxx
* App manifest / route-rules runtime diagnostics.
*/
var manifestDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
// virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Froute-rules.mjs
var sensitiveMatcher = /* @__PURE__ */ (() => {
	const $0 = {};
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1);
		if (p === "/logo.png") r.push({ data: $0 });
		else if (p === "/Dobryak_font.ttf") r.push({ data: $0 });
		else if (p === "/robots.txt") r.push({ data: $0 });
		else if (p === "/sitemap.xml") r.push({ data: $0 });
		else if (p === "/llms.txt") r.push({ data: $0 });
		else if (p === "/ai-catalog.json") r.push({ data: $0 });
		else if (p === "/.well-known/ai-catalog.json") r.push({ data: $0 });
		else if (p.charCodeAt(p.length - 1) === 47) {
			if (p === "/logo.png/") r.push({ data: $0 });
			else if (p === "/Dobryak_font.ttf/") r.push({ data: $0 });
			else if (p === "/robots.txt/") r.push({ data: $0 });
			else if (p === "/sitemap.xml/") r.push({ data: $0 });
			else if (p === "/llms.txt/") r.push({ data: $0 });
			else if (p === "/ai-catalog.json/") r.push({ data: $0 });
			else if (p === "/.well-known/ai-catalog.json/") r.push({ data: $0 });
		}
		return r.reverse();
	};
})();
var foldedMatcher = /* @__PURE__ */ (() => {
	const $0 = {};
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1);
		if (p === "/logo.png") r.push({ data: $0 });
		else if (p === "/dobryak_font.ttf") r.push({ data: $0 });
		else if (p === "/robots.txt") r.push({ data: $0 });
		else if (p === "/sitemap.xml") r.push({ data: $0 });
		else if (p === "/llms.txt") r.push({ data: $0 });
		else if (p === "/ai-catalog.json") r.push({ data: $0 });
		else if (p === "/.well-known/ai-catalog.json") r.push({ data: $0 });
		else if (p.charCodeAt(p.length - 1) === 47) {
			if (p === "/logo.png/") r.push({ data: $0 });
			else if (p === "/dobryak_font.ttf/") r.push({ data: $0 });
			else if (p === "/robots.txt/") r.push({ data: $0 });
			else if (p === "/sitemap.xml/") r.push({ data: $0 });
			else if (p === "/llms.txt/") r.push({ data: $0 });
			else if (p === "/ai-catalog.json/") r.push({ data: $0 });
			else if (p === "/.well-known/ai-catalog.json/") r.push({ data: $0 });
		}
		return r.reverse();
	};
})();
var decodeRoutePath = function decodeRoutePath(path) {
	if (!path.includes("%")) return path;
	const queryIndex = path.indexOf("?");
	const pathname = queryIndex === -1 ? path : path.slice(0, queryIndex);
	try {
		return queryIndex === -1 ? decodeURI(pathname) : decodeURI(pathname) + path.slice(queryIndex);
	} catch {
		return path;
	}
};
var normalizePath = (path, fold) => {
	if (typeof path !== "string") return path;
	const decoded = decodeRoutePath(path);
	return fold ? decoded.toLowerCase() : decoded;
};
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froute_rules_default = (path) => virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.sensitive ? defu({}, ...sensitiveMatcher("", normalizePath(path, false)).map((r) => r.data).reverse()) : defu({}, ...foldedMatcher("", normalizePath(path, true)).map((r) => r.data).reverse());
// node_modules/nuxt/dist/app/composables/manifest.js
var routeRulesMatcher$1 = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froute_rules_default;
function getRouteRules(arg) {
	const path = typeof arg === "string" ? arg : arg.path;
	try {
		return routeRulesMatcher$1(path);
	} catch (e) {
		manifestDiagnostics.NUXT_E5003({
			path,
			cause: e
		});
		return {};
	}
}
// virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fmiddleware.mjs
var globalMiddleware = [
	middleware$1,
	locale_global_default,
	/* @__PURE__ */ defineNuxtRouteMiddleware((to) => {})
];
var namedMiddleware = {};
// virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Froutes.mjs
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froutes_default = [
	{
		name: "en",
		path: "/en",
		meta: { layout: "landing" },
		component: () => import('../build/en-DsKtYOE_.mjs')
	},
	{
		name: "slug",
		path: "/:slug(.*)*",
		meta: {
			layout: "landing",
			middleware: [() => navigateTo("/", { redirectCode: 302 })]
		},
		component: () => import('../build/_...slug_-D16xZmJC.mjs')
	},
	{
		name: "index",
		path: "/",
		meta: { layout: "landing" },
		component: () => import('../build/pages-bUE_GGmL.mjs')
	}
];
// node_modules/nuxt/dist/pages/runtime/plugins/router.js
var plugin$1 = defineNuxtPlugin({
	name: "nuxt:router",
	enforce: "pre",
	async setup(nuxtApp) {
		let __temp, __restore;
		let routerBase = useRuntimeConfig().app.baseURL;
		const history = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.history?.(routerBase) ?? createMemoryHistory(routerBase);
		const routes = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.routes ? ([__temp, __restore] = executeAsync(() => virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.routes(virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froutes_default)), __temp = await __temp, __restore(), __temp) ?? virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froutes_default : virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froutes_default;
		let startPosition;
		const router = createRouter({
			...virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default,
			scrollBehavior: (to, from, savedPosition) => {
				if (from === START_LOCATION) {
					startPosition = savedPosition;
					return;
				}
				if (virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.scrollBehavior) {
					router.options.scrollBehavior = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.scrollBehavior;
					if ("scrollRestoration" in (void 0).history) {
						const unsub = router.beforeEach(() => {
							unsub();
							(void 0).history.scrollRestoration = "manual";
						});
					}
					return virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
				}
			},
			history,
			routes
		});
		nuxtApp.vueApp.use(router);
		const previousRoute = shallowRef(router.currentRoute.value);
		router.afterEach((_to, from) => {
			previousRoute.value = from;
		});
		Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", { get: () => previousRoute.value });
		const initialURL = nuxtApp.ssrContext.url;
		const _route = shallowRef(router.currentRoute.value);
		const syncCurrentRoute = () => {
			_route.value = router.currentRoute.value;
		};
		router.afterEach((to, from) => {
			const lastTo = to.matched.at(-1)?.components?.default;
			const lastFrom = from.matched.at(-1)?.components?.default;
			if (lastTo === lastFrom) {
				if (generateRouteKey$1({
					route: to,
					Component: { type: lastTo }
				}) === generateRouteKey$1({
					route: from,
					Component: { type: lastFrom }
				})) syncCurrentRoute();
				return;
			}
			if (to.matched.length < from.matched.length && to.matched.every((m, i) => m.components?.default === from.matched[i]?.components?.default)) syncCurrentRoute();
		});
		const route = { sync: syncCurrentRoute };
		for (const key in _route.value) Object.defineProperty(route, key, {
			get: () => _route.value[key],
			enumerable: true
		});
		nuxtApp._route = shallowReactive(route);
		nuxtApp._middleware ||= {
			global: [],
			named: {}
		};
		const error = /* @__PURE__ */ useError();
		const isServerPage = nuxtApp.ssrContext?.islandContext?.name?.startsWith("page_");
		if (!nuxtApp.ssrContext?.islandContext || isServerPage) router.afterEach(async (to, _from, failure) => {
			delete nuxtApp._processingMiddleware;
			delete nuxtApp._middlewareTo;
			if (failure) await nuxtApp.callHook("page:loading:end");
			if (failure?.type === 4) return;
			if (to.redirectedFrom && to.fullPath !== initialURL) await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
		});
		try {
			[__temp, __restore] = executeAsync(() => router.push(initialURL)), __temp = await __temp, __restore();
			[__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
		} catch (error) {
			[__temp, __restore] = executeAsync(() => _showErrorUnlessCrawler(nuxtApp, error)), await __temp, __restore();
		}
		const resolvedInitialRoute = router.currentRoute.value;
		syncCurrentRoute();
		if (nuxtApp.ssrContext?.islandContext && !isServerPage) return { provide: { router } };
		const initialLayout = nuxtApp.payload.state._layout;
		router.beforeEach(async (to, from) => {
			await nuxtApp.callHook("page:loading:start");
			to.meta = reactive(to.meta);
			if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) to.meta.layout = initialLayout;
			nuxtApp._processingMiddleware = true;
			nuxtApp._middlewareTo = to;
			if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
				const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
				for (const component of to.matched) {
					const componentMiddleware = component.meta.middleware;
					if (!componentMiddleware) continue;
					for (const entry of toArray$1(componentMiddleware)) middlewareEntries.add(entry);
				}
				const routeRules = getRouteRules({ path: to.path });
				if (routeRules.appMiddleware) for (const key in routeRules.appMiddleware) if (routeRules.appMiddleware[key]) middlewareEntries.add(key);
				else middlewareEntries.delete(key);
				for (const entry of middlewareEntries) {
					const middleware = typeof entry === "string" ? nuxtApp._middleware.named[entry] || await namedMiddleware[entry]?.().then((r) => r.default || r) : entry;
					if (!middleware) throw navigationDiagnostics.NUXT_E2004({
						entry: String(entry),
						validMiddleware: void 0
					});
					try {
						const result = await nuxtApp.runWithContext(() => middleware(to, from));
						if (result === false || result instanceof Error) {
							const error = result || createError$2({
								status: 404,
								statusText: `Page Not Found: ${initialURL}`
							});
							await nuxtApp.runWithContext(() => showError(error));
							return false;
						}
						if (result === true) continue;
						if (result === false) return result;
						if (result) {
							if (isNuxtError(result) && result.fatal) await nuxtApp.runWithContext(() => showError(result));
							return result;
						}
					} catch (err) {
						const error = createError$2(err);
						if (error.fatal) await nuxtApp.runWithContext(() => showError(error));
						return error;
					}
				}
			}
		});
		if (isServerPage) router.beforeResolve((to) => {
			const expected = pageIslandRoutes[nuxtApp.ssrContext.islandContext.name];
			const actual = to.matched.find((m) => (m.components?.default)?.__nuxt_island)?.components?.default;
			if (!expected || expected !== actual?.__nuxt_island) {
				nuxtApp.ssrContext["~renderResponse"] = {
					statusCode: 400,
					statusMessage: "Invalid island request path"
				};
				return false;
			}
		});
		router.onError(async () => {
			delete nuxtApp._processingMiddleware;
			delete nuxtApp._middlewareTo;
			await nuxtApp.callHook("page:loading:end");
		});
		router.afterEach((to) => {
			if (to.matched.length === 0 && !error.value) return nuxtApp.runWithContext(() => showError(createError$2({
				status: 404,
				fatal: false,
				statusText: `Page not found: ${to.fullPath}`,
				data: { path: to.fullPath }
			})));
		});
		nuxtApp.hooks.hookOnce("app:created", async () => {
			try {
				if ("name" in resolvedInitialRoute) resolvedInitialRoute.name = void 0;
				await router.replace({
					...resolvedInitialRoute,
					force: true
				});
				router.options.scrollBehavior = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.scrollBehavior;
			} catch (error) {
				await _showErrorUnlessCrawler(nuxtApp, error);
			}
		});
		return { provide: { router } };
	}
});
// node_modules/nuxt/dist/app/diagnostics/head.js
/**
* E6xxx
* Head / unhead runtime diagnostics.
*/
var unheadDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
// node_modules/nuxt/dist/head/runtime/composables.js
/**
* Injects the head client from the Nuxt context or Vue inject.
*/
function injectHead(nuxtApp) {
	const nuxt = nuxtApp || useNuxtApp();
	return nuxt.ssrContext?.head || nuxt.runWithContext(() => {
		if (hasInjectionContext()) {
			const head = inject(headSymbol);
			if (!head) throw unheadDiagnostics.NUXT_E6001();
			return head;
		}
	});
}
function useHead$2(input, options = {}) {
	const head = options.head || injectHead(options.nuxt);
	return useHead(input, {
		head,
		...options
	});
}
function useSeoMeta$2(input, options = {}) {
	const head = options.head || injectHead(options.nuxt);
	return useSeoMeta(input, {
		head,
		...options
	});
}
// node_modules/nuxt/dist/app/composables/payload.js
/**
* This is an experimental function for configuring passing rich data from server -> client.
* @since 3.4.0
*/
function definePayloadReducer(name, reduce) {
	useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
}
// node_modules/nuxt/dist/app/plugins/revive-payload.server.js
var reducers = [
	["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
	["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
	["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
	["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
	["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
	["Ref", (data) => isRef(data) && data.value],
	["Reactive", (data) => isReactive(data) && toRaw(data)]
];
// virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fplugins.server.mjs
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Fplugins_server_default = [
	plugin$2,
	plugin$1,
	/* @__PURE__ */ defineNuxtPlugin({
		name: "nuxt:revive-payload:server",
		setup() {
			for (const [reducer, fn] of reducers) definePayloadReducer(reducer, fn);
		}
	}),
	defineNuxtPlugin({ name: "nuxt:global-components" }),
	defineNuxtPlugin((nuxtApp) => {
		const i18n = createAppI18n();
		nuxtApp.vueApp.use(i18n);
		return { provide: { i18n } };
	})
];
// node_modules/nuxt/dist/app/composables/layout.js
var routeRulesMatcher = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froute_rules_default;
function resolveLayoutName(route, name) {
	return unref(name) ?? route?.meta.layout ?? routeRulesMatcher(route?.path ?? "/").appLayout ?? "default";
}
// virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Flayouts.mjs
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Flayouts_default = { landing: defineAsyncComponent(() => import('../build/landing-ZsthXdmz.mjs').then((m) => m.default || m)) };
// node_modules/nuxt/dist/app/components/nuxt-layout.js
var LayoutLoader = defineComponent({
	name: "LayoutLoader",
	inheritAttrs: false,
	props: {
		name: String,
		layoutProps: Object
	},
	setup(props, context) {
		return () => h(virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Flayouts_default[props.name], props.layoutProps, context.slots);
	}
});
var nuxt_layout_default = defineComponent({
	name: "NuxtLayout",
	inheritAttrs: false,
	props: {
		name: {
			type: [
				String,
				Boolean,
				Object
			],
			default: null
		},
		fallback: {
			type: [String, Object],
			default: null
		}
	},
	setup(props, context) {
		const nuxtApp = useNuxtApp();
		const injectedRoute = inject(PageRouteSymbol);
		const route = !injectedRoute || injectedRoute === useRoute$1() ? useRoute() : injectedRoute;
		const layout = computed(() => {
			let layout = resolveLayoutName(route, props.name);
			if (layout && !(layout in virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Flayouts_default)) {
				if (props.fallback) layout = unref(props.fallback);
			}
			return layout;
		});
		provide(LayoutSymbol, layout);
		const layoutRef = shallowRef();
		context.expose({ layoutRef });
		const done = nuxtApp.deferHydration();
		let lastLayout;
		return () => {
			const hasTransition = !!layout.value && layout.value in virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Flayouts_default && !!(route?.meta.layoutTransition ?? false);
			const transitionProps = hasTransition && _mergeTransitionProps([
				route?.meta.layoutTransition,
				false,
				{
					onBeforeLeave() {
						nuxtApp["~transitionPromise"] = new Promise((resolve) => {
							nuxtApp["~transitionFinish"] = resolve;
						});
					},
					onAfterLeave() {
						nuxtApp["~transitionFinish"]?.();
						delete nuxtApp["~transitionFinish"];
						delete nuxtApp["~transitionPromise"];
					}
				}
			]);
			const previouslyRenderedLayout = lastLayout;
			lastLayout = layout.value;
			return _wrapInTransition(transitionProps, { default: () => h(Suspense, {
				suspensible: true,
				onResolve: async () => {
					await nextTick(done);
				}
			}, { default: () => h(LayoutProvider, {
				layoutProps: mergeProps(context.attrs, route.meta.layoutProps ?? {}, { ref: layoutRef }),
				key: layout.value || void 0,
				name: layout.value,
				shouldProvide: !props.name,
				isRenderingNewLayout: (name) => {
					return name !== previouslyRenderedLayout && name === layout.value;
				},
				hasTransition
			}, context.slots) }) }).default();
		};
	}
});
var LayoutProvider = defineComponent({
	name: "NuxtLayoutProvider",
	inheritAttrs: false,
	props: {
		name: { type: [String, Boolean] },
		layoutProps: { type: Object },
		hasTransition: { type: Boolean },
		shouldProvide: { type: Boolean },
		isRenderingNewLayout: {
			type: Function,
			required: true
		}
	},
	setup(props, context) {
		const name = props.name;
		if (props.shouldProvide) provide(LayoutMetaSymbol, { isCurrent: (route) => name === false || name === resolveLayoutName(route) });
		const injectedRoute = inject(PageRouteSymbol);
		const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute$1();
		const enclosingLayout = inject(LayoutMetaSymbol, null);
		if (isNotWithinNuxtPage) {
			const vueRouterRoute = useRoute();
			const reactiveChildRoute = {};
			for (const _key in vueRouterRoute) {
				const key = _key;
				Object.defineProperty(reactiveChildRoute, key, {
					enumerable: true,
					get: () => {
						return props.isRenderingNewLayout(props.name) && (!enclosingLayout || enclosingLayout.isCurrent(vueRouterRoute)) ? vueRouterRoute[key] : injectedRoute[key];
					}
				});
			}
			provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
		}
		return () => {
			if (!name || typeof name === "string" && !(name in virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Flayouts_default)) return context.slots.default?.();
			return h(LayoutLoader, {
				key: name,
				layoutProps: props.layoutProps,
				name
			}, context.slots);
		};
	}
});
// node_modules/nuxt/dist/app/components/route-provider.js
var defineRouteProvider = (name = "RouteProvider") => defineComponent({
	name,
	props: {
		route: {
			type: Object,
			required: true
		},
		vnode: Object,
		vnodeRef: Object,
		renderKey: String,
		trackRootNodes: Boolean,
		routeRecord: Object
	},
	setup(props) {
		const previousKey = props.renderKey;
		const previousRoute = props.route;
		const route = {};
		for (const key in props.route) Object.defineProperty(route, key, {
			get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
			enumerable: true
		});
		provide(PageRouteSymbol, shallowReactive(route));
		return () => {
			if (!props.vnode) return props.vnode;
			return h(props.vnode, { ref: props.vnodeRef });
		};
	}
});
var RouteProvider = defineRouteProvider();
// node_modules/nuxt/dist/pages/runtime/page.js
var page_default = defineComponent({
	name: "NuxtPage",
	inheritAttrs: false,
	props: {
		name: { type: String },
		transition: {
			type: [Boolean, Object],
			default: void 0
		},
		keepalive: {
			type: [Boolean, Object],
			default: void 0
		},
		route: { type: Object },
		pageKey: {
			type: [Function, String],
			default: null
		}
	},
	setup(props, { attrs, slots, expose }) {
		const nuxtApp = useNuxtApp();
		const pageRef = ref();
		inject(PageRouteSymbol, null);
		expose({ pageRef });
		inject(LayoutMetaSymbol, null);
		nuxtApp.deferHydration();
		return () => {
			return h(RouterView, {
				name: props.name,
				route: props.route,
				...attrs
			}, { default: markStableSlot((routeProps) => {
				return h(Suspense, { suspensible: true }, { default() {
					return h(RouteProvider, {
						vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
						route: routeProps.route,
						vnodeRef: pageRef
					});
				} });
			}) });
		};
	}
});
function markStableSlot(fn) {
	const wrapped = ((routeProps) => {
		const result = fn(routeProps);
		if (Array.isArray(result)) return result;
		if (result == null || !isVNode(result)) return [createCommentVNode()];
		return [result];
	});
	wrapped._n = true;
	return wrapped;
}
function normalizeSlot(slot, data) {
	const slotContent = slot(data);
	return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
// app/constants/contacts.ts
var SUPPORT_EMAIL = "support@ship-monitor.ru";
// app/components/CookieBanner.vue?vue&type=script&setup=true&lang.ts
var CookieBanner_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "CookieBanner",
	__ssrInlineRender: true,
	setup(__props) {
		const isVisible = ref(false);
		return (_ctx, _push, _parent, _attrs) => {
			if (isVisible.value) _push(`<div${ssrRenderAttrs(mergeProps({
				class: "fixed inset-x-0 bottom-0 z-100 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6",
				role: "region",
				"aria-label": _ctx.$t("cookie.aria")
			}, _attrs))} data-v-e53f48d0><div class="mx-auto max-w-2xl rounded-2xl border border-moonless-night/10 bg-white p-5 sm:p-6 shadow-[0_24px_48px_-16px_rgb(45_45_45/0.25)]" data-v-e53f48d0><div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6" data-v-e53f48d0><div class="flex-1" data-v-e53f48d0><h3 class="mb-1 text-lg font-bold tracking-tight text-moonless-night" data-v-e53f48d0>${ssrInterpolate(_ctx.$t("cookie.title"))}</h3><p class="text-sm leading-relaxed text-moonless-night/70 sm:text-base" data-v-e53f48d0>${ssrInterpolate(_ctx.$t("cookie.text"))} <a${ssrRenderAttr("href", `mailto:${unref(SUPPORT_EMAIL)}`)} class="font-medium text-electric-blue underline decoration-electric-blue/40 underline-offset-2 transition-colors hover:decoration-electric-blue" data-v-e53f48d0>${ssrInterpolate(unref(SUPPORT_EMAIL))}</a></p></div><button type="button" class="inline-flex w-full sm:w-auto shrink-0 items-center justify-center rounded-full bg-electric-blue px-7 py-3 text-base font-semibold text-cotton select-none cursor-pointer transition-colors hover:bg-electric-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue/60 focus-visible:ring-offset-2 active:translate-y-0.5" data-v-e53f48d0>${ssrInterpolate(_ctx.$t("cookie.accept"))}</button></div></div></div>`);
			else _push(`<!---->`);
		};
	}
});
// \0plugin-vue:export-helper
var _plugin_vue_export_helper_default = (sfc, props) => {
	const target = sfc.__vccOpts || sfc;
	for (const [key, val] of props) target[key] = val;
	return target;
};
// app/components/CookieBanner.vue
var _sfc_setup$3 = CookieBanner_vue_vue_type_script_setup_true_lang_default.setup;
CookieBanner_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CookieBanner.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var CookieBanner_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(CookieBanner_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-e53f48d0"]]), { __name: "CookieBanner" });
// app/app.vue?vue&type=script&setup=true&lang.ts
var app_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "app",
	__ssrInlineRender: true,
	setup(__props) {
		const route = useRoute$1();
		useHead$2({ htmlAttrs: { lang: computed(() => route.path.startsWith("/en") ? "en" : "ru") } });
		return (_ctx, _push, _parent, _attrs) => {
			const _component_NuxtLayout = nuxt_layout_default;
			const _component_NuxtPage = page_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_NuxtLayout, null, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent, _scopeId));
					else return [createVNode(_component_NuxtPage)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(CookieBanner_default, null, null, _parent));
			_push(`<!--]-->`);
		};
	}
});
// app/app.vue
var _sfc_setup$2 = app_vue_vue_type_script_setup_true_lang_default.setup;
app_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var app_default = app_vue_vue_type_script_setup_true_lang_default;
// node_modules/nuxt/dist/app/components/nuxt-error-page.vue
var _sfc_main$1 = {
	__name: "nuxt-error-page",
	__ssrInlineRender: true,
	props: { error: Object },
	setup(__props) {
		const _error = __props.error;
		const status = Number(_error.statusCode || 500);
		const is404 = status === 404;
		const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
		const description = _error.message || _error.toString();
		const stack = void 0;
		const _Error404 = defineAsyncComponent(() => import('../build/error-404-B7FR-2ze.mjs'));
		const _Error = defineAsyncComponent(() => import('../build/error-500-C5w7u173.mjs'));
		const ErrorTemplate = is404 ? _Error404 : _Error;
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({
				status: unref(status),
				statusText: unref(statusText),
				statusCode: unref(status),
				statusMessage: unref(statusText),
				description: unref(description),
				stack: unref(stack)
			}, _attrs), null, _parent));
		};
	}
};
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
// virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fisland-renderer.mjs
var IslandRenderer = () => null;
// node_modules/nuxt/dist/app/components/nuxt-root.vue
var _sfc_main = {
	__name: "nuxt-root",
	__ssrInlineRender: true,
	setup(__props) {
		const nuxtApp = useNuxtApp();
		nuxtApp.deferHydration();
		nuxtApp.ssrContext.url;
		const SingleRenderer = false;
		provide(PageRouteSymbol, useRoute$1());
		nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
		const error = /* @__PURE__ */ useError();
		const abortRender = error.value && !nuxtApp.ssrContext.error;
		function invokeAppErrorHandler(err, target, info) {
			const errorHandler = nuxtApp.vueApp.config.errorHandler;
			if (errorHandler && !errorHandler.__nuxt_default) try {
				errorHandler(err, target, info);
			} catch (handlerError) {
				console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
			}
		}
		onErrorCaptured((err, target, info) => {
			nuxtApp.hooks.callHook("vue:error", err, target, info)?.catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
			{
				const p = nuxtApp.runWithContext(() => showError(err));
				onServerPrefetch(() => p);
				invokeAppErrorHandler(err, target, info);
				return false;
			}
		});
		const islandContext = nuxtApp.ssrContext.islandContext;
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderSuspense(_push, {
				default: () => {
					if (unref(abortRender)) _push(`<div></div>`);
					else if (unref(error)) _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
					else if (unref(islandContext)) _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
					else if (unref(SingleRenderer)) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
					else _push(ssrRenderComponent(unref(app_default), null, null, _parent));
				},
				_: 1
			});
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-root.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
// node_modules/nuxt/dist/app/entry.js
var entry$1 = async function createNuxtAppServer(ssrContext) {
	const vueApp = createApp(_sfc_main);
	const nuxt = createNuxtApp({
		vueApp,
		ssrContext
	});
	try {
		await applyPlugins(nuxt, virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Fplugins_server_default);
		await nuxt.hooks.callHook("app:created", vueApp);
	} catch (error) {
		await nuxt.hooks.callHook("app:error", error);
		nuxt.payload.error ||= createError$2(error);
	}
	if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) throw new Error("skipping render");
	return vueApp;
};
var entry_default = ((ssrContext) => entry$1(ssrContext));

const entry = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: entry_default
}, Symbol.toStringTag, { value: 'Module' }));

export { SUPPORT_EMAIL as S, _plugin_vue_export_helper_default as _, useHead$2 as a, appDiagnostics as b, useNuxtApp as c, asyncDataDefaults as d, docsBase as e, createError$2 as f, useRoute$1 as g, saveLocaleChoice as h, useRouter as i, encodeRoutePath as j, useRuntimeConfig as k, localeRef as l, nuxtLinkDefaults as m, navigateTo as n, entry as o, prodReporters as p, resolveRouteObject as r, sanitizeTag as s, useSeoMeta$2 as u };
//# sourceMappingURL=entry.mjs.map
