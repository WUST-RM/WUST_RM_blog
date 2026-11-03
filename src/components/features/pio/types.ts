export interface Live2DOptions {
	/** 模型相对 canvas 的缩放倍数（不填则自动适配） */
	scale?: number;
	/** 水平偏移（CSS 像素，正值向右） */
	offsetX?: number;
	/** 垂直偏移（CSS 像素，正值向下） */
	offsetY?: number;
	/** 待机动作组名称，默认 "Idle" */
	idleGroupName?: string;
	/** 待机动作循环间隔（毫秒） */
	idleIntervalMs?: number;
	/** 点击模型时是否播放随机表情 */
	expressions?: boolean;
	/** 加载占位图路径 */
	preview?: string;
	/** 小于该视口宽度时隐藏看板娘 */
	mobileBreakpoint?: number;
	/** 是否显示「全身 / 半身」显示比例切换按钮（默认显示） */
	toggleView?: boolean;
	/** 默认显示模式："full" 全身 | "bust" 半身特写 */
	defaultView?: "full" | "bust";
	/** 半身特写模式的画布尺寸与模型布局 */
	bustView?: {
		width?: number;
		height?: number;
		scale?: number;
		offsetX?: number;
		offsetY?: number;
	};
}

export interface PioConfig {
	enable: boolean;
	mode?: string;
	hiddenOnMobile?: boolean;
	position?: "left" | "right";
	width?: number;
	height?: number;
	dialog?: Record<string, string>;
	models?: string[];
	/** Live2D 运行时参数（缩放 / 偏移 / 待机间隔等） */
	live2d?: Live2DOptions;
}

export interface PioProps {
	config?: Partial<PioConfig>;
}
