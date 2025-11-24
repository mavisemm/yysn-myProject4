class CanvasExt {
    drawRect(canvasId, penColor, strokeWidth) {
        const t = this;
        let canvas = document.getElementById(canvasId);
        let ctx = canvas.getContext('2d');
        let isAllowDraw = false;
        canvas.onmousedown = function(start) {
            isAllowDraw = true;
            let startPoint = windowToCanvas(canvas, start.clientX, start.clientY);
            // console.log(startPoint);
            ctx.moveTo(startPoint.x, startPoint.y);
            canvas.onmousemove = function(end) {
                if (isAllowDraw) {
                    let endPoint = windowToCanvas(canvas, end.clientX, end.clientY);
                    ctx.fillRect(
                        startPoint.x,
                        startPoint.y,
                        endPoint.x - startPoint.x,
                        endPoint.y - startPoint.y,
                    );
                    canvas.onmouseup = function(e) {
                        isAllowDraw = false;
                    };
                }
            };
        };
    }
}
export default CanvasExt;

const windowToCanvas = (canvas, x, y) => {
    let rect = canvas.getBoundingClientRect();
    return {
        x: x - rect.left * (canvas.width / rect.width),
        y: y - rect.top * (canvas.height / rect.height),
    };
};
