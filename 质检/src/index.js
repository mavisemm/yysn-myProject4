import dva from 'dva';
import './index.less';
import createLoading from 'dva-loading';
import 'antd/dist/antd.css';
// 引入 fastclick
import fastclick from 'fastclick';
// 解决点击事件延迟300毫秒的问题
fastclick.attach(document.body);

// 1. Initialize
const app = dva(createLoading());

// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example'));

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');
