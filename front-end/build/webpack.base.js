const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.join(__dirname, "../src/index.tsx"), //入口文件
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/, //匹配ts、tsx文件
        use: {
          loader: "babel-loader",
          options: {
            //预设执行顺序由右往左，所以这里是先处理ts再处理jsx
            presets: ["@babel/preset-react", "@babel/preset-typescript"],
          },
        },
      },

      {
        test: /.(css|less)$/, //匹配 css和less 文件
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: "asset/resource",
        generator: {
          filename: "images/[hash][ext]", // 输出路径和文件名
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx", ".json"],
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "../dist"),
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"), //模板用定义root节点的模板
      inject: true, //自动注入静态资源
    }),
  ],
};
