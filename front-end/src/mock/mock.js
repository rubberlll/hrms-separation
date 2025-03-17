// import Mock from "mockjs";

// // 确保 Mock.js 设置正确
// Mock.setup({
//   timeout: "200-600", // 设置响应时间
// });

// // 模拟生成 JWT token 的函数
// const generateToken = (payload) => {
//   // 实际项目中应该使用更复杂的算法，这里简化处理
//   const base64Payload = btoa(JSON.stringify(payload));
//   return `mock-jwt.${base64Payload}.signature`;
// };

// // 修改登录接口，支持不同角色
// Mock.mock(/^\/api\/login/, "post", (options) => {
//   const requestBody = JSON.parse(options.body);
//   console.log("Mock收到登录请求:", requestBody);

//   // 根据用户名返回不同的角色
//   const roleMap = {
//     admin: "admin",
//     hr: "hr",
//     employee: "employee",
//   };

//   const role = roleMap[requestBody.username] || "employee";

//   if (requestBody.password !== "123456") {
//     return {
//       code: 401,
//       message: "用户名或密码错误",
//       data: null,
//     };
//   }

//   const userInfo = {
//     userId: Mock.Random.id(),
//     username: requestBody.username,
//     role: role,
//     exp: Date.now() + 24 * 60 * 60 * 1000,
//   };

//   const token = generateToken(userInfo);

//   return {
//     code: 200,
//     message: "登录成功",
//     data: {
//       token,
//       userInfo,
//     },
//   };
// });

// // 添加验证 token 的接口
// Mock.mock(/^\/api\/verify-token/, "get", (options) => {
//   const token = options.headers?.Authorization?.replace("Bearer ", "");

//   if (!token) {
//     return {
//       code: 401,
//       message: "未提供token",
//       data: null,
//     };
//   }

//   try {
//     // 解析 token
//     const payload = JSON.parse(atob(token.split(".")[1]));

//     // 检查 token 是否过期
//     if (payload.exp < Date.now()) {
//       return {
//         code: 401,
//         message: "token已过期",
//         data: null,
//       };
//     }

//     return {
//       code: 200,
//       message: "token有效",
//       data: payload,
//     };
//   } catch (error) {
//     return {
//       code: 401,
//       message: "无效的token",
//       data: null,
//     };
//   }
// });

// // 添加用户列表数据接口
// Mock.mock(/^\/api\/users/, "get", () => {
//   const users = Array.from({ length: 10 }, () => ({
//     key: Mock.Random.guid(),
//     name: Mock.Random.cname(),
//     position: Mock.Random.pick([
//       "前端工程师",
//       "后端工程师",
//       "UI设计师",
//       "产品经理",
//       "测试工程师",
//     ]),
//     department: Mock.Random.pick([
//       "技术部",
//       "产品部",
//       "设计部",
//       "测试部",
//       "运维部",
//     ]),
//     email: Mock.Random.email(),
//     phone: Mock.mock(
//       /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
//     ),
//     status: Mock.Random.pick(["试用期", "正式", "离职"]),
//     entryDate: Mock.Random.date("yyyy-MM-dd"),
//     employmentInfo: {
//       salary: Mock.Random.integer(8000, 30000) + "元",
//       probationPeriod: "6个月",
//       contractPeriod: "3年",
//     },
//     education: {
//       school: Mock.Random.city() + "大学",
//       major: Mock.Random.pick([
//         "计算机科学",
//         "软件工程",
//         "信息技术",
//         "通信工程",
//       ]),
//       degree: Mock.Random.pick(["专科", "本科", "硕士", "博士"]),
//       graduationYear: Mock.Random.date("yyyy"),
//     },
//   }));

//   return {
//     code: 200,
//     message: "获取用户列表成功",
//     data: users,
//   };
// });

// // 修改获取单个用户详情的接口匹配模式
// Mock.mock(/\/api\/users\/[\w-]+$/, "get", (options) => {
//   // 从URL中提取用户ID
//   const userId = options.url.split("/").pop();

//   // 生成一个固定的用户信息（也可以存储用户列表后根据ID查找）
//   const userDetail = {
//     key: userId,
//     name: Mock.Random.cname(),
//     position: Mock.Random.pick([
//       "前端工程师",
//       "后端工程师",
//       "UI设计师",
//       "产品经理",
//       "测试工程师",
//     ]),
//     department: Mock.Random.pick([
//       "技术部",
//       "产品部",
//       "设计部",
//       "测试部",
//       "运维部",
//     ]),
//     email: Mock.Random.email(),
//     phone: Mock.mock(
//       /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
//     ),
//     status: Mock.Random.pick(["试用期", "正式", "离职"]),
//     entryDate: Mock.Random.date("yyyy-MM-dd"),
//     employmentInfo: {
//       salary: Mock.Random.integer(8000, 30000) + "元",
//       probationPeriod: "6个月",
//       contractPeriod: "3年",
//     },
//     education: {
//       school: Mock.Random.city() + "大学",
//       major: Mock.Random.pick([
//         "计算机科学",
//         "软件工程",
//         "信息技术",
//         "通信工程",
//       ]),
//       degree: Mock.Random.pick(["专科", "本科", "硕士", "博士"]),
//       graduationYear: Mock.Random.date("yyyy"),
//     },
//   };

//   return {
//     code: 200,
//     message: "获取用户详情成功",
//     data: userDetail,
//   };
// });

// // 添加文件上传接口
// Mock.mock(/^\/api\/upload/, "post", () => {
//   return {
//     code: 200,
//     message: "文件上传成功",
//     data: {
//       url: "https://example.com/fake-file-url.pdf",
//     },
//   };
// });
