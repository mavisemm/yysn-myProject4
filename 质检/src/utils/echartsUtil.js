
// @src/utils/echartsUtil.js
/**
 * ECharts 多实例联动缩放（可复用）
 * @param  {...any} echartsInstances - 待联动的 ECharts 实例（支持任意多个，如 myEcharts, myEcharts1, myEcharts2...）
 * @description 任意一个实例缩放时，其他实例同步缩放，支持复用在任意组件的 ECharts 上
 */
export const syncEchartsZoom = (...echartsInstances) => {
    // 过滤无效实例（排除 null/undefined，确保实例具备 on/setOption 方法）
    const validInstances = echartsInstances.filter(instance => {
        return instance && typeof instance.on === 'function' && typeof instance.setOption === 'function';
    });

    // 无有效实例或有效实例不足2个时，直接返回（无需联动）
    if (validInstances.length < 2) return;

    // 缩放同步核心方法：同步所有实例的 dataZoom 配置
    const syncZoom = (sourceInstance) => {
        // 获取源实例（触发缩放的实例）的 dataZoom 配置
        const sourceOption = sourceInstance.getOption();
        const sourceDataZoom = sourceOption.dataZoom || [];

        // 遍历所有有效实例，同步 dataZoom 配置（排除源实例本身，避免重复触发）
        validInstances.forEach(targetInstance => {
            if (targetInstance === sourceInstance) return;

            // 同步 dataZoom 配置，保持所有图表视图一致
            // false：不刷新整个图表，仅更新配置，提升性能并避免闪烁
            targetInstance.setOption({
                dataZoom: sourceDataZoom
            }, false);
        });
    };

    // 为每个有效实例绑定 datazoom 事件（缩放时触发同步逻辑）
    validInstances.forEach(instance => {
        // 先移除已有同名事件（避免重复绑定，防止多次触发同步逻辑）
        instance.off('datazoom');
        // 绑定 datazoom 事件，触发缩放同步
        instance.on('datazoom', () => {
            syncZoom(instance);
        });
    });

    // 返回解除联动的方法（便于组件卸载/销毁时清理事件，防止内存泄漏）
    return () => {
        validInstances.forEach(instance => {
            instance.off('datazoom');
        });
    };
};

// 可选：导出其他 ECharts 通用工具函数（便于后续扩展）
// export const otherEchartsUtil = () => { ... }