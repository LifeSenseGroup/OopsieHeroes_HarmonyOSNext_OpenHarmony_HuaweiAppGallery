
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35731/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush$1);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush$1() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init$1(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush$1();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$2(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    function parse$1(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1, Object: Object_1, console: console_1$9 } = globals;

    // (267:0) {:else}
    function create_else_block$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(267:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (260:0) {#if componentParams}
    function create_if_block$8(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(260:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$8, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap$1(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$2({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    function restoreScroll(state) {
    	// If this exists, then this is a back navigation: restore the scroll position
    	if (state) {
    		window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY);
    	} else {
    		// Otherwise this is a forward navigation: scroll to top
    		window.scrollTo(0, 0);
    	}
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse$1(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			restoreScroll(previousScrollState);
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$9.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$2,
    		wrap: wrap$1,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		restoreScroll,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse: parse$1,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var isMergeableObject = function isMergeableObject(value) {
    	return isNonNullObject(value)
    		&& !isSpecial(value)
    };

    function isNonNullObject(value) {
    	return !!value && typeof value === 'object'
    }

    function isSpecial(value) {
    	var stringValue = Object.prototype.toString.call(value);

    	return stringValue === '[object RegExp]'
    		|| stringValue === '[object Date]'
    		|| isReactElement(value)
    }

    // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
    var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
    var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

    function isReactElement(value) {
    	return value.$$typeof === REACT_ELEMENT_TYPE
    }

    function emptyTarget(val) {
    	return Array.isArray(val) ? [] : {}
    }

    function cloneUnlessOtherwiseSpecified(value, options) {
    	return (options.clone !== false && options.isMergeableObject(value))
    		? deepmerge(emptyTarget(value), value, options)
    		: value
    }

    function defaultArrayMerge(target, source, options) {
    	return target.concat(source).map(function(element) {
    		return cloneUnlessOtherwiseSpecified(element, options)
    	})
    }

    function getMergeFunction(key, options) {
    	if (!options.customMerge) {
    		return deepmerge
    	}
    	var customMerge = options.customMerge(key);
    	return typeof customMerge === 'function' ? customMerge : deepmerge
    }

    function getEnumerableOwnPropertySymbols(target) {
    	return Object.getOwnPropertySymbols
    		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
    			return Object.propertyIsEnumerable.call(target, symbol)
    		})
    		: []
    }

    function getKeys(target) {
    	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
    }

    function propertyIsOnObject(object, property) {
    	try {
    		return property in object
    	} catch(_) {
    		return false
    	}
    }

    // Protects from prototype poisoning and unexpected merging up the prototype chain.
    function propertyIsUnsafe(target, key) {
    	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
    		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
    			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
    }

    function mergeObject(target, source, options) {
    	var destination = {};
    	if (options.isMergeableObject(target)) {
    		getKeys(target).forEach(function(key) {
    			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    		});
    	}
    	getKeys(source).forEach(function(key) {
    		if (propertyIsUnsafe(target, key)) {
    			return
    		}

    		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
    			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
    		} else {
    			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    		}
    	});
    	return destination
    }

    function deepmerge(target, source, options) {
    	options = options || {};
    	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    	// implementations can use it. The caller may not replace it.
    	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

    	var sourceIsArray = Array.isArray(source);
    	var targetIsArray = Array.isArray(target);
    	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

    	if (!sourceAndTargetTypesMatch) {
    		return cloneUnlessOtherwiseSpecified(source, options)
    	} else if (sourceIsArray) {
    		return options.arrayMerge(target, source, options)
    	} else {
    		return mergeObject(target, source, options)
    	}
    }

    deepmerge.all = function deepmergeAll(array, options) {
    	if (!Array.isArray(array)) {
    		throw new Error('first argument should be an array')
    	}

    	return array.reduce(function(prev, next) {
    		return deepmerge(prev, next, options)
    	}, {})
    };

    var deepmerge_1 = deepmerge;

    var cjs = deepmerge_1;

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */

    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
      return extendStatics(d, b);
    };

    function __extends(d, b) {
      if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
    };

    function __spreadArray(to, from, pack) {
      if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
              if (!ar) ar = Array.prototype.slice.call(from, 0, i);
              ar[i] = from[i];
          }
      }
      return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var ErrorKind;
    (function (ErrorKind) {
        /** Argument is unclosed (e.g. `{0`) */
        ErrorKind[ErrorKind["EXPECT_ARGUMENT_CLOSING_BRACE"] = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE";
        /** Argument is empty (e.g. `{}`). */
        ErrorKind[ErrorKind["EMPTY_ARGUMENT"] = 2] = "EMPTY_ARGUMENT";
        /** Argument is malformed (e.g. `{foo!}``) */
        ErrorKind[ErrorKind["MALFORMED_ARGUMENT"] = 3] = "MALFORMED_ARGUMENT";
        /** Expect an argument type (e.g. `{foo,}`) */
        ErrorKind[ErrorKind["EXPECT_ARGUMENT_TYPE"] = 4] = "EXPECT_ARGUMENT_TYPE";
        /** Unsupported argument type (e.g. `{foo,foo}`) */
        ErrorKind[ErrorKind["INVALID_ARGUMENT_TYPE"] = 5] = "INVALID_ARGUMENT_TYPE";
        /** Expect an argument style (e.g. `{foo, number, }`) */
        ErrorKind[ErrorKind["EXPECT_ARGUMENT_STYLE"] = 6] = "EXPECT_ARGUMENT_STYLE";
        /** The number skeleton is invalid. */
        ErrorKind[ErrorKind["INVALID_NUMBER_SKELETON"] = 7] = "INVALID_NUMBER_SKELETON";
        /** The date time skeleton is invalid. */
        ErrorKind[ErrorKind["INVALID_DATE_TIME_SKELETON"] = 8] = "INVALID_DATE_TIME_SKELETON";
        /** Exepct a number skeleton following the `::` (e.g. `{foo, number, ::}`) */
        ErrorKind[ErrorKind["EXPECT_NUMBER_SKELETON"] = 9] = "EXPECT_NUMBER_SKELETON";
        /** Exepct a date time skeleton following the `::` (e.g. `{foo, date, ::}`) */
        ErrorKind[ErrorKind["EXPECT_DATE_TIME_SKELETON"] = 10] = "EXPECT_DATE_TIME_SKELETON";
        /** Unmatched apostrophes in the argument style (e.g. `{foo, number, 'test`) */
        ErrorKind[ErrorKind["UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"] = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE";
        /** Missing select argument options (e.g. `{foo, select}`) */
        ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_OPTIONS"] = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS";
        /** Expecting an offset value in `plural` or `selectordinal` argument (e.g `{foo, plural, offset}`) */
        ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"] = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE";
        /** Offset value in `plural` or `selectordinal` is invalid (e.g. `{foo, plural, offset: x}`) */
        ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"] = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE";
        /** Expecting a selector in `select` argument (e.g `{foo, select}`) */
        ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR"] = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR";
        /** Expecting a selector in `plural` or `selectordinal` argument (e.g `{foo, plural}`) */
        ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR"] = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR";
        /** Expecting a message fragment after the `select` selector (e.g. `{foo, select, apple}`) */
        ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"] = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT";
        /**
         * Expecting a message fragment after the `plural` or `selectordinal` selector
         * (e.g. `{foo, plural, one}`)
         */
        ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"] = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT";
        /** Selector in `plural` or `selectordinal` is malformed (e.g. `{foo, plural, =x {#}}`) */
        ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_SELECTOR"] = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR";
        /**
         * Duplicate selectors in `plural` or `selectordinal` argument.
         * (e.g. {foo, plural, one {#} one {#}})
         */
        ErrorKind[ErrorKind["DUPLICATE_PLURAL_ARGUMENT_SELECTOR"] = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR";
        /** Duplicate selectors in `select` argument.
         * (e.g. {foo, select, apple {apple} apple {apple}})
         */
        ErrorKind[ErrorKind["DUPLICATE_SELECT_ARGUMENT_SELECTOR"] = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR";
        /** Plural or select argument option must have `other` clause. */
        ErrorKind[ErrorKind["MISSING_OTHER_CLAUSE"] = 22] = "MISSING_OTHER_CLAUSE";
        /** The tag is malformed. (e.g. `<bold!>foo</bold!>) */
        ErrorKind[ErrorKind["INVALID_TAG"] = 23] = "INVALID_TAG";
        /** The tag name is invalid. (e.g. `<123>foo</123>`) */
        ErrorKind[ErrorKind["INVALID_TAG_NAME"] = 25] = "INVALID_TAG_NAME";
        /** The closing tag does not match the opening tag. (e.g. `<bold>foo</italic>`) */
        ErrorKind[ErrorKind["UNMATCHED_CLOSING_TAG"] = 26] = "UNMATCHED_CLOSING_TAG";
        /** The opening tag has unmatched closing tag. (e.g. `<bold>foo`) */
        ErrorKind[ErrorKind["UNCLOSED_TAG"] = 27] = "UNCLOSED_TAG";
    })(ErrorKind || (ErrorKind = {}));

    var TYPE;
    (function (TYPE) {
        /**
         * Raw text
         */
        TYPE[TYPE["literal"] = 0] = "literal";
        /**
         * Variable w/o any format, e.g `var` in `this is a {var}`
         */
        TYPE[TYPE["argument"] = 1] = "argument";
        /**
         * Variable w/ number format
         */
        TYPE[TYPE["number"] = 2] = "number";
        /**
         * Variable w/ date format
         */
        TYPE[TYPE["date"] = 3] = "date";
        /**
         * Variable w/ time format
         */
        TYPE[TYPE["time"] = 4] = "time";
        /**
         * Variable w/ select format
         */
        TYPE[TYPE["select"] = 5] = "select";
        /**
         * Variable w/ plural format
         */
        TYPE[TYPE["plural"] = 6] = "plural";
        /**
         * Only possible within plural argument.
         * This is the `#` symbol that will be substituted with the count.
         */
        TYPE[TYPE["pound"] = 7] = "pound";
        /**
         * XML-like tag
         */
        TYPE[TYPE["tag"] = 8] = "tag";
    })(TYPE || (TYPE = {}));
    var SKELETON_TYPE;
    (function (SKELETON_TYPE) {
        SKELETON_TYPE[SKELETON_TYPE["number"] = 0] = "number";
        SKELETON_TYPE[SKELETON_TYPE["dateTime"] = 1] = "dateTime";
    })(SKELETON_TYPE || (SKELETON_TYPE = {}));
    /**
     * Type Guards
     */
    function isLiteralElement(el) {
        return el.type === TYPE.literal;
    }
    function isArgumentElement(el) {
        return el.type === TYPE.argument;
    }
    function isNumberElement(el) {
        return el.type === TYPE.number;
    }
    function isDateElement(el) {
        return el.type === TYPE.date;
    }
    function isTimeElement(el) {
        return el.type === TYPE.time;
    }
    function isSelectElement(el) {
        return el.type === TYPE.select;
    }
    function isPluralElement(el) {
        return el.type === TYPE.plural;
    }
    function isPoundElement(el) {
        return el.type === TYPE.pound;
    }
    function isTagElement(el) {
        return el.type === TYPE.tag;
    }
    function isNumberSkeleton(el) {
        return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.number);
    }
    function isDateTimeSkeleton(el) {
        return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.dateTime);
    }

    // @generated from regex-gen.ts
    var SPACE_SEPARATOR_REGEX = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;

    /**
     * https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * Credit: https://github.com/caridy/intl-datetimeformat-pattern/blob/master/index.js
     * with some tweaks
     */
    var DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
    /**
     * Parse Date time skeleton into Intl.DateTimeFormatOptions
     * Ref: https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * @public
     * @param skeleton skeleton string
     */
    function parseDateTimeSkeleton(skeleton) {
        var result = {};
        skeleton.replace(DATE_TIME_REGEX, function (match) {
            var len = match.length;
            switch (match[0]) {
                // Era
                case 'G':
                    result.era = len === 4 ? 'long' : len === 5 ? 'narrow' : 'short';
                    break;
                // Year
                case 'y':
                    result.year = len === 2 ? '2-digit' : 'numeric';
                    break;
                case 'Y':
                case 'u':
                case 'U':
                case 'r':
                    throw new RangeError('`Y/u/U/r` (year) patterns are not supported, use `y` instead');
                // Quarter
                case 'q':
                case 'Q':
                    throw new RangeError('`q/Q` (quarter) patterns are not supported');
                // Month
                case 'M':
                case 'L':
                    result.month = ['numeric', '2-digit', 'short', 'long', 'narrow'][len - 1];
                    break;
                // Week
                case 'w':
                case 'W':
                    throw new RangeError('`w/W` (week) patterns are not supported');
                case 'd':
                    result.day = ['numeric', '2-digit'][len - 1];
                    break;
                case 'D':
                case 'F':
                case 'g':
                    throw new RangeError('`D/F/g` (day) patterns are not supported, use `d` instead');
                // Weekday
                case 'E':
                    result.weekday = len === 4 ? 'short' : len === 5 ? 'narrow' : 'short';
                    break;
                case 'e':
                    if (len < 4) {
                        throw new RangeError('`e..eee` (weekday) patterns are not supported');
                    }
                    result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                    break;
                case 'c':
                    if (len < 4) {
                        throw new RangeError('`c..ccc` (weekday) patterns are not supported');
                    }
                    result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                    break;
                // Period
                case 'a': // AM, PM
                    result.hour12 = true;
                    break;
                case 'b': // am, pm, noon, midnight
                case 'B': // flexible day periods
                    throw new RangeError('`b/B` (period) patterns are not supported, use `a` instead');
                // Hour
                case 'h':
                    result.hourCycle = 'h12';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'H':
                    result.hourCycle = 'h23';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'K':
                    result.hourCycle = 'h11';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'k':
                    result.hourCycle = 'h24';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'j':
                case 'J':
                case 'C':
                    throw new RangeError('`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead');
                // Minute
                case 'm':
                    result.minute = ['numeric', '2-digit'][len - 1];
                    break;
                // Second
                case 's':
                    result.second = ['numeric', '2-digit'][len - 1];
                    break;
                case 'S':
                case 'A':
                    throw new RangeError('`S/A` (second) patterns are not supported, use `s` instead');
                // Zone
                case 'z': // 1..3, 4: specific non-location format
                    result.timeZoneName = len < 4 ? 'short' : 'long';
                    break;
                case 'Z': // 1..3, 4, 5: The ISO8601 varios formats
                case 'O': // 1, 4: miliseconds in day short, long
                case 'v': // 1, 4: generic non-location format
                case 'V': // 1, 2, 3, 4: time zone ID or city
                case 'X': // 1, 2, 3, 4: The ISO8601 varios formats
                case 'x': // 1, 2, 3, 4: The ISO8601 varios formats
                    throw new RangeError('`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead');
            }
            return '';
        });
        return result;
    }

    // @generated from regex-gen.ts
    var WHITE_SPACE_REGEX = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;

    function parseNumberSkeletonFromString(skeleton) {
        if (skeleton.length === 0) {
            throw new Error('Number skeleton cannot be empty');
        }
        // Parse the skeleton
        var stringTokens = skeleton
            .split(WHITE_SPACE_REGEX)
            .filter(function (x) { return x.length > 0; });
        var tokens = [];
        for (var _i = 0, stringTokens_1 = stringTokens; _i < stringTokens_1.length; _i++) {
            var stringToken = stringTokens_1[_i];
            var stemAndOptions = stringToken.split('/');
            if (stemAndOptions.length === 0) {
                throw new Error('Invalid number skeleton');
            }
            var stem = stemAndOptions[0], options = stemAndOptions.slice(1);
            for (var _a = 0, options_1 = options; _a < options_1.length; _a++) {
                var option = options_1[_a];
                if (option.length === 0) {
                    throw new Error('Invalid number skeleton');
                }
            }
            tokens.push({ stem: stem, options: options });
        }
        return tokens;
    }
    function icuUnitToEcma(unit) {
        return unit.replace(/^(.*?)-/, '');
    }
    var FRACTION_PRECISION_REGEX = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g;
    var SIGNIFICANT_PRECISION_REGEX = /^(@+)?(\+|#+)?[rs]?$/g;
    var INTEGER_WIDTH_REGEX = /(\*)(0+)|(#+)(0+)|(0+)/g;
    var CONCISE_INTEGER_WIDTH_REGEX = /^(0+)$/;
    function parseSignificantPrecision(str) {
        var result = {};
        if (str[str.length - 1] === 'r') {
            result.roundingPriority = 'morePrecision';
        }
        else if (str[str.length - 1] === 's') {
            result.roundingPriority = 'lessPrecision';
        }
        str.replace(SIGNIFICANT_PRECISION_REGEX, function (_, g1, g2) {
            // @@@ case
            if (typeof g2 !== 'string') {
                result.minimumSignificantDigits = g1.length;
                result.maximumSignificantDigits = g1.length;
            }
            // @@@+ case
            else if (g2 === '+') {
                result.minimumSignificantDigits = g1.length;
            }
            // .### case
            else if (g1[0] === '#') {
                result.maximumSignificantDigits = g1.length;
            }
            // .@@## or .@@@ case
            else {
                result.minimumSignificantDigits = g1.length;
                result.maximumSignificantDigits =
                    g1.length + (typeof g2 === 'string' ? g2.length : 0);
            }
            return '';
        });
        return result;
    }
    function parseSign(str) {
        switch (str) {
            case 'sign-auto':
                return {
                    signDisplay: 'auto',
                };
            case 'sign-accounting':
            case '()':
                return {
                    currencySign: 'accounting',
                };
            case 'sign-always':
            case '+!':
                return {
                    signDisplay: 'always',
                };
            case 'sign-accounting-always':
            case '()!':
                return {
                    signDisplay: 'always',
                    currencySign: 'accounting',
                };
            case 'sign-except-zero':
            case '+?':
                return {
                    signDisplay: 'exceptZero',
                };
            case 'sign-accounting-except-zero':
            case '()?':
                return {
                    signDisplay: 'exceptZero',
                    currencySign: 'accounting',
                };
            case 'sign-never':
            case '+_':
                return {
                    signDisplay: 'never',
                };
        }
    }
    function parseConciseScientificAndEngineeringStem(stem) {
        // Engineering
        var result;
        if (stem[0] === 'E' && stem[1] === 'E') {
            result = {
                notation: 'engineering',
            };
            stem = stem.slice(2);
        }
        else if (stem[0] === 'E') {
            result = {
                notation: 'scientific',
            };
            stem = stem.slice(1);
        }
        if (result) {
            var signDisplay = stem.slice(0, 2);
            if (signDisplay === '+!') {
                result.signDisplay = 'always';
                stem = stem.slice(2);
            }
            else if (signDisplay === '+?') {
                result.signDisplay = 'exceptZero';
                stem = stem.slice(2);
            }
            if (!CONCISE_INTEGER_WIDTH_REGEX.test(stem)) {
                throw new Error('Malformed concise eng/scientific notation');
            }
            result.minimumIntegerDigits = stem.length;
        }
        return result;
    }
    function parseNotationOptions(opt) {
        var result = {};
        var signOpts = parseSign(opt);
        if (signOpts) {
            return signOpts;
        }
        return result;
    }
    /**
     * https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md#skeleton-stems-and-options
     */
    function parseNumberSkeleton(tokens) {
        var result = {};
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            switch (token.stem) {
                case 'percent':
                case '%':
                    result.style = 'percent';
                    continue;
                case '%x100':
                    result.style = 'percent';
                    result.scale = 100;
                    continue;
                case 'currency':
                    result.style = 'currency';
                    result.currency = token.options[0];
                    continue;
                case 'group-off':
                case ',_':
                    result.useGrouping = false;
                    continue;
                case 'precision-integer':
                case '.':
                    result.maximumFractionDigits = 0;
                    continue;
                case 'measure-unit':
                case 'unit':
                    result.style = 'unit';
                    result.unit = icuUnitToEcma(token.options[0]);
                    continue;
                case 'compact-short':
                case 'K':
                    result.notation = 'compact';
                    result.compactDisplay = 'short';
                    continue;
                case 'compact-long':
                case 'KK':
                    result.notation = 'compact';
                    result.compactDisplay = 'long';
                    continue;
                case 'scientific':
                    result = __assign(__assign(__assign({}, result), { notation: 'scientific' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                    continue;
                case 'engineering':
                    result = __assign(__assign(__assign({}, result), { notation: 'engineering' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                    continue;
                case 'notation-simple':
                    result.notation = 'standard';
                    continue;
                // https://github.com/unicode-org/icu/blob/master/icu4c/source/i18n/unicode/unumberformatter.h
                case 'unit-width-narrow':
                    result.currencyDisplay = 'narrowSymbol';
                    result.unitDisplay = 'narrow';
                    continue;
                case 'unit-width-short':
                    result.currencyDisplay = 'code';
                    result.unitDisplay = 'short';
                    continue;
                case 'unit-width-full-name':
                    result.currencyDisplay = 'name';
                    result.unitDisplay = 'long';
                    continue;
                case 'unit-width-iso-code':
                    result.currencyDisplay = 'symbol';
                    continue;
                case 'scale':
                    result.scale = parseFloat(token.options[0]);
                    continue;
                // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
                case 'integer-width':
                    if (token.options.length > 1) {
                        throw new RangeError('integer-width stems only accept a single optional option');
                    }
                    token.options[0].replace(INTEGER_WIDTH_REGEX, function (_, g1, g2, g3, g4, g5) {
                        if (g1) {
                            result.minimumIntegerDigits = g2.length;
                        }
                        else if (g3 && g4) {
                            throw new Error('We currently do not support maximum integer digits');
                        }
                        else if (g5) {
                            throw new Error('We currently do not support exact integer digits');
                        }
                        return '';
                    });
                    continue;
            }
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
            if (CONCISE_INTEGER_WIDTH_REGEX.test(token.stem)) {
                result.minimumIntegerDigits = token.stem.length;
                continue;
            }
            if (FRACTION_PRECISION_REGEX.test(token.stem)) {
                // Precision
                // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#fraction-precision
                // precision-integer case
                if (token.options.length > 1) {
                    throw new RangeError('Fraction-precision stems only accept a single optional option');
                }
                token.stem.replace(FRACTION_PRECISION_REGEX, function (_, g1, g2, g3, g4, g5) {
                    // .000* case (before ICU67 it was .000+)
                    if (g2 === '*') {
                        result.minimumFractionDigits = g1.length;
                    }
                    // .### case
                    else if (g3 && g3[0] === '#') {
                        result.maximumFractionDigits = g3.length;
                    }
                    // .00## case
                    else if (g4 && g5) {
                        result.minimumFractionDigits = g4.length;
                        result.maximumFractionDigits = g4.length + g5.length;
                    }
                    else {
                        result.minimumFractionDigits = g1.length;
                        result.maximumFractionDigits = g1.length;
                    }
                    return '';
                });
                var opt = token.options[0];
                // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#trailing-zero-display
                if (opt === 'w') {
                    result = __assign(__assign({}, result), { trailingZeroDisplay: 'stripIfInteger' });
                }
                else if (opt) {
                    result = __assign(__assign({}, result), parseSignificantPrecision(opt));
                }
                continue;
            }
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#significant-digits-precision
            if (SIGNIFICANT_PRECISION_REGEX.test(token.stem)) {
                result = __assign(__assign({}, result), parseSignificantPrecision(token.stem));
                continue;
            }
            var signOpts = parseSign(token.stem);
            if (signOpts) {
                result = __assign(__assign({}, result), signOpts);
            }
            var conciseScientificAndEngineeringOpts = parseConciseScientificAndEngineeringStem(token.stem);
            if (conciseScientificAndEngineeringOpts) {
                result = __assign(__assign({}, result), conciseScientificAndEngineeringOpts);
            }
        }
        return result;
    }

    // @generated from time-data-gen.ts
    // prettier-ignore  
    var timeData = {
        "AX": [
            "H"
        ],
        "BQ": [
            "H"
        ],
        "CP": [
            "H"
        ],
        "CZ": [
            "H"
        ],
        "DK": [
            "H"
        ],
        "FI": [
            "H"
        ],
        "ID": [
            "H"
        ],
        "IS": [
            "H"
        ],
        "ML": [
            "H"
        ],
        "NE": [
            "H"
        ],
        "RU": [
            "H"
        ],
        "SE": [
            "H"
        ],
        "SJ": [
            "H"
        ],
        "SK": [
            "H"
        ],
        "AS": [
            "h",
            "H"
        ],
        "BT": [
            "h",
            "H"
        ],
        "DJ": [
            "h",
            "H"
        ],
        "ER": [
            "h",
            "H"
        ],
        "GH": [
            "h",
            "H"
        ],
        "IN": [
            "h",
            "H"
        ],
        "LS": [
            "h",
            "H"
        ],
        "PG": [
            "h",
            "H"
        ],
        "PW": [
            "h",
            "H"
        ],
        "SO": [
            "h",
            "H"
        ],
        "TO": [
            "h",
            "H"
        ],
        "VU": [
            "h",
            "H"
        ],
        "WS": [
            "h",
            "H"
        ],
        "001": [
            "H",
            "h"
        ],
        "AL": [
            "h",
            "H",
            "hB"
        ],
        "TD": [
            "h",
            "H",
            "hB"
        ],
        "ca-ES": [
            "H",
            "h",
            "hB"
        ],
        "CF": [
            "H",
            "h",
            "hB"
        ],
        "CM": [
            "H",
            "h",
            "hB"
        ],
        "fr-CA": [
            "H",
            "h",
            "hB"
        ],
        "gl-ES": [
            "H",
            "h",
            "hB"
        ],
        "it-CH": [
            "H",
            "h",
            "hB"
        ],
        "it-IT": [
            "H",
            "h",
            "hB"
        ],
        "LU": [
            "H",
            "h",
            "hB"
        ],
        "NP": [
            "H",
            "h",
            "hB"
        ],
        "PF": [
            "H",
            "h",
            "hB"
        ],
        "SC": [
            "H",
            "h",
            "hB"
        ],
        "SM": [
            "H",
            "h",
            "hB"
        ],
        "SN": [
            "H",
            "h",
            "hB"
        ],
        "TF": [
            "H",
            "h",
            "hB"
        ],
        "VA": [
            "H",
            "h",
            "hB"
        ],
        "CY": [
            "h",
            "H",
            "hb",
            "hB"
        ],
        "GR": [
            "h",
            "H",
            "hb",
            "hB"
        ],
        "CO": [
            "h",
            "H",
            "hB",
            "hb"
        ],
        "DO": [
            "h",
            "H",
            "hB",
            "hb"
        ],
        "KP": [
            "h",
            "H",
            "hB",
            "hb"
        ],
        "KR": [
            "h",
            "H",
            "hB",
            "hb"
        ],
        "NA": [
            "h",
            "H",
            "hB",
            "hb"
        ],
        "PA": [
            "h",
            "H",
            "hB",
            "hb"
        ],
        "PR": [
            "h",
            "H",
            "hB",
            "hb"
        ],
        "VE": [
            "h",
            "H",
            "hB",
            "hb"
        ],
        "AC": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "AI": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "BW": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "BZ": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "CC": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "CK": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "CX": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "DG": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "FK": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "GB": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "GG": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "GI": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "IE": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "IM": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "IO": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "JE": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "LT": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "MK": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "MN": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "MS": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "NF": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "NG": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "NR": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "NU": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "PN": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "SH": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "SX": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "TA": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "ZA": [
            "H",
            "h",
            "hb",
            "hB"
        ],
        "af-ZA": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "AR": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "CL": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "CR": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "CU": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "EA": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "es-BO": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "es-BR": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "es-EC": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "es-ES": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "es-GQ": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "es-PE": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "GT": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "HN": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "IC": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "KG": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "KM": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "LK": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "MA": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "MX": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "NI": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "PY": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "SV": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "UY": [
            "H",
            "h",
            "hB",
            "hb"
        ],
        "JP": [
            "H",
            "h",
            "K"
        ],
        "AD": [
            "H",
            "hB"
        ],
        "AM": [
            "H",
            "hB"
        ],
        "AO": [
            "H",
            "hB"
        ],
        "AT": [
            "H",
            "hB"
        ],
        "AW": [
            "H",
            "hB"
        ],
        "BE": [
            "H",
            "hB"
        ],
        "BF": [
            "H",
            "hB"
        ],
        "BJ": [
            "H",
            "hB"
        ],
        "BL": [
            "H",
            "hB"
        ],
        "BR": [
            "H",
            "hB"
        ],
        "CG": [
            "H",
            "hB"
        ],
        "CI": [
            "H",
            "hB"
        ],
        "CV": [
            "H",
            "hB"
        ],
        "DE": [
            "H",
            "hB"
        ],
        "EE": [
            "H",
            "hB"
        ],
        "FR": [
            "H",
            "hB"
        ],
        "GA": [
            "H",
            "hB"
        ],
        "GF": [
            "H",
            "hB"
        ],
        "GN": [
            "H",
            "hB"
        ],
        "GP": [
            "H",
            "hB"
        ],
        "GW": [
            "H",
            "hB"
        ],
        "HR": [
            "H",
            "hB"
        ],
        "IL": [
            "H",
            "hB"
        ],
        "IT": [
            "H",
            "hB"
        ],
        "KZ": [
            "H",
            "hB"
        ],
        "MC": [
            "H",
            "hB"
        ],
        "MD": [
            "H",
            "hB"
        ],
        "MF": [
            "H",
            "hB"
        ],
        "MQ": [
            "H",
            "hB"
        ],
        "MZ": [
            "H",
            "hB"
        ],
        "NC": [
            "H",
            "hB"
        ],
        "NL": [
            "H",
            "hB"
        ],
        "PM": [
            "H",
            "hB"
        ],
        "PT": [
            "H",
            "hB"
        ],
        "RE": [
            "H",
            "hB"
        ],
        "RO": [
            "H",
            "hB"
        ],
        "SI": [
            "H",
            "hB"
        ],
        "SR": [
            "H",
            "hB"
        ],
        "ST": [
            "H",
            "hB"
        ],
        "TG": [
            "H",
            "hB"
        ],
        "TR": [
            "H",
            "hB"
        ],
        "WF": [
            "H",
            "hB"
        ],
        "YT": [
            "H",
            "hB"
        ],
        "BD": [
            "h",
            "hB",
            "H"
        ],
        "PK": [
            "h",
            "hB",
            "H"
        ],
        "AZ": [
            "H",
            "hB",
            "h"
        ],
        "BA": [
            "H",
            "hB",
            "h"
        ],
        "BG": [
            "H",
            "hB",
            "h"
        ],
        "CH": [
            "H",
            "hB",
            "h"
        ],
        "GE": [
            "H",
            "hB",
            "h"
        ],
        "LI": [
            "H",
            "hB",
            "h"
        ],
        "ME": [
            "H",
            "hB",
            "h"
        ],
        "RS": [
            "H",
            "hB",
            "h"
        ],
        "UA": [
            "H",
            "hB",
            "h"
        ],
        "UZ": [
            "H",
            "hB",
            "h"
        ],
        "XK": [
            "H",
            "hB",
            "h"
        ],
        "AG": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "AU": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "BB": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "BM": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "BS": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "CA": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "DM": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "en-001": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "FJ": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "FM": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "GD": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "GM": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "GU": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "GY": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "JM": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "KI": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "KN": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "KY": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "LC": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "LR": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "MH": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "MP": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "MW": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "NZ": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "SB": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "SG": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "SL": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "SS": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "SZ": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "TC": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "TT": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "UM": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "US": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "VC": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "VG": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "VI": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "ZM": [
            "h",
            "hb",
            "H",
            "hB"
        ],
        "BO": [
            "H",
            "hB",
            "h",
            "hb"
        ],
        "EC": [
            "H",
            "hB",
            "h",
            "hb"
        ],
        "ES": [
            "H",
            "hB",
            "h",
            "hb"
        ],
        "GQ": [
            "H",
            "hB",
            "h",
            "hb"
        ],
        "PE": [
            "H",
            "hB",
            "h",
            "hb"
        ],
        "AE": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "ar-001": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "BH": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "DZ": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "EG": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "EH": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "HK": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "IQ": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "JO": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "KW": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "LB": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "LY": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "MO": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "MR": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "OM": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "PH": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "PS": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "QA": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "SA": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "SD": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "SY": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "TN": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "YE": [
            "h",
            "hB",
            "hb",
            "H"
        ],
        "AF": [
            "H",
            "hb",
            "hB",
            "h"
        ],
        "LA": [
            "H",
            "hb",
            "hB",
            "h"
        ],
        "CN": [
            "H",
            "hB",
            "hb",
            "h"
        ],
        "LV": [
            "H",
            "hB",
            "hb",
            "h"
        ],
        "TL": [
            "H",
            "hB",
            "hb",
            "h"
        ],
        "zu-ZA": [
            "H",
            "hB",
            "hb",
            "h"
        ],
        "CD": [
            "hB",
            "H"
        ],
        "IR": [
            "hB",
            "H"
        ],
        "hi-IN": [
            "hB",
            "h",
            "H"
        ],
        "kn-IN": [
            "hB",
            "h",
            "H"
        ],
        "ml-IN": [
            "hB",
            "h",
            "H"
        ],
        "te-IN": [
            "hB",
            "h",
            "H"
        ],
        "KH": [
            "hB",
            "h",
            "H",
            "hb"
        ],
        "ta-IN": [
            "hB",
            "h",
            "hb",
            "H"
        ],
        "BN": [
            "hb",
            "hB",
            "h",
            "H"
        ],
        "MY": [
            "hb",
            "hB",
            "h",
            "H"
        ],
        "ET": [
            "hB",
            "hb",
            "h",
            "H"
        ],
        "gu-IN": [
            "hB",
            "hb",
            "h",
            "H"
        ],
        "mr-IN": [
            "hB",
            "hb",
            "h",
            "H"
        ],
        "pa-IN": [
            "hB",
            "hb",
            "h",
            "H"
        ],
        "TW": [
            "hB",
            "hb",
            "h",
            "H"
        ],
        "KE": [
            "hB",
            "hb",
            "H",
            "h"
        ],
        "MM": [
            "hB",
            "hb",
            "H",
            "h"
        ],
        "TZ": [
            "hB",
            "hb",
            "H",
            "h"
        ],
        "UG": [
            "hB",
            "hb",
            "H",
            "h"
        ]
    };

    /**
     * Returns the best matching date time pattern if a date time skeleton
     * pattern is provided with a locale. Follows the Unicode specification:
     * https://www.unicode.org/reports/tr35/tr35-dates.html#table-mapping-requested-time-skeletons-to-patterns
     * @param skeleton date time skeleton pattern that possibly includes j, J or C
     * @param locale
     */
    function getBestPattern(skeleton, locale) {
        var skeletonCopy = '';
        for (var patternPos = 0; patternPos < skeleton.length; patternPos++) {
            var patternChar = skeleton.charAt(patternPos);
            if (patternChar === 'j') {
                var extraLength = 0;
                while (patternPos + 1 < skeleton.length &&
                    skeleton.charAt(patternPos + 1) === patternChar) {
                    extraLength++;
                    patternPos++;
                }
                var hourLen = 1 + (extraLength & 1);
                var dayPeriodLen = extraLength < 2 ? 1 : 3 + (extraLength >> 1);
                var dayPeriodChar = 'a';
                var hourChar = getDefaultHourSymbolFromLocale(locale);
                if (hourChar == 'H' || hourChar == 'k') {
                    dayPeriodLen = 0;
                }
                while (dayPeriodLen-- > 0) {
                    skeletonCopy += dayPeriodChar;
                }
                while (hourLen-- > 0) {
                    skeletonCopy = hourChar + skeletonCopy;
                }
            }
            else if (patternChar === 'J') {
                skeletonCopy += 'H';
            }
            else {
                skeletonCopy += patternChar;
            }
        }
        return skeletonCopy;
    }
    /**
     * Maps the [hour cycle type](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/hourCycle)
     * of the given `locale` to the corresponding time pattern.
     * @param locale
     */
    function getDefaultHourSymbolFromLocale(locale) {
        var hourCycle = locale.hourCycle;
        if (hourCycle === undefined &&
            // @ts-ignore hourCycle(s) is not identified yet
            locale.hourCycles &&
            // @ts-ignore
            locale.hourCycles.length) {
            // @ts-ignore
            hourCycle = locale.hourCycles[0];
        }
        if (hourCycle) {
            switch (hourCycle) {
                case 'h24':
                    return 'k';
                case 'h23':
                    return 'H';
                case 'h12':
                    return 'h';
                case 'h11':
                    return 'K';
                default:
                    throw new Error('Invalid hourCycle');
            }
        }
        // TODO: Once hourCycle is fully supported remove the following with data generation
        var languageTag = locale.language;
        var regionTag;
        if (languageTag !== 'root') {
            regionTag = locale.maximize().region;
        }
        var hourCycles = timeData[regionTag || ''] ||
            timeData[languageTag || ''] ||
            timeData["".concat(languageTag, "-001")] ||
            timeData['001'];
        return hourCycles[0];
    }

    var _a;
    var SPACE_SEPARATOR_START_REGEX = new RegExp("^".concat(SPACE_SEPARATOR_REGEX.source, "*"));
    var SPACE_SEPARATOR_END_REGEX = new RegExp("".concat(SPACE_SEPARATOR_REGEX.source, "*$"));
    function createLocation(start, end) {
        return { start: start, end: end };
    }
    // #region Ponyfills
    // Consolidate these variables up top for easier toggling during debugging
    var hasNativeStartsWith = !!String.prototype.startsWith;
    var hasNativeFromCodePoint = !!String.fromCodePoint;
    var hasNativeFromEntries = !!Object.fromEntries;
    var hasNativeCodePointAt = !!String.prototype.codePointAt;
    var hasTrimStart = !!String.prototype.trimStart;
    var hasTrimEnd = !!String.prototype.trimEnd;
    var hasNativeIsSafeInteger = !!Number.isSafeInteger;
    var isSafeInteger = hasNativeIsSafeInteger
        ? Number.isSafeInteger
        : function (n) {
            return (typeof n === 'number' &&
                isFinite(n) &&
                Math.floor(n) === n &&
                Math.abs(n) <= 0x1fffffffffffff);
        };
    // IE11 does not support y and u.
    var REGEX_SUPPORTS_U_AND_Y = true;
    try {
        var re = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
        /**
         * legacy Edge or Xbox One browser
         * Unicode flag support: supported
         * Pattern_Syntax support: not supported
         * See https://github.com/formatjs/formatjs/issues/2822
         */
        REGEX_SUPPORTS_U_AND_Y = ((_a = re.exec('a')) === null || _a === void 0 ? void 0 : _a[0]) === 'a';
    }
    catch (_) {
        REGEX_SUPPORTS_U_AND_Y = false;
    }
    var startsWith = hasNativeStartsWith
        ? // Native
            function startsWith(s, search, position) {
                return s.startsWith(search, position);
            }
        : // For IE11
            function startsWith(s, search, position) {
                return s.slice(position, position + search.length) === search;
            };
    var fromCodePoint = hasNativeFromCodePoint
        ? String.fromCodePoint
        : // IE11
            function fromCodePoint() {
                var codePoints = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    codePoints[_i] = arguments[_i];
                }
                var elements = '';
                var length = codePoints.length;
                var i = 0;
                var code;
                while (length > i) {
                    code = codePoints[i++];
                    if (code > 0x10ffff)
                        throw RangeError(code + ' is not a valid code point');
                    elements +=
                        code < 0x10000
                            ? String.fromCharCode(code)
                            : String.fromCharCode(((code -= 0x10000) >> 10) + 0xd800, (code % 0x400) + 0xdc00);
                }
                return elements;
            };
    var fromEntries = 
    // native
    hasNativeFromEntries
        ? Object.fromEntries
        : // Ponyfill
            function fromEntries(entries) {
                var obj = {};
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var _a = entries_1[_i], k = _a[0], v = _a[1];
                    obj[k] = v;
                }
                return obj;
            };
    var codePointAt = hasNativeCodePointAt
        ? // Native
            function codePointAt(s, index) {
                return s.codePointAt(index);
            }
        : // IE 11
            function codePointAt(s, index) {
                var size = s.length;
                if (index < 0 || index >= size) {
                    return undefined;
                }
                var first = s.charCodeAt(index);
                var second;
                return first < 0xd800 ||
                    first > 0xdbff ||
                    index + 1 === size ||
                    (second = s.charCodeAt(index + 1)) < 0xdc00 ||
                    second > 0xdfff
                    ? first
                    : ((first - 0xd800) << 10) + (second - 0xdc00) + 0x10000;
            };
    var trimStart = hasTrimStart
        ? // Native
            function trimStart(s) {
                return s.trimStart();
            }
        : // Ponyfill
            function trimStart(s) {
                return s.replace(SPACE_SEPARATOR_START_REGEX, '');
            };
    var trimEnd = hasTrimEnd
        ? // Native
            function trimEnd(s) {
                return s.trimEnd();
            }
        : // Ponyfill
            function trimEnd(s) {
                return s.replace(SPACE_SEPARATOR_END_REGEX, '');
            };
    // Prevent minifier to translate new RegExp to literal form that might cause syntax error on IE11.
    function RE(s, flag) {
        return new RegExp(s, flag);
    }
    // #endregion
    var matchIdentifierAtIndex;
    if (REGEX_SUPPORTS_U_AND_Y) {
        // Native
        var IDENTIFIER_PREFIX_RE_1 = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
        matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
            var _a;
            IDENTIFIER_PREFIX_RE_1.lastIndex = index;
            var match = IDENTIFIER_PREFIX_RE_1.exec(s);
            return (_a = match[1]) !== null && _a !== void 0 ? _a : '';
        };
    }
    else {
        // IE11
        matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
            var match = [];
            while (true) {
                var c = codePointAt(s, index);
                if (c === undefined || _isWhiteSpace(c) || _isPatternSyntax(c)) {
                    break;
                }
                match.push(c);
                index += c >= 0x10000 ? 2 : 1;
            }
            return fromCodePoint.apply(void 0, match);
        };
    }
    var Parser = /** @class */ (function () {
        function Parser(message, options) {
            if (options === void 0) { options = {}; }
            this.message = message;
            this.position = { offset: 0, line: 1, column: 1 };
            this.ignoreTag = !!options.ignoreTag;
            this.locale = options.locale;
            this.requiresOtherClause = !!options.requiresOtherClause;
            this.shouldParseSkeletons = !!options.shouldParseSkeletons;
        }
        Parser.prototype.parse = function () {
            if (this.offset() !== 0) {
                throw Error('parser can only be used once');
            }
            return this.parseMessage(0, '', false);
        };
        Parser.prototype.parseMessage = function (nestingLevel, parentArgType, expectingCloseTag) {
            var elements = [];
            while (!this.isEOF()) {
                var char = this.char();
                if (char === 123 /* `{` */) {
                    var result = this.parseArgument(nestingLevel, expectingCloseTag);
                    if (result.err) {
                        return result;
                    }
                    elements.push(result.val);
                }
                else if (char === 125 /* `}` */ && nestingLevel > 0) {
                    break;
                }
                else if (char === 35 /* `#` */ &&
                    (parentArgType === 'plural' || parentArgType === 'selectordinal')) {
                    var position = this.clonePosition();
                    this.bump();
                    elements.push({
                        type: TYPE.pound,
                        location: createLocation(position, this.clonePosition()),
                    });
                }
                else if (char === 60 /* `<` */ &&
                    !this.ignoreTag &&
                    this.peek() === 47 // char code for '/'
                ) {
                    if (expectingCloseTag) {
                        break;
                    }
                    else {
                        return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(this.clonePosition(), this.clonePosition()));
                    }
                }
                else if (char === 60 /* `<` */ &&
                    !this.ignoreTag &&
                    _isAlpha(this.peek() || 0)) {
                    var result = this.parseTag(nestingLevel, parentArgType);
                    if (result.err) {
                        return result;
                    }
                    elements.push(result.val);
                }
                else {
                    var result = this.parseLiteral(nestingLevel, parentArgType);
                    if (result.err) {
                        return result;
                    }
                    elements.push(result.val);
                }
            }
            return { val: elements, err: null };
        };
        /**
         * A tag name must start with an ASCII lower/upper case letter. The grammar is based on the
         * [custom element name][] except that a dash is NOT always mandatory and uppercase letters
         * are accepted:
         *
         * ```
         * tag ::= "<" tagName (whitespace)* "/>" | "<" tagName (whitespace)* ">" message "</" tagName (whitespace)* ">"
         * tagName ::= [a-z] (PENChar)*
         * PENChar ::=
         *     "-" | "." | [0-9] | "_" | [a-z] | [A-Z] | #xB7 | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x37D] |
         *     [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] | [#x2070-#x218F] | [#x2C00-#x2FEF] |
         *     [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
         * ```
         *
         * [custom element name]: https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
         * NOTE: We're a bit more lax here since HTML technically does not allow uppercase HTML element but we do
         * since other tag-based engines like React allow it
         */
        Parser.prototype.parseTag = function (nestingLevel, parentArgType) {
            var startPosition = this.clonePosition();
            this.bump(); // `<`
            var tagName = this.parseTagName();
            this.bumpSpace();
            if (this.bumpIf('/>')) {
                // Self closing tag
                return {
                    val: {
                        type: TYPE.literal,
                        value: "<".concat(tagName, "/>"),
                        location: createLocation(startPosition, this.clonePosition()),
                    },
                    err: null,
                };
            }
            else if (this.bumpIf('>')) {
                var childrenResult = this.parseMessage(nestingLevel + 1, parentArgType, true);
                if (childrenResult.err) {
                    return childrenResult;
                }
                var children = childrenResult.val;
                // Expecting a close tag
                var endTagStartPosition = this.clonePosition();
                if (this.bumpIf('</')) {
                    if (this.isEOF() || !_isAlpha(this.char())) {
                        return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                    }
                    var closingTagNameStartPosition = this.clonePosition();
                    var closingTagName = this.parseTagName();
                    if (tagName !== closingTagName) {
                        return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(closingTagNameStartPosition, this.clonePosition()));
                    }
                    this.bumpSpace();
                    if (!this.bumpIf('>')) {
                        return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                    }
                    return {
                        val: {
                            type: TYPE.tag,
                            value: tagName,
                            children: children,
                            location: createLocation(startPosition, this.clonePosition()),
                        },
                        err: null,
                    };
                }
                else {
                    return this.error(ErrorKind.UNCLOSED_TAG, createLocation(startPosition, this.clonePosition()));
                }
            }
            else {
                return this.error(ErrorKind.INVALID_TAG, createLocation(startPosition, this.clonePosition()));
            }
        };
        /**
         * This method assumes that the caller has peeked ahead for the first tag character.
         */
        Parser.prototype.parseTagName = function () {
            var startOffset = this.offset();
            this.bump(); // the first tag name character
            while (!this.isEOF() && _isPotentialElementNameChar(this.char())) {
                this.bump();
            }
            return this.message.slice(startOffset, this.offset());
        };
        Parser.prototype.parseLiteral = function (nestingLevel, parentArgType) {
            var start = this.clonePosition();
            var value = '';
            while (true) {
                var parseQuoteResult = this.tryParseQuote(parentArgType);
                if (parseQuoteResult) {
                    value += parseQuoteResult;
                    continue;
                }
                var parseUnquotedResult = this.tryParseUnquoted(nestingLevel, parentArgType);
                if (parseUnquotedResult) {
                    value += parseUnquotedResult;
                    continue;
                }
                var parseLeftAngleResult = this.tryParseLeftAngleBracket();
                if (parseLeftAngleResult) {
                    value += parseLeftAngleResult;
                    continue;
                }
                break;
            }
            var location = createLocation(start, this.clonePosition());
            return {
                val: { type: TYPE.literal, value: value, location: location },
                err: null,
            };
        };
        Parser.prototype.tryParseLeftAngleBracket = function () {
            if (!this.isEOF() &&
                this.char() === 60 /* `<` */ &&
                (this.ignoreTag ||
                    // If at the opening tag or closing tag position, bail.
                    !_isAlphaOrSlash(this.peek() || 0))) {
                this.bump(); // `<`
                return '<';
            }
            return null;
        };
        /**
         * Starting with ICU 4.8, an ASCII apostrophe only starts quoted text if it immediately precedes
         * a character that requires quoting (that is, "only where needed"), and works the same in
         * nested messages as on the top level of the pattern. The new behavior is otherwise compatible.
         */
        Parser.prototype.tryParseQuote = function (parentArgType) {
            if (this.isEOF() || this.char() !== 39 /* `'` */) {
                return null;
            }
            // Parse escaped char following the apostrophe, or early return if there is no escaped char.
            // Check if is valid escaped character
            switch (this.peek()) {
                case 39 /* `'` */:
                    // double quote, should return as a single quote.
                    this.bump();
                    this.bump();
                    return "'";
                // '{', '<', '>', '}'
                case 123:
                case 60:
                case 62:
                case 125:
                    break;
                case 35: // '#'
                    if (parentArgType === 'plural' || parentArgType === 'selectordinal') {
                        break;
                    }
                    return null;
                default:
                    return null;
            }
            this.bump(); // apostrophe
            var codePoints = [this.char()]; // escaped char
            this.bump();
            // read chars until the optional closing apostrophe is found
            while (!this.isEOF()) {
                var ch = this.char();
                if (ch === 39 /* `'` */) {
                    if (this.peek() === 39 /* `'` */) {
                        codePoints.push(39);
                        // Bump one more time because we need to skip 2 characters.
                        this.bump();
                    }
                    else {
                        // Optional closing apostrophe.
                        this.bump();
                        break;
                    }
                }
                else {
                    codePoints.push(ch);
                }
                this.bump();
            }
            return fromCodePoint.apply(void 0, codePoints);
        };
        Parser.prototype.tryParseUnquoted = function (nestingLevel, parentArgType) {
            if (this.isEOF()) {
                return null;
            }
            var ch = this.char();
            if (ch === 60 /* `<` */ ||
                ch === 123 /* `{` */ ||
                (ch === 35 /* `#` */ &&
                    (parentArgType === 'plural' || parentArgType === 'selectordinal')) ||
                (ch === 125 /* `}` */ && nestingLevel > 0)) {
                return null;
            }
            else {
                this.bump();
                return fromCodePoint(ch);
            }
        };
        Parser.prototype.parseArgument = function (nestingLevel, expectingCloseTag) {
            var openingBracePosition = this.clonePosition();
            this.bump(); // `{`
            this.bumpSpace();
            if (this.isEOF()) {
                return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
            }
            if (this.char() === 125 /* `}` */) {
                this.bump();
                return this.error(ErrorKind.EMPTY_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
            }
            // argument name
            var value = this.parseIdentifierIfPossible().value;
            if (!value) {
                return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
            }
            this.bumpSpace();
            if (this.isEOF()) {
                return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
            }
            switch (this.char()) {
                // Simple argument: `{name}`
                case 125 /* `}` */: {
                    this.bump(); // `}`
                    return {
                        val: {
                            type: TYPE.argument,
                            // value does not include the opening and closing braces.
                            value: value,
                            location: createLocation(openingBracePosition, this.clonePosition()),
                        },
                        err: null,
                    };
                }
                // Argument with options: `{name, format, ...}`
                case 44 /* `,` */: {
                    this.bump(); // `,`
                    this.bumpSpace();
                    if (this.isEOF()) {
                        return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
                    }
                    return this.parseArgumentOptions(nestingLevel, expectingCloseTag, value, openingBracePosition);
                }
                default:
                    return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
            }
        };
        /**
         * Advance the parser until the end of the identifier, if it is currently on
         * an identifier character. Return an empty string otherwise.
         */
        Parser.prototype.parseIdentifierIfPossible = function () {
            var startingPosition = this.clonePosition();
            var startOffset = this.offset();
            var value = matchIdentifierAtIndex(this.message, startOffset);
            var endOffset = startOffset + value.length;
            this.bumpTo(endOffset);
            var endPosition = this.clonePosition();
            var location = createLocation(startingPosition, endPosition);
            return { value: value, location: location };
        };
        Parser.prototype.parseArgumentOptions = function (nestingLevel, expectingCloseTag, value, openingBracePosition) {
            var _a;
            // Parse this range:
            // {name, type, style}
            //        ^---^
            var typeStartPosition = this.clonePosition();
            var argType = this.parseIdentifierIfPossible().value;
            var typeEndPosition = this.clonePosition();
            switch (argType) {
                case '':
                    // Expecting a style string number, date, time, plural, selectordinal, or select.
                    return this.error(ErrorKind.EXPECT_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
                case 'number':
                case 'date':
                case 'time': {
                    // Parse this range:
                    // {name, number, style}
                    //              ^-------^
                    this.bumpSpace();
                    var styleAndLocation = null;
                    if (this.bumpIf(',')) {
                        this.bumpSpace();
                        var styleStartPosition = this.clonePosition();
                        var result = this.parseSimpleArgStyleIfPossible();
                        if (result.err) {
                            return result;
                        }
                        var style = trimEnd(result.val);
                        if (style.length === 0) {
                            return this.error(ErrorKind.EXPECT_ARGUMENT_STYLE, createLocation(this.clonePosition(), this.clonePosition()));
                        }
                        var styleLocation = createLocation(styleStartPosition, this.clonePosition());
                        styleAndLocation = { style: style, styleLocation: styleLocation };
                    }
                    var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                    if (argCloseResult.err) {
                        return argCloseResult;
                    }
                    var location_1 = createLocation(openingBracePosition, this.clonePosition());
                    // Extract style or skeleton
                    if (styleAndLocation && startsWith(styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style, '::', 0)) {
                        // Skeleton starts with `::`.
                        var skeleton = trimStart(styleAndLocation.style.slice(2));
                        if (argType === 'number') {
                            var result = this.parseNumberSkeletonFromString(skeleton, styleAndLocation.styleLocation);
                            if (result.err) {
                                return result;
                            }
                            return {
                                val: { type: TYPE.number, value: value, location: location_1, style: result.val },
                                err: null,
                            };
                        }
                        else {
                            if (skeleton.length === 0) {
                                return this.error(ErrorKind.EXPECT_DATE_TIME_SKELETON, location_1);
                            }
                            var dateTimePattern = skeleton;
                            // Get "best match" pattern only if locale is passed, if not, let it
                            // pass as-is where `parseDateTimeSkeleton()` will throw an error
                            // for unsupported patterns.
                            if (this.locale) {
                                dateTimePattern = getBestPattern(skeleton, this.locale);
                            }
                            var style = {
                                type: SKELETON_TYPE.dateTime,
                                pattern: dateTimePattern,
                                location: styleAndLocation.styleLocation,
                                parsedOptions: this.shouldParseSkeletons
                                    ? parseDateTimeSkeleton(dateTimePattern)
                                    : {},
                            };
                            var type = argType === 'date' ? TYPE.date : TYPE.time;
                            return {
                                val: { type: type, value: value, location: location_1, style: style },
                                err: null,
                            };
                        }
                    }
                    // Regular style or no style.
                    return {
                        val: {
                            type: argType === 'number'
                                ? TYPE.number
                                : argType === 'date'
                                    ? TYPE.date
                                    : TYPE.time,
                            value: value,
                            location: location_1,
                            style: (_a = styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style) !== null && _a !== void 0 ? _a : null,
                        },
                        err: null,
                    };
                }
                case 'plural':
                case 'selectordinal':
                case 'select': {
                    // Parse this range:
                    // {name, plural, options}
                    //              ^---------^
                    var typeEndPosition_1 = this.clonePosition();
                    this.bumpSpace();
                    if (!this.bumpIf(',')) {
                        return this.error(ErrorKind.EXPECT_SELECT_ARGUMENT_OPTIONS, createLocation(typeEndPosition_1, __assign({}, typeEndPosition_1)));
                    }
                    this.bumpSpace();
                    // Parse offset:
                    // {name, plural, offset:1, options}
                    //                ^-----^
                    //
                    // or the first option:
                    //
                    // {name, plural, one {...} other {...}}
                    //                ^--^
                    var identifierAndLocation = this.parseIdentifierIfPossible();
                    var pluralOffset = 0;
                    if (argType !== 'select' && identifierAndLocation.value === 'offset') {
                        if (!this.bumpIf(':')) {
                            return this.error(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, createLocation(this.clonePosition(), this.clonePosition()));
                        }
                        this.bumpSpace();
                        var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, ErrorKind.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
                        if (result.err) {
                            return result;
                        }
                        // Parse another identifier for option parsing
                        this.bumpSpace();
                        identifierAndLocation = this.parseIdentifierIfPossible();
                        pluralOffset = result.val;
                    }
                    var optionsResult = this.tryParsePluralOrSelectOptions(nestingLevel, argType, expectingCloseTag, identifierAndLocation);
                    if (optionsResult.err) {
                        return optionsResult;
                    }
                    var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                    if (argCloseResult.err) {
                        return argCloseResult;
                    }
                    var location_2 = createLocation(openingBracePosition, this.clonePosition());
                    if (argType === 'select') {
                        return {
                            val: {
                                type: TYPE.select,
                                value: value,
                                options: fromEntries(optionsResult.val),
                                location: location_2,
                            },
                            err: null,
                        };
                    }
                    else {
                        return {
                            val: {
                                type: TYPE.plural,
                                value: value,
                                options: fromEntries(optionsResult.val),
                                offset: pluralOffset,
                                pluralType: argType === 'plural' ? 'cardinal' : 'ordinal',
                                location: location_2,
                            },
                            err: null,
                        };
                    }
                }
                default:
                    return this.error(ErrorKind.INVALID_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
            }
        };
        Parser.prototype.tryParseArgumentClose = function (openingBracePosition) {
            // Parse: {value, number, ::currency/GBP }
            //
            if (this.isEOF() || this.char() !== 125 /* `}` */) {
                return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
            }
            this.bump(); // `}`
            return { val: true, err: null };
        };
        /**
         * See: https://github.com/unicode-org/icu/blob/af7ed1f6d2298013dc303628438ec4abe1f16479/icu4c/source/common/messagepattern.cpp#L659
         */
        Parser.prototype.parseSimpleArgStyleIfPossible = function () {
            var nestedBraces = 0;
            var startPosition = this.clonePosition();
            while (!this.isEOF()) {
                var ch = this.char();
                switch (ch) {
                    case 39 /* `'` */: {
                        // Treat apostrophe as quoting but include it in the style part.
                        // Find the end of the quoted literal text.
                        this.bump();
                        var apostrophePosition = this.clonePosition();
                        if (!this.bumpUntil("'")) {
                            return this.error(ErrorKind.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, createLocation(apostrophePosition, this.clonePosition()));
                        }
                        this.bump();
                        break;
                    }
                    case 123 /* `{` */: {
                        nestedBraces += 1;
                        this.bump();
                        break;
                    }
                    case 125 /* `}` */: {
                        if (nestedBraces > 0) {
                            nestedBraces -= 1;
                        }
                        else {
                            return {
                                val: this.message.slice(startPosition.offset, this.offset()),
                                err: null,
                            };
                        }
                        break;
                    }
                    default:
                        this.bump();
                        break;
                }
            }
            return {
                val: this.message.slice(startPosition.offset, this.offset()),
                err: null,
            };
        };
        Parser.prototype.parseNumberSkeletonFromString = function (skeleton, location) {
            var tokens = [];
            try {
                tokens = parseNumberSkeletonFromString(skeleton);
            }
            catch (e) {
                return this.error(ErrorKind.INVALID_NUMBER_SKELETON, location);
            }
            return {
                val: {
                    type: SKELETON_TYPE.number,
                    tokens: tokens,
                    location: location,
                    parsedOptions: this.shouldParseSkeletons
                        ? parseNumberSkeleton(tokens)
                        : {},
                },
                err: null,
            };
        };
        /**
         * @param nesting_level The current nesting level of messages.
         *     This can be positive when parsing message fragment in select or plural argument options.
         * @param parent_arg_type The parent argument's type.
         * @param parsed_first_identifier If provided, this is the first identifier-like selector of
         *     the argument. It is a by-product of a previous parsing attempt.
         * @param expecting_close_tag If true, this message is directly or indirectly nested inside
         *     between a pair of opening and closing tags. The nested message will not parse beyond
         *     the closing tag boundary.
         */
        Parser.prototype.tryParsePluralOrSelectOptions = function (nestingLevel, parentArgType, expectCloseTag, parsedFirstIdentifier) {
            var _a;
            var hasOtherClause = false;
            var options = [];
            var parsedSelectors = new Set();
            var selector = parsedFirstIdentifier.value, selectorLocation = parsedFirstIdentifier.location;
            // Parse:
            // one {one apple}
            // ^--^
            while (true) {
                if (selector.length === 0) {
                    var startPosition = this.clonePosition();
                    if (parentArgType !== 'select' && this.bumpIf('=')) {
                        // Try parse `={number}` selector
                        var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, ErrorKind.INVALID_PLURAL_ARGUMENT_SELECTOR);
                        if (result.err) {
                            return result;
                        }
                        selectorLocation = createLocation(startPosition, this.clonePosition());
                        selector = this.message.slice(startPosition.offset, this.offset());
                    }
                    else {
                        break;
                    }
                }
                // Duplicate selector clauses
                if (parsedSelectors.has(selector)) {
                    return this.error(parentArgType === 'select'
                        ? ErrorKind.DUPLICATE_SELECT_ARGUMENT_SELECTOR
                        : ErrorKind.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, selectorLocation);
                }
                if (selector === 'other') {
                    hasOtherClause = true;
                }
                // Parse:
                // one {one apple}
                //     ^----------^
                this.bumpSpace();
                var openingBracePosition = this.clonePosition();
                if (!this.bumpIf('{')) {
                    return this.error(parentArgType === 'select'
                        ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT
                        : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, createLocation(this.clonePosition(), this.clonePosition()));
                }
                var fragmentResult = this.parseMessage(nestingLevel + 1, parentArgType, expectCloseTag);
                if (fragmentResult.err) {
                    return fragmentResult;
                }
                var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                if (argCloseResult.err) {
                    return argCloseResult;
                }
                options.push([
                    selector,
                    {
                        value: fragmentResult.val,
                        location: createLocation(openingBracePosition, this.clonePosition()),
                    },
                ]);
                // Keep track of the existing selectors
                parsedSelectors.add(selector);
                // Prep next selector clause.
                this.bumpSpace();
                (_a = this.parseIdentifierIfPossible(), selector = _a.value, selectorLocation = _a.location);
            }
            if (options.length === 0) {
                return this.error(parentArgType === 'select'
                    ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR
                    : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, createLocation(this.clonePosition(), this.clonePosition()));
            }
            if (this.requiresOtherClause && !hasOtherClause) {
                return this.error(ErrorKind.MISSING_OTHER_CLAUSE, createLocation(this.clonePosition(), this.clonePosition()));
            }
            return { val: options, err: null };
        };
        Parser.prototype.tryParseDecimalInteger = function (expectNumberError, invalidNumberError) {
            var sign = 1;
            var startingPosition = this.clonePosition();
            if (this.bumpIf('+')) ;
            else if (this.bumpIf('-')) {
                sign = -1;
            }
            var hasDigits = false;
            var decimal = 0;
            while (!this.isEOF()) {
                var ch = this.char();
                if (ch >= 48 /* `0` */ && ch <= 57 /* `9` */) {
                    hasDigits = true;
                    decimal = decimal * 10 + (ch - 48);
                    this.bump();
                }
                else {
                    break;
                }
            }
            var location = createLocation(startingPosition, this.clonePosition());
            if (!hasDigits) {
                return this.error(expectNumberError, location);
            }
            decimal *= sign;
            if (!isSafeInteger(decimal)) {
                return this.error(invalidNumberError, location);
            }
            return { val: decimal, err: null };
        };
        Parser.prototype.offset = function () {
            return this.position.offset;
        };
        Parser.prototype.isEOF = function () {
            return this.offset() === this.message.length;
        };
        Parser.prototype.clonePosition = function () {
            // This is much faster than `Object.assign` or spread.
            return {
                offset: this.position.offset,
                line: this.position.line,
                column: this.position.column,
            };
        };
        /**
         * Return the code point at the current position of the parser.
         * Throws if the index is out of bound.
         */
        Parser.prototype.char = function () {
            var offset = this.position.offset;
            if (offset >= this.message.length) {
                throw Error('out of bound');
            }
            var code = codePointAt(this.message, offset);
            if (code === undefined) {
                throw Error("Offset ".concat(offset, " is at invalid UTF-16 code unit boundary"));
            }
            return code;
        };
        Parser.prototype.error = function (kind, location) {
            return {
                val: null,
                err: {
                    kind: kind,
                    message: this.message,
                    location: location,
                },
            };
        };
        /** Bump the parser to the next UTF-16 code unit. */
        Parser.prototype.bump = function () {
            if (this.isEOF()) {
                return;
            }
            var code = this.char();
            if (code === 10 /* '\n' */) {
                this.position.line += 1;
                this.position.column = 1;
                this.position.offset += 1;
            }
            else {
                this.position.column += 1;
                // 0 ~ 0x10000 -> unicode BMP, otherwise skip the surrogate pair.
                this.position.offset += code < 0x10000 ? 1 : 2;
            }
        };
        /**
         * If the substring starting at the current position of the parser has
         * the given prefix, then bump the parser to the character immediately
         * following the prefix and return true. Otherwise, don't bump the parser
         * and return false.
         */
        Parser.prototype.bumpIf = function (prefix) {
            if (startsWith(this.message, prefix, this.offset())) {
                for (var i = 0; i < prefix.length; i++) {
                    this.bump();
                }
                return true;
            }
            return false;
        };
        /**
         * Bump the parser until the pattern character is found and return `true`.
         * Otherwise bump to the end of the file and return `false`.
         */
        Parser.prototype.bumpUntil = function (pattern) {
            var currentOffset = this.offset();
            var index = this.message.indexOf(pattern, currentOffset);
            if (index >= 0) {
                this.bumpTo(index);
                return true;
            }
            else {
                this.bumpTo(this.message.length);
                return false;
            }
        };
        /**
         * Bump the parser to the target offset.
         * If target offset is beyond the end of the input, bump the parser to the end of the input.
         */
        Parser.prototype.bumpTo = function (targetOffset) {
            if (this.offset() > targetOffset) {
                throw Error("targetOffset ".concat(targetOffset, " must be greater than or equal to the current offset ").concat(this.offset()));
            }
            targetOffset = Math.min(targetOffset, this.message.length);
            while (true) {
                var offset = this.offset();
                if (offset === targetOffset) {
                    break;
                }
                if (offset > targetOffset) {
                    throw Error("targetOffset ".concat(targetOffset, " is at invalid UTF-16 code unit boundary"));
                }
                this.bump();
                if (this.isEOF()) {
                    break;
                }
            }
        };
        /** advance the parser through all whitespace to the next non-whitespace code unit. */
        Parser.prototype.bumpSpace = function () {
            while (!this.isEOF() && _isWhiteSpace(this.char())) {
                this.bump();
            }
        };
        /**
         * Peek at the *next* Unicode codepoint in the input without advancing the parser.
         * If the input has been exhausted, then this returns null.
         */
        Parser.prototype.peek = function () {
            if (this.isEOF()) {
                return null;
            }
            var code = this.char();
            var offset = this.offset();
            var nextCode = this.message.charCodeAt(offset + (code >= 0x10000 ? 2 : 1));
            return nextCode !== null && nextCode !== void 0 ? nextCode : null;
        };
        return Parser;
    }());
    /**
     * This check if codepoint is alphabet (lower & uppercase)
     * @param codepoint
     * @returns
     */
    function _isAlpha(codepoint) {
        return ((codepoint >= 97 && codepoint <= 122) ||
            (codepoint >= 65 && codepoint <= 90));
    }
    function _isAlphaOrSlash(codepoint) {
        return _isAlpha(codepoint) || codepoint === 47; /* '/' */
    }
    /** See `parseTag` function docs. */
    function _isPotentialElementNameChar(c) {
        return (c === 45 /* '-' */ ||
            c === 46 /* '.' */ ||
            (c >= 48 && c <= 57) /* 0..9 */ ||
            c === 95 /* '_' */ ||
            (c >= 97 && c <= 122) /** a..z */ ||
            (c >= 65 && c <= 90) /* A..Z */ ||
            c == 0xb7 ||
            (c >= 0xc0 && c <= 0xd6) ||
            (c >= 0xd8 && c <= 0xf6) ||
            (c >= 0xf8 && c <= 0x37d) ||
            (c >= 0x37f && c <= 0x1fff) ||
            (c >= 0x200c && c <= 0x200d) ||
            (c >= 0x203f && c <= 0x2040) ||
            (c >= 0x2070 && c <= 0x218f) ||
            (c >= 0x2c00 && c <= 0x2fef) ||
            (c >= 0x3001 && c <= 0xd7ff) ||
            (c >= 0xf900 && c <= 0xfdcf) ||
            (c >= 0xfdf0 && c <= 0xfffd) ||
            (c >= 0x10000 && c <= 0xeffff));
    }
    /**
     * Code point equivalent of regex `\p{White_Space}`.
     * From: https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
     */
    function _isWhiteSpace(c) {
        return ((c >= 0x0009 && c <= 0x000d) ||
            c === 0x0020 ||
            c === 0x0085 ||
            (c >= 0x200e && c <= 0x200f) ||
            c === 0x2028 ||
            c === 0x2029);
    }
    /**
     * Code point equivalent of regex `\p{Pattern_Syntax}`.
     * See https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
     */
    function _isPatternSyntax(c) {
        return ((c >= 0x0021 && c <= 0x0023) ||
            c === 0x0024 ||
            (c >= 0x0025 && c <= 0x0027) ||
            c === 0x0028 ||
            c === 0x0029 ||
            c === 0x002a ||
            c === 0x002b ||
            c === 0x002c ||
            c === 0x002d ||
            (c >= 0x002e && c <= 0x002f) ||
            (c >= 0x003a && c <= 0x003b) ||
            (c >= 0x003c && c <= 0x003e) ||
            (c >= 0x003f && c <= 0x0040) ||
            c === 0x005b ||
            c === 0x005c ||
            c === 0x005d ||
            c === 0x005e ||
            c === 0x0060 ||
            c === 0x007b ||
            c === 0x007c ||
            c === 0x007d ||
            c === 0x007e ||
            c === 0x00a1 ||
            (c >= 0x00a2 && c <= 0x00a5) ||
            c === 0x00a6 ||
            c === 0x00a7 ||
            c === 0x00a9 ||
            c === 0x00ab ||
            c === 0x00ac ||
            c === 0x00ae ||
            c === 0x00b0 ||
            c === 0x00b1 ||
            c === 0x00b6 ||
            c === 0x00bb ||
            c === 0x00bf ||
            c === 0x00d7 ||
            c === 0x00f7 ||
            (c >= 0x2010 && c <= 0x2015) ||
            (c >= 0x2016 && c <= 0x2017) ||
            c === 0x2018 ||
            c === 0x2019 ||
            c === 0x201a ||
            (c >= 0x201b && c <= 0x201c) ||
            c === 0x201d ||
            c === 0x201e ||
            c === 0x201f ||
            (c >= 0x2020 && c <= 0x2027) ||
            (c >= 0x2030 && c <= 0x2038) ||
            c === 0x2039 ||
            c === 0x203a ||
            (c >= 0x203b && c <= 0x203e) ||
            (c >= 0x2041 && c <= 0x2043) ||
            c === 0x2044 ||
            c === 0x2045 ||
            c === 0x2046 ||
            (c >= 0x2047 && c <= 0x2051) ||
            c === 0x2052 ||
            c === 0x2053 ||
            (c >= 0x2055 && c <= 0x205e) ||
            (c >= 0x2190 && c <= 0x2194) ||
            (c >= 0x2195 && c <= 0x2199) ||
            (c >= 0x219a && c <= 0x219b) ||
            (c >= 0x219c && c <= 0x219f) ||
            c === 0x21a0 ||
            (c >= 0x21a1 && c <= 0x21a2) ||
            c === 0x21a3 ||
            (c >= 0x21a4 && c <= 0x21a5) ||
            c === 0x21a6 ||
            (c >= 0x21a7 && c <= 0x21ad) ||
            c === 0x21ae ||
            (c >= 0x21af && c <= 0x21cd) ||
            (c >= 0x21ce && c <= 0x21cf) ||
            (c >= 0x21d0 && c <= 0x21d1) ||
            c === 0x21d2 ||
            c === 0x21d3 ||
            c === 0x21d4 ||
            (c >= 0x21d5 && c <= 0x21f3) ||
            (c >= 0x21f4 && c <= 0x22ff) ||
            (c >= 0x2300 && c <= 0x2307) ||
            c === 0x2308 ||
            c === 0x2309 ||
            c === 0x230a ||
            c === 0x230b ||
            (c >= 0x230c && c <= 0x231f) ||
            (c >= 0x2320 && c <= 0x2321) ||
            (c >= 0x2322 && c <= 0x2328) ||
            c === 0x2329 ||
            c === 0x232a ||
            (c >= 0x232b && c <= 0x237b) ||
            c === 0x237c ||
            (c >= 0x237d && c <= 0x239a) ||
            (c >= 0x239b && c <= 0x23b3) ||
            (c >= 0x23b4 && c <= 0x23db) ||
            (c >= 0x23dc && c <= 0x23e1) ||
            (c >= 0x23e2 && c <= 0x2426) ||
            (c >= 0x2427 && c <= 0x243f) ||
            (c >= 0x2440 && c <= 0x244a) ||
            (c >= 0x244b && c <= 0x245f) ||
            (c >= 0x2500 && c <= 0x25b6) ||
            c === 0x25b7 ||
            (c >= 0x25b8 && c <= 0x25c0) ||
            c === 0x25c1 ||
            (c >= 0x25c2 && c <= 0x25f7) ||
            (c >= 0x25f8 && c <= 0x25ff) ||
            (c >= 0x2600 && c <= 0x266e) ||
            c === 0x266f ||
            (c >= 0x2670 && c <= 0x2767) ||
            c === 0x2768 ||
            c === 0x2769 ||
            c === 0x276a ||
            c === 0x276b ||
            c === 0x276c ||
            c === 0x276d ||
            c === 0x276e ||
            c === 0x276f ||
            c === 0x2770 ||
            c === 0x2771 ||
            c === 0x2772 ||
            c === 0x2773 ||
            c === 0x2774 ||
            c === 0x2775 ||
            (c >= 0x2794 && c <= 0x27bf) ||
            (c >= 0x27c0 && c <= 0x27c4) ||
            c === 0x27c5 ||
            c === 0x27c6 ||
            (c >= 0x27c7 && c <= 0x27e5) ||
            c === 0x27e6 ||
            c === 0x27e7 ||
            c === 0x27e8 ||
            c === 0x27e9 ||
            c === 0x27ea ||
            c === 0x27eb ||
            c === 0x27ec ||
            c === 0x27ed ||
            c === 0x27ee ||
            c === 0x27ef ||
            (c >= 0x27f0 && c <= 0x27ff) ||
            (c >= 0x2800 && c <= 0x28ff) ||
            (c >= 0x2900 && c <= 0x2982) ||
            c === 0x2983 ||
            c === 0x2984 ||
            c === 0x2985 ||
            c === 0x2986 ||
            c === 0x2987 ||
            c === 0x2988 ||
            c === 0x2989 ||
            c === 0x298a ||
            c === 0x298b ||
            c === 0x298c ||
            c === 0x298d ||
            c === 0x298e ||
            c === 0x298f ||
            c === 0x2990 ||
            c === 0x2991 ||
            c === 0x2992 ||
            c === 0x2993 ||
            c === 0x2994 ||
            c === 0x2995 ||
            c === 0x2996 ||
            c === 0x2997 ||
            c === 0x2998 ||
            (c >= 0x2999 && c <= 0x29d7) ||
            c === 0x29d8 ||
            c === 0x29d9 ||
            c === 0x29da ||
            c === 0x29db ||
            (c >= 0x29dc && c <= 0x29fb) ||
            c === 0x29fc ||
            c === 0x29fd ||
            (c >= 0x29fe && c <= 0x2aff) ||
            (c >= 0x2b00 && c <= 0x2b2f) ||
            (c >= 0x2b30 && c <= 0x2b44) ||
            (c >= 0x2b45 && c <= 0x2b46) ||
            (c >= 0x2b47 && c <= 0x2b4c) ||
            (c >= 0x2b4d && c <= 0x2b73) ||
            (c >= 0x2b74 && c <= 0x2b75) ||
            (c >= 0x2b76 && c <= 0x2b95) ||
            c === 0x2b96 ||
            (c >= 0x2b97 && c <= 0x2bff) ||
            (c >= 0x2e00 && c <= 0x2e01) ||
            c === 0x2e02 ||
            c === 0x2e03 ||
            c === 0x2e04 ||
            c === 0x2e05 ||
            (c >= 0x2e06 && c <= 0x2e08) ||
            c === 0x2e09 ||
            c === 0x2e0a ||
            c === 0x2e0b ||
            c === 0x2e0c ||
            c === 0x2e0d ||
            (c >= 0x2e0e && c <= 0x2e16) ||
            c === 0x2e17 ||
            (c >= 0x2e18 && c <= 0x2e19) ||
            c === 0x2e1a ||
            c === 0x2e1b ||
            c === 0x2e1c ||
            c === 0x2e1d ||
            (c >= 0x2e1e && c <= 0x2e1f) ||
            c === 0x2e20 ||
            c === 0x2e21 ||
            c === 0x2e22 ||
            c === 0x2e23 ||
            c === 0x2e24 ||
            c === 0x2e25 ||
            c === 0x2e26 ||
            c === 0x2e27 ||
            c === 0x2e28 ||
            c === 0x2e29 ||
            (c >= 0x2e2a && c <= 0x2e2e) ||
            c === 0x2e2f ||
            (c >= 0x2e30 && c <= 0x2e39) ||
            (c >= 0x2e3a && c <= 0x2e3b) ||
            (c >= 0x2e3c && c <= 0x2e3f) ||
            c === 0x2e40 ||
            c === 0x2e41 ||
            c === 0x2e42 ||
            (c >= 0x2e43 && c <= 0x2e4f) ||
            (c >= 0x2e50 && c <= 0x2e51) ||
            c === 0x2e52 ||
            (c >= 0x2e53 && c <= 0x2e7f) ||
            (c >= 0x3001 && c <= 0x3003) ||
            c === 0x3008 ||
            c === 0x3009 ||
            c === 0x300a ||
            c === 0x300b ||
            c === 0x300c ||
            c === 0x300d ||
            c === 0x300e ||
            c === 0x300f ||
            c === 0x3010 ||
            c === 0x3011 ||
            (c >= 0x3012 && c <= 0x3013) ||
            c === 0x3014 ||
            c === 0x3015 ||
            c === 0x3016 ||
            c === 0x3017 ||
            c === 0x3018 ||
            c === 0x3019 ||
            c === 0x301a ||
            c === 0x301b ||
            c === 0x301c ||
            c === 0x301d ||
            (c >= 0x301e && c <= 0x301f) ||
            c === 0x3020 ||
            c === 0x3030 ||
            c === 0xfd3e ||
            c === 0xfd3f ||
            (c >= 0xfe45 && c <= 0xfe46));
    }

    function pruneLocation(els) {
        els.forEach(function (el) {
            delete el.location;
            if (isSelectElement(el) || isPluralElement(el)) {
                for (var k in el.options) {
                    delete el.options[k].location;
                    pruneLocation(el.options[k].value);
                }
            }
            else if (isNumberElement(el) && isNumberSkeleton(el.style)) {
                delete el.style.location;
            }
            else if ((isDateElement(el) || isTimeElement(el)) &&
                isDateTimeSkeleton(el.style)) {
                delete el.style.location;
            }
            else if (isTagElement(el)) {
                pruneLocation(el.children);
            }
        });
    }
    function parse(message, opts) {
        if (opts === void 0) { opts = {}; }
        opts = __assign({ shouldParseSkeletons: true, requiresOtherClause: true }, opts);
        var result = new Parser(message, opts).parse();
        if (result.err) {
            var error = SyntaxError(ErrorKind[result.err.kind]);
            // @ts-expect-error Assign to error object
            error.location = result.err.location;
            // @ts-expect-error Assign to error object
            error.originalMessage = result.err.message;
            throw error;
        }
        if (!(opts === null || opts === void 0 ? void 0 : opts.captureLocation)) {
            pruneLocation(result.val);
        }
        return result.val;
    }

    //
    // Main
    //
    function memoize(fn, options) {
        var cache = options && options.cache ? options.cache : cacheDefault;
        var serializer = options && options.serializer ? options.serializer : serializerDefault;
        var strategy = options && options.strategy ? options.strategy : strategyDefault;
        return strategy(fn, {
            cache: cache,
            serializer: serializer,
        });
    }
    //
    // Strategy
    //
    function isPrimitive(value) {
        return (value == null || typeof value === 'number' || typeof value === 'boolean'); // || typeof value === "string" 'unsafe' primitive for our needs
    }
    function monadic(fn, cache, serializer, arg) {
        var cacheKey = isPrimitive(arg) ? arg : serializer(arg);
        var computedValue = cache.get(cacheKey);
        if (typeof computedValue === 'undefined') {
            computedValue = fn.call(this, arg);
            cache.set(cacheKey, computedValue);
        }
        return computedValue;
    }
    function variadic(fn, cache, serializer) {
        var args = Array.prototype.slice.call(arguments, 3);
        var cacheKey = serializer(args);
        var computedValue = cache.get(cacheKey);
        if (typeof computedValue === 'undefined') {
            computedValue = fn.apply(this, args);
            cache.set(cacheKey, computedValue);
        }
        return computedValue;
    }
    function assemble(fn, context, strategy, cache, serialize) {
        return strategy.bind(context, fn, cache, serialize);
    }
    function strategyDefault(fn, options) {
        var strategy = fn.length === 1 ? monadic : variadic;
        return assemble(fn, this, strategy, options.cache.create(), options.serializer);
    }
    function strategyVariadic(fn, options) {
        return assemble(fn, this, variadic, options.cache.create(), options.serializer);
    }
    function strategyMonadic(fn, options) {
        return assemble(fn, this, monadic, options.cache.create(), options.serializer);
    }
    //
    // Serializer
    //
    var serializerDefault = function () {
        return JSON.stringify(arguments);
    };
    //
    // Cache
    //
    function ObjectWithoutPrototypeCache() {
        this.cache = Object.create(null);
    }
    ObjectWithoutPrototypeCache.prototype.get = function (key) {
        return this.cache[key];
    };
    ObjectWithoutPrototypeCache.prototype.set = function (key, value) {
        this.cache[key] = value;
    };
    var cacheDefault = {
        create: function create() {
            // @ts-ignore
            return new ObjectWithoutPrototypeCache();
        },
    };
    var strategies = {
        variadic: strategyVariadic,
        monadic: strategyMonadic,
    };

    var ErrorCode;
    (function (ErrorCode) {
        // When we have a placeholder but no value to format
        ErrorCode["MISSING_VALUE"] = "MISSING_VALUE";
        // When value supplied is invalid
        ErrorCode["INVALID_VALUE"] = "INVALID_VALUE";
        // When we need specific Intl API but it's not available
        ErrorCode["MISSING_INTL_API"] = "MISSING_INTL_API";
    })(ErrorCode || (ErrorCode = {}));
    var FormatError = /** @class */ (function (_super) {
        __extends(FormatError, _super);
        function FormatError(msg, code, originalMessage) {
            var _this = _super.call(this, msg) || this;
            _this.code = code;
            _this.originalMessage = originalMessage;
            return _this;
        }
        FormatError.prototype.toString = function () {
            return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
        };
        return FormatError;
    }(Error));
    var InvalidValueError = /** @class */ (function (_super) {
        __extends(InvalidValueError, _super);
        function InvalidValueError(variableId, value, options, originalMessage) {
            return _super.call(this, "Invalid values for \"".concat(variableId, "\": \"").concat(value, "\". Options are \"").concat(Object.keys(options).join('", "'), "\""), ErrorCode.INVALID_VALUE, originalMessage) || this;
        }
        return InvalidValueError;
    }(FormatError));
    var InvalidValueTypeError = /** @class */ (function (_super) {
        __extends(InvalidValueTypeError, _super);
        function InvalidValueTypeError(value, type, originalMessage) {
            return _super.call(this, "Value for \"".concat(value, "\" must be of type ").concat(type), ErrorCode.INVALID_VALUE, originalMessage) || this;
        }
        return InvalidValueTypeError;
    }(FormatError));
    var MissingValueError = /** @class */ (function (_super) {
        __extends(MissingValueError, _super);
        function MissingValueError(variableId, originalMessage) {
            return _super.call(this, "The intl string context variable \"".concat(variableId, "\" was not provided to the string \"").concat(originalMessage, "\""), ErrorCode.MISSING_VALUE, originalMessage) || this;
        }
        return MissingValueError;
    }(FormatError));

    var PART_TYPE;
    (function (PART_TYPE) {
        PART_TYPE[PART_TYPE["literal"] = 0] = "literal";
        PART_TYPE[PART_TYPE["object"] = 1] = "object";
    })(PART_TYPE || (PART_TYPE = {}));
    function mergeLiteral(parts) {
        if (parts.length < 2) {
            return parts;
        }
        return parts.reduce(function (all, part) {
            var lastPart = all[all.length - 1];
            if (!lastPart ||
                lastPart.type !== PART_TYPE.literal ||
                part.type !== PART_TYPE.literal) {
                all.push(part);
            }
            else {
                lastPart.value += part.value;
            }
            return all;
        }, []);
    }
    function isFormatXMLElementFn(el) {
        return typeof el === 'function';
    }
    // TODO(skeleton): add skeleton support
    function formatToParts(els, locales, formatters, formats, values, currentPluralValue, 
    // For debugging
    originalMessage) {
        // Hot path for straight simple msg translations
        if (els.length === 1 && isLiteralElement(els[0])) {
            return [
                {
                    type: PART_TYPE.literal,
                    value: els[0].value,
                },
            ];
        }
        var result = [];
        for (var _i = 0, els_1 = els; _i < els_1.length; _i++) {
            var el = els_1[_i];
            // Exit early for string parts.
            if (isLiteralElement(el)) {
                result.push({
                    type: PART_TYPE.literal,
                    value: el.value,
                });
                continue;
            }
            // TODO: should this part be literal type?
            // Replace `#` in plural rules with the actual numeric value.
            if (isPoundElement(el)) {
                if (typeof currentPluralValue === 'number') {
                    result.push({
                        type: PART_TYPE.literal,
                        value: formatters.getNumberFormat(locales).format(currentPluralValue),
                    });
                }
                continue;
            }
            var varName = el.value;
            // Enforce that all required values are provided by the caller.
            if (!(values && varName in values)) {
                throw new MissingValueError(varName, originalMessage);
            }
            var value = values[varName];
            if (isArgumentElement(el)) {
                if (!value || typeof value === 'string' || typeof value === 'number') {
                    value =
                        typeof value === 'string' || typeof value === 'number'
                            ? String(value)
                            : '';
                }
                result.push({
                    type: typeof value === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                    value: value,
                });
                continue;
            }
            // Recursively format plural and select parts' option — which can be a
            // nested pattern structure. The choosing of the option to use is
            // abstracted-by and delegated-to the part helper object.
            if (isDateElement(el)) {
                var style = typeof el.style === 'string'
                    ? formats.date[el.style]
                    : isDateTimeSkeleton(el.style)
                        ? el.style.parsedOptions
                        : undefined;
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters
                        .getDateTimeFormat(locales, style)
                        .format(value),
                });
                continue;
            }
            if (isTimeElement(el)) {
                var style = typeof el.style === 'string'
                    ? formats.time[el.style]
                    : isDateTimeSkeleton(el.style)
                        ? el.style.parsedOptions
                        : formats.time.medium;
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters
                        .getDateTimeFormat(locales, style)
                        .format(value),
                });
                continue;
            }
            if (isNumberElement(el)) {
                var style = typeof el.style === 'string'
                    ? formats.number[el.style]
                    : isNumberSkeleton(el.style)
                        ? el.style.parsedOptions
                        : undefined;
                if (style && style.scale) {
                    value =
                        value *
                            (style.scale || 1);
                }
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters
                        .getNumberFormat(locales, style)
                        .format(value),
                });
                continue;
            }
            if (isTagElement(el)) {
                var children = el.children, value_1 = el.value;
                var formatFn = values[value_1];
                if (!isFormatXMLElementFn(formatFn)) {
                    throw new InvalidValueTypeError(value_1, 'function', originalMessage);
                }
                var parts = formatToParts(children, locales, formatters, formats, values, currentPluralValue);
                var chunks = formatFn(parts.map(function (p) { return p.value; }));
                if (!Array.isArray(chunks)) {
                    chunks = [chunks];
                }
                result.push.apply(result, chunks.map(function (c) {
                    return {
                        type: typeof c === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                        value: c,
                    };
                }));
            }
            if (isSelectElement(el)) {
                var opt = el.options[value] || el.options.other;
                if (!opt) {
                    throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
                }
                result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values));
                continue;
            }
            if (isPluralElement(el)) {
                var opt = el.options["=".concat(value)];
                if (!opt) {
                    if (!Intl.PluralRules) {
                        throw new FormatError("Intl.PluralRules is not available in this environment.\nTry polyfilling it using \"@formatjs/intl-pluralrules\"\n", ErrorCode.MISSING_INTL_API, originalMessage);
                    }
                    var rule = formatters
                        .getPluralRules(locales, { type: el.pluralType })
                        .select(value - (el.offset || 0));
                    opt = el.options[rule] || el.options.other;
                }
                if (!opt) {
                    throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
                }
                result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values, value - (el.offset || 0)));
                continue;
            }
        }
        return mergeLiteral(result);
    }

    /*
    Copyright (c) 2014, Yahoo! Inc. All rights reserved.
    Copyrights licensed under the New BSD License.
    See the accompanying LICENSE file for terms.
    */
    // -- MessageFormat --------------------------------------------------------
    function mergeConfig(c1, c2) {
        if (!c2) {
            return c1;
        }
        return __assign(__assign(__assign({}, (c1 || {})), (c2 || {})), Object.keys(c1).reduce(function (all, k) {
            all[k] = __assign(__assign({}, c1[k]), (c2[k] || {}));
            return all;
        }, {}));
    }
    function mergeConfigs(defaultConfig, configs) {
        if (!configs) {
            return defaultConfig;
        }
        return Object.keys(defaultConfig).reduce(function (all, k) {
            all[k] = mergeConfig(defaultConfig[k], configs[k]);
            return all;
        }, __assign({}, defaultConfig));
    }
    function createFastMemoizeCache(store) {
        return {
            create: function () {
                return {
                    get: function (key) {
                        return store[key];
                    },
                    set: function (key, value) {
                        store[key] = value;
                    },
                };
            },
        };
    }
    function createDefaultFormatters(cache) {
        if (cache === void 0) { cache = {
            number: {},
            dateTime: {},
            pluralRules: {},
        }; }
        return {
            getNumberFormat: memoize(function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new ((_a = Intl.NumberFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
            }, {
                cache: createFastMemoizeCache(cache.number),
                strategy: strategies.variadic,
            }),
            getDateTimeFormat: memoize(function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new ((_a = Intl.DateTimeFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
            }, {
                cache: createFastMemoizeCache(cache.dateTime),
                strategy: strategies.variadic,
            }),
            getPluralRules: memoize(function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new ((_a = Intl.PluralRules).bind.apply(_a, __spreadArray([void 0], args, false)))();
            }, {
                cache: createFastMemoizeCache(cache.pluralRules),
                strategy: strategies.variadic,
            }),
        };
    }
    var IntlMessageFormat = /** @class */ (function () {
        function IntlMessageFormat(message, locales, overrideFormats, opts) {
            var _this = this;
            if (locales === void 0) { locales = IntlMessageFormat.defaultLocale; }
            this.formatterCache = {
                number: {},
                dateTime: {},
                pluralRules: {},
            };
            this.format = function (values) {
                var parts = _this.formatToParts(values);
                // Hot path for straight simple msg translations
                if (parts.length === 1) {
                    return parts[0].value;
                }
                var result = parts.reduce(function (all, part) {
                    if (!all.length ||
                        part.type !== PART_TYPE.literal ||
                        typeof all[all.length - 1] !== 'string') {
                        all.push(part.value);
                    }
                    else {
                        all[all.length - 1] += part.value;
                    }
                    return all;
                }, []);
                if (result.length <= 1) {
                    return result[0] || '';
                }
                return result;
            };
            this.formatToParts = function (values) {
                return formatToParts(_this.ast, _this.locales, _this.formatters, _this.formats, values, undefined, _this.message);
            };
            this.resolvedOptions = function () { return ({
                locale: _this.resolvedLocale.toString(),
            }); };
            this.getAst = function () { return _this.ast; };
            // Defined first because it's used to build the format pattern.
            this.locales = locales;
            this.resolvedLocale = IntlMessageFormat.resolveLocale(locales);
            if (typeof message === 'string') {
                this.message = message;
                if (!IntlMessageFormat.__parse) {
                    throw new TypeError('IntlMessageFormat.__parse must be set to process `message` of type `string`');
                }
                // Parse string messages into an AST.
                this.ast = IntlMessageFormat.__parse(message, {
                    ignoreTag: opts === null || opts === void 0 ? void 0 : opts.ignoreTag,
                    locale: this.resolvedLocale,
                });
            }
            else {
                this.ast = message;
            }
            if (!Array.isArray(this.ast)) {
                throw new TypeError('A message must be provided as a String or AST.');
            }
            // Creates a new object with the specified `formats` merged with the default
            // formats.
            this.formats = mergeConfigs(IntlMessageFormat.formats, overrideFormats);
            this.formatters =
                (opts && opts.formatters) || createDefaultFormatters(this.formatterCache);
        }
        Object.defineProperty(IntlMessageFormat, "defaultLocale", {
            get: function () {
                if (!IntlMessageFormat.memoizedDefaultLocale) {
                    IntlMessageFormat.memoizedDefaultLocale =
                        new Intl.NumberFormat().resolvedOptions().locale;
                }
                return IntlMessageFormat.memoizedDefaultLocale;
            },
            enumerable: false,
            configurable: true
        });
        IntlMessageFormat.memoizedDefaultLocale = null;
        IntlMessageFormat.resolveLocale = function (locales) {
            var supportedLocales = Intl.NumberFormat.supportedLocalesOf(locales);
            if (supportedLocales.length > 0) {
                return new Intl.Locale(supportedLocales[0]);
            }
            return new Intl.Locale(typeof locales === 'string' ? locales : locales[0]);
        };
        IntlMessageFormat.__parse = parse;
        // Default format options used as the prototype of the `formats` provided to the
        // constructor. These are used when constructing the internal Intl.NumberFormat
        // and Intl.DateTimeFormat instances.
        IntlMessageFormat.formats = {
            number: {
                integer: {
                    maximumFractionDigits: 0,
                },
                currency: {
                    style: 'currency',
                },
                percent: {
                    style: 'percent',
                },
            },
            date: {
                short: {
                    month: 'numeric',
                    day: 'numeric',
                    year: '2-digit',
                },
                medium: {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                },
                long: {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                },
                full: {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                },
            },
            time: {
                short: {
                    hour: 'numeric',
                    minute: 'numeric',
                },
                medium: {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                },
                long: {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZoneName: 'short',
                },
                full: {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZoneName: 'short',
                },
            },
        };
        return IntlMessageFormat;
    }());

    function delve(obj, fullKey) {
      if (fullKey == null)
        return void 0;
      if (fullKey in obj) {
        return obj[fullKey];
      }
      const keys = fullKey.split(".");
      let result = obj;
      for (let p = 0; p < keys.length; p++) {
        if (typeof result === "object") {
          if (p > 0) {
            const partialKey = keys.slice(p, keys.length).join(".");
            if (partialKey in result) {
              result = result[partialKey];
              break;
            }
          }
          result = result[keys[p]];
        } else {
          result = void 0;
        }
      }
      return result;
    }

    const lookupCache = {};
    const addToCache = (path, locale, message) => {
      if (!message)
        return message;
      if (!(locale in lookupCache))
        lookupCache[locale] = {};
      if (!(path in lookupCache[locale]))
        lookupCache[locale][path] = message;
      return message;
    };
    const lookup = (path, refLocale) => {
      if (refLocale == null)
        return void 0;
      if (refLocale in lookupCache && path in lookupCache[refLocale]) {
        return lookupCache[refLocale][path];
      }
      const locales = getPossibleLocales(refLocale);
      for (let i = 0; i < locales.length; i++) {
        const locale = locales[i];
        const message = getMessageFromDictionary(locale, path);
        if (message) {
          return addToCache(path, refLocale, message);
        }
      }
      return void 0;
    };

    let dictionary;
    const $dictionary = writable({});
    function getLocaleDictionary(locale) {
      return dictionary[locale] || null;
    }
    function hasLocaleDictionary(locale) {
      return locale in dictionary;
    }
    function getMessageFromDictionary(locale, id) {
      if (!hasLocaleDictionary(locale)) {
        return null;
      }
      const localeDictionary = getLocaleDictionary(locale);
      const match = delve(localeDictionary, id);
      return match;
    }
    function getClosestAvailableLocale(refLocale) {
      if (refLocale == null)
        return void 0;
      const relatedLocales = getPossibleLocales(refLocale);
      for (let i = 0; i < relatedLocales.length; i++) {
        const locale = relatedLocales[i];
        if (hasLocaleDictionary(locale)) {
          return locale;
        }
      }
      return void 0;
    }
    function addMessages(locale, ...partials) {
      delete lookupCache[locale];
      $dictionary.update((d) => {
        d[locale] = cjs.all([d[locale] || {}, ...partials]);
        return d;
      });
    }
    const $locales = derived(
      [$dictionary],
      ([dictionary2]) => Object.keys(dictionary2)
    );
    $dictionary.subscribe((newDictionary) => dictionary = newDictionary);

    const queue = {};
    function removeLoaderFromQueue(locale, loader) {
      queue[locale].delete(loader);
      if (queue[locale].size === 0) {
        delete queue[locale];
      }
    }
    function getLocaleQueue(locale) {
      return queue[locale];
    }
    function getLocalesQueues(locale) {
      return getPossibleLocales(locale).map((localeItem) => {
        const localeQueue = getLocaleQueue(localeItem);
        return [localeItem, localeQueue ? [...localeQueue] : []];
      }).filter(([, localeQueue]) => localeQueue.length > 0);
    }
    function hasLocaleQueue(locale) {
      if (locale == null)
        return false;
      return getPossibleLocales(locale).some(
        (localeQueue) => {
          var _a;
          return (_a = getLocaleQueue(localeQueue)) == null ? void 0 : _a.size;
        }
      );
    }
    function loadLocaleQueue(locale, localeQueue) {
      const allLoadersPromise = Promise.all(
        localeQueue.map((loader) => {
          removeLoaderFromQueue(locale, loader);
          return loader().then((partial) => partial.default || partial);
        })
      );
      return allLoadersPromise.then((partials) => addMessages(locale, ...partials));
    }
    const activeFlushes = {};
    function flush(locale) {
      if (!hasLocaleQueue(locale)) {
        if (locale in activeFlushes) {
          return activeFlushes[locale];
        }
        return Promise.resolve();
      }
      const queues = getLocalesQueues(locale);
      activeFlushes[locale] = Promise.all(
        queues.map(
          ([localeName, localeQueue]) => loadLocaleQueue(localeName, localeQueue)
        )
      ).then(() => {
        if (hasLocaleQueue(locale)) {
          return flush(locale);
        }
        delete activeFlushes[locale];
      });
      return activeFlushes[locale];
    }

    var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
    var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
    var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
    var __objRest$1 = (source, exclude) => {
      var target = {};
      for (var prop in source)
        if (__hasOwnProp$2.call(source, prop) && exclude.indexOf(prop) < 0)
          target[prop] = source[prop];
      if (source != null && __getOwnPropSymbols$2)
        for (var prop of __getOwnPropSymbols$2(source)) {
          if (exclude.indexOf(prop) < 0 && __propIsEnum$2.call(source, prop))
            target[prop] = source[prop];
        }
      return target;
    };
    const defaultFormats = {
      number: {
        scientific: { notation: "scientific" },
        engineering: { notation: "engineering" },
        compactLong: { notation: "compact", compactDisplay: "long" },
        compactShort: { notation: "compact", compactDisplay: "short" }
      },
      date: {
        short: { month: "numeric", day: "numeric", year: "2-digit" },
        medium: { month: "short", day: "numeric", year: "numeric" },
        long: { month: "long", day: "numeric", year: "numeric" },
        full: { weekday: "long", month: "long", day: "numeric", year: "numeric" }
      },
      time: {
        short: { hour: "numeric", minute: "numeric" },
        medium: { hour: "numeric", minute: "numeric", second: "numeric" },
        long: {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          timeZoneName: "short"
        },
        full: {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          timeZoneName: "short"
        }
      }
    };
    function defaultMissingKeyHandler({ locale, id }) {
      console.warn(
        `[svelte-i18n] The message "${id}" was not found in "${getPossibleLocales(
      locale
    ).join('", "')}".${hasLocaleQueue(getCurrentLocale()) ? `

Note: there are at least one loader still registered to this locale that wasn't executed.` : ""}`
      );
    }
    const defaultOptions = {
      fallbackLocale: null,
      loadingDelay: 200,
      formats: defaultFormats,
      warnOnMissingMessages: true,
      handleMissingMessage: void 0,
      ignoreTag: true
    };
    const options = defaultOptions;
    function getOptions() {
      return options;
    }
    function init(opts) {
      const _a = opts, { formats } = _a, rest = __objRest$1(_a, ["formats"]);
      let initialLocale = opts.fallbackLocale;
      if (opts.initialLocale) {
        try {
          if (IntlMessageFormat.resolveLocale(opts.initialLocale)) {
            initialLocale = opts.initialLocale;
          }
        } catch (e) {
          console.warn(
            `[svelte-i18n] The initial locale "${opts.initialLocale}" is not a valid locale.`
          );
        }
      }
      if (rest.warnOnMissingMessages) {
        delete rest.warnOnMissingMessages;
        if (rest.handleMissingMessage == null) {
          rest.handleMissingMessage = defaultMissingKeyHandler;
        } else {
          console.warn(
            '[svelte-i18n] The "warnOnMissingMessages" option is deprecated. Please use the "handleMissingMessage" option instead.'
          );
        }
      }
      Object.assign(options, rest, { initialLocale });
      if (formats) {
        if ("number" in formats) {
          Object.assign(options.formats.number, formats.number);
        }
        if ("date" in formats) {
          Object.assign(options.formats.date, formats.date);
        }
        if ("time" in formats) {
          Object.assign(options.formats.time, formats.time);
        }
      }
      return $locale.set(initialLocale);
    }

    const $isLoading = writable(false);

    var __defProp$1 = Object.defineProperty;
    var __defProps = Object.defineProperties;
    var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
    var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
    var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
    var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$1 = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$1.call(b, prop))
          __defNormalProp$1(a, prop, b[prop]);
      if (__getOwnPropSymbols$1)
        for (var prop of __getOwnPropSymbols$1(b)) {
          if (__propIsEnum$1.call(b, prop))
            __defNormalProp$1(a, prop, b[prop]);
        }
      return a;
    };
    var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
    let current;
    const internalLocale = writable(null);
    function getSubLocales(refLocale) {
      return refLocale.split("-").map((_, i, arr) => arr.slice(0, i + 1).join("-")).reverse();
    }
    function getPossibleLocales(refLocale, fallbackLocale = getOptions().fallbackLocale) {
      const locales = getSubLocales(refLocale);
      if (fallbackLocale) {
        return [.../* @__PURE__ */ new Set([...locales, ...getSubLocales(fallbackLocale)])];
      }
      return locales;
    }
    function getCurrentLocale() {
      return current != null ? current : void 0;
    }
    internalLocale.subscribe((newLocale) => {
      current = newLocale != null ? newLocale : void 0;
      if (typeof window !== "undefined" && newLocale != null) {
        document.documentElement.setAttribute("lang", newLocale);
      }
    });
    const set = (newLocale) => {
      if (newLocale && getClosestAvailableLocale(newLocale) && hasLocaleQueue(newLocale)) {
        const { loadingDelay } = getOptions();
        let loadingTimer;
        if (typeof window !== "undefined" && getCurrentLocale() != null && loadingDelay) {
          loadingTimer = window.setTimeout(
            () => $isLoading.set(true),
            loadingDelay
          );
        } else {
          $isLoading.set(true);
        }
        return flush(newLocale).then(() => {
          internalLocale.set(newLocale);
        }).finally(() => {
          clearTimeout(loadingTimer);
          $isLoading.set(false);
        });
      }
      return internalLocale.set(newLocale);
    };
    const $locale = __spreadProps(__spreadValues$1({}, internalLocale), {
      set
    });
    const getLocaleFromNavigator = () => {
      if (typeof window === "undefined")
        return null;
      return window.navigator.language || window.navigator.languages[0];
    };

    const monadicMemoize = (fn) => {
      const cache = /* @__PURE__ */ Object.create(null);
      const memoizedFn = (arg) => {
        const cacheKey = JSON.stringify(arg);
        if (cacheKey in cache) {
          return cache[cacheKey];
        }
        return cache[cacheKey] = fn(arg);
      };
      return memoizedFn;
    };

    var __defProp = Object.defineProperty;
    var __getOwnPropSymbols = Object.getOwnPropertySymbols;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __propIsEnum = Object.prototype.propertyIsEnumerable;
    var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      if (__getOwnPropSymbols)
        for (var prop of __getOwnPropSymbols(b)) {
          if (__propIsEnum.call(b, prop))
            __defNormalProp(a, prop, b[prop]);
        }
      return a;
    };
    var __objRest = (source, exclude) => {
      var target = {};
      for (var prop in source)
        if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
          target[prop] = source[prop];
      if (source != null && __getOwnPropSymbols)
        for (var prop of __getOwnPropSymbols(source)) {
          if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
            target[prop] = source[prop];
        }
      return target;
    };
    const getIntlFormatterOptions = (type, name) => {
      const { formats } = getOptions();
      if (type in formats && name in formats[type]) {
        return formats[type][name];
      }
      throw new Error(`[svelte-i18n] Unknown "${name}" ${type} format.`);
    };
    const createNumberFormatter = monadicMemoize(
      (_a) => {
        var _b = _a, { locale, format } = _b, options = __objRest(_b, ["locale", "format"]);
        if (locale == null) {
          throw new Error('[svelte-i18n] A "locale" must be set to format numbers');
        }
        if (format) {
          options = getIntlFormatterOptions("number", format);
        }
        return new Intl.NumberFormat(locale, options);
      }
    );
    const createDateFormatter = monadicMemoize(
      (_c) => {
        var _d = _c, { locale, format } = _d, options = __objRest(_d, ["locale", "format"]);
        if (locale == null) {
          throw new Error('[svelte-i18n] A "locale" must be set to format dates');
        }
        if (format) {
          options = getIntlFormatterOptions("date", format);
        } else if (Object.keys(options).length === 0) {
          options = getIntlFormatterOptions("date", "short");
        }
        return new Intl.DateTimeFormat(locale, options);
      }
    );
    const createTimeFormatter = monadicMemoize(
      (_e) => {
        var _f = _e, { locale, format } = _f, options = __objRest(_f, ["locale", "format"]);
        if (locale == null) {
          throw new Error(
            '[svelte-i18n] A "locale" must be set to format time values'
          );
        }
        if (format) {
          options = getIntlFormatterOptions("time", format);
        } else if (Object.keys(options).length === 0) {
          options = getIntlFormatterOptions("time", "short");
        }
        return new Intl.DateTimeFormat(locale, options);
      }
    );
    const getNumberFormatter = (_g = {}) => {
      var _h = _g, {
        locale = getCurrentLocale()
      } = _h, args = __objRest(_h, [
        "locale"
      ]);
      return createNumberFormatter(__spreadValues({ locale }, args));
    };
    const getDateFormatter = (_i = {}) => {
      var _j = _i, {
        locale = getCurrentLocale()
      } = _j, args = __objRest(_j, [
        "locale"
      ]);
      return createDateFormatter(__spreadValues({ locale }, args));
    };
    const getTimeFormatter = (_k = {}) => {
      var _l = _k, {
        locale = getCurrentLocale()
      } = _l, args = __objRest(_l, [
        "locale"
      ]);
      return createTimeFormatter(__spreadValues({ locale }, args));
    };
    const getMessageFormatter = monadicMemoize(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (message, locale = getCurrentLocale()) => new IntlMessageFormat(message, locale, getOptions().formats, {
        ignoreTag: getOptions().ignoreTag
      })
    );

    const formatMessage = (id, options = {}) => {
      var _a, _b, _c, _d;
      let messageObj = options;
      if (typeof id === "object") {
        messageObj = id;
        id = messageObj.id;
      }
      const {
        values,
        locale = getCurrentLocale(),
        default: defaultValue
      } = messageObj;
      if (locale == null) {
        throw new Error(
          "[svelte-i18n] Cannot format a message without first setting the initial locale."
        );
      }
      let message = lookup(id, locale);
      if (!message) {
        message = (_d = (_c = (_b = (_a = getOptions()).handleMissingMessage) == null ? void 0 : _b.call(_a, { locale, id, defaultValue })) != null ? _c : defaultValue) != null ? _d : id;
      } else if (typeof message !== "string") {
        console.warn(
          `[svelte-i18n] Message with id "${id}" must be of type "string", found: "${typeof message}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`
        );
        return message;
      }
      if (!values) {
        return message;
      }
      let result = message;
      try {
        result = getMessageFormatter(message, locale).format(values);
      } catch (e) {
        if (e instanceof Error) {
          console.warn(
            `[svelte-i18n] Message "${id}" has syntax error:`,
            e.message
          );
        }
      }
      return result;
    };
    const formatTime = (t, options) => {
      return getTimeFormatter(options).format(t);
    };
    const formatDate = (d, options) => {
      return getDateFormatter(options).format(d);
    };
    const formatNumber = (n, options) => {
      return getNumberFormatter(options).format(n);
    };
    const getJSON = (id, locale = getCurrentLocale()) => {
      return lookup(id, locale);
    };
    const $format = derived([$locale, $dictionary], () => formatMessage);
    derived([$locale], () => formatTime);
    derived([$locale], () => formatDate);
    derived([$locale], () => formatNumber);
    derived([$locale, $dictionary], () => getJSON);

    /* stores are used for variables that need to live in many components e.g. shared between components */


    // android, ios, androidSimulator, iosSimulator, webapp
    const store_nativeSystemType = writable('webapp');

    //export const store_customer_email = writable('Johnie Doe');
    const store_customer_email = writable('');

    // export const store_customer_age = writable(1);
    const store_customer_age = writable();
    const store_customer_sex = writable("male");  // male,female
    const store_customer_country = writable('nl');

    const store_eventsInBackLogToBeSendToMongoDB = writable(0);

    const store_alarm = writable(0);

    const currentSelectedDate = writable(new Date());
    const txtSndfilename = writable("alarmsound1.mp3"); // TODO change bridge to use full names 
    const txtVibrate = writable (600000); //600 seconds in milliseconds  (600 sec = 10 minutes)
    const store_min_minutes_valid_night = writable(15);
    //export const store_min_minutes_valid_night = writable(0.5);
    const store_onBoardingDone = writable(0);
    const store_smallOrLargeImageTxt = writable("Phone");
    const store_selectedSound = writable (1);
    const store_UserSavedToRemoteDB = writable(0);

    const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);

    let idbProxyableTypes;
    let cursorAdvanceMethods;
    // This is a function to prevent it throwing up in node environments.
    function getIdbProxyableTypes() {
        return (idbProxyableTypes ||
            (idbProxyableTypes = [
                IDBDatabase,
                IDBObjectStore,
                IDBIndex,
                IDBCursor,
                IDBTransaction,
            ]));
    }
    // This is a function to prevent it throwing up in node environments.
    function getCursorAdvanceMethods() {
        return (cursorAdvanceMethods ||
            (cursorAdvanceMethods = [
                IDBCursor.prototype.advance,
                IDBCursor.prototype.continue,
                IDBCursor.prototype.continuePrimaryKey,
            ]));
    }
    const cursorRequestMap = new WeakMap();
    const transactionDoneMap = new WeakMap();
    const transactionStoreNamesMap = new WeakMap();
    const transformCache = new WeakMap();
    const reverseTransformCache = new WeakMap();
    function promisifyRequest(request) {
        const promise = new Promise((resolve, reject) => {
            const unlisten = () => {
                request.removeEventListener('success', success);
                request.removeEventListener('error', error);
            };
            const success = () => {
                resolve(wrap(request.result));
                unlisten();
            };
            const error = () => {
                reject(request.error);
                unlisten();
            };
            request.addEventListener('success', success);
            request.addEventListener('error', error);
        });
        promise
            .then((value) => {
            // Since cursoring reuses the IDBRequest (*sigh*), we cache it for later retrieval
            // (see wrapFunction).
            if (value instanceof IDBCursor) {
                cursorRequestMap.set(value, request);
            }
            // Catching to avoid "Uncaught Promise exceptions"
        })
            .catch(() => { });
        // This mapping exists in reverseTransformCache but doesn't doesn't exist in transformCache. This
        // is because we create many promises from a single IDBRequest.
        reverseTransformCache.set(promise, request);
        return promise;
    }
    function cacheDonePromiseForTransaction(tx) {
        // Early bail if we've already created a done promise for this transaction.
        if (transactionDoneMap.has(tx))
            return;
        const done = new Promise((resolve, reject) => {
            const unlisten = () => {
                tx.removeEventListener('complete', complete);
                tx.removeEventListener('error', error);
                tx.removeEventListener('abort', error);
            };
            const complete = () => {
                resolve();
                unlisten();
            };
            const error = () => {
                reject(tx.error || new DOMException('AbortError', 'AbortError'));
                unlisten();
            };
            tx.addEventListener('complete', complete);
            tx.addEventListener('error', error);
            tx.addEventListener('abort', error);
        });
        // Cache it for later retrieval.
        transactionDoneMap.set(tx, done);
    }
    let idbProxyTraps = {
        get(target, prop, receiver) {
            if (target instanceof IDBTransaction) {
                // Special handling for transaction.done.
                if (prop === 'done')
                    return transactionDoneMap.get(target);
                // Polyfill for objectStoreNames because of Edge.
                if (prop === 'objectStoreNames') {
                    return target.objectStoreNames || transactionStoreNamesMap.get(target);
                }
                // Make tx.store return the only store in the transaction, or undefined if there are many.
                if (prop === 'store') {
                    return receiver.objectStoreNames[1]
                        ? undefined
                        : receiver.objectStore(receiver.objectStoreNames[0]);
                }
            }
            // Else transform whatever we get back.
            return wrap(target[prop]);
        },
        set(target, prop, value) {
            target[prop] = value;
            return true;
        },
        has(target, prop) {
            if (target instanceof IDBTransaction &&
                (prop === 'done' || prop === 'store')) {
                return true;
            }
            return prop in target;
        },
    };
    function replaceTraps(callback) {
        idbProxyTraps = callback(idbProxyTraps);
    }
    function wrapFunction(func) {
        // Due to expected object equality (which is enforced by the caching in `wrap`), we
        // only create one new func per func.
        // Edge doesn't support objectStoreNames (booo), so we polyfill it here.
        if (func === IDBDatabase.prototype.transaction &&
            !('objectStoreNames' in IDBTransaction.prototype)) {
            return function (storeNames, ...args) {
                const tx = func.call(unwrap(this), storeNames, ...args);
                transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
                return wrap(tx);
            };
        }
        // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
        // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
        // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
        // with real promises, so each advance methods returns a new promise for the cursor object, or
        // undefined if the end of the cursor has been reached.
        if (getCursorAdvanceMethods().includes(func)) {
            return function (...args) {
                // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
                // the original object.
                func.apply(unwrap(this), args);
                return wrap(cursorRequestMap.get(this));
            };
        }
        return function (...args) {
            // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
            // the original object.
            return wrap(func.apply(unwrap(this), args));
        };
    }
    function transformCachableValue(value) {
        if (typeof value === 'function')
            return wrapFunction(value);
        // This doesn't return, it just creates a 'done' promise for the transaction,
        // which is later returned for transaction.done (see idbObjectHandler).
        if (value instanceof IDBTransaction)
            cacheDonePromiseForTransaction(value);
        if (instanceOfAny(value, getIdbProxyableTypes()))
            return new Proxy(value, idbProxyTraps);
        // Return the same value back if we're not going to transform it.
        return value;
    }
    function wrap(value) {
        // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
        // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
        if (value instanceof IDBRequest)
            return promisifyRequest(value);
        // If we've already transformed this value before, reuse the transformed value.
        // This is faster, but it also provides object equality.
        if (transformCache.has(value))
            return transformCache.get(value);
        const newValue = transformCachableValue(value);
        // Not all types are transformed.
        // These may be primitive types, so they can't be WeakMap keys.
        if (newValue !== value) {
            transformCache.set(value, newValue);
            reverseTransformCache.set(newValue, value);
        }
        return newValue;
    }
    const unwrap = (value) => reverseTransformCache.get(value);

    /**
     * Open a database.
     *
     * @param name Name of the database.
     * @param version Schema version.
     * @param callbacks Additional callbacks.
     */
    function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
        const request = indexedDB.open(name, version);
        const openPromise = wrap(request);
        if (upgrade) {
            request.addEventListener('upgradeneeded', (event) => {
                upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
            });
        }
        if (blocked) {
            request.addEventListener('blocked', (event) => blocked(
            // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
            event.oldVersion, event.newVersion, event));
        }
        openPromise
            .then((db) => {
            if (terminated)
                db.addEventListener('close', () => terminated());
            if (blocking) {
                db.addEventListener('versionchange', (event) => blocking(event.oldVersion, event.newVersion, event));
            }
        })
            .catch(() => { });
        return openPromise;
    }

    const readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
    const writeMethods = ['put', 'add', 'delete', 'clear'];
    const cachedMethods = new Map();
    function getMethod(target, prop) {
        if (!(target instanceof IDBDatabase &&
            !(prop in target) &&
            typeof prop === 'string')) {
            return;
        }
        if (cachedMethods.get(prop))
            return cachedMethods.get(prop);
        const targetFuncName = prop.replace(/FromIndex$/, '');
        const useIndex = prop !== targetFuncName;
        const isWrite = writeMethods.includes(targetFuncName);
        if (
        // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
        !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) ||
            !(isWrite || readMethods.includes(targetFuncName))) {
            return;
        }
        const method = async function (storeName, ...args) {
            // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
            const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
            let target = tx.store;
            if (useIndex)
                target = target.index(args.shift());
            // Must reject if op rejects.
            // If it's a write operation, must reject if tx.done rejects.
            // Must reject with op rejection first.
            // Must resolve with op value.
            // Must handle both promises (no unhandled rejections)
            return (await Promise.all([
                target[targetFuncName](...args),
                isWrite && tx.done,
            ]))[0];
        };
        cachedMethods.set(prop, method);
        return method;
    }
    replaceTraps((oldTraps) => ({
        ...oldTraps,
        get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
        has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop),
    }));

    var eTypes;
    (function (eTypes) {
        eTypes["MEASURINGDAY_STARTED"] = "start";
        eTypes["MEASURINGDAY_STOPPED"] = "stop";
        eTypes["LEAK"] = "leak";
        eTypes["APP_INSTALLED"] = "app_installed";
    })(eTypes || (eTypes = {}));
    var eMode;
    (function (eMode) {
        eMode[eMode["WAKE"] = 0] = "WAKE";
        eMode[eMode["SLEEPING"] = 1] = "SLEEPING";
        eMode[eMode["STARTUP"] = 2] = "STARTUP";
        eMode[eMode["SETTINGS"] = 3] = "SETTINGS";
        eMode[eMode["ALARM"] = 4] = "ALARM";
    })(eMode || (eMode = {}));

    //document.body.style.backgroundColor = 'red';
    let store_nativeSystemTypeValue;
    let txtSndfilenameValue;

    txtSndfilename.subscribe(value => {
        txtSndfilenameValue = value;  // only set for now so maybe not needed
      
      });

      txtVibrate.subscribe(value => {
      
      });

    store_alarm.subscribe(value => {

    });

    store_nativeSystemType.subscribe(value => {
        store_nativeSystemTypeValue = value;  // only set for now so maybe not needed
      
      });

    function setSndFile(txtSndFile)
    {
        console.log("setSndFile"+txtSndfilenameValue);
        if (store_nativeSystemTypeValue=="ios")  window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SETSNDFILE"+txtSndfilenameValue});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "SETSNDFILE",
                value: txtSndfilenameValue
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
    }



    function setSound1()
    {
        console.log("setsound1");
        if (store_nativeSystemTypeValue=="ios")  window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SND1"});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "SND1",
                value: 1
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
        txtSndfilename.set("alarmsound1.mp3");
    }

    function setSound2()
    {
        console.log("setsound2");
        if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SND2"});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "SND2",
                value: 1
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
        txtSndfilename.set("alarmsound2.mp3");
       
    }

    function setSound3()
    {
        console.log("setsound3");
        if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SND3"});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "SND3",
                value: 1
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
        txtSndfilename.set("alarmsound3.mp3");
        
    }

    function setSound4()
    {
        console.log("setsound4");
        if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SND4"});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "SND4",
                value: 1
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
        txtSndfilename.set("alarmsound4.mp3");
       
    }

    function setSound5()
    {
        console.log("setsound5");
        if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SND5"});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "SND5",
                value: 1
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
        txtSndfilename.set("alarmsound5.mp3");
       
    }

    function setSoundCustom()
    {
        console.log("setSoundCustom");
        if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SNDCUSTOM"});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "SNDCUSTOM",
                value: 1
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
        txtSndfilename.set("customSnd");
       
    }

    function stopSound()
    {
        console.log("stopsound");
        if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SNDSTOP"});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "SNDSTOP",
                value: 1
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
        
    }

    function recordSound()
    {
        console.log("recordSound");
        if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"RECORDSND"});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "RECORDSND",
                value: 1
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
        
    }

    function stopRecordSound()
    {
        console.log("stopRecordSound");
        if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"STOPRECORDSND"});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "STOPRECORDSND",
                value: 1
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
    }

    function stopSoundDetection()
    {
        console.log("stopSoundDetection");
        if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"STOP"});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "STOP",
                value: 1
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
    }

    function startSoundDetection()
    {
        console.log("startSoundDetection");
        if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"START"});
        if (store_nativeSystemTypeValue == "android")
        {
            var msg = {
                type: "action",
                text: "START",
                value: 1
              };
          // Send the msg object as a JSON-formatted string.
          Android.setActivities(JSON.stringify(msg));
        }
    }
    //AlarmTriggered();
    function AlarmTriggered()
    {
        //beep(); -> this only works if user was interacting with screen
        window.alert("alarm");
        store_alarm.set(1);  
    }
    window.AlarmTriggered = AlarmTriggered;

    let store_min_minutes_valid_nightValue;
    store_min_minutes_valid_night.subscribe(value => {
        store_min_minutes_valid_nightValue = value;
    });
    // phone or tablet 
    function isSmallScreen() {
        var retVal = true;
        let height = window.innerHeight;
        let width = window.innerWidth;
        let ratio = height / width;
        if (ratio > 1.6) {
            retVal = true;
        }
        else {
            retVal = false;
        }
        return retVal;
    }
    function getCustomDateRaw(date) {
        if (!(date instanceof Date)) {
            console.error("Invalid date provided:", date);
            return date; // or handle this case as you see fit
        }
        const nextDay = new Date(date);
        if (date.getHours() >= 18) {
            nextDay.setDate(date.getDate() + 1);
        }
        return nextDay;
    }
    function getCustomDate(date) {
        if (!(date instanceof Date)) {
            console.error("Invalid date provided:", date);
            return ""; // or handle this case as you see fit
        }
        const nextDay = new Date(date);
        if (date.getHours() >= 18) {
            nextDay.setDate(date.getDate() + 1);
        }
        return nextDay.toDateString();
    }
    async function getLeaskOnDate(date) {
        const leaks = await getLeaks();
        const leaksForThisNight = leaks.filter(event => getCustomDate(event.date) === date.toDateString());
        return leaksForThisNight;
    }
    async function getWetNights() {
        const leakNights = await getLeaks();
        // remove double start events at the same day
        const uniqueleakNights = leakNights.filter((event, index, self) => index === self.findIndex(e => getCustomDate(e.date) === getCustomDate(event.date)));
        return uniqueleakNights;
    }
    async function getMeasuredNights() {
        // const db = await openDBlocal('oopsie', 1);
        // const events = await db.getAll('events');
        // db.close();
        // loop over events and filter leak events 
        //const measuredNights: EventOopsie[] = events.filter(event => event.value.type === eTypes.MEASURINGDAY_STARTED);
        const measuredNights = await getStarts();
        const stops = await getStops();
        // remove double start events at the same day
        const uniqueMeasuredNights = measuredNights.filter((event, index, self) => index === self.findIndex(e => getCustomDate(e.date) === getCustomDate(event.date)));
        // Extract the dates from leaksNights
        var stopDates = stops.map(item => getCustomDate(item.date)); // toDateString());
        var filteredNights = uniqueMeasuredNights.filter(item => stopDates.includes(getCustomDate(item.date)));
        return filteredNights;
    }
    async function getDryNights() {
        // if start happend and no leak , then it was a dry night so a star
        var measuringNights = await getMeasuredNights();
        var leaksNights = await getWetNights();
        // Extract the dates from leaksNights
        var leaksDates = leaksNights.map(item => item.date.toDateString());
        // Filter out items from measuringNights that have dates not present in leaksDates
        var filteredNights = measuringNights.filter(item => !leaksDates.includes(item.date.toDateString()));
        // filteredNights now contains items from measuringNights with dates not present in leaksDates
        return filteredNights;
    }
    async function getLevel() {
        // see how many dry nights are there and divide by 2
        // there are 14 levels so 30 dry night will reach the maximum level
        var dryNights = await getDryNights();
        let dryNightsNr = dryNights.length;
        var level = Math.floor(dryNightsNr / 2);
        level = level + 1; // start with level 1 not 0
        if (level < 1)
            level = 1;
        if (level > 14)
            level = 14;
        return level;
    }
    function areDatesSameDay(date1, date2) {
        var retVal = false;
        if (date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()) {
            retVal = true;
        }
        return retVal;
    }
    // export function dayIsaStar(date):boolean {
    //      getDryNights().then(dryNights => {
    //         const onlyThisDay = dryNights.filter(dry => 
    //             areDatesSameDay(new Date(getCustomDate(dry.date)), date)
    //         );
    //         if (onlyThisDay.length > 0) {
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     });
    // }
    async function dayIsaStar(date) {
        var dryNights = await getDryNights();
        const onlyThisDay = dryNights.filter(dry => areDatesSameDay(new Date(getCustomDate(dry.date)), date));
        if (onlyThisDay.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    // calendar needs calendar Items 
    function parseDryNightsIntoStarItems(drys, month) {
        // filter only this month leaks
        var items = [];
        const onlyThisMonth = drys.filter(dry => new Date(getCustomDate(dry.date)).getMonth() === month);
        // convert leak dates to the custom date so > 18:00 is the next day
        for (let dry of onlyThisMonth) {
            const nextDay = new Date(dry.date);
            if (dry.date.getHours() >= 18) {
                nextDay.setDate(dry.date.getDate() + 1);
            }
            dry.date = nextDay;
        }
        // convert to items strings like :  {title:"star", className:"task--primary", date:new Date(y,m,randInt(6)),len:1}
        for (let dry of onlyThisMonth) {
            let item = {
                date: dry.date,
                len: 1,
                title: "star",
                className: "task--primary"
            };
            items.push(item);
        }
        return items;
    }
    // we use month for now, if a customer would use it for 1 year or more it could give problems. (but nodody does !?)
    function parseLeaksIntoItems(leaks, month) {
        // filter only this month leaks
        var items = [];
        const onlyThisMonth = leaks.filter(leak => new Date(getCustomDate(leak.date)).getMonth() === month);
        // convert leak dates to the custom date so > 18:00 is the next day
        for (let leak of onlyThisMonth) {
            const nextDay = new Date(leak.date);
            if (leak.date.getHours() >= 18) {
                nextDay.setDate(leak.date.getDate() + 1);
            }
            leak.date = nextDay;
        }
        // convert to items strings like :  {title:"star",className:"task--primary",date:new Date(y,m,randInt(6)),len:1}
        for (let leak of onlyThisMonth) {
            let item = {
                date: leak.date,
                len: 1,
                title: "leak",
                className: "task--primary"
            };
            items.push(item);
        }
        return items;
    }
    // Function to validate email format
    function validateEmail(userEmail) {
        var emailOK = false;
        // Regular expression for validating email addresses
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (emailRegex.test(userEmail)) {
            // Email is valid
            emailOK = true;
        }
        return emailOK;
    }
    function checkEventsAre_X_minApart(date1, date2) {
        if (date1.getTime() == 0 || date2.getTime() == 0)
            return false;
        const differenceInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
        const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
        return differenceInMinutes >= store_min_minutes_valid_nightValue;
    }

    // for storing data local and remote 
    let store_eventsInBackLogToBeSendToMongoDBValue;
    let dataStorage_blockWriteToDB = true;
    function setDataStorageBlockWriteToDB(value) {
        dataStorage_blockWriteToDB = value;
    }
    // to get things from stores.js 
    // this is a .ts file not a .svelte module so we need to subscribe manualy
    //subscribe means listen to changes, so a call back when someone else changes the store value
    // there are also  update and set if we want to change the value
    // with update you can change the value like this : count.update(n => n + 1);
    // use set when you do not care about the old value: count.set(0);
    // if this module was used in only 1 screen that gets destroyed sometimes use the unsubscribe() method in destroy() 
    // or else there are memory leaks
    // we also use storeUserVal to store the user data in the DB, when we read from the idb DB and asign to the store value,  this will also run the storeUserVal !?
    store_customer_email.subscribe(value => {
        storeUserVal("email", value);
    });
    store_customer_age.subscribe(value => {
        storeUserVal("age", value);
    });
    store_customer_country.subscribe(value => {
        storeUserVal("country", value);
    });
    store_customer_sex.subscribe(value => {
        storeUserVal("sex", value);
    });
    store_eventsInBackLogToBeSendToMongoDB.subscribe(value => {
        store_eventsInBackLogToBeSendToMongoDBValue = value;
    });
    txtSndfilename.subscribe(value => {
        storeSettingsVal("txtSndfilename", value);
        setSndFile();
    });
    store_onBoardingDone.subscribe(value => {
        storeSettingsVal("store_onBoardingDone", value);
    });
    store_selectedSound.subscribe(value => {
        storeSettingsVal("sound", value);
    });
    async function storeUserVal(idStr, val) {
        if (!dataStorage_blockWriteToDB) {
            const db2 = await openDB('oopsie', 1);
            await db2.put('user', { id: idStr, value: val });
            await db2.put('user', { id: "savedToDB", value: false });
            db2.close();
        }
    }
    async function storeSettingsVal(idStr, val) {
        if (!dataStorage_blockWriteToDB) {
            const db2 = await openDB('oopsie', 1);
            await db2.put('settings', { id: idStr, value: val });
            db2.close();
        }
    }
    async function getLeaks() {
        const db = await openDB('oopsie', 1);
        const events = await db.getAll('events');
        db.close();
        // loop over events and filter leak events 
        var leaks = events.filter(event => event.value.type === eTypes.LEAK);
        // we get now something like this : {id: 3, value: {…}}  , so only get value, this contains the EventOopsie structure
        leaks = leaks.map(item => item.value);
        return leaks;
    }
    async function getStarts() {
        const db = await openDB('oopsie', 1);
        const events = await db.getAll('events');
        db.close();
        // loop over events and filter leak events 
        var starts = events.filter(event => event.value.type === eTypes.MEASURINGDAY_STARTED);
        // we get now something like this : {id: 3, value: {…}}  , so only get value, this contains the EventOopsie structure
        starts = starts.map(item => item.value);
        return starts;
    }
    async function getStops() {
        const db = await openDB('oopsie', 1);
        const events = await db.getAll('events');
        db.close();
        // loop over events and filter leak events 
        var stops = events.filter(event => event.value.type === eTypes.MEASURINGDAY_STOPPED);
        // we get now something like this : {id: 3, value: {…}}  , so only get value, this contains the EventOopsie structure
        stops = stops.map(item => item.value);
        return stops;
    }
    async function addEventLocal(event) {
        const db = await openDB('oopsie', 1);
        // Retrieve the last used key value from the database (assuming the store name is 'events')
        const lastUsedKey = await db.count('events');
        // Increment the retrieved value to get the new key for the next entry
        const newKey = lastUsedKey + 1;
        var counter = store_eventsInBackLogToBeSendToMongoDBValue;
        db.put('events', { id: newKey, value: event });
        counter++;
        store_eventsInBackLogToBeSendToMongoDB.set(counter);
        db.close();
    }
    // async function deleteEventLocal(event: EventOopsie) {
    //   // open IDB database
    //   const db = await openDBlocal('oopsie', 1);
    //   // get all events
    //   const allEvents = await db.getAll('events');
    //   // search for event given by the function parameter
    //   // delete this event if found
    //   db.delete('events', { id: number, value: event }); 
    //   // close DB
    //   db.close();
    // }
    //delete the leakage date time when delete_icon is clicked
    async function deleteEventLocal(eventData) {
        // Open the IDB database
        const db = await openDB('oopsie', 1);
        try {
            // Get all events from the 'events' store
            const allEvents = await db.getAll('events');
            // Find the event with matching data
            const eventToDelete = allEvents.find((event) => {
                // check if the date/time is exactly the same.
                // no need to check for event type like leak/start/stop
                let customDate = getCustomDateRaw(event.value.date);
                if (event.value.type == "leak") {
                    console.log("sameday");
                    if (customDate.getTime() == eventData.date.getTime()) {
                        console.log("the same");
                        console.log("");
                    }
                    return customDate.getTime() == eventData.date.getTime();
                }
            });
            if (eventToDelete) {
                // If the event is found, delete it
                await db.delete('events', eventToDelete.id);
                console.log('Event deleted:', eventToDelete);
            }
            else {
                console.log('Event not found.');
            }
        }
        catch (error) {
            console.error('Error deleting event:', error);
        }
        finally {
            // Close the database
            db.close();
        }
    }
    async function createAndStoreLeak(dateAndTime) {
        var event = { type: eTypes.LEAK, value: 0, date: dateAndTime, extra_info: "" };
        await addEventLocal(event);
    }
    async function createAndStoreStart(dateAndTime) {
        var event = { type: eTypes.MEASURINGDAY_STARTED, value: 0, date: dateAndTime, extra_info: "" };
        await addEventLocal(event);
    }
    async function createAndStoreStop(dateAndTime) {
        var event = { type: eTypes.MEASURINGDAY_STOPPED, value: 0, date: dateAndTime, extra_info: "" };
        await addEventLocal(event);
    }

    /* src\components\ButtonWithIcon.svelte generated by Svelte v3.59.2 */

    const { console: console_1$8 } = globals;
    const file$b = "src\\components\\ButtonWithIcon.svelte";

    // (76:12) {:else}
    function create_else_block$3(ctx) {
    	let svg;
    	let path;
    	let t0;
    	let t1_value = /*$_*/ ctx[2]("HomeScreen.Go to sleep") + "";
    	let t1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(path, "fill", "#FFFFFF");
    			attr_dev(path, "d", "M49.06,1.27c2.17-0.45,4.34-0.77,6.48-0.98c2.2-0.21,4.38-0.31,6.53-0.29c1.21,0.01,2.18,1,2.17,2.21 c-0.01,0.93-0.6,1.72-1.42,2.03c-9.15,3.6-16.47,10.31-20.96,18.62c-4.42,8.17-6.1,17.88-4.09,27.68l0.01,0.07 c2.29,11.06,8.83,20.15,17.58,25.91c8.74,5.76,19.67,8.18,30.73,5.92l0.07-0.01c7.96-1.65,14.89-5.49,20.3-10.78 c5.6-5.47,9.56-12.48,11.33-20.16c0.27-1.18,1.45-1.91,2.62-1.64c0.89,0.21,1.53,0.93,1.67,1.78c2.64,16.2-1.35,32.07-10.06,44.71 c-8.67,12.58-22.03,21.97-38.18,25.29c-16.62,3.42-33.05-0.22-46.18-8.86C14.52,104.1,4.69,90.45,1.27,73.83 C-2.07,57.6,1.32,41.55,9.53,28.58C17.78,15.57,30.88,5.64,46.91,1.75c0.31-0.08,0.67-0.16,1.06-0.25l0.01,0l0,0L49.06,1.27 L49.06,1.27z M51.86,5.2c-0.64,0.11-1.28,0.23-1.91,0.36l-1.01,0.22l0,0c-0.29,0.07-0.63,0.14-1,0.23 c-14.88,3.61-27.05,12.83-34.7,24.92C5.61,42.98,2.46,57.88,5.56,72.94c3.18,15.43,12.31,28.11,24.51,36.15 c12.19,8.03,27.45,11.41,42.88,8.23c15-3.09,27.41-11.81,35.46-23.49c6.27-9.09,9.9-19.98,10.09-31.41 c-2.27,4.58-5.3,8.76-8.96,12.34c-6,5.86-13.69,10.13-22.51,11.95l-0.01,0c-12.26,2.52-24.38-0.16-34.07-6.54 c-9.68-6.38-16.93-16.45-19.45-28.7l0-0.01C31.25,40.58,33.1,29.82,38,20.77C41.32,14.63,46.05,9.27,51.86,5.2L51.86,5.2z");
    			add_location(path, file$b, 77, 4, 1695);
    			attr_dev(svg, "class", "m1 svelte-qo8tz9");
    			attr_dev(svg, "width", "3vw");
    			attr_dev(svg, "viewBox", "0 0 122.88 122.89");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$b, 76, 3, 1595);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 4 && t1_value !== (t1_value = /*$_*/ ctx[2]("HomeScreen.Go to sleep") + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(76:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (74:12) {#if modeI === 4}
    function create_if_block_1$4(ctx) {
    	let span;
    	let t_value = /*$_*/ ctx[2]("SettingsScreen.Stop alarm") + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "marges svelte-qo8tz9");
    			add_location(span, file$b, 74, 16, 1506);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 4 && t_value !== (t_value = /*$_*/ ctx[2]("SettingsScreen.Stop alarm") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(74:12) {#if modeI === 4}",
    		ctx
    	});

    	return block;
    }

    // (69:8) {#if modeI === 1}
    function create_if_block$7(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let t1_value = /*$_*/ ctx[2]("HomeScreen.Wake up") + "";
    	let t1;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			t1 = text(t1_value);
    			if (!src_url_equal(img.src, img_src_value = /*light_icon*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Light Icon");
    			attr_dev(img, "class", "m2 svelte-qo8tz9");
    			add_location(img, file$b, 70, 8, 1351);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 4 && t1_value !== (t1_value = /*$_*/ ctx[2]("HomeScreen.Wake up") + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(69:8) {#if modeI === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let button;
    	let span;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*modeI*/ ctx[0] === 1) return create_if_block$7;
    		if (/*modeI*/ ctx[0] === 4) return create_if_block_1$4;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			if_block.c();
    			attr_dev(span, "class", "marges svelte-qo8tz9");
    			add_location(span, file$b, 67, 4, 1290);
    			attr_dev(button, "class", button_class_value = "button " + (/*modeI*/ ctx[0] === 1 ? 'orange' : '') + " svelte-qo8tz9");
    			add_location(button, file$b, 64, 0, 1178);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			if_block.m(span, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*test*/ ctx[3], false, false, false, false),
    					listen_dev(
    						button,
    						"keypress",
    						function () {
    							if (is_function(/*onButtonClick*/ ctx[1])) /*onButtonClick*/ ctx[1].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}

    			if (dirty & /*modeI*/ 1 && button_class_value !== (button_class_value = "button " + (/*modeI*/ ctx[0] === 1 ? 'orange' : '') + " svelte-qo8tz9")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $_;
    	validate_store($format, '_');
    	component_subscribe($$self, $format, $$value => $$invalidate(2, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ButtonWithIcon', slots, []);
    	const dispatch = createEventDispatcher();
    	let { modeI } = $$props;

    	let { onButtonClick = () => {
    		
    	} } = $$props;

    	function test() {
    		console.log("test");
    		dispatch("click");
    		console.log(modeI);
    	}

    	let imagePrefix = "build/images/backgrounds/";
    	let light_icon = imagePrefix + "light_icon" + ".svg";
    	console.log("mounted");

    	$$self.$$.on_mount.push(function () {
    		if (modeI === undefined && !('modeI' in $$props || $$self.$$.bound[$$self.$$.props['modeI']])) {
    			console_1$8.warn("<ButtonWithIcon> was created without expected prop 'modeI'");
    		}
    	});

    	const writable_props = ['modeI', 'onButtonClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$8.warn(`<ButtonWithIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('modeI' in $$props) $$invalidate(0, modeI = $$props.modeI);
    		if ('onButtonClick' in $$props) $$invalidate(1, onButtonClick = $$props.onButtonClick);
    	};

    	$$self.$capture_state = () => ({
    		_: $format,
    		locale: $locale,
    		locales: $locales,
    		createEventDispatcher,
    		eMode,
    		dispatch,
    		modeI,
    		onButtonClick,
    		test,
    		imagePrefix,
    		light_icon,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('modeI' in $$props) $$invalidate(0, modeI = $$props.modeI);
    		if ('onButtonClick' in $$props) $$invalidate(1, onButtonClick = $$props.onButtonClick);
    		if ('imagePrefix' in $$props) imagePrefix = $$props.imagePrefix;
    		if ('light_icon' in $$props) $$invalidate(4, light_icon = $$props.light_icon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modeI, onButtonClick, $_, test, light_icon];
    }

    class ButtonWithIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$c, create_fragment$c, safe_not_equal, { modeI: 0, onButtonClick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonWithIcon",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get modeI() {
    		throw new Error("<ButtonWithIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modeI(value) {
    		throw new Error("<ButtonWithIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onButtonClick() {
    		throw new Error("<ButtonWithIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onButtonClick(value) {
    		throw new Error("<ButtonWithIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\routes\HomeScreen.svelte generated by Svelte v3.59.2 */

    const { console: console_1$7 } = globals;
    const file$a = "src\\routes\\HomeScreen.svelte";

    // (87:2) {#if mode == eMode.WAKE}
    function create_if_block_1$3(ctx) {
    	let a0;
    	let t;
    	let a1;

    	const block = {
    		c: function create() {
    			a0 = element("a");
    			t = space();
    			a1 = element("a");
    			attr_dev(a0, "class", "Hamburger HamburgImage svelte-129nikn");
    			attr_dev(a0, "href", "#/SettingsScreen");
    			add_location(a0, file$a, 87, 4, 3804);
    			attr_dev(a1, "class", "Calendar CalendarImage svelte-129nikn");
    			attr_dev(a1, "href", "#/CalendarScreen");
    			add_location(a1, file$a, 89, 4, 3872);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(a1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(87:2) {#if mode == eMode.WAKE}",
    		ctx
    	});

    	return block;
    }

    // (93:2) {#if $store_alarm == 1}
    function create_if_block$6(ctx) {
    	let h1;
    	let t_value = /*$_*/ ctx[4]("HomeScreen.Alarm") + "";
    	let t;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = text(t_value);
    			add_location(h1, file$a, 93, 4, 3976);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 16 && t_value !== (t_value = /*$_*/ ctx[4]("HomeScreen.Alarm") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(93:2) {#if $store_alarm == 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div2;
    	let t0;
    	let t1;
    	let div0;
    	let buttonwithicon;
    	let t2;
    	let div1;
    	let div1_style_value;
    	let div2_style_value;
    	let current;
    	let if_block0 = /*mode*/ ctx[3] == eMode.WAKE && create_if_block_1$3(ctx);
    	let if_block1 = /*$store_alarm*/ ctx[0] == 1 && create_if_block$6(ctx);

    	buttonwithicon = new ButtonWithIcon({
    			props: { modeI: /*mode*/ ctx[3] },
    			$$inline: true
    		});

    	buttonwithicon.$on("click", /*ButtonClick*/ ctx[5]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			create_component(buttonwithicon.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "Button center svelte-129nikn");
    			add_location(div0, file$a, 95, 2, 4022);
    			attr_dev(div1, "class", "BoyGirl BoyImage svelte-129nikn");
    			attr_dev(div1, "style", div1_style_value = "height : 100%; width:100%; background-image: url(" + /*image_url_boyGirl*/ ctx[2] + ");");
    			add_location(div1, file$a, 98, 2, 4123);
    			attr_dev(div2, "class", "container bg svelte-129nikn");
    			attr_dev(div2, "style", div2_style_value = "height : 100%; width:100%; background-image: url(" + /*bg_image_url*/ ctx[1] + ");");
    			add_location(div2, file$a, 82, 0, 3662);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t0);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			mount_component(buttonwithicon, div0, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*mode*/ ctx[3] == eMode.WAKE) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$store_alarm*/ ctx[0] == 1) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					if_block1.m(div2, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			const buttonwithicon_changes = {};
    			if (dirty & /*mode*/ 8) buttonwithicon_changes.modeI = /*mode*/ ctx[3];
    			buttonwithicon.$set(buttonwithicon_changes);

    			if (!current || dirty & /*image_url_boyGirl*/ 4 && div1_style_value !== (div1_style_value = "height : 100%; width:100%; background-image: url(" + /*image_url_boyGirl*/ ctx[2] + ");")) {
    				attr_dev(div1, "style", div1_style_value);
    			}

    			if (!current || dirty & /*bg_image_url*/ 2 && div2_style_value !== (div2_style_value = "height : 100%; width:100%; background-image: url(" + /*bg_image_url*/ ctx[1] + ");")) {
    				attr_dev(div2, "style", div2_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttonwithicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttonwithicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(buttonwithicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $store_customer_sex;
    	let $store_onBoardingDone;
    	let $store_alarm;
    	let $store_smallOrLargeImageTxt;
    	let $_;
    	validate_store(store_customer_sex, 'store_customer_sex');
    	component_subscribe($$self, store_customer_sex, $$value => $$invalidate(7, $store_customer_sex = $$value));
    	validate_store(store_onBoardingDone, 'store_onBoardingDone');
    	component_subscribe($$self, store_onBoardingDone, $$value => $$invalidate(8, $store_onBoardingDone = $$value));
    	validate_store(store_alarm, 'store_alarm');
    	component_subscribe($$self, store_alarm, $$value => $$invalidate(0, $store_alarm = $$value));
    	validate_store(store_smallOrLargeImageTxt, 'store_smallOrLargeImageTxt');
    	component_subscribe($$self, store_smallOrLargeImageTxt, $$value => $$invalidate(9, $store_smallOrLargeImageTxt = $$value));
    	validate_store($format, '_');
    	component_subscribe($$self, $format, $$value => $$invalidate(4, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HomeScreen', slots, []);
    	var smallOrLargeImageTxt = isSmallScreen() ? "Phone" : "Tablet"; // Phone or Tablet
    	set_store_value(store_smallOrLargeImageTxt, $store_smallOrLargeImageTxt = smallOrLargeImageTxt, $store_smallOrLargeImageTxt);
    	let imagePrefix = "build/images/";
    	let bg_image_url = imagePrefix + "Dag-oepsie" + ".svg";
    	let image_url_boyGirl = imagePrefix + "boy.png";
    	console.log(bg_image_url);
    	let mode = eMode.WAKE;
    	var latestEventDate = new Date(null);

    	function alarmScreen(alarm) {
    		console.log("alarm functions");

    		if (alarm == 1) {
    			set_store_value(store_alarm, $store_alarm = 0, $store_alarm); // reset store value

    			//push('/alarmScreen');
    			$$invalidate(3, mode = eMode.ALARM);

    			$$invalidate(1, bg_image_url = "build/images/background_alarm_" + smallOrLargeImageTxt + ".jpg");
    			let date = new Date();

    			if (checkEventsAre_X_minApart(date, latestEventDate)) {
    				createAndStoreLeak(new Date());
    			}
    		}
    	}

    	console.log("loading");

    	onMount(() => {
    		console.log("mounted");

    		// next statement not really needed only if loading from localDB is to slow..
    		setDataStorageBlockWriteToDB(false); // we had to disable writing to local DB, since we automated that changes to some store elements are then also saved to localDB (but first time init of stores  is always triggering)

    		//createAndStoreLeak(new Date())
    		//TEST_createSomeEventsThisMonthAndStoreInLocalDB();
    		var a = getMeasuredNights();

    		console.log("measured nights", a);

    		if ($store_onBoardingDone != 1) {
    			push("#/OnboardingScreen");
    		}

    		if ($store_customer_sex == "female") {
    			$$invalidate(2, image_url_boyGirl = imagePrefix + "girl.png");
    		}
    	});

    	function ButtonClick() {
    		stopSound();
    		console.log("clicked");

    		if (mode == eMode.WAKE) {
    			$$invalidate(3, mode = eMode.SLEEPING);

    			getLevel().then(levelNr => {
    				$$invalidate(1, bg_image_url = "build/images/backgrounds/sleepBackgroundLev" + levelNr.toString() + smallOrLargeImageTxt + ".png");
    				latestEventDate = new Date();
    				createAndStoreStart(latestEventDate); // no await needed! its non blocking
    				startSoundDetection();
    			});
    		} else {
    			if (mode == eMode.SLEEPING) {
    				if (checkEventsAre_X_minApart(new Date(), latestEventDate)) {
    					push("#/StarScreen");
    				}
    			}

    			if (checkEventsAre_X_minApart(new Date(), latestEventDate)) {
    				createAndStoreStop(new Date());
    			} // stop should only occur if there was no leak, leak will change

    			stopSoundDetection();
    			$$invalidate(3, mode = eMode.WAKE);
    			$$invalidate(1, bg_image_url = imagePrefix + "Dag-oepsie" + ".svg");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$7.warn(`<HomeScreen> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		_: $format,
    		onMount,
    		store_alarm,
    		store_onBoardingDone,
    		store_smallOrLargeImageTxt,
    		store_customer_sex,
    		setDataStorageBlockWriteToDB,
    		createAndStoreStart,
    		createAndStoreStop,
    		createAndStoreLeak,
    		ButtonWithIcon,
    		eMode,
    		getMeasuredNights,
    		getLevel,
    		isSmallScreen,
    		checkEventsAre_X_minApart,
    		stopSound,
    		startSoundDetection,
    		stopSoundDetection,
    		push,
    		smallOrLargeImageTxt,
    		imagePrefix,
    		bg_image_url,
    		image_url_boyGirl,
    		mode,
    		latestEventDate,
    		alarmScreen,
    		ButtonClick,
    		$store_customer_sex,
    		$store_onBoardingDone,
    		$store_alarm,
    		$store_smallOrLargeImageTxt,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('smallOrLargeImageTxt' in $$props) smallOrLargeImageTxt = $$props.smallOrLargeImageTxt;
    		if ('imagePrefix' in $$props) imagePrefix = $$props.imagePrefix;
    		if ('bg_image_url' in $$props) $$invalidate(1, bg_image_url = $$props.bg_image_url);
    		if ('image_url_boyGirl' in $$props) $$invalidate(2, image_url_boyGirl = $$props.image_url_boyGirl);
    		if ('mode' in $$props) $$invalidate(3, mode = $$props.mode);
    		if ('latestEventDate' in $$props) latestEventDate = $$props.latestEventDate;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$store_alarm*/ 1) {
    			alarmScreen($store_alarm); // if store_alarm changes alarmScreen() is automatically called by svelte.  Watch out that stores.js is not init as first component by svelte so in the beginning this can trigger a call when stores.js is inited.
    		}
    	};

    	return [$store_alarm, bg_image_url, image_url_boyGirl, mode, $_, ButtonClick];
    }

    class HomeScreen$8 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HomeScreen",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\Calendar.svelte generated by Svelte v3.59.2 */
    const file$9 = "src\\components\\Calendar.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (14:1) {#each headers as header}
    function create_each_block_2(ctx) {
    	let span;
    	let t_value = /*header*/ ctx[14] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*header*/ ctx[14]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "day-name svelte-487u7r");
    			add_location(span, file$9, 14, 1, 261);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*headers*/ 1 && t_value !== (t_value = /*header*/ ctx[14] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(14:1) {#each headers as header}",
    		ctx
    	});

    	return block;
    }

    // (21:2) {:else}
    function create_else_block$2(ctx) {
    	let span;
    	let t_value = /*day*/ ctx[11].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[6](/*day*/ ctx[11]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "day day-disabled svelte-487u7r");
    			add_location(span, file$9, 21, 3, 496);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler_2, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*days*/ 2 && t_value !== (t_value = /*day*/ ctx[11].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(21:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:2) {#if day.enabled}
    function create_if_block_4$2(ctx) {
    	let span;
    	let t_value = /*day*/ ctx[11].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[5](/*day*/ ctx[11]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "day svelte-487u7r");
    			add_location(span, file$9, 19, 3, 405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*days*/ 2 && t_value !== (t_value = /*day*/ ctx[11].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(19:2) {#if day.enabled}",
    		ctx
    	});

    	return block;
    }

    // (18:1) {#each days as day}
    function create_each_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*day*/ ctx[11].enabled) return create_if_block_4$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(18:1) {#each days as day}",
    		ctx
    	});

    	return block;
    }

    // (35:6) {#if item.title == "star"}
    function create_if_block_3$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "build/images/star_icon.svg")) attr_dev(img, "src", img_src_value);
    			set_style(img, "height", "90%");
    			set_style(img, "width", "90%");
    			attr_dev(img, "alt", "star");
    			add_location(img, file$9, 35, 6, 930);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(35:6) {#if item.title == \\\"star\\\"}",
    		ctx
    	});

    	return block;
    }

    // (39:6) {#if item.title == "leak"}
    function create_if_block_2$2(ctx) {
    	let svg;
    	let g;
    	let circle;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "40");
    			attr_dev(circle, "stroke", "white");
    			attr_dev(circle, "stroke-width", "2");
    			attr_dev(circle, "fill", "blue");
    			add_location(circle, file$9, 43, 9, 1324);
    			add_location(g, file$9, 42, 8, 1310);
    			set_style(svg, "height", "90%");
    			set_style(svg, "width", "90% ");
    			set_style(svg, "max-width", "100px");
    			attr_dev(svg, "fill", "#FFFFFF");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$9, 39, 6, 1068);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, circle);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(39:6) {#if item.title == \\\"leak\\\"}",
    		ctx
    	});

    	return block;
    }

    // (49:7) {#if item.title == "circle"}
    function create_if_block_1$2(ctx) {
    	let svg;
    	let g;
    	let circle;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "40");
    			attr_dev(circle, "stroke", "white");
    			attr_dev(circle, "stroke-width", "12");
    			attr_dev(circle, "fill", "none");
    			add_location(circle, file$9, 53, 11, 1754);
    			add_location(g, file$9, 52, 9, 1738);
    			set_style(svg, "height", "90%");
    			set_style(svg, "width", "90% ");
    			set_style(svg, "max-width", "100px");
    			attr_dev(svg, "fill", "#FFFFFF");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$9, 49, 7, 1491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, circle);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(49:7) {#if item.title == \\\"circle\\\"}",
    		ctx
    	});

    	return block;
    }

    // (59:3) {#if item.detailHeader}
    function create_if_block$5(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*item*/ ctx[8].detailHeader + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*item*/ ctx[8].detailContent + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			attr_dev(h2, "class", "svelte-487u7r");
    			add_location(h2, file$9, 60, 4, 1943);
    			attr_dev(p, "class", "svelte-487u7r");
    			add_location(p, file$9, 61, 4, 1977);
    			attr_dev(div, "class", "task-detail svelte-487u7r");
    			add_location(div, file$9, 59, 3, 1912);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 4 && t0_value !== (t0_value = /*item*/ ctx[8].detailHeader + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*items*/ 4 && t2_value !== (t2_value = /*item*/ ctx[8].detailContent + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(59:3) {#if item.detailHeader}",
    		ctx
    	});

    	return block;
    }

    // (26:1) {#each items as item}
    function create_each_block$1(ctx) {
    	let section;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let section_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[8].title == "star" && create_if_block_3$2(ctx);
    	let if_block1 = /*item*/ ctx[8].title == "leak" && create_if_block_2$2(ctx);
    	let if_block2 = /*item*/ ctx[8].title == "circle" && create_if_block_1$2(ctx);
    	let if_block3 = /*item*/ ctx[8].detailHeader && create_if_block$5(ctx);

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[7](/*item*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			attr_dev(section, "class", section_class_value = "task " + /*item*/ ctx[8].className + " svelte-487u7r");
    			set_style(section, "grid-column", /*item*/ ctx[8].startCol + " / span " + /*item*/ ctx[8].len);
    			set_style(section, "grid-row", /*item*/ ctx[8].startRow);
    			set_style(section, "align-self", /*item*/ ctx[8].isBottom ? 'end' : 'center');
    			add_location(section, file$9, 26, 2, 635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t0);
    			if (if_block1) if_block1.m(section, null);
    			append_dev(section, t1);
    			if (if_block2) if_block2.m(section, null);
    			append_dev(section, t2);
    			if (if_block3) if_block3.m(section, null);
    			append_dev(section, t3);

    			if (!mounted) {
    				dispose = listen_dev(section, "click", click_handler_3, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*item*/ ctx[8].title == "star") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					if_block0.m(section, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[8].title == "leak") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					if_block1.m(section, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[8].title == "circle") {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_1$2(ctx);
    					if_block2.c();
    					if_block2.m(section, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*item*/ ctx[8].detailHeader) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$5(ctx);
    					if_block3.c();
    					if_block3.m(section, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*items*/ 4 && section_class_value !== (section_class_value = "task " + /*item*/ ctx[8].className + " svelte-487u7r")) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (dirty & /*items*/ 4) {
    				set_style(section, "grid-column", /*item*/ ctx[8].startCol + " / span " + /*item*/ ctx[8].len);
    			}

    			if (dirty & /*items*/ 4) {
    				set_style(section, "grid-row", /*item*/ ctx[8].startRow);
    			}

    			if (dirty & /*items*/ 4) {
    				set_style(section, "align-self", /*item*/ ctx[8].isBottom ? 'end' : 'center');
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(26:1) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let each_value_2 = /*headers*/ ctx[0];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*days*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*items*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t0 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "calendar svelte-487u7r");
    			add_location(div, file$9, 12, 0, 208);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				if (each_blocks_2[i]) {
    					each_blocks_2[i].m(div, null);
    				}
    			}

    			append_dev(div, t0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div, null);
    				}
    			}

    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, headers*/ 9) {
    				each_value_2 = /*headers*/ ctx[0];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div, t0);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*dispatch, days*/ 10) {
    				each_value_1 = /*days*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div, t1);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*items, dispatch*/ 12) {
    				each_value = /*items*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Calendar', slots, []);
    	let { headers = [] } = $$props;
    	let { days = [] } = $$props;
    	let { items = [] } = $$props;
    	let dispatch = createEventDispatcher();
    	const writable_props = ['headers', 'days', 'items'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Calendar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = header => dispatch('headerClick', header);
    	const click_handler_1 = day => dispatch('dayClick', day);
    	const click_handler_2 = day => dispatch('dayClick', day);
    	const click_handler_3 = item => dispatch('itemClick', item);

    	$$self.$$set = $$props => {
    		if ('headers' in $$props) $$invalidate(0, headers = $$props.headers);
    		if ('days' in $$props) $$invalidate(1, days = $$props.days);
    		if ('items' in $$props) $$invalidate(2, items = $$props.items);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		headers,
    		days,
    		items,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('headers' in $$props) $$invalidate(0, headers = $$props.headers);
    		if ('days' in $$props) $$invalidate(1, days = $$props.days);
    		if ('items' in $$props) $$invalidate(2, items = $$props.items);
    		if ('dispatch' in $$props) $$invalidate(3, dispatch = $$props.dispatch);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		headers,
    		days,
    		items,
    		dispatch,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Calendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$a, create_fragment$a, safe_not_equal, { headers: 0, days: 1, items: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calendar",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get headers() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headers(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get days() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set days(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\LSGCalendar.svelte generated by Svelte v3.59.2 */

    const { console: console_1$6 } = globals;
    const file$8 = "src\\components\\LSGCalendar.svelte";

    function create_fragment$9(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let button0;
    	let t1;
    	let t2_value = /*monthNames*/ ctx[5][/*month*/ ctx[1]] + "";
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let button1;
    	let t7;
    	let calendar;
    	let current;
    	let mounted;
    	let dispose;

    	calendar = new Calendar({
    			props: {
    				headers: /*headers*/ ctx[2],
    				days: /*days*/ ctx[3],
    				items: /*items*/ ctx[4]
    			},
    			$$inline: true
    		});

    	calendar.$on("dayClick", /*dayClick_handler*/ ctx[12]);
    	calendar.$on("itemClick", /*itemClick_handler*/ ctx[13]);
    	calendar.$on("headerClick", /*headerClick_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			button0 = element("button");
    			button0.textContent = "<";
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(/*year*/ ctx[0]);
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = ">";
    			t7 = space();
    			create_component(calendar.$$.fragment);
    			set_style(button0, "font-family", "Arial");
    			set_style(button0, "font-size", "12px");
    			set_style(button0, "background-color", "transparent");
    			set_style(button0, "color", "white");
    			attr_dev(button0, "class", "svelte-hbeumt");
    			add_location(button0, file$8, 184, 6, 7399);
    			set_style(button1, "background-color", "transparent");
    			set_style(button1, "color", "white");
    			attr_dev(button1, "class", "svelte-hbeumt");
    			add_location(button1, file$8, 186, 6, 7574);
    			attr_dev(h1, "class", "svelte-hbeumt");
    			add_location(h1, file$8, 182, 4, 7379);
    			attr_dev(div0, "class", "calendar-header svelte-hbeumt");
    			add_location(div0, file$8, 181, 2, 7344);
    			attr_dev(div1, "class", "calendar-container svelte-hbeumt");
    			set_style(div1, "font-family", "Arial");
    			add_location(div1, file$8, 180, 0, 7279);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, button0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(h1, t3);
    			append_dev(h1, t4);
    			append_dev(h1, t5);
    			append_dev(h1, button1);
    			append_dev(div1, t7);
    			mount_component(calendar, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[10], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[11], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*month*/ 2) && t2_value !== (t2_value = /*monthNames*/ ctx[5][/*month*/ ctx[1]] + "")) set_data_dev(t2, t2_value);
    			if (!current || dirty & /*year*/ 1) set_data_dev(t4, /*year*/ ctx[0]);
    			const calendar_changes = {};
    			if (dirty & /*headers*/ 4) calendar_changes.headers = /*headers*/ ctx[2];
    			if (dirty & /*days*/ 8) calendar_changes.days = /*days*/ ctx[3];
    			if (dirty & /*items*/ 16) calendar_changes.items = /*items*/ ctx[4];
    			calendar.$set(calendar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(calendar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(calendar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(calendar);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function randInt(max) {
    	return Math.floor(Math.random() * max) + 1;
    }

    function itemClick(e) {
    	
    }

    function headerClick(e) {
    	
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $currentSelectedDate;
    	let $_;
    	validate_store(currentSelectedDate, 'currentSelectedDate');
    	component_subscribe($$self, currentSelectedDate, $$value => $$invalidate(9, $currentSelectedDate = $$value));
    	validate_store($format, '_');
    	component_subscribe($$self, $format, $$value => $$invalidate(15, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LSGCalendar', slots, []);

    	var dayNames = [
    		$_("CalendarScreen.Sun"),
    		$_("CalendarScreen.Mon"),
    		$_("CalendarScreen.Tue"),
    		$_("CalendarScreen.Wed"),
    		$_("CalendarScreen.Thu"),
    		$_("CalendarScreen.Fri"),
    		$_("CalendarScreen.Sat")
    	];

    	let monthNames = [
    		$_("CalendarScreen.January"),
    		$_("CalendarScreen.February"),
    		$_("CalendarScreen.March"),
    		$_("CalendarScreen.April"),
    		$_("CalendarScreen.May"),
    		$_("CalendarScreen.June"),
    		$_("CalendarScreen.July"),
    		$_("CalendarScreen.August"),
    		$_("CalendarScreen.September"),
    		$_("CalendarScreen.October"),
    		$_("CalendarScreen.November"),
    		$_("CalendarScreen.December")
    	];

    	let headers = [];
    	let now = new Date();
    	let year = now.getFullYear(); //	this is the month & year displayed
    	let month = now.getMonth();
    	let eventText = "";
    	var days = []; //	The days to display in each box

    	//	The Calendar Component just displays stuff in a row & column. It has no knowledge of dates.
    	//	The items[] below are placed (by you) in a specified row & column of the calendar.
    	//	You need to call findRowCol() to calc the row/col based on each items start date. Each date box has a Date() property.
    	//	And, if an item overlaps rows, then you need to add a 2nd item on the subsequent row.
    	var items = [];

    	onMount(() => {
    		
    	});

    	function initMonthItems() {
    		$$invalidate(4, items = []);

    		let item = {
    			date: $currentSelectedDate,
    			len: 1,
    			title: "circle",
    			className: "task--primary"
    		};

    		items.push(item);

    		for (let i of items) {
    			let rc = findRowCol(i.date);

    			if (rc == null) {
    				console.log('didn`t find date for ', i);
    				console.log(i.date);
    				console.log(days);
    				i.title = "";
    				i.startCol = i.startRow = 0;
    			} else {
    				i.startCol = rc.col;
    				i.startRow = rc.row;
    			}
    		}

    		getDryNights().then(drys => {
    			$$invalidate(4, items = [...items, ...parseDryNightsIntoStarItems(drys, month)]);

    			// This is where you calc the row/col to put each dated item
    			for (let i of items) {
    				let rc = findRowCol(i.date);

    				if (rc == null) {
    					console.log('didn`t find date for ', i);
    					console.log(i.date);
    					console.log(days);
    					i.startCol = i.startRow = 0;
    				} else {
    					i.startCol = rc.col;
    					i.startRow = rc.row;
    				}
    			}
    		}).catch(error => {
    			console.error("Error fetching drys:", error);
    		});

    		// get the latest leak events
    		getLeaks().then(leaks => {
    			$$invalidate(4, items = [...items, ...parseLeaksIntoItems(leaks, month)]);

    			// This is where you calc the row/col to put each dated item
    			for (let i of items) {
    				let rc = findRowCol(i.date);

    				if (rc == null) {
    					console.log('didn`t find date for ', i);
    					console.log(i.date);
    					console.log(days);
    					i.startCol = i.startRow = 0;
    				} else {
    					i.startCol = rc.col;
    					i.startRow = rc.row;
    				}
    			}
    		}).catch(error => {
    			console.error("Error fetching leaks:", error);
    		});
    	}

    	// choose what date/day gets displayed in each date box.
    	function initContent() {
    		$$invalidate(2, headers = dayNames);
    		initMonth();
    		initMonthItems();
    	}

    	function initMonth() {
    		$$invalidate(3, days = []);
    		let monthAbbrev = monthNames[month].slice(0, 3);
    		let nextMonthAbbrev = monthNames[(month + 1) % 12].slice(0, 3);

    		//	find the last Monday of the previous month
    		var firstDay = new Date(year, month, 1).getDay();

    		//console.log('fd='+firstDay+' '+dayNames[firstDay]);
    		var daysInThisMonth = new Date(year, month + 1, 0).getDate();

    		var daysInLastMonth = new Date(year, month, 0).getDate();
    		var prevMonth = month == 0 ? 11 : month - 1;

    		//	show the days before the start of this month (disabled) - always less than 7
    		for (let i = daysInLastMonth - firstDay; i < daysInLastMonth; i++) {
    			let d = new Date(prevMonth == 11 ? year - 1 : year, prevMonth, i + 1);

    			days.push({
    				name: '' + (i + 1),
    				enabled: false,
    				date: d
    			});
    		}

    		//	show the days in this month (enabled) - always 28 - 31
    		for (let i = 0; i < daysInThisMonth; i++) {
    			let d = new Date(year, month, i + 1);

    			if (i == 0) days.push({
    				name: monthAbbrev + ' ' + (i + 1),
    				enabled: true,
    				date: d
    			}); else days.push({
    				name: '' + (i + 1),
    				enabled: true,
    				date: d
    			});
    		} //console.log('i='+i+'  dt is '+d+' date() is '+d.getDate());

    		//	show any days to fill up the last row (disabled) - always less than 7
    		for (let i = 0; days.length % 7; i++) {
    			let d = new Date(month == 11 ? year + 1 : year, (month + 1) % 12, i + 1);

    			if (i == 0) days.push({
    				name: nextMonthAbbrev + ' ' + (i + 1),
    				enabled: false,
    				date: d
    			}); else days.push({
    				name: '' + (i + 1),
    				enabled: false,
    				date: d
    			});
    		}
    	}

    	function findRowCol(dt) {
    		for (let i = 0; i < days.length; i++) {
    			let d = days[i].date;

    			if (d.getYear() === dt.getYear() && d.getMonth() === dt.getMonth() && d.getDate() === dt.getDate()) return {
    				row: Math.floor(i / 7) + 2,
    				col: i % 7 + 1
    			};
    		}

    		return null;
    	}

    	function dayClick(e) {
    		set_store_value(currentSelectedDate, $currentSelectedDate = e.date, $currentSelectedDate);
    	}

    	function next() {
    		$$invalidate(1, month++, month);

    		// Increase the date by 1 month
    		//$currentSelectedDate.setMonth($currentSelectedDate.getMonth() + 1);
    		$$invalidate(4, items = []); // reset items here already so we get no timing issues later on

    		if (month == 12) {
    			$$invalidate(0, year++, year);
    			$$invalidate(1, month = 0);
    		}
    	}

    	function prev() {
    		// Increase the date by 1 month
    		//$currentSelectedDate.setMonth($currentSelectedDate.getMonth() - 1);
    		$$invalidate(4, items = []); // reset items here already so we get no timing issues later on

    		if (month == 0) {
    			$$invalidate(1, month = 11);
    			$$invalidate(0, year--, year);
    		} else {
    			$$invalidate(1, month--, month);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$6.warn(`<LSGCalendar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => prev();
    	const click_handler_1 = () => next();
    	const dayClick_handler = e => dayClick(e.detail);
    	const itemClick_handler = e => itemClick(e.detail);
    	const headerClick_handler = e => headerClick(e.detail);

    	$$self.$capture_state = () => ({
    		Calendar,
    		getLeaks,
    		parseLeaksIntoItems,
    		parseDryNightsIntoStarItems,
    		getDryNights,
    		onMount,
    		currentSelectedDate,
    		_: $format,
    		dayNames,
    		monthNames,
    		headers,
    		now,
    		year,
    		month,
    		eventText,
    		days,
    		randInt,
    		items,
    		initMonthItems,
    		initContent,
    		initMonth,
    		findRowCol,
    		itemClick,
    		dayClick,
    		headerClick,
    		next,
    		prev,
    		$currentSelectedDate,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('dayNames' in $$props) dayNames = $$props.dayNames;
    		if ('monthNames' in $$props) $$invalidate(5, monthNames = $$props.monthNames);
    		if ('headers' in $$props) $$invalidate(2, headers = $$props.headers);
    		if ('now' in $$props) now = $$props.now;
    		if ('year' in $$props) $$invalidate(0, year = $$props.year);
    		if ('month' in $$props) $$invalidate(1, month = $$props.month);
    		if ('eventText' in $$props) eventText = $$props.eventText;
    		if ('days' in $$props) $$invalidate(3, days = $$props.days);
    		if ('items' in $$props) $$invalidate(4, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*month, year, $currentSelectedDate*/ 515) {
    			// we also added currentSelectedDate, if the user selects a new date the screen will flash because it will build it up again.
    			// if on some systems this gives problem remove the currentSelectedDate. The circel will not move anymore to another date but that might be better then the refresh
    			(initContent());
    		}
    	};

    	return [
    		year,
    		month,
    		headers,
    		days,
    		items,
    		monthNames,
    		dayClick,
    		next,
    		prev,
    		$currentSelectedDate,
    		click_handler,
    		click_handler_1,
    		dayClick_handler,
    		itemClick_handler,
    		headerClick_handler
    	];
    }

    class LSGCalendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LSGCalendar",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\LeakWindow.svelte generated by Svelte v3.59.2 */

    const { console: console_1$5 } = globals;

    const file$7 = "src\\components\\LeakWindow.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (119:2) {#if isStar==true}
    function create_if_block$4(ctx) {
    	let t0_value = /*$_*/ ctx[5]("CalendarScreen.You’re a superstar!") + "";
    	let t0;
    	let t1;
    	let br;
    	let t2;
    	let t3_value = /*$_*/ ctx[5]("CalendarScreen.No wet events this day") + "";
    	let t3;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text("! \r\n         ");
    			br = element("br");
    			t2 = space();
    			t3 = text(t3_value);
    			add_location(br, file$7, 120, 9, 4609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 32 && t0_value !== (t0_value = /*$_*/ ctx[5]("CalendarScreen.You’re a superstar!") + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$_*/ 32 && t3_value !== (t3_value = /*$_*/ ctx[5]("CalendarScreen.No wet events this day") + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(119:2) {#if isStar==true}",
    		ctx
    	});

    	return block;
    }

    // (140:4) {#each list as item, i}
    function create_each_block(ctx) {
    	let li;
    	let div6;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*item*/ ctx[18] + "";
    	let t2;
    	let t3;
    	let div5;
    	let div4;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let t5_value = /*$_*/ ctx[5]("CalendarScreen.Do you really want delete this event?") + "";
    	let t5;
    	let t6;
    	let div2;
    	let button0;
    	let t7_value = /*$_*/ ctx[5]("Yes") + "";
    	let t7;
    	let t8;
    	let button1;
    	let t9_value = /*$_*/ ctx[5]("No") + "";
    	let t9;
    	let t10;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[10](/*i*/ ctx[20]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div6 = element("div");
    			div0 = element("div");
    			t0 = text(/*dateStr*/ ctx[4]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			div2 = element("div");
    			button0 = element("button");
    			t7 = text(t7_value);
    			t8 = space();
    			button1 = element("button");
    			t9 = text(t9_value);
    			t10 = space();
    			attr_dev(div0, "class", "datum svelte-gt3qnf");
    			add_location(div0, file$7, 142, 10, 5150);
    			attr_dev(div1, "class", "time svelte-gt3qnf");
    			add_location(div1, file$7, 145, 10, 5222);
    			set_style(img, "height", "2vh");
    			set_style(img, "color", "white");
    			if (!src_url_equal(img.src, img_src_value = "build/images/Delete_icon.svg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$7, 150, 2, 5353);
    			attr_dev(button0, "class", "svelte-gt3qnf");
    			add_location(button0, file$7, 154, 6, 5620);
    			attr_dev(button1, "class", "svelte-gt3qnf");
    			add_location(button1, file$7, 155, 6, 5691);
    			attr_dev(div2, "class", "popup-buttons svelte-gt3qnf");
    			add_location(div2, file$7, 153, 4, 5585);
    			attr_dev(div3, "class", "popuptext svelte-gt3qnf");
    			attr_dev(div3, "id", "myPopup");
    			add_location(div3, file$7, 151, 2, 5477);
    			attr_dev(div4, "class", "popup svelte-gt3qnf");
    			set_style(div4, "font-family", "Arial");
    			add_location(div4, file$7, 149, 2, 5300);
    			attr_dev(div5, "class", "icon svelte-gt3qnf");
    			add_location(div5, file$7, 146, 10, 5264);
    			attr_dev(div6, "class", "containerLeak svelte-gt3qnf");
    			add_location(div6, file$7, 141, 8, 5111);
    			add_location(li, file$7, 140, 6, 5097);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div6);
    			append_dev(div6, div0);
    			append_dev(div0, t0);
    			append_dev(div6, t1);
    			append_dev(div6, div1);
    			append_dev(div1, t2);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, t5);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(button0, t7);
    			append_dev(div2, t8);
    			append_dev(div2, button1);
    			append_dev(button1, t9);
    			append_dev(li, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "click", stop_propagation(/*click_handler*/ ctx[9]), false, false, true, false),
    					listen_dev(button0, "click", click_handler_1, false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_2*/ ctx[11], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*dateStr*/ 16) set_data_dev(t0, /*dateStr*/ ctx[4]);
    			if (dirty & /*list*/ 8 && t2_value !== (t2_value = /*item*/ ctx[18] + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$_*/ 32 && t5_value !== (t5_value = /*$_*/ ctx[5]("CalendarScreen.Do you really want delete this event?") + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$_*/ 32 && t7_value !== (t7_value = /*$_*/ ctx[5]("Yes") + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*$_*/ 32 && t9_value !== (t9_value = /*$_*/ ctx[5]("No") + "")) set_data_dev(t9, t9_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(140:4) {#each list as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div0;
    	let t0;
    	let br0;
    	let t1;
    	let div4;
    	let div3;
    	let div1;
    	let t2_value = /*$_*/ ctx[5]("CalendarScreen.PERCENTAGE DRY NIGHTS") + "";
    	let t2;
    	let t3;
    	let br1;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div2;
    	let t8_value = /*$_*/ ctx[5]("CalendarScreen.TOTAL STARS EARNED") + "";
    	let t8;
    	let t9;
    	let br2;
    	let t10;
    	let t11;
    	let t12;
    	let ul;
    	let if_block = /*isStar*/ ctx[0] == true && create_if_block$4(ctx);
    	let each_value = /*list*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			t5 = text(/*percentage*/ ctx[2]);
    			t6 = text("%");
    			t7 = space();
    			div2 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			br2 = element("br");
    			t10 = space();
    			t11 = text(/*dryNrNights*/ ctx[1]);
    			t12 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "heroTxt svelte-gt3qnf");
    			set_style(div0, "font-family", "Arial");
    			add_location(div0, file$7, 117, 0, 4469);
    			add_location(br0, file$7, 124, 0, 4686);
    			add_location(br1, file$7, 129, 6, 4886);
    			attr_dev(div1, "class", "percentage svelte-gt3qnf");
    			add_location(div1, file$7, 127, 4, 4801);
    			add_location(br2, file$7, 133, 6, 5001);
    			attr_dev(div2, "class", "aantal svelte-gt3qnf");
    			add_location(div2, file$7, 131, 4, 4924);
    			attr_dev(div3, "class", "containerGrid svelte-gt3qnf");
    			add_location(div3, file$7, 126, 2, 4768);
    			add_location(ul, file$7, 138, 2, 5056);
    			attr_dev(div4, "class", "container svelte-gt3qnf");
    			set_style(div4, "font-family", "Arial");
    			set_style(div4, "font-size", "12.8px");
    			add_location(div4, file$7, 125, 0, 4692);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if (if_block) if_block.m(div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, br1);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, t8);
    			append_dev(div2, t9);
    			append_dev(div2, br2);
    			append_dev(div2, t10);
    			append_dev(div2, t11);
    			append_dev(div4, t12);
    			append_dev(div4, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isStar*/ ctx[0] == true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$_*/ 32 && t2_value !== (t2_value = /*$_*/ ctx[5]("CalendarScreen.PERCENTAGE DRY NIGHTS") + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*percentage*/ 4) set_data_dev(t5, /*percentage*/ ctx[2]);
    			if (dirty & /*$_*/ 32 && t8_value !== (t8_value = /*$_*/ ctx[5]("CalendarScreen.TOTAL STARS EARNED") + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*dryNrNights*/ 2) set_data_dev(t11, /*dryNrNights*/ ctx[1]);

    			if (dirty & /*handleNoClick, $_, handleYesClick, myFunction, list, dateStr*/ 120) {
    				each_value = /*list*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function myFunction() {
    	var popup = document.getElementById("myPopup");

    	if (popup.style.display === 'none' || popup.style.display === '') {
    		popup.style.display = 'block';
    		popup.classList.add("show");
    	} else {
    		popup.style.display = 'none';
    		popup.classList.remove("show");
    	}
    }

    function handleNoClick() {
    	// Perform any action when the "No" button is clicked
    	closePopup(); // simply close the popup
    }

    function closePopup() {
    	var popup = document.getElementById("myPopup");
    	popup.classList.remove("show");
    	popup.style.display = 'none';
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let list;
    	let dateStr;
    	let $currentSelectedDate;
    	let $_;
    	validate_store(currentSelectedDate, 'currentSelectedDate');
    	component_subscribe($$self, currentSelectedDate, $$value => $$invalidate(8, $currentSelectedDate = $$value));
    	validate_store($format, '_');
    	component_subscribe($$self, $format, $$value => $$invalidate(5, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LeakWindow', slots, []);
    	const dispatch = createEventDispatcher();
    	var datum = "2023-04-14";
    	var isStar = false;

    	function getDateStrAndSetupLeakList() {
    		var Str;
    		var Month = $currentSelectedDate.getMonth() + 1; // getMonth start with 0 for januari
    		Str = $currentSelectedDate.getFullYear() + '-' + Month + '-' + $currentSelectedDate.getDate();
    		$$invalidate(3, list = []); // reset list again, since this is a another day

    		getLeaskOnDate($currentSelectedDate).then(leakList => {
    			if (leakList.length > 1) {
    				console.log("list lenght :", leakList.length);
    			}

    			for (let leak of leakList) {
    				let hours = String(leak.date.getHours()).padStart(2, '0');
    				let minutes = String(leak.date.getMinutes()).padStart(2, '0');
    				let str = hours + ":" + minutes;

    				//  let str = leak.date.getHours() + ":" + leak.date.getMinutes();
    				$$invalidate(3, list = [...list, str]); // Use the spread operator to create a new reference
    			}
    		});

    		return Str;
    	}

    	var measuredNrNights;
    	var dryNrNights;
    	var percentage;

    	let { onButtonClick = () => {
    		
    	} } = $$props;

    	function test() {
    		console.log("test");
    		dispatch("click");
    	}

    	onMount(() => {
    		getMeasuredNights().then(measuredNights => {
    			measuredNrNights = measuredNights.length;
    			if (measuredNrNights == 0) measuredNrNights = 1; // prevent div by 0
    			return getDryNights();
    		}).then(dryNights => {
    			$$invalidate(1, dryNrNights = dryNights.length);
    			$$invalidate(2, percentage = 100 + Math.floor((dryNrNights / measuredNrNights - 1) * 100));
    		}).catch(error => {
    			console.error("Error:", error); // Use 'percentage' as needed here
    		});
    	});

    	//delete the leakage date time when delete_icon is clicked
    	// Define the function to delete an item from the list
    	function deleteLeak(index) {
    		// Convert $currentSelectedDate to a Date object
    		const currentDate = new Date($currentSelectedDate);

    		// Split the time string into hours and minutes
    		const timeParts = list[index].split(':');

    		const hours = parseInt(timeParts[0]);
    		const minutes = parseInt(timeParts[1]);

    		// Set the time on the currentDate object
    		currentDate.setHours(hours, minutes, 0, 0); // Clear seconds and milliseconds

    		// Convert the merged date and time back to a string
    		const selectedDate = currentDate; // .toISOString();

    		// Create a new EventOopsie object with the selected date
    		const oopsieEvent = { date: selectedDate };

    		deleteEventLocal(oopsieEvent).then(() => {
    			// Remove the item from the list based on its index
    			$$invalidate(3, list = list.filter((_, i) => i !== index));

    			currentSelectedDate.set($currentSelectedDate); // force refresh 
    		}).catch(error => {
    			// Handle errors if deleteEventLocal fails
    			console.error(error);
    		});

    		var popup = document.getElementById("myPopup");
    		popup.classList.toggle("show");
    	}

    	function handleYesClick(index) {
    		// Perform the action when the "Yes" button is clicked
    		deleteLeak(index); // call a delete function
    	} //  closePopup();

    	const writable_props = ['onButtonClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<LeakWindow> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => myFunction();
    	const click_handler_1 = i => handleYesClick(i);
    	const click_handler_2 = () => handleNoClick();

    	$$self.$$set = $$props => {
    		if ('onButtonClick' in $$props) $$invalidate(7, onButtonClick = $$props.onButtonClick);
    	};

    	$$self.$capture_state = () => ({
    		_: $format,
    		createEventDispatcher,
    		deleteEventLocal,
    		currentSelectedDate,
    		onMount,
    		getLeaskOnDate,
    		dayIsaStar,
    		getMeasuredNights,
    		getDryNights,
    		dispatch,
    		datum,
    		isStar,
    		getDateStrAndSetupLeakList,
    		measuredNrNights,
    		dryNrNights,
    		percentage,
    		onButtonClick,
    		test,
    		deleteLeak,
    		myFunction,
    		handleYesClick,
    		handleNoClick,
    		closePopup,
    		list,
    		dateStr,
    		$currentSelectedDate,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('datum' in $$props) datum = $$props.datum;
    		if ('isStar' in $$props) $$invalidate(0, isStar = $$props.isStar);
    		if ('measuredNrNights' in $$props) measuredNrNights = $$props.measuredNrNights;
    		if ('dryNrNights' in $$props) $$invalidate(1, dryNrNights = $$props.dryNrNights);
    		if ('percentage' in $$props) $$invalidate(2, percentage = $$props.percentage);
    		if ('onButtonClick' in $$props) $$invalidate(7, onButtonClick = $$props.onButtonClick);
    		if ('list' in $$props) $$invalidate(3, list = $$props.list);
    		if ('dateStr' in $$props) $$invalidate(4, dateStr = $$props.dateStr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentSelectedDate*/ 256) {
    			// reactive statements
    			$$invalidate(4, dateStr = getDateStrAndSetupLeakList());
    		}

    		if ($$self.$$.dirty & /*$currentSelectedDate*/ 256) {
    			dayIsaStar($currentSelectedDate).then(val => {
    				$$invalidate(0, isStar = val);
    			});
    		}
    	};

    	$$invalidate(3, list = []);

    	return [
    		isStar,
    		dryNrNights,
    		percentage,
    		list,
    		dateStr,
    		$_,
    		handleYesClick,
    		onButtonClick,
    		$currentSelectedDate,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class LeakWindow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$8, create_fragment$8, safe_not_equal, { onButtonClick: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LeakWindow",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get onButtonClick() {
    		throw new Error("<LeakWindow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onButtonClick(value) {
    		throw new Error("<LeakWindow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\routes\CalendarScreen.svelte generated by Svelte v3.59.2 */

    const { console: console_1$4 } = globals;
    const file$6 = "src\\routes\\CalendarScreen.svelte";

    function create_fragment$7(ctx) {
    	let div4;
    	let div3;
    	let div1;
    	let div0;
    	let h1;
    	let t0_value = /*$_*/ ctx[1]("CalendarScreen.Calendar") + "";
    	let t0;
    	let t1;
    	let div2;
    	let button;
    	let img;
    	let img_src_value;
    	let t2;
    	let lsgcalendar;
    	let t3;
    	let leakwindow;
    	let current;
    	let mounted;
    	let dispose;
    	lsgcalendar = new LSGCalendar({ $$inline: true });
    	leakwindow = new LeakWindow({ $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div2 = element("div");
    			button = element("button");
    			img = element("img");
    			t2 = space();
    			create_component(lsgcalendar.$$.fragment);
    			t3 = space();
    			create_component(leakwindow.$$.fragment);
    			set_style(h1, "font-family", "Arial");
    			set_style(h1, "font-size", "20px");
    			add_location(h1, file$6, 108, 6, 2450);
    			attr_dev(div0, "class", "flex-container svelte-1qjzqe9");
    			add_location(div0, file$6, 107, 6, 2414);
    			attr_dev(div1, "class", "ButtonLabel center svelte-1qjzqe9");
    			add_location(div1, file$6, 106, 4, 2374);
    			set_style(img, "width", "5vw");
    			if (!src_url_equal(img.src, img_src_value = "build/images/Arrow_icon.svg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$6, 113, 6, 2639);
    			attr_dev(button, "class", "button svelte-1qjzqe9");
    			add_location(button, file$6, 112, 4, 2585);
    			attr_dev(div2, "class", "Icon svelte-1qjzqe9");
    			add_location(div2, file$6, 111, 2, 2561);
    			attr_dev(div3, "class", "container svelte-1qjzqe9");
    			add_location(div3, file$6, 105, 2, 2345);
    			attr_dev(div4, "class", "bg svelte-1qjzqe9");
    			set_style(div4, "height", "100%");
    			set_style(div4, "width", "100%");
    			set_style(div4, "background-image", "url(" + /*backgroundImage*/ ctx[0] + ")");
    			add_location(div4, file$6, 104, 0, 2247);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(button, img);
    			append_dev(div4, t2);
    			mount_component(lsgcalendar, div4, null);
    			append_dev(div4, t3);
    			mount_component(leakwindow, div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$_*/ 2) && t0_value !== (t0_value = /*$_*/ ctx[1]("CalendarScreen.Calendar") + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*backgroundImage*/ 1) {
    				set_style(div4, "background-image", "url(" + /*backgroundImage*/ ctx[0] + ")");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lsgcalendar.$$.fragment, local);
    			transition_in(leakwindow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lsgcalendar.$$.fragment, local);
    			transition_out(leakwindow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(lsgcalendar);
    			destroy_component(leakwindow);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $store_smallOrLargeImageTxt;
    	let $_;
    	validate_store(store_smallOrLargeImageTxt, 'store_smallOrLargeImageTxt');
    	component_subscribe($$self, store_smallOrLargeImageTxt, $$value => $$invalidate(3, $store_smallOrLargeImageTxt = $$value));
    	validate_store($format, '_');
    	component_subscribe($$self, $format, $$value => $$invalidate(1, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CalendarScreen', slots, []);
    	var myScreenOrientation = window.screen.orientation;
    	var backgroundImage = "";

    	try {
    		myScreenOrientation.lock("portrait"); // prevent from rotating screen
    	} catch(error) {
    		console.error(error);
    	}

    	console.log("loading");

    	onMount(() => {
    		$$invalidate(0, backgroundImage = "build/images/background_intro_" + $store_smallOrLargeImageTxt + ".jpg");
    		console.log(backgroundImage);
    	});

    	onDestroy(() => {
    		try {
    			myScreenOrientation.unlock(); // screen might be rotated again
    		} catch(error) {
    			console.error(error);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<CalendarScreen> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => pop();

    	$$self.$capture_state = () => ({
    		_: $format,
    		onMount,
    		onDestroy,
    		pop,
    		LSGCalendar,
    		LeakWindow,
    		store_smallOrLargeImageTxt,
    		myScreenOrientation,
    		backgroundImage,
    		$store_smallOrLargeImageTxt,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('myScreenOrientation' in $$props) myScreenOrientation = $$props.myScreenOrientation;
    		if ('backgroundImage' in $$props) $$invalidate(0, backgroundImage = $$props.backgroundImage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [backgroundImage, $_, click_handler];
    }

    class CalendarScreen$8 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CalendarScreen",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\routes\SettingsScreen.svelte generated by Svelte v3.59.2 */

    const { console: console_1$3 } = globals;
    const file$5 = "src\\routes\\SettingsScreen.svelte";

    // (221:7) {#if  $store_selectedSound==1}
    function create_if_block_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("  ✓");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(221:7) {#if  $store_selectedSound==1}",
    		ctx
    	});

    	return block;
    }

    // (238:8) {#if  $store_selectedSound == 2}
    function create_if_block_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("       ✓");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(238:8) {#if  $store_selectedSound == 2}",
    		ctx
    	});

    	return block;
    }

    // (249:8) {#if  $store_selectedSound == 3}
    function create_if_block_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("       ✓");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(249:8) {#if  $store_selectedSound == 3}",
    		ctx
    	});

    	return block;
    }

    // (260:7) {#if  $store_selectedSound == 4}
    function create_if_block_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("       ✓");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(260:7) {#if  $store_selectedSound == 4}",
    		ctx
    	});

    	return block;
    }

    // (271:8) {#if  $store_selectedSound == 5}
    function create_if_block_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("  ✓");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(271:8) {#if  $store_selectedSound == 5}",
    		ctx
    	});

    	return block;
    }

    // (289:6) {#if $store_selectedSound == 6}
    function create_if_block_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(" ✓");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(289:6) {#if $store_selectedSound == 6}",
    		ctx
    	});

    	return block;
    }

    // (295:5) {:else}
    function create_else_block$1(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "iconSpace svelte-1dbwe54");
    			if (!src_url_equal(img.src, img_src_value = "build/images/microphone.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "microphone");
    			add_location(img, file$5, 295, 8, 8188);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*click_handler_8*/ ctx[12], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(295:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (293:5) {#if recording}
    function create_if_block$3(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "iconSpace svelte-1dbwe54");
    			if (!src_url_equal(img.src, img_src_value = "build/images/stop_recording.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "microphone");
    			add_location(img, file$5, 293, 8, 8023);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*click_handler_7*/ ctx[11], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(293:5) {#if recording}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div8;
    	let div0;
    	let t0;
    	let div1;
    	let button0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div2;
    	let h1;
    	let t2_value = /*$_*/ ctx[2]('SettingsScreen.Alarm Settings') + "";
    	let t2;
    	let t3;
    	let div3;
    	let t4;
    	let div7;
    	let div4;
    	let t5_value = /*$_*/ ctx[2]('SettingsScreen.Choose your alarm sound') + "";
    	let t5;
    	let t6;
    	let div5;
    	let button1;
    	let t7_value = /*$_*/ ctx[2]('SettingsScreen.Smooth & Gentle') + "";
    	let t7;
    	let t8;
    	let t9;
    	let button2;
    	let t10_value = /*$_*/ ctx[2]('SettingsScreen.Phone-like') + "";
    	let t10;
    	let t11;
    	let t12;
    	let button3;
    	let t13_value = /*$_*/ ctx[2]('SettingsScreen.Rooster') + "";
    	let t13;
    	let t14;
    	let t15;
    	let button4;
    	let t16_value = /*$_*/ ctx[2]('SettingsScreen.Harsh alarm') + "";
    	let t16;
    	let t17;
    	let t18;
    	let button5;
    	let t19_value = /*$_*/ ctx[2]('SettingsScreen.Oopsie Heroes') + "";
    	let t19;
    	let t20;
    	let t21;
    	let div6;
    	let t22_value = /*$_*/ ctx[2]('SettingsScreen.Record the voice of one of your parents:') + "";
    	let t22;
    	let t23;
    	let button6;
    	let t24_value = /*$_*/ ctx[2]('SettingsScreen.Voice recording') + "";
    	let t24;
    	let t25;
    	let t26;
    	let div8_style_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$store_selectedSound*/ ctx[3] == 1 && create_if_block_6(ctx);
    	let if_block1 = /*$store_selectedSound*/ ctx[3] == 2 && create_if_block_5$1(ctx);
    	let if_block2 = /*$store_selectedSound*/ ctx[3] == 3 && create_if_block_4$1(ctx);
    	let if_block3 = /*$store_selectedSound*/ ctx[3] == 4 && create_if_block_3$1(ctx);
    	let if_block4 = /*$store_selectedSound*/ ctx[3] == 5 && create_if_block_2$1(ctx);
    	let if_block5 = /*$store_selectedSound*/ ctx[3] == 6 && create_if_block_1$1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*recording*/ ctx[1]) return create_if_block$3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block6 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			button0 = element("button");
    			img = element("img");
    			t1 = space();
    			div2 = element("div");
    			h1 = element("h1");
    			t2 = text(t2_value);
    			t3 = space();
    			div3 = element("div");
    			t4 = space();
    			div7 = element("div");
    			div4 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			div5 = element("div");
    			button1 = element("button");
    			t7 = text(t7_value);
    			t8 = space();
    			if (if_block0) if_block0.c();
    			t9 = space();
    			button2 = element("button");
    			t10 = text(t10_value);
    			t11 = space();
    			if (if_block1) if_block1.c();
    			t12 = space();
    			button3 = element("button");
    			t13 = text(t13_value);
    			t14 = space();
    			if (if_block2) if_block2.c();
    			t15 = space();
    			button4 = element("button");
    			t16 = text(t16_value);
    			t17 = space();
    			if (if_block3) if_block3.c();
    			t18 = space();
    			button5 = element("button");
    			t19 = text(t19_value);
    			t20 = space();
    			if (if_block4) if_block4.c();
    			t21 = space();
    			div6 = element("div");
    			t22 = text(t22_value);
    			t23 = space();
    			button6 = element("button");
    			t24 = text(t24_value);
    			t25 = space();
    			if (if_block5) if_block5.c();
    			t26 = space();
    			if_block6.c();
    			attr_dev(div0, "class", "Margin svelte-1dbwe54");
    			add_location(div0, file$5, 192, 2, 4331);
    			set_style(img, "width", "4vw");
    			if (!src_url_equal(img.src, img_src_value = "build/images/Arrow_icon.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "back arrow");
    			attr_dev(img, "width", "100%");
    			add_location(img, file$5, 195, 4, 4446);
    			attr_dev(button0, "class", "button svelte-1dbwe54");
    			add_location(button0, file$5, 194, 4, 4393);
    			attr_dev(div1, "class", "Arrow center svelte-1dbwe54");
    			add_location(div1, file$5, 193, 2, 4361);
    			set_style(h1, "font-family", "Arial");
    			set_style(h1, "font-size", "20px");
    			attr_dev(h1, "class", "svelte-1dbwe54");
    			add_location(h1, file$5, 200, 4, 4629);
    			attr_dev(div2, "class", "Title center svelte-1dbwe54");
    			set_style(div2, "font-family", "Arial");
    			add_location(div2, file$5, 199, 2, 4567);
    			attr_dev(div3, "class", "Top-Spacer svelte-1dbwe54");
    			add_location(div3, file$5, 205, 2, 4750);
    			attr_dev(div4, "class", "GridchoiceTxt svelte-1dbwe54");
    			set_style(div4, "font-family", "Arial");
    			set_style(div4, "font-size", "13.8px");
    			set_style(div4, "width", "100%");
    			set_style(div4, "height", "100%");
    			set_style(div4, "text-align", "left");
    			set_style(div4, "color", "white");
    			add_location(div4, file$5, 208, 3, 4863);
    			attr_dev(button1, "class", "btn-group center svelte-1dbwe54");
    			set_style(button1, "font-family", "Arial");
    			set_style(button1, "font-size", "15.3px");

    			set_style(button1, "background-color", /*$store_selectedSound*/ ctx[3] == 1
    			? '#00008B'
    			: 'skyblue');

    			add_location(button1, file$5, 214, 6, 5182);
    			attr_dev(div5, "class", "smooth svelte-1dbwe54");
    			set_style(div5, "font-family", "Arial");
    			set_style(div5, "font-size", "15.3px");
    			set_style(div5, "width", "100%");
    			set_style(div5, "height", "100%");
    			add_location(div5, file$5, 213, 8, 5080);
    			attr_dev(button2, "class", "phone btn-group center svelte-1dbwe54");
    			set_style(button2, "font-family", "Arial");
    			set_style(button2, "font-size", "15.3px");

    			set_style(button2, "background-color", /*$store_selectedSound*/ ctx[3] == 2
    			? '#00008B'
    			: 'skyblue');

    			add_location(button2, file$5, 226, 6, 5607);
    			attr_dev(button3, "class", "rooster btn-group center svelte-1dbwe54");
    			set_style(button3, "font-family", "Arial");
    			set_style(button3, "font-size", "15.3px");

    			set_style(button3, "background-color", /*$store_selectedSound*/ ctx[3] == 3
    			? '#00008B'
    			: 'skyblue');

    			add_location(button3, file$5, 242, 6, 6069);
    			attr_dev(button4, "class", "harsh btn-group center svelte-1dbwe54");
    			set_style(button4, "font-family", "Arial");
    			set_style(button4, "font-size", "15.3px");

    			set_style(button4, "background-color", /*$store_selectedSound*/ ctx[3] == 4
    			? '#00008B'
    			: 'skyblue');

    			add_location(button4, file$5, 253, 6, 6502);
    			attr_dev(button5, "class", "oopsieheroes btn-group center svelte-1dbwe54");
    			set_style(button5, "font-family", "Arial");
    			set_style(button5, "font-size", "14.8px");

    			set_style(button5, "background-color", /*$store_selectedSound*/ ctx[3] == 5
    			? '#00008B'
    			: 'skyblue');

    			add_location(button5, file$5, 264, 6, 6937);
    			attr_dev(div6, "class", "record-txt svelte-1dbwe54");
    			set_style(div6, "font-family", "Arial");
    			set_style(div6, "font-size", "13.6px");
    			set_style(div6, "width", "80%");
    			set_style(div6, "height", "100%");
    			set_style(div6, "text-align", "left");
    			set_style(div6, "color", "white");
    			add_location(div6, file$5, 277, 4, 7377);
    			attr_dev(button6, "class", "voice btn-group svelte-1dbwe54");
    			set_style(button6, "font-family", "Arial");
    			set_style(button6, "font-size", "14px");

    			set_style(button6, "background-color", /*$store_selectedSound*/ ctx[3] == 6
    			? '#00008B'
    			: 'skyblue');

    			add_location(button6, file$5, 282, 5, 7608);
    			attr_dev(div7, "class", "GridContainerSelections svelte-1dbwe54");
    			set_style(div7, "width", "100%");
    			set_style(div7, "height", "155%");
    			add_location(div7, file$5, 207, 2, 4786);
    			attr_dev(div8, "class", "container bg svelte-1dbwe54");
    			attr_dev(div8, "style", div8_style_value = "height : 100%; width:100%; background-image: url(" + /*backgroundImage*/ ctx[0] + ");");
    			add_location(div8, file$5, 191, 0, 4224);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div0);
    			append_dev(div8, t0);
    			append_dev(div8, div1);
    			append_dev(div1, button0);
    			append_dev(button0, img);
    			append_dev(div8, t1);
    			append_dev(div8, div2);
    			append_dev(div2, h1);
    			append_dev(h1, t2);
    			append_dev(div8, t3);
    			append_dev(div8, div3);
    			append_dev(div8, t4);
    			append_dev(div8, div7);
    			append_dev(div7, div4);
    			append_dev(div4, t5);
    			append_dev(div7, t6);
    			append_dev(div7, div5);
    			append_dev(div5, button1);
    			append_dev(button1, t7);
    			append_dev(button1, t8);
    			if (if_block0) if_block0.m(button1, null);
    			append_dev(div7, t9);
    			append_dev(div7, button2);
    			append_dev(button2, t10);
    			append_dev(button2, t11);
    			if (if_block1) if_block1.m(button2, null);
    			append_dev(div7, t12);
    			append_dev(div7, button3);
    			append_dev(button3, t13);
    			append_dev(button3, t14);
    			if (if_block2) if_block2.m(button3, null);
    			append_dev(div7, t15);
    			append_dev(div7, button4);
    			append_dev(button4, t16);
    			append_dev(button4, t17);
    			if (if_block3) if_block3.m(button4, null);
    			append_dev(div7, t18);
    			append_dev(div7, button5);
    			append_dev(button5, t19);
    			append_dev(button5, t20);
    			if (if_block4) if_block4.m(button5, null);
    			append_dev(div7, t21);
    			append_dev(div7, div6);
    			append_dev(div6, t22);
    			append_dev(div7, t23);
    			append_dev(div7, button6);
    			append_dev(button6, t24);
    			append_dev(button6, t25);
    			if (if_block5) if_block5.m(button6, null);
    			append_dev(div7, t26);
    			if_block6.m(div7, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[6], false, false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[7], false, false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[8], false, false, false, false),
    					listen_dev(button5, "click", /*click_handler_5*/ ctx[9], false, false, false, false),
    					listen_dev(button6, "click", /*click_handler_6*/ ctx[10], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$_*/ 4 && t2_value !== (t2_value = /*$_*/ ctx[2]('SettingsScreen.Alarm Settings') + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$_*/ 4 && t5_value !== (t5_value = /*$_*/ ctx[2]('SettingsScreen.Choose your alarm sound') + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$_*/ 4 && t7_value !== (t7_value = /*$_*/ ctx[2]('SettingsScreen.Smooth & Gentle') + "")) set_data_dev(t7, t7_value);

    			if (/*$store_selectedSound*/ ctx[3] == 1) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(button1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*$store_selectedSound*/ 8) {
    				set_style(button1, "background-color", /*$store_selectedSound*/ ctx[3] == 1
    				? '#00008B'
    				: 'skyblue');
    			}

    			if (dirty & /*$_*/ 4 && t10_value !== (t10_value = /*$_*/ ctx[2]('SettingsScreen.Phone-like') + "")) set_data_dev(t10, t10_value);

    			if (/*$store_selectedSound*/ ctx[3] == 2) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_5$1(ctx);
    					if_block1.c();
    					if_block1.m(button2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*$store_selectedSound*/ 8) {
    				set_style(button2, "background-color", /*$store_selectedSound*/ ctx[3] == 2
    				? '#00008B'
    				: 'skyblue');
    			}

    			if (dirty & /*$_*/ 4 && t13_value !== (t13_value = /*$_*/ ctx[2]('SettingsScreen.Rooster') + "")) set_data_dev(t13, t13_value);

    			if (/*$store_selectedSound*/ ctx[3] == 3) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_4$1(ctx);
    					if_block2.c();
    					if_block2.m(button3, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*$store_selectedSound*/ 8) {
    				set_style(button3, "background-color", /*$store_selectedSound*/ ctx[3] == 3
    				? '#00008B'
    				: 'skyblue');
    			}

    			if (dirty & /*$_*/ 4 && t16_value !== (t16_value = /*$_*/ ctx[2]('SettingsScreen.Harsh alarm') + "")) set_data_dev(t16, t16_value);

    			if (/*$store_selectedSound*/ ctx[3] == 4) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_3$1(ctx);
    					if_block3.c();
    					if_block3.m(button4, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*$store_selectedSound*/ 8) {
    				set_style(button4, "background-color", /*$store_selectedSound*/ ctx[3] == 4
    				? '#00008B'
    				: 'skyblue');
    			}

    			if (dirty & /*$_*/ 4 && t19_value !== (t19_value = /*$_*/ ctx[2]('SettingsScreen.Oopsie Heroes') + "")) set_data_dev(t19, t19_value);

    			if (/*$store_selectedSound*/ ctx[3] == 5) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_2$1(ctx);
    					if_block4.c();
    					if_block4.m(button5, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (dirty & /*$store_selectedSound*/ 8) {
    				set_style(button5, "background-color", /*$store_selectedSound*/ ctx[3] == 5
    				? '#00008B'
    				: 'skyblue');
    			}

    			if (dirty & /*$_*/ 4 && t22_value !== (t22_value = /*$_*/ ctx[2]('SettingsScreen.Record the voice of one of your parents:') + "")) set_data_dev(t22, t22_value);
    			if (dirty & /*$_*/ 4 && t24_value !== (t24_value = /*$_*/ ctx[2]('SettingsScreen.Voice recording') + "")) set_data_dev(t24, t24_value);

    			if (/*$store_selectedSound*/ ctx[3] == 6) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_1$1(ctx);
    					if_block5.c();
    					if_block5.m(button6, null);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (dirty & /*$store_selectedSound*/ 8) {
    				set_style(button6, "background-color", /*$store_selectedSound*/ ctx[3] == 6
    				? '#00008B'
    				: 'skyblue');
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block6) {
    				if_block6.p(ctx, dirty);
    			} else {
    				if_block6.d(1);
    				if_block6 = current_block_type(ctx);

    				if (if_block6) {
    					if_block6.c();
    					if_block6.m(div7, null);
    				}
    			}

    			if (dirty & /*backgroundImage*/ 1 && div8_style_value !== (div8_style_value = "height : 100%; width:100%; background-image: url(" + /*backgroundImage*/ ctx[0] + ");")) {
    				attr_dev(div8, "style", div8_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if_block6.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $store_smallOrLargeImageTxt;
    	let $_;
    	let $store_selectedSound;
    	validate_store(store_smallOrLargeImageTxt, 'store_smallOrLargeImageTxt');
    	component_subscribe($$self, store_smallOrLargeImageTxt, $$value => $$invalidate(13, $store_smallOrLargeImageTxt = $$value));
    	validate_store($format, '_');
    	component_subscribe($$self, $format, $$value => $$invalidate(2, $_ = $$value));
    	validate_store(store_selectedSound, 'store_selectedSound');
    	component_subscribe($$self, store_selectedSound, $$value => $$invalidate(3, $store_selectedSound = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SettingsScreen', slots, []);
    	var backgroundImage = "";
    	var recording = false;
    	let isVoiceRecordingSelected = false;
    	console.log("loading");

    	onMount(() => {
    		$$invalidate(1, recording = false);
    		console.log("mounted");
    		$$invalidate(0, backgroundImage = "build/images/background_intro_" + $store_smallOrLargeImageTxt + ".jpg");
    	});

    	onDestroy(() => {
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<SettingsScreen> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => pop();

    	const click_handler_1 = () => {
    		setSound1();
    		set_store_value(store_selectedSound, $store_selectedSound = 1, $store_selectedSound);
    	};

    	const click_handler_2 = () => {
    		setSound2();
    		set_store_value(store_selectedSound, $store_selectedSound = 2, $store_selectedSound);
    	};

    	const click_handler_3 = () => {
    		setSound3();
    		set_store_value(store_selectedSound, $store_selectedSound = 3, $store_selectedSound);
    	};

    	const click_handler_4 = () => {
    		setSound4();
    		set_store_value(store_selectedSound, $store_selectedSound = 4, $store_selectedSound);
    	};

    	const click_handler_5 = () => {
    		setSound5();
    		set_store_value(store_selectedSound, $store_selectedSound = 5, $store_selectedSound);
    	};

    	const click_handler_6 = () => {
    		setSoundCustom();
    		set_store_value(store_selectedSound, $store_selectedSound = 6, $store_selectedSound);
    	};

    	const click_handler_7 = () => {
    		$$invalidate(1, recording = false);
    		stopRecordSound();
    	};

    	const click_handler_8 = () => {
    		$$invalidate(1, recording = true);

    		setTimeout(
    			() => {
    				$$invalidate(1, recording = false);
    				console.log("Recording stopped");
    			},
    			3000
    		);

    		recordSound();
    	};

    	$$self.$capture_state = () => ({
    		_: $format,
    		onMount,
    		onDestroy,
    		pop,
    		setSound1,
    		setSound2,
    		setSound3,
    		setSound4,
    		setSound5,
    		setSoundCustom,
    		recordSound,
    		stopRecordSound,
    		store_smallOrLargeImageTxt,
    		store_selectedSound,
    		backgroundImage,
    		recording,
    		isVoiceRecordingSelected,
    		$store_smallOrLargeImageTxt,
    		$_,
    		$store_selectedSound
    	});

    	$$self.$inject_state = $$props => {
    		if ('backgroundImage' in $$props) $$invalidate(0, backgroundImage = $$props.backgroundImage);
    		if ('recording' in $$props) $$invalidate(1, recording = $$props.recording);
    		if ('isVoiceRecordingSelected' in $$props) isVoiceRecordingSelected = $$props.isVoiceRecordingSelected;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		backgroundImage,
    		recording,
    		$_,
    		$store_selectedSound,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8
    	];
    }

    class SettingsScreen$8 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SettingsScreen",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\routes\SimplifiedChinesePrivacyPolicy.svelte generated by Svelte v3.59.2 */
    const file$4 = "src\\routes\\SimplifiedChinesePrivacyPolicy.svelte";

    function create_fragment$5(ctx) {
    	let div2;
    	let div0;
    	let button;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h1;
    	let t2;
    	let h2;
    	let t4;
    	let h30;
    	let t6;
    	let h31;
    	let t8;
    	let h32;
    	let t10;
    	let h33;
    	let t12;
    	let h34;
    	let t14;
    	let h35;
    	let t16;
    	let h36;
    	let t18;
    	let h37;
    	let t20;
    	let h38;
    	let t22;
    	let h39;
    	let t23;
    	let span0;
    	let t25;
    	let h310;
    	let t26;
    	let span1;
    	let t28;
    	let h311;
    	let t29;
    	let span2;
    	let t31;
    	let h312;
    	let t33;
    	let h313;
    	let t35;
    	let h314;
    	let t36;
    	let span3;
    	let t38;
    	let h315;
    	let t39;
    	let span4;
    	let t41;
    	let h316;
    	let t42;
    	let span5;
    	let t44;
    	let h317;
    	let t46;
    	let h318;
    	let t48;
    	let h319;
    	let t50;
    	let h320;
    	let t52;
    	let h321;
    	let t54;
    	let h322;
    	let t56;
    	let h323;
    	let t58;
    	let h324;
    	let t60;
    	let h325;
    	let t62;
    	let h326;
    	let t64;
    	let h327;
    	let t66;
    	let h328;
    	let t68;
    	let h329;
    	let t70;
    	let h330;
    	let t72;
    	let h331;
    	let t74;
    	let h332;
    	let t76;
    	let h333;
    	let t78;
    	let h334;
    	let t80;
    	let h335;
    	let t82;
    	let h336;
    	let t84;
    	let h337;
    	let t86;
    	let h338;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			button = element("button");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "隐私政策";
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "LifeSense Group 隐私政策";
    			t4 = space();
    			h30 = element("h3");
    			h30.textContent = "（最后更新：2026 年 8 月 2 日）";
    			t6 = space();
    			h31 = element("h3");
    			h31.textContent = "LifeSense Group 相信，可穿戴技术能够帮助人们独立了解并改善自己的健康。我们充分认识到，保护尿失禁等敏感数据是一项重大责任。我们致力于实现最高标准的隐私和安全，并透明地说明我们如何处理数据。";
    			t8 = space();
    			h32 = element("h3");
    			h32.textContent = "我们希望这份隐私政策清晰、诚实且透明。如有任何问题，请通过 info@oopsieheroes.com 联系我们。";
    			t10 = space();
    			h33 = element("h3");
    			h33.textContent = "LifeSense Group 地址：High Tech Campus 32, 5656AE, Eindhoven, The Netherlands。更多联系信息请参见我们的网站。LifeSense Group 已指定数据保护官，可通过 info@oopsieheroes.com 联系。";
    			t12 = space();
    			h34 = element("h3");
    			h34.textContent = "1. LifeSense Group 如何处理您的个人数据";
    			t14 = space();
    			h35 = element("h3");
    			h35.textContent = "数据处理是 LifeSense Group 所有工作的核心。当您使用我们的服务，例如 Oopsie Heroes 或 Carin Pelvic Floor Trainer 应用，或访问我们的网站时，部分个人和非个人数据会通过内部工具及第三方工具被收集、存储和分析。";
    			t16 = space();
    			h36 = element("h3");
    			h36.textContent = "我们处理数据的目的包括了解您的需求并改进服务、提供个性化健康信息，以及推进有关尿失禁的科学研究。我们不会处理能够直接识别您身份的个人数据或健康数据，除非您明确同意。";
    			t18 = space();
    			h37 = element("h3");
    			h37.textContent = "1.1 了解您的需求并改进服务";
    			t20 = space();
    			h38 = element("h3");
    			h38.textContent = "当您使用应用或访问网站时，我们会收集设备、事件和使用情况以及 IP 地址等数据，以了解产品使用情况、分析并修复问题，并提供更可靠的服务。我们会尽可能减少收集的数据量。";
    			t22 = space();
    			h39 = element("h3");
    			t23 = text("设备数据 ");
    			span0 = element("span");
    			span0.textContent = "包括设备型号、名称、标识符、设置、应用标识符、崩溃信息，以及浏览器、操作系统和系统设置。";
    			t25 = space();
    			h310 = element("h3");
    			t26 = text("事件和使用数据 ");
    			span1 = element("span");
    			span1.textContent = "包括您访问的页面或在应用中打开的标签页等信息。我们将这些信息汇总，用于了解用户最需要的功能。";
    			t28 = space();
    			h311 = element("h3");
    			t29 = text("IP 地址 ");
    			span2 = element("span");
    			span2.textContent = "我们收集浏览器或移动设备提供的 IP 地址，以向设备提供服务，并出于统计和分析目的确定大致位置。";
    			t31 = space();
    			h312 = element("h3");
    			h312.textContent = "1.2 提供个性化信息";
    			t33 = space();
    			h313 = element("h3");
    			h313.textContent = "您在应用中记录的健康和活动数据属于敏感个人数据。未经您的明确许可，LifeSense Group 不会存储此类数据。只有在您创建 LifeSense Group 帐户并明确同意后，我们才会将健康数据与创建帐户所需的个人数据存储在安全服务器上。您可以随时删除帐户撤回同意；没有帐户时，数据仅存储在您的设备上，请定期备份。";
    			t35 = space();
    			h314 = element("h3");
    			t36 = text("帐户数据 ");
    			span3 = element("span");
    			span3.textContent = "创建帐户需要您的姓名、姓氏和电子邮件地址。";
    			t38 = space();
    			h315 = element("h3");
    			t39 = text("健康和敏感数据 ");
    			span4 = element("span");
    			span4.textContent = "包括年龄、性别以及过去和当前的尿失禁事件日期，用于向您提供服务。";
    			t41 = space();
    			h316 = element("h3");
    			t42 = text("麦克风 ");
    			span5 = element("span");
    			span5.textContent = "我们会从移动设备读取麦克风音频以检测 Oopsie Heroes 传感器信号，但不会保存音频。";
    			t44 = space();
    			h317 = element("h3");
    			h317.textContent = "1.3 推进科学研究";
    			t46 = space();
    			h318 = element("h3");
    			h318.textContent = "LifeSense Group 与学术研究人员合作，推动可穿戴技术改善健康。我们仅在严格匿名化、删除可能识别用户的信息后，向科学研究提供数据。我们努力以所有用户都易于阅读的方式发布研究结果。您可以随时删除帐户，撤回将数据用于未来研究的同意。";
    			t48 = space();
    			h319 = element("h3");
    			h319.textContent = "2. 您对健康和敏感数据处理的同意";
    			t50 = space();
    			h320 = element("h3");
    			h320.textContent = "创建帐户后，您的个人数据（包括健康和敏感数据）会存储并处理在您的设备和 LifeSense Group 服务器上，以便备份数据并启用更多功能。您同意我们仅为提供和改进服务而处理您提供的数据，并可能使用尿失禁数据创建匿名数据集用于学术和临床研究。您可以随时删除帐户撤回同意。";
    			t52 = space();
    			h321 = element("h3");
    			h321.textContent = "3. 您的权利";
    			t54 = space();
    			h322 = element("h3");
    			h322.textContent = "隐私是基本人权。您有权请求了解我们处理的个人数据、获取数据备份、在应用设置中更正个人和健康信息、随时撤回同意、请求删除数据，以及在认为我们违反数据保护法规时向相关监管机构投诉。删除请求请联系 info@oopsieheroes.com，我们将在 30 天内删除您的数据。";
    			t56 = space();
    			h323 = element("h3");
    			h323.textContent = "4. 数据安全";
    			t58 = space();
    			h324 = element("h3");
    			h324.textContent = "我们采取安全措施防止个人信息被滥用、丢失或更改，并遵循行业最佳实践传输和存储数据。帐户资料与尿失禁记录和服务设置分开存储。服务器位于欧盟，设备与服务器之间使用 HTTPS 加密传输。";
    			t60 = space();
    			h325 = element("h3");
    			h325.textContent = "4.1 保护数据的建议";
    			t62 = space();
    			h326 = element("h3");
    			h326.textContent = "请为设备启用 PIN、Touch ID 或 Face ID，并设置设备丢失后的远程擦除功能。没有帐户的用户应定期备份数据；删除应用或丢失设备可能导致本地数据丢失。";
    			t64 = space();
    			h327 = element("h3");
    			h327.textContent = "5. 向欧盟以外地区及第三方应用传输数据";
    			t66 = space();
    			h328 = element("h3");
    			h328.textContent = "收集的个人数据仅会在遵守适用隐私法规并确保您的隐私权受到保护的情况下，传输到欧盟或欧洲经济区以外的国家。";
    			t68 = space();
    			h329 = element("h3");
    			h329.textContent = "6. Cookie 和跟踪";
    			t70 = space();
    			h330 = element("h3");
    			h330.textContent = "我们的网站使用 Cookie 来保存偏好、提供服务并向第三方分析工具提供跟踪数据。您可以在浏览器或设备中禁用 Cookie。应用和网站也使用第三方分析服务来了解服务使用情况并改善体验，相关信息会在不再需要时删除，并会在匿名化后按本政策处理。";
    			t72 = space();
    			h331 = element("h3");
    			h331.textContent = "6.1 Google Analytics";
    			t74 = space();
    			h332 = element("h3");
    			h332.textContent = "网站使用 Google Analytics 分析访问和互动情况。Cookie 产生的信息可能会传输并存储在美国的 Google 服务器上。您可以更改浏览器设置阻止 Cookie；使用网站即表示您同意 Google 按上述方式处理非个人数据，您可以随时撤回对未来活动的同意。";
    			t76 = space();
    			h333 = element("h3");
    			h333.textContent = "7. 通信和新闻通讯";
    			t78 = space();
    			h334 = element("h3");
    			h334.textContent = "如果您订阅新闻通讯或同意通知，LifeSense Group 可能使用您的电子邮件地址发送推送通知、应用内消息、健康信息和偶尔的推广内容。您可以通过邮件中的取消订阅链接或设备设置随时撤回同意。";
    			t80 = space();
    			h335 = element("h3");
    			h335.textContent = "8. 隐私政策的变更";
    			t82 = space();
    			h336 = element("h3");
    			h336.textContent = "LifeSense Group 可能根据法律、数据收集和使用方式、服务功能或技术变化不时修改本政策。请定期查看本页面。如有重大变更，我们会在本政策中发布通知。";
    			t84 = space();
    			h337 = element("h3");
    			h337.textContent = "如果本隐私政策有任何不清楚之处，或您有其他问题，请通过 info@oopsieheroes.com 联系我们。";
    			t86 = space();
    			h338 = element("h3");
    			h338.textContent = "©2019 LifeSense Group B.V.";
    			set_style(img, "width", "3vw");
    			if (!src_url_equal(img.src, img_src_value = "build/images/Arrow_icon.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "返回");
    			attr_dev(img, "width", "100%");
    			attr_dev(img, "class", "svelte-1u744f6");
    			add_location(img, file$4, 57, 6, 1091);
    			attr_dev(button, "class", "back-button svelte-1u744f6");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "aria-label", "Go back");
    			add_location(button, file$4, 56, 4, 997);
    			attr_dev(div0, "class", "Arrow center svelte-1u744f6");
    			add_location(div0, file$4, 55, 2, 965);
    			attr_dev(h1, "class", "text-with-margin navy-blue-text svelte-1u744f6");
    			add_location(h1, file$4, 62, 4, 1256);
    			attr_dev(h2, "class", "text-with-margin svelte-1u744f6");
    			add_location(h2, file$4, 63, 4, 1315);
    			attr_dev(h30, "class", "text-with-margin unbold-text oblique svelte-1u744f6");
    			add_location(h30, file$4, 64, 4, 1375);
    			attr_dev(h31, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h31, file$4, 65, 4, 1456);
    			attr_dev(h32, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h32, file$4, 66, 4, 1610);
    			attr_dev(h33, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h33, file$4, 67, 4, 1719);
    			attr_dev(h34, "class", "text-with-margin svelte-1u744f6");
    			add_location(h34, file$4, 69, 4, 1917);
    			attr_dev(h35, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h35, file$4, 70, 4, 1986);
    			attr_dev(h36, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h36, file$4, 71, 4, 2170);
    			attr_dev(h37, "class", "text-with-margin oblique svelte-1u744f6");
    			add_location(h37, file$4, 73, 4, 2306);
    			attr_dev(h38, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h38, file$4, 74, 4, 2369);
    			attr_dev(span0, "class", "unbold-text svelte-1u744f6");
    			add_location(span0, file$4, 75, 38, 2538);
    			attr_dev(h39, "class", "text-with-margin svelte-1u744f6");
    			add_location(h39, file$4, 75, 4, 2504);
    			attr_dev(span1, "class", "unbold-text svelte-1u744f6");
    			add_location(span1, file$4, 76, 41, 2663);
    			attr_dev(h310, "class", "text-with-margin svelte-1u744f6");
    			add_location(h310, file$4, 76, 4, 2626);
    			attr_dev(span2, "class", "unbold-text svelte-1u744f6");
    			add_location(span2, file$4, 77, 39, 2788);
    			attr_dev(h311, "class", "text-with-margin svelte-1u744f6");
    			add_location(h311, file$4, 77, 4, 2753);
    			attr_dev(h312, "class", "text-with-margin oblique svelte-1u744f6");
    			add_location(h312, file$4, 79, 4, 2882);
    			attr_dev(h313, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h313, file$4, 80, 4, 2941);
    			attr_dev(span3, "class", "unbold-text svelte-1u744f6");
    			add_location(span3, file$4, 81, 38, 3186);
    			attr_dev(h314, "class", "text-with-margin svelte-1u744f6");
    			add_location(h314, file$4, 81, 4, 3152);
    			attr_dev(span4, "class", "unbold-text svelte-1u744f6");
    			add_location(span4, file$4, 82, 41, 3288);
    			attr_dev(h315, "class", "text-with-margin svelte-1u744f6");
    			add_location(h315, file$4, 82, 4, 3251);
    			attr_dev(span5, "class", "unbold-text svelte-1u744f6");
    			add_location(span5, file$4, 83, 37, 3397);
    			attr_dev(h316, "class", "text-with-margin svelte-1u744f6");
    			add_location(h316, file$4, 83, 4, 3364);
    			attr_dev(h317, "class", "text-with-margin oblique svelte-1u744f6");
    			add_location(h317, file$4, 85, 4, 3490);
    			attr_dev(h318, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h318, file$4, 86, 4, 3548);
    			attr_dev(h319, "class", "text-with-margin svelte-1u744f6");
    			add_location(h319, file$4, 88, 4, 3722);
    			attr_dev(h320, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h320, file$4, 89, 4, 3779);
    			attr_dev(h321, "class", "text-with-margin svelte-1u744f6");
    			add_location(h321, file$4, 91, 4, 3969);
    			attr_dev(h322, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h322, file$4, 92, 4, 4016);
    			attr_dev(h323, "class", "text-with-margin svelte-1u744f6");
    			add_location(h323, file$4, 94, 4, 4205);
    			attr_dev(h324, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h324, file$4, 95, 4, 4252);
    			attr_dev(h325, "class", "text-with-margin oblique svelte-1u744f6");
    			add_location(h325, file$4, 96, 4, 4395);
    			attr_dev(h326, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h326, file$4, 97, 4, 4454);
    			attr_dev(h327, "class", "text-with-margin svelte-1u744f6");
    			add_location(h327, file$4, 99, 4, 4589);
    			attr_dev(h328, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h328, file$4, 100, 4, 4649);
    			attr_dev(h329, "class", "text-with-margin svelte-1u744f6");
    			add_location(h329, file$4, 101, 4, 4753);
    			attr_dev(h330, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h330, file$4, 102, 4, 4806);
    			attr_dev(h331, "class", "text-with-margin oblique svelte-1u744f6");
    			add_location(h331, file$4, 103, 4, 4978);
    			attr_dev(h332, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h332, file$4, 104, 4, 5046);
    			attr_dev(h333, "class", "text-with-margin svelte-1u744f6");
    			add_location(h333, file$4, 106, 4, 5236);
    			attr_dev(h334, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h334, file$4, 107, 4, 5286);
    			attr_dev(h335, "class", "text-with-margin svelte-1u744f6");
    			add_location(h335, file$4, 108, 4, 5434);
    			attr_dev(h336, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h336, file$4, 109, 4, 5484);
    			attr_dev(h337, "class", "text-with-margin unbold-text oblique svelte-1u744f6");
    			add_location(h337, file$4, 110, 4, 5615);
    			attr_dev(h338, "class", "text-with-margin unbold-text svelte-1u744f6");
    			add_location(h338, file$4, 111, 4, 5730);
    			attr_dev(div1, "class", "Margin");
    			set_style(div1, "font-family", "Arial");
    			add_location(div1, file$4, 61, 2, 1202);
    			attr_dev(div2, "id", "scrollable-content");
    			attr_dev(div2, "class", "svelte-1u744f6");
    			add_location(div2, file$4, 54, 0, 932);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, button);
    			append_dev(button, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, h2);
    			append_dev(div1, t4);
    			append_dev(div1, h30);
    			append_dev(div1, t6);
    			append_dev(div1, h31);
    			append_dev(div1, t8);
    			append_dev(div1, h32);
    			append_dev(div1, t10);
    			append_dev(div1, h33);
    			append_dev(div1, t12);
    			append_dev(div1, h34);
    			append_dev(div1, t14);
    			append_dev(div1, h35);
    			append_dev(div1, t16);
    			append_dev(div1, h36);
    			append_dev(div1, t18);
    			append_dev(div1, h37);
    			append_dev(div1, t20);
    			append_dev(div1, h38);
    			append_dev(div1, t22);
    			append_dev(div1, h39);
    			append_dev(h39, t23);
    			append_dev(h39, span0);
    			append_dev(div1, t25);
    			append_dev(div1, h310);
    			append_dev(h310, t26);
    			append_dev(h310, span1);
    			append_dev(div1, t28);
    			append_dev(div1, h311);
    			append_dev(h311, t29);
    			append_dev(h311, span2);
    			append_dev(div1, t31);
    			append_dev(div1, h312);
    			append_dev(div1, t33);
    			append_dev(div1, h313);
    			append_dev(div1, t35);
    			append_dev(div1, h314);
    			append_dev(h314, t36);
    			append_dev(h314, span3);
    			append_dev(div1, t38);
    			append_dev(div1, h315);
    			append_dev(h315, t39);
    			append_dev(h315, span4);
    			append_dev(div1, t41);
    			append_dev(div1, h316);
    			append_dev(h316, t42);
    			append_dev(h316, span5);
    			append_dev(div1, t44);
    			append_dev(div1, h317);
    			append_dev(div1, t46);
    			append_dev(div1, h318);
    			append_dev(div1, t48);
    			append_dev(div1, h319);
    			append_dev(div1, t50);
    			append_dev(div1, h320);
    			append_dev(div1, t52);
    			append_dev(div1, h321);
    			append_dev(div1, t54);
    			append_dev(div1, h322);
    			append_dev(div1, t56);
    			append_dev(div1, h323);
    			append_dev(div1, t58);
    			append_dev(div1, h324);
    			append_dev(div1, t60);
    			append_dev(div1, h325);
    			append_dev(div1, t62);
    			append_dev(div1, h326);
    			append_dev(div1, t64);
    			append_dev(div1, h327);
    			append_dev(div1, t66);
    			append_dev(div1, h328);
    			append_dev(div1, t68);
    			append_dev(div1, h329);
    			append_dev(div1, t70);
    			append_dev(div1, h330);
    			append_dev(div1, t72);
    			append_dev(div1, h331);
    			append_dev(div1, t74);
    			append_dev(div1, h332);
    			append_dev(div1, t76);
    			append_dev(div1, h333);
    			append_dev(div1, t78);
    			append_dev(div1, h334);
    			append_dev(div1, t80);
    			append_dev(div1, h335);
    			append_dev(div1, t82);
    			append_dev(div1, h336);
    			append_dev(div1, t84);
    			append_dev(div1, h337);
    			append_dev(div1, t86);
    			append_dev(div1, h338);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[0], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SimplifiedChinesePrivacyPolicy', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SimplifiedChinesePrivacyPolicy> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => pop();
    	$$self.$capture_state = () => ({ pop });
    	return [click_handler];
    }

    class SimplifiedChinesePrivacyPolicy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SimplifiedChinesePrivacyPolicy",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\routes\PrivacyPolicyScreen.svelte generated by Svelte v3.59.2 */

    const { console: console_1$2 } = globals;
    const file$3 = "src\\routes\\PrivacyPolicyScreen.svelte";

    // (84:0) {:else}
    function create_else_block(ctx) {
    	let div2;
    	let div0;
    	let button;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h1;
    	let t2;
    	let h2;
    	let t4;
    	let h30;
    	let t6;
    	let h31;
    	let t8;
    	let h32;
    	let t10;
    	let h33;
    	let t12;
    	let br0;
    	let t13;
    	let h34;
    	let t15;
    	let h35;
    	let t17;
    	let h36;
    	let t19;
    	let br1;
    	let t20;
    	let h37;
    	let t22;
    	let h38;
    	let t24;
    	let h39;
    	let t26;
    	let h310;
    	let t28;
    	let h311;
    	let t29;
    	let span0;
    	let t31;
    	let h312;
    	let t32;
    	let span1;
    	let t34;
    	let h313;
    	let t35;
    	let span2;
    	let t37;
    	let h314;
    	let t39;
    	let h315;
    	let t41;
    	let h316;
    	let t43;
    	let h317;
    	let t45;
    	let h318;
    	let t47;
    	let h319;
    	let t49;
    	let h320;
    	let t50;
    	let span3;
    	let t52;
    	let h321;
    	let t53;
    	let span4;
    	let t55;
    	let h322;
    	let t56;
    	let span5;
    	let t58;
    	let h323;
    	let t60;
    	let h324;
    	let t61;
    	let br2;
    	let t62;
    	let br3;
    	let t63;
    	let br4;
    	let t64;
    	let br5;
    	let t65;
    	let br6;
    	let t66;
    	let br7;
    	let t67;
    	let t68;
    	let h325;
    	let t70;
    	let h326;
    	let t71;
    	let br8;
    	let t72;
    	let br9;
    	let t73;
    	let br10;
    	let t74;
    	let br11;
    	let t75;
    	let br12;
    	let t76;
    	let br13;
    	let t77;
    	let br14;
    	let t78;
    	let br15;
    	let t79;
    	let br16;
    	let t80;
    	let br17;
    	let t81;
    	let t82;
    	let h327;
    	let t84;
    	let h328;
    	let t85;
    	let br18;
    	let t86;
    	let br19;
    	let t87;
    	let br20;
    	let t88;
    	let br21;
    	let t89;
    	let br22;
    	let t90;
    	let br23;
    	let t91;
    	let br24;
    	let t92;
    	let br25;
    	let t93;
    	let br26;
    	let t94;
    	let br27;
    	let t95;
    	let br28;
    	let t96;
    	let br29;
    	let t97;
    	let br30;
    	let t98;
    	let br31;
    	let t99;
    	let br32;
    	let t100;
    	let br33;
    	let t101;
    	let br34;
    	let t102;
    	let br35;
    	let t103;
    	let br36;
    	let t104;
    	let br37;
    	let t105;
    	let br38;
    	let t106;
    	let br39;
    	let t107;
    	let t108;
    	let br40;
    	let t109;
    	let br41;
    	let t110;
    	let h329;
    	let t112;
    	let h330;
    	let t114;
    	let br42;
    	let t115;
    	let br43;
    	let t116;
    	let h331;
    	let t118;
    	let h332;
    	let t119;
    	let br44;
    	let t120;
    	let span6;
    	let br45;
    	let t122;
    	let t123;
    	let br46;
    	let t124;
    	let br47;
    	let t125;
    	let h333;
    	let t127;
    	let h334;
    	let t129;
    	let h335;
    	let t130;
    	let span7;
    	let t132;
    	let h336;
    	let t133;
    	let br48;
    	let t134;
    	let t135;
    	let h337;
    	let t136;
    	let span8;
    	let t138;
    	let h338;
    	let t139;
    	let span9;
    	let t141;
    	let h339;
    	let t142;
    	let br49;
    	let t143;
    	let span10;
    	let t145;
    	let br50;
    	let t146;
    	let br51;
    	let h340;
    	let t147;
    	let br52;
    	let t148;
    	let span11;
    	let t149;
    	let br53;
    	let t150;
    	let br54;
    	let t151;
    	let br55;
    	let br56;
    	let t152;
    	let h341;
    	let t154;
    	let h342;
    	let t155;
    	let br57;
    	let t156;
    	let br58;
    	let t157;
    	let t158;
    	let br59;
    	let br60;
    	let t159;
    	let h343;
    	let t161;
    	let h344;
    	let t162;
    	let br61;
    	let t163;
    	let br62;
    	let t164;
    	let t165;
    	let br63;
    	let br64;
    	let t166;
    	let h345;
    	let t168;
    	let h346;
    	let t169;
    	let br65;
    	let t170;
    	let t171;
    	let br66;
    	let br67;
    	let t172;
    	let h347;
    	let t174;
    	let h348;
    	let t175;
    	let br68;
    	let t176;
    	let br69;
    	let t177;
    	let br70;
    	let t178;
    	let t179;
    	let br71;
    	let br72;
    	let t180;
    	let h349;
    	let t182;
    	let h350;
    	let t184;
    	let h351;
    	let t186;
    	let h352;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			button = element("button");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "PRIVACY POLICY";
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "LifeSense Group Privacy Policy";
    			t4 = space();
    			h30 = element("h3");
    			h30.textContent = "(Last updated 02.08.2026)";
    			t6 = space();
    			h31 = element("h3");
    			h31.textContent = "At LifeSense Group, we believe that wearable technology empowers people to understand and work on their health independently. We fully acknowledge the great responsibility that comes with safeguarding sensitive data, such as information about your urine loss. We are committed to achieving the highest standards of privacy and security, as well as to being transparent about how we process data.";
    			t8 = space();
    			h32 = element("h3");
    			h32.textContent = "We hope you will find this privacy policy clear, honest, and transparent. Do not hesitate to reach out to us at info@oopsieheroes.com if you have any questions.";
    			t10 = space();
    			h33 = element("h3");
    			h33.textContent = "LifeSense Group contact address is High Tech Campus 32, 5656AE, Eindhoven, The Netherlands. Further contact information can be found here. LifeSense Group has an appointed data protection officer, who can be contacted at info@oopsieheroes.com.";
    			t12 = space();
    			br0 = element("br");
    			t13 = space();
    			h34 = element("h3");
    			h34.textContent = "1. How we process your personal data at LifeSense Group";
    			t15 = space();
    			h35 = element("h3");
    			h35.textContent = "Data processing is at the center of everything we do at LifeSense Group, and whenever you use our services—e.g. when you use the LifeSense Group products apps (like Oopsie Heroes or Carin Pelvic Floor Trainer) or when you go on our website—some personal and non-personal data is collected, stored, and analyzed using internal and third-party tools.";
    			t17 = space();
    			h36 = element("h3");
    			h36.textContent = "Here are the three purposes for which we process data and the type of data that is processed to fulfill each purpose:";
    			t19 = space();
    			br1 = element("br");
    			t20 = space();
    			h37 = element("h3");
    			h37.textContent = "1.1 To understand your needs and improve our services";
    			t22 = space();
    			h38 = element("h3");
    			h38.textContent = "When you use our apps—including use without an account—or when you go on our website LifeSense Group collects, stores, and uses some personal and non-personal data and transmits it to some third-party services.";
    			t24 = space();
    			h39 = element("h3");
    			h39.textContent = "We do this in order to understand your needs and your use of our products, to analyze bugs and fix issues, and to bring you more useful features. In a nutshell, we process this data to provide you the best and most reliable experience of our services. We do not process personal data that directly identifies you as a person (such as your first name, surname, email) or health-related data.";
    			t26 = space();
    			h310 = element("h3");
    			h310.textContent = "Here are the types of data we collect:";
    			t28 = space();
    			h311 = element("h3");
    			t29 = text("Device data ");
    			span0 = element("span");
    			span0.textContent = "This data informs us about the device you use to access our services, such as the model, name and identifiers, device settings, the application identifier, and crash information. On our website, we collect information about your browser and browser settings, the operating system you use, and the system settings of your device.";
    			t31 = space();
    			h312 = element("h3");
    			t32 = text("Event and usage data ");
    			span1 = element("span");
    			span1.textContent = "When you use the apps or when you go to our website, our servers process data in order to understand your usage of our services—for example, which pages you visit or which tab in the app you open. We collect this information and use it as aggregate data to better understand which features are the most relevant or useful to our users as whole.";
    			t34 = space();
    			h313 = element("h3");
    			t35 = text("IP address ");
    			span2 = element("span");
    			span2.textContent = "We collect IP addresses provided by your browser or mobile device to deliver the service to your device. We also use the IP address to determine your approximate location for statistical and analytics purposes.";
    			t37 = space();
    			h314 = element("h3");
    			h314.textContent = "All the data we collect at LifeSense Group is necessary for LifeSense Group to deliver the services you use. The amount we collect has been minimized wherever possible to respect your privacy.";
    			t39 = space();
    			h315 = element("h3");
    			h315.textContent = "Should you still disagree with the collection and processing of this data, we recommend you stop using our services or delete your account and uninstall the app.";
    			t41 = space();
    			h316 = element("h3");
    			h316.textContent = "1.2 To deliver personalized insights as your trusted health companion";
    			t43 = space();
    			h317 = element("h3");
    			h317.textContent = "The data you track in LifeSense Group apps about your health and activities is considered sensitive personal data. LifeSense Group does not store sensitive personal data without your explicit permission. It is only when you give us explicit consent by creating a LifeSense Group account that we start storing all your health and sensitive data on our secured servers, alongside the personal data necessary to create an account. You can find a detailed explanation of what you consent to when creating an account with LifeSense Group in the next section of our Privacy Policy.";
    			t45 = space();
    			h318 = element("h3");
    			h318.textContent = "You can withdraw your consent at any time by simply deleting your account in the app, newsletter, etc. In this case, you can still use our apps without an account and your data will only be stored locally on your device. All future data will be only stored in your smartphone, so be sure to make regular backups to avoid the loss of your data.";
    			t47 = space();
    			h319 = element("h3");
    			h319.textContent = "Here is the type of data we collect and store when you create an account:";
    			t49 = space();
    			h320 = element("h3");
    			t50 = text("Personal data used for account creation ");
    			span3 = element("span");
    			span3.textContent = "We need some of your personal data, such as your name, surname, and email address, in order to create your account.";
    			t52 = space();
    			h321 = element("h3");
    			t53 = text("Health and sensitive data ");
    			span4 = element("span");
    			span4.textContent = "We store health data, such as your age, gender and dates of your past and current urine loss events. LifeSense Group uses this data for the purpose of providing our services to you.";
    			t55 = space();
    			h322 = element("h3");
    			t56 = text("Microphone ");
    			span5 = element("span");
    			span5.textContent = "We record (but don’t save) microphone audio from the mobile device to be able to detect the signal from the Oopsie Heroes sensor. The data is directly processed and is not saved anywhere.";
    			t58 = space();
    			h323 = element("h3");
    			h323.textContent = "1.3 To advance scientific research about urine loss";
    			t60 = space();
    			h324 = element("h3");
    			t61 = text("The vision of LifeSense Group is: seek to inspire a healthier life for everyone, everyday. LifeSense aims to empower people everyday by revolutionizing healthcare with wearable technology. Since its inception, LifeSense Group has successfully collaborated with academic researchers. ");
    			br2 = element("br");
    			t62 = space();
    			br3 = element("br");
    			t63 = text(" We want to make it very clear that we personally select our scientific collaborators with the utmost care and, most importantly, that we only provide data for scientific research after it has been anonymized following a strict protocol that involves the removal of any information that could be used to identify any specific user.\r\n      ");
    			br4 = element("br");
    			t64 = space();
    			br5 = element("br");
    			t65 = text("\r\n      Finally, because we believe that research should benefit everyone, LifeSense Group strives to publish the results of our academic, clinical, or internal research in ways that are easy to read for all our users.\r\n      ");
    			br6 = element("br");
    			t66 = space();
    			br7 = element("br");
    			t67 = text("\r\n      Once again, you can withdraw your consent to use of your data for these purposes at any time by deleting your account. If you do this, your data won’t be included in any future research partnerships.");
    			t68 = space();
    			h325 = element("h3");
    			h325.textContent = "2. Your consent for processing health and sensitive data";
    			t70 = space();
    			h326 = element("h3");
    			t71 = text("If you create an account with LifeSense Group apps, your personal data—including sensitive data and data related to your health—is stored on your device and is also stored and processed on LifeSense Group servers. This is done so we can offer you the option of backing up your data and to enable additional features.\r\n      ");
    			br8 = element("br");
    			t72 = space();
    			br9 = element("br");
    			t73 = text(" By creating an account with LifeSense Group you explicitly consent that: ");
    			br10 = element("br");
    			t74 = space();
    			br11 = element("br");
    			t75 = text("\r\n      1. LifeSense Group may store and process personal data you provide through the usage of the LifeSense Group apps and through the account creation process solely for the purpose of providing LifeSense Group services to you and to improve LifeSense Group’s service features. Such LifeSense Group services may include sending you information and reminders through the LifeSense Group apps or to the email address you provided to LifeSense Group.\r\n      ");
    			br12 = element("br");
    			t76 = space();
    			br13 = element("br");
    			t77 = text(" 2. Personal data you provide to LifeSense Group through the account creation process includes personal data you enter into the LifeSense Group apps, such as your account data (e.g. your name and email address). Depending on the data you provide, it may also contain information about your age and gender.\r\n      ");
    			br14 = element("br");
    			t78 = space();
    			br15 = element("br");
    			t79 = text(" 3.  LifeSense Group may use your urine loss data to create anonymized sets of data for academic and clinical research purposes. LifeSense Group’s collaborators are individually selected through an internal vetting process. This anonymized research data cannot be linked to you as an individual or identify you in any way.\r\n      ");
    			br16 = element("br");
    			t80 = space();
    			br17 = element("br");
    			t81 = text(" You may withdraw your consent to this use of your data at any time by deleting your LifeSense Group apps account. If you choose to do so, you may continue using the LifeSense Group app without an account, but since a copy of your data will no longer be stored on our servers, please be sure to make regular backups of your data to avoid data loss—we are not able to retrieve lost data of users without LifeSense Group apps accounts.");
    			t82 = space();
    			h327 = element("h3");
    			h327.textContent = "3. Your rights";
    			t84 = space();
    			h328 = element("h3");
    			t85 = text("We believe that privacy—including data privacy—is a basic human right. At LifeSense Group we strive to ensure that your rights are respected. ");
    			br18 = element("br");
    			t86 = space();
    			br19 = element("br");
    			t87 = text("\r\n      Here are some key facts about your privacy that we would like you to know:");
    			br20 = element("br");
    			t88 = space();
    			br21 = element("br");
    			t89 = text("\r\n      1. \r\n    Our products and services have been designed to minimize the use of your personal data. We only collect and process your data for the purposes that have been previously outlined.\r\n    ");
    			br22 = element("br");
    			t90 = space();
    			br23 = element("br");
    			t91 = text("\r\n    2. The security of our servers is routinely verified by experts to protect your data from unauthorized access. You can contact us at info@oopsieheroes.com if you have any questions about the security of our services.\r\n    ");
    			br24 = element("br");
    			t92 = space();
    			br25 = element("br");
    			t93 = text("\r\n    iii. We do not retain your data in an identifiable format for longer than necessary to deliver our services.\r\n    ");
    			br26 = element("br");
    			t94 = space();
    			br27 = element("br");
    			t95 = text(" 1. LifeSense Group does not engage in any automated decision-making or profiling activities. ");
    			br28 = element("br");
    			t96 = space();
    			br29 = element("br");
    			t97 = text("\r\n    As a user of LifeSense Group’s services and website, you may exercise your user rights to:");
    			br30 = element("br");
    			t98 = space();
    			br31 = element("br");
    			t99 = text("\r\n    1. Request information on your personal data processed by LifeSense Group. Upon your request, this information will be provided to you electronically.\r\n    2. Gain access to your information by requesting a backup of your data (as explained in the next section) in a format that is readable by other companies or organizations (data portability).\r\n    ");
    			br32 = element("br");
    			t100 = space();
    			br33 = element("br");
    			t101 = text("\r\n    iii. Correct your personal information and health data in the app settings and in the tracking categories available in the LifeSense Group apps.");
    			br34 = element("br");
    			t102 = space();
    			br35 = element("br");
    			t103 = text("\r\n    1. Withdraw your consent from data processing at any time by deleting your account (as explained in the support section of the apps) and/or unsubscribing from our newsletter by clicking the link at bottom of the email or by contacting info@oopsieheroes.com.\r\n    ");
    			br36 = element("br");
    			t104 = space();
    			br37 = element("br");
    			t105 = text("\r\n     2. Request the complete deletion of your data, including all past data sent to third-party services used for tracking and analysis, by reaching out to info@oopsieheroes.com. Your data will be deleted within 30 days.\r\n     ");
    			br38 = element("br");
    			t106 = space();
    			br39 = element("br");
    			t107 = text("\r\n     3. Lodge a complaint with the relevant supervising authority if you believe LifeSense Group is processing your personal data under violation of applicable data protection regulations.");
    			t108 = space();
    			br40 = element("br");
    			t109 = space();
    			br41 = element("br");
    			t110 = space();
    			h329 = element("h3");
    			h329.textContent = "4. Data Security";
    			t112 = space();
    			h330 = element("h3");
    			h330.textContent = "We apply security measures to protect against the misuse, loss, and/or alteration of personal information under our control. We follow industry best practices when transferring and storing your data. Though we cannot ensure or guarantee that misuse, loss or alteration of information will never occur, we use all reasonable efforts to prevent it.";
    			t114 = space();
    			br42 = element("br");
    			t115 = space();
    			br43 = element("br");
    			t116 = space();
    			h331 = element("h3");
    			h331.textContent = "4.1 How LifeSense Group stores your personal data";
    			t118 = space();
    			h332 = element("h3");
    			t119 = text("If you have an account with LifeSense Group, your personal profile data is stored separately from your urine loss tracking data and your service settings. This allows us to ensure the highest possible level of privacy for your cycle information. Your password will be stored when implemented using one-way encryption (“hashing” plus “salting”) and it cannot be read by us.\r\n  ");
    			br44 = element("br");
    			t120 = space();
    			span6 = element("span");
    			span6.textContent = "Important: LifeSense Group uses servers located in the European Union to process and store your personal data. ";
    			br45 = element("br");
    			t122 = text("\r\n  Your data is transmitted between your device and LifeSense Group’s servers using the HTTPS protocol for encryption. HTTPS is the same technology used to create secure connections for your web browser and is indicated by a padlock icon in the URL bar of your browser.");
    			t123 = space();
    			br46 = element("br");
    			t124 = space();
    			br47 = element("br");
    			t125 = space();
    			h333 = element("h3");
    			h333.textContent = "4.2 LifeSense Group’s recommendations for protecting your data";
    			t127 = space();
    			h334 = element("h3");
    			h334.textContent = "We believe the biggest threat to the security and privacy of your data is if someone—probably someone you know—gains access to any of your devices. The data you enter into LifeSense Group apps is private and it should stay that way. We have outlined some ways to keep your devices secure below.";
    			t129 = space();
    			h335 = element("h3");
    			t130 = text("Protect your device: ");
    			span7 = element("span");
    			span7.textContent = "i. Activate either PIN, TouchID (iPhone 5S-8), or FaceID (iPhone X) authentication for your device. This automatically encrypts your LifeSense Group data and prevents any person from using your device without your permission.";
    			t132 = space();
    			h336 = element("h3");
    			t133 = text("1. Set up a feature that will allow you to erase all the data from your device if it’s been lost or stolen. For iOS, activating this feature is a two-step process: first, you need to Activate “Find My iPhone” via iCloud (see instructions on Apple Support pages) and then enable “Erase your device” (see instructions on Apple Support pages). ");
    			br48 = element("br");
    			t134 = text("\r\n  For Android, download and set up Find My Device (formerly Android Device Manager) from the Google Play Store and, if needed, use the connected web interface to lock or wipe your phone remotely.");
    			t135 = space();
    			h337 = element("h3");
    			t136 = text("Recommendations for LifeSense Group users without accounts: ");
    			span8 = element("span");
    			span8.textContent = "If you don’t register an account with LifeSense Group, all of your data will be stored solely on your device and we won’t have access to it. If you delete LifeSense Group apps or lose your device, your data in the LifeSense Group apps will also be lost. If you don’t have an account with LifeSense Group, we strongly recommend that you back up your LifeSense Group data regularly.";
    			t138 = space();
    			h338 = element("h3");
    			t139 = text("Back up LifeSense Group apps data on iOS without an account ");
    			span9 = element("span");
    			span9.textContent = "Use Apple’s backup solution via iTunes or iCloud. See Apple’s support pages for instructions.";
    			t141 = space();
    			h339 = element("h3");
    			t142 = text("5. Data transfer outside the EU and to third-party applications ");
    			br49 = element("br");
    			t143 = space();
    			span10 = element("span");
    			span10.textContent = "Any personal data collected from you may only be transferred to countries outside the European Union / the European Economic Area (EEA) observing applicable privacy regulations and ensuring that your privacy rights remain protected.";
    			t145 = space();
    			br50 = element("br");
    			t146 = space();
    			br51 = element("br");
    			h340 = element("h3");
    			t147 = text("6. Cookies and tracking ");
    			br52 = element("br");
    			t148 = space();
    			span11 = element("span");
    			t149 = text("Our website uses cookies, which are small text files that are intended to make the site better for you to use. In general, cookies are used to retain preferences, store information for things like shopping carts, and provide tracking data to third-party applications like Google Analytics. You may, however, disable cookies on LifeSense Group’s site. The most effective way to do this is to disable cookies in your browser. We suggest consulting the help section of your browser or doing your own web research on how to disable cookies. ");
    			br53 = element("br");
    			t150 = text(" The LifeSense Group apps and our website also use third-party analysis and tracking services to track the performance of our services, understand how you use our services, and offer you an improved and safer experience. ");
    			br54 = element("br");
    			t151 = text(" Information on your usage of our website or of the LifeSense Group app may be collected and processed by LifeSense Group, or a third party engaged by LifeSense Group using a unique identification number assigned to you. Such usage information will be deleted as soon as this information is no longer required for the purpose collected, and will not be shared with third parties besides those mentioned under Section 6.2 after being anonymized.\r\n");
    			br55 = element("br");
    			br56 = element("br");
    			t152 = space();
    			h341 = element("h3");
    			h341.textContent = "6.1 Your consent for LifeSense Group tracking and analysis";
    			t154 = space();
    			h342 = element("h3");
    			t155 = text("By using our apps and our website you consent that LifeSense Group may use cookies and third-party services, and collect your usage data under a unique identifier, for the purposes of tracking, analysis, and improvement of our website and app.\r\n  ");
    			br57 = element("br");
    			t156 = text(" You may withdraw your consent at any time, by either disabling cookies on your device or following the instructions on how to withdraw your consent individually for each third-party provider LifeSense Group uses for its third-party tracking and analysis services.\r\n  ");
    			br58 = element("br");
    			t157 = text(" For the purpose of tracking the performance of our services and to improve LifeSense Group services LifeSense Group uses the following third-party services:");
    			t158 = space();
    			br59 = element("br");
    			br60 = element("br");
    			t159 = space();
    			h343 = element("h3");
    			h343.textContent = "6.2 Google Analytics";
    			t161 = space();
    			h344 = element("h3");
    			t162 = text("Our website uses Google Analytics, a web analysis service operated by Google Inc. (“Google”). Google Analytics uses cookies (text files) stored on your computer to allow for analysis of your visits to websites and interactions with them in order to personalize your experience and improve our services. Information produced via cookies will be transferred to and stored on a server in the USA operated by Google.\r\n  ");
    			br61 = element("br");
    			t163 = text(" Google analyzes this information to offer reports for LifeSense Group on website usage and online usage of associated services. Google may also transfer this information to third parties either when this is required by law or when third parties are contracted by Google to process this data. Google will not allow your IP address to be linked to any other personal data. You can prevent cookies from being stored on your computer by changing your browser settings; however, if you choose to do this, your experience when visiting our website or using some of our features may be altered.\r\n  ");
    			br62 = element("br");
    			t164 = text(" By using LifeSense Group’s website, you consent to have non-personal data used and processed by Google as described above. You can withdraw consent for this use of your data at any time, but this withdrawal only applies to future activities.");
    			t165 = space();
    			br63 = element("br");
    			br64 = element("br");
    			t166 = space();
    			h345 = element("h3");
    			h345.textContent = "6.3";
    			t168 = space();
    			h346 = element("h3");
    			t169 = text("The above mentioned company is compliant with the EU-US Privacy Shield Framework that ensures that European data privacy requirement are met. The privacy policy of these services can be found on their respective websites.\r\n  ");
    			br65 = element("br");
    			t170 = text("\r\n  Read more about the EU-US Privacy Shield Framework.");
    			t171 = space();
    			br66 = element("br");
    			br67 = element("br");
    			t172 = space();
    			h347 = element("h3");
    			h347.textContent = "7. Communications and newsletter activities";
    			t174 = space();
    			h348 = element("h3");
    			t175 = text("LifeSense Group uses your personal information, such as your email address, to contact you with messages, emails, and newsletters. These include push notifications and in-app messages, informational content about health delivered to you via email, as well as occasional promotional materials that may be of interest to you, also sent via email.\r\n    ");
    			br68 = element("br");
    			t176 = text(" Such services are only provided to you if you have signed up for the newsletter service or given your consent for these notifications. You can withdraw your consent at any time from either or both of the two—you can unsubscribe from our newsletter by clicking the unsubscribe link at the bottom of the message and disable notifications sent by LifeSense Group in your device settings.\r\n    ");
    			br69 = element("br");
    			t177 = text(" In order to provide these services, LifeSense Group may forward information such as your email address to third-party providers in order to carry out such newsletter service or notification. These providers are the Rocket Science Group LLC (“MailChimp”), seated in Atlanta, USA, which may process your email address, name and usage data to send you informational and occasional commercial content via email.\r\n    ");
    			br70 = element("br");
    			t178 = text(" The privacy policy of these services can be found on their respective websites. This company is compliant with the EU-US Privacy Shield Framework that ensures that European data privacy requirements are met.");
    			t179 = space();
    			br71 = element("br");
    			br72 = element("br");
    			t180 = space();
    			h349 = element("h3");
    			h349.textContent = "8. Changes to this Privacy Policy";
    			t182 = space();
    			h350 = element("h3");
    			h350.textContent = "LifeSense Group reserves the right to amend this Privacy Policy from time to time to reflect changes in the law, our data collection and data use practices, the features of LifeSense Group’s services, or advances in technology. Please check this page periodically for changes. If we make a change to this Privacy Policy that, in our sole discretion, is material, we will notify you by posting notice of these changes in this Privacy Policy.";
    			t184 = space();
    			h351 = element("h3");
    			h351.textContent = "If any part of our Privacy Policy was unclear or if you have further questions, get in touch at info@oopsieheroes.com.";
    			t186 = space();
    			h352 = element("h3");
    			h352.textContent = "©2019 LifeSense Group B.V.";
    			if (!src_url_equal(img.src, img_src_value = "build/images/Arrow_icon.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "aria-hidden", "true");
    			attr_dev(img, "class", "svelte-1xdvoqe");
    			add_location(img, file$3, 87, 4, 1876);
    			attr_dev(button, "class", "back-button svelte-1xdvoqe");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "aria-label", "Go back");
    			add_location(button, file$3, 86, 4, 1784);
    			attr_dev(div0, "class", "Arrow center svelte-1xdvoqe");
    			add_location(div0, file$3, 85, 2, 1752);
    			attr_dev(h1, "class", "text-with-margin navy-blue-text svelte-1xdvoqe");
    			add_location(h1, file$3, 92, 2, 2028);
    			attr_dev(h2, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h2, file$3, 93, 2, 2095);
    			attr_dev(h30, "class", "text-with-margin unbold-text oblique svelte-1xdvoqe");
    			add_location(h30, file$3, 94, 2, 2163);
    			attr_dev(h31, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h31, file$3, 95, 4, 2249);
    			attr_dev(h32, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h32, file$3, 97, 3, 2700);
    			attr_dev(h33, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h33, file$3, 98, 3, 2912);
    			add_location(br0, file$3, 99, 3, 3207);
    			attr_dev(h34, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h34, file$3, 100, 3, 3216);
    			attr_dev(h35, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h35, file$3, 101, 3, 3312);
    			attr_dev(h36, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h36, file$3, 103, 3, 3715);
    			add_location(br1, file$3, 104, 3, 3884);
    			attr_dev(h37, "class", "text-with-margin oblique svelte-1xdvoqe");
    			add_location(h37, file$3, 105, 3, 3893);
    			attr_dev(h38, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h38, file$3, 107, 3, 3996);
    			attr_dev(h39, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h39, file$3, 108, 3, 4258);
    			attr_dev(h310, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h310, file$3, 110, 3, 4705);
    			attr_dev(span0, "class", "unbold-text svelte-1xdvoqe");
    			add_location(span0, file$3, 112, 45, 4839);
    			attr_dev(h311, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h311, file$3, 112, 4, 4798);
    			attr_dev(span1, "class", "unbold-text svelte-1xdvoqe");
    			add_location(span1, file$3, 114, 54, 5268);
    			attr_dev(h312, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h312, file$3, 114, 4, 5218);
    			attr_dev(span2, "class", "unbold-text svelte-1xdvoqe");
    			add_location(span2, file$3, 117, 44, 5705);
    			attr_dev(h313, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h313, file$3, 117, 4, 5665);
    			attr_dev(h314, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h314, file$3, 119, 4, 5967);
    			attr_dev(h315, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h315, file$3, 120, 4, 6212);
    			attr_dev(h316, "class", "text-with-margin oblique svelte-1xdvoqe");
    			add_location(h316, file$3, 121, 4, 6426);
    			attr_dev(h317, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h317, file$3, 122, 4, 6547);
    			attr_dev(h318, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h318, file$3, 123, 4, 7175);
    			attr_dev(h319, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h319, file$3, 124, 4, 7570);
    			attr_dev(span3, "class", "unbold-text svelte-1xdvoqe");
    			add_location(span3, file$3, 125, 73, 7765);
    			attr_dev(h320, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h320, file$3, 125, 4, 7696);
    			attr_dev(span4, "class", "unbold-text svelte-1xdvoqe");
    			add_location(span4, file$3, 126, 59, 7979);
    			attr_dev(h321, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h321, file$3, 126, 4, 7924);
    			attr_dev(span5, "class", "unbold-text svelte-1xdvoqe");
    			add_location(span5, file$3, 128, 44, 8248);
    			attr_dev(h322, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h322, file$3, 128, 4, 8208);
    			attr_dev(h323, "class", "text-with-margin oblique svelte-1xdvoqe");
    			add_location(h323, file$3, 129, 4, 8479);
    			add_location(br2, file$3, 131, 329, 8911);
    			add_location(br3, file$3, 131, 334, 8916);
    			add_location(br4, file$3, 132, 6, 9259);
    			add_location(br5, file$3, 132, 11, 9264);
    			add_location(br6, file$3, 134, 6, 9494);
    			add_location(br7, file$3, 134, 11, 9499);
    			attr_dev(h324, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h324, file$3, 131, 4, 8586);
    			attr_dev(h325, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h325, file$3, 138, 4, 9729);
    			add_location(br8, file$3, 140, 6, 10191);
    			add_location(br9, file$3, 140, 11, 10196);
    			add_location(br10, file$3, 140, 89, 10274);
    			add_location(br11, file$3, 140, 94, 10279);
    			add_location(br12, file$3, 142, 6, 10741);
    			add_location(br13, file$3, 142, 11, 10746);
    			add_location(br14, file$3, 143, 6, 11063);
    			add_location(br15, file$3, 143, 11, 11068);
    			add_location(br16, file$3, 144, 6, 11402);
    			add_location(br17, file$3, 144, 11, 11407);
    			attr_dev(h326, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h326, file$3, 139, 4, 9825);
    			attr_dev(h327, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h327, file$3, 147, 4, 11863);
    			add_location(br18, file$3, 149, 148, 12108);
    			add_location(br19, file$3, 149, 153, 12113);
    			add_location(br20, file$3, 150, 80, 12199);
    			add_location(br21, file$3, 150, 85, 12204);
    			add_location(br22, file$3, 153, 4, 12409);
    			add_location(br23, file$3, 153, 9, 12414);
    			add_location(br24, file$3, 155, 4, 12646);
    			add_location(br25, file$3, 155, 9, 12651);
    			add_location(br26, file$3, 157, 4, 12775);
    			add_location(br27, file$3, 157, 9, 12780);
    			add_location(br28, file$3, 157, 107, 12878);
    			add_location(br29, file$3, 157, 112, 12883);
    			add_location(br30, file$3, 158, 94, 12983);
    			add_location(br31, file$3, 158, 99, 12988);
    			add_location(br32, file$3, 161, 4, 13350);
    			add_location(br33, file$3, 161, 9, 13355);
    			add_location(br34, file$3, 162, 148, 13509);
    			add_location(br35, file$3, 162, 153, 13514);
    			add_location(br36, file$3, 164, 4, 13787);
    			add_location(br37, file$3, 164, 9, 13792);
    			add_location(br38, file$3, 166, 5, 14025);
    			add_location(br39, file$3, 166, 10, 14030);
    			attr_dev(h328, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h328, file$3, 148, 4, 11917);
    			add_location(br40, file$3, 169, 1, 14235);
    			add_location(br41, file$3, 169, 6, 14240);
    			attr_dev(h329, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h329, file$3, 170, 1, 14247);
    			attr_dev(h330, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h330, file$3, 171, 1, 14300);
    			add_location(br42, file$3, 172, 1, 14696);
    			add_location(br43, file$3, 172, 6, 14701);
    			attr_dev(h331, "class", "text-with-margin oblique svelte-1xdvoqe");
    			add_location(h331, file$3, 172, 12, 14707);
    			add_location(br44, file$3, 175, 2, 15222);
    			attr_dev(span6, "class", "unbold-text oblique  svelte-1xdvoqe");
    			add_location(span6, file$3, 175, 7, 15227);
    			add_location(br45, file$3, 175, 160, 15380);
    			attr_dev(h332, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h332, file$3, 174, 1, 14805);
    			add_location(br46, file$3, 179, 0, 15665);
    			add_location(br47, file$3, 179, 5, 15670);
    			attr_dev(h333, "class", "text-with-margin oblique svelte-1xdvoqe");
    			add_location(h333, file$3, 180, 0, 15676);
    			attr_dev(h334, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h334, file$3, 181, 1, 15784);
    			attr_dev(span7, "class", "unbold-text svelte-1xdvoqe");
    			add_location(span7, file$3, 183, 50, 16178);
    			attr_dev(h335, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h335, file$3, 183, 0, 16128);
    			add_location(br48, file$3, 185, 383, 16829);
    			attr_dev(h336, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h336, file$3, 185, 0, 16446);
    			attr_dev(span8, "class", "unbold-text svelte-1xdvoqe");
    			add_location(span8, file$3, 189, 89, 17130);
    			attr_dev(h337, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h337, file$3, 189, 0, 17041);
    			attr_dev(span9, "class", "unbold-text svelte-1xdvoqe");
    			add_location(span9, file$3, 190, 89, 17640);
    			attr_dev(h338, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h338, file$3, 190, 0, 17551);
    			add_location(br49, file$3, 192, 93, 17872);
    			attr_dev(span10, "class", "unbold-text svelte-1xdvoqe");
    			add_location(span10, file$3, 192, 98, 17877);
    			attr_dev(h339, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h339, file$3, 192, 0, 17779);
    			add_location(br50, file$3, 195, 0, 18154);
    			add_location(br51, file$3, 195, 5, 18159);
    			add_location(br52, file$3, 195, 63, 18217);
    			add_location(br53, file$3, 195, 631, 18785);
    			add_location(br54, file$3, 195, 856, 19010);
    			attr_dev(span11, "class", "unbold-text svelte-1xdvoqe");
    			add_location(span11, file$3, 195, 68, 18222);
    			attr_dev(h340, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h340, file$3, 195, 9, 18163);
    			add_location(br55, file$3, 196, 12, 19472);
    			add_location(br56, file$3, 196, 16, 19476);
    			attr_dev(h341, "class", "text-with-margin oblique svelte-1xdvoqe");
    			add_location(h341, file$3, 197, 0, 19482);
    			add_location(br57, file$3, 199, 2, 19872);
    			add_location(br58, file$3, 200, 2, 20144);
    			attr_dev(h342, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h342, file$3, 198, 0, 19584);
    			add_location(br59, file$3, 202, 0, 20314);
    			add_location(br60, file$3, 202, 4, 20318);
    			attr_dev(h343, "class", "text-with-margin oblique svelte-1xdvoqe");
    			add_location(h343, file$3, 203, 0, 20324);
    			add_location(br61, file$3, 205, 2, 20845);
    			add_location(br62, file$3, 206, 2, 21441);
    			attr_dev(h344, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h344, file$3, 204, 0, 20388);
    			add_location(br63, file$3, 209, 0, 21698);
    			add_location(br64, file$3, 209, 4, 21702);
    			attr_dev(h345, "class", "text-with-margin oblique svelte-1xdvoqe");
    			add_location(h345, file$3, 210, 0, 21708);
    			add_location(br65, file$3, 212, 2, 22022);
    			attr_dev(h346, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h346, file$3, 211, 0, 21755);
    			add_location(br66, file$3, 214, 2, 22090);
    			add_location(br67, file$3, 214, 6, 22094);
    			attr_dev(h347, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h347, file$3, 215, 2, 22102);
    			add_location(br68, file$3, 217, 4, 22575);
    			add_location(br69, file$3, 218, 4, 22970);
    			add_location(br70, file$3, 219, 4, 23388);
    			attr_dev(h348, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h348, file$3, 216, 2, 22184);
    			add_location(br71, file$3, 221, 2, 23614);
    			add_location(br72, file$3, 221, 6, 23618);
    			attr_dev(h349, "class", "text-with-margin svelte-1xdvoqe");
    			add_location(h349, file$3, 223, 0, 23626);
    			attr_dev(h350, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h350, file$3, 224, 0, 23696);
    			attr_dev(h351, "class", "text-with-margin unbold-text oblique svelte-1xdvoqe");
    			add_location(h351, file$3, 227, 0, 24190);
    			attr_dev(h352, "class", "text-with-margin unbold-text svelte-1xdvoqe");
    			add_location(h352, file$3, 230, 0, 24370);
    			attr_dev(div1, "class", "Margin");
    			set_style(div1, "font-family", "Arial");
    			add_location(div1, file$3, 91, 2, 1974);
    			attr_dev(div2, "id", "scrollable-content");
    			attr_dev(div2, "class", "svelte-1xdvoqe");
    			add_location(div2, file$3, 84, 0, 1719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, button);
    			append_dev(button, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, h2);
    			append_dev(div1, t4);
    			append_dev(div1, h30);
    			append_dev(div1, t6);
    			append_dev(div1, h31);
    			append_dev(div1, t8);
    			append_dev(div1, h32);
    			append_dev(div1, t10);
    			append_dev(div1, h33);
    			append_dev(div1, t12);
    			append_dev(div1, br0);
    			append_dev(div1, t13);
    			append_dev(div1, h34);
    			append_dev(div1, t15);
    			append_dev(div1, h35);
    			append_dev(div1, t17);
    			append_dev(div1, h36);
    			append_dev(div1, t19);
    			append_dev(div1, br1);
    			append_dev(div1, t20);
    			append_dev(div1, h37);
    			append_dev(div1, t22);
    			append_dev(div1, h38);
    			append_dev(div1, t24);
    			append_dev(div1, h39);
    			append_dev(div1, t26);
    			append_dev(div1, h310);
    			append_dev(div1, t28);
    			append_dev(div1, h311);
    			append_dev(h311, t29);
    			append_dev(h311, span0);
    			append_dev(div1, t31);
    			append_dev(div1, h312);
    			append_dev(h312, t32);
    			append_dev(h312, span1);
    			append_dev(div1, t34);
    			append_dev(div1, h313);
    			append_dev(h313, t35);
    			append_dev(h313, span2);
    			append_dev(div1, t37);
    			append_dev(div1, h314);
    			append_dev(div1, t39);
    			append_dev(div1, h315);
    			append_dev(div1, t41);
    			append_dev(div1, h316);
    			append_dev(div1, t43);
    			append_dev(div1, h317);
    			append_dev(div1, t45);
    			append_dev(div1, h318);
    			append_dev(div1, t47);
    			append_dev(div1, h319);
    			append_dev(div1, t49);
    			append_dev(div1, h320);
    			append_dev(h320, t50);
    			append_dev(h320, span3);
    			append_dev(div1, t52);
    			append_dev(div1, h321);
    			append_dev(h321, t53);
    			append_dev(h321, span4);
    			append_dev(div1, t55);
    			append_dev(div1, h322);
    			append_dev(h322, t56);
    			append_dev(h322, span5);
    			append_dev(div1, t58);
    			append_dev(div1, h323);
    			append_dev(div1, t60);
    			append_dev(div1, h324);
    			append_dev(h324, t61);
    			append_dev(h324, br2);
    			append_dev(h324, t62);
    			append_dev(h324, br3);
    			append_dev(h324, t63);
    			append_dev(h324, br4);
    			append_dev(h324, t64);
    			append_dev(h324, br5);
    			append_dev(h324, t65);
    			append_dev(h324, br6);
    			append_dev(h324, t66);
    			append_dev(h324, br7);
    			append_dev(h324, t67);
    			append_dev(div1, t68);
    			append_dev(div1, h325);
    			append_dev(div1, t70);
    			append_dev(div1, h326);
    			append_dev(h326, t71);
    			append_dev(h326, br8);
    			append_dev(h326, t72);
    			append_dev(h326, br9);
    			append_dev(h326, t73);
    			append_dev(h326, br10);
    			append_dev(h326, t74);
    			append_dev(h326, br11);
    			append_dev(h326, t75);
    			append_dev(h326, br12);
    			append_dev(h326, t76);
    			append_dev(h326, br13);
    			append_dev(h326, t77);
    			append_dev(h326, br14);
    			append_dev(h326, t78);
    			append_dev(h326, br15);
    			append_dev(h326, t79);
    			append_dev(h326, br16);
    			append_dev(h326, t80);
    			append_dev(h326, br17);
    			append_dev(h326, t81);
    			append_dev(div1, t82);
    			append_dev(div1, h327);
    			append_dev(div1, t84);
    			append_dev(div1, h328);
    			append_dev(h328, t85);
    			append_dev(h328, br18);
    			append_dev(h328, t86);
    			append_dev(h328, br19);
    			append_dev(h328, t87);
    			append_dev(h328, br20);
    			append_dev(h328, t88);
    			append_dev(h328, br21);
    			append_dev(h328, t89);
    			append_dev(h328, br22);
    			append_dev(h328, t90);
    			append_dev(h328, br23);
    			append_dev(h328, t91);
    			append_dev(h328, br24);
    			append_dev(h328, t92);
    			append_dev(h328, br25);
    			append_dev(h328, t93);
    			append_dev(h328, br26);
    			append_dev(h328, t94);
    			append_dev(h328, br27);
    			append_dev(h328, t95);
    			append_dev(h328, br28);
    			append_dev(h328, t96);
    			append_dev(h328, br29);
    			append_dev(h328, t97);
    			append_dev(h328, br30);
    			append_dev(h328, t98);
    			append_dev(h328, br31);
    			append_dev(h328, t99);
    			append_dev(h328, br32);
    			append_dev(h328, t100);
    			append_dev(h328, br33);
    			append_dev(h328, t101);
    			append_dev(h328, br34);
    			append_dev(h328, t102);
    			append_dev(h328, br35);
    			append_dev(h328, t103);
    			append_dev(h328, br36);
    			append_dev(h328, t104);
    			append_dev(h328, br37);
    			append_dev(h328, t105);
    			append_dev(h328, br38);
    			append_dev(h328, t106);
    			append_dev(h328, br39);
    			append_dev(h328, t107);
    			append_dev(div1, t108);
    			append_dev(div1, br40);
    			append_dev(div1, t109);
    			append_dev(div1, br41);
    			append_dev(div1, t110);
    			append_dev(div1, h329);
    			append_dev(div1, t112);
    			append_dev(div1, h330);
    			append_dev(div1, t114);
    			append_dev(div1, br42);
    			append_dev(div1, t115);
    			append_dev(div1, br43);
    			append_dev(div1, t116);
    			append_dev(div1, h331);
    			append_dev(div1, t118);
    			append_dev(div1, h332);
    			append_dev(h332, t119);
    			append_dev(h332, br44);
    			append_dev(h332, t120);
    			append_dev(h332, span6);
    			append_dev(h332, br45);
    			append_dev(h332, t122);
    			append_dev(div1, t123);
    			append_dev(div1, br46);
    			append_dev(div1, t124);
    			append_dev(div1, br47);
    			append_dev(div1, t125);
    			append_dev(div1, h333);
    			append_dev(div1, t127);
    			append_dev(div1, h334);
    			append_dev(div1, t129);
    			append_dev(div1, h335);
    			append_dev(h335, t130);
    			append_dev(h335, span7);
    			append_dev(div1, t132);
    			append_dev(div1, h336);
    			append_dev(h336, t133);
    			append_dev(h336, br48);
    			append_dev(h336, t134);
    			append_dev(div1, t135);
    			append_dev(div1, h337);
    			append_dev(h337, t136);
    			append_dev(h337, span8);
    			append_dev(div1, t138);
    			append_dev(div1, h338);
    			append_dev(h338, t139);
    			append_dev(h338, span9);
    			append_dev(div1, t141);
    			append_dev(div1, h339);
    			append_dev(h339, t142);
    			append_dev(h339, br49);
    			append_dev(h339, t143);
    			append_dev(h339, span10);
    			append_dev(div1, t145);
    			append_dev(div1, br50);
    			append_dev(div1, t146);
    			append_dev(div1, br51);
    			append_dev(div1, h340);
    			append_dev(h340, t147);
    			append_dev(h340, br52);
    			append_dev(h340, t148);
    			append_dev(h340, span11);
    			append_dev(span11, t149);
    			append_dev(span11, br53);
    			append_dev(span11, t150);
    			append_dev(span11, br54);
    			append_dev(span11, t151);
    			append_dev(div1, br55);
    			append_dev(div1, br56);
    			append_dev(div1, t152);
    			append_dev(div1, h341);
    			append_dev(div1, t154);
    			append_dev(div1, h342);
    			append_dev(h342, t155);
    			append_dev(h342, br57);
    			append_dev(h342, t156);
    			append_dev(h342, br58);
    			append_dev(h342, t157);
    			append_dev(div1, t158);
    			append_dev(div1, br59);
    			append_dev(div1, br60);
    			append_dev(div1, t159);
    			append_dev(div1, h343);
    			append_dev(div1, t161);
    			append_dev(div1, h344);
    			append_dev(h344, t162);
    			append_dev(h344, br61);
    			append_dev(h344, t163);
    			append_dev(h344, br62);
    			append_dev(h344, t164);
    			append_dev(div1, t165);
    			append_dev(div1, br63);
    			append_dev(div1, br64);
    			append_dev(div1, t166);
    			append_dev(div1, h345);
    			append_dev(div1, t168);
    			append_dev(div1, h346);
    			append_dev(h346, t169);
    			append_dev(h346, br65);
    			append_dev(h346, t170);
    			append_dev(div1, t171);
    			append_dev(div1, br66);
    			append_dev(div1, br67);
    			append_dev(div1, t172);
    			append_dev(div1, h347);
    			append_dev(div1, t174);
    			append_dev(div1, h348);
    			append_dev(h348, t175);
    			append_dev(h348, br68);
    			append_dev(h348, t176);
    			append_dev(h348, br69);
    			append_dev(h348, t177);
    			append_dev(h348, br70);
    			append_dev(h348, t178);
    			append_dev(div1, t179);
    			append_dev(div1, br71);
    			append_dev(div1, br72);
    			append_dev(div1, t180);
    			append_dev(div1, h349);
    			append_dev(div1, t182);
    			append_dev(div1, h350);
    			append_dev(div1, t184);
    			append_dev(div1, h351);
    			append_dev(div1, t186);
    			append_dev(div1, h352);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(84:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (82:0) {#if $locale === 'zh-CN'}
    function create_if_block$2(ctx) {
    	let simplifiedchineseprivacypolicy;
    	let current;
    	simplifiedchineseprivacypolicy = new SimplifiedChinesePrivacyPolicy({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(simplifiedchineseprivacypolicy.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(simplifiedchineseprivacypolicy, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(simplifiedchineseprivacypolicy.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(simplifiedchineseprivacypolicy.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(simplifiedchineseprivacypolicy, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(82:0) {#if $locale === 'zh-CN'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$locale*/ ctx[0] === 'zh-CN') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $locale$1;
    	validate_store($locale, 'locale');
    	component_subscribe($$self, $locale, $$value => $$invalidate(0, $locale$1 = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PrivacyPolicyScreen', slots, []);
    	var myScreenOrientation = window.screen.orientation;

    	try {
    		myScreenOrientation.lock("portrait"); // prevent from rotating screen
    	} catch(error) {
    		console.error(error);
    	}

    	console.log("loading");

    	onMount(() => {
    		console.log("mounted");
    	});

    	onDestroy(() => {
    		try {
    			myScreenOrientation.unlock(); // screen might be rotated again
    		} catch(error) {
    			console.error(error);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<PrivacyPolicyScreen> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => pop();

    	$$self.$capture_state = () => ({
    		locale: $locale,
    		onMount,
    		onDestroy,
    		pop,
    		SimplifiedChinesePrivacyPolicy,
    		myScreenOrientation,
    		$locale: $locale$1
    	});

    	$$self.$inject_state = $$props => {
    		if ('myScreenOrientation' in $$props) myScreenOrientation = $$props.myScreenOrientation;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$locale$1, click_handler];
    }

    class PrivacyPolicyScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PrivacyPolicyScreen",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Onboarding.svelte generated by Svelte v3.59.2 */
    const file$2 = "src\\components\\Onboarding.svelte";

    // (65:4) {#if section == 1}
    function create_if_block_5(ctx) {
    	let div1;
    	let h1;
    	let t0_value = /*$_*/ ctx[4]("OnboardingScreen.Hi!") + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2_value = /*$_*/ ctx[4]("OnboardingScreen.To start using Oopsie Heroes, we first need your email address.") + "";
    	let t2;
    	let t3;
    	let label;
    	let t4_value = /*$_*/ ctx[4]("OnboardingScreen.Email or phone number") + "";
    	let t4;
    	let t5;
    	let t6;
    	let input;
    	let input_class_value;
    	let t7;
    	let div0;
    	let p1;
    	let t8_value = /*$_*/ ctx[4]("OnboardingScreen.I agree to the") + "";
    	let t8;
    	let t9;
    	let t10;
    	let span;
    	let a;
    	let t11_value = /*$_*/ ctx[4]("OnboardingScreen.Privacy Policy") + "";
    	let t11;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			label = element("label");
    			t4 = text(t4_value);
    			t5 = text(":");
    			t6 = space();
    			input = element("input");
    			t7 = space();
    			div0 = element("div");
    			p1 = element("p");
    			t8 = text(t8_value);
    			t9 = text(":");
    			t10 = space();
    			span = element("span");
    			a = element("a");
    			t11 = text(t11_value);
    			set_style(h1, "font-family", "Arial");
    			set_style(h1, "font-size", "32px");
    			add_location(h1, file$2, 68, 8, 2998);
    			set_style(p0, "font-family", "Arial");
    			set_style(p0, "font-size", "16px");
    			add_location(p0, file$2, 70, 8, 3092);
    			set_style(label, "color", "grey");
    			attr_dev(label, "for", "emailInput");
    			add_location(label, file$2, 76, 8, 3302);
    			attr_dev(input, "class", input_class_value = "" + (null_to_empty(/*contactIsValid*/ ctx[2] ? "fontSize" : "grey fontSize") + " svelte-1a6lm4a"));
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "emailInput");
    			attr_dev(input, "inputmode", "text");
    			set_style(input, "border", "none");
    			set_style(input, "border-bottom", "1px solid #ccc");
    			set_style(input, "padding", "5px");
    			set_style(input, "outline", "none");
    			set_style(input, "width", "100%");
    			set_style(input, "height", "100%");
    			add_location(input, file$2, 77, 8, 3413);
    			set_style(p1, "margin-right", "5px");
    			set_style(p1, "font-family", "Arial");
    			set_style(p1, "font-size", "13.8px");
    			add_location(p1, file$2, 86, 12, 3809);
    			attr_dev(a, "href", "#/PrivacyPolicyScreen");
    			set_style(a, "color", "blue");
    			set_style(a, "text-decoration", "none");
    			add_location(a, file$2, 90, 14, 4029);
    			set_style(span, "font-family", "Arial");
    			set_style(span, "color", "blue");
    			add_location(span, file$2, 89, 12, 3966);
    			set_style(div0, "display", "flex");
    			set_style(div0, "align-items", "center");
    			add_location(div0, file$2, 85, 10, 3746);
    			attr_dev(div1, "id", "popup");
    			set_style(div1, "font-family", "Arial");
    			set_style(div1, "width", "88vw");
    			set_style(div1, "font-size", "clamp(1rem, 3vw, 2rem)");
    			add_location(div1, file$2, 67, 8, 2893);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, p0);
    			append_dev(p0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, label);
    			append_dev(label, t4);
    			append_dev(label, t5);
    			append_dev(div1, t6);
    			append_dev(div1, input);
    			set_input_value(input, /*$store_customer_email*/ ctx[1]);
    			append_dev(div1, t7);
    			append_dev(div1, div0);
    			append_dev(div0, p1);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(div0, t10);
    			append_dev(div0, span);
    			append_dev(span, a);
    			append_dev(a, t11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[11]),
    					listen_dev(a, "click", /*navigateToPrivacyPolicy*/ ctx[9], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 16 && t0_value !== (t0_value = /*$_*/ ctx[4]("OnboardingScreen.Hi!") + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$_*/ 16 && t2_value !== (t2_value = /*$_*/ ctx[4]("OnboardingScreen.To start using Oopsie Heroes, we first need your email address.") + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$_*/ 16 && t4_value !== (t4_value = /*$_*/ ctx[4]("OnboardingScreen.Email or phone number") + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*contactIsValid*/ 4 && input_class_value !== (input_class_value = "" + (null_to_empty(/*contactIsValid*/ ctx[2] ? "fontSize" : "grey fontSize") + " svelte-1a6lm4a"))) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*$store_customer_email*/ 2 && input.value !== /*$store_customer_email*/ ctx[1]) {
    				set_input_value(input, /*$store_customer_email*/ ctx[1]);
    			}

    			if (dirty & /*$_*/ 16 && t8_value !== (t8_value = /*$_*/ ctx[4]("OnboardingScreen.I agree to the") + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*$_*/ 16 && t11_value !== (t11_value = /*$_*/ ctx[4]("OnboardingScreen.Privacy Policy") + "")) set_data_dev(t11, t11_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(65:4) {#if section == 1}",
    		ctx
    	});

    	return block;
    }

    // (100:4) {#if section == 2}
    function create_if_block_4(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*$_*/ ctx[4]('OnboardingScreen.How old are you?') + "";
    	let t0;
    	let t1;
    	let input;
    	let t2;
    	let p;
    	let t4;
    	let br0;
    	let t5;
    	let br1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			p = element("p");
    			p.textContent = "Please enter your age";
    			t4 = space();
    			br0 = element("br");
    			t5 = space();
    			br1 = element("br");
    			set_style(h2, "font-family", "Arial");
    			set_style(h2, "font-size", "23px");
    			add_location(h2, file$2, 105, 8, 4524);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "id", "ageInput");
    			attr_dev(input, "class", "fontSize svelte-1a6lm4a");
    			set_style(input, "border", "none");
    			set_style(input, "border-bottom", "1px solid #ccc");
    			set_style(input, "padding", "5px");
    			set_style(input, "outline", "none");
    			set_style(input, "width", "40%");
    			add_location(input, file$2, 110, 8, 4656);
    			attr_dev(p, "id", "ageError");
    			set_style(p, "color", "red");
    			set_style(p, "display", "none");
    			add_location(p, file$2, 117, 8, 4911);
    			add_location(br0, file$2, 120, 8, 5020);
    			add_location(br1, file$2, 120, 15, 5027);
    			set_style(div, "font-family", "Arial");
    			set_style(div, "width", "80vw");
    			set_style(div, "display", "flex");
    			set_style(div, "flex-direction", "column");
    			set_style(div, "justify-content", "center");
    			set_style(div, "white-space", "nowrap");
    			attr_dev(div, "id", "popup");
    			attr_dev(div, "class", "fontSize svelte-1a6lm4a");
    			add_location(div, file$2, 100, 6, 4319);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*$store_customer_age*/ ctx[5]);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(div, t4);
    			append_dev(div, br0);
    			append_dev(div, t5);
    			append_dev(div, br1);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 16 && t0_value !== (t0_value = /*$_*/ ctx[4]('OnboardingScreen.How old are you?') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$store_customer_age*/ 32 && to_number(input.value) !== /*$store_customer_age*/ ctx[5]) {
    				set_input_value(input, /*$store_customer_age*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(100:4) {#if section == 2}",
    		ctx
    	});

    	return block;
    }

    // (125:4) {#if section == 3}
    function create_if_block_3(ctx) {
    	let div1;
    	let h1;
    	let t0_value = /*$_*/ ctx[4]('OnboardingScreen.Pick your hero!') + "";
    	let t0;
    	let t1;
    	let div0;
    	let button0;
    	let img0;
    	let img0_src_value;
    	let img0_class_value;
    	let t2;
    	let button1;
    	let img1;
    	let img1_src_value;
    	let img1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			button0 = element("button");
    			img0 = element("img");
    			t2 = space();
    			button1 = element("button");
    			img1 = element("img");
    			add_location(h1, file$2, 128, 8, 5251);
    			if (!src_url_equal(img0.src, img0_src_value = "build/images/boy.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "boy");

    			attr_dev(img0, "class", img0_class_value = "hero-image " + (/*$store_customer_sex*/ ctx[3] === 'male'
    			? ''
    			: 'transparent') + " svelte-1a6lm4a");

    			set_style(img0, "width", "100%");
    			set_style(img0, "height", "100%");
    			set_style(img0, "max-height", "60vh");
    			add_location(img0, file$2, 133, 12, 5488);
    			set_style(button0, "border", "none");
    			set_style(button0, "outline", "none");
    			attr_dev(button0, "class", "svelte-1a6lm4a");
    			add_location(button0, file$2, 132, 10, 5405);
    			if (!src_url_equal(img1.src, img1_src_value = "build/images/girl.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "girl");

    			attr_dev(img1, "class", img1_class_value = "hero-image " + (/*$store_customer_sex*/ ctx[3] === 'female'
    			? ''
    			: 'transparent') + " svelte-1a6lm4a");

    			set_style(img1, "width", "100%");
    			set_style(img1, "height", "100%");
    			set_style(img1, "max-height", "60vh");
    			add_location(img1, file$2, 146, 12, 5921);
    			set_style(button1, "border", "none");
    			set_style(button1, "outline", "none");
    			attr_dev(button1, "class", "svelte-1a6lm4a");
    			add_location(button1, file$2, 142, 10, 5798);
    			set_style(div0, "display", "flex");
    			set_style(div0, "flex-direction", "row");
    			set_style(div0, "align-items", "center");
    			add_location(div0, file$2, 131, 8, 5323);
    			set_style(div1, "font-family", "Arial");
    			set_style(div1, "width", "90vw");
    			set_style(div1, "display", "flex");
    			set_style(div1, "flex-direction", "column");
    			set_style(div1, "align-items", "center");
    			set_style(div1, "justify-content", "center");
    			add_location(div1, file$2, 125, 6, 5092);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(button0, img0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			append_dev(button1, img1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*storeSexMale*/ ctx[7], false, false, false, false),
    					listen_dev(button1, "click", /*storeSexFemale*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 16 && t0_value !== (t0_value = /*$_*/ ctx[4]('OnboardingScreen.Pick your hero!') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$store_customer_sex*/ 8 && img0_class_value !== (img0_class_value = "hero-image " + (/*$store_customer_sex*/ ctx[3] === 'male'
    			? ''
    			: 'transparent') + " svelte-1a6lm4a")) {
    				attr_dev(img0, "class", img0_class_value);
    			}

    			if (dirty & /*$store_customer_sex*/ 8 && img1_class_value !== (img1_class_value = "hero-image " + (/*$store_customer_sex*/ ctx[3] === 'female'
    			? ''
    			: 'transparent') + " svelte-1a6lm4a")) {
    				attr_dev(img1, "class", img1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(125:4) {#if section == 3}",
    		ctx
    	});

    	return block;
    }

    // (163:8) {#if section == 1}
    function create_if_block_2(ctx) {
    	let button;
    	let t_value = /*$_*/ ctx[4]('OnboardingScreen.Let’s go!') + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			set_style(button, "font-family", "Arial");
    			set_style(button, "background-color", /*contactIsValid*/ ctx[2] ? '#007BFF' : '#9e9e9e');
    			set_style(button, "color", "white");
    			set_style(button, "bottom", "10px");
    			set_style(button, "padding", "10px 20px 10px 20px");
    			set_style(button, "border-radius", "4vw");
    			set_style(button, "border", "none");
    			set_style(button, "margin-top", "10px");
    			set_style(button, "font-size", "clamp(1rem, 4vw, 4rem)");
    			attr_dev(button, "class", "svelte-1a6lm4a");
    			add_location(button, file$2, 163, 8, 6368);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*next*/ ctx[6], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 16 && t_value !== (t_value = /*$_*/ ctx[4]('OnboardingScreen.Let’s go!') + "")) set_data_dev(t, t_value);

    			if (dirty & /*contactIsValid*/ 4) {
    				set_style(button, "background-color", /*contactIsValid*/ ctx[2] ? '#007BFF' : '#9e9e9e');
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(163:8) {#if section == 1}",
    		ctx
    	});

    	return block;
    }

    // (172:8) {#if section == 2}
    function create_if_block_1(ctx) {
    	let button;
    	let t_value = /*$_*/ ctx[4]('OnboardingScreen.Next') + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			set_style(button, "font-family", "Arial");
    			set_style(button, "background-color", /*contactIsValid*/ ctx[2] ? '#007BFF' : '#9e9e9e');
    			set_style(button, "color", "white");
    			set_style(button, "bottom", "10%");
    			set_style(button, "width", "80px");
    			set_style(button, "height", "41px");
    			set_style(button, "border-radius", "12px");
    			set_style(button, "border", "none");
    			set_style(button, "margin-top", "20px");
    			attr_dev(button, "class", "svelte-1a6lm4a");
    			add_location(button, file$2, 172, 8, 6770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*next*/ ctx[6], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 16 && t_value !== (t_value = /*$_*/ ctx[4]('OnboardingScreen.Next') + "")) set_data_dev(t, t_value);

    			if (dirty & /*contactIsValid*/ 4) {
    				set_style(button, "background-color", /*contactIsValid*/ ctx[2] ? '#007BFF' : '#9e9e9e');
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(172:8) {#if section == 2}",
    		ctx
    	});

    	return block;
    }

    // (184:8) {#if section == 3}
    function create_if_block$1(ctx) {
    	let button;
    	let t_value = /*$_*/ ctx[4]('OnboardingScreen.Start') + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			set_style(button, "font-family", "Arial");
    			set_style(button, "background-color", /*contactIsValid*/ ctx[2] ? '#007BFF' : '#9e9e9e');
    			set_style(button, "color", "white");
    			set_style(button, "bottom", "10px");
    			set_style(button, "padding", "10px 20px 10px 20px");
    			set_style(button, "border-radius", "4vw");
    			set_style(button, "border", "none");
    			set_style(button, "margin-top", "10px");
    			set_style(button, "font-size", "clamp(1rem, 4vw, 4rem)");
    			attr_dev(button, "class", "svelte-1a6lm4a");
    			add_location(button, file$2, 184, 8, 7138);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*next*/ ctx[6], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 16 && t_value !== (t_value = /*$_*/ ctx[4]('OnboardingScreen.Start') + "")) set_data_dev(t, t_value);

    			if (dirty & /*contactIsValid*/ 4) {
    				set_style(button, "background-color", /*contactIsValid*/ ctx[2] ? '#007BFF' : '#9e9e9e');
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(184:8) {#if section == 3}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div3;
    	let div2;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let div0;
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;
    	let if_block0 = /*section*/ ctx[0] == 1 && create_if_block_5(ctx);
    	let if_block1 = /*section*/ ctx[0] == 2 && create_if_block_4(ctx);
    	let if_block2 = /*section*/ ctx[0] == 3 && create_if_block_3(ctx);
    	let if_block3 = /*section*/ ctx[0] == 1 && create_if_block_2(ctx);
    	let if_block4 = /*section*/ ctx[0] == 2 && create_if_block_1(ctx);
    	let if_block5 = /*section*/ ctx[0] == 3 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			attr_dev(div0, "class", "Next_Button svelte-1a6lm4a");
    			add_location(div0, file$2, 160, 6, 6303);
    			attr_dev(div1, "class", "container svelte-1a6lm4a");
    			add_location(div1, file$2, 159, 4, 6272);
    			attr_dev(div2, "class", "dialog-content  svelte-1a6lm4a");
    			add_location(div2, file$2, 63, 2, 2579);
    			attr_dev(div3, "class", "dialog-container roundedBorders fontfamily svelte-1a6lm4a");
    			add_location(div3, file$2, 61, 0, 2419);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t0);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t1);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			if (if_block3) if_block3.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block4) if_block4.m(div0, null);
    			append_dev(div0, t4);
    			if (if_block5) if_block5.m(div0, null);

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", stop_propagation(/*click_handler*/ ctx[10]), false, false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*section*/ ctx[0] == 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*section*/ ctx[0] == 2) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div2, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*section*/ ctx[0] == 3) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					if_block2.m(div2, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*section*/ ctx[0] == 1) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2(ctx);
    					if_block3.c();
    					if_block3.m(div0, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*section*/ ctx[0] == 2) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_1(ctx);
    					if_block4.c();
    					if_block4.m(div0, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*section*/ ctx[0] == 3) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block$1(ctx);
    					if_block5.c();
    					if_block5.m(div0, null);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $store_customer_sex;
    	let $store_customer_email;
    	let $store_onBoardingDone;
    	let $_;
    	let $store_customer_age;
    	validate_store(store_customer_sex, 'store_customer_sex');
    	component_subscribe($$self, store_customer_sex, $$value => $$invalidate(3, $store_customer_sex = $$value));
    	validate_store(store_customer_email, 'store_customer_email');
    	component_subscribe($$self, store_customer_email, $$value => $$invalidate(1, $store_customer_email = $$value));
    	validate_store(store_onBoardingDone, 'store_onBoardingDone');
    	component_subscribe($$self, store_onBoardingDone, $$value => $$invalidate(13, $store_onBoardingDone = $$value));
    	validate_store($format, '_');
    	component_subscribe($$self, $format, $$value => $$invalidate(4, $_ = $$value));
    	validate_store(store_customer_age, 'store_customer_age');
    	component_subscribe($$self, store_customer_age, $$value => $$invalidate(5, $store_customer_age = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Onboarding', slots, []);
    	let { section = 1 } = $$props;
    	var contactIsValid = false;

    	onMount(() => {
    		$$invalidate(0, section = 1); // reset section
    	}); //If 'Privacy policy' is clicked, then push ('#/PrivacyPolicyScreen');

    	function next() {
    		// TODO
    		//storeSettingsVal("txtSndfilename",1)
    		if (section == 1) {
    			storeUserVal("age", 1); // if the value is not changed by the user it will not be written, so force write to DB here

    			// Email addresses must be valid emails. Phone numbers may use any
    			// formatting and length, as long as they contain a digit.
    			if (!checkContactIdentifier()) {
    				// Display an error message and do not proceed to the next section 2
    				return;
    			}
    		}

    		if (section == 3) {
    			set_store_value(store_onBoardingDone, $store_onBoardingDone = 1, $store_onBoardingDone);
    		} // if (writeUserToRemoteDB())
    		// {

    		//   $store_UserSavedToRemoteDB = 1;
    		// }
    		$$invalidate(0, section = section + 1);
    	}

    	function validateContactIdentifier(value) {
    		const identifier = value.trim();
    		if (!identifier) return false;

    		// An @ sign means the user is entering an email address, so it must pass
    		// the email validation. Phone numbers are intentionally flexible.
    		return identifier.includes("@")
    		? validateEmail(identifier)
    		: (/\d/).test(identifier);
    	}

    	function checkContactIdentifier() {
    		$$invalidate(2, contactIsValid = validateContactIdentifier($store_customer_email));
    		return contactIsValid;
    	}

    	function storeSexMale() {
    		set_store_value(store_customer_sex, $store_customer_sex = "male", $store_customer_sex);
    	}

    	function storeSexFemale() {
    		set_store_value(store_customer_sex, $store_customer_sex = "female", $store_customer_sex);
    	}

    	function navigateToPrivacyPolicy() {
    		push('#/PrivacyPolicyScreen');
    	}

    	const writable_props = ['section'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Onboarding> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_input_handler() {
    		$store_customer_email = this.value;
    		store_customer_email.set($store_customer_email);
    	}

    	function input_input_handler_1() {
    		$store_customer_age = to_number(this.value);
    		store_customer_age.set($store_customer_age);
    	}

    	$$self.$$set = $$props => {
    		if ('section' in $$props) $$invalidate(0, section = $$props.section);
    	};

    	$$self.$capture_state = () => ({
    		_: $format,
    		onMount,
    		push,
    		storeUserVal,
    		store_onBoardingDone,
    		store_customer_email,
    		store_customer_age,
    		store_customer_sex,
    		store_UserSavedToRemoteDB,
    		validateEmail,
    		section,
    		contactIsValid,
    		next,
    		validateContactIdentifier,
    		checkContactIdentifier,
    		storeSexMale,
    		storeSexFemale,
    		navigateToPrivacyPolicy,
    		$store_customer_sex,
    		$store_customer_email,
    		$store_onBoardingDone,
    		$_,
    		$store_customer_age
    	});

    	$$self.$inject_state = $$props => {
    		if ('section' in $$props) $$invalidate(0, section = $$props.section);
    		if ('contactIsValid' in $$props) $$invalidate(2, contactIsValid = $$props.contactIsValid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$store_customer_email*/ 2) {
    			$$invalidate(2, contactIsValid = validateContactIdentifier($store_customer_email));
    		}

    		if ($$self.$$.dirty & /*$store_customer_email*/ 2) {
    			(checkContactIdentifier());
    		}
    	};

    	return [
    		section,
    		$store_customer_email,
    		contactIsValid,
    		$store_customer_sex,
    		$_,
    		$store_customer_age,
    		next,
    		storeSexMale,
    		storeSexFemale,
    		navigateToPrivacyPolicy,
    		click_handler,
    		input_input_handler,
    		input_input_handler_1
    	];
    }

    class Onboarding extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$3, create_fragment$3, safe_not_equal, { section: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Onboarding",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get section() {
    		throw new Error("<Onboarding>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set section(value) {
    		throw new Error("<Onboarding>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\routes\OnboardingScreen.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$1 = "src\\routes\\OnboardingScreen.svelte";

    // (79:2) {#if progress!=3 }
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "height", "auto");
    			set_style(img, "width", "80%");
    			set_style(img, "object-fit", "scale-down");
    			set_style(img, "max-height", "80%");
    			if (!src_url_equal(img.src, img_src_value = "build/images/logo_characters.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$1, 79, 2, 1981);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(79:2) {#if progress!=3 }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let onboarding;
    	let updating_section;
    	let div2_style_value;
    	let current;
    	let if_block = /*progress*/ ctx[0] != 3 && create_if_block(ctx);

    	function onboarding_section_binding(value) {
    		/*onboarding_section_binding*/ ctx[2](value);
    	}

    	let onboarding_props = {};

    	if (/*progress*/ ctx[0] !== void 0) {
    		onboarding_props.section = /*progress*/ ctx[0];
    	}

    	onboarding = new Onboarding({ props: onboarding_props, $$inline: true });
    	binding_callbacks.push(() => bind(onboarding, 'section', onboarding_section_binding));

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div1 = element("div");
    			create_component(onboarding.$$.fragment);
    			attr_dev(div0, "class", "center svelte-14h1t5e");
    			set_style(div0, "height", "40%");
    			set_style(div0, "width", "100%");
    			add_location(div0, file$1, 77, 2, 1901);
    			attr_dev(div1, "class", "onboarding-container roundedBorders svelte-14h1t5e");
    			add_location(div1, file$1, 84, 2, 2126);
    			attr_dev(div2, "class", "bg svelte-14h1t5e");
    			attr_dev(div2, "style", div2_style_value = "height : 100%; width:100%; background-image: url(" + /*backgroundImage_url*/ ctx[1] + ");");
    			add_location(div2, file$1, 76, 0, 1799);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			mount_component(onboarding, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*progress*/ ctx[0] != 3) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const onboarding_changes = {};

    			if (!updating_section && dirty & /*progress*/ 1) {
    				updating_section = true;
    				onboarding_changes.section = /*progress*/ ctx[0];
    				add_flush_callback(() => updating_section = false);
    			}

    			onboarding.$set(onboarding_changes);

    			if (!current || dirty & /*backgroundImage_url*/ 2 && div2_style_value !== (div2_style_value = "height : 100%; width:100%; background-image: url(" + /*backgroundImage_url*/ ctx[1] + ");")) {
    				attr_dev(div2, "style", div2_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(onboarding.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(onboarding.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			destroy_component(onboarding);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $store_smallOrLargeImageTxt;
    	validate_store(store_smallOrLargeImageTxt, 'store_smallOrLargeImageTxt');
    	component_subscribe($$self, store_smallOrLargeImageTxt, $$value => $$invalidate(3, $store_smallOrLargeImageTxt = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OnboardingScreen', slots, []);
    	var progress = 1;
    	let backgroundImage_url = "";
    	var myScreenOrientation = window.screen.orientation;

    	function popWindow(progress) {
    		if (progress == 4) {
    			pop();
    		}
    	}

    	try {
    		myScreenOrientation.lock("portrait"); // prevent from rotating screen
    	} catch(error) {
    		console.error(error);
    	}

    	console.log("loading");

    	onMount(() => {
    		let imagePrefix = "build/images/";
    		$$invalidate(1, backgroundImage_url = imagePrefix + "background_intro_" + $store_smallOrLargeImageTxt + ".jpg");
    		console.log("mounted");
    	});

    	onDestroy(() => {
    		try {
    			myScreenOrientation.unlock(); // screen might be rotated again
    		} catch(error) {
    			console.error(error);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<OnboardingScreen> was created with unknown prop '${key}'`);
    	});

    	function onboarding_section_binding(value) {
    		progress = value;
    		$$invalidate(0, progress);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		pop,
    		Onboarding,
    		store_smallOrLargeImageTxt,
    		progress,
    		backgroundImage_url,
    		myScreenOrientation,
    		popWindow,
    		$store_smallOrLargeImageTxt
    	});

    	$$self.$inject_state = $$props => {
    		if ('progress' in $$props) $$invalidate(0, progress = $$props.progress);
    		if ('backgroundImage_url' in $$props) $$invalidate(1, backgroundImage_url = $$props.backgroundImage_url);
    		if ('myScreenOrientation' in $$props) myScreenOrientation = $$props.myScreenOrientation;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*progress*/ 1) {
    			popWindow(progress);
    		}
    	};

    	return [progress, backgroundImage_url, onboarding_section_binding];
    }

    class OnboardingScreen$8 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OnboardingScreen",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\routes\StarScreen.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file = "src\\routes\\StarScreen.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "Margin");
    			add_location(div0, file, 59, 4, 1527);
    			attr_dev(div1, "class", "starScreen svelte-ms7jo1");
    			set_style(div1, "background-image", "url(" + /*backgroundImage_url*/ ctx[0] + ")");
    			add_location(div1, file, 58, 0, 1443);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*backgroundImage_url*/ 1) {
    				set_style(div1, "background-image", "url(" + /*backgroundImage_url*/ ctx[0] + ")");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StarScreen', slots, []);
    	let backgroundImage_url = "";
    	var myScreenOrientation = window.screen.orientation;

    	try {
    		myScreenOrientation.lock("portrait"); // prevent from rotating screen
    	} catch(error) {
    		console.error(error);
    	}

    	console.log("loading");

    	onMount(() => {
    		let imagePrefix = "build/images/backgrounds/";
    		$$invalidate(0, backgroundImage_url = imagePrefix + "Star" + ".svg");
    		console.log("mounted");

    		setTimeout(
    			() => {
    				// Transition back to the home screen
    				push('#/');
    			},
    			2000
    		); //After 2 seconds, the star screen (stays 2 sec) will automatically be disappreared and homeScreen will be appeared again
    	});

    	onDestroy(() => {
    		try {
    			myScreenOrientation.unlock(); // screen might be rotated again
    		} catch(error) {
    			console.error(error);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<StarScreen> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		push,
    		backgroundImage_url,
    		myScreenOrientation
    	});

    	$$self.$inject_state = $$props => {
    		if ('backgroundImage_url' in $$props) $$invalidate(0, backgroundImage_url = $$props.backgroundImage_url);
    		if ('myScreenOrientation' in $$props) myScreenOrientation = $$props.myScreenOrientation;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [backgroundImage_url];
    }

    class StarScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StarScreen",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    // Components''



    // Export the route definition object
    var routes = {
        // Exact path
        '/': HomeScreen$8,
        '/CalendarScreen' : CalendarScreen$8,
       '/SettingsScreen': SettingsScreen$8,
       '/OnboardingScreen' : OnboardingScreen$8,
       '/StarScreen' : StarScreen,
       '/PrivacyPolicyScreen' : PrivacyPolicyScreen



    };

    /*! Capacitor: https://capacitorjs.com/ - MIT License */
    const createCapacitorPlatforms = (win) => {
        const defaultPlatformMap = new Map();
        defaultPlatformMap.set('web', { name: 'web' });
        const capPlatforms = win.CapacitorPlatforms || {
            currentPlatform: { name: 'web' },
            platforms: defaultPlatformMap,
        };
        const addPlatform = (name, platform) => {
            capPlatforms.platforms.set(name, platform);
        };
        const setPlatform = (name) => {
            if (capPlatforms.platforms.has(name)) {
                capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
            }
        };
        capPlatforms.addPlatform = addPlatform;
        capPlatforms.setPlatform = setPlatform;
        return capPlatforms;
    };
    const initPlatforms = (win) => (win.CapacitorPlatforms = createCapacitorPlatforms(win));
    /**
     * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
     */
    const CapacitorPlatforms = /*#__PURE__*/ initPlatforms((typeof globalThis !== 'undefined'
        ? globalThis
        : typeof self !== 'undefined'
            ? self
            : typeof window !== 'undefined'
                ? window
                : typeof global !== 'undefined'
                    ? global
                    : {}));
    /**
     * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
     */
    CapacitorPlatforms.addPlatform;
    /**
     * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
     */
    CapacitorPlatforms.setPlatform;

    var ExceptionCode;
    (function (ExceptionCode) {
        /**
         * API is not implemented.
         *
         * This usually means the API can't be used because it is not implemented for
         * the current platform.
         */
        ExceptionCode["Unimplemented"] = "UNIMPLEMENTED";
        /**
         * API is not available.
         *
         * This means the API can't be used right now because:
         *   - it is currently missing a prerequisite, such as network connectivity
         *   - it requires a particular platform or browser version
         */
        ExceptionCode["Unavailable"] = "UNAVAILABLE";
    })(ExceptionCode || (ExceptionCode = {}));
    class CapacitorException extends Error {
        constructor(message, code, data) {
            super(message);
            this.message = message;
            this.code = code;
            this.data = data;
        }
    }
    const getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
            return 'android';
        }
        else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
            return 'ios';
        }
        else {
            return 'web';
        }
    };

    const createCapacitor = (win) => {
        var _a, _b, _c, _d, _e;
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins = (cap.Plugins = cap.Plugins || {});
        /**
         * @deprecated Use `capCustomPlatform` instead, default functions like registerPlugin will function with the new object.
         */
        const capPlatforms = win.CapacitorPlatforms;
        const defaultGetPlatform = () => {
            return capCustomPlatform !== null
                ? capCustomPlatform.name
                : getPlatformId(win);
        };
        const getPlatform = ((_a = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _a === void 0 ? void 0 : _a.getPlatform) || defaultGetPlatform;
        const defaultIsNativePlatform = () => getPlatform() !== 'web';
        const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _b === void 0 ? void 0 : _b.isNativePlatform) || defaultIsNativePlatform;
        const defaultIsPluginAvailable = (pluginName) => {
            const plugin = registeredPlugins.get(pluginName);
            if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
                // JS implementation available for the current platform.
                return true;
            }
            if (getPluginHeader(pluginName)) {
                // Native implementation available.
                return true;
            }
            return false;
        };
        const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _c === void 0 ? void 0 : _c.isPluginAvailable) ||
            defaultIsPluginAvailable;
        const defaultGetPluginHeader = (pluginName) => { var _a; return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find(h => h.name === pluginName); };
        const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _d === void 0 ? void 0 : _d.getPluginHeader) || defaultGetPluginHeader;
        const handleError = (err) => win.console.error(err);
        const pluginMethodNoop = (_target, prop, pluginName) => {
            return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
        };
        const registeredPlugins = new Map();
        const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
            const registeredPlugin = registeredPlugins.get(pluginName);
            if (registeredPlugin) {
                console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
                return registeredPlugin.proxy;
            }
            const platform = getPlatform();
            const pluginHeader = getPluginHeader(pluginName);
            let jsImplementation;
            const loadPluginImplementation = async () => {
                if (!jsImplementation && platform in jsImplementations) {
                    jsImplementation =
                        typeof jsImplementations[platform] === 'function'
                            ? (jsImplementation = await jsImplementations[platform]())
                            : (jsImplementation = jsImplementations[platform]);
                }
                else if (capCustomPlatform !== null &&
                    !jsImplementation &&
                    'web' in jsImplementations) {
                    jsImplementation =
                        typeof jsImplementations['web'] === 'function'
                            ? (jsImplementation = await jsImplementations['web']())
                            : (jsImplementation = jsImplementations['web']);
                }
                return jsImplementation;
            };
            const createPluginMethod = (impl, prop) => {
                var _a, _b;
                if (pluginHeader) {
                    const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find(m => prop === m.name);
                    if (methodHeader) {
                        if (methodHeader.rtype === 'promise') {
                            return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                        }
                        else {
                            return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                        }
                    }
                    else if (impl) {
                        return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
                    }
                }
                else if (impl) {
                    return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
                }
                else {
                    throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                }
            };
            const createPluginMethodWrapper = (prop) => {
                let remove;
                const wrapper = (...args) => {
                    const p = loadPluginImplementation().then(impl => {
                        const fn = createPluginMethod(impl, prop);
                        if (fn) {
                            const p = fn(...args);
                            remove = p === null || p === void 0 ? void 0 : p.remove;
                            return p;
                        }
                        else {
                            throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                        }
                    });
                    if (prop === 'addListener') {
                        p.remove = async () => remove();
                    }
                    return p;
                };
                // Some flair ✨
                wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
                Object.defineProperty(wrapper, 'name', {
                    value: prop,
                    writable: false,
                    configurable: false,
                });
                return wrapper;
            };
            const addListener = createPluginMethodWrapper('addListener');
            const removeListener = createPluginMethodWrapper('removeListener');
            const addListenerNative = (eventName, callback) => {
                const call = addListener({ eventName }, callback);
                const remove = async () => {
                    const callbackId = await call;
                    removeListener({
                        eventName,
                        callbackId,
                    }, callback);
                };
                const p = new Promise(resolve => call.then(() => resolve({ remove })));
                p.remove = async () => {
                    console.warn(`Using addListener() without 'await' is deprecated.`);
                    await remove();
                };
                return p;
            };
            const proxy = new Proxy({}, {
                get(_, prop) {
                    switch (prop) {
                        // https://github.com/facebook/react/issues/20030
                        case '$$typeof':
                            return undefined;
                        case 'toJSON':
                            return () => ({});
                        case 'addListener':
                            return pluginHeader ? addListenerNative : addListener;
                        case 'removeListener':
                            return removeListener;
                        default:
                            return createPluginMethodWrapper(prop);
                    }
                },
            });
            Plugins[pluginName] = proxy;
            registeredPlugins.set(pluginName, {
                name: pluginName,
                proxy,
                platforms: new Set([
                    ...Object.keys(jsImplementations),
                    ...(pluginHeader ? [platform] : []),
                ]),
            });
            return proxy;
        };
        const registerPlugin = ((_e = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _e === void 0 ? void 0 : _e.registerPlugin) || defaultRegisterPlugin;
        // Add in convertFileSrc for web, it will already be available in native context
        if (!cap.convertFileSrc) {
            cap.convertFileSrc = filePath => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.pluginMethodNoop = pluginMethodNoop;
        cap.registerPlugin = registerPlugin;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        // Deprecated props
        cap.platform = cap.getPlatform();
        cap.isNative = cap.isNativePlatform();
        return cap;
    };
    const initCapacitorGlobal = (win) => (win.Capacitor = createCapacitor(win));

    const Capacitor = /*#__PURE__*/ initCapacitorGlobal(typeof globalThis !== 'undefined'
        ? globalThis
        : typeof self !== 'undefined'
            ? self
            : typeof window !== 'undefined'
                ? window
                : typeof global !== 'undefined'
                    ? global
                    : {});
    const registerPlugin = Capacitor.registerPlugin;
    /**
     * @deprecated Provided for backwards compatibility for Capacitor v2 plugins.
     * Capacitor v3 plugins should import the plugin directly. This "Plugins"
     * export is deprecated in v3, and will be removed in v4.
     */
    Capacitor.Plugins;

    /**
     * Base class web plugins should extend.
     */
    class WebPlugin {
        constructor(config) {
            this.listeners = {};
            this.windowListeners = {};
            if (config) {
                // TODO: add link to upgrade guide
                console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
                this.config = config;
            }
        }
        addListener(eventName, listenerFunc) {
            const listeners = this.listeners[eventName];
            if (!listeners) {
                this.listeners[eventName] = [];
            }
            this.listeners[eventName].push(listenerFunc);
            // If we haven't added a window listener for this event and it requires one,
            // go ahead and add it
            const windowListener = this.windowListeners[eventName];
            if (windowListener && !windowListener.registered) {
                this.addWindowListener(windowListener);
            }
            const remove = async () => this.removeListener(eventName, listenerFunc);
            const p = Promise.resolve({ remove });
            Object.defineProperty(p, 'remove', {
                value: async () => {
                    console.warn(`Using addListener() without 'await' is deprecated.`);
                    await remove();
                },
            });
            return p;
        }
        async removeAllListeners() {
            this.listeners = {};
            for (const listener in this.windowListeners) {
                this.removeWindowListener(this.windowListeners[listener]);
            }
            this.windowListeners = {};
        }
        notifyListeners(eventName, data) {
            const listeners = this.listeners[eventName];
            if (listeners) {
                listeners.forEach(listener => listener(data));
            }
        }
        hasListeners(eventName) {
            return !!this.listeners[eventName].length;
        }
        registerWindowListener(windowEventName, pluginEventName) {
            this.windowListeners[pluginEventName] = {
                registered: false,
                windowEventName,
                pluginEventName,
                handler: event => {
                    this.notifyListeners(pluginEventName, event);
                },
            };
        }
        unimplemented(msg = 'not implemented') {
            return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = 'not available') {
            return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
            const listeners = this.listeners[eventName];
            if (!listeners) {
                return;
            }
            const index = listeners.indexOf(listenerFunc);
            this.listeners[eventName].splice(index, 1);
            // If there are no more listeners for this type of event,
            // remove the window listener
            if (!this.listeners[eventName].length) {
                this.removeWindowListener(this.windowListeners[eventName]);
            }
        }
        addWindowListener(handle) {
            window.addEventListener(handle.windowEventName, handle.handler);
            handle.registered = true;
        }
        removeWindowListener(handle) {
            if (!handle) {
                return;
            }
            window.removeEventListener(handle.windowEventName, handle.handler);
            handle.registered = false;
        }
    }
    /******** END WEB VIEW PLUGIN ********/
    /******** COOKIES PLUGIN ********/
    /**
     * Safely web encode a string value (inspired by js-cookie)
     * @param str The string value to encode
     */
    const encode = (str) => encodeURIComponent(str)
        .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
        .replace(/[()]/g, escape);
    /**
     * Safely web decode a string value (inspired by js-cookie)
     * @param str The string value to decode
     */
    const decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
    class CapacitorCookiesPluginWeb extends WebPlugin {
        async getCookies() {
            const cookies = document.cookie;
            const cookieMap = {};
            cookies.split(';').forEach(cookie => {
                if (cookie.length <= 0)
                    return;
                // Replace first "=" with CAP_COOKIE to prevent splitting on additional "="
                let [key, value] = cookie.replace(/=/, 'CAP_COOKIE').split('CAP_COOKIE');
                key = decode(key).trim();
                value = decode(value).trim();
                cookieMap[key] = value;
            });
            return cookieMap;
        }
        async setCookie(options) {
            try {
                // Safely Encoded Key/Value
                const encodedKey = encode(options.key);
                const encodedValue = encode(options.value);
                // Clean & sanitize options
                const expires = `; expires=${(options.expires || '').replace('expires=', '')}`; // Default is "; expires="
                const path = (options.path || '/').replace('path=', ''); // Default is "path=/"
                const domain = options.url != null && options.url.length > 0
                    ? `domain=${options.url}`
                    : '';
                document.cookie = `${encodedKey}=${encodedValue || ''}${expires}; path=${path}; ${domain};`;
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
        async deleteCookie(options) {
            try {
                document.cookie = `${options.key}=; Max-Age=0`;
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
        async clearCookies() {
            try {
                const cookies = document.cookie.split(';') || [];
                for (const cookie of cookies) {
                    document.cookie = cookie
                        .replace(/^ +/, '')
                        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
        async clearAllCookies() {
            try {
                await this.clearCookies();
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
    }
    registerPlugin('CapacitorCookies', {
        web: () => new CapacitorCookiesPluginWeb(),
    });
    // UTILITY FUNCTIONS
    /**
     * Read in a Blob value and return it as a base64 string
     * @param blob The blob value to convert to a base64 string
     */
    const readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result;
            // remove prefix "data:application/pdf;base64,"
            resolve(base64String.indexOf(',') >= 0
                ? base64String.split(',')[1]
                : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
    /**
     * Normalize an HttpHeaders map by lowercasing all of the values
     * @param headers The HttpHeaders object to normalize
     */
    const normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map(k => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
            acc[key] = headers[originalKeys[index]];
            return acc;
        }, {});
        return normalized;
    };
    /**
     * Builds a string of url parameters that
     * @param params A map of url parameters
     * @param shouldEncode true if you should encodeURIComponent() the values (true by default)
     */
    const buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
            return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
            const [key, value] = entry;
            let encodedValue;
            let item;
            if (Array.isArray(value)) {
                item = '';
                value.forEach(str => {
                    encodedValue = shouldEncode ? encodeURIComponent(str) : str;
                    item += `${key}=${encodedValue}&`;
                });
                // last character will always be "&" so slice it off
                item.slice(0, -1);
            }
            else {
                encodedValue = shouldEncode ? encodeURIComponent(value) : value;
                item = `${key}=${encodedValue}`;
            }
            return `${accumulator}&${item}`;
        }, '');
        // Remove initial "&" from the reduce
        return output.substr(1);
    };
    /**
     * Build the RequestInit object based on the options passed into the initial request
     * @param options The Http plugin options
     * @param extra Any extra RequestInit values
     */
    const buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || 'GET', headers: options.headers }, extra);
        // Get the content-type
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers['content-type'] || '';
        // If body is already a string, then pass it through as-is.
        if (typeof options.data === 'string') {
            output.body = options.data;
        }
        // Build request initializers based off of content-type
        else if (type.includes('application/x-www-form-urlencoded')) {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(options.data || {})) {
                params.set(key, value);
            }
            output.body = params.toString();
        }
        else if (type.includes('multipart/form-data')) {
            const form = new FormData();
            if (options.data instanceof FormData) {
                options.data.forEach((value, key) => {
                    form.append(key, value);
                });
            }
            else {
                for (const key of Object.keys(options.data)) {
                    form.append(key, options.data[key]);
                }
            }
            output.body = form;
            const headers = new Headers(output.headers);
            headers.delete('content-type'); // content-type will be set by `window.fetch` to includy boundary
            output.headers = headers;
        }
        else if (type.includes('application/json') ||
            typeof options.data === 'object') {
            output.body = JSON.stringify(options.data);
        }
        return output;
    };
    // WEB IMPLEMENTATION
    class CapacitorHttpPluginWeb extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
            const requestInit = buildRequestInit(options, options.webFetchExtra);
            const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
            const url = urlParams ? `${options.url}?${urlParams}` : options.url;
            const response = await fetch(url, requestInit);
            const contentType = response.headers.get('content-type') || '';
            // Default to 'text' responseType so no parsing happens
            let { responseType = 'text' } = response.ok ? options : {};
            // If the response content-type is json, force the response to be json
            if (contentType.includes('application/json')) {
                responseType = 'json';
            }
            let data;
            let blob;
            switch (responseType) {
                case 'arraybuffer':
                case 'blob':
                    blob = await response.blob();
                    data = await readBlobAsBase64(blob);
                    break;
                case 'json':
                    data = await response.json();
                    break;
                case 'document':
                case 'text':
                default:
                    data = await response.text();
            }
            // Convert fetch headers to Capacitor HttpHeaders
            const headers = {};
            response.headers.forEach((value, key) => {
                headers[key] = value;
            });
            return {
                data,
                headers,
                status: response.status,
                url: response.url,
            };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
            return this.request(Object.assign(Object.assign({}, options), { method: 'GET' }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
            return this.request(Object.assign(Object.assign({}, options), { method: 'POST' }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
            return this.request(Object.assign(Object.assign({}, options), { method: 'PUT' }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
            return this.request(Object.assign(Object.assign({}, options), { method: 'PATCH' }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
            return this.request(Object.assign(Object.assign({}, options), { method: 'DELETE' }));
        }
    }
    registerPlugin('CapacitorHttp', {
        web: () => new CapacitorHttpPluginWeb(),
    });

    var Style;
    (function (Style) {
        /**
         * Light text for dark backgrounds.
         *
         * @since 1.0.0
         */
        Style["Dark"] = "DARK";
        /**
         * Dark text for light backgrounds.
         *
         * @since 1.0.0
         */
        Style["Light"] = "LIGHT";
        /**
         * The style is based on the device appearance.
         * If the device is using Dark mode, the statusbar text will be light.
         * If the device is using Light mode, the statusbar text will be dark.
         * On Android the default will be the one the app was launched with.
         *
         * @since 1.0.0
         */
        Style["Default"] = "DEFAULT";
    })(Style || (Style = {}));
    var Animation;
    (function (Animation) {
        /**
         * No animation during show/hide.
         *
         * @since 1.0.0
         */
        Animation["None"] = "NONE";
        /**
         * Slide animation during show/hide.
         * It doesn't work on iOS 15+.
         *
         * @since 1.0.0
         */
        Animation["Slide"] = "SLIDE";
        /**
         * Fade animation during show/hide.
         *
         * @since 1.0.0
         */
        Animation["Fade"] = "FADE";
    })(Animation || (Animation = {}));

    registerPlugin('StatusBar');

    var Continue$7 = "Continue";
    var SettingsScreen$7 = {
    	Alarm: "Alarm",
    	"Stop alarm": "Stop alarm",
    	"Choose your alarm sound": "Choose your alarm sound",
    	"Alarm Settings": "Alarm Settings",
    	"Record the voice of one of your parents:": "Record the voice of one of your parents",
    	"Are you sure you want to reset your user?": "Are you sure you want to reset your user?",
    	Cancel: "Cancel",
    	"Go to Settings": "Go to Settings",
    	"Harsh alarm": "HARSH",
    	"Increase the volume to hear the sound ": "Increase the volume to hear the sound",
    	"Listen to microphone": "Listen to microphone",
    	OK: "OK",
    	"Phone-like": "PHONE-LIKE",
    	"Please record a personal message first": "Please record a personal message first",
    	"Recording…": "Recording…",
    	"Remember the alarm sound": "Remember the alarm sound",
    	Reset: "Reset",
    	"Reset user": "Reset user",
    	Rooster: "ROOSTER",
    	"Select Sensor": "Select Sensor",
    	Sensor: "Sensor",
    	Settings: "Settings",
    	"Smooth & Gentle": "SMOOTH",
    	"Oopsie Heroes": "OOPSIE HEROES",
    	"To detect sensor sound, enable access to the microphone from App Settings.": "To detect sensor sound, enable access to the microphone from App Settings.",
    	"To use the voice recording feature, enable access to the microphone and to write to storage from App Settings": " To use the voice recording feature, enable access to the microphone and to write to storage from App Settings ",
    	"To use the voice recording feature, enable access to the microphone from App Settings": "To use the voice recording feature, enable access to the microphone from App Settings ",
    	"Voice recording": "VOICE RECORDING",
    	"Volume too low": "Volume too low",
    	"We need access to your microphone.": "We need access to your microphone.",
    	"We need to write to your phone so we can save the recording.": "We need to write to your phone so we can save the recording.",
    	"Write to storage": "Write to storage"
    };
    var HomeScreen$7 = {
    	"The progress will be available after the 2nd measuring day": "The progress will be available after the 2nd measuring day",
    	"Did you have a dry night?": "Did you have a dry night?",
    	"Do it later": "Do it later",
    	"Do you want first to leave a review on ThrustPilot?": "Do you want first to leave a review on ThrustPilot?",
    	"Feedback sent!": "Feedback sent!",
    	"Give feedback": "Give feedback",
    	"Go to sleep": "Go to sleep",
    	"How are you doing?": "How are you doing?",
    	No: "No",
    	"Oops, little interruption": "Oops, little interruption",
    	Resume: "Resume",
    	"Resume sensor sound detection.": "Resume sensor sound detection.",
    	"Take 2 minutes to share your thoughts.": "Take 2 minutes to share your thoughts.",
    	"Wake up": "Wake up",
    	Yes: "Yes",
    	Alarm: "Alarm"
    };
    var OnboardingScreen$7 = {
    	"Hi!": "Hi!",
    	"How old are you?": "How old are you?",
    	"To start using Oopsie Heroes, we first need your email address.": " To start using Oopsie Heroes, we first need your email address.",
    	"I agree to the": "I agree to the",
    	"Privacy Policy": "Privacy Policy",
    	Email: "Email",
    	"Email or phone number": "Email or phone number",
    	"Pick your hero!": "Pick your hero!",
    	Next: "Next",
    	"Let’s go!": "Let’s go!",
    	Start: "Start"
    };
    var CalendarScreen$7 = {
    	April: "April",
    	August: "August",
    	Calendar: "Calendar",
    	December: "December",
    	Delete: "Delete",
    	"Do you really want delete this event?": "Do you really want delete this event?",
    	February: "February",
    	Fri: "Fri",
    	January: "January",
    	July: "July",
    	June: "June",
    	March: "March",
    	May: "May",
    	Mon: "Mon",
    	November: "November",
    	October: "October",
    	"PERCENTAGE DRY NIGHTS": "PERCENTAGE DRY NIGHTS",
    	Sat: "Sat",
    	September: "September",
    	Sun: "Sun",
    	"TOTAL STARS EARNED": "TOTAL STARS EARNED",
    	Thu: "Thu",
    	Tue: "Tue",
    	Wed: "Wed",
    	"You received ": "You received",
    	"You’re a superstar!": "You’re a superstar !",
    	"No wet events this day": "No wet events this day",
    	"one star": "one star"
    };
    var feedback_questions$7 = {
    	"Are the stickers strong enough?": "Are the stickers strong enough?",
    	"Any thoughts or suggestions you would like to share?": "Any thoughts or suggestions you would like to share?",
    	"Ask Me Later": "Ask Me Later",
    	"Awesome!": "Awesome!",
    	Bad: "Bad",
    	Comments: "Comments",
    	"Do Pee-Rest-Pee": "Do Pee-Rest-Pee",
    	"Do you wake up sooner with the voice recording than with the standard alarm sound?": "Do you wake up sooner with the voice recording than with the standard alarm sound?",
    	"Does the alarm wake you up ?": "Does the alarm wake you up ?",
    	Done: "Done",
    	Feedback: "Feedback",
    	"Good night": "Good night",
    	Great: "Great",
    	"How was your experience opening the Oopsie Heroes packaging?": "How was your experience opening the Oopsie Heroes packaging?",
    	"How was your general experience using Oopsie Heroes?": "How was your general experience using Oopsie Heroes?",
    	"Is the alarm easy to turn off ": "Is the alarm easy to turn off ",
    	Leave: "Leave",
    	"Leaving already?": "Leaving already?",
    	"Listening to your sensor": "Listening to your sensor",
    	"No Internet connection": "No Internet connection",
    	"Not yet": "Not yet",
    	"Oopsie Heroes Plus": "Oopsie Heroes Plus",
    	"Sensor detection": "Sensor detection",
    	Sometimes: "Sometimes",
    	Start: "Start",
    	Terrible: "Terrible",
    	"Was it clear how to use the stickers?": "Was it clear how to use the stickers?",
    	"We don't use it": "We don't use it",
    	"Your feedback will help us to improve our product.": "Your feedback will help us to improve our product."
    };
    var en = {
    	Continue: Continue$7,
    	SettingsScreen: SettingsScreen$7,
    	HomeScreen: HomeScreen$7,
    	OnboardingScreen: OnboardingScreen$7,
    	CalendarScreen: CalendarScreen$7,
    	feedback_questions: feedback_questions$7
    };

    var Continue$6 = "Continue";
    var No$1 = "Nee";
    var Yes$1 = "Ja";
    var SettingsScreen$6 = {
    	Alarm: "Alarm",
    	"Stop alarm": "Stop alarm",
    	"Choose your alarm sound": "Selecteer je alarm geluid",
    	"Alarm Settings": "ALARM  INSTELLINGEN",
    	"Record the voice of one of your parents:": "Neem de stem van een van je ouders op",
    	"Are you sure you want to reset your user?": "Weet je zeker dat je de gebruiker wilt resetten?",
    	Cancel: "Annuleer",
    	"Go to Settings": "Ga naar Instellingen",
    	"Harsh alarm": "LUID ALARM",
    	"Increase the volume to hear the sound ": "Verhoog het volume om het geluid te horen ",
    	"Listen to microphone": "Luister naar de microfoon",
    	OK: "Oke",
    	"Phone-like": "TELEFOONGELUID",
    	"Please record a personal message first": "Je moet eerst een persoonlijk bericht inspreken",
    	"Recording…": "Opnemen…",
    	"Remember the alarm sound": "Herinner het alarm geluid",
    	Reset: "Reset",
    	"Reset user": "Reset gebruiker",
    	Rooster: "HAAN",
    	"Select Sensor": "Selecteer Sensor",
    	Sensor: "Sensor",
    	Settings: "Instellingen",
    	"Smooth & Gentle": "ZACHT EN RUSTIG",
    	"To detect sensor sound, enable access to the microphone from App Settings.": "Om het geluid van de sensor te kunnen detecteren, geef toegang tot de microfoon in de app instellingen.",
    	"To use the voice recording feature, enable access to the microphone and to write to storage from App Settings": "Om de stemopname functie te kunnen gebruiken, geef toestemmingen voor de microfoon en om te schrijven in de App Instellingen",
    	"To use the voice recording feature, enable access to the microphone from App Settings": "Om de stemopname functie te kunnen gebruiken, geef toestemmingen voor de microfoon in de App Instellingen",
    	"Voice recording": "STEMOPNAME",
    	"Volume too low": "Volume te laag",
    	"We need access to your microphone.": "We hebben toegang tot de microfoon nodig.",
    	"We need to write to your phone so we can save the recording.": "We moeten naar je telefoon schrijven om de opname op te slaan.",
    	"Write to storage": "Schrijven naar opslag"
    };
    var HomeScreen$6 = {
    	"The progress will be available after the 2nd measuring day": "The progress will be available after the 2nd measuring day",
    	"Did you have a dry night?": "Heb je een droge nacht?",
    	"Do it later": "Doe het later",
    	"Do you want first to leave a review on ThrustPilot?": "Wilt u als eerste een beoordeling achterlaten over ThrustPilot ?",
    	"Feedback sent!": "Feedback opgestuurd!",
    	"Give feedback": "Geef feedback",
    	"Go to sleep": "Gaan slapen",
    	"How are you doing?": "Hoe gaat het?",
    	"Oops, little interruption": "Oops, kleine onderbreking",
    	Resume: "Verder gaan",
    	"Resume sensor sound detection.": "Verder gaan met sensorgeluid detectie.",
    	"Take 2 minutes to share your thoughts.": "Neem 2 minuutjes om je mening te delen.",
    	"Wake up": "Wakker worden"
    };
    var OnboardingScreen$6 = {
    	"Hi!": "Hi!",
    	"How old are you?": "Hoe oud ben je?",
    	"To start using Oopsie Heroes, we first need your email address.": " Om Oopsie Heroes te kunnen gebruiken, hebben we eerst je email adres nodig.",
    	"I agree to the": "Ik ga akkoord met",
    	"Privacy Policy": "Privacybeleid",
    	Email: "Email",
    	"Pick your hero!": "Kies je held!",
    	Next: "Volgende",
    	"Let’s go!": "Laten we beginnen !"
    };
    var CalendarScreen$6 = {
    	April: "April",
    	August: "Augustus",
    	Calendar: "Kalender",
    	December: "December",
    	Delete: "Wissen",
    	"Do you really want delete this event?": "Wil je dit event echt wissen?",
    	February: "Februari",
    	Fri: "Vr",
    	January: "Januari",
    	July: "Juli",
    	June: "Juni",
    	March: "Maart",
    	May: "Mei",
    	Mon: "Ma",
    	November: "November",
    	October: "Oktober",
    	"PERCENTAGE DRY NIGHTS": "PERCENTAGE DROGE NACHTEN",
    	Sat: "Za",
    	September: "September",
    	Sun: "Zo",
    	"TOTAL STARS EARNED": "TOTALE AANTAL STERREN",
    	Thu: "Do",
    	Tue: "Di",
    	Wed: "Wo",
    	"You received ": "Je hebt een ster",
    	"You’re a superstar!": "Je bent een held ",
    	"No wet events this day": "Geen Oopsie moment vandaag",
    	"one star": "verdiend"
    };
    var feedback_questions$6 = {
    	"Are the stickers strong enough?": "Zijn de stickers sterk genoeg?",
    	"Privacy Policy": "Privacybeleid",
    	"Any thoughts or suggestions you would like to share?": "Heb je nog bevindingen of verbeteringen voor ons?",
    	"Ask Me Later": "Later nog eens vragen",
    	"Awesome!": "Geweldig!",
    	Bad: "Slecht",
    	Comments: "Commentaar",
    	"Do Pee-Rest-Pee": "Doe Plas-Rust-Plas",
    	"Do you wake up sooner with the voice recording than with the standard alarm sound?": "Word je eerder wakker door de stem van je ouders dan met het standaard alarm?",
    	"Does the alarm wake you up ?": "Word je wakker van het alarm ?",
    	Done: "Klaar",
    	Email: "Email",
    	Feedback: "Feedback",
    	"Good night": "Welterusten",
    	Great: "Goed",
    	"Hi!": "Hi!",
    	"How old are you?": "Hoe oud ben je?",
    	"How was your experience opening the Oopsie Heroes packaging?": "Hoe was je ervaring met het openen van de verpakking?",
    	"How was your general experience using Oopsie Heroes?": "Hoe was je algemene ervaring met Oopsie Heroes?",
    	"I agree to the": "Ik ga akkoord met:",
    	"Is the alarm easy to turn off ": "Kan het alarm makkelijk uitgezet worden ",
    	Leave: "Verlaten",
    	"Leaving already?": "Ga je nu al?",
    	"Listening to your sensor": "Luisteren naar de sensor",
    	Next: "Volgende",
    	"No Internet connection": "Geen internetverbinding",
    	"Not yet": "Nog niet",
    	"Oopsie Heroes": "Oopsie Heroes",
    	"Oopsie Heroes Plus": "Oopsie Heroes Plus",
    	"Pick your hero!": "Kies je held!",
    	"Sensor detection": "Sensor detectie",
    	Sometimes: "Soms",
    	Start: "Start",
    	Terrible: "Erg slecht",
    	"To start using Oopsie Heroes, we first need your email address.": "Om Oopsie Heroes te kunnen gebruiken, hebben we eerst je email adres nodig.",
    	"Was it clear how to use the stickers?": "Was het duidelijk hoe de stickers te gebruiken?",
    	"We don't use it": "We gebruiken het niet",
    	"Your feedback will help us to improve our product.": "Opslaan naar lokale opslag."
    };
    var nl = {
    	Continue: Continue$6,
    	No: No$1,
    	Yes: Yes$1,
    	SettingsScreen: SettingsScreen$6,
    	HomeScreen: HomeScreen$6,
    	OnboardingScreen: OnboardingScreen$6,
    	CalendarScreen: CalendarScreen$6,
    	feedback_questions: feedback_questions$6
    };

    var Continue$5 = "次へ";
    var activityScreen = {
    	"You have a leakage during": "漏れるのは",
    	Exercising: "運動している時",
    	Sleeping: "寝ている時",
    	"Standing still": "じっとしている時",
    	Sneezing: "くしゃみした時",
    	"I have no leakage": "ik heb geen verlies"
    };
    var howDidItGoScreen = {
    	"How did it go": "結果入力",
    	"How many jumps could you do until you had a leakage": "何回ジャンプできましたか",
    	"How many seconds could you hold the contraction during the squat": "スクワットの間何秒間引き締めていられましたか"
    };
    var SettingsScreen$5 = {
    	Alarm: "アラーム",
    	"Alarm Settings": "アラーム設定",
    	"Are you sure you want to reset your user?": "ユーザーを変更しますか？",
    	"Ask Me Later": "あとで",
    	Cancel: "変更しない",
    	"Choose your alarm sound": "目覚まし音を選んでください",
    	"Go to Settings": "設定を開く",
    	"Harsh alarm": "警報音",
    	"Increase the volume to hear the sound.": "音量をあげてください",
    	"Listen to microphone": "聴いて",
    	"Phone-like": "電話の音",
    	"Please record a personal message first": "まずメッセージを録音してください",
    	"Record the voice of one of your parents:": "パパかママの声を録音しましょう",
    	"Recording…": "録音中",
    	"Remember the alarm sound": "目覚ましが鳴ったら起きること",
    	Reset: "変更する",
    	"Reset user": "ユーザー変更",
    	Resume: "戻る",
    	"Resume sensor sound detection.": "センサー音検知に戻る",
    	Rooster: "コケコッコー",
    	"Select Sensor": "どちらを使いますか？",
    	Sensor: "センサー",
    	"Sensor detection": "センサー検知",
    	Settings: "設定",
    	"Smooth & Gentle": "優しい音",
    	"Oopsie Heroes": "ウープシーヒーローズ",
    	"Stop alarm": "目覚まし停止",
    	"To detect sensor sound, enable access to the microphone from App Settings.": "センサー音を検知するにはマイクへのアクセスを許可してください。",
    	"To use the voice recording feature, enable access to the microphone and to write to storage from App Settings": "録音するには「設定」でマイクへのアクセスとストレージへの書き込みを許可してください",
    	"To use the voice recording feature, enable access to the microphone from App Settings": "録音するには「設定」でマイクへのアクセスを許可してください",
    	"Voice recording": "録音した目覚まし音",
    	"Volume too low": "音が小さすぎるよ",
    	"We need to write to your phone so we can save the recording.": "スマホに録音メッセージの書き込みをします",
    	"Write to storage": "ストレージに書き込む"
    };
    var HomeScreen$5 = {
    	"Did you have a dry night?": "昨日はおねしょを洩らしませんでしたね？",
    	"Do Pee-Rest-Pee": "寝る前におしっこする-寝る-目を覚ましておしっこにいく",
    	"Do it later": "あとで",
    	"Do you want first to leave a review on ThrustPilot ?": "レビューをTrustpilotに書き込んでいただけますか？",
    	"Feedback sent!": "送信！",
    	"Give feedback": "評価する",
    	"Go to sleep": "おやすみモードにする",
    	"Good night": "おやすみなさい",
    	"How did we do?": "感想をお寄せください",
    	"Let us know by leaving a review on TrustPilot": "レビューをTrustpilotに書き込んでいただけますか",
    	No: "いいえ",
    	"Oops, little interruption": "電話/メールが届きました",
    	"Wake up": "おやすみモード終了",
    	Yes: "はい"
    };
    var OnboardingScreen$5 = {
    	"Hi!": "こんにちは！",
    	"How old are you?": "年齢は？",
    	"To start using Oopsie Heroes, we first need your email address.": "まず、eメールアドレスを入力",
    	"I agree to the": "同意します",
    	"Privacy Policy": "個人情報の取り扱い",
    	Email: "Eメール",
    	"Pick your hero!": "キャラクターを決めて！",
    	Next: "次",
    	"Let’s go!": "開始",
    	Start: "スタート"
    };
    var CalendarScreen$5 = {
    	April: "4月",
    	August: "素晴らしい！",
    	Calendar: "カレンダー",
    	December: "12月",
    	Delete: "削除",
    	"Do you really want delete this event?": "削除してもいいですか？",
    	February: "2月",
    	Fri: "金",
    	January: "1月",
    	July: "7月",
    	June: "6月",
    	March: "3月",
    	May: "5月",
    	Mon: "月",
    	November: "11月",
    	October: "10月",
    	"PERCENTAGE DRY NIGHTS": "おねしょを洩らさなかった割合（%)",
    	Sat: "土",
    	September: "9月",
    	Sun: "日",
    	"TOTAL STARS EARNED": "ごほうびにもらったスター印の数",
    	Thu: "木",
    	Tue: "火",
    	Wed: "水",
    	"You received ": "スター印をゲット!",
    	"You’re a superstar!": "やったね！",
    	"No wet events this day": "今朝はおねしょしてないね。",
    	"one star!": "スター印一つ獲得です"
    };
    var feedback_questions$5 = {
    	"Any thoughts or suggestions you would like to share?": "コメントや提案があればどうぞ",
    	"Are the stickers strong enough?": "貼付けシールは丈夫でしたか？",
    	Bad: "悪い",
    	Comments: "変更しない",
    	"Do you wake up sooner with the voice recording than with the standard alarm sound?": "録音メッセージの方がデフォルトのアラーム音より早く目覚めることができましたか？",
    	"Does the alarm wake you up?": "アラームで起きられましたか？",
    	Done: "完了",
    	Feedback: "評価",
    	Great: "良い",
    	"How was your experience opening the Oopsie Heroes packaging?": "箱を開けたときの状態はどうでしたか？",
    	"How was your general experience using Oopsie Heroes?": "ウープシーヒーローズを使ってみて全体的な評価を教えてください",
    	"Is the alarm easy to turn off?": "アラームはすぐに止められましたか？",
    	Leave: "終了する",
    	"Leaving already?": "もう終了しましたか？",
    	"Listening to your sensor": "センサー音を聞く",
    	"No Internet connection": "インターネットに接続していません",
    	"Not yet": "まだです",
    	OK: "OK",
    	Oopsie: "ウープシーヒーローズがウープシーヒーローズのセンサー音を受信するために、マイクへのアクセスを求めています",
    	"Oopsie Heroes Plus": "ウープシーヒーローズ　プラス",
    	"Say to myself:": "寝る前に自分に言うこと",
    	"\"If I wake up by myself, I go to the toilet to pee\"": "「ひとりでに目が覚めたらトイレに行く。」",
    	"\"If the alarm goes off, I get up immediately and go to the toilet\"": "「目覚ましが鳴ったらすぐに起きてトイレに行く。」",
    	Sometimes: "時々",
    	Terrible: "とても悪い",
    	"Was it clear how to use the stickers?": "接着シールの貼り方はわかりやすかったですか？",
    	"We don't use it": "録音メッセージ機能をつかいませんでした",
    	"We need access to your microphone.": "マイクへのアクセスを許可してください",
    	"Your feedback will help us to improve our product.": "ご意見は今後の当社製品改良に役立てます",
    	"How are you doing?": "ウープシーヒーローズは気に入りましたか？",
    	"Take 2 minutes to share your thoughts.": "感想を聞かせてください。2分で答えられます"
    };
    var ja = {
    	Continue: Continue$5,
    	activityScreen: activityScreen,
    	howDidItGoScreen: howDidItGoScreen,
    	SettingsScreen: SettingsScreen$5,
    	HomeScreen: HomeScreen$5,
    	OnboardingScreen: OnboardingScreen$5,
    	CalendarScreen: CalendarScreen$5,
    	feedback_questions: feedback_questions$5
    };

    var Continue$4 = "Weiter";
    var SettingsScreen$4 = {
    	Alarm: "Alarm",
    	"Stop alarm": "Alarm stoppen",
    	"Choose your alarm sound": "Wähle deinen Alarmton",
    	"Alarm Settings": "ALARM EINSTELLUNGEN",
    	"Record the voice of one of your parents:": "Nimm die Stimme eines deiner Eltern auf:",
    	"Are you sure you want to reset your user?": "Möchten Sie den Benutzer wirklich zurücksetzen?",
    	Cancel: "Abbrechen",
    	"Go to Settings": "Gehe zu den Einstellungen",
    	"Harsh alarm": "Lauter Alarm",
    	"Increase the volume to hear the sound ": "Erhöhen Sie die Lautstärke, um den Ton zu hören.",
    	"Listen to microphone": "Auf das Mikrofon hören",
    	OK: "In Ordung",
    	"Phone-like": "Telefonalarme",
    	"Please record a personal message first": "Bitte nehmen Sie zuerst eine persönliche Nachricht auf",
    	"Recording…": "Aufnahme...",
    	"Remember the alarm sound": "Erinnere dich an den Alarmton",
    	Reset: "Zurücksetzen",
    	"Reset user": "Benutzer zurücksetzen",
    	Rooster: "Hahn",
    	"Select Sensor": "Sensor auswählen",
    	Sensor: "Sensor",
    	Settings: "Einstellungen",
    	"Smooth & Gentle": "Sanft und ruhig",
    	"To detect sensor sound, enable access to the microphone from App Settings.": "Um Sensortöne zu erkennen, aktivieren Sie den Zugriff auf das Mikrofon über die App-Einstellungen.",
    	"To use the voice recording feature, enable access to the microphone and to write to storage from App Settings": "Um die Stimmaufnahme zu verwenden, erlauben Sie den Zugriff auf das Mikrofon und den Speicher in den  App-Einstellungen",
    	"To use the voice recording feature, enable access to the microphone from App Settings": "Um die Stimmaufnahme zu verwenden, erlauben Sie den Zugriff auf das Mikrofon in den  App-Einstellungen",
    	"Voice recording": "Stimmaufnahme",
    	"Volume too low": "Lautstärke zu niedrig",
    	"We need access to your microphone.": "Wir benötigen Zugang zu ihrem Mikrofon.",
    	"We need to write to your phone so we can save the recording.": "Wir benötigen Zugang zu Ihrem Telefon, um die Aufzeichnung speichern zu können.",
    	"Write to storage": "Speichern"
    };
    var HomeScreen$4 = {
    	"The progress will be available after the 2nd measuring day": " ",
    	"Did you have a dry night?": "Hattest sie eine trockene Nacht?",
    	"Do it later": "Versuche, es herauszuzögern",
    	"Do you want first to leave a review on ThrustPilot?": " ",
    	"Feedback sent!": "Feedback gesendet!",
    	"Give feedback": "Feedback geben",
    	"Go to sleep": "Geh schlafen",
    	"How are you doing?": "Wie geht es dir?",
    	No: "Nein",
    	"Oops, little interruption": "Hoppla, kleine Unterbrechung",
    	Resume: "Verder gaan",
    	"Resume sensor sound detection.": "Setzen Sie die Sensorgeräuscherkennung fort.",
    	"Take 2 minutes to share your thoughts.": "Nehmen Sie sich bitte 2 Minuten Zeit, Ihre Gedanken mit uns zu teilen.",
    	"Wake up": "Wach auf",
    	Yes: "Ja"
    };
    var OnboardingScreen$4 = {
    	"Hi!": "Hallo!",
    	"How old are you?": "Wie alt bist du?",
    	"To start using Oopsie Heroes, we first need your email address.": "Um Oopsie Heroes verwenden zu können, benötigen wir zunächst Ihre E-Mail-Adresse.",
    	"I agree to the": "Ich stimme dem zu:",
    	"Privacy Policy": "Datenschutz",
    	Email: "Email",
    	"Pick your hero!": "Wähle deinen Helden!",
    	Next: "Nächster",
    	"Let’s go!": "Los geht's!",
    	Start: "Start"
    };
    var CalendarScreen$4 = {
    	April: "April",
    	August: "August",
    	Calendar: "Kalender",
    	December: "Dezember",
    	Delete: "Löschen",
    	"Do you really want delete this event?": "Möchten Sie dieses Ereignis wirklich löschen?",
    	February: "Februar",
    	Fri: "Fr",
    	January: "Januar",
    	July: "Juli",
    	June: "Juni",
    	March: "März",
    	May: "Mai",
    	Mon: "Mo",
    	November: "November",
    	October: "Oktober",
    	"PERCENTAGE DRY NIGHTS": "PROZENT TROCKENE NÄCHTE",
    	Sat: "Sa",
    	September: "September",
    	Sun: "So",
    	"TOTAL STARS EARNED": "VERDIENTE STERNE",
    	Thu: "Do",
    	Tue: "Di",
    	Wed: "Mi",
    	"You received ": "Du hast eine star",
    	"You’re a superstar!": "Du bist ein Superstar ",
    	"No wet events this day": "Keine Oopsies an diesem Tag",
    	"one star": "verdient"
    };
    var feedback_questions$4 = {
    	"Are the stickers strong enough?": "Sind die Aufkleber stark genug?",
    	"Privacy Policy": "Datenschutz",
    	"Any thoughts or suggestions you would like to share?": "Haben Sie Gedanken oder Anregungen, die Sie teilen möchten?",
    	"Ask Me Later": "Frag mich später",
    	"Awesome!": "Toll!",
    	Bad: "Schlecht",
    	Comments: "Kommentare",
    	"Do Pee-Rest-Pee": "Gehe pinkeln, mache eine Pause, gehe pinkeln",
    	"Do you wake up sooner with the voice recording than with the standard alarm sound?": "Wachen Sie mit der Stimmaufnahme früher auf als mit dem Standard-Alarmton?",
    	"Does the alarm wake you up ?": "Werden Sie durch den Alarm geweckt?",
    	Done: "Erledigt",
    	Email: "Email",
    	Feedback: "Feedback",
    	"Good night": "Gute Nacht",
    	Great: "Großartig",
    	"Hi!": "Hallo!",
    	"How old are you?": "Wie alt bist du?",
    	"How was your experience opening the Oopsie Heroes packaging?": "Wie war Ihre Erfahrung beim Öffnen der Oopsie Heroes Verpackung?",
    	"How was your general experience using Oopsie Heroes?": "Wie war Ihre allgemeine Erfahrung mit Oopsie Heroes?",
    	"I agree to the": "Ich stimme dem zu:",
    	"Is the alarm easy to turn off ": "Ist der Alarm einfach auszuschalten?",
    	Leave: "Schließen",
    	"Leaving already?": "Wollen Sie uns schon verlassen?",
    	"Listening to your sensor": "Auf den Sensor hören",
    	"No Internet connection": "Keine Internetverbindung",
    	"Not yet": "Noch nicht",
    	"Oopsie Heroes": "Oopsie Heroes",
    	"Oopsie Heroes Plus": "Oopsie Heroes Plus",
    	"Pick your hero!": "Wähle deinen Helden!",
    	"Sensor detection": "Sensorerkennung",
    	Sometimes: "Manchmal",
    	Terrible: "Furchtbar",
    	"To start using Oopsie Heroes, we first need your email address.": "Um Oopsie Heroes verwenden zu können, benötigen wir zunächst Ihre E-Mail-Adresse.",
    	"Was it clear how to use the stickers?": "War es klar, wie die Aufkleber verwendet werden?",
    	"We don't use it": "Wir benutzen es nicht",
    	"Your feedback will help us to improve our product.": "Ihr Feedback hilft uns, unser Produkt zu verbessern."
    };
    var de = {
    	Continue: Continue$4,
    	SettingsScreen: SettingsScreen$4,
    	HomeScreen: HomeScreen$4,
    	OnboardingScreen: OnboardingScreen$4,
    	CalendarScreen: CalendarScreen$4,
    	feedback_questions: feedback_questions$4
    };

    var Continue$3 = "continuar";
    var SettingsScreen$3 = {
    	Alarm: "Alarma",
    	"Stop alarm": "Detener alarma",
    	"Choose your alarm sound": "Seleccione la alarma",
    	"Alarm Settings": "Configurar Alarma",
    	"Record the voice of one of your parents:": "Registre la voz de uno de sus padres:",
    	"Are you sure you want to reset your user?": "¿Está seguro que quiere reiniciar su usuario?",
    	Cancel: "Cancelar",
    	"Go to Settings": "Vaya a Configuración",
    	"Harsh alarm": "Alarma fuerte",
    	"Increase the volume to hear the sound ": "Aumente el volumen para escuchar el sonido.",
    	"Listen to microphone": "Escuche el micrófono",
    	OK: "OK",
    	"Phone-like": "Teléfono",
    	"Please record a personal message first": "Por favor primero grabe un mensaje personal",
    	"Recording…": "Grabando...",
    	"Remember the alarm sound": "Recuerde el sonido de la alarma",
    	Reset: "Reiniciar",
    	"Reset user": "Reiniciar usuario",
    	Rooster: "Gallo",
    	"Select Sensor": "Selecciona Sensor",
    	Sensor: "Sensor",
    	Settings: "Configuración",
    	"Smooth & Gentle": "Suave y gentil",
    	"To detect sensor sound, enable access to the microphone from App Settings.": "Para detectar el sonido del sensor, permita el acceso al micrófono desde la configuración de la App.",
    	"To use the voice recording feature, enable access to the microphone and to write to storage from App Settings": "Para grabar la voz, habilite el acceso al micrófono y a los archivos en la Configuración de la App",
    	"To use the voice recording feature, enable access to the microphone from App Settings": "Para grabar la voz, habilite el acceso al micrófono en la Configuración de la App",
    	"Voice recording": "Grabar voz",
    	"Volume too low": "Volumen muy bajo",
    	"We need access to your microphone.": "Necesitamos acceso a su micrófono.",
    	"We need to write to your phone so we can save the recording.": "Necesitamos permiso en su teléfono para guardar la grabación.",
    	"Write to storage": "Guardar"
    };
    var HomeScreen$3 = {
    	"The progress will be available after the 2nd measuring day": "The progress will be available after the 2nd measuring day",
    	"Did you have a dry night?": "¿Pasaste la noche sin mojarte?",
    	"Do it later": "Hazlo más tarde",
    	"Do you want first to leave a review on ThrustPilot?": "¿Quiéres primero dejar una evaluación en ThrustPilot?",
    	"Feedback sent!": "Comentarios enviados!",
    	"Give feedback": "Deje sus comentarios",
    	"Go to sleep": "Ir a dormir",
    	"How are you doing?": "Hoe gaat het?",
    	No: "No",
    	"Oops, little interruption": "Oops, pequeña interrupción",
    	Resume: "Reanudar",
    	"Resume sensor sound detection.": "Reanudar la detección del sonido del sensor.",
    	"Take 2 minutes to share your thoughts.": "Neem 2 minuutjes om je mening te delen.",
    	"Wake up": "Despierta",
    	Yes: "Si"
    };
    var OnboardingScreen$3 = {
    	"Hi!": "¡Hola!",
    	"How old are you?": "¿Cuántos años tienes?",
    	"To start using Oopsie Heroes, we first need your email address.": "Para utilizar Oopsie Héroes, necesitamos su dirección de correo electrónico.",
    	"I agree to the": "Estoy de acuerdo con",
    	"Privacy Policy": "Política de Privacidad",
    	Email: "Correo Electrónico",
    	"Pick your hero!": "¡Elije a tu héroe!",
    	Next: "Siguiente",
    	"Let’s go!": "¡Vamos",
    	Start: "Iniciar"
    };
    var CalendarScreen$3 = {
    	April: "Abril",
    	August: "Agosto",
    	Calendar: "Calendario",
    	December: "Diciembre",
    	Delete: "Eliminar",
    	"Do you really want delete this event?": "¿De verdad quieres eliminar este evento?",
    	February: "Febrero",
    	Fri: "Vi",
    	January: "Enero",
    	July: "Julio",
    	June: "Junio",
    	March: "Marzo",
    	May: "Mayo",
    	Mon: "Lun",
    	November: "Noviembre",
    	October: "Octubre",
    	"PERCENTAGE DRY NIGHTS": "PORCENTAJE DE NOCHES SECAS",
    	Sat: "Sab",
    	September: "Septiembre",
    	Sun: "Dom",
    	"TOTAL STARS EARNED": "TOTAL DE ESTRELLAS GANADAS",
    	Thu: "Ju",
    	Tue: "Ma",
    	Wed: "Mie",
    	"You received ": "Recibiste ",
    	"You’re a superstar!": "¡Eres super ",
    	"No wet events this day": "Hoy no hubo ningún evento",
    	"one star": "¡una estrella"
    };
    var feedback_questions$3 = {
    	"Are the stickers strong enough?": "¿Son las calcomanías suficientemente fuertes?",
    	"Any thoughts or suggestions you would like to share?": "¿Sugerencias a compartir?",
    	"Ask Me Later": "Preguntar más tarde",
    	"Awesome!": "¡Asombroso!",
    	Bad: "Mal",
    	Comments: "Comentarios",
    	"Do Pee-Rest-Pee": "Hacer Pipí-Descansar-Pipí",
    	"Do you wake up sooner with the voice recording than with the standard alarm sound?": "¿Despiertas más rápido con la voz grabada que con la alarma normal?",
    	"Does the alarm wake you up ?": "¿Te despertó la alarma?",
    	Done: "Hecho",
    	Feedback: "Comentarios",
    	"Good night": "Buenas noches",
    	Great: "Grandioso",
    	"How was your experience opening the Oopsie Heroes packaging?": "¿Cómo fue su experiencia abriendo el paquete Oopsie Héroes?",
    	"How was your general experience using Oopsie Heroes?": "¿En general cómo fue su experiencia utilizando Oopsie Héroes?",
    	"Is the alarm easy to turn off ": "¿Es fácil de apagar la alarma?",
    	Leave: "Salir",
    	"Leaving already?": "¿Listo para salir?",
    	"Listening to your sensor": "Escuchando tu sensor",
    	"No Internet connection": "Sin conexión a internet",
    	"Not yet": "Aun no",
    	"Oopsie Heroes": "Oopsie Heroes",
    	"Oopsie Heroes Plus": "Oopsie Heroes Plus",
    	"Sensor detection": "Detección de sensor",
    	Sometimes: "Algunas veces",
    	Terrible: "Terrible",
    	"Was it clear how to use the stickers?": "¿Fue claro cómo utilizar las calcomanías?",
    	"We don't use it": "No lo utilizamos",
    	"Your feedback will help us to improve our product.": "Sus comentarios nos ayudan a mejorar el producto."
    };
    var es = {
    	Continue: Continue$3,
    	SettingsScreen: SettingsScreen$3,
    	HomeScreen: HomeScreen$3,
    	OnboardingScreen: OnboardingScreen$3,
    	CalendarScreen: CalendarScreen$3,
    	feedback_questions: feedback_questions$3
    };

    var Continue$2 = "继续";
    var Yes = "是";
    var No = "否";
    var SettingsScreen$2 = {
    	Alarm: "闹钟",
    	"Stop alarm": "停止闹钟",
    	"Choose your alarm sound": "选择闹钟声音",
    	"Alarm Settings": "闹钟设置",
    	"Record the voice of one of your parents:": "录制一位家长的声音：",
    	"Are you sure you want to reset your user?": "确定要重置用户吗？",
    	Cancel: "取消",
    	"Go to Settings": "前往设置",
    	"Harsh alarm": "急促",
    	"Increase the volume to hear the sound ": "调高音量以听到声音",
    	"Listen to microphone": "监听麦克风",
    	OK: "确定",
    	"Phone-like": "电话铃声",
    	"Please record a personal message first": "请先录制个人消息",
    	"Recording…": "录音中……",
    	"Remember the alarm sound": "记住闹钟声音",
    	Reset: "重置",
    	"Reset user": "重置用户",
    	Rooster: "公鸡",
    	"Select Sensor": "选择传感器",
    	Sensor: "传感器",
    	Settings: "设置",
    	"Smooth & Gentle": "舒缓",
    	"Oopsie Heroes": "Oopsie Heroes",
    	"To detect sensor sound, enable access to the microphone from App Settings.": "要检测传感器声音，请在应用设置中启用麦克风权限。",
    	"To use the voice recording feature, enable access to the microphone and to write to storage from App Settings": "要使用录音功能，请在应用设置中启用麦克风和存储权限。",
    	"To use the voice recording feature, enable access to the microphone from App Settings": "要使用录音功能，请在应用设置中启用麦克风权限。",
    	"Voice recording": "录音",
    	"Volume too low": "音量太低",
    	"We need access to your microphone.": "我们需要访问您的麦克风。",
    	"We need to write to your phone so we can save the recording.": "我们需要写入手机，以便保存录音。",
    	"Write to storage": "写入存储空间"
    };
    var HomeScreen$2 = {
    	"The progress will be available after the 2nd measuring day": "完成第 2 天测量后即可查看进度",
    	"Did you have a dry night?": "昨晚睡得好吗？",
    	"Do it later": "稍后再做",
    	"Do you want first to leave a review on ThrustPilot?": "您想先在 ThrustPilot 上留下评价吗？",
    	"Feedback sent!": "反馈已发送！",
    	"Give feedback": "提供反馈",
    	"Go to sleep": "去睡觉",
    	"How are you doing?": "感觉怎么样？",
    	No: "否",
    	"Oops, little interruption": "糟糕，出现了一点小中断",
    	Resume: "继续",
    	"Resume sensor sound detection.": "继续检测传感器声音。",
    	"Take 2 minutes to share your thoughts.": "花两分钟分享您的想法。",
    	"Wake up": "起床",
    	Yes: "是",
    	Alarm: "闹钟"
    };
    var OnboardingScreen$2 = {
    	"Hi!": "嗨！",
    	"How old are you?": "您几岁了？",
    	"To start using Oopsie Heroes, we first need your email address.": "开始使用 Oopsie Heroes 前，我们需要您的电子邮件地址。",
    	"I agree to the": "我同意",
    	"Privacy Policy": "隐私政策",
    	Email: "电子邮件",
    	"Email or phone number": "电子邮件或电话号码",
    	"Pick your hero!": "选择您的英雄！",
    	Next: "下一步",
    	"Let’s go!": "开始吧！",
    	Start: "开始"
    };
    var CalendarScreen$2 = {
    	April: "四月",
    	August: "八月",
    	Calendar: "日历",
    	December: "十二月",
    	Delete: "删除",
    	"Do you really want delete this event?": "确定要删除此事件吗？",
    	February: "二月",
    	Fri: "周五",
    	January: "一月",
    	July: "七月",
    	June: "六月",
    	March: "三月",
    	May: "五月",
    	Mon: "周一",
    	November: "十一月",
    	October: "十月",
    	"PERCENTAGE DRY NIGHTS": "干燥夜晚百分比",
    	Sat: "周六",
    	September: "九月",
    	Sun: "周日",
    	"TOTAL STARS EARNED": "获得的星星总数",
    	Thu: "周四",
    	Tue: "周二",
    	Wed: "周三",
    	"You received ": "您获得了 ",
    	"You’re a superstar!": "您真是超级明星！",
    	"No wet events this day": "今天没有尿湿事件",
    	"one star": "一颗星"
    };
    var feedback_questions$2 = {
    	"Are the stickers strong enough?": "贴纸足够牢固吗？",
    	"Any thoughts or suggestions you would like to share?": "您有什么想法或建议想分享吗？",
    	"Ask Me Later": "稍后再问",
    	"Awesome!": "太棒了！",
    	Bad: "不好",
    	Comments: "评论",
    	"Do Pee-Rest-Pee": "尿尿-休息-尿尿",
    	"Do you wake up sooner with the voice recording than with the standard alarm sound?": "与标准闹钟相比，录音能更快叫醒您吗？",
    	"Does the alarm wake you up ?": "闹钟能叫醒您吗？",
    	Done: "完成",
    	Feedback: "反馈",
    	"Good night": "晚安",
    	Great: "很好",
    	"How was your experience opening the Oopsie Heroes packaging?": "您觉得 Oopsie Heroes 的包装容易打开吗？",
    	"How was your general experience using Oopsie Heroes?": "您使用 Oopsie Heroes 的整体体验如何？",
    	"Is the alarm easy to turn off ": "闹钟容易关闭吗？",
    	Leave: "离开",
    	"Leaving already?": "已经要离开了吗？",
    	"Listening to your sensor": "正在监听您的传感器",
    	"No Internet connection": "没有互联网连接",
    	"Not yet": "还没有",
    	"Oopsie Heroes": "Oopsie Heroes",
    	"Oopsie Heroes Plus": "Oopsie Heroes Plus",
    	"Sensor detection": "传感器检测",
    	Sometimes: "有时",
    	Start: "开始",
    	Terrible: "很差",
    	"Was it clear how to use the stickers?": "贴纸的使用方法清楚吗？",
    	"We don't use it": "我们没有使用",
    	"Your feedback will help us to improve our product.": "您的反馈将帮助我们改进产品。"
    };
    var zh_CN = {
    	Continue: Continue$2,
    	Yes: Yes,
    	No: No,
    	SettingsScreen: SettingsScreen$2,
    	HomeScreen: HomeScreen$2,
    	OnboardingScreen: OnboardingScreen$2,
    	CalendarScreen: CalendarScreen$2,
    	feedback_questions: feedback_questions$2
    };

    var Continue$1 = "Devam";
    var SettingsScreen$1 = {
    	Alarm: "Alarm",
    	"Choose your alarm sound": "Alarm sesinizi seçin",
    	"Alarm Settings": "Alarm Ayarları",
    	"Record the voice of one of your parents:": "Ebeveynlerinizden birinin sesini kaydedin",
    	"Are you sure you want to reset your user?": "Kullanıcınızı sıfırlamak istediğinizden emin misiniz?",
    	Cancel: "İptal",
    	"Go to Settings": "Ayarlara Git",
    	"Harsh alarm": "SERT",
    	"Increase the volume to hear the sound ": "Sesi duymak için sesi artırın ",
    	"Listen to microphone": "Mikrofonu dinle",
    	OK: "TAMAM",
    	"Phone-like": "Telefon benzeri",
    	"Please record a personal message first": "Lütfen önce kişisel bir mesaj kaydedin",
    	"Recording…": "Kaydediliyor...",
    	"Remember the alarm sound": "Alarm sesini hatırla",
    	Reset: "Sıfırla",
    	"Reset user": "Kullanıcıyı sıfırla",
    	Rooster: "kılavuz",
    	"Select Sensor": "Sensör Seçin",
    	Sensor: "Sensör",
    	Settings: "Ayarlar",
    	"Smooth & Gentle": "Pürüzsüz ve Nazik",
    	"To detect sensor sound, enable access to the microphone from App Settings.": "Sensör sesini algılamak için Uygulama Ayarları'ndan mikrofona erişimi etkinleştirin.",
    	"To use the voice recording feature, enable access to the microphone and to write to storage from App Settings": "Ses kayıt özelliğini kullanmak için Uygulama Ayarlarından mikrofona erişimi ve depolama alanına yazmayı etkinleştirin",
    	"Voice recording": "Ses kaydı",
    	"Volume too low": "Ses seviyesi çok düşük",
    	"We need access to your microphone.": "Mikrofonunuza erişmemiz gerekiyor.",
    	"We need to write to your phone so we can save the recording.": "Kaydı kaydedebilmemiz için telefonunuza yazmamız gerekiyor.",
    	"Write to storage": "Depoya yaz"
    };
    var HomeScreen$1 = {
    	"The progress will be available after the 2nd measuring day": "The progress will be available after the 2nd measuring day",
    	"Did you have a dry night?": "Kuru bir gece geçirdin mi?",
    	"Do it later": "Sonra yap",
    	"Do you want first to leave a review on ThrustPilot?": "ThrustPilot'a ilk siz mi yorum bırakmak istiyorsunuz?",
    	"Feedback sent!": "Geri bildirim gönderildi!",
    	"Give feedback": "Geri bildirim ver",
    	"Go to sleep": "Uyumaya git",
    	"How are you doing?": "Nasılsın?",
    	No: "Hayır",
    	"Oops, little interruption": "Oops, küçük kesinti",
    	Resume: "Özgeçmiş",
    	"Resume sensor sound detection.": "Sensör ses algılamasını sürdür.",
    	"Take 2 minutes to share your thoughts.": "Düşüncelerinizi paylaşmak için 2 dakika ayırın.",
    	"Wake up": "Uyan",
    	Yes: "Evet",
    	Alarm: "Alarm"
    };
    var OnboardingScreen$1 = {
    	"Hi!": "Merhaba!",
    	"How old are you?": "Kaç yaşındasın?",
    	"To start using Oopsie Heroes, we first need your email address.": "Oopsie Heroes'u kullanmaya başlamak için önce e-posta adresinize ihtiyacımız var.",
    	"I agree to the": "Kabul ediyorum",
    	"Privacy Policy": "Gizlilik Politikası",
    	Email: "E-posta",
    	"Pick your hero!": "Kahramanını seç!",
    	Next: "Sonraki",
    	"Let’s go!": "Hadi gidelim !",
    	Start: "Başlat"
    };
    var CalendarScreen$1 = {
    	April: "Nisan",
    	August: "Ağustos",
    	Calendar: "TAKVIM",
    	December: "Aralık",
    	Delete: "Sil",
    	"Do you really want delete this event?": "Bu etkinliği gerçekten silmek istiyor musunuz ?",
    	February: "Şubat",
    	Fri: "Cuma",
    	January: "Ocak",
    	July: "Temmuz",
    	June: "Haziran",
    	March: "Mart",
    	May: "Mayıs",
    	Mon: "Pzt",
    	November: "Kasım",
    	October: "Ekim",
    	"PERCENTAGE DRY NIGHTS": "KURU GECELERIN YÜZDESI",
    	Sat: "Cmt",
    	September: "Eylül",
    	Sun: "Paz",
    	"TOTAL STARS EARNED": "KAZANILAN TOPLAM YILDIZLAR",
    	Thu: "Per",
    	Tue: "Salı",
    	Wed: "Car",
    	"You received ": "Teslim aldınız",
    	"You’re a superstar!": "Sen bir süperstarsın !",
    	"No wet events this day": "Bu gün kaza yok",
    	"one star": "bir yıldız"
    };
    var feedback_questions$1 = {
    	"Are the stickers strong enough?": "Çıkartmalar yeterince güçlü mü ?",
    	"Any thoughts or suggestions you would like to share?": "Paylaşmak istediğiniz herhangi bir düşünce veya öneri var mı ?",
    	"Ask Me Later": "Sonra Sor",
    	"Awesome!": "Müthiş !",
    	Bad: "Kötü",
    	Comments: "Yorumlar",
    	"Do Pee-Rest-Pee": "çiş yap dinlenme çişi",
    	"Do you wake up sooner with the voice recording than with the standard alarm sound?": "Ses kaydı ile standart alarm sesinden daha mı erken uyanıyorsunuz ?",
    	"Does the alarm wake you up ?": "Alarm sizi uyandırıyor mu ?",
    	Done: "Bitti",
    	Feedback: "Geri bildirim",
    	"Good night": "İyi geceler",
    	Great: "Harika",
    	"How was your experience opening the Oopsie Heroes packaging?": "Oopsie Heroes ambalajını açma deneyiminiz nasıldı ?",
    	"How was your general experience using Oopsie Heroes?": "Oopsie Heroes'u kullanırken genel deneyiminiz nasıldı ?",
    	"Is the alarm easy to turn off ": "Alarmın kapatılması kolay mı ?",
    	Leave: "Ayrıl",
    	"Leaving already?": "Şimdiden ayrılıyor musun ?",
    	"Listening to your sensor": "Sensörünüzü dinliyor",
    	"No Internet connection": "İnternet bağlantısı yok",
    	"Not yet": "Henüz değil",
    	"Oopsie Heroes": "Oopsie Heroes",
    	"Oopsie Heroes Plus": "Oopsie Heroes Plus",
    	"Sensor detection": "Sensör algılama",
    	Sometimes: "Bazen",
    	Start: "Başlat",
    	"Stop alarm": "Alarmı durdur",
    	Terrible: "Korkunç",
    	"Was it clear how to use the stickers?": "Çıkartmaların nasıl kullanılacağı açık mıydı?",
    	"We don't use it": "Biz kullanmıyoruz",
    	"Your feedback will help us to improve our product.": "Geri bildiriminiz ürünümüzü geliştirmemize yardımcı olacaktır."
    };
    var tu = {
    	Continue: Continue$1,
    	SettingsScreen: SettingsScreen$1,
    	HomeScreen: HomeScreen$1,
    	OnboardingScreen: OnboardingScreen$1,
    	CalendarScreen: CalendarScreen$1,
    	feedback_questions: feedback_questions$1
    };

    var Continue = "Continue";
    var SettingsScreen = {
    	Alarm: "Alarme",
    	"Choose your alarm sound": "Choisissez le son de votre alarme",
    	"Alarm Settings": "Paramètres de l'alarme",
    	"Record the voice of one of your parents:": "Enregistrez la voix de l'un de vos parents",
    	"Are you sure you want to reset your user?": "Êtes-vous sûr de vouloir réinitialiser votre utilisateur ?",
    	Cancel: "Annuler",
    	"Go to Settings": "Aller dans les paramètres",
    	"Harsh alarm": "Alarme brutale",
    	"Increase the volume to hear the sound ": "Augmenter le volume pour entendre le son",
    	"Listen to microphone": "Écouter le microphone",
    	OK: "OK",
    	"Phone-like": "Comme un téléphone",
    	"Please record a personal message first": "Veuillez d'abord enregistrer un message personnel",
    	"Recording…": "Enregistrement...",
    	"Remember the alarm sound": "Mémoriser le son de l'alarme",
    	Reset: "Réinitialiser",
    	"Reset user": "Réinitialiser l'utilisateur",
    	Rooster: "Coq",
    	"Select Sensor": "Sélectionner capteur",
    	Sensor: "Capteur",
    	Settings: "Paramètres",
    	"Smooth & Gentle": "Lisse et doux",
    	"To detect sensor sound, enable access to the microphone from App Settings.": "Pour détecter le son du capteur, activez l'accès au microphone dans les paramètres de l'application.",
    	"To use the voice recording feature, enable access to the microphone and to write to storage from App Settings": "Pour utiliser la fonction d'enregistrement vocal, activez l'accès au microphone et écrivez dans le stockage à partir des paramètres de l'application",
    	"To use the voice recording feature, enable access to the microphone from App Settings": "Pour utiliser la fonction d'enregistrement vocal, activez l'accès au microphone à partir des paramètres de l'application",
    	"Voice recording": "Enregistrement vocal",
    	"Volume too low": "Volume trop faible",
    	"We need access to your microphone.": "Nous avons besoin d'accéder à votre microphone",
    	"We need to write to your phone so we can save the recording.": "Nous devons écrire sur votre téléphone pour pouvoir sauvegarder l'enregistrement.",
    	"Write to storage": "Ecrire dans la mémoire"
    };
    var HomeScreen = {
    	"The progress will be available after the 2nd measuring day": "Le progrès sera disponible après le 2e jour de mesure",
    	"Did you have a dry night?": "Avez-vous passé une nuit sèche ?",
    	"Do it later": "Faites-le plus tard",
    	"Do you want first to leave a review on ThrustPilot?": "Voulez-vous d'abord laisser un commentaire sur ThrustPilot ?",
    	"Feedback sent!": "Feedback envoyé !",
    	"Give feedback": "Donnez votre avis",
    	"Go to sleep": "Dormir",
    	"How are you doing?": "Comment allez-vous ?",
    	No: "Non",
    	"Oops, little interruption": "Oups, petite interruption",
    	Resume: "Reprendre",
    	"Resume sensor sound detection.": "Reprendre la détection du son du capteur.",
    	"Take 2 minutes to share your thoughts.": "Prenez 2 minutes pour partager vos pensées.",
    	"Wake up": "Réveil",
    	Yes: "Oui",
    	Alarm: "Alarme"
    };
    var OnboardingScreen = {
    	"Hi!": "Salut!",
    	"How old are you?": "Quel âge avez-vous ?",
    	"To start using Oopsie Heroes, we first need your email address.": "Pour commencer à utiliser Oopsie Heroes, nous avons d'abord besoin de votre adresse e-mail.",
    	"I agree to the": " J'accepte les conditions d'utilisation ",
    	"Privacy Policy": "Politique de confidentialité",
    	Email: "Email",
    	"Pick your hero!": "Choisis ton héros !",
    	Next: "Suivant",
    	"Let’s go!": "Allons-y !",
    	Start: "Démarrage"
    };
    var CalendarScreen = {
    	April: "April",
    	August: "Août",
    	Calendar: "CALENDAR",
    	December: "Décembre",
    	Delete: "Supprimer",
    	"Do you really want delete this event?": "Voulez-vous vraiment supprimer cet événement ?",
    	February: "Février",
    	Fri: "Ven",
    	January: "Janvier",
    	July: "Juillet",
    	June: "Juin",
    	March: "Mars",
    	Mon: "Lun",
    	November: "Novembre",
    	October: "Octobre",
    	"PERCENTAGE DRY NIGHTS": "POURCENTAGE DE NUITS SÈCHES",
    	Sat: "Sam",
    	September: "Septembre",
    	Sun: "Dim",
    	"TOTAL STARS EARNED": "NOMBRE TOTAL D'ÉTOILES GAGNÉES",
    	Thu: "Jeu",
    	Tue: "Mar",
    	Wed: "Mer",
    	"You received ": "Vous avez reçu",
    	"You’re a superstar!": "Vous êtes une superstar!",
    	"No wet events this day": "Pas d'événement humide ce jour",
    	"one star": "une étoile"
    };
    var feedback_questions = {
    	"Are the stickers strong enough?": "Les autocollants sont-ils assez résistants ?",
    	"Any thoughts or suggestions you would like to share?": "Vous avez des idées ou des suggestions à partager ?",
    	"Ask Me Later": "Demandez-moi plus tard",
    	"Awesome!": "Génial !",
    	Bad: "Mauvais",
    	Comments: "Commentaires",
    	"Do Pee-Rest-Pee": "Faites pipi-caca",
    	"Do you wake up sooner with the voice recording than with the standard alarm sound?": "Vous réveillez-vous plus tôt avec l'enregistrement vocal qu'avec le son de l'alarme standard ?",
    	"Does the alarm wake you up ?": "L'alarme vous réveille-t-elle ?",
    	Done: "Terminé",
    	Feedback: "Retour d'information",
    	"Good night": "Bonne nuit",
    	Great: "Super",
    	"How was your experience opening the Oopsie Heroes packaging?": "Comment s'est passée l'ouverture de l'emballage d'Oopsie Heroes ?",
    	"How was your general experience using Oopsie Heroes?": "Comment s'est déroulée votre expérience générale d'utilisation de Oopsie Heroes ?",
    	"Is the alarm easy to turn off ": "L'alarme est-elle facile à éteindre?",
    	"Leaving already?": "Vous partez déjà ?",
    	"Listening to your sensor": "Écoute de votre capteur",
    	"No Internet connection": "Pas de connexion Internet",
    	"Not yet": "Pas encore",
    	"Oopsie Heroes": "Oopsie Heroes",
    	"Oopsie Heroes Plus": "Oopsie Heroes Plus",
    	"Sensor detection": "Détection par capteur",
    	Sometimes: "Parfois",
    	Start: "Démarrer",
    	"Stop alarm": "Arrêt de l'alarme",
    	Terrible: "Terrible",
    	"Was it clear how to use the stickers?": "La manière d'utiliser les autocollants était-elle claire ?",
    	"We don't use it": "Nous ne l'utilisons pas",
    	"Your feedback will help us to improve our product.": "Vos commentaires nous aideront à améliorer notre produit."
    };
    var fr = {
    	Continue: Continue,
    	SettingsScreen: SettingsScreen,
    	HomeScreen: HomeScreen,
    	OnboardingScreen: OnboardingScreen,
    	CalendarScreen: CalendarScreen,
    	feedback_questions: feedback_questions
    };

    /* src\App.svelte generated by Svelte v3.59.2 */

    function create_fragment(ctx) {
    	let router;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	addMessages('nl', nl);
    	addMessages('en', en);
    	addMessages('ja', ja);
    	addMessages('de', de);
    	addMessages('es', es);
    	addMessages('zh-CN', zh_CN);
    	addMessages('tr', tu); //'tr' is the short form Turkish language 
    	addMessages('fr', fr);
    	const navigatorLocale = getLocaleFromNavigator();
    	const normalizedNavigatorLocale = navigatorLocale.replace(/_/g, '-');
    	const isChineseLocale = (/^zh(?:-|$)/i).test(normalizedNavigatorLocale);
    	const isTraditionalChineseLocale = (/^zh-(?:hant|tw|hk|mo)(?:-|$)/i).test(normalizedNavigatorLocale);

    	const initialLocale = isChineseLocale
    	? isTraditionalChineseLocale ? 'en' : 'zh-CN'
    	: normalizedNavigatorLocale;

    	init({ fallbackLocale: 'en', initialLocale });

    	onMount(() => {
    		
    	}); //setup_store_values()

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		routes,
    		addMessages,
    		init,
    		getLocaleFromNavigator,
    		en,
    		nl,
    		ja,
    		de,
    		es,
    		zh_CN,
    		tu,
    		fr,
    		onMount,
    		navigatorLocale,
    		normalizedNavigatorLocale,
    		isChineseLocale,
    		isTraditionalChineseLocale,
    		initialLocale
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // import NativeBridge.js , this is injected by IOS webview WKUserContentController
    // it runs javascripts code that can alter variables and DOM elements
    // it also gives functions like setSound1() we can use in our app.
    var app = new App({
        target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
