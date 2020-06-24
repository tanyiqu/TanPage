/**
 * 对general.css里定义的组件添加事件等
 */


// 
/**
 * input range
 * @param callback: 
 * @param valueDom: 
 * @param showPercentage: 
 */
$.fn.RangeSlider = function (callback, valueDom, showPercentage) {

    const $input = $(this);
    let max = $input.attr('max');

    $input.bind("input", function (e) {
        $input.attr('value', this.value);

        let $value = this.value;
        let p = parseInt(($value / max) * 100);
        // 改变颜色
        $input.css('background-size', p + '% 100%');

        // 
        if ($.isFunction(callback)) {

            // 改变值
            if (showPercentage) {
                valueDom.html(p + "%");
            } else {
                valueDom.html($value);
            }

            // 回调
            callback(this);
        }


    });
};