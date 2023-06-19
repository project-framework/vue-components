<script lang="ts">
/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
import Vue, { PropType } from 'vue';
import { type EChartsType } from 'echarts/core';
import { debounce } from 'lodash-es';
import echarts, { type ECOption } from './config';

export default Vue.extend({
    props: {
        option: {
            type: Object as PropType<ECOption>,
            required: true,
            default: () => ({} as ECOption),
        },
        width: {
            type: String,
            required: true,
        },
        height: {
            type: String,
            required: true,
        },
        theme: {
            type: [String, Object],
            default: null,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        onMouseover: {
            type: Function as PropType<(...args: any[]) => any>,
        },
        onMouseout: {
            type: Function as PropType<(...args: any[]) => any>,
        },
    },
    data() {
        return {
            chartInstance: undefined as EChartsType | undefined,
            resize: null as EventListenerOrEventListenerObject | null,
        };
    },
    computed: {
        chartRef(): HTMLDivElement {
            return this.$refs.chart as HTMLDivElement;
        },
    },
    watch: {
        option() {
            this.draw();
        },
        loading(loading) {
            if (this.chartInstance) {
                loading
                    ? this.chartInstance.showLoading()
                    : this.chartInstance.hideLoading();
            }
        },
    },
    methods: {
        draw() {
            this.chartInstance?.setOption(this.option, { notMerge: true });
        },
        init() {
            if (!this.$refs.chart) return;

            // 校验 Dom 节点上是否已经挂载了 ECharts 实例，只有未挂载时才初始化
            this.chartInstance = echarts.getInstanceByDom(this.chartRef);
            if (!this.chartInstance) {
                this.chartInstance = echarts.init(this.chartRef, this.theme, {
                    renderer: 'canvas',
                });

                // 绑定 ECharts 事件
                if (typeof this.onMouseover === 'function') {
                    this.chartInstance.on('mouseover', (event: Object) => {
                        this.onMouseover(
                            event,
                            this.chartInstance,
                            this.option
                        );
                    });
                }
                if (typeof this.onMouseout === 'function') {
                    this.chartInstance.on('mouseout', (event: Object) => {
                        this.onMouseout(event, this.chartInstance, this.option);
                    });
                }
            }

            this.draw();
        },
        debounceResize() {
            return debounce(() => {
                this.chartInstance?.resize({
                    animation: { duration: 300 },
                });
            }, 500);
        },
        resetChart() {
            if (this.chartInstance) {
                this.chartInstance.clear();
                this.draw();
            }
        },
    },
    created() {
        this.resize = this.debounceResize();
    },
    mounted() {
        this.init();
        this.resize && window.addEventListener('resize', this.resize);
    },
    beforeDestroy() {
        this.chartInstance?.dispose();
        this.resize && window.removeEventListener('resize', this.resize);
    },
});
</script>

<template>
    <div ref="chart" class="chart" :style="{ width, height }" />
</template>
