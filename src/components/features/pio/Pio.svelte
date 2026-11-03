<script lang="ts">
	import { onDestroy, onMount, tick } from "svelte";

	import { pioConfig } from "@/config";

	import type { PioProps } from "./types";

	export let config: Partial<PioProps["config"]> = {};

	const live2dConfig = pioConfig.live2d ?? {};
	const width = config?.width ?? pioConfig.width ?? 300;
	const height = config?.height ?? pioConfig.height ?? 420;
	const mobileBreakpoint = live2dConfig.mobileBreakpoint ?? 1024;
	// 运行时脚本版本号：用于给 l2d.js 加缓存戳，升级运行时后无需用户手动清缓存
	const RUNTIME_VERSION = "2";

	/**
	 * 显示比例模式：
	 * - "full" 全身（默认，画布 300x420）
	 * - "bust" 半身特写（画布 300x300，只显示头部到胸部）
	 * 由按钮栏中的「全身 / 半身」按钮切换，并记录到 localStorage。
	 */
	type ViewMode = "full" | "bust";
	const VIEW_STORAGE_KEY = "pio-view-mode";
	const viewToggleEnabled = live2dConfig.toggleView !== false;
	const bustConfig = live2dConfig.bustView ?? {};
	const bustWidth = bustConfig.width ?? 300;
	const bustHeight = bustConfig.height ?? 300;
	const bustScale = bustConfig.scale ?? 3;
	const bustOffsetX = bustConfig.offsetX ?? 0;
	const bustOffsetY = bustConfig.offsetY ?? 507;

	let viewMode: ViewMode = live2dConfig.defaultView === "bust" ? "bust" : "full";

	$: viewWidth = viewMode === "bust" ? bustWidth : width;
	$: viewHeight = viewMode === "bust" ? bustHeight : height;

	const pioOptions = {
		mode: config?.mode ?? pioConfig.mode,
		hidden: config?.hiddenOnMobile ?? pioConfig.hiddenOnMobile,
		content: config?.dialog ?? pioConfig.dialog ?? {},
		model: config?.models ??
			pioConfig.models ?? ["/live2d/models/taifish/taifish.model3.json"],
	};

	const modelPaths: string[] = pioOptions.model;

	// 加载占位图：优先使用 live2d.preview，否则取第一个模型同目录的 preview.png
	const previewUrl =
		live2dConfig.preview ??
		(modelPaths[0] ? modelPaths[0].replace(/[^/]+$/, "preview.png") : "");

	let modelState: "idle" | "loading" | "ready" | "error" = "idle";
	let errorMessage = "";

	/** 当前模式对应的模型布局参数（缩放倍数 / CSS 像素偏移）。 */
	function layoutOptions(mode: ViewMode) {
		if (mode === "bust") {
			return { scale: bustScale, offsetX: bustOffsetX, offsetY: bustOffsetY };
		}
		return {
			scale: live2dConfig.scale ?? 1,
			offsetX: live2dConfig.offsetX ?? 0,
			offsetY: live2dConfig.offsetY ?? 0,
		};
	}

	/**
	 * 在加载 l2d.js 之前注入运行时参数（缩放、偏移、待机间隔等）。
	 * l2d.js 会读取 window.__LIVE2D_OPTIONS 完成自适应布局。
	 */
	function setLive2DOptions() {
		(window as any).__LIVE2D_OPTIONS = {
			...live2dConfig,
			...layoutOptions(viewMode),
			width: viewWidth,
			height: viewHeight,
		};
	}

	/** 模型已加载时即时切换布局，不重新下载 / 解析模型（不会闪白、不耗流量）。 */
	function applyViewToRuntime(): boolean {
		const w = window as any;
		if (!w.loadlive2d || typeof w.loadlive2d.setView !== "function") {
			return false;
		}
		return w.loadlive2d.setView("pio", {
			width: viewWidth,
			height: viewHeight,
			...layoutOptions(viewMode),
		});
	}

	async function toggleView() {
		if (!viewToggleEnabled) {
			return;
		}
		viewMode = viewMode === "full" ? "bust" : "full";
		try {
			localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
		} catch {
			/* 隐私模式 / 存储被禁用时忽略 */
		}
		setLive2DOptions();
		// 等 canvas 与容器尺寸更新后再重排，避免 setView 读到旧尺寸
		await tick();
		applyViewToRuntime();
	}

	function initPio() {
		if (typeof window === "undefined") {
			return;
		}

		const w = window as any;

		if (w.__pioInitialized) {
			return;
		}

		if (typeof w.Paul_Pio === "undefined") {
			setTimeout(initPio, 100);
			return;
		}

		w.__pioInitialized = true;

		try {
			new w.Paul_Pio(pioOptions);
			console.log("[Pio] 看板娘初始化成功");
		} catch (e) {
			w.__pioInitialized = false;
			console.error("[Pio] 看板娘初始化失败:", e);
		}
	}

	function loadScript(src: string, id: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (document.querySelector(`#${id}`)) {
				resolve();
				return;
			}
			const script = document.createElement("script");
			script.id = id;
			script.src = src;
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () => {
				script.remove();
				reject(new Error(`加载脚本失败: ${src}`));
			};
			document.head.appendChild(script);
		});
	}

	/**
	 * 加载顺序很重要：
	 * 1. live2dcubismcore.min.js —— Live2D 官方 Cubism Core（全局 Live2DCubismCore）
	 * 2. l2d.js —— pixi.js + pixi-live2d-display 封装的 Cubism 3/4 渲染器，
	 *              提供全局 loadlive2d(canvasId, modelPath)
	 * 3. pio.js —— Dreamer-Paul 的看板娘插件逻辑（对话、按钮、拖拽）
	 */
	function loadPioAssets() {
		if (typeof window === "undefined") {
			return;
		}

		setLive2DOptions();

		const loadWithIdle = () => {
			loadScript("/pio/static/live2dcubismcore.min.js", "pio-cubism-core")
				.then(() =>
					loadScript(
						`/pio/static/l2d.js?v=${RUNTIME_VERSION}`,
						"pio-l2d-script",
					),
				)
				.then(() => loadScript("/pio/static/pio.js", "pio-main-script"))
				.then(() => {
					modelState = "loading";
					setTimeout(initPio, 80);
				})
				.catch((error) => {
					modelState = "error";
					errorMessage = error?.message ?? String(error);
					console.error("[Pio] 资源加载失败:", error);
				});
		};

		if ("requestIdleCallback" in window) {
			(window as any).requestIdleCallback(loadWithIdle, {
				timeout: 5000,
			});
		} else {
			setTimeout(loadWithIdle, 2000);
		}
	}

	function handleModelLoaded(event: Event) {
		const detail = (event as CustomEvent)?.detail;
		if (!detail || detail.canvasId === "pio") {
			modelState = "ready";
			// 例如「关闭看板娘 → 点击头像重新显示」时，pio.js 会重新调用 loadlive2d，
			// 这里再把布局校正为当前显示比例（半身 / 全身）。
			applyViewToRuntime();
		}
	}

	function handleModelError(event: Event) {
		const detail = (event as CustomEvent)?.detail;
		if (!detail || detail.canvasId === "pio") {
			modelState = "error";
			errorMessage =
				detail?.error?.message ?? String(detail?.error ?? "模型加载失败");
		}
	}

	onMount(() => {
		if (!pioConfig.enable) {
			return;
		}

		// 恢复上次选择的显示比例
		try {
			const stored = localStorage.getItem(VIEW_STORAGE_KEY);
			if (stored === "full" || stored === "bust") {
				viewMode = stored;
			}
		} catch {
			/* ignore */
		}

		// 小屏 / 省流量模式下不加载模型（模型约 16MB，避免浪费流量）
		const isMobileViewport = window.matchMedia(
			`(max-width: ${mobileBreakpoint}px)`,
		).matches;
		const saveData = (navigator as any)?.connection?.saveData === true;

		if ((pioConfig.hiddenOnMobile && isMobileViewport) || saveData) {
			return;
		}

		// 若 swup 导航复用了已渲染的 canvas，则直接恢复“已就绪”状态
		const existingCanvas = document.getElementById(
			"pio",
		) as HTMLCanvasElement | null;
		if (existingCanvas?.dataset.live2dReady === "1") {
			modelState = "ready";
			tick().then(applyViewToRuntime);
		}

		window.addEventListener("live2d:loaded", handleModelLoaded);
		window.addEventListener("live2d:error", handleModelError);

		loadPioAssets();
	});

	onDestroy(() => {
		if (typeof window !== "undefined") {
			window.removeEventListener("live2d:loaded", handleModelLoaded);
			window.removeEventListener("live2d:error", handleModelError);
		}
	});
</script>

{#if pioConfig.enable}
	<div
		id="pio-container"
		class={`pio-container ${pioConfig.position || "left"}`}
		class:model-error={modelState === "error"}
		class:view-bust={viewMode === "bust"}
		style={`width: ${viewWidth}px; height: ${viewHeight}px;`}
	>
		<div class="pio-action">
			{#if viewToggleEnabled}
				<span
					class="pio-view"
					role="button"
					tabindex="0"
					aria-label={viewMode === "full"
						? "切换为半身显示"
						: "切换为全身显示"}
					title={viewMode === "full"
						? "切换为半身显示"
						: "切换为全身显示"}
					on:click={toggleView}
					on:keydown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							toggleView();
						}
					}}
				></span>
			{/if}
		</div>

		<!-- 模型加载占位图：透明 canvas 背后先显示角色缩略图，模型就绪后淡出 -->
		<div
			class="pio-placeholder"
			class:is-hidden={modelState === "ready"}
			class:has-error={modelState === "error"}
		>
			{#if modelState === "error"}
				<div class="pio-placeholder-error">
					<span class="pio-placeholder-title">看板娘加载失败</span>
					<span class="pio-placeholder-detail">{errorMessage}</span>
				</div>
			{:else}
				{#if previewUrl}
					<img
						class="pio-placeholder-img"
						src={previewUrl}
						alt="Live2D 看板娘加载中"
						loading="lazy"
						decoding="async"
					/>
				{/if}
				<span class="pio-placeholder-hint">Loading…</span>
			{/if}
		</div>

		<canvas
			id="pio"
			width={width}
			height={height}
			style={`width: ${viewWidth}px; height: ${viewHeight}px;`}
		></canvas>
	</div>
{/if}
