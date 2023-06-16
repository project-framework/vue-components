<script setup lang="ts">
import Echart from '@/components/BaseEchart/index.vue';
import type { ECOption } from '@/components/BaseEchart/config';
import type { EChartsType } from 'echarts/core';
import type { YAXisOption } from 'echarts/types/dist/shared';

const options: ECOption[] = Array.from({ length: 3 }, (_, index) => ({
    title: {
        text: '用鼠标 hover 我' + index,
        textStyle: {
            rich: {
                title: {
                    width: 12,
                    height: 12,
                },
            },
        },
        triggerEvent: true,
    },
    legend: { right: '4%' },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
        boundaryGap: false,
        overflow: 'truncate',
        data: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00'],
    },
    yAxis: {
        name: '我会隐藏和显现',
        nameTextStyle: { color: 'transparent', padding: [0, 0, 0, 50] },
        type: 'value',
        scale: true,
        splitLine: { lineStyle: { color: '#283593', type: 'dashed' } },
    },
    series: [
        {
            name: '当前',
            data: ['31', '41', '31', '21', '11', '07'],
            type: 'line',
            symbol: 'circle',
            showSymbol: false,
            sampling: 'lttb',
            smooth: 0.2,
        },
        {
            name: '昨日',
            data: ['12', '31', '41', '11', '21', '11'],
            type: 'line',
            symbol: 'circle',
            showSymbol: false,
            sampling: 'lttb',
            smooth: 0.2,
        },
        {
            name: '上周',
            data: ['24', '11', '31', '01', '53', '61'],
            type: 'line',
            symbol: 'circle',
            showSymbol: false,
            sampling: 'lttb',
            smooth: 0.2,
        },
    ],
    color: ['#007BEE', '#00FFF4', '#EEC67A'],
}));

// 通过给 ECharts title 注册鼠标 over 与 out 事件，来控制 yAxis.name 的 color，从而达到 “口径” 的显示与隐藏功能
const onMouseover = (_: object, chart: EChartsType, option: ECOption) => {
    (option.yAxis as YAXisOption).nameTextStyle.color = '#000';
    chart.setOption(option);
};

const onMouseout = (_: object, chart: EChartsType, option: ECOption) => {
    (option.yAxis as YAXisOption).nameTextStyle.color = 'transparent';
    chart.setOption(option);
};
</script>

<template>
    <div class="chart-container">
        <div class="chart-item" v-for="(item, index) in options" :key="index">
            <Echart
                width="100%"
                height="305px"
                :option="item"
                :on-mouseover="onMouseover"
                :on-mouseout="onMouseout"
            />
        </div>
    </div>
</template>

<style scoped>
.chart-container {
    display: grid;
    grid-row-gap: 15px;
    grid-template-rows: 1fr 1fr 1fr;
    width: 50%;
    min-width: 600px;
    margin: 0 auto;
    background-color: #f9f9f9;
}

.chart-item {
    min-width: 600px;
}
</style>
